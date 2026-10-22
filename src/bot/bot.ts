import { Bot, session } from 'grammy';
import type { BotContext, SessionData } from './context.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

import { handleStart, sendFreeChecklist } from './handlers/startHandler.js';
import {
  handleMenu,
  handleHelp,
  handleSupport,
  handleCancel,
  handleTextButton,
  handleDisableReminders,
} from './handlers/menuHandler.js';
import { handleCourseInfo, handleBuyCourse, handleStartCourse } from './handlers/courseHandler.js';
import {
  handleLesson,
  handleProgress,
  handleUserAnswer,
  handleChoiceCallback,
  handleNextStep,
  handleHintCallback,
  handleLessonDone,
} from './handlers/lessonHandler.js';
import { handleAdminCommand } from '../admin/adminHandlers.js';
import { getCourseAccess, pauseCourse } from '../db/repositories/courseAccess.js';
import { setUserBlocked } from '../db/repositories/users.js';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session<SessionData, BotContext>({ initial: (): SessionData => ({}) }));

  // Сбрасываем флаг блокировки при любом входящем сообщении
  bot.use(async (ctx, next) => {
    if (ctx.from?.id) setUserBlocked(ctx.from.id, false);
    await next();
  });

  // ── Команды ────────────────────────────────────────────────────────────────
  bot.command('start', handleStart);
  bot.command('menu', handleMenu);
  bot.command('help', handleHelp);
  bot.command('support', handleSupport);
  bot.command('cancel', handleCancel);
  bot.command('course', handleCourseInfo);
  bot.command('lesson', handleLesson);
  bot.command('progress', handleProgress);

  for (const cmd of ['admin_stats', 'admin_user', 'admin_grant', 'admin_revoke', 'admin_lesson', 'admin_msg', 'admin_audit', 'admin_help']) {
    bot.command(cmd, handleAdminCommand);
  }

  // ── Inline callbacks ───────────────────────────────────────────────────────

  // Покупка курса
  bot.callbackQuery('buy_course', handleBuyCourse);
  bot.callbackQuery('show_course_info', handleCourseInfo);
  bot.callbackQuery('start_course', handleStartCourse);
  bot.callbackQuery('show_checklist', async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendFreeChecklist(ctx);
  });
  bot.callbackQuery('show_program', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `📚 <b>Программа:</b>\n\nДни 1–7: Основы, to be, числа\nДни 8–14: Present Simple\nДни 15–21: Бытовые ситуации\nДни 22–30: Повторение и финал`,
      { parse_mode: 'HTML' },
    );
  });

  // Пауза/возобновление курса
  bot.callbackQuery('pause_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, true);
    await ctx.reply('⏸ Обучение приостановлено. Напиши /lesson чтобы продолжить.');
  });
  bot.callbackQuery('resume_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, false);
    await ctx.reply('▶️ Обучение возобновлено! Используй /lesson.');
  });

  // Управление напоминаниями
  bot.callbackQuery('disable_reminders', handleDisableReminders);
  bot.callbackQuery('cancel', handleCancel);

  // ── Навигация по шагам урока ───────────────────────────────────────────────

  // choice:day:stepIndex:chosenIndex
  bot.callbackQuery(/^choice:(\d+):(\d+):(\d+)$/, async (ctx) => {
    const match = ctx.match as RegExpMatchArray;
    const day = Number(match[1]);
    const stepIndex = Number(match[2]);
    const chosenIndex = Number(match[3]);
    await handleChoiceCallback(ctx, day, stepIndex, chosenIndex);
  });

  // nextstep:day:stepIndex
  bot.callbackQuery(/^nextstep:(\d+):(\d+)$/, async (ctx) => {
    const match = ctx.match as RegExpMatchArray;
    const day = Number(match[1]);
    const stepIndex = Number(match[2]);
    await handleNextStep(ctx, day, stepIndex);
  });

  // hint:day:stepIndex
  bot.callbackQuery(/^hint:(\d+):(\d+)$/, async (ctx) => {
    const match = ctx.match as RegExpMatchArray;
    const day = Number(match[1]);
    const stepIndex = Number(match[2]);
    await handleHintCallback(ctx, day, stepIndex);
  });

  // Завершение урока
  bot.callbackQuery('lessonDone', handleLessonDone);

  // Навигация к прошлому уроку
  bot.callbackQuery(/^lesson_day_(\d+)$/, async (ctx) => {
    const day = Number(ctx.match[1]);
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) return;
    const access = getCourseAccess(telegramId);
    if (!access || day > access.current_day) {
      await ctx.reply('Этот урок ещё не доступен.');
      return;
    }
    const { getLessonByDay } = await import('../content/course.js');
    const lesson = getLessonByDay(day);
    if (!lesson) return;
    await ctx.reply(`📖 <b>День ${lesson.day}: ${lesson.title}</b>\n\n/lesson — открыть урок`, { parse_mode: 'HTML' });
  });

  // ── Кнопки reply-клавиатуры ────────────────────────────────────────────────
  bot.on('message:text', async (ctx, next) => {
    const menuButtons = [
      '🎁 Бесплатный чек-лист', '📚 Программа курса', '💳 Купить курс за 500 ₽',
      '📖 Мой урок', '📊 Мой прогресс', '🆘 Поддержка',
    ];
    if (menuButtons.includes(ctx.message.text)) {
      await handleTextButton(ctx);
    } else {
      await next();
    }
  });

  // ── Ответы пользователя на задания ────────────────────────────────────────
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.awaitingStep) {
      await handleUserAnswer(ctx);
    } else {
      await next();
    }
  });

  // ── Fallback ───────────────────────────────────────────────────────────────
  bot.on('message', async (ctx) => {
    await ctx.reply(
      '🤔 Не понимаю это сообщение.\n\nИспользуй /menu для навигации или /help для справки.',
    );
  });

  bot.catch((err) => {
    logger.error({ error: err.error, update: err.ctx.update }, 'Необработанная ошибка бота');
  });

  return bot;
}
