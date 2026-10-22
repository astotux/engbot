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
import {
  handleVocabMenu,
  handleVocabStudy,
  handleVocabQuiz,
  handleTestAnswer,
  handleVocabTextAnswer,
  handleNextQuestion,
  handleFinishTest,
  handleFinishConfirm,
  handleRestartSession,
  handleVocabStats,
  handleVocabSettings,
  handleSetDirection,
  handleSetMode,
} from './handlers/vocabularyHandler.js';
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

  // ── Команды ──────────────────────────────────────────────────────────────
  bot.command('start', handleStart);
  bot.command('menu', handleMenu);
  bot.command('help', handleHelp);
  bot.command('support', handleSupport);
  bot.command('cancel', handleCancel);
  bot.command('course', handleCourseInfo);
  bot.command('lesson', handleLesson);
  bot.command('progress', handleProgress);
  bot.command('vocab', handleVocabMenu);

  for (const cmd of ['admin_stats', 'admin_user', 'admin_grant', 'admin_revoke', 'admin_lesson', 'admin_msg', 'admin_audit', 'admin_report', 'admin_help']) {
    bot.command(cmd, handleAdminCommand);
  }

  // ── Inline callbacks ───────────────────────────────────────────────────────

  // Главное меню
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

  bot.callbackQuery('my_lesson', handleLesson);
  bot.callbackQuery('my_progress', handleProgress);
  bot.callbackQuery('support', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleSupport(ctx);
  });

  // Курс
  bot.callbackQuery('buy_course', handleBuyCourse);
  bot.callbackQuery('show_course_info', handleCourseInfo);
  bot.callbackQuery('start_course', handleStartCourse);
  bot.callbackQuery('show_checklist', async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendFreeChecklist(ctx);
  });
  bot.callbackQuery('show_program', async (ctx) => {
    await ctx.answerCallbackQuery();
    const { InlineKeyboard } = await import('grammy');
    const kb = new InlineKeyboard().text('🏠 На главную', 'main_menu');
    await sendScreen(
      ctx,
      `📚 <b>Программа:</b>\n\nДни 1–7: Основы, to be, числа\nДни 8–14: Present Simple\nДни 15–21: Бытовые ситуации\nДни 22–30: Повторение и финал`,
      { parse_mode: 'HTML', reply_markup: kb },
    );
  });

  bot.callbackQuery('pause_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, true);
    await sendScreen(ctx, '⏸ Обучение приостановлено.', { reply_markup: mainMenuKeyboard(true) });
  });
  bot.callbackQuery('resume_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, false);
    await sendScreen(ctx, '▶️ Обучение возобновлено! Открой урок ниже.', { reply_markup: mainMenuKeyboard(true) });
  });

  bot.callbackQuery('disable_reminders', handleDisableReminders);
  bot.callbackQuery('cancel', handleCancel);

  // ── Уроки ────────────────────────────────────────────────────────────────

  bot.callbackQuery(/^choice:(\d+):(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handleChoiceCallback(ctx, Number(m[1]), Number(m[2]), Number(m[3]));
  });
  bot.callbackQuery(/^nextstep:(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handleNextStep(ctx, Number(m[1]), Number(m[2]));
  });
  bot.callbackQuery(/^hint:(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handleHintCallback(ctx, Number(m[1]), Number(m[2]));
  });
  bot.callbackQuery('lessonDone', handleLessonDone);

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
      .text('📖 Открыть этот урок', `open_lesson_${day}`).row()
      .text('🏠 На главную', 'main_menu');
    await sendScreen(ctx, `📖 <b>День ${lesson.day}: ${lesson.title}</b>`, {
      parse_mode: 'HTML', reply_markup: kb,
    });
  });

  bot.callbackQuery(/^open_lesson_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) return;
    const access = getCourseAccess(telegramId);
    if (!access || Number(ctx.match[1]) > access.current_day) {
      await sendScreen(ctx, 'Этот урок ещё не доступен.', { reply_markup: mainMenuKeyboard(true) });
      return;
    }
    await handleLesson(ctx);
  });

  // ── Словарный запас ───────────────────────────────────────────────────────

  // Меню раздела
  bot.callbackQuery('vocab:menu', handleVocabMenu);

  // Изучение слов
  bot.callbackQuery('vocab:study', handleVocabStudy);
  bot.callbackQuery('vocab:quiz_after_study', async (ctx) => {
    await handleVocabQuiz(ctx, 'quiz');
  });

  // Тест и повторение ошибок
  bot.callbackQuery('vocab:quiz', async (ctx) => handleVocabQuiz(ctx, 'quiz'));
  bot.callbackQuery('vocab:review_errors', async (ctx) => handleVocabQuiz(ctx, 'review_errors'));

  // Статистика и настройки
  bot.callbackQuery('vocab:stats', handleVocabStats);
  bot.callbackQuery('vocab:settings', handleVocabSettings);

  // Настройки — направление
  bot.callbackQuery('vocab:set:dir:en_to_ru', async (ctx) => handleSetDirection(ctx, 'en_to_ru'));
  bot.callbackQuery('vocab:set:dir:ru_to_en', async (ctx) => handleSetDirection(ctx, 'ru_to_en'));

  // Настройки — режим ответа
  bot.callbackQuery('vocab:set:mode:test', async (ctx) => handleSetMode(ctx, 'test'));
  bot.callbackQuery('vocab:set:mode:written', async (ctx) => handleSetMode(ctx, 'written'));
  bot.callbackQuery('vocab:set:mode:alternating', async (ctx) => handleSetMode(ctx, 'alternating'));

  // Ответ на тест: vocab:answer:sessionId:questionId:optionIndex
  bot.callbackQuery(/^vocab:answer:(\d+):(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handleTestAnswer(ctx, Number(m[1]), Number(m[2]), Number(m[3]));
  });

  // Следующий вопрос: vocab:next:sessionId:prevQuestionId
  bot.callbackQuery(/^vocab:next:(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handleNextQuestion(ctx, Number(m[1]), Number(m[2]));
  });

  // Завершить тест досрочно: vocab:finish:sessionId
  bot.callbackQuery(/^vocab:finish:(\d+)$/, async (ctx) => {
    await handleFinishTest(ctx, Number(ctx.match[1]));
  });

  // Подтвердить досрочное завершение: vocab:finish_confirm:sessionId
  bot.callbackQuery(/^vocab:finish_confirm:(\d+)$/, async (ctx) => {
    await handleFinishConfirm(ctx, Number(ctx.match[1]));
  });

  // Повторить тест: vocab:restart:sessionId
  bot.callbackQuery(/^vocab:restart:(\d+)$/, async (ctx) => {
    await handleRestartSession(ctx, Number(ctx.match[1]));
  });

  // ── Текстовые сообщения ───────────────────────────────────────────────────

  // 1. Ответ на шаг урока
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.awaitingStep) {
      await handleUserAnswer(ctx);
    } else {
      await next();
    }
  });

  // 2. Ответ на письменный вопрос словаря
  bot.on('message:text', async (ctx, next) => {
    if (ctx.session.vocabAwaitingAnswer) {
      await handleVocabTextAnswer(ctx);
    } else {
      await next();
    }
  });

  // 3. Fallback
  bot.on('message:text', async (ctx) => {
    const telegramId = ctx.from?.id;
    const hasCourse = (() => {
      if (!telegramId) return false;
      const access = getCourseAccess(telegramId);
      return !!access && (access.status === 'active' || access.status === 'completed');
    })();
    await sendScreen(ctx, '🤔 Не понимаю это сообщение.\n\nИспользуй кнопки меню:', {
      reply_markup: mainMenuKeyboard(hasCourse),
    });
  });

  bot.on('message', async (ctx) => {
    const telegramId = ctx.from?.id;
    const hasCourse = (() => {
      if (!telegramId) return false;
      const access = getCourseAccess(telegramId);
      return !!access && (access.status === 'active' || access.status === 'completed');
    })();
    await sendScreen(ctx, '🤔 Используй кнопки меню:', {
      reply_markup: mainMenuKeyboard(hasCourse),
    });
  });

  bot.catch((err) => {
    logger.error({ error: err.error, update: err.ctx.update }, 'Необработанная ошибка бота');
  });

  return bot;
}
