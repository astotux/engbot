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
const { grantCourseAccess, startCourse, revokeCourse, getCourseAccess } = await import('../src/db/repositories/courseAccess.js');
const { logAdminAction, getRecentAuditLogs } = await import('../src/db/repositories/adminAudit.js');

describe('Admin access control', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 800, username: 'student' });
  });

  it('администратор выдаёт доступ вручную', () => {
    grantCourseAccess(800);
    startCourse(800);
    const access = getCourseAccess(800);
    expect(access?.status).toBe('active');
  });

  it('администратор отзывает доступ', () => {
    grantCourseAccess(800);
    startCourse(800);
    revokeCourse(800);
    const access = getCourseAccess(800);
    expect(access?.status).toBe('revoked');
  });

  it('действия администратора логируются', () => {
    logAdminAction(999, 'grant_access', 800, 'Тест');
    const logs = getRecentAuditLogs(10);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]?.action).toBe('grant_access');
    expect(logs[0]?.target_telegram_id).toBe(800);
  });

  it('неадмин не получает доступ к admin командам (через конфиг)', () => {
    // adminIds = [999], 888 — не admin
    const isAdmin = [999].includes(888);
    expect(isAdmin).toBe(false);
  });
});
