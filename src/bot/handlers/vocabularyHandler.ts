/**
 * Хендлеры раздела «Словарный запас».
 *
 * editScreen — навигационные переходы (меню, настройки, статистика)
 * sendScreen — новый контент: изучение слов, вопросы теста, итоги
 *
 * Демо-ограничение для незарегистрированных на курс:
 *  - «Учить слова» работает всегда (ознакомление)
 *  - «Проверить знания» и «Повторить ошибки» — только 1 раз, потом предложение купить курс
 *  - Пользователи с купленным курсом — без ограничений
 */
import type { BotContext } from '../context.js';
import {
  startStudySession,
  startQuizSession,
  processAnswer,
  buildSummary,
  finishSessionEarly,
  restartSession,
  getUserVocabStats,
  getUserSettings,
  updateUserSettings,
  isVocabOnboarded,
  markVocabOnboarded,
  getSession,
  getWordById,
  markDemoQuizUsed,
  isDemoQuizUsed,
} from '../../services/vocabularyService.js';
import {
  getSeenWordIds,
  countActiveWords,
  countErrorWords,
  getCurrentQuestion,
  getSessionQuestions,
} from '../../db/repositories/vocabulary.js';
import { getCourseAccess } from '../../db/repositories/courseAccess.js';

import {
  vocabMenuKeyboard,
  afterStudyKeyboard,
  testQuestionKeyboard,
  writtenQuestionKeyboard,
  nextQuestionKeyboard,
  summaryKeyboard,
  settingsKeyboard,
  confirmFinishKeyboard,
  backToVocabMenuKeyboard,
} from '../keyboards/vocabularyKeyboards.js';
import { sendScreen, sendEphemeral, editScreen, deleteUserMessage } from '../sendHelper.js';
import { InlineKeyboard } from 'grammy';
import type { SessionSummary, VocabQuestion } from '../../services/vocabularyService.js';

// ─── Хелперы ─────────────────────────────────────────────────────────────────

/** Есть ли у пользователя активный/завершённый курс */
function userHasCourse(telegramId: number): boolean {
  const access = getCourseAccess(telegramId);
  return !!access && (access.status === 'active' || access.status === 'completed');
}

/** Клавиатура «купи курс» */
function buyCourseKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(`💳 Купить курс`, 'buy_course').row()
    .text('🎮 Мини-игры', 'games:menu')
    .text('🏠 На главную', 'main_menu');
}

// ─── Главное меню словаря ─────────────────────────────────────────────────────

export async function handleVocabMenu(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // Если пользователь заходит в словарный тренажёр впервые — открываем экран начальных настроек
  if (!isVocabOnboarded(telegramId)) {
    await handleVocabOnboarding(ctx);
    return;
  }

  const settings = getUserSettings(telegramId);
  const totalWords = countActiveWords(settings.difficulty);
  const hasCourse = userHasCourse(telegramId);
  const demoUsed = !hasCourse && isDemoQuizUsed(telegramId);
  const stats = getUserVocabStats(telegramId, settings.difficulty);

  let hint = '';
  if (!hasCourse) {
    hint = demoUsed
      ? '\n\n🔒 <i>Полный доступ к тестам — после покупки курса.</i>'
      : '\n\n🎁 <i>Тест доступен бесплатно один раз. После этого — в подарок с курсом!</i>';
  }

  await editScreen(
    ctx,
    `📖 <b>Словарный запас</b> (Уровень: <b>${settings.difficulty}</b>)\n\n` +
    `Слов в базе уровня: ${totalWords}\n` +
    `Ты освоил(а): ${stats.masteredWords} из ${totalWords}` +
    hint + '\n\n' +
    `Выбери действие:`,
    { parse_mode: 'HTML', reply_markup: vocabMenuKeyboard() },
  );
}

/**
 * Экран первого захода в словарный тренажёр:
 * пользователь выбирает параметры и нажимает «Продолжить».
 */
export async function handleVocabOnboarding(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const settings = getUserSettings(telegramId);

  const diffNames: Record<string, string> = {
    'A1-A2': 'A1–A2 (Начальный)',
    'B1-B2': 'B1–B2 (Средний)',
    'C1-C2': 'C1–C2 (Продвинутый)',
  };
  const directionText = settings.direction === 'en_to_ru'
    ? '🇬🇧→🇷🇺 Английский → Русский'
    : '🇷🇺→🇬🇧 Русский → Английский';
  const modeText: Record<string, string> = {
    test: 'Тест (выбор вариантов)',
    written: 'Письменно (ввод текста)',
    alternating: 'Чередование (тест + письменный)',
  };

  const text =
    `🧠 <b>Добро пожаловать в Словарный тренажёр!</b>\n\n` +
    `Давай настроим тренажёр под твой уровень перед началом:\n\n` +
    `📊 <b>Уровень сложности:</b> ${diffNames[settings.difficulty] ?? settings.difficulty}\n` +
    `📐 <b>Направление:</b> ${directionText}\n` +
    `📝 <b>Режим ответа:</b> ${modeText[settings.answer_mode]}\n\n` +
    `<i>Выбери нужные параметры и нажми «▶️ Продолжить»:</i>`;

  await editScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: settingsKeyboard(settings.direction, settings.answer_mode, settings.difficulty, true),
  });
}

export async function handleVocabOnboardingDone(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery('Настройки сохранены! ✓');

  markVocabOnboarded(telegramId);
  await handleVocabMenu(ctx);
}

// ─── Режим изучения ───────────────────────────────────────────────────────────

export async function handleVocabStudy(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const settings = getUserSettings(telegramId);
  const { words } = startStudySession(telegramId, settings.difficulty);

  if (words.length === 0) {
    await editScreen(
      ctx,
      `📭 Все слова уровня ${settings.difficulty} уже изучены! Попробуй проверить знания или смени уровень в настройках.`,
      { reply_markup: vocabMenuKeyboard() },
    );
    return;
  }

  let text = `📚 <b>Изучаем ${words.length} слов (${settings.difficulty})</b>\n\n`;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    text += `<b>${i + 1}. ${w.english_word}</b> — ${w.russian_translation}`;
    if (w.example_en) {
      text += `\n   <i>${w.example_en}</i>`;
      if (w.example_ru) text += `\n   → ${w.example_ru}`;
    }
    text += '\n\n';
  }
  text += '✅ Ознакомься со словами и нажми кнопку ниже.';

  await sendScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: afterStudyKeyboard(),
  });
}

// ─── Запуск теста ─────────────────────────────────────────────────────────────

export async function handleVocabQuiz(
  ctx: BotContext,
  sessionType: 'quiz' | 'review_errors' = 'quiz',
): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // ── Демо-ограничение ──────────────────────────────────────────────────────
  if (!userHasCourse(telegramId)) {
    if (isDemoQuizUsed(telegramId)) {
      // Демо уже использован — предлагаем купить курс
      await editScreen(
        ctx,
        `🔒 <b>Словарный запас — подарок к курсу</b>\n\n` +
        `Ты уже прошёл(а) бесплатный демо-тест!\n\n` +
        `Полный словарный раздел — сотни слов с разделением по уровням (A1-A2, B1-B2, C1-C2), неограниченные тесты, повторение ошибок — входит в курс «Английский за 30 дней».\n\n` +
        `💳 <b>Стоимость курса: 500 ₽</b>\n\n` +
        `Купи курс и получи словарный запас в подарок 🎁`,
        { parse_mode: 'HTML', reply_markup: buyCourseKeyboard() },
      );
      return;
    }
  }
  // ── Конец проверки ────────────────────────────────────────────────────────

  const settings = getUserSettings(telegramId);

  if (sessionType === 'review_errors') {
    const errorCount = countErrorWords(telegramId, settings.difficulty);
    if (errorCount === 0) {
      await editScreen(
        ctx,
        `🎉 Отличная работа! У тебя нет ошибок для повторения на уровне ${settings.difficulty}.\n\nМожешь изучить новые слова или пройти обычный тест.`,
        { reply_markup: vocabMenuKeyboard() },
      );
      return;
    }
  } else {
    const seenCount = getSeenWordIds(telegramId, settings.difficulty).length;
    if (seenCount === 0) {
      await editScreen(
        ctx,
        `📚 На уровне ${settings.difficulty} ты ещё не изучал(а) слова. Сначала познакомься с первыми 10 словами!`,
        { reply_markup: vocabMenuKeyboard() },
      );
      return;
    }
  }

  const result = startQuizSession(telegramId, sessionType);

  if ('error' in result) {
    await editScreen(
      ctx,
      '📭 Нет слов для проверки. Сначала изучи слова!',
      { reply_markup: vocabMenuKeyboard() },
    );
    return;
  }

  const { session, firstQuestion, totalQuestions } = result;

  ctx.session.vocabSessionId = session.id;
  ctx.session.vocabAwaitingAnswer = undefined;

  await sendScreen(
    ctx,
    `🧠 <b>${sessionType === 'review_errors' ? 'Повторение ошибок' : 'Проверка знаний'}</b>\n\nВопросов: ${totalQuestions}`,
    { parse_mode: 'HTML' },
  );

  await sendQuestion(ctx, firstQuestion, 1, totalQuestions);
}

// ─── Отправка вопроса ─────────────────────────────────────────────────────────

async function sendQuestion(
  ctx: BotContext,
  question: VocabQuestion,
  questionNumber: number,
  totalQuestions: number,
): Promise<void> {
  const word = getWordById(question.word_id);
  if (!word) return;

  const directionLabel = question.direction === 'en_to_ru' ? '🇬🇧 → 🇷🇺' : '🇷🇺 → 🇬🇧';
  const questionText = question.direction === 'en_to_ru' ? word.english_word : word.russian_translation;
  const typeLabel = question.question_type === 'test' ? '🔘 Тест' : '✏️ Письменно';

  let text =
    `${typeLabel} | ${directionLabel} | <b>Вопрос ${questionNumber} из ${totalQuestions}</b>\n\n` +
    `<b>${questionText}</b>`;

  if (question.question_type === 'written') {
    text += `\n\n<i>Введи перевод текстом:</i>`;
    ctx.session.vocabAwaitingAnswer = {
      sessionId: question.session_id,
      questionId: question.id,
      questionNumber,
      totalQuestions,
    };
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: writtenQuestionKeyboard(question.session_id),
    });
  } else {
    const options = parseJsonArray(question.options_json);
    ctx.session.vocabAwaitingAnswer = undefined;
    await sendScreen(ctx, text, {
      parse_mode: 'HTML',
      reply_markup: testQuestionKeyboard(options, question.session_id, question.id),
    });
  }
}

// ─── Callback: ответ на тест ──────────────────────────────────────────────────

export async function handleTestAnswer(
  ctx: BotContext,
  sessionId: number,
  questionId: number,
  optionIndex: number,
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const session = getSession(sessionId);
  if (!session || session.status !== 'active' || session.telegram_id !== telegramId) {
    await sendEphemeral(ctx, '⚠️ Сессия не активна.');
    return;
  }

  const currentQ = getCurrentQuestion(sessionId);
  if (!currentQ || currentQ.id !== questionId) {
    await sendEphemeral(ctx, '⚠️ Этот вопрос уже отвечен.');
    return;
  }

  const options = parseJsonArray(currentQ.options_json);
  const selectedAnswer = options[optionIndex];
  if (!selectedAnswer) {
    await sendEphemeral(ctx, '⚠️ Неверный вариант.');
    return;
  }

  await processAndRespond(ctx, telegramId, sessionId, questionId, selectedAnswer);
}

// ─── Текстовый ответ пользователя ────────────────────────────────────────────

export async function handleVocabTextAnswer(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const awaiting = ctx.session.vocabAwaitingAnswer;
  if (!awaiting) return;

  const text = ctx.message?.text;
  if (!text || text.startsWith('/')) return;

  // Удаляем сообщение пользователя с ответом, чтобы не засорять чат
  deleteUserMessage(ctx);

  const { sessionId, questionId } = awaiting;

  const session = getSession(sessionId);
  if (!session || session.status !== 'active') {
    ctx.session.vocabAwaitingAnswer = undefined;
    return;
  }

  const currentQ = getCurrentQuestion(sessionId);
  if (!currentQ || currentQ.id !== questionId) {
    ctx.session.vocabAwaitingAnswer = undefined;
    return;
  }

  ctx.session.vocabAwaitingAnswer = undefined;
  await processAndRespond(ctx, telegramId, sessionId, questionId, text);
}

// ─── Общая обработка ответа ───────────────────────────────────────────────────

async function processAndRespond(
  ctx: BotContext,
  telegramId: number,
  sessionId: number,
  questionId: number,
  rawAnswer: string,
): Promise<void> {
  const result = processAnswer(telegramId, sessionId, questionId, rawAnswer);

  if ('error' in result) {
    await sendEphemeral(ctx, `⚠️ Ошибка: ${result.error}`);
    return;
  }

  const { isCorrect, correctAnswer, word, nextQuestion, sessionDone, summary } = result;

  const feedbackText = isCorrect
    ? `✅ <b>Правильно!</b>\n\n<i>${word.english_word} — ${word.russian_translation}</i>`
    : `❌ <b>Неверно.</b>\nПравильный ответ: <b>${correctAnswer}</b>\n\n<i>${word.english_word} — ${word.russian_translation}</i>`;

  if (sessionDone && summary) {
    // Помечаем демо-тест как использованный (только если нет курса)
    if (!userHasCourse(telegramId)) {
      markDemoQuizUsed(telegramId);
    }

    await sendSummary(ctx, summary, !userHasCourse(telegramId), feedbackText);
    ctx.session.vocabSessionId = undefined;
    ctx.session.vocabAwaitingAnswer = undefined;
  } else if (nextQuestion) {
    await sendScreen(ctx, feedbackText, {
      parse_mode: 'HTML',
      reply_markup: nextQuestionKeyboard(sessionId, questionId),
    });
  }
}

// ─── Callback: следующий вопрос ───────────────────────────────────────────────

export async function handleNextQuestion(
  ctx: BotContext,
  sessionId: number,
  _prevQuestionId: number,
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const session = getSession(sessionId);
  if (!session || session.telegram_id !== telegramId) return;

  if (session.status !== 'active') {
    await editScreen(ctx, '⚠️ Тест уже завершён.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  const nextQ = getCurrentQuestion(sessionId);
  if (!nextQ) {
    const summary = buildSummary(sessionId);
    if (!userHasCourse(telegramId)) markDemoQuizUsed(telegramId);
    await sendSummary(ctx, summary, !userHasCourse(telegramId));
    return;
  }

  const allQuestions = getSessionQuestions(sessionId);
  const questionNumber = allQuestions.findIndex((q) => q.id === nextQ.id) + 1;
  const totalQuestions = allQuestions.length;

  await sendQuestion(ctx, nextQ, questionNumber, totalQuestions);
}

// ─── Callback: досрочное завершение ──────────────────────────────────────────

export async function handleFinishTest(ctx: BotContext, sessionId: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const session = getSession(sessionId);
  if (!session || session.telegram_id !== telegramId) return;

  if (session.status !== 'active') {
    await editScreen(ctx, '⚠️ Тест уже завершён.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  // Всегда запрашиваем подтверждение с двумя кнопками: завершить или вернуться
  await editScreen(
    ctx,
    `⚠️ <b>Завершить тренировку?</b>\n\n` +
      `Ты точно хочешь закончить тест досрочно?\n\n` +
      `<i>Прогресс по уже отвеченным вопросам будет сохранён.</i>`,
    {
      parse_mode: 'HTML',
      reply_markup: confirmFinishKeyboard(sessionId),
    },
  );
}

export async function handleResumeTest(ctx: BotContext, sessionId: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const session = getSession(sessionId);
  if (!session || session.telegram_id !== telegramId) return;

  if (session.status !== 'active') {
    await editScreen(ctx, '⚠️ Тест уже завершён.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  const currentQ = getCurrentQuestion(sessionId);
  if (!currentQ) {
    const summary = buildSummary(sessionId);
    if (!userHasCourse(telegramId)) markDemoQuizUsed(telegramId);
    await sendSummary(ctx, summary, !userHasCourse(telegramId));
    return;
  }

  const allQuestions = getSessionQuestions(sessionId);
  const questionNumber = allQuestions.findIndex((q) => q.id === currentQ.id) + 1;
  const totalQuestions = allQuestions.length;

  await sendQuestion(ctx, currentQ, questionNumber, totalQuestions);
}

export async function handleFinishConfirm(ctx: BotContext, sessionId: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const summary = finishSessionEarly(sessionId);
  ctx.session.vocabAwaitingAnswer = undefined;
  ctx.session.vocabSessionId = undefined;

  if (!summary) {
    await editScreen(ctx, '⚠️ Не удалось завершить тест.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  if (!userHasCourse(telegramId)) markDemoQuizUsed(telegramId);
  await sendSummary(ctx, summary, !userHasCourse(telegramId));
}

// ─── Callback: повторить тест ─────────────────────────────────────────────────

export async function handleRestartSession(ctx: BotContext, sessionId: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  // Повтор — тоже требует курс если демо уже потрачен
  if (!userHasCourse(telegramId) && isDemoQuizUsed(telegramId)) {
    await editScreen(
      ctx,
      `🔒 <b>Повторное прохождение — часть курса</b>\n\n` +
      `Бесплатный демо-тест уже пройден.\n\n` +
      `Для неограниченных повторений купи курс «Английский за 30 дней» 🎁`,
      { parse_mode: 'HTML', reply_markup: buyCourseKeyboard() },
    );
    return;
  }

  const result = restartSession(telegramId, sessionId);

  if ('error' in result) {
    await editScreen(ctx, '⚠️ Не удалось повторить тест.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  const { session, firstQuestion, totalQuestions } = result;
  ctx.session.vocabSessionId = session.id;
  ctx.session.vocabAwaitingAnswer = undefined;

  await sendScreen(ctx, `🔄 <b>Повтор теста</b>\n\nВопросов: ${totalQuestions}`, { parse_mode: 'HTML' });
  await sendQuestion(ctx, firstQuestion, 1, totalQuestions);
}

// ─── Страница итогов ──────────────────────────────────────────────────────────

async function sendSummary(
  ctx: BotContext,
  summary: SessionSummary,
  showBuyPromo: boolean,
  lastFeedback?: string,
): Promise<void> {
  const { totalQuestions, correctCount, wrongCount, skippedCount, accuracy, questions } = summary;

  let text = '';
  if (lastFeedback) {
    text += `${lastFeedback}\n\n`;
  }

  text +=
    `🏆 <b>Результаты</b>\n\n` +
    `Вопросов: ${totalQuestions}\n` +
    `✅ Правильно: ${correctCount}\n` +
    `❌ Ошибок: ${wrongCount}\n`;

  if (skippedCount > 0) text += `⏭ Пропущено: ${skippedCount}\n`;

  const answeredCount = correctCount + wrongCount;
  if (answeredCount > 0) {
    text += `\n🎯 Точность: <b>${accuracy}%</b>\n`;
  }

  const errors = questions.filter((q) => q.question.result === 'wrong');
  if (errors.length > 0) {
    text += `\n<b>Ошибки:</b>\n`;
    for (const { word, question } of errors) {
      const asked = question.direction === 'en_to_ru' ? word.english_word : word.russian_translation;
      text += `• <b>${asked}</b> → ${question.correct_answer}`;
      if (question.user_answer) text += ` <i>(ты: ${question.user_answer})</i>`;
      text += '\n';
    }
  }

  // Промо-блок для незакупивших
  if (showBuyPromo) {
    text +=
      `\n\n🎁 <b>Словарный запас — в подарок с курсом!</b>\n` +
      `Купи курс «Английский за 30 дней» и получи:\n` +
      `• Неограниченные тесты\n` +
      `• Повторение ошибок\n` +
      `• 500+ слов с примерами и уровнями (A1–C2)\n` +
      `• Прогресс и статистика\n\n` +
      `💳 <b>Всего 500 ₽</b>`;
  }

  const kb = showBuyPromo
    ? buyCourseKeyboard()
    : summaryKeyboard(summary.sessionId, errors.length > 0);

  await sendScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: kb,
  });
}

// ─── Статистика ───────────────────────────────────────────────────────────────

export async function handleVocabStats(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const settings = getUserSettings(telegramId);
  const stats = getUserVocabStats(telegramId, settings.difficulty);

  let text =
    `📊 <b>Мой прогресс — Словарный запас (${settings.difficulty})</b>\n\n` +
    `📖 Изучено слов уровня: ${stats.seenWords}\n` +
    `✅ Усвоено: ${stats.masteredWords}\n` +
    `🧠 Тестов пройдено: ${stats.completedSessions}\n`;

  if (stats.totalAnswers > 0) {
    text +=
      `\nОтветов всего: ${stats.totalAnswers}\n` +
      `✅ Верных: ${stats.correctAnswers}\n` +
      `❌ Ошибок: ${stats.wrongAnswers}\n` +
      `🎯 Точность: <b>${stats.accuracy}%</b>\n`;
  }

  if (stats.wordsNeedingReview.length > 0) {
    text += `\n<b>Нужно повторить на уровне ${settings.difficulty}:</b>\n`;
    for (const w of stats.wordsNeedingReview.slice(0, 5)) {
      text += `• ${w.english_word} — ${w.russian_translation} (${w.wrong_answers} ош.)\n`;
    }
    if (stats.wordsNeedingReview.length > 5) {
      text += `<i>...и ещё ${stats.wordsNeedingReview.length - 5} слов</i>\n`;
    }
  }

  await editScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: backToVocabMenuKeyboard(),
  });
}

// ─── Настройки ────────────────────────────────────────────────────────────────

export async function handleVocabSettings(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const settings = getUserSettings(telegramId);

  const diffNames: Record<string, string> = {
    'A1-A2': 'A1–A2 (Начальный: базовые слова)',
    'B1-B2': 'B1–B2 (Средний: речь, работа, путешествия)',
    'C1-C2': 'C1–C2 (Продвинутый: сложная лексика, идиомы)',
  };
  const directionText = settings.direction === 'en_to_ru'
    ? '🇬🇧→🇷🇺 Английское → Русский'
    : '🇷🇺→🇬🇧 Русский → Английское';
  const modeText: Record<string, string> = {
    test: 'Тест (выбор из вариантов)',
    written: 'Письменно (вводишь текст)',
    alternating: 'Чередование (тест + письменный)',
  };

  const text =
    `⚙️ <b>Настройки обучения</b>\n\n` +
    `📊 Уровень сложности: <b>${diffNames[settings.difficulty] ?? settings.difficulty}</b>\n` +
    `📐 Направление: ${directionText}\n` +
    `📝 Способ ответа: ${modeText[settings.answer_mode]}\n\n` +
    `Выбери нужные параметры:`;

  await editScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: settingsKeyboard(settings.direction, settings.answer_mode, settings.difficulty),
  });
}

export async function handleSetDifficulty(
  ctx: BotContext,
  difficulty: 'A1-A2' | 'B1-B2' | 'C1-C2',
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery('Уровень изменён ✓');
  updateUserSettings(telegramId, { difficulty });
  if (!isVocabOnboarded(telegramId)) {
    await handleVocabOnboarding(ctx);
  } else {
    await handleVocabSettings(ctx);
  }
}

export async function handleSetDirection(
  ctx: BotContext,
  direction: 'en_to_ru' | 'ru_to_en',
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery('Сохранено ✓');
  updateUserSettings(telegramId, { direction });
  if (!isVocabOnboarded(telegramId)) {
    await handleVocabOnboarding(ctx);
  } else {
    await handleVocabSettings(ctx);
  }
}

export async function handleSetMode(
  ctx: BotContext,
  mode: 'test' | 'written' | 'alternating',
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery('Сохранено ✓');
  updateUserSettings(telegramId, { answer_mode: mode });
  if (!isVocabOnboarded(telegramId)) {
    await handleVocabOnboarding(ctx);
  } else {
    await handleVocabSettings(ctx);
  }
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function parseJsonArray(s: string): string[] {
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
