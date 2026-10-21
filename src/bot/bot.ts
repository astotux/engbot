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
  handleAnswerCallback,
  handleUserAnswer,
  formatLessonMessage,
} from './handlers/lessonHandler.js';
import { handleAdminCommand } from '../admin/adminHandlers.js';
import { getCourseAccess, pauseCourse } from '../db/repositories/courseAccess.js';
import { getSubmission } from '../db/repositories/lessons.js';
import { getLessonByDay } from '../content/course.js';
import { lessonKeyboard } from './keyboards/mainMenu.js';
import { setUserBlocked } from '../db/repositories/users.js';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session<SessionData, BotContext>({ initial: (): SessionData => ({}) }));

  // Сбрасываем флаг блокировки при любом входящем сообщении
  bot.use(async (ctx, next) => {
    if (ctx.from?.id) {
      setUserBlocked(ctx.from.id, false);
    }
    await next();
  });

  // Команды
  bot.command('start', handleStart);
  bot.command('menu', handleMenu);
  bot.command('help', handleHelp);
  bot.command('support', handleSupport);
  bot.command('cancel', handleCancel);
  bot.command('course', handleCourseInfo);
  bot.command('lesson', handleLesson);
  bot.command('progress', handleProgress);

  // Административные команды
  const adminCommands = [
    'admin_stats', 'admin_user', 'admin_grant', 'admin_revoke',
    'admin_lesson', 'admin_msg', 'admin_audit', 'admin_help',
  ];
  for (const cmd of adminCommands) {
    bot.command(cmd, handleAdminCommand);
  }

  // Inline callbacks
  bot.callbackQuery('buy_course', handleBuyCourse);
  bot.callbackQuery('show_course_info', handleCourseInfo);
  bot.callbackQuery('show_program', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `📚 <b>Программа курса:</b>\n\nДни 1–7: Основы, приветствия, to be\nДни 8–14: Present Simple\nДни 15–21: Бытовые ситуации\nДни 22–30: Повторение и тесты`,
      { parse_mode: 'HTML' },
    );
  });
  bot.callbackQuery('start_course', handleStartCourse);
  bot.callbackQuery('cancel', handleCancel);
  bot.callbackQuery('disable_reminders', handleDisableReminders);
  bot.callbackQuery('show_checklist', async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendFreeChecklist(ctx);
  });

  bot.callbackQuery('pause_course', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;
    await ctx.answerCallbackQuery();
    pauseCourse(telegramId, true);
    await ctx.reply('⏸ Обучение приостановлено. Напиши /lesson чтобы продолжить.');
  });

  bot.callbackQuery('resume_course', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;
    await ctx.answerCallbackQuery();
    pauseCourse(telegramId, false);
    await ctx.reply('▶️ Обучение возобновлено! Используй /lesson.');
  });

  // Ответ на урок
  bot.callbackQuery(/^answer_day_(\d+)$/, async (ctx) => {
    const day = Number(ctx.match[1]);
    await handleAnswerCallback(ctx, day);
  });

  // Навигация по урокам
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
    const lesson = getLessonByDay(day);
    if (!lesson) return;
    const hasAnswer = !!getSubmission(telegramId, day);
    await ctx.reply(formatLessonMessage(lesson), {
      parse_mode: 'HTML',
      reply_markup: lessonKeyboard(day, hasAnswer),
    });
  });

  // Кнопки reply-клавиатуры
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

  // Обработка ответов на задания
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.awaitingAnswer) {
      await handleUserAnswer(ctx);
    } else {
      await next();
    }
  });

  // Fallback
  bot.on('message', async (ctx) => {
    await ctx.reply('🤔 Не понимаю это сообщение.\n\nИспользуй /menu для навигации или /help для справки.');
  });

  bot.catch((err) => {
    const { ctx, error } = err;
    logger.error({ error, update: ctx.update }, 'Необработанная ошибка бота');
  });

  return bot;
}
