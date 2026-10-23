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
const { LESSONS } = await import('../src/content/course.js');

function findStepByType<T extends 'input' | 'free' | 'choice'>(type: T) {
  for (const lesson of LESSONS) {
    for (let i = 0; i < lesson.steps.length; i++) {
      const s = lesson.steps[i];
      if (s.type === type) {
        return { day: lesson.day, stepIndex: i, step: s as Extract<(typeof lesson.steps)[number], { type: T }> };
      }
    }
  }
  throw new Error(`Step of type ${type} not found`);
}

describe('checkStepAnswer', () => {
  const inputTarget = findStepByType('input');
  const validAnswer = inputTarget.step.answerKey[0];
  const freeTarget = findStepByType('free');

  it('принимает правильный input-ответ', () => {
    const result = checkStepAnswer(inputTarget.day, inputTarget.stepIndex, validAnswer);
    expect(result.isCorrect).toBe(true);
  });

  it('нечувствителен к регистру', () => {
    const result = checkStepAnswer(inputTarget.day, inputTarget.stepIndex, validAnswer.toUpperCase());
    expect(result.isCorrect).toBe(true);
  });

  it('нечувствителен к лишним пробелам', () => {
    const result = checkStepAnswer(inputTarget.day, inputTarget.stepIndex, `  ${validAnswer}  `);
    expect(result.isCorrect).toBe(true);
  });

  it('принимает ответ со знаками препинания в конце', () => {
    const result = checkStepAnswer(inputTarget.day, inputTarget.stepIndex, `${validAnswer}!`);
    expect(result.isCorrect).toBe(true);
  });

  it('отклоняет неверный ответ', () => {
    const result = checkStepAnswer(inputTarget.day, inputTarget.stepIndex, '__definitely_wrong_answer__');
    expect(result.isCorrect).toBe(false);
  });

  it('свободный ответ возвращает isCorrect=null', () => {
    const result = checkStepAnswer(freeTarget.day, freeTarget.stepIndex, 'любой текст');
    expect(result.isCorrect).toBeNull();
  });
});

describe('checkChoiceAnswer', () => {
  const choiceTarget = findStepByType('choice');
  const correctIdx = choiceTarget.step.correctIndex;
  const wrongIdx = (correctIdx + 1) % choiceTarget.step.options.length;

  it('принимает правильный выбор', () => {
    const result = checkChoiceAnswer(choiceTarget.day, choiceTarget.stepIndex, correctIdx);
    expect(result.isCorrect).toBe(true);
  });

  it('отклоняет неверный выбор', () => {
    const result = checkChoiceAnswer(choiceTarget.day, choiceTarget.stepIndex, wrongIdx);
    expect(result.isCorrect).toBe(false);
  });

  it('возвращает подсказку при неверном ответе', () => {
    const result = checkChoiceAnswer(choiceTarget.day, choiceTarget.stepIndex, wrongIdx);
    expect(result.hint).toBeTruthy();
    expect(result.explanation).toBe('');
  });

  it('возвращает объяснение при правильном ответе', () => {
    const result = checkChoiceAnswer(choiceTarget.day, choiceTarget.stepIndex, correctIdx);
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
