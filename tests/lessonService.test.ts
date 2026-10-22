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
    adminIds: [999], yookassa: { enabled: false }, webhook: { enabled: false },
  },
}));
vi.mock('../src/utils/logger.js', () => ({
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
}));

const { upsertUser } = await import('../src/db/repositories/users.js');
const { createCourseAccess, startCourse } = await import('../src/db/repositories/courseAccess.js');
const { scheduleLessonDelivery, getPendingDeliveries, markLessonSent, getLessonDelivery } = await import('../src/db/repositories/lessons.js');
const { checkStepAnswer, checkChoiceAnswer, scheduleAllLessons, getUserProgress, getOrInitStepProgress, markStepDone } = await import('../src/services/lessonService.js');

describe('checkStepAnswer', () => {
  it('принимает правильный input-ответ', () => {
    // День 3, шаг 3: input с answerKey ['am', 'i am from moscow', "i'm from moscow"]
    const result = checkStepAnswer(3, 3, 'am');
    expect(result.isCorrect).toBe(true);
  });

  it('нечувствителен к регистру', () => {
    const result = checkStepAnswer(3, 3, 'AM');
    expect(result.isCorrect).toBe(true);
  });

  it('нечувствителен к лишним пробелам', () => {
    const result = checkStepAnswer(3, 3, '  am  ');
    expect(result.isCorrect).toBe(true);
  });

  it('принимает полный вариант ответа', () => {
    const result = checkStepAnswer(3, 3, "I'm from Moscow.");
    expect(result.isCorrect).toBe(true);
  });

  it('отклоняет неверный ответ', () => {
    const result = checkStepAnswer(3, 3, 'are');
    expect(result.isCorrect).toBe(false);
  });

  it('свободный ответ возвращает isCorrect=null', () => {
    // День 1, шаг 5 — free
    const result = checkStepAnswer(1, 5, 'любой текст');
    expect(result.isCorrect).toBeNull();
  });
});

describe('checkChoiceAnswer', () => {
  it('принимает правильный выбор', () => {
    // День 1, шаг 1 (choice: correctIndex=1 "Hi")
    const result = checkChoiceAnswer(1, 1, 1);
    expect(result.isCorrect).toBe(true);
  });

  it('отклоняет неверный выбор', () => {
    const result = checkChoiceAnswer(1, 1, 0);
    expect(result.isCorrect).toBe(false);
  });

  it('возвращает подсказку при неверном ответе', () => {
    const result = checkChoiceAnswer(1, 1, 0);
    expect(result.hint).toBeTruthy();
    expect(result.explanation).toBe('');
  });

  it('возвращает объяснение при правильном ответе', () => {
    const result = checkChoiceAnswer(1, 1, 1);
    expect(result.explanation).toBeTruthy();
  });
});

describe('scheduleAllLessons', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 600 });
    createCourseAccess(600, null);
    startCourse(600);
  });

  it('планирует уроки после старта', () => {
    scheduleAllLessons(600);
    const d1 = getLessonDelivery(600, 1);
    expect(d1).toBeTruthy();
    expect(d1?.status).toBe('pending');
  });

  it('не создаёт дубликаты при повторном вызове', () => {
    scheduleAllLessons(600);
    scheduleAllLessons(600);
    const d1 = getLessonDelivery(600, 1);
    expect(d1).toBeTruthy();
  });

  it('не меняет sent на pending при повторном вызове', () => {
    const past = new Date(Date.now() - 60000).toISOString();
    scheduleLessonDelivery(600, 1, past);
    markLessonSent(600, 1);
    scheduleAllLessons(600);
    const d = getLessonDelivery(600, 1);
    expect(d?.status).toBe('sent');
  });
});

describe('getUserProgress', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 700 });
  });

  it('возвращает null если курса нет', () => {
    expect(getUserProgress(700)).toBeNull();
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

describe('getOrInitStepProgress + markStepDone', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 800 });
    createCourseAccess(800, null);
    startCourse(800);
  });

  it('инициализирует прогресс с шага 0', () => {
    const prog = getOrInitStepProgress(800, 1);
    expect(prog.step_index).toBe(0);
    expect(JSON.parse(prog.completed_steps)).toEqual([]);
  });

  it('отмечает шаг как пройденный', () => {
    getOrInitStepProgress(800, 1);
    markStepDone(800, 1, 0);
    const prog = getOrInitStepProgress(800, 1);
    const completed = JSON.parse(prog.completed_steps) as number[];
    expect(completed).toContain(0);
  });
});
