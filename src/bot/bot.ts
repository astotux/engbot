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
  formatMenuText,
} from './handlers/menuHandler.js';
import {
  handleCourseInfo,
  handleBuyCourse,
  handleStartCourse,
  handleCheckPayment,
} from './handlers/courseHandler.js';
import {
  handleLesson,
  handleStartLessonDirectly,
  handleProgress,
  handleUserAnswer,
  handleChoiceCallback,
  handleNextStep,
  handlePrevStep,
  handleHintCallback,
  handleLessonDone,
} from './handlers/lessonHandler.js';
import {
  handleVocabMenu,
  handleVocabOnboardingDone,
  handleVocabStudy,
  handleVocabQuiz,
  handleTestAnswer,
  handleVocabTextAnswer,
  handleNextQuestion,
  handleFinishTest,
  handleFinishConfirm,
  handleResumeTest,
  handleRestartSession,
  handleVocabStats,
  handleVocabSettings,
  handleSetDifficulty,
  handleSetDirection,
  handleSetMode,
} from './handlers/vocabularyHandler.js';
import {
  handleNotesMenu,
  handleNotesDownload,
} from './handlers/notesAndTimeHandler.js';
import {
  handleMinigamesMenu,
  handlePhraseBuilderStart,
  handlePhraseBuilderPick,
  handlePhraseBuilderUndo,
  handlePhraseBuilderClear,
  handlePhraseBuilderHint,
  handleDialogueMenu,
  handleDialogueStart,
  handleDialogueAnswer,
} from './handlers/minigamesHandler.js';
import {
  handleAdminCommand,
  handleAdminUsersList,
  handleAdminUserCard,
  handleAdminToggleAccess,
  handleAdminReport,
} from '../admin/adminHandlers.js';
import { getCourseAccess, pauseCourse, hasUserCourseAccess } from '../db/repositories/courseAccess.js';
import { getAvailableDays } from '../services/lessonService.js';
import { isDayCompleted } from '../db/repositories/lessonSteps.js';
import { getLessonNotification, clearLessonNotification } from '../db/repositories/lessons.js';
import { setUserBlocked } from '../db/repositories/users.js';
import { mainMenuKeyboard } from './keyboards/mainMenu.js';
import { sendScreen, editScreen, deleteUserMessage } from './sendHelper.js';

export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.botToken);

  bot.use(session<SessionData, BotContext>({ initial: (): SessionData => ({}) }));

  // Сбрасываем флаг блокировки при любом входящем сообщении
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (userId) setUserBlocked(userId, false);
    // Удаляем команды пользователя (кроме админских), чтобы сохранять чистый чат в одном сообщении
    if (ctx.message?.text?.startsWith('/') && !ctx.message.text.startsWith('/admin')) {
      deleteUserMessage(ctx);
    }

    // Если пользователь нажал инлайн-кнопку на предыдущем основном сообщении (а не на самой уведе об уроке или воронке),
    // удаляем висящее уведомление об уроке / напоминание / воронку
    if (userId && ctx.callbackQuery?.message && ctx.api?.deleteMessage) {
      const cbMsgId = ctx.callbackQuery.message.message_id;
      const isNotifBtn =
        ctx.callbackQuery.data?.startsWith('start_scheduled_lesson') ||
        ctx.callbackQuery.data?.startsWith('funnel:');
      if (!isNotifBtn) {
        const notif = getLessonNotification(userId);
        if (notif) {
          clearLessonNotification(userId);
          if (notif.message_id !== cbMsgId) {
            ctx.api.deleteMessage(userId, notif.message_id).catch(() => {});
          }
        }
      }
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
  bot.command('lesson', async (ctx) => handleLesson(ctx));
  bot.command('progress', handleProgress);
  bot.command('vocab', handleVocabMenu);
  bot.command('notes', async (ctx) => handleNotesMenu(ctx, 0));
  bot.command('games', handleMinigamesMenu);

  for (const cmd of ['admin', 'admin_users', 'admin_stats', 'admin_user', 'admin_grant', 'admin_revoke', 'admin_lesson', 'admin_msg', 'admin_audit', 'admin_report', 'admin_help']) {
    bot.command(cmd, handleAdminCommand);
  }

  // ── Админ-панель (инлайн-кнопки) ───────────────────────────────────────────
  bot.callbackQuery('admin:noop', async (ctx) => {
    await ctx.answerCallbackQuery();
  });
  bot.callbackQuery(/^admin:users:(\d+)$/, async (ctx) => {
    await handleAdminUsersList(ctx, Number(ctx.match[1]));
  });
  bot.callbackQuery(/^admin:user:(\d+):(\d+)$/, async (ctx) => {
    await handleAdminUserCard(ctx, Number(ctx.match[1]), Number(ctx.match[2]));
  });
  bot.callbackQuery(/^admin:grant:(\d+):(\d+)$/, async (ctx) => {
    await handleAdminToggleAccess(ctx, Number(ctx.match[1]), Number(ctx.match[2]), 'grant');
  });
  bot.callbackQuery(/^admin:revoke:(\d+):(\d+)$/, async (ctx) => {
    await handleAdminToggleAccess(ctx, Number(ctx.match[1]), Number(ctx.match[2]), 'revoke');
  });
  bot.callbackQuery('admin:report', async (ctx) => {
    await handleAdminReport(ctx);
  });

  // ── Автоворонка (инлайн-кнопки) ───────────────────────────────────────────
  bot.callbackQuery(/^funnel:(buy|menu)$/, async (ctx) => {
    const action = ctx.match[1];
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    // Удаляем предыдущее основное сообщение бота, если оно было
    const cbMsgId = ctx.callbackQuery?.message?.message_id;
    const prevMainId = ctx.session?.lastBotMessageId;
    if (prevMainId && prevMainId !== cbMsgId && ctx.api?.deleteMessage) {
      try {
        await ctx.api.deleteMessage(telegramId, prevMainId);
      } catch {}
    }
    if (ctx.session && cbMsgId) {
      ctx.session.lastBotMessageId = cbMsgId;
    }
    clearLessonNotification(telegramId);

    if (action === 'buy') {
      await handleBuyCourse(ctx);
    } else {
      await ctx.answerCallbackQuery();
      const hasCourse = hasUserCourseAccess(telegramId);
      const text = formatMenuText(hasCourse, ctx.from?.first_name);
      await editScreen(ctx, text, {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(hasCourse),
      });
    }
  });

  // ── Inline callbacks ───────────────────────────────────────────────────────

  // Главное меню
  bot.callbackQuery('main_menu', async (ctx) => {
    await ctx.answerCallbackQuery();
    if (ctx.session) {
      ctx.session.awaitingStep = undefined;
      ctx.session.vocabAwaitingAnswer = undefined;
      ctx.session.phraseBuilderState = undefined;
      ctx.session.dialogueState = undefined;
    }
    const telegramId = ctx.from?.id;
    const hasCourse = telegramId ? hasUserCourseAccess(telegramId) : false;
    const text = formatMenuText(hasCourse, ctx.from?.first_name);
    await editScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(hasCourse),
    });
  });

  bot.callbackQuery('my_lesson', async (ctx) => handleLesson(ctx));
  bot.callbackQuery(/^start_scheduled_lesson(?::(\d+))?$/, async (ctx) => {
    const targetDay = ctx.match[1] ? Number(ctx.match[1]) : undefined;
    await handleLesson(ctx, targetDay);
  });
  bot.callbackQuery(/^start_required_lesson:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const day = Number(ctx.match[1]);
    const telegramId = ctx.from?.id;
    const access = telegramId ? getCourseAccess(telegramId) : undefined;
    if (!access && day > 3) {
      await handleLesson(ctx, day);
      return;
    }
    await handleStartLessonDirectly(ctx, day);
  });
  bot.callbackQuery('my_progress', handleProgress);
  bot.callbackQuery('support', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleSupport(ctx);
  });

  // ── Конспекты (со слайдером) ────────────────────────────────────────────────
  bot.callbackQuery('my_notes', async (ctx) => {
    await handleNotesMenu(ctx, 0);
  });
  bot.callbackQuery(/^notes:slide:(\d+)$/, async (ctx) => {
    await handleNotesMenu(ctx, Number(ctx.match[1]));
  });
  bot.callbackQuery(/^notes:download:(\d+)$/, async (ctx) => {
    await handleNotesDownload(ctx, Number(ctx.match[1]));
  });
  bot.callbackQuery('notes:noop', async (ctx) => {
    await ctx.answerCallbackQuery();
  });

  // ── Мини-игры (Словарный тренажёр, Конструктор фраз, Тренажёр диалогов) ────
  bot.callbackQuery('games:menu', handleMinigamesMenu);
  bot.callbackQuery('games:builder', async (ctx) => {
    await handlePhraseBuilderStart(ctx);
  });
  bot.callbackQuery(/^games:builder:(\d+)$/, async (ctx) => {
    await handlePhraseBuilderStart(ctx, Number(ctx.match[1]));
  });
  bot.callbackQuery(/^games:b_pick:(\d+)$/, async (ctx) => {
    await handlePhraseBuilderPick(ctx, Number(ctx.match[1]));
  });
  bot.callbackQuery('games:b_undo', handlePhraseBuilderUndo);
  bot.callbackQuery('games:b_clear', handlePhraseBuilderClear);
  bot.callbackQuery('games:b_hint', handlePhraseBuilderHint);

  bot.callbackQuery('games:dialogue', handleDialogueMenu);
  bot.callbackQuery(/^games:d_start:([a-zA-Z0-9_-]+)$/, async (ctx) => {
    await handleDialogueStart(ctx, ctx.match[1]);
  });
  bot.callbackQuery(/^games:d_ans:([a-zA-Z0-9_-]+):(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handleDialogueAnswer(ctx, m[1], Number(m[2]), Number(m[3]));
  });

  // Курс
  bot.callbackQuery('buy_course', handleBuyCourse);
  bot.callbackQuery('show_course_info', handleCourseInfo);
  bot.callbackQuery('start_course', handleStartCourse);
  bot.callbackQuery(/^check_payment(?::(.+))?$/, async (ctx) => {
    const paymentId = ctx.match?.[1];
    await handleCheckPayment(ctx, paymentId);
  });
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
    const hasCourse = telegramId ? hasUserCourseAccess(telegramId) : false;

    const kb = new InlineKeyboard();
    if (!hasCourse) {
      kb.text(`💳 Получить курс за ${config.coursePriceRub} ₽`, 'buy_course').row();
    }
    kb.text('🎮 Мини-игры и тренажёры', 'games:menu').row();
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
      `🎁 <b>Бонус:</b> Мини-игры и тренажёры — словарь на <b>500+ слов</b> (A1–C2), конструктор фраз и тренажёр диалогов!`,
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
  bot.callbackQuery(/^prevstep:(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handlePrevStep(ctx, Number(m[1]), Number(m[2]));
  });
  bot.callbackQuery(/^hint:(\d+):(\d+)$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    await handleHintCallback(ctx, Number(m[1]), Number(m[2]));
  });
  bot.callbackQuery(/^lessonDone(?::(\d+))?$/, async (ctx) => {
    const m = ctx.match as RegExpMatchArray;
    const explicitDay = m[1] ? Number(m[1]) : undefined;
    await handleLessonDone(ctx, explicitDay);
  });

  bot.callbackQuery(/^lesson_day_(\d+)$/, async (ctx) => {
    const day = Number(ctx.match[1]);
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) return;
    const access = getCourseAccess(telegramId);
    const available = getAvailableDays(telegramId);
    if (!available.includes(day)) {
      await sendScreen(ctx, 'Этот урок ещё не доступен.', { reply_markup: mainMenuKeyboard(!!access) });
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
    const day = Number(ctx.match[1]);
    const access = getCourseAccess(telegramId);
    const available = getAvailableDays(telegramId);
    if (!available.includes(day)) {
      await sendScreen(ctx, 'Этот урок ещё не доступен.', { reply_markup: mainMenuKeyboard(!!access) });
      return;
    }
    if (isDayCompleted(telegramId, day)) {
      await handleStartLessonDirectly(ctx, day);
      return;
    }
    await handleLesson(ctx, day);
  });

  // ── Словарный запас ───────────────────────────────────────────────────────

  // Меню раздела
  bot.callbackQuery('vocab:menu', handleVocabMenu);
  bot.callbackQuery('vocab:onboarding_done', handleVocabOnboardingDone);

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

  // Вернуться к тесту: vocab:resume:sessionId
  bot.callbackQuery(/^vocab:resume:(\d+)$/, async (ctx) => {
    await handleResumeTest(ctx, Number(ctx.match[1]));
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
    const hasCourse = telegramId ? hasUserCourseAccess(telegramId) : false;
    await sendScreen(
      ctx,
      '🤔 Не понимаю это сообщение.\n\nИспользуй кнопки меню или напиши в поддержку: @adm_koval',
      {
        reply_markup: mainMenuKeyboard(hasCourse),
      },
    );
  });

  bot.on('message', async (ctx) => {
    deleteUserMessage(ctx);
    const telegramId = ctx.from?.id;
    const hasCourse = telegramId ? hasUserCourseAccess(telegramId) : false;
    await sendScreen(
      ctx,
      '🤔 Используй кнопки меню или напиши в поддержку: @adm_koval',
      {
        reply_markup: mainMenuKeyboard(hasCourse),
      },
    );
  });

  bot.catch((err) => {
    logger.error({ error: err.error, update: err.ctx.update }, 'Необработанная ошибка бота');
  });

  return bot;
}
