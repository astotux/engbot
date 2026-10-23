import { InputFile, InlineKeyboard } from 'grammy';
import fs from 'fs';
import path from 'path';
import type { BotContext } from '../context.js';
import { getCourseAccess, startCourse } from '../../db/repositories/courseAccess.js';
import {
  getLessonForUser,
  getUserProgress,
  getUserAchievements,
  checkStepAnswer,
  checkChoiceAnswer,
  getOrInitStepProgress,
  markStepDone,
  scheduleAllLessons,
} from '../../services/lessonService.js';
import { getLessonNotification, clearLessonNotification } from '../../db/repositories/lessons.js';
import {
  getLessonByDay,
  getStep,
  getTotalSteps,
  type ExplainStep,
  type ChoiceStep,
  type InputStep,
  type FreeStep,
  type LessonStep,
} from '../../content/course.js';
import { mainMenuKeyboard } from '../keyboards/mainMenu.js';
import {
  sendScreen,
  sendPersistentDocument,
  editScreen,
  sendEphemeral,
  addCleanupMessage,
  cleanupAuxiliaryMessages,
  deleteUserMessage,
  deletePrevious,
} from '../sendHelper.js';
import { logger } from '../../utils/logger.js';

// ─── Форматирование шагов ─────────────────────────────────────────────────────

function formatExplainStep(step: ExplainStep, _day: number, stepIndex: number, total: number): string {
  const examples = step.examples
    ? '\n\n' + step.examples.map((e) => `  • <i>${e.english}</i>\n    → ${e.russian}`).join('\n')
    : '';
  return (
    `📖 <b>${step.title}</b>  <i>(${stepIndex + 1}/${total})</i>\n\n` +
    step.text + examples
  );
}

function formatChoiceStep(step: ChoiceStep, _day: number, stepIndex: number, total: number): string {
  return `🎯 <b>Задание ${stepIndex + 1}/${total}</b>\n\n${step.question}`;
}

function formatInputStep(step: InputStep, _day: number, stepIndex: number, total: number): string {
  return `✏️ <b>Задание ${stepIndex + 1}/${total}</b>\n\n${step.question}`;
}

function formatFreeStep(step: FreeStep, _day: number, stepIndex: number, total: number): string {
  return `🗣 <b>Задание ${stepIndex + 1}/${total}</b>\n\n${step.question}`;
}

export function choiceKeyboard(step: ChoiceStep, day: number, stepIndex: number): InlineKeyboard {
  const kb = new InlineKeyboard();
  step.options.forEach((opt, i) => {
    kb.text(opt, `choice:${day}:${stepIndex}:${i}`).row();
  });
  if (stepIndex > 0) {
    kb.text('⬅️ Назад', `prevstep:${day}:${stepIndex - 1}`).row();
  }
  kb.text('🏠 На главную', 'main_menu');
  return kb;
}

export function nextStepKeyboard(day: number, nextStep: number, prevStep?: number): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (prevStep !== undefined && prevStep >= 0) {
    kb.text('⬅️ Назад', `prevstep:${day}:${prevStep}`);
  }
  kb.text('➡️ Продолжить', `nextstep:${day}:${nextStep}`).row();
  kb.text('🏠 На главную', 'main_menu');
  return kb;
}

export function doneKeyboard(day?: number, prevStep?: number): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (day && prevStep !== undefined && prevStep >= 0) {
    kb.text('⬅️ Назад', `prevstep:${day}:${prevStep}`);
  }
  kb.text('🏆 Завершить урок', day ? `lessonDone:${day}` : 'lessonDone').row();
  kb.text('🏠 На главную', 'main_menu');
  return kb;
}

export function inputKeyboard(day: number, stepIndex: number): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (stepIndex > 0) {
    kb.text('⬅️ Назад', `prevstep:${day}:${stepIndex - 1}`);
  }
  kb.text('💡 Подсказка', `hint:${day}:${stepIndex}`).row();
  kb.text('🏠 На главную', 'main_menu');
  return kb;
}

/** Универсальный вывод урока-шаблона (для планировщика) */
export function formatLessonMessage(lesson: { day: number; title: string; estimatedMinutes: number }): string {
  return (
    `📖 <b>День ${lesson.day}: ${lesson.title}</b>\n\n` +
    `⏱ Примерное время: ${lesson.estimatedMinutes} мин\n\n` +
    `Нажми «🚀 Начать урок» ниже, чтобы приступить!`
  );
}

/**
 * Удаляет сообщение-уведомление об уроке из чата (если оно было отправлено планировщиком)
 */
export async function cleanupLessonNotification(
  api: { deleteMessage: (chatId: number, messageId: number) => Promise<unknown> },
  telegramId: number,
  extraMessageId?: number,
): Promise<void> {
  const notif = getLessonNotification(telegramId);
  clearLessonNotification(telegramId);

  const idsToDelete = new Set<number>();
  if (notif) idsToDelete.add(notif.message_id);
  if (extraMessageId) idsToDelete.add(extraMessageId);

  for (const msgId of idsToDelete) {
    try {
      await api.deleteMessage(telegramId, msgId);
    } catch {
      // Сообщение уже удалено пользователем
    }
  }
}

// ─── Утилиты для медиафайлов шага ──────────────────────────────────────────

export function getMp4Dimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buf = fs.readFileSync(filePath);
    let pos = 0;
    while (pos < buf.length - 8) {
      const len = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      if (type === 'moov' || type === 'trak' || type === 'mdia') {
        pos += 8;
        continue;
      }
      if (type === 'tkhd') {
        const version = buf[pos + 8];
        const widthOffset = version === 1 ? pos + 8 + 88 : pos + 8 + 76;
        if (widthOffset + 8 <= buf.length) {
          const width = buf.readUInt32BE(widthOffset) >> 16;
          const height = buf.readUInt32BE(widthOffset + 4) >> 16;
          if (width > 0 && height > 0) {
            return { width, height };
          }
        }
      }
      if (len <= 0) break;
      pos += len;
    }
  } catch {}
  return null;
}

export function getMp4Duration(filePath: string): number | null {
  try {
    const buf = fs.readFileSync(filePath);
    let pos = 0;
    while (pos < buf.length - 8) {
      const len = buf.readUInt32BE(pos);
      const type = buf.toString('ascii', pos + 4, pos + 8);
      if (type === 'moov') {
        pos += 8;
        continue;
      }
      if (type === 'mvhd') {
        const version = buf[pos + 8];
        const timeScale = buf.readUInt32BE(version === 1 ? pos + 8 + 20 : pos + 8 + 12);
        const duration = version === 1
          ? Number(buf.readBigUInt64BE(pos + 8 + 24))
          : buf.readUInt32BE(pos + 8 + 16);
        if (timeScale > 0) {
          return duration / timeScale;
        }
      }
      if (len <= 0) break;
      pos += len;
    }
  } catch {}
  return null;
}

export function stepHasMedia(step: LessonStep): boolean {
  const candidates: (string | undefined)[] = [];
  if ('voiceFile' in step && step.voiceFile) candidates.push(step.voiceFile);
  if ('videoNoteFile' in step && step.videoNoteFile) candidates.push(step.videoNoteFile);
  if ('audioFile' in step && step.audioFile) candidates.push(step.audioFile);

  for (const f of candidates) {
    if (!f) continue;
    const resolved = path.resolve(f);
    if (fs.existsSync(resolved)) return true;
    const ext = path.extname(resolved).toLowerCase();
    const altExt = ext === '.mp4' ? '.mp3' : ext === '.mp3' ? '.mp4' : '';
    if (altExt && fs.existsSync(resolved.slice(0, -ext.length) + altExt)) return true;
  }
  return false;
}

// ─── Отправка медиафайлов шага (аудио MP3 или кружок MP4) ────────────────────

export async function sendStepMedia(ctx: BotContext, step: LessonStep): Promise<void> {
  const sentPaths = new Set<string>();

  const sendFile = async (filePath: string, explicitType?: 'voice' | 'video_note'): Promise<void> => {
    let resolvedPath = path.resolve(filePath);
    if (sentPaths.has(resolvedPath)) return;

    if (!fs.existsSync(resolvedPath)) {
      // Fallback: если указан .mp4, но на диске .mp3 (или наоборот), используем существующий
      const ext = path.extname(resolvedPath).toLowerCase();
      const altExt = ext === '.mp4' ? '.mp3' : ext === '.mp3' ? '.mp4' : '';
      if (altExt) {
        const altPath = resolvedPath.slice(0, -ext.length) + altExt;
        if (fs.existsSync(altPath)) {
          resolvedPath = altPath;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    sentPaths.add(resolvedPath);

    const ext = path.extname(resolvedPath).toLowerCase();
    const isAudio = ext === '.mp3' || ext === '.ogg' || ext === '.oga' || ext === '.m4a' || ext === '.wav';
    const mediaType = explicitType ?? step.mediaType ?? (isAudio ? 'voice' : 'video_note');

    try {
      let sentMsg;
      if (mediaType === 'voice') {
        sentMsg = await ctx.replyWithVoice(new InputFile(resolvedPath));
      } else {
        // Видео-кружок (video_note): диаметр length (до 640px) и длительность duration
        const dims = getMp4Dimensions(resolvedPath);
        const duration = getMp4Duration(resolvedPath);
        const length = dims && dims.width > 0 && dims.height > 0
          ? Math.min(640, Math.min(dims.width, dims.height))
          : 640;
        const opts: { length?: number; duration?: number } = { length };
        if (duration && duration > 0) {
          opts.duration = Math.round(duration);
        }

        try {
          sentMsg = await ctx.replyWithVideoNote(new InputFile(resolvedPath), opts);
        } catch (noteErr) {
          logger.warn({ noteErr, resolvedPath }, 'replyWithVideoNote с опциями не удался, пробуем без опций');
          try {
            sentMsg = await ctx.replyWithVideoNote(new InputFile(resolvedPath));
          } catch (noteErr2) {
            logger.warn({ noteErr2, resolvedPath }, 'replyWithVideoNote без опций не удался, фоллбек на replyWithVideo');
            if (ctx.replyWithVideo) {
              sentMsg = await ctx.replyWithVideo(new InputFile(resolvedPath));
            }
          }
        }
      }
      if (sentMsg?.message_id) {
        addCleanupMessage(ctx, sentMsg.message_id);
      }
    } catch (err) {
      logger.warn({ err, resolvedPath, mediaType }, 'Не удалось отправить медиафайл шага');
    }
  };

  // 1. Явное голосовое сообщение (.mp3, .ogg)
  if ('voiceFile' in step && step.voiceFile) {
    await sendFile(step.voiceFile, 'voice');
  }

  // 2. Явный видео-кружок (.mp4)
  if ('videoNoteFile' in step && step.videoNoteFile) {
    await sendFile(step.videoNoteFile, 'video_note');
  }

  // 3. Общее поле audioFile (автоопределение по расширению или mediaType)
  if ('audioFile' in step && step.audioFile) {
    await sendFile(step.audioFile);
  }
}

// ─── Отправка шага ────────────────────────────────────────────────────────────

async function sendStep(ctx: BotContext, day: number, stepIndex: number): Promise<void> {
  const step = getStep(day, stepIndex);
  const total = getTotalSteps(day);
  if (!step) return;

  // Очищаем медиафайлы предыдущего шага
  await cleanupAuxiliaryMessages(ctx);

  const hasMedia = stepHasMedia(step);

  // Если шаг содержит голосовое или кружок, отправляем их ДО основного сообщения.
  // Для этого удаляем предыдущий экран бота, отправляем медиа (оно окажется выше),
  // а затем отправляем новое основное сообщение под медиа (forceNew: true).
  if (hasMedia) {
    await deletePrevious(ctx);
    await sendStepMedia(ctx, step);
  }

  const screenOptions = {
    parse_mode: 'HTML' as const,
    skipCleanup: true,
    forceNew: hasMedia,
  };

  if (step.type === 'explain') {
    ctx.session.awaitingStep = undefined;
    const text = formatExplainStep(step, day, stepIndex, total);
    const isLast = stepIndex === total - 1;
    const prevStep = stepIndex - 1;
    await sendScreen(ctx, text, {
      ...screenOptions,
      reply_markup: isLast ? doneKeyboard(day, prevStep) : nextStepKeyboard(day, stepIndex + 1, prevStep),
    });

  } else if (step.type === 'choice') {
    ctx.session.awaitingStep = undefined;
    const text = formatChoiceStep(step, day, stepIndex, total);
    await sendScreen(ctx, text, {
      ...screenOptions,
      reply_markup: choiceKeyboard(step, day, stepIndex),
    });

  } else if (step.type === 'input') {
    const text = formatInputStep(step, day, stepIndex, total);
    ctx.session.awaitingStep = { day, stepIndex, type: 'input' };
    await sendScreen(ctx, text, {
      ...screenOptions,
      reply_markup: inputKeyboard(day, stepIndex),
    });

  } else if (step.type === 'free') {
    const text = formatFreeStep(step, day, stepIndex, total);
    ctx.session.awaitingStep = { day, stepIndex, type: 'free' };
    await sendScreen(ctx, text, {
      ...screenOptions,
      reply_markup: inputKeyboard(day, stepIndex),
    });
  }
}

// ─── Команда /lesson ──────────────────────────────────────────────────────────

export async function handleLesson(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // Если вызов из callback — отвечаем на него
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  // Удаляем сообщение-уведомление об уроке из чата (если было отправлено)
  if (ctx.api) {
    await cleanupLessonNotification(
      ctx.api,
      telegramId,
      ctx.callbackQuery?.data?.startsWith('start_scheduled_lesson') ? ctx.callbackQuery?.message?.message_id : undefined,
    );
  }

  const access = getCourseAccess(telegramId);
  if (!access) {
    await sendScreen(
      ctx,
      '📚 У тебя пока нет доступа к курсу.\n\nВыбери нужный раздел:',
      { reply_markup: mainMenuKeyboard(false) },
    );
    return;
  }
  if (access.status === 'pending') {
    // Если курс оплачен, но ещё не стартован — автоматически активируем и планируем уроки
    startCourse(telegramId);
    scheduleAllLessons(telegramId);
  }
  if (access.status === 'revoked') {
    await sendScreen(
      ctx,
      '❌ Доступ отозван. Обратись в поддержку.',
      { reply_markup: mainMenuKeyboard(false) },
    );
    return;
  }
  if (access.paused) {
    await sendScreen(
      ctx,
      '⏸ Обучение приостановлено.',
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  const lesson = getLessonForUser(telegramId);
  if (!lesson) {
    if (access.status === 'completed') {
      await sendScreen(
        ctx,
        '🎉 Ты завершил(а) весь курс! Посмотри свой прогресс ниже.',
        { reply_markup: mainMenuKeyboard(true) },
      );
    } else {
      await sendScreen(
        ctx,
        '📭 Урок ещё не готов — он придёт по расписанию.',
        { reply_markup: mainMenuKeyboard(true) },
      );
    }
    return;
  }

  const prog = getOrInitStepProgress(telegramId, lesson.day);
  const stepIndex = prog.completed_at ? 0 : prog.step_index;

  await sendStep(ctx, lesson.day, stepIndex);
}

// ─── Callback: выбор варианта ─────────────────────────────────────────────────

export async function handleChoiceCallback(
  ctx: BotContext,
  day: number,
  stepIndex: number,
  chosenIndex: number,
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const result = checkChoiceAnswer(day, stepIndex, chosenIndex);
  const total = getTotalSteps(day);
  const isLast = stepIndex === total - 1;

  if (result.isCorrect) {
    markStepDone(telegramId, day, stepIndex);
    const text = `${result.feedback}\n\n${result.explanation}`;
    const prevStep = stepIndex - 1;
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: isLast ? doneKeyboard(day, prevStep) : nextStepKeyboard(day, stepIndex + 1, prevStep),
    });
  } else {
    // Неверно — обновляем этот же экран с подсказкой, кнопки остаются
    const step = getStep(day, stepIndex) as ChoiceStep;
    const baseText = formatChoiceStep(step, day, stepIndex, total);
    await editScreen(
      ctx,
      `${baseText}\n\n🤔 <b>Не совсем верно. Попробуй ещё раз!</b>\n💡 <i>${step.hint}</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: choiceKeyboard(step, day, stepIndex),
        skipCleanup: true,
      },
    );
  }
}

// ─── Callback: следующий шаг ──────────────────────────────────────────────────

export async function handleNextStep(ctx: BotContext, day: number, stepIndex: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  // Помечаем текущий шаг (explain) как пройденный
  const prevStep = stepIndex - 1;
  if (prevStep >= 0) {
    markStepDone(telegramId, day, prevStep);
  }

  await sendStep(ctx, day, stepIndex);
}

// ─── Callback: предыдущий шаг ─────────────────────────────────────────────────

export async function handlePrevStep(ctx: BotContext, day: number, stepIndex: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  if (stepIndex < 0) return;

  // Сбрасываем ожидание ввода, если пользователь вернулся назад
  ctx.session.awaitingStep = undefined;

  await sendStep(ctx, day, stepIndex);
}

// ─── Callback: подсказка ──────────────────────────────────────────────────────

export async function handleHintCallback(ctx: BotContext, day: number, stepIndex: number): Promise<void> {
  const step = getStep(day, stepIndex);
  if (!step) {
    await ctx.answerCallbackQuery();
    return;
  }
  const hint = 'hint' in step ? step.hint : ('tip' in step ? step.tip : '');
  await ctx.answerCallbackQuery({
    text: hint ? `💡 Подсказка:\n\n${hint}` : 'Подсказка отсутствует',
    show_alert: true,
  });
}

// ─── Callback: урок завершён ──────────────────────────────────────────────────

export async function handleLessonDone(ctx: BotContext, explicitDay?: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);
  if (!access) return;
  const day = explicitDay ?? access.current_day;

  // Помечаем последний шаг
  const total = getTotalSteps(day);
  markStepDone(telegramId, day, total - 1);

  const doneText =
    `🎉 <b>Урок ${day} завершён!</b>\n\n` +
    `Отличная работа! Конспект этого урока теперь также всегда доступен в разделе «📂 Мои конспекты», а следующий урок придёт завтра по расписанию.`;
  const lesson = getLessonByDay(day);
  const pdfPath = lesson?.pdfFile ? path.resolve(lesson.pdfFile) : null;

  if (pdfPath && fs.existsSync(pdfPath)) {
    await sendPersistentDocument(
      ctx,
      new InputFile(pdfPath, `day${String(day).padStart(2, '0')}.pdf`),
      {
        caption: `📄 <b>Конспект урока — День ${day}: ${lesson?.title ?? ''}</b>\nСохрани себе, чтобы шпаргалка всегда была под рукой!`,
        parse_mode: 'HTML',
      },
      {
        text: doneText,
        options: {
          parse_mode: 'HTML',
          reply_markup: mainMenuKeyboard(true),
        },
      },
    );
  } else {
    await sendScreen(
      ctx,
      doneText,
      {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(true),
      },
    );
  }
  logger.info({ telegramId, day }, 'Урок завершён');
}

// ─── Текстовые ответы пользователя ───────────────────────────────────────────

export async function handleUserAnswer(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const awaiting = ctx.session.awaitingStep;
  if (!awaiting) return;

  const text = ctx.message?.text;
  if (!text || text.startsWith('/')) return;

  // Сразу удаляем входящее текстовое сообщение пользователя
  deleteUserMessage(ctx);

  if (text.length > 1000) {
    await sendEphemeral(ctx, '⚠️ Ответ слишком длинный. Попробуй короче.');
    return;
  }

  const { day, stepIndex, type } = awaiting;
  const total = getTotalSteps(day);
  const isLast = stepIndex === total - 1;

  if (type === 'free') {
    ctx.session.awaitingStep = undefined;
    const step = getStep(day, stepIndex) as FreeStep;
    markStepDone(telegramId, day, stepIndex);
    const prevStep = stepIndex - 1;
    await sendScreen(
      ctx,
      `✅ Ответ сохранён!\n\n💡 Пример: <i>${step.exampleAnswer}</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: isLast ? doneKeyboard(day, prevStep) : nextStepKeyboard(day, stepIndex + 1, prevStep),
      },
    );
  } else {
    // input
    const result = checkStepAnswer(day, stepIndex, text);
    if (result.isCorrect) {
      ctx.session.awaitingStep = undefined;
      markStepDone(telegramId, day, stepIndex);
      const prevStep = stepIndex - 1;
      await sendScreen(
        ctx,
        `${result.feedback}\n\n${result.explanation}`,
        {
          parse_mode: 'HTML',
          reply_markup: isLast ? doneKeyboard(day, prevStep) : nextStepKeyboard(day, stepIndex + 1, prevStep),
        },
      );
    } else {
      // Неверно — обновляем экран на месте, показываем ошибку и ждём следующую попытку
      const step = getStep(day, stepIndex) as InputStep;
      const baseText = formatInputStep(step, day, stepIndex, total);
      await sendScreen(
        ctx,
        `${baseText}\n\n🤔 <b>Не совсем верно:</b> «${text}»\n💡 <i>${step.hint}</i>`,
        {
          parse_mode: 'HTML',
          reply_markup: inputKeyboard(day, stepIndex),
          skipCleanup: true,
        },
      );
    }
  }

  logger.info({ telegramId, day, stepIndex, type }, 'Ответ обработан');
}

// ─── /progress ───────────────────────────────────────────────────────────────

export function formatAchievementsSection(telegramId: number): string {
  const badges = getUserAchievements(telegramId);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  let text = `\n🏅 <b>Витрина значков (${unlockedBadges.length} из ${badges.length}):</b>\n`;
  if (unlockedBadges.length === 0) {
    text += `<i>Пока не открыто ни одного значка. Проходи уроки, тренируй словарь и мини-игры, чтобы открывать секретные награды!</i>\n`;
  } else {
    for (const b of unlockedBadges) {
      text += `${b.icon} <b>«${b.title}»</b> — ${b.description} ✅\n`;
    }
    if (unlockedBadges.length < badges.length) {
      text += `<i>Продолжай обучение, чтобы открыть остальные награды!</i>\n`;
    }
  }
  return text;
}

export async function handleProgress(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // Если вызов из callback — отвечаем на него
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const progress = getUserProgress(telegramId);
  const achievementsText = formatAchievementsSection(telegramId);

  if (!progress) {
    await sendScreen(
      ctx,
      `📊 <b>Твой прогресс</b>\n\nТы ещё не начал(а) курс.\n${achievementsText}\nВыбери нужный раздел:`,
      { parse_mode: 'HTML', reply_markup: mainMenuKeyboard(false) },
    );
    return;
  }

  const statusMap: Record<string, string> = {
    pending: 'Ожидает начала',
    active: '🟢 Активен',
    completed: '✅ Завершён',
    paused: '⏸ Приостановлен',
    revoked: '❌ Отозван',
  };

  const bar = '█'.repeat(Math.round(progress.percent / 10)) + '░'.repeat(10 - Math.round(progress.percent / 10));

  let progressText =
    `📊 <b>Твой прогресс</b>\n\n` +
    `${bar} ${progress.percent}%\n\n` +
    `📅 Статус: ${statusMap[progress.status] ?? progress.status}\n` +
    `📖 Текущий день: ${progress.currentDay} из 30\n` +
    `✅ Пройдено уроков: ${progress.completedCount}\n` +
    `📚 Осталось: ${progress.remaining}\n`;

  if (progress.completedDays.length > 0) {
    progressText += `\n🏆 Пройденные дни: ${progress.completedDays.slice(-10).join(', ')}${progress.completedDays.length > 10 ? '...' : ''}\n`;
  }

  progressText += achievementsText;

  if (progress.status === 'completed') {
    progressText += `\n🎉 <b>Поздравляем с завершением курса!</b>`;
  }

  await sendScreen(ctx, progressText, {
    parse_mode: 'HTML',
    reply_markup: mainMenuKeyboard(true),
  });
}
