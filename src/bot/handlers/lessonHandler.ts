import { InputFile, InlineKeyboard } from 'grammy';
import fs from 'fs';
import path from 'path';
import type { BotContext } from '../context.js';
import { getCourseAccess } from '../../db/repositories/courseAccess.js';
import {
  getLessonForUser,
  getUserProgress,
  checkStepAnswer,
  checkChoiceAnswer,
  getOrInitStepProgress,
  markStepDone,
} from '../../services/lessonService.js';
import { getStep, getTotalSteps, type ExplainStep, type ChoiceStep, type InputStep, type FreeStep } from '../../content/course.js';
import { mainMenuKeyboard } from '../keyboards/mainMenu.js';
import { sendScreen, sendEphemeral } from '../sendHelper.js';
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

function choiceKeyboard(step: ChoiceStep, day: number, stepIndex: number): InlineKeyboard {
  const kb = new InlineKeyboard();
  step.options.forEach((opt, i) => {
    kb.text(opt, `choice:${day}:${stepIndex}:${i}`).row();
  });
  kb.text('🏠 На главную', 'main_menu');
  return kb;
}

function nextStepKeyboard(day: number, nextStep: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('➡️ Продолжить', `nextstep:${day}:${nextStep}`)
    .row()
    .text('🏠 На главную', 'main_menu');
}

function doneKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🏆 Завершить урок', 'lessonDone')
    .row()
    .text('🏠 На главную', 'main_menu');
}

function inputKeyboard(day: number, stepIndex: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('💡 Подсказка', `hint:${day}:${stepIndex}`)
    .row()
    .text('🏠 На главную', 'main_menu');
}

/** Универсальный вывод урока-шаблона (для планировщика) */
export function formatLessonMessage(lesson: { day: number; title: string; estimatedMinutes: number }): string {
  return (
    `📖 <b>День ${lesson.day}: ${lesson.title}</b>\n\n` +
    `⏱ Примерное время: ${lesson.estimatedMinutes} мин\n\n` +
    `Нажми «📖 Мой урок» в меню, чтобы начать!`
  );
}

// ─── Отправка шага ────────────────────────────────────────────────────────────

async function sendStep(ctx: BotContext, day: number, stepIndex: number): Promise<void> {
  const step = getStep(day, stepIndex);
  const total = getTotalSteps(day);
  if (!step) return;

  // Отправляем аудио-кружок если есть (не считается «экраном» — не удаляем предыдущее)
  if ('audioFile' in step && step.audioFile) {
    const audioPath = path.resolve(step.audioFile);
    if (fs.existsSync(audioPath)) {
      try {
        await ctx.replyWithVideoNote(new InputFile(audioPath));
      } catch (err) {
        logger.warn({ err, audioPath }, 'Не удалось отправить аудио-кружок');
      }
    }
  }

  // Отправляем PDF для дня (только на первом шаге) — тоже не считается «экраном»
  if (stepIndex === 0) {
    const lesson = (await import('../../content/course.js')).getLessonByDay(day);
    if (lesson?.pdfFile) {
      const pdfPath = path.resolve(lesson.pdfFile);
      if (fs.existsSync(pdfPath)) {
        try {
          await ctx.replyWithDocument(new InputFile(pdfPath, `day${String(day).padStart(2, '0')}.pdf`), {
            caption: `📄 Конспект урока — День ${day}`,
          });
        } catch (err) {
          logger.warn({ err, pdfPath }, 'Не удалось отправить PDF');
        }
      }
    }
  }

  if (step.type === 'explain') {
    const text = formatExplainStep(step, day, stepIndex, total);
    const isLast = stepIndex === total - 1;
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: isLast ? doneKeyboard() : nextStepKeyboard(day, stepIndex + 1),
    });

  } else if (step.type === 'choice') {
    const text = formatChoiceStep(step, day, stepIndex, total);
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: choiceKeyboard(step, day, stepIndex),
    });

  } else if (step.type === 'input') {
    const text = formatInputStep(step, day, stepIndex, total);
    ctx.session.awaitingStep = { day, stepIndex, type: 'input' };
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: inputKeyboard(day, stepIndex),
    });

  } else if (step.type === 'free') {
    const text = formatFreeStep(step, day, stepIndex, total);
    ctx.session.awaitingStep = { day, stepIndex, type: 'free' };
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
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
    await sendScreen(
      ctx,
      '⏳ Доступ обрабатывается. После подтверждения оплаты ты получишь уведомление.',
      { reply_markup: mainMenuKeyboard(false) },
    );
    return;
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

  await sendScreen(
    ctx,
    `📖 <b>День ${lesson.day}: ${lesson.title}</b>\n⏱ ~${lesson.estimatedMinutes} мин\n\nНачинаем!`,
    { parse_mode: 'HTML' },
  );

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
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: isLast ? doneKeyboard() : nextStepKeyboard(day, stepIndex + 1),
    });
  } else {
    // Неверно — показываем мини-подсказку, кнопки остаются
    const step = getStep(day, stepIndex) as ChoiceStep;
    await sendEphemeral(
      ctx,
      `🤔 Не совсем верно. Попробуй ещё раз!\n\n💡 <i>${step.hint}</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: choiceKeyboard(step, day, stepIndex),
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

// ─── Callback: подсказка ──────────────────────────────────────────────────────

export async function handleHintCallback(ctx: BotContext, day: number, stepIndex: number): Promise<void> {
  await ctx.answerCallbackQuery();
  const step = getStep(day, stepIndex);
  if (!step) return;
  const hint = 'hint' in step ? step.hint : ('tip' in step ? step.tip : '');
  // Подсказка — эфемерное сообщение
  await sendEphemeral(ctx, `💡 <i>${hint}</i>`, { parse_mode: 'HTML' });
}

// ─── Callback: урок завершён ──────────────────────────────────────────────────

export async function handleLessonDone(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);
  if (!access) return;
  const day = access.current_day;

  // Помечаем последний шаг
  const total = getTotalSteps(day);
  markStepDone(telegramId, day, total - 1);

  await sendScreen(
    ctx,
    `🎉 <b>Урок ${day} завершён!</b>\n\nОтличная работа! Следующий урок придёт завтра по расписанию.`,
    {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(true),
    },
  );
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
    await sendScreen(
      ctx,
      `✅ Ответ сохранён!\n\n💡 Пример: <i>${step.exampleAnswer}</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: isLast ? doneKeyboard() : nextStepKeyboard(day, stepIndex + 1),
      },
    );
  } else {
    // input
    const result = checkStepAnswer(day, stepIndex, text);
    if (result.isCorrect) {
      ctx.session.awaitingStep = undefined;
      markStepDone(telegramId, day, stepIndex);
      await sendScreen(
        ctx,
        `${result.feedback}\n\n${result.explanation}`,
        {
          parse_mode: 'HTML',
          reply_markup: isLast ? doneKeyboard() : nextStepKeyboard(day, stepIndex + 1),
        },
      );
    } else {
      // Неверно — мини-подсказка, ждём следующую попытку
      const step = getStep(day, stepIndex) as InputStep;
      await sendEphemeral(
        ctx,
        `🤔 Не совсем верно. Попробуй ещё раз!\n\n💡 <i>${step.hint}</i>`,
        { parse_mode: 'HTML' },
      );
    }
  }

  logger.info({ telegramId, day, stepIndex, type }, 'Ответ обработан');
}

// ─── /progress ───────────────────────────────────────────────────────────────

export async function handleProgress(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // Если вызов из callback — отвечаем на него
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const progress = getUserProgress(telegramId);
  if (!progress) {
    await sendScreen(
      ctx,
      '📊 Ты ещё не начал(а) курс. Выбери нужный раздел:',
      { reply_markup: mainMenuKeyboard(false) },
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
    progressText += `\n🏆 Пройденные дни: ${progress.completedDays.slice(-10).join(', ')}${progress.completedDays.length > 10 ? '...' : ''}`;
  }

  if (progress.status === 'completed') {
    progressText += `\n\n🎉 <b>Поздравляем с завершением курса!</b>`;
  }

  await sendScreen(ctx, progressText, {
    parse_mode: 'HTML',
    reply_markup: mainMenuKeyboard(true),
  });
}
