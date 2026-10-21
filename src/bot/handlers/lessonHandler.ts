import type { BotContext } from '../context.js';
import { getCourseAccess } from '../../db/repositories/courseAccess.js';
import { getLessonForUser, getUserProgress, processSubmission } from '../../services/lessonService.js';
import { lessonKeyboard } from '../keyboards/mainMenu.js';
import { getSubmission } from '../../db/repositories/lessons.js';
import type { Lesson } from '../../content/course.js';
import { logger } from '../../utils/logger.js';

export function formatLessonMessage(lesson: Lesson): string {
  const examples = lesson.examples
    .map((e) => `  • <i>${e.english}</i>\n    → ${e.russian}`)
    .join('\n');

  return (
    `📖 <b>День ${lesson.day}: ${lesson.title}</b>\n\n` +
    `🎯 <b>Цель:</b> ${lesson.objective}\n\n` +
    `📝 <b>Объяснение:</b>\n${lesson.explanation}\n\n` +
    `💬 <b>Примеры:</b>\n${examples}\n\n` +
    `✏️ <b>Задание:</b>\n${lesson.exercise}\n\n` +
    `💡 <b>Подсказка:</b> ${lesson.hint}\n\n` +
    `🔁 <b>Повторение:</b> ${lesson.review}\n\n` +
    `⏱ Примерное время: ${lesson.estimatedMinutes} минут`
  );
}

export async function handleLesson(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const access = getCourseAccess(telegramId);

  if (!access) {
    await ctx.reply('📚 У тебя пока нет доступа к курсу.\n\nНажми /course чтобы узнать подробности и купить.');
    return;
  }
  if (access.status === 'pending') {
    await ctx.reply('⏳ Твой доступ обрабатывается. Как только оплата подтвердится, ты получишь уведомление.');
    return;
  }
  if (access.status === 'revoked') {
    await ctx.reply('❌ Доступ к курсу отозван. Обратитесь в поддержку /support.');
    return;
  }
  if (access.paused) {
    await ctx.reply('⏸ Обучение приостановлено. Нажми /menu и выбери "Мой прогресс" чтобы продолжить.');
    return;
  }

  const lesson = getLessonForUser(telegramId);
  if (!lesson) {
    if (access.status === 'completed') {
      await ctx.reply('🎉 Ты завершил(а) весь курс! Используй /progress чтобы посмотреть итоги.');
    } else {
      await ctx.reply('📭 Урок ещё не готов. Он придёт сегодня по расписанию.');
    }
    return;
  }

  const hasAnswer = !!getSubmission(telegramId, lesson.day);
  await ctx.reply(formatLessonMessage(lesson), {
    parse_mode: 'HTML',
    reply_markup: lessonKeyboard(lesson.day, hasAnswer),
  });
}

export async function handleAnswerCallback(ctx: BotContext, dayNumber: number): Promise<void> {
  await ctx.answerCallbackQuery();
  ctx.session.awaitingAnswer = dayNumber;
  await ctx.reply(`✏️ Отправь свой ответ к уроку ${dayNumber} сообщением ниже.\n\n/cancel — отменить`);
}

export async function handleUserAnswer(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const dayNumber = ctx.session.awaitingAnswer;
  if (!dayNumber) return;

  const text = ctx.message?.text;
  if (!text || text.startsWith('/')) return;

  ctx.session.awaitingAnswer = undefined;

  const result = await processSubmission(telegramId, dayNumber, text);

  if (!result.saved) {
    await ctx.reply('⚠️ Ответ слишком длинный. Попробуй ещё раз покороче.');
    return;
  }

  let reply = `${result.feedback}\n\n`;
  if (result.isCorrect === false) {
    reply += `📌 Правильный ответ: <code>${result.correctAnswer}</code>\n\n`;
  } else if (result.isCorrect === null && result.correctAnswer) {
    reply += `📌 Пример ответа: <i>${result.correctAnswer}</i>\n\n`;
  }
  reply += `Отличная работа! Продолжай в том же духе 💪`;

  await ctx.reply(reply, { parse_mode: 'HTML' });
  logger.info({ telegramId, dayNumber, isCorrect: result.isCorrect }, 'Ответ обработан');
}

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
    active: 'Активен',
    completed: '✅ Завершён',
    paused: '⏸ Приостановлен',
    revoked: '❌ Отозван',
  };

  const completedStr = progress.completedDays.length
    ? `Дни: ${progress.completedDays.join(', ')}`
    : 'Ещё нет';

  let text =
    `📊 <b>Твой прогресс</b>\n\n` +
    `📅 Статус: ${statusMap[progress.status] ?? progress.status}\n` +
    `📖 Текущий день: ${progress.currentDay}\n` +
    `✅ Выполнено уроков: ${progress.completedCount} из 30\n` +
    `📈 Процент завершения: ${progress.percent}%\n` +
    `📚 Осталось: ${progress.remaining} уроков\n\n` +
    `🏆 Выполненные задания: ${completedStr}`;

  if (progress.status === 'completed') {
    text += `\n\n🎉 <b>Поздравляем с завершением курса!</b>`;
  } else {
    text += `\n\nИспользуй /lesson чтобы открыть текущий урок.`;
  }

  await ctx.reply(text, { parse_mode: 'HTML' });
}
