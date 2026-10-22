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
  return kb;
}

function nextStepKeyboard(day: number, nextStep: number): InlineKeyboard {
  return new InlineKeyboard().text('➡️ Продолжить', `nextstep:${day}:${nextStep}`);
}

function doneKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('🏆 Завершить урок', 'lessonDone');
}

/** Универсальный вывод урока-шаблона (для планировщика) */
export function formatLessonMessage(lesson: { day: number; title: string; estimatedMinutes: number }): string {
  return (
    `📖 <b>День ${lesson.day}: ${lesson.title}</b>\n\n` +
    `⏱ Примерное время: ${lesson.estimatedMinutes} мин\n\n` +
    `Нажми /lesson чтобы начать урок!`
  );
}

// ─── Отправка шага ────────────────────────────────────────────────────────────

async function sendStep(ctx: BotContext, day: number, stepIndex: number): Promise<void> {
  const _unused = ctx.from?.id ?? (ctx.chat?.id as number);
  void _unused;
  const step = getStep(day, stepIndex);
  const total = getTotalSteps(day);
  if (!step) return;

  // Отправляем аудио-кружок если есть
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

  // Отправляем PDF для дня (только на первом шаге)
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
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: isLast ? doneKeyboard() : nextStepKeyboard(day, stepIndex + 1),
    });

  } else if (step.type === 'choice') {
    const text = formatChoiceStep(step, day, stepIndex, total);
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: choiceKeyboard(step, day, stepIndex),
    });

  } else if (step.type === 'input') {
    const text = formatInputStep(step, day, stepIndex, total);
    ctx.session.awaitingStep = { day, stepIndex, type: 'input' };
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('💡 Подсказка', `hint:${day}:${stepIndex}`),
    });

  } else if (step.type === 'free') {
    const text = formatFreeStep(step, day, stepIndex, total);
    ctx.session.awaitingStep = { day, stepIndex, type: 'free' };
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('💡 Подсказка', `hint:${day}:${stepIndex}`),
    });
  }
}

// ─── Команда /lesson ──────────────────────────────────────────────────────────

export async function handleLesson(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const access = getCourseAccess(telegramId);
  if (!access) {
    await ctx.reply('📚 У тебя пока нет доступа к курсу.\n\nНажми /course чтобы узнать подробности.');
    return;
  }
  if (access.status === 'pending') {
    await ctx.reply('⏳ Доступ обрабатывается. После подтверждения оплаты ты получишь уведомление.');
    return;
  }
  if (access.status === 'revoked') {
    await ctx.reply('❌ Доступ отозван. Обратись в поддержку /support.');
    return;
  }
  if (access.paused) {
    await ctx.reply('⏸ Обучение приостановлено. Используй /progress чтобы продолжить.');
    return;
  }

  const lesson = getLessonForUser(telegramId);
  if (!lesson) {
    if (access.status === 'completed') {
      await ctx.reply('🎉 Ты завершил(а) весь курс! Используй /progress чтобы посмотреть итоги.');
    } else {
      await ctx.reply('📭 Урок ещё не готов — он придёт по расписанию.');
    }
    return;
  }

  const prog = getOrInitStepProgress(telegramId, lesson.day);
  const stepIndex = prog.completed_at ? 0 : prog.step_index;

  await ctx.reply(
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
    let text = `${result.feedback}\n\n${result.explanation}`;
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: isLast ? doneKeyboard() : nextStepKeyboard(day, stepIndex + 1),
    });
  } else {
    // Неверно — показываем мини-подсказку, кнопки остаются
    const step = getStep(day, stepIndex) as ChoiceStep;
    await ctx.reply(
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
  await ctx.reply(`💡 <i>${hint}</i>`, { parse_mode: 'HTML' });
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

  await ctx.reply(
    `🎉 <b>Урок ${day} завершён!</b>\n\nОтличная работа! Следующий урок придёт завтра по расписанию.\n\n/progress — посмотреть прогресс`,
    { parse_mode: 'HTML' },
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
    await ctx.reply('⚠️ Ответ слишком длинный. Попробуй короче.');
    return;
  }

  const { day, stepIndex, type } = awaiting;
  const total = getTotalSteps(day);
  const isLast = stepIndex === total - 1;

  if (type === 'free') {
    ctx.session.awaitingStep = undefined;
    const step = getStep(day, stepIndex) as FreeStep;
    markStepDone(telegramId, day, stepIndex);
    await ctx.reply(
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
      await ctx.reply(
        `${result.feedback}\n\n${result.explanation}`,
        {
          parse_mode: 'HTML',
          reply_markup: isLast ? doneKeyboard() : nextStepKeyboard(day, stepIndex + 1),
        },
      );
    } else {
      // Неверно — мини-подсказка, ждём следующую попытку
      const step = getStep(day, stepIndex) as InputStep;
      await ctx.reply(
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

  const progress = getUserProgress(telegramId);
  if (!progress) {
    await ctx.reply('📊 Ты ещё не начал(а) курс. Используй /course чтобы купить доступ.');
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

  let text =
    `📊 <b>Твой прогресс</b>\n\n` +
    `${bar} ${progress.percent}%\n\n` +
    `📅 Статус: ${statusMap[progress.status] ?? progress.status}\n` +
    `📖 Текущий день: ${progress.currentDay} из 30\n` +
    `✅ Пройдено уроков: ${progress.completedCount}\n` +
    `📚 Осталось: ${progress.remaining}\n`;

  if (progress.completedDays.length > 0) {
    text += `\n🏆 Пройденные дни: ${progress.completedDays.slice(-10).join(', ')}${progress.completedDays.length > 10 ? '...' : ''}`;
  }

  if (progress.status === 'completed') {
    text += `\n\n🎉 <b>Поздравляем с завершением курса!</b>`;
  } else {
    text += `\n\nИспользуй /lesson чтобы продолжить.`;
  }

  await ctx.reply(text, { parse_mode: 'HTML' });
}
