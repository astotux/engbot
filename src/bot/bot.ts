import { Bot, session } from 'grammy';
import type { BotContext, SessionData } from './context.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

import { handleStart, sendFreeChecklist, handleCheckSubscription } from './handlers/startHandler.js';
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
  handleSetDifficulty,
  handleSetDirection,
  handleSetMode,
} from './handlers/vocabularyHandler.js';
import { handleAdminCommand } from '../admin/adminHandlers.js';
import { getCourseAccess, pauseCourse } from '../db/repositories/courseAccess.js';
import { setUserBlocked } from '../db/repositories/users.js';
import { mainMenuKeyboard } from './keyboards/mainMenu.js';
import { sendScreen, editScreen, deleteUserMessage } from './sendHelper.js';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session<SessionData, BotContext>({ initial: (): SessionData => ({}) }));

  // Сбрасываем флаг блокировки при любом входящем сообщении
  bot.use(async (ctx, next) => {
    if (ctx.from?.id) setUserBlocked(ctx.from.id, false);
    // Удаляем команды пользователя (кроме админских), чтобы сохранять чистый чат в одном сообщении
    if (ctx.message?.text?.startsWith('/') && !ctx.message.text.startsWith('/admin')) {
      deleteUserMessage(ctx);
    }
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
    await editScreen(ctx, '📱 Главное меню\n\nВыбери нужный раздел:', {
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

  // Проверка подписки на канал (после нажатия «Я подписался»)
  bot.callbackQuery('check_subscription', handleCheckSubscription);
  bot.callbackQuery('show_program', async (ctx) => {
    await ctx.answerCallbackQuery();
    const { InlineKeyboard } = await import('grammy');
    const telegramId = ctx.from?.id;
    const hasCourse = (() => {
      if (!telegramId) return false;
      const access = getCourseAccess(telegramId);
      return !!access && (access.status === 'active' || access.status === 'completed');
    })();

    const kb = new InlineKeyboard();
    if (!hasCourse) {
      kb.text('💳 Получить курс за 500 ₽', 'buy_course').row();
    }
    kb.text('🧠 Словарный тренажёр', 'vocab:menu').row();
    kb.text('🏠 В главное меню', 'main_menu');

    await editScreen(
      ctx,
      `📚 <b>Программа курса «Английский за 30 дней»</b>\n\n` +
      `Курс разбит на 4 понятных и практических модуля:\n\n` +
      `🔹 <b>Модуль 1 (Дни 1–7): Базовый фундамент</b>\n` +
      `• Приветствия, вежливость, правила знакомства\n` +
      `• Местоимения и ключевой глагол <i>to be</i>\n` +
      `• Построение отрицаний, базовые вопросы и числа\n` +
      `• PDF-конспекты, аудио и видео-кружки с произношением\n\n` +
      `🔹 <b>Модуль 2 (Дни 8–14): Настоящее время и рутина</b>\n` +
      `• Время Present Simple: утверждения и вопросы\n` +
      `• Распорядок дня, время суток и наречия частоты\n` +
      `• Отрицательные конструкции <i>don't / doesn't</i>\n\n` +
      `🔹 <b>Модуль 3 (Дни 15–21): Живая речь и ситуации</b>\n` +
      `• Модальный глагол <i>can / can't</i>\n` +
      `• В кафе: заказ еды, напитков и счёт\n` +
      `• В магазине: покупки, цены, ориентация в городе\n` +
      `• Диалоги о семье, хобби и друзьях\n\n` +
      `🔹 <b>Модуль 4 (Дни 22–30): Прошлое, будущее и свободная речь</b>\n` +
      `• Планы на будущее (конструкция <i>going to</i>)\n` +
      `• Прошедшее время: Past Simple и формы <i>was / were</i>\n` +
      `• Составление уверенного рассказа о себе\n` +
      `• Финальное повторение и итоговый экзамен\n\n` +
      `🎁 <b>Бонус:</b> Неограниченный словарный тренажёр на <b>500+ слов</b> (A1–C2)!`,
      { parse_mode: 'HTML', reply_markup: kb },
    );
  });

  bot.callbackQuery('pause_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, true);
    await editScreen(ctx, '⏸ Обучение приостановлено.', { reply_markup: mainMenuKeyboard(true) });
  });
  bot.callbackQuery('resume_course', async (ctx) => {
    const id = ctx.from?.id; if (!id) return;
    await ctx.answerCallbackQuery();
    pauseCourse(id, false);
    await editScreen(ctx, '▶️ Обучение возобновлено! Открой урок ниже.', { reply_markup: mainMenuKeyboard(true) });
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

  // Настройки — уровень сложности (A1-A2, B1-B2, C1-C2)
  bot.callbackQuery('vocab:set:diff:A1-A2', async (ctx) => handleSetDifficulty(ctx, 'A1-A2'));
  bot.callbackQuery('vocab:set:diff:B1-B2', async (ctx) => handleSetDifficulty(ctx, 'B1-B2'));
  bot.callbackQuery('vocab:set:diff:C1-C2', async (ctx) => handleSetDifficulty(ctx, 'C1-C2'));

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
    deleteUserMessage(ctx);
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
    deleteUserMessage(ctx);
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
