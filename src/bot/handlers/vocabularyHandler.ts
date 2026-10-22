/**
 * Хендлеры раздела «Словарный запас».
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
  getSession,
  getWordById,
} from '../../services/vocabularyService.js';
import {
  getAllActiveWords,
  getSeenWordIds,
  countActiveWords,
  countErrorWords,
  getCurrentQuestion,
  getSessionQuestions,
} from '../../db/repositories/vocabulary.js';
import {
  vocabMenuKeyboard,
  afterStudyKeyboard,
  testQuestionKeyboard,
  writtenQuestionKeyboard,
  nextQuestionKeyboard,
  summaryKeyboard,
  settingsKeyboard,
  backToVocabMenuKeyboard,
} from '../keyboards/vocabularyKeyboards.js';
import { sendScreen, sendEphemeral } from '../sendHelper.js';
import type { SessionSummary, VocabQuestion } from '../../services/vocabularyService.js';

// ─── Главное меню словаря ─────────────────────────────────────────────────────

export async function handleVocabMenu(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const totalWords = countActiveWords();
  const seenCount = getSeenWordIds(telegramId).length;
  void getAllActiveWords; // импортируется для использования в sendQuestion через getWordById

  await sendScreen(
    ctx,
    `📖 <b>Словарный запас</b>\n\n` +
    `Слов в базе: ${totalWords}\n` +
    `Ты изучил(а): ${seenCount} из ${totalWords}\n\n` +
    `Выбери действие:`,
    { parse_mode: 'HTML', reply_markup: vocabMenuKeyboard() },
  );
}

// ─── Режим изучения ───────────────────────────────────────────────────────────

export async function handleVocabStudy(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const { words } = startStudySession(telegramId);

  if (words.length === 0) {
    await sendScreen(
      ctx,
      '📭 Все слова уже изучены! Попробуй проверить знания.',
      { reply_markup: vocabMenuKeyboard() },
    );
    return;
  }

  // Отправляем слова последовательно — формируем один длинный текст
  let text = `📚 <b>Изучаем ${words.length} слов</b>\n\n`;
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

export async function handleVocabQuiz(ctx: BotContext, sessionType: 'quiz' | 'review_errors' = 'quiz'): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  if (sessionType === 'review_errors') {
    const errorCount = countErrorWords(telegramId);
    if (errorCount === 0) {
      await sendScreen(
        ctx,
        '🎉 Отличная работа! У тебя нет ошибок для повторения.\n\nМожешь изучить новые слова или пройти обычный тест.',
        { reply_markup: vocabMenuKeyboard() },
      );
      return;
    }
  } else {
    const seenCount = getSeenWordIds(telegramId).length;
    if (seenCount === 0) {
      await sendScreen(
        ctx,
        '📚 Ты ещё не изучал(а) слова. Сначала познакомься с первыми 10 словами!',
        { reply_markup: vocabMenuKeyboard() },
      );
      return;
    }
  }

  const result = startQuizSession(telegramId, sessionType);

  if ('error' in result) {
    await sendScreen(
      ctx,
      '📭 Нет слов для проверки. Сначала изучи слова!',
      { reply_markup: vocabMenuKeyboard() },
    );
    return;
  }

  const { session, firstQuestion, totalQuestions } = result;

  // Сохраняем активную сессию в контексте
  ctx.session.vocabSessionId = session.id;
  ctx.session.vocabAwaitingAnswer = undefined;

  await sendScreen(
    ctx,
    `🧠 <b>${sessionType === 'review_errors' ? 'Повторение ошибок' : 'Проверка знаний'}</b>\n\n` +
    `Вопросов: ${totalQuestions}`,
    { parse_mode: 'HTML' },
  );

  await sendQuestion(ctx, firstQuestion, 1, totalQuestions);
}

// ─── Отправка вопроса ────────────────────────────────────────────────────────

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
    // Сигнализируем, что ждём текстовый ответ
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

  if (isCorrect) {
    await sendEphemeral(ctx, `✅ <b>Правильно!</b>\n\n<i>${word.english_word} — ${word.russian_translation}</i>`, {
      parse_mode: 'HTML',
    });
  } else {
    await sendEphemeral(
      ctx,
      `❌ <b>Неверно.</b>\nПравильный ответ: <b>${correctAnswer}</b>\n\n<i>${word.english_word} — ${word.russian_translation}</i>`,
      { parse_mode: 'HTML' },
    );
  }

  if (sessionDone && summary) {
    // Небольшая задержка не нужна — просто отправляем итоги
    await sendSummary(ctx, summary);
    ctx.session.vocabSessionId = undefined;
    ctx.session.vocabAwaitingAnswer = undefined;
  } else if (nextQuestion) {
    const questions = getSessionQuestions(sessionId);
    const answeredCount = questions.filter((q) => q.status !== 'pending').length;
    const totalQuestions = questions.length;
    // Кнопка «Следующий»
    await sendScreen(
      ctx,
      `Ответ принят. Нажми «Следующий» чтобы продолжить.`,
      { reply_markup: nextQuestionKeyboard(sessionId, questionId) },
    );
    void answeredCount;
    void totalQuestions;
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
    await sendScreen(ctx, '⚠️ Тест уже завершён.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  const nextQ = getCurrentQuestion(sessionId);
  if (!nextQ) {
    // Все отвечены
    const summary = buildSummary(sessionId);
    await sendSummary(ctx, summary);
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
    await sendScreen(ctx, '⚠️ Тест уже завершён.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  const allQuestions = getSessionQuestions(sessionId);
  const answeredCount = allQuestions.filter((q) => q.status !== 'pending').length;

  if (answeredCount === 0) {
    // Ни одного ответа — спрашиваем подтверждение через inline
    const { InlineKeyboard } = await import('grammy');
    const confirmKb = new InlineKeyboard()
      .text('✅ Да, завершить', `vocab:finish_confirm:${sessionId}`)
      .text('❌ Отмена', `vocab:next:${sessionId}:0`);
    await sendScreen(ctx, '⚠️ Ты ещё не ответил(а) ни на один вопрос. Завершить тест?', {
      reply_markup: confirmKb,
    });
    return;
  }

  const summary = finishSessionEarly(sessionId);
  if (!summary) {
    await sendScreen(ctx, '⚠️ Не удалось завершить тест.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  ctx.session.vocabAwaitingAnswer = undefined;
  ctx.session.vocabSessionId = undefined;
  await sendSummary(ctx, summary);
}

export async function handleFinishConfirm(ctx: BotContext, sessionId: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const summary = finishSessionEarly(sessionId);
  ctx.session.vocabAwaitingAnswer = undefined;
  ctx.session.vocabSessionId = undefined;

  if (!summary) {
    await sendScreen(ctx, '⚠️ Не удалось завершить тест.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  await sendSummary(ctx, summary);
}

// ─── Callback: повторить тест ─────────────────────────────────────────────────

export async function handleRestartSession(ctx: BotContext, sessionId: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery();

  const result = restartSession(telegramId, sessionId);

  if ('error' in result) {
    await sendScreen(ctx, '⚠️ Не удалось повторить тест.', { reply_markup: vocabMenuKeyboard() });
    return;
  }

  const { session, firstQuestion, totalQuestions } = result;
  ctx.session.vocabSessionId = session.id;
  ctx.session.vocabAwaitingAnswer = undefined;

  await sendScreen(ctx, `🔄 <b>Повтор теста</b>\n\nВопросов: ${totalQuestions}`, { parse_mode: 'HTML' });
  await sendQuestion(ctx, firstQuestion, 1, totalQuestions);
}

// ─── Страница итогов ──────────────────────────────────────────────────────────

async function sendSummary(ctx: BotContext, summary: SessionSummary): Promise<void> {
  const { totalQuestions, correctCount, wrongCount, skippedCount, accuracy, questions } = summary;

  let text =
    `🏆 <b>Результаты</b>\n\n` +
    `Вопросов: ${totalQuestions}\n` +
    `✅ Правильно: ${correctCount}\n` +
    `❌ Ошибок: ${wrongCount}\n`;

  if (skippedCount > 0) text += `⏭ Пропущено: ${skippedCount}\n`;

  const answeredCount = correctCount + wrongCount;
  if (answeredCount > 0) {
    text += `\n🎯 Точность: <b>${accuracy}%</b>\n`;
  }

  // Ошибки
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

  await sendScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: summaryKeyboard(summary.sessionId, errors.length > 0),
  });
}

// ─── Статистика ───────────────────────────────────────────────────────────────

export async function handleVocabStats(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const stats = getUserVocabStats(telegramId);

  let text =
    `📊 <b>Мой прогресс — Словарный запас</b>\n\n` +
    `📖 Изучено слов: ${stats.seenWords}\n` +
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
    text += `\n<b>Нужно повторить:</b>\n`;
    for (const w of stats.wordsNeedingReview.slice(0, 5)) {
      text += `• ${w.english_word} — ${w.russian_translation} (${w.wrong_answers} ош.)\n`;
    }
    if (stats.wordsNeedingReview.length > 5) {
      text += `<i>...и ещё ${stats.wordsNeedingReview.length - 5} слов</i>\n`;
    }
  }

  await sendScreen(ctx, text, {
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
    `📐 Направление: ${directionText}\n` +
    `📝 Способ ответа: ${modeText[settings.answer_mode]}\n\n` +
    `Выбери нужные параметры:`;

  await sendScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: settingsKeyboard(settings.direction, settings.answer_mode),
  });
}

export async function handleSetDirection(
  ctx: BotContext,
  direction: 'en_to_ru' | 'ru_to_en',
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery('Сохранено');

  updateUserSettings(telegramId, { direction });
  await handleVocabSettings(ctx);
}

export async function handleSetMode(
  ctx: BotContext,
  mode: 'test' | 'written' | 'alternating',
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  await ctx.answerCallbackQuery('Сохранено');

  updateUserSettings(telegramId, { answer_mode: mode });
  await handleVocabSettings(ctx);
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
