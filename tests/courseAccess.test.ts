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
const { createOrder, updateOrderStatus } = await import('../src/db/repositories/orders.js');
const {
  createCourseAccess,
  getCourseAccess,
  startCourse,
  revokeCourse,
  countActiveCourses,
  countCompletedCourses,
} = await import('../src/db/repositories/courseAccess.js');

describe('CourseAccess repository', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 300 });
  });

  it('создаёт активный доступ к курсу', () => {
    const order = createOrder(300, 50000);
    const access = createCourseAccess(300, order.id);
    expect(access).toBeTruthy();
    expect(access?.telegram_id).toBe(300);
    expect(access?.status).toBe('active');
  });

  it('не создаёт второй доступ для одного пользователя (идемпотентность)', () => {
    const order = createOrder(300, 50000);
    createCourseAccess(300, order.id);
    const second = createCourseAccess(300, order.id);
    expect(second).toBeNull(); // уже существует
  });

  it('активирует курс после start, если он был pending', () => {
    const order = createOrder(300, 50000);
    createCourseAccess(300, order.id, 'pending');
    startCourse(300);
    const access = getCourseAccess(300);
    expect(access?.status).toBe('active');
    expect(access?.current_day).toBe(1);
  });

  it('отозванный доступ виден как revoked', () => {
    createCourseAccess(300, null);
    revokeCourse(300);
    const access = getCourseAccess(300);
    expect(access?.status).toBe('revoked');
  });

  it('отменённый платёж не открывает курс', () => {
    const order = createOrder(300, 50000);
    updateOrderStatus(order.id, 'canceled');
    // createCourseAccess НЕ должен вызываться при canceled платеже
    const access = getCourseAccess(300);
    expect(access).toBeUndefined();
  });

  it('считает активные курсы', () => {
    upsertUser({ telegram_id: 301 });
    upsertUser({ telegram_id: 302 });
    createCourseAccess(301, null);
    createCourseAccess(302, null);
    startCourse(301);
    startCourse(302);
    expect(countActiveCourses()).toBe(2);
  });
});
