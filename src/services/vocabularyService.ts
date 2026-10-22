/**
 * Сервис словарного запаса.
 * Отвечает за логику выбора слов, формирование вопросов, проверку ответов.
 */
import {
  getAllActiveWords,
  getWordById,
  getWordsByIds,
  getSeenWordIds,
  getUnmasteredSeenWordIds,
  getErrorWordIds,
  markWordSeen,
  recordWordAnswer,
  createSession,
  getSession,
  completeSession,
  cancelUserActiveSessions,
  insertQuestion,
  getSessionQuestions,
  getCurrentQuestion,
  answerQuestion,
  skipQuestion,
  insertAnswerHistory,
  getUserSettings,
  updateUserSettings,
  type VocabWord,
  type VocabSession,
  type VocabQuestion,
  type VocabUserSettings,
} from '../db/repositories/vocabulary.js';

export type { VocabWord, VocabSession, VocabQuestion, VocabUserSettings };

const QUESTIONS_PER_SESSION = 10;

// ─── Нормализация ответа ──────────────────────────────────────────────────────

export function normalizeAnswer(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

/** Допустимые переводы слова (основной + accepted_translations) */
export function getAcceptedAnswers(word: VocabWord, direction: 'en_to_ru' | 'ru_to_en'): string[] {
  if (direction === 'en_to_ru') {
    const extra = parseJson<string[]>(word.accepted_translations, []);
    return [word.russian_translation, ...extra].filter(Boolean);
  } else {
    // Для ru_to_en правильный ответ — английское слово
    return [word.english_word];
  }
}

export function checkAnswer(
  word: VocabWord,
  direction: 'en_to_ru' | 'ru_to_en',
  userInput: string,
): boolean {
  const accepted = getAcceptedAnswers(word, direction);
  const normalized = normalizeAnswer(userInput);
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}

// ─── Выбор слов для занятия ───────────────────────────────────────────────────

export interface PickWordsResult {
  words: VocabWord[];
  /** Слова, которых пользователь ещё не видел */
  newCount: number;
}

export function pickStudyWords(telegramId: number): PickWordsResult {
  const seenIds = new Set(getSeenWordIds(telegramId));
  const allWords = getAllActiveWords();
  const newWords = allWords.filter((w) => !seenIds.has(w.id));

  const picked: VocabWord[] = [];

  // Сначала берём новые слова
  const shuffledNew = shuffle(newWords);
  for (const w of shuffledNew) {
    if (picked.length >= QUESTIONS_PER_SESSION) break;
    picked.push(w);
  }
  const newCount = picked.length;

  // Если новых не хватает — дополняем невыученными
  if (picked.length < QUESTIONS_PER_SESSION) {
    const unmasteredIds = getUnmasteredSeenWordIds(telegramId);
    const pickedIds = new Set(picked.map((w) => w.id));
    const extra = getWordsByIds(unmasteredIds.filter((id) => !pickedIds.has(id)));
    for (const w of shuffle(extra)) {
      if (picked.length >= QUESTIONS_PER_SESSION) break;
      picked.push(w);
    }
  }

  return { words: picked, newCount };
}

export function pickQuizWords(telegramId: number): VocabWord[] {
  const seenIds = getSeenWordIds(telegramId);
  if (seenIds.length === 0) return [];

  // Слова с ошибками — выше приоритет
  const errorIds = getErrorWordIds(telegramId, QUESTIONS_PER_SESSION);
  const errorWords = getWordsByIds(errorIds);
  const picked = new Map<number, VocabWord>();
  for (const w of errorWords) picked.set(w.id, w);

  // Добавляем остальные увиденные слова
  if (picked.size < QUESTIONS_PER_SESSION) {
    const rest = shuffle(getWordsByIds(seenIds.filter((id) => !picked.has(id))));
    for (const w of rest) {
      if (picked.size >= QUESTIONS_PER_SESSION) break;
      picked.set(w.id, w);
    }
  }

  return shuffle(Array.from(picked.values()));
}

export function pickReviewWords(telegramId: number): VocabWord[] {
  const errorIds = getErrorWordIds(telegramId, QUESTIONS_PER_SESSION);
  return getWordsByIds(errorIds);
}

// ─── Варианты ответа для теста ────────────────────────────────────────────────

function buildDistractors(
  correctWord: VocabWord,
  allWords: VocabWord[],
  direction: 'en_to_ru' | 'ru_to_en',
  count = 3,
): string[] {
  const correctAnswer = direction === 'en_to_ru'
    ? correctWord.russian_translation
    : correctWord.english_word;
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  // Пул слов-кандидатов (не совпадающих с правильным)
  const candidates = shuffle(allWords.filter((w) => {
    const answer = direction === 'en_to_ru' ? w.russian_translation : w.english_word;
    return normalizeAnswer(answer) !== normalizedCorrect && w.id !== correctWord.id;
  }));

  const distractors: string[] = [];
  const usedNormalized = new Set([normalizedCorrect]);

  for (const w of candidates) {
    if (distractors.length >= count) break;
    const answer = direction === 'en_to_ru' ? w.russian_translation : w.english_word;
    const norm = normalizeAnswer(answer);
    if (!usedNormalized.has(norm)) {
      usedNormalized.add(norm);
      distractors.push(answer);
    }
  }

  return distractors;
}

export function buildTestOptions(
  correctWord: VocabWord,
  direction: 'en_to_ru' | 'ru_to_en',
): { options: string[]; correctAnswer: string } | null {
  const correctAnswer = direction === 'en_to_ru'
    ? correctWord.russian_translation
    : correctWord.english_word;
  const allWords = getAllActiveWords();
  const distractors = buildDistractors(correctWord, allWords, direction, 3);

  if (distractors.length < 3) return null; // недостаточно вариантов

  const options = shuffle([correctAnswer, ...distractors]);
  return { options, correctAnswer };
}

// ─── Запуск занятий ───────────────────────────────────────────────────────────

export interface StartSessionResult {
  session: VocabSession;
  firstQuestion: VocabQuestion;
  totalQuestions: number;
}

export function startStudySession(telegramId: number): { words: VocabWord[] } {
  // Отменяем активные сессии
  cancelUserActiveSessions(telegramId);

  const { words } = pickStudyWords(telegramId);
  // Отмечаем слова как увиденные
  for (const w of words) markWordSeen(telegramId, w.id);

  return { words };
}

export function startQuizSession(
  telegramId: number,
  sessionType: VocabSession['session_type'] = 'quiz',
  words?: VocabWord[],
): StartSessionResult | { error: 'no_words' } {
  const selectedWords = words ?? (sessionType === 'review_errors'
    ? pickReviewWords(telegramId)
    : pickQuizWords(telegramId));

  if (selectedWords.length === 0) return { error: 'no_words' };

  cancelUserActiveSessions(telegramId);

  const settings = getUserSettings(telegramId);
  const session = createSession(telegramId, sessionType, JSON.stringify({
    direction: settings.direction,
    answer_mode: settings.answer_mode,
  }));

  const allWords = getAllActiveWords();
  let altNext = settings.alt_next;

  for (let i = 0; i < selectedWords.length; i++) {
    const word = selectedWords[i];
    const direction = settings.direction;

    // Определяем тип вопроса
    let qType: 'test' | 'written';
    if (settings.answer_mode === 'test') {
      qType = 'test';
    } else if (settings.answer_mode === 'written') {
      qType = 'written';
    } else {
      qType = altNext;
      altNext = altNext === 'test' ? 'written' : 'test';
    }

    let options: string[] = [];
    let correctAnswer: string;

    if (qType === 'test') {
      const built = buildTestOptions(word, direction);
      if (built) {
        options = built.options;
        correctAnswer = built.correctAnswer;
      } else {
        // Нет вариантов — переключаем на письменный
        qType = 'written';
        correctAnswer = direction === 'en_to_ru' ? word.russian_translation : word.english_word;
      }
    } else {
      correctAnswer = direction === 'en_to_ru' ? word.russian_translation : word.english_word;
    }

    insertQuestion(session.id, word.id, i, qType, direction, options, correctAnswer);
    void allWords;
  }

  // Обновляем alt_next в настройках если нужно
  if (settings.answer_mode === 'alternating') {
    updateUserSettings(telegramId, { alt_next: altNext });
  }

  const firstQuestion = getCurrentQuestion(session.id)!;
  return { session, firstQuestion, totalQuestions: selectedWords.length };
}

// ─── Обработка ответа ─────────────────────────────────────────────────────────

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  word: VocabWord;
  nextQuestion: VocabQuestion | null;
  sessionDone: boolean;
  /** Если sessionDone — итоги */
  summary?: SessionSummary;
}

export interface SessionSummary {
  sessionId: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  accuracy: number; // 0–100
  questions: Array<{
    word: VocabWord;
    question: VocabQuestion;
  }>;
}

export function processAnswer(
  telegramId: number,
  sessionId: number,
  questionId: number,
  rawAnswer: string,
): AnswerResult | { error: string } {
  const question = getCurrentQuestion(sessionId);
  if (!question || question.id !== questionId) {
    return { error: 'question_mismatch' };
  }

  const word = getWordById(question.word_id);
  if (!word) return { error: 'word_not_found' };

  const isCorrect = checkAnswer(word, question.direction, rawAnswer);
  const normalized = normalizeAnswer(rawAnswer);
  const result: 'correct' | 'wrong' = isCorrect ? 'correct' : 'wrong';

  answerQuestion(questionId, rawAnswer, normalized, result);
  recordWordAnswer(telegramId, question.word_id, isCorrect);
  insertAnswerHistory(
    telegramId,
    question.word_id,
    sessionId,
    questionId,
    rawAnswer,
    result,
    question.question_type,
    question.direction,
  );

  const nextQuestion = getCurrentQuestion(sessionId);
  const sessionDone = !nextQuestion;

  if (sessionDone) {
    const summary = buildSummary(sessionId);
    completeSession(sessionId, summary.totalQuestions, summary.correctCount, summary.wrongCount, summary.skippedCount);
    return {
      isCorrect,
      correctAnswer: question.correct_answer,
      word,
      nextQuestion: null,
      sessionDone: true,
      summary,
    };
  }

  return {
    isCorrect,
    correctAnswer: question.correct_answer,
    word,
    nextQuestion,
    sessionDone: false,
  };
}

export function buildSummary(sessionId: number): SessionSummary {
  const questions = getSessionQuestions(sessionId);
  const wordIds = [...new Set(questions.map((q) => q.word_id))];
  const words = new Map(getWordsByIds(wordIds).map((w) => [w.id, w]));

  const correctCount = questions.filter((q) => q.result === 'correct').length;
  const wrongCount = questions.filter((q) => q.result === 'wrong').length;
  const skippedCount = questions.filter((q) => q.result === 'skipped').length;
  const answered = correctCount + wrongCount;
  const accuracy = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;

  return {
    sessionId,
    totalQuestions: questions.length,
    correctCount,
    wrongCount,
    skippedCount,
    accuracy,
    questions: questions.map((q) => ({ word: words.get(q.word_id)!, question: q })),
  };
}

// ─── Досрочное завершение ──────────────────────────────────────────────────────

export function finishSessionEarly(sessionId: number): SessionSummary | null {
  const session = getSession(sessionId);
  if (!session || session.status !== 'active') return null;

  // Скипаем все оставшиеся вопросы
  const remaining = getSessionQuestions(sessionId).filter((q) => q.status === 'pending');
  for (const q of remaining) skipQuestion(q.id);

  const summary = buildSummary(sessionId);
  completeSession(sessionId, summary.totalQuestions, summary.correctCount, summary.wrongCount, summary.skippedCount);
  return summary;
}

// ─── Повторное прохождение той же сессии ─────────────────────────────────────

export function restartSession(
  telegramId: number,
  originalSessionId: number,
): StartSessionResult | { error: string } {
  const originalSession = getSession(originalSessionId);
  if (!originalSession) return { error: 'session_not_found' };

  const originalQuestions = getSessionQuestions(originalSessionId);
  if (originalQuestions.length === 0) return { error: 'no_questions' };

  cancelUserActiveSessions(telegramId);

  const settings = parseJson<{ direction: string; answer_mode: string }>(
    originalSession.settings_json,
    { direction: 'en_to_ru', answer_mode: 'test' },
  );

  const newSession = createSession(telegramId, originalSession.session_type, originalSession.settings_json);
  const wordIds = originalQuestions.map((q) => q.word_id);
  const words = new Map(getWordsByIds(wordIds).map((w) => [w.id, w]));

  const direction = settings.direction as 'en_to_ru' | 'ru_to_en';

  for (let i = 0; i < originalQuestions.length; i++) {
    const orig = originalQuestions[i];
    const word = words.get(orig.word_id);
    if (!word) continue;

    let options: string[] = [];

    if (orig.question_type === 'test') {
      // Берём сохранённые варианты и перемешиваем
      const savedOptions = parseJson<string[]>(orig.options_json, []);
      options = shuffle(savedOptions);
    }

    insertQuestion(
      newSession.id,
      orig.word_id,
      i,
      orig.question_type,
      direction,
      options,
      orig.correct_answer,
    );
  }

  const firstQuestion = getCurrentQuestion(newSession.id)!;
  return { session: newSession, firstQuestion, totalQuestions: originalQuestions.length };
}

// ─── Статистика пользователя ──────────────────────────────────────────────────

import {
  countSeenWords,
  countMasteredWords,
  countCompletedSessions,
  getTotalAnswerStats,
  getWordsNeedingReview,
} from '../db/repositories/vocabulary.js';

export interface UserVocabStats {
  seenWords: number;
  masteredWords: number;
  completedSessions: number;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number; // 0–100
  wordsNeedingReview: Array<{ word_id: number; english_word: string; russian_translation: string; wrong_answers: number }>;
}

export function getUserVocabStats(telegramId: number): UserVocabStats {
  const seenWords = countSeenWords(telegramId);
  const masteredWords = countMasteredWords(telegramId);
  const completedSessions = countCompletedSessions(telegramId);
  const { total, correct, wrong } = getTotalAnswerStats(telegramId);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wordsNeedingReview = getWordsNeedingReview(telegramId, 10);

  return {
    seenWords,
    masteredWords,
    completedSessions,
    totalAnswers: total,
    correctAnswers: correct,
    wrongAnswers: wrong,
    accuracy,
    wordsNeedingReview,
  };
}

// ─── Экспорт утилит ───────────────────────────────────────────────────────────

export { getUserSettings, updateUserSettings, getSession, getWordById, getAllActiveWords };

// ─── Вспомогательные функции ──────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseJson<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
