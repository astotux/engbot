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
vi.mock('../src/utils/logger.js', () => ({ logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} } }));

const { upsertUser } = await import('../src/db/repositories/users.js');
const { createCourseAccess, startCourse } = await import('../src/db/repositories/courseAccess.js');
const {
  scheduleLessonDelivery,
  getPendingDeliveries,
  markLessonSent,
  getLessonDelivery,
} = await import('../src/db/repositories/lessons.js');
const { scheduleAllLessons } = await import('../src/services/lessonService.js');

describe('Планировщик уроков', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 900 });
    createCourseAccess(900, null);
    startCourse(900);
  });

  it('планирует доставку урока', () => {
    const past = new Date(Date.now() - 60000).toISOString();
    scheduleLessonDelivery(900, 1, past);

    const pending = getPendingDeliveries(new Date().toISOString());
    expect(pending.length).toBeGreaterThan(0);
    expect(pending[0]?.telegram_id).toBe(900);
    expect(pending[0]?.day_number).toBe(1);
  });

  it('не возвращает будущие уроки как pending', () => {
    const future = new Date(Date.now() + 3600000).toISOString();
    scheduleLessonDelivery(900, 1, future);

    const pending = getPendingDeliveries(new Date().toISOString());
    expect(pending.length).toBe(0);
  });

  it('урок не отправляется дважды', () => {
    const past = new Date(Date.now() - 60000).toISOString();
    scheduleLessonDelivery(900, 1, past);
    markLessonSent(900, 1);

    const pending = getPendingDeliveries(new Date().toISOString());
    expect(pending.find(d => d.telegram_id === 900 && d.day_number === 1)).toBeUndefined();
  });

  it('после перезапуска (scheduleAllLessons) уроки снова в расписании', () => {
    scheduleAllLessons(900);
    const d1 = getLessonDelivery(900, 1);
    expect(d1).toBeTruthy();
    expect(d1?.status).toBe('pending');
  });

  it('уже отправленный урок не становится pending при scheduleAllLessons', () => {
    const past = new Date(Date.now() - 60000).toISOString();
    scheduleLessonDelivery(900, 1, past);
    markLessonSent(900, 1);

    // Повторный вызов не должен менять sent на pending
    scheduleAllLessons(900);
    const d = getLessonDelivery(900, 1);
    expect(d?.status).toBe('sent');
  });
});
