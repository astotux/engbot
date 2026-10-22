/**
 * Репозиторий для работы с таблицами словарного запаса.
 */
import { getDb } from '../connection.js';

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface VocabWord {
  id: number;
  english_word: string;
  russian_translation: string;
  accepted_translations: string; // JSON string
  example_en: string | null;
  example_ru: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface UserVocab {
  id: number;
  telegram_id: number;
  word_id: number;
  seen_at: string;
  attempts: number;
  correct_answers: number;
  wrong_answers: number;
  last_attempt_at: string | null;
  mastered: number;
  mastered_at: string | null;
  next_review_at: string | null;
}

export interface VocabSession {
  id: number;
  telegram_id: number;
  session_type: 'study' | 'quiz' | 'review_errors';
  status: 'active' | 'completed' | 'cancelled';
  settings_json: string;
  started_at: string;
  completed_at: string | null;
  total_questions: number | null;
  correct_count: number | null;
  wrong_count: number | null;
  skipped_count: number | null;
}

export interface VocabQuestion {
  id: number;
  session_id: number;
  word_id: number;
  question_order: number;
  question_type: 'test' | 'written';
  direction: 'en_to_ru' | 'ru_to_en';
  options_json: string; // JSON array
  correct_answer: string;
  user_answer: string | null;
  user_answer_normalized: string | null;
  result: 'correct' | 'wrong' | 'skipped' | null;
  status: 'pending' | 'answered' | 'skipped';
  answered_at: string | null;
}

export interface VocabUserSettings {
  telegram_id: number;
  direction: 'en_to_ru' | 'ru_to_en';
  answer_mode: 'test' | 'written' | 'alternating';
  alt_next: 'test' | 'written';
  updated_at: string;
}

// ─── Слова ───────────────────────────────────────────────────────────────────

export function getAllActiveWords(): VocabWord[] {
  return getDb()
    .prepare('SELECT * FROM vocabulary_words WHERE is_active = 1 ORDER BY id')
    .all() as VocabWord[];
}

export function getWordById(id: number): VocabWord | undefined {
  return getDb()
    .prepare('SELECT * FROM vocabulary_words WHERE id = ?')
    .get(id) as VocabWord | undefined;
}

export function getWordsByIds(ids: number[]): VocabWord[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return getDb()
    .prepare(`SELECT * FROM vocabulary_words WHERE id IN (${placeholders})`)
    .all(...ids) as VocabWord[];
}

export function insertWord(
  englishWord: string,
  russianTranslation: string,
  acceptedTranslations: string[] = [],
  exampleEn: string | null = null,
  exampleRu: string | null = null,
): VocabWord {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO vocabulary_words (english_word, russian_translation, accepted_translations, example_en, example_ru)
    VALUES (?, ?, ?, ?, ?)
  `).run(englishWord, russianTranslation, JSON.stringify(acceptedTranslations), exampleEn, exampleRu);
  return getWordById(result.lastInsertRowid as number)!;
}

export function countActiveWords(): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM vocabulary_words WHERE is_active = 1')
    .get() as { cnt: number };
  return row.cnt;
}

/** Получить случайные слова для неправильных вариантов (исключая конкретные id) */
export function getRandomWordsExcluding(excludeIds: number[], limit: number): VocabWord[] {
  if (excludeIds.length === 0) {
    return getDb()
      .prepare('SELECT * FROM vocabulary_words WHERE is_active = 1 ORDER BY RANDOM() LIMIT ?')
      .all(limit) as VocabWord[];
  }
  const placeholders = excludeIds.map(() => '?').join(',');
  return getDb()
    .prepare(`SELECT * FROM vocabulary_words WHERE is_active = 1 AND id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`)
    .all(...excludeIds, limit) as VocabWord[];
}

// ─── Прогресс пользователя по словам ─────────────────────────────────────────

export function getUserVocab(telegramId: number, wordId: number): UserVocab | undefined {
  return getDb()
    .prepare('SELECT * FROM user_vocabulary WHERE telegram_id = ? AND word_id = ?')
    .get(telegramId, wordId) as UserVocab | undefined;
}

/** Получить все слова, которые пользователь уже видел */
export function getSeenWordIds(telegramId: number): number[] {
  const rows = getDb()
    .prepare('SELECT word_id FROM user_vocabulary WHERE telegram_id = ?')
    .all(telegramId) as Array<{ word_id: number }>;
  return rows.map((r) => r.word_id);
}

/** Получить слова, которые пользователь видел но ещё не усвоил */
export function getUnmasteredSeenWordIds(telegramId: number): number[] {
  const rows = getDb()
    .prepare('SELECT word_id FROM user_vocabulary WHERE telegram_id = ? AND mastered = 0')
    .all(telegramId) as Array<{ word_id: number }>;
  return rows.map((r) => r.word_id);
}

/** Отметить слово как увиденное (если ещё не отмечено) */
export function markWordSeen(telegramId: number, wordId: number): void {
  getDb().prepare(`
    INSERT OR IGNORE INTO user_vocabulary (telegram_id, word_id)
    VALUES (?, ?)
  `).run(telegramId, wordId);
}

/** Обновить статистику ответа по слову */
export function recordWordAnswer(
  telegramId: number,
  wordId: number,
  isCorrect: boolean,
): void {
  const db = getDb();
  // Гарантируем запись
  markWordSeen(telegramId, wordId);

  if (isCorrect) {
    db.prepare(`
      UPDATE user_vocabulary SET
        attempts = attempts + 1,
        correct_answers = correct_answers + 1,
        last_attempt_at = datetime('now'),
        next_review_at = datetime('now', '+3 days')
      WHERE telegram_id = ? AND word_id = ?
    `).run(telegramId, wordId);
  } else {
    db.prepare(`
      UPDATE user_vocabulary SET
        attempts = attempts + 1,
        wrong_answers = wrong_answers + 1,
        last_attempt_at = datetime('now'),
        next_review_at = datetime('now', '+1 day')
      WHERE telegram_id = ? AND word_id = ?
    `).run(telegramId, wordId);
  }

  // Проверяем, не стало ли слово усвоенным (accuracy >= 0.75 при attempts >= 4)
  const uv = getUserVocab(telegramId, wordId);
  if (uv && !uv.mastered && uv.attempts >= 4) {
    const accuracy = uv.correct_answers / uv.attempts;
    if (accuracy >= 0.75) {
      db.prepare(`
        UPDATE user_vocabulary SET mastered = 1, mastered_at = datetime('now')
        WHERE telegram_id = ? AND word_id = ?
      `).run(telegramId, wordId);
    }
  }
}

/** Слова с ошибками для повторения (приоритет: много ошибок + недавняя ошибка) */
export function getErrorWordIds(telegramId: number, limit: number): number[] {
  const rows = getDb()
    .prepare(`
      SELECT uv.word_id
      FROM user_vocabulary uv
      WHERE uv.telegram_id = ?
        AND uv.wrong_answers > 0
        AND uv.mastered = 0
      ORDER BY uv.wrong_answers DESC, uv.last_attempt_at DESC
      LIMIT ?
    `)
    .all(telegramId, limit) as Array<{ word_id: number }>;
  return rows.map((r) => r.word_id);
}

export function countSeenWords(telegramId: number): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM user_vocabulary WHERE telegram_id = ?')
    .get(telegramId) as { cnt: number };
  return row.cnt;
}

export function countMasteredWords(telegramId: number): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM user_vocabulary WHERE telegram_id = ? AND mastered = 1')
    .get(telegramId) as { cnt: number };
  return row.cnt;
}

export function countErrorWords(telegramId: number): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as cnt FROM user_vocabulary WHERE telegram_id = ? AND wrong_answers > 0 AND mastered = 0')
    .get(telegramId) as { cnt: number };
  return row.cnt;
}

// ─── Сессии ───────────────────────────────────────────────────────────────────

export function createSession(
  telegramId: number,
  sessionType: VocabSession['session_type'],
  settingsJson: string,
): VocabSession {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO vocabulary_sessions (telegram_id, session_type, settings_json)
    VALUES (?, ?, ?)
  `).run(telegramId, sessionType, settingsJson);
  return db.prepare('SELECT * FROM vocabulary_sessions WHERE id = ?')
    .get(result.lastInsertRowid as number) as VocabSession;
}

export function getSession(sessionId: number): VocabSession | undefined {
  return getDb()
    .prepare('SELECT * FROM vocabulary_sessions WHERE id = ?')
    .get(sessionId) as VocabSession | undefined;
}

export function getActiveSession(telegramId: number): VocabSession | undefined {
  return getDb()
    .prepare("SELECT * FROM vocabulary_sessions WHERE telegram_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1")
    .get(telegramId) as VocabSession | undefined;
}

export function completeSession(
  sessionId: number,
  totalQuestions: number,
  correctCount: number,
  wrongCount: number,
  skippedCount: number,
): void {
  getDb().prepare(`
    UPDATE vocabulary_sessions SET
      status = 'completed',
      completed_at = datetime('now'),
      total_questions = ?,
      correct_count = ?,
      wrong_count = ?,
      skipped_count = ?
    WHERE id = ?
  `).run(totalQuestions, correctCount, wrongCount, skippedCount, sessionId);
}

export function cancelSession(sessionId: number): void {
  getDb().prepare(`
    UPDATE vocabulary_sessions SET status = 'cancelled', completed_at = datetime('now')
    WHERE id = ?
  `).run(sessionId);
}

/** Отменить все активные сессии пользователя (перед стартом новой) */
export function cancelUserActiveSessions(telegramId: number): void {
  getDb().prepare(`
    UPDATE vocabulary_sessions SET status = 'cancelled', completed_at = datetime('now')
    WHERE telegram_id = ? AND status = 'active'
  `).run(telegramId);
}

export function countCompletedSessions(telegramId: number): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as cnt FROM vocabulary_sessions WHERE telegram_id = ? AND status = 'completed'")
    .get(telegramId) as { cnt: number };
  return row.cnt;
}

// ─── Вопросы сессии ───────────────────────────────────────────────────────────

export function insertQuestion(
  sessionId: number,
  wordId: number,
  order: number,
  questionType: 'test' | 'written',
  direction: 'en_to_ru' | 'ru_to_en',
  options: string[],
  correctAnswer: string,
): VocabQuestion {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO vocabulary_session_questions
      (session_id, word_id, question_order, question_type, direction, options_json, correct_answer)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, wordId, order, questionType, direction, JSON.stringify(options), correctAnswer);
  return db.prepare('SELECT * FROM vocabulary_session_questions WHERE id = ?')
    .get(result.lastInsertRowid as number) as VocabQuestion;
}

export function getQuestion(questionId: number): VocabQuestion | undefined {
  return getDb()
    .prepare('SELECT * FROM vocabulary_session_questions WHERE id = ?')
    .get(questionId) as VocabQuestion | undefined;
}

export function getSessionQuestions(sessionId: number): VocabQuestion[] {
  return getDb()
    .prepare('SELECT * FROM vocabulary_session_questions WHERE session_id = ? ORDER BY question_order')
    .all(sessionId) as VocabQuestion[];
}

export function getCurrentQuestion(sessionId: number): VocabQuestion | undefined {
  return getDb()
    .prepare("SELECT * FROM vocabulary_session_questions WHERE session_id = ? AND status = 'pending' ORDER BY question_order LIMIT 1")
    .get(sessionId) as VocabQuestion | undefined;
}

export function answerQuestion(
  questionId: number,
  rawAnswer: string,
  normalizedAnswer: string,
  result: 'correct' | 'wrong',
): void {
  getDb().prepare(`
    UPDATE vocabulary_session_questions SET
      user_answer = ?,
      user_answer_normalized = ?,
      result = ?,
      status = 'answered',
      answered_at = datetime('now')
    WHERE id = ?
  `).run(rawAnswer, normalizedAnswer, result, questionId);
}

export function skipQuestion(questionId: number): void {
  getDb().prepare(`
    UPDATE vocabulary_session_questions SET
      result = 'skipped',
      status = 'skipped',
      answered_at = datetime('now')
    WHERE id = ?
  `).run(questionId);
}

// ─── История ответов ──────────────────────────────────────────────────────────

export function insertAnswerHistory(
  telegramId: number,
  wordId: number,
  sessionId: number,
  questionId: number,
  rawAnswer: string,
  result: 'correct' | 'wrong',
  answerType: 'test' | 'written',
  direction: 'en_to_ru' | 'ru_to_en',
): void {
  getDb().prepare(`
    INSERT INTO vocabulary_answer_history
      (telegram_id, word_id, session_id, question_id, raw_answer, result, answer_type, direction)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(telegramId, wordId, sessionId, questionId, rawAnswer, result, answerType, direction);
}

export function getTotalAnswerStats(telegramId: number): { total: number; correct: number; wrong: number } {
  const row = getDb().prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) as correct,
      SUM(CASE WHEN result = 'wrong' THEN 1 ELSE 0 END) as wrong
    FROM vocabulary_answer_history
    WHERE telegram_id = ?
  `).get(telegramId) as { total: number; correct: number; wrong: number };
  return {
    total: row.total ?? 0,
    correct: row.correct ?? 0,
    wrong: row.wrong ?? 0,
  };
}

/** Слова, которые нужно повторить (ошибки), с деталями для прогресс-экрана */
export function getWordsNeedingReview(telegramId: number, limit = 10): Array<{ word_id: number; english_word: string; russian_translation: string; wrong_answers: number }> {
  return getDb().prepare(`
    SELECT uv.word_id, vw.english_word, vw.russian_translation, uv.wrong_answers
    FROM user_vocabulary uv
    JOIN vocabulary_words vw ON vw.id = uv.word_id
    WHERE uv.telegram_id = ? AND uv.wrong_answers > 0 AND uv.mastered = 0
    ORDER BY uv.wrong_answers DESC
    LIMIT ?
  `).all(telegramId, limit) as Array<{ word_id: number; english_word: string; russian_translation: string; wrong_answers: number }>;
}

// ─── Настройки пользователя ───────────────────────────────────────────────────

export function getUserSettings(telegramId: number): VocabUserSettings {
  const existing = getDb()
    .prepare('SELECT * FROM vocabulary_user_settings WHERE telegram_id = ?')
    .get(telegramId) as VocabUserSettings | undefined;

  if (existing) return existing;

  // Создаём дефолтные настройки
  getDb().prepare(`
    INSERT OR IGNORE INTO vocabulary_user_settings (telegram_id)
    VALUES (?)
  `).run(telegramId);

  return getDb()
    .prepare('SELECT * FROM vocabulary_user_settings WHERE telegram_id = ?')
    .get(telegramId) as VocabUserSettings;
}

export function updateUserSettings(
  telegramId: number,
  patch: Partial<Pick<VocabUserSettings, 'direction' | 'answer_mode' | 'alt_next'>>,
): void {
  const db = getDb();
  // Гарантируем запись
  getUserSettings(telegramId);

  const updates: string[] = [];
  const values: unknown[] = [];

  if (patch.direction !== undefined) {
    updates.push('direction = ?');
    values.push(patch.direction);
  }
  if (patch.answer_mode !== undefined) {
    updates.push('answer_mode = ?');
    values.push(patch.answer_mode);
    // Сброс alt_next при смене режима
    if (patch.answer_mode === 'alternating') {
      updates.push('alt_next = ?');
      values.push('test');
    }
  }
  if (patch.alt_next !== undefined) {
    updates.push('alt_next = ?');
    values.push(patch.alt_next);
  }

  if (updates.length === 0) return;
  updates.push("updated_at = datetime('now')");
  values.push(telegramId);

  db.prepare(`UPDATE vocabulary_user_settings SET ${updates.join(', ')} WHERE telegram_id = ?`)
    .run(...values);
}

/** Переключить alt_next после использования */
export function flipAltNext(telegramId: number): void {
  const s = getUserSettings(telegramId);
  const next = s.alt_next === 'test' ? 'written' : 'test';
  updateUserSettings(telegramId, { alt_next: next });
}
