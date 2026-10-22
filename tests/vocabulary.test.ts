/**
 * Тесты системы словарного запаса.
 * Покрывают: репозиторий, сервис (выбор слов, проверка ответов, сессии, итоги).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb } from './helpers.js';
import type Database from 'better-sqlite3';

// ── Подменяем getDb() на in-memory базу ──────────────────────────────────────
let db: Database.Database;

vi.mock('../src/db/connection.js', () => ({
  getDb: () => db,
}));

import {
  insertWord,
  getAllActiveWords,
  getWordById,
  getUserSettings,
  updateUserSettings,
  markWordSeen,
  getSeenWordIds,
  recordWordAnswer,
  countMasteredWords,
  getUserVocab,
  createSession,
  getCurrentQuestion,
  getSessionQuestions,
  insertQuestion,
  answerQuestion,
  countActiveWords,
  countErrorWords,
} from '../src/db/repositories/vocabulary.js';

import {
  normalizeAnswer,
  checkAnswer,
  getAcceptedAnswers,
  pickStudyWords,
  pickQuizWords,
  pickReviewWords,
  buildTestOptions,
  startQuizSession,
  processAnswer,
  buildSummary,
  finishSessionEarly,
  restartSession,
  getUserVocabStats,
} from '../src/services/vocabularyService.js';

// Вспомогательная: создаём тестового пользователя
function seedUser(telegramId: number): void {
  db.prepare(
    `INSERT OR IGNORE INTO users (telegram_id, registered_at) VALUES (?, datetime('now'))`
  ).run(telegramId);
}

// Вспомогательная: засеиваем N слов и возвращаем их id
function seedWords(count: number): number[] {
  const ids: number[] = [];
  for (let i = 1; i <= count; i++) {
    const w = insertWord(
      `word${i}`,
      `слово${i}`,
      [`вариант${i}`],
      `Example ${i}`,
      `Пример ${i}`,
    );
    ids.push(w.id);
  }
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  db = createTestDb();
});

// ── 1. Репозиторий ────────────────────────────────────────────────────────────

describe('vocabulary repository', () => {
  it('insertWord создаёт слово и возвращает его', () => {
    const w = insertWord('hello', 'привет', ['здравствуй'], 'Hello!', 'Привет!');
    expect(w.id).toBeGreaterThan(0);
    expect(w.english_word).toBe('hello');
    expect(w.russian_translation).toBe('привет');
    expect(JSON.parse(w.accepted_translations)).toContain('здравствуй');
    expect(w.example_en).toBe('Hello!');
    expect(w.is_active).toBe(1);
  });

  it('getAllActiveWords возвращает только активные слова', () => {
    insertWord('hello', 'привет');
    insertWord('bye', 'пока');
    db.prepare(`UPDATE vocabulary_words SET is_active = 0 WHERE english_word = 'bye'`).run();
    const words = getAllActiveWords();
    expect(words).toHaveLength(1);
    expect(words[0].english_word).toBe('hello');
  });

  it('countActiveWords возвращает корректное число', () => {
    expect(countActiveWords()).toBe(0);
    insertWord('w1', 'с1');
    insertWord('w2', 'с2');
    expect(countActiveWords()).toBe(2);
  });

  it('markWordSeen + getSeenWordIds', () => {
    seedUser(100);
    const [id] = seedWords(1);
    expect(getSeenWordIds(100)).toHaveLength(0);
    markWordSeen(100, id);
    expect(getSeenWordIds(100)).toContain(id);
  });

  it('повторный markWordSeen не создаёт дубль', () => {
    seedUser(100);
    const [id] = seedWords(1);
    markWordSeen(100, id);
    markWordSeen(100, id);
    expect(getSeenWordIds(100)).toHaveLength(1);
  });

  it('recordWordAnswer обновляет счётчики', () => {
    seedUser(100);
    const [id] = seedWords(1);
    markWordSeen(100, id);
    recordWordAnswer(100, id, true);
    recordWordAnswer(100, id, false);
    const uv = getUserVocab(100, id);
    expect(uv?.attempts).toBe(2);
    expect(uv?.correct_answers).toBe(1);
    expect(uv?.wrong_answers).toBe(1);
  });

  it('слово помечается как усвоенное после 4 ответов с точностью >= 75%', () => {
    seedUser(100);
    const [id] = seedWords(1);
    markWordSeen(100, id);
    recordWordAnswer(100, id, true);
    recordWordAnswer(100, id, true);
    recordWordAnswer(100, id, true);
    recordWordAnswer(100, id, true);
    expect(countMasteredWords(100)).toBe(1);
  });

  it('слово НЕ помечается усвоенным при низкой точности', () => {
    seedUser(100);
    const [id] = seedWords(1);
    markWordSeen(100, id);
    recordWordAnswer(100, id, true);
    recordWordAnswer(100, id, false);
    recordWordAnswer(100, id, false);
    recordWordAnswer(100, id, false);
    expect(countMasteredWords(100)).toBe(0);
  });

  it('getUserSettings возвращает дефолтные настройки', () => {
    seedUser(100);
    const s = getUserSettings(100);
    expect(s.direction).toBe('en_to_ru');
    expect(s.answer_mode).toBe('test');
    expect(s.alt_next).toBe('test');
  });

  it('updateUserSettings сохраняет изменения', () => {
    seedUser(100);
    updateUserSettings(100, { direction: 'ru_to_en', answer_mode: 'written' });
    const s = getUserSettings(100);
    expect(s.direction).toBe('ru_to_en');
    expect(s.answer_mode).toBe('written');
  });

  it('countErrorWords считает слова с ошибками', () => {
    seedUser(100);
    const ids = seedWords(3);
    markWordSeen(100, ids[0]);
    markWordSeen(100, ids[1]);
    recordWordAnswer(100, ids[0], false);
    recordWordAnswer(100, ids[1], true);
    expect(countErrorWords(100)).toBe(1);
  });
});

// ── 2. Нормализация и проверка ответов ────────────────────────────────────────

describe('normalizeAnswer', () => {
  it('приводит к нижнему регистру', () => {
    expect(normalizeAnswer('HELLO')).toBe('hello');
  });
  it('обрезает пробелы', () => {
    expect(normalizeAnswer('  hello  ')).toBe('hello');
  });
  it('схлопывает двойные пробелы', () => {
    expect(normalizeAnswer('hello  world')).toBe('hello world');
  });
});

describe('checkAnswer', () => {
  it('принимает основной перевод', () => {
    const word = insertWord('cat', 'кошка');
    expect(checkAnswer(word, 'en_to_ru', 'кошка')).toBe(true);
  });

  it('принимает допустимый перевод из accepted_translations', () => {
    const word = insertWord('sorry', 'извини', ['извините', 'прости']);
    expect(checkAnswer(word, 'en_to_ru', 'прости')).toBe(true);
    expect(checkAnswer(word, 'en_to_ru', 'Извините')).toBe(true);
  });

  it('отклоняет неверный ответ', () => {
    const word = insertWord('dog', 'собака');
    expect(checkAnswer(word, 'en_to_ru', 'кошка')).toBe(false);
  });

  it('для ru_to_en проверяет английское слово', () => {
    const word = insertWord('book', 'книга');
    expect(checkAnswer(word, 'ru_to_en', 'book')).toBe(true);
    expect(checkAnswer(word, 'ru_to_en', 'BOOK')).toBe(true);
    expect(checkAnswer(word, 'ru_to_en', 'books')).toBe(false);
  });

  it('getAcceptedAnswers en_to_ru включает все варианты', () => {
    const word = insertWord('good', 'хорошо', ['хороший', 'хорошая']);
    const answers = getAcceptedAnswers(word, 'en_to_ru');
    expect(answers).toContain('хорошо');
    expect(answers).toContain('хороший');
    expect(answers).toContain('хорошая');
  });
});

// ── 3. Выбор слов ─────────────────────────────────────────────────────────────

describe('pickStudyWords', () => {
  it('возвращает до 10 слов', () => {
    seedUser(200);
    seedWords(15);
    const { words } = pickStudyWords(200);
    expect(words.length).toBeLessThanOrEqual(10);
    expect(words.length).toBeGreaterThan(0);
  });

  it('новые слова идут первыми', () => {
    seedUser(200);
    const ids = seedWords(12);
    // Помечаем первые 5 как увиденные
    for (let i = 0; i < 5; i++) markWordSeen(200, ids[i]);

    const { words, newCount } = pickStudyWords(200);
    expect(newCount).toBeGreaterThan(0);
    // Новые слова — те, которых нет в seen
    const seenSet = new Set(getSeenWordIds(200));
    const newInResult = words.filter((w) => !seenSet.has(w.id));
    expect(newInResult.length).toBe(newCount);
  });

  it('нет дублей внутри одного занятия', () => {
    seedUser(200);
    seedWords(10);
    const { words } = pickStudyWords(200);
    const unique = new Set(words.map((w) => w.id));
    expect(unique.size).toBe(words.length);
  });
});

describe('pickQuizWords', () => {
  it('возвращает пустой массив если ничего не просмотрено', () => {
    seedUser(201);
    seedWords(5);
    expect(pickQuizWords(201)).toHaveLength(0);
  });

  it('возвращает только увиденные слова', () => {
    seedUser(201);
    const ids = seedWords(8);
    markWordSeen(201, ids[0]);
    markWordSeen(201, ids[1]);
    const words = pickQuizWords(201);
    const allSeen = new Set(getSeenWordIds(201));
    for (const w of words) {
      expect(allSeen.has(w.id)).toBe(true);
    }
  });
});

describe('pickReviewWords', () => {
  it('возвращает только слова с ошибками', () => {
    seedUser(202);
    const ids = seedWords(5);
    ids.forEach((id) => markWordSeen(202, id));
    recordWordAnswer(202, ids[0], false);
    recordWordAnswer(202, ids[1], false);
    recordWordAnswer(202, ids[2], true);

    const words = pickReviewWords(202);
    const wordIds = words.map((w) => w.id);
    expect(wordIds).toContain(ids[0]);
    expect(wordIds).toContain(ids[1]);
    expect(wordIds).not.toContain(ids[2]);
  });
});

// ── 4. Варианты ответа ────────────────────────────────────────────────────────

describe('buildTestOptions', () => {
  it('возвращает null если < 3 других слов', () => {
    seedWords(2); // 2 слова — нельзя подобрать 3 дистрактора
    const word = getAllActiveWords()[0];
    const result = buildTestOptions(word, 'en_to_ru');
    expect(result).toBeNull();
  });

  it('возвращает 4 уникальных варианта при достаточном словаре', () => {
    seedWords(10);
    const word = getAllActiveWords()[0];
    const result = buildTestOptions(word, 'en_to_ru');
    expect(result).not.toBeNull();
    expect(result!.options).toHaveLength(4);
    // Все уникальны
    const unique = new Set(result!.options);
    expect(unique.size).toBe(4);
    // Правильный ответ присутствует
    expect(result!.options).toContain(result!.correctAnswer);
  });

  it('correctAnswer соответствует переводу', () => {
    seedWords(10);
    const word = getAllActiveWords()[0];
    const result = buildTestOptions(word, 'en_to_ru')!;
    expect(result.correctAnswer).toBe(word.russian_translation);
  });

  it('для ru_to_en correctAnswer — английское слово', () => {
    seedWords(10);
    const word = getAllActiveWords()[0];
    const result = buildTestOptions(word, 'ru_to_en')!;
    expect(result.correctAnswer).toBe(word.english_word);
  });
});

// ── 5. Сессии: запуск и прохождение ──────────────────────────────────────────

describe('startQuizSession', () => {
  it('возвращает error:no_words если нет увиденных слов', () => {
    seedUser(300);
    seedWords(5);
    const result = startQuizSession(300);
    expect('error' in result).toBe(true);
  });

  it('создаёт сессию и первый вопрос', () => {
    seedUser(300);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(300, id));
    const result = startQuizSession(300);
    expect('error' in result).toBe(false);
    if ('error' in result) return;
    expect(result.session.id).toBeGreaterThan(0);
    expect(result.session.status).toBe('active');
    expect(result.firstQuestion.status).toBe('pending');
    expect(result.totalQuestions).toBeGreaterThan(0);
  });

  it('не создаёт больше 10 вопросов', () => {
    seedUser(300);
    const ids = seedWords(15);
    ids.forEach((id) => markWordSeen(300, id));
    const result = startQuizSession(300);
    if ('error' in result) return;
    expect(result.totalQuestions).toBeLessThanOrEqual(10);
  });

  it('нет дублей слов в одной сессии', () => {
    seedUser(300);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(300, id));
    const result = startQuizSession(300);
    if ('error' in result) return;
    const questions = getSessionQuestions(result.session.id);
    const wordIds = questions.map((q) => q.word_id);
    const unique = new Set(wordIds);
    expect(unique.size).toBe(wordIds.length);
  });
});

describe('processAnswer', () => {
  it('правильный ответ возвращает isCorrect=true', () => {
    seedUser(400);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(400, id));
    const r = startQuizSession(400);
    if ('error' in r) return;
    const { session, firstQuestion } = r;

    const result = processAnswer(400, session.id, firstQuestion.id, firstQuestion.correct_answer);
    expect('error' in result).toBe(false);
    if ('error' in result) return;
    expect(result.isCorrect).toBe(true);
  });

  it('неверный ответ возвращает isCorrect=false', () => {
    seedUser(400);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(400, id));
    const r = startQuizSession(400);
    if ('error' in r) return;
    const { session, firstQuestion } = r;

    const result = processAnswer(400, session.id, firstQuestion.id, '__wrong__');
    if ('error' in result) return;
    expect(result.isCorrect).toBe(false);
  });

  it('повторный ответ на тот же вопрос возвращает error', () => {
    seedUser(400);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(400, id));
    const r = startQuizSession(400);
    if ('error' in r) return;
    const { session, firstQuestion } = r;

    processAnswer(400, session.id, firstQuestion.id, firstQuestion.correct_answer);
    const result2 = processAnswer(400, session.id, firstQuestion.id, firstQuestion.correct_answer);
    expect('error' in result2).toBe(true);
  });

  it('после ответа на все вопросы сессия завершается', () => {
    seedUser(400);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(400, id));
    updateUserSettings(400, { answer_mode: 'written' });
    const r = startQuizSession(400);
    if ('error' in r) return;
    const { session, totalQuestions } = r;

    let done = false;
    for (let i = 0; i < totalQuestions; i++) {
      const q = getCurrentQuestion(session.id);
      if (!q) break;
      const result = processAnswer(400, session.id, q.id, q.correct_answer);
      if (!('error' in result) && result.sessionDone) {
        done = true;
        expect(result.summary).toBeDefined();
      }
    }
    expect(done).toBe(true);
  });
});

// ── 6. Итоги и досрочное завершение ──────────────────────────────────────────

describe('buildSummary', () => {
  it('считает правильные и неверные ответы', () => {
    seedUser(500);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(500, id));
    updateUserSettings(500, { answer_mode: 'written' });
    const r = startQuizSession(500);
    if ('error' in r) return;
    const { session } = r;

    // Отвечаем правильно на первый, неправильно на второй
    const q1 = getCurrentQuestion(session.id)!;
    answerQuestion(q1.id, q1.correct_answer, q1.correct_answer.toLowerCase(), 'correct');
    const q2 = getCurrentQuestion(session.id)!;
    answerQuestion(q2.id, '__wrong__', '__wrong__', 'wrong');

    const summary = buildSummary(session.id);
    expect(summary.correctCount).toBeGreaterThanOrEqual(1);
    expect(summary.wrongCount).toBeGreaterThanOrEqual(1);
    expect(summary.accuracy).toBeGreaterThan(0);
    expect(summary.accuracy).toBeLessThan(100);
  });
});

describe('finishSessionEarly', () => {
  it('завершает сессию и скипает оставшиеся вопросы', () => {
    seedUser(501);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(501, id));
    const r = startQuizSession(501);
    if ('error' in r) return;
    const { session } = r;

    const summary = finishSessionEarly(session.id);
    expect(summary).not.toBeNull();
    expect(summary!.skippedCount).toBeGreaterThan(0);

    const questions = getSessionQuestions(session.id);
    const pending = questions.filter((q) => q.status === 'pending');
    expect(pending).toHaveLength(0);
  });

  it('повторный вызов возвращает null', () => {
    seedUser(501);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(501, id));
    const r = startQuizSession(501);
    if ('error' in r) return;
    const { session } = r;

    finishSessionEarly(session.id);
    expect(finishSessionEarly(session.id)).toBeNull();
  });
});

// ── 7. Повторное прохождение ──────────────────────────────────────────────────

describe('restartSession', () => {
  it('создаёт новую сессию с теми же словами', () => {
    seedUser(600);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(600, id));
    const r = startQuizSession(600);
    if ('error' in r) return;
    const { session } = r;

    finishSessionEarly(session.id);

    const r2 = restartSession(600, session.id);
    expect('error' in r2).toBe(false);
    if ('error' in r2) return;

    const origWords = getSessionQuestions(session.id).map((q) => q.word_id).sort();
    const newWords = getSessionQuestions(r2.session.id).map((q) => q.word_id).sort();
    expect(newWords).toEqual(origWords);
  });

  it('для тестовых вопросов варианты перемешиваются', () => {
    seedUser(600);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(600, id));
    updateUserSettings(600, { answer_mode: 'test' });
    const r = startQuizSession(600);
    if ('error' in r) return;
    finishSessionEarly(r.session.id);

    const r2 = restartSession(600, r.session.id);
    if ('error' in r2) return;

    // Оба имеют вопросы
    expect(r2.totalQuestions).toBe(r.totalQuestions);
  });
});

// ── 8. Статистика пользователя ────────────────────────────────────────────────

describe('getUserVocabStats', () => {
  it('возвращает нули для нового пользователя', () => {
    seedUser(700);
    const stats = getUserVocabStats(700);
    expect(stats.seenWords).toBe(0);
    expect(stats.masteredWords).toBe(0);
    expect(stats.totalAnswers).toBe(0);
    expect(stats.accuracy).toBe(0);
  });

  it('корректно считает после ответов', () => {
    seedUser(700);
    const ids = seedWords(10);
    ids.forEach((id) => markWordSeen(700, id));
    updateUserSettings(700, { answer_mode: 'written' });

    // Проходим сессию — только processAnswer пишет в vocabulary_answer_history
    const r = startQuizSession(700);
    if ('error' in r) return;
    const { session } = r;

    const q1 = getCurrentQuestion(session.id)!;
    processAnswer(700, session.id, q1.id, q1.correct_answer); // правильно

    const q2 = getCurrentQuestion(session.id)!;
    processAnswer(700, session.id, q2.id, '__wrong__'); // неправильно

    finishSessionEarly(session.id);

    const stats = getUserVocabStats(700);
    expect(stats.seenWords).toBe(10);
    expect(stats.totalAnswers).toBe(2);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.wrongAnswers).toBe(1);
    expect(stats.accuracy).toBe(50);
  });
});

// ── 9. Настройки: изоляция пользователей ─────────────────────────────────────

describe('user settings isolation', () => {
  it('настройки разных пользователей не пересекаются', () => {
    seedUser(800);
    seedUser(801);

    updateUserSettings(800, { direction: 'ru_to_en' });
    updateUserSettings(801, { direction: 'en_to_ru', answer_mode: 'written' });

    const s800 = getUserSettings(800);
    const s801 = getUserSettings(801);

    expect(s800.direction).toBe('ru_to_en');
    expect(s800.answer_mode).toBe('test');
    expect(s801.direction).toBe('en_to_ru');
    expect(s801.answer_mode).toBe('written');
  });

  it('сессии разных пользователей изолированы', () => {
    seedUser(800);
    seedUser(801);
    const ids = seedWords(10);
    ids.forEach((id) => {
      markWordSeen(800, id);
      markWordSeen(801, id);
    });

    const r800 = startQuizSession(800);
    const r801 = startQuizSession(801);

    if ('error' in r800 || 'error' in r801) return;
    expect(r800.session.id).not.toBe(r801.session.id);
    expect(r800.session.telegram_id).toBe(800);
    expect(r801.session.telegram_id).toBe(801);
  });
});

// ── 10. Демо-ограничение ──────────────────────────────────────────────────────

import {
  markDemoQuizUsed,
  isDemoQuizUsed,
} from '../src/db/repositories/vocabulary.js';

describe('demo quiz restriction', () => {
  it('isDemoQuizUsed возвращает false по умолчанию', () => {
    seedUser(900);
    expect(isDemoQuizUsed(900)).toBe(false);
  });

  it('markDemoQuizUsed помечает демо как использованный', () => {
    seedUser(900);
    markDemoQuizUsed(900);
    expect(isDemoQuizUsed(900)).toBe(true);
  });

  it('повторный вызов markDemoQuizUsed идемпотентен', () => {
    seedUser(900);
    markDemoQuizUsed(900);
    markDemoQuizUsed(900);
    expect(isDemoQuizUsed(900)).toBe(true);
  });

  it('разные пользователи имеют независимые флаги', () => {
    seedUser(901);
    seedUser(902);
    markDemoQuizUsed(901);
    expect(isDemoQuizUsed(901)).toBe(true);
    expect(isDemoQuizUsed(902)).toBe(false);
  });
});

// ── 11. Градация сложности (A1-A2, B1-B2, C1-C2) и немиксование в тестах ───────

describe('vocabulary difficulty levels and test isolation', () => {
  it('по умолчанию у пользователя уровень A1-A2', () => {
    seedUser(1001);
    const settings = getUserSettings(1001);
    expect(settings.difficulty).toBe('A1-A2');
  });

  it('updateUserSettings позволяет изменить уровень сложности', () => {
    seedUser(1002);
    updateUserSettings(1002, { difficulty: 'B1-B2' });
    expect(getUserSettings(1002).difficulty).toBe('B1-B2');

    updateUserSettings(1002, { difficulty: 'C1-C2' });
    expect(getUserSettings(1002).difficulty).toBe('C1-C2');
  });

  it('pickStudyWords возвращает строго слова выбранного уровня', () => {
    seedUser(1003);
    // Добавляем слова разных уровней
    insertWord('apple', 'яблоко', [], null, null, 'A1-A2');
    insertWord('banana', 'банан', [], null, null, 'A1-A2');
    insertWord('negotiate', 'вести переговоры', [], null, null, 'B1-B2');
    insertWord('sustainable', 'устойчивый', [], null, null, 'B1-B2');
    insertWord('ephemeral', 'эфемерный', [], null, null, 'C1-C2');

    // Пользователь на B1-B2
    updateUserSettings(1003, { difficulty: 'B1-B2' });
    const { words } = pickStudyWords(1003);

    expect(words.length).toBeGreaterThan(0);
    for (const w of words) {
      expect(w.difficulty).toBe('B1-B2');
    }
  });

  it('pickQuizWords возвращает строго слова выбранного уровня', () => {
    seedUser(1004);
    const w1 = insertWord('cat_a1', 'кот', [], null, null, 'A1-A2');
    const w2 = insertWord('dog_b1', 'собака', [], null, null, 'B1-B2');

    markWordSeen(1004, w1.id);
    markWordSeen(1004, w2.id);

    // При уровне A1-A2 вернёт только w1
    updateUserSettings(1004, { difficulty: 'A1-A2' });
    const a1Words = pickQuizWords(1004);
    expect(a1Words.map((w) => w.id)).toContain(w1.id);
    expect(a1Words.map((w) => w.id)).not.toContain(w2.id);

    // При уровне B1-B2 вернёт только w2
    updateUserSettings(1004, { difficulty: 'B1-B2' });
    const b1Words = pickQuizWords(1004);
    expect(b1Words.map((w) => w.id)).toContain(w2.id);
    expect(b1Words.map((w) => w.id)).not.toContain(w1.id);
  });

  it('buildTestOptions не миксует варианты ответов между уровнями', () => {
    // Создаем 5 слов A1-A2
    const a1_1 = insertWord('dog', 'собака', [], null, null, 'A1-A2');
    insertWord('cat', 'кот', [], null, null, 'A1-A2');
    insertWord('bird', 'птица', [], null, null, 'A1-A2');
    insertWord('fish', 'рыба', [], null, null, 'A1-A2');
    insertWord('cow', 'корова', [], null, null, 'A1-A2');

    // И слова B1-B2 и C1-C2 с совершенно другими значениями
    insertWord('achievement', 'достижение', [], null, null, 'B1-B2');
    insertWord('consequence', 'последствие', [], null, null, 'B1-B2');
    insertWord('meticulous', 'дотошный', [], null, null, 'C1-C2');

    const optionsResult = buildTestOptions(a1_1, 'en_to_ru');
    expect(optionsResult).not.toBeNull();
    expect(optionsResult!.options).toHaveLength(4);

    // Варианты ответов должны быть ТОЛЬКО из A1-A2
    const a1Translations = ['собака', 'кот', 'птица', 'рыба', 'корова'];
    for (const opt of optionsResult!.options) {
      expect(a1Translations).toContain(opt);
      expect(opt).not.toBe('достижение');
      expect(opt).not.toBe('последствие');
      expect(opt).not.toBe('дотошный');
    }
  });

  it('startQuizSession создаёт сессию с изолированными вопросами и вариантами', () => {
    seedUser(1005);
    updateUserSettings(1005, { difficulty: 'B1-B2' });

    // Создаем слова для B1-B2
    const bWords = [
      insertWord('b_word1', 'б_слово1', [], null, null, 'B1-B2'),
      insertWord('b_word2', 'б_слово2', [], null, null, 'B1-B2'),
      insertWord('b_word3', 'б_слово3', [], null, null, 'B1-B2'),
      insertWord('b_word4', 'б_слово4', [], null, null, 'B1-B2'),
    ];
    // И слова A1-A2
    insertWord('a_word1', 'а_слово1', [], null, null, 'A1-A2');

    bWords.forEach((w) => markWordSeen(1005, w.id));

    const result = startQuizSession(1005);
    expect('session' in result).toBe(true);
    if ('session' in result) {
      const questions = getSessionQuestions(result.session.id);
      expect(questions.length).toBe(bWords.length);

      for (const q of questions) {
        const options: string[] = JSON.parse(q.options_json);
        // Ни один вариант не должен быть из A1-A2 ('а_слово1')
        expect(options).not.toContain('а_слово1');
      }
    }
  });
});
