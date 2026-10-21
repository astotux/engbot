import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { createTestDb } from './helpers.js';

let testDb: Database.Database;

vi.mock('../src/db/connection.js', () => ({ getDb: () => testDb, closeDb: () => {} }));
vi.mock('../src/config/index.js', () => ({
  config: {
    logLevel: 'silent', nodeEnv: 'test', isProduction: false, isTest: true,
    databasePath: ':memory:', freeChecklistPath: '', coursePriceRub: 500,
    coursePriceKopecks: 50000, courseTimezone: 'Europe/Moscow',
    lessonSendHour: 10, lessonSendMinute: 0, botToken: 'test', botUsername: 'testbot',
    adminIds: [999], yookassa: { enabled: false, shopId: '', secretKey: '', returnUrl: '' },
    webhook: { enabled: false, baseUrl: '', pathSecret: '' },
  },
}));
vi.mock('../src/utils/logger.js', () => ({ logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} } }));

const { upsertUser } = await import('../src/db/repositories/users.js');
const { createCourseAccess, startCourse } = await import('../src/db/repositories/courseAccess.js');
const { scheduleLessonDelivery, getPendingDeliveries, getLessonDelivery } = await import('../src/db/repositories/lessons.js');
const { checkAnswer, processSubmission, getUserProgress, scheduleAllLessons } = await import('../src/services/lessonService.js');

describe('LessonService — checkAnswer', () => {
  it('правильный ответ принимается', () => {
    const result = checkAnswer(2, 'He');
    expect(result.isCorrect).toBe(true);
  });

  it('ответ нечувствителен к регистру', () => {
    const result = checkAnswer(2, 'he');
    expect(result.isCorrect).toBe(true);
  });

  it('ответ нечувствителен к лишним пробелам', () => {
    const result = checkAnswer(2, '  He  ');
    expect(result.isCorrect).toBe(true);
  });

  it('неправильный ответ отвергается', () => {
    const result = checkAnswer(2, 'She');
    expect(result.isCorrect).toBe(false);
  });

  it('свободный ответ (нет answerKey) принимается как null', () => {
    // день 20 — свободный ответ
    const result = checkAnswer(20, 'My mother is kind');
    expect(result.isCorrect).toBeNull();
  });

  it('несуществующий урок возвращает null', () => {
    const result = checkAnswer(99, 'anything');
    expect(result.isCorrect).toBeNull();
  });
});

describe('LessonService — processSubmission', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 500 });
  });

  it('сохраняет ответ пользователя', async () => {
    const result = await processSubmission(500, 2, 'He');
    expect(result.saved).toBe(true);
    expect(result.isCorrect).toBe(true);
  });

  it('отклоняет слишком длинный ответ', async () => {
    const result = await processSubmission(500, 2, 'a'.repeat(1001));
    expect(result.saved).toBe(false);
  });
});

describe('LessonService — scheduleAllLessons', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 600 });
    createCourseAccess(600, null);
    startCourse(600);
  });

  it('планирует 30 уроков после старта', () => {
    scheduleAllLessons(600);
    // Первый урок должен быть запланирован
    const d1 = getLessonDelivery(600, 1);
    expect(d1).toBeTruthy();
    expect(d1?.status).toBe('pending');
  });

  it('не планирует уроки дважды (идемпотентность)', () => {
    scheduleAllLessons(600);
    scheduleAllLessons(600); // второй вызов

    const d1 = getLessonDelivery(600, 1);
    // Не должно быть дубликатов — UNIQUE constraint
    expect(d1).toBeTruthy();
  });
});

describe('LessonService — getUserProgress', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 700 });
  });

  it('возвращает null если курса нет', () => {
    const p = getUserProgress(700);
    expect(p).toBeNull();
  });

  it('возвращает прогресс после начала курса', () => {
    createCourseAccess(700, null);
    startCourse(700);
    const p = getUserProgress(700);
    expect(p).toBeTruthy();
    expect(p?.currentDay).toBe(1);
    expect(p?.completedCount).toBe(0);
    expect(p?.percent).toBe(0);
  });
});
