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
import { mainMenuKeyboard } from './keyboards/mainMenu.js';
import { sendScreen } from './sendHelper.js';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session<SessionData, BotContext>({ initial: (): SessionData => ({}) }));

  // Сбрасываем флаг блокировки при любом входящем сообщении
  bot.use(async (ctx, next) => {
    if (ctx.from?.id) setUserBlocked(ctx.from.id, false);
    await next();
  });

  // ── Команды (оставляем для продвинутых пользователей, но UI через inline) ──
  bot.command('start', handleStart);
  bot.command('menu', handleMenu);
  bot.command('help', handleHelp);
  bot.command('support', handleSupport);
  bot.command('cancel', handleCancel);
  bot.command('course', handleCourseInfo);
  bot.command('lesson', handleLesson);
  bot.command('progress', handleProgress);

  for (const cmd of ['admin_stats', 'admin_user', 'admin_grant', 'admin_revoke', 'admin_lesson', 'admin_msg', 'admin_audit', 'admin_report', 'admin_help']) {
    bot.command(cmd, handleAdminCommand);
  }

  // ── Inline callbacks ───────────────────────────────────────────────────────

  // Главное меню — универсальная кнопка «На главную»
  bot.callbackQuery('main_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    const hasCourse = (() => {
      if (!telegramId) return false;
      const access = getCourseAccess(telegramId);
      return !!access && (access.status === 'active' || access.status === 'completed');
    })();
    await sendScreen(ctx, '📱 Главное меню\n\nВыбери нужный раздел:', {
      reply_markup: mainMenuKeyboard(hasCourse),
    });
  });

  // Мой урок (inline-кнопка главного меню)
  bot.callbackQuery('my_lesson', handleLesson);

  // Мой прогресс (inline-кнопка главного меню)
  bot.callbackQuery('my_progress', handleProgress);

  // Поддержка (inline-кнопка главного меню)
  bot.callbackQuery('support', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleSupport(ctx);
  });

  // Покупка курса
  bot.callbackQuery('buy_course', handleBuyCourse);
  bot.callbackQuery('show_course_info', handleCourseInfo);
  bot.callbackQuery('start_course', handleStartCourse);

  // Бесплатный чек-лист
  bot.callbackQuery('show_checklist', async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendFreeChecklist(ctx);
  });

  // Программа курса
  bot.callbackQuery('show_program', async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    const hasCourse = (() => {
      if (!telegramId) return false;
      const access = getCourseAccess(telegramId);
      return !!access && (access.status === 'active' || access.status === 'completed');
    })();
    const { InlineKeyboard } = await import('grammy');
    const kb = new InlineKeyboard().text('🏠 На главную', 'main_menu');
    await sendScreen(
      ctx,
      `📚 <b>Программа:</b>\n\nДни 1–7: Основы, to be, числа\nДни 8–14: Present Simple\nДни 15–21: Бытовые ситуации\nДни 22–30: Повторение и финал`,
      { parse_mode: 'HTML', reply_markup: kb },
    );
    void hasCourse; // используется выше при необходимости
  });

  // Пауза/возобновление курса
  bot.callbackQuery('pause_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, true);
    await sendScreen(ctx, '⏸ Обучение приостановлено.', {
      reply_markup: mainMenuKeyboard(true),
    });
  });
  bot.callbackQuery('resume_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, false);
    await sendScreen(ctx, '▶️ Обучение возобновлено! Открой урок ниже.', {
      reply_markup: mainMenuKeyboard(true),
    });
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
      await sendScreen(ctx, 'Этот урок ещё не доступен.', { reply_markup: mainMenuKeyboard(true) });
      return;
    }
    const { getLessonByDay } = await import('../content/course.js');
    const { InlineKeyboard } = await import('grammy');
    const lesson = getLessonByDay(day);
    if (!lesson) return;
    const kb = new InlineKeyboard()
      .text('📖 Открыть этот урок', `open_lesson_${day}`)
      .row()
      .text('🏠 На главную', 'main_menu');
    await sendScreen(
      ctx,
      `📖 <b>День ${lesson.day}: ${lesson.title}</b>`,
      { parse_mode: 'HTML', reply_markup: kb },
    );
  });

  // Открыть конкретный день урока
  bot.callbackQuery(/^open_lesson_(\d+)$/, async (ctx) => {
    const day = Number(ctx.match[1]);
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) return;
    const access = getCourseAccess(telegramId);
    if (!access || day > access.current_day) {
      await sendScreen(ctx, 'Этот урок ещё не доступен.', { reply_markup: mainMenuKeyboard(true) });
      return;
    }
    // Открываем урок через handleLesson
    await handleLesson(ctx);
  });

  // ── Ответы пользователя на задания ────────────────────────────────────────
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.awaitingStep) {
      await handleUserAnswer(ctx);
    } else {
      await next();
    }
  });

  // ── Fallback — любой текст не по контексту ─────────────────────────────────
  bot.on('message:text', async (ctx) => {
    const telegramId = ctx.from?.id;
    const hasCourse = (() => {
      if (!telegramId) return false;
      const access = getCourseAccess(telegramId);
      return !!access && (access.status === 'active' || access.status === 'completed');
    })();
    await sendScreen(
      ctx,
      '🤔 Не понимаю это сообщение.\n\nИспользуй кнопки меню для навигации:',
      { reply_markup: mainMenuKeyboard(hasCourse) },
    );
  });

  // ── Fallback для прочих типов сообщений ───────────────────────────────────
  bot.on('message', async (ctx) => {
    const telegramId = ctx.from?.id;
    const hasCourse = (() => {
      if (!telegramId) return false;
      const access = getCourseAccess(telegramId);
      return !!access && (access.status === 'active' || access.status === 'completed');
    })();
    await sendScreen(
      ctx,
      '🤔 Используй кнопки меню для навигации:',
      { reply_markup: mainMenuKeyboard(hasCourse) },
    );
  });

  bot.catch((err) => {
    logger.error({ error: err.error, update: err.ctx.update }, 'Необработанная ошибка бота');
  });

  return bot;
}
