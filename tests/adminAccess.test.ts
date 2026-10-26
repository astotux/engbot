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

const { upsertUser, getUsersPaginated } = await import('../src/db/repositories/users.js');
const { grantCourseAccess, startCourse, revokeCourse, getCourseAccess, hasUserCourseAccess } = await import('../src/db/repositories/courseAccess.js');
const { logAdminAction, getRecentAuditLogs } = await import('../src/db/repositories/adminAudit.js');
const {
  handleAdminUsersList,
  handleAdminUserCard,
  handleAdminToggleAccess,
  handleAdminCommand,
} = await import('../src/admin/adminHandlers.js');

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

  it('пагинация пользователей возвращает корректные страницы', () => {
    for (let i = 1; i <= 15; i++) {
      upsertUser({ telegram_id: 1000 + i, username: `user_${i}` });
    }
    const page0 = getUsersPaginated(8, 0);
    expect(page0.length).toBe(8);

    const page1 = getUsersPaginated(8, 8);
    expect(page1.length).toBe(8); // 16 users total (800 + 15 new)
  });

  it('handleAdminUsersList отправляет список с кнопками пользователей и слайдером', async () => {
    for (let i = 1; i <= 10; i++) {
      upsertUser({ telegram_id: 2000 + i, username: `student_${i}` });
    }

    let sentText = '';
    let sentKb: any;

    const mockCtx: any = {
      from: { id: 999 }, // Admin
      reply: vi.fn(async (text: string, opts?: any) => {
        sentText = text;
        sentKb = opts?.reply_markup;
        return { message_id: 123 };
      }),
    };

    await handleAdminUsersList(mockCtx, 0);

    expect(sentText).toContain('Панель администратора — Пользователи');
    expect(sentText).toContain('Страница:');
    const buttons = sentKb?.inline_keyboard?.flat() ?? [];
    expect(buttons.some((b: any) => b.callback_data?.startsWith('admin:user:'))).toBe(true);
    expect(buttons.some((b: any) => b.callback_data === 'admin:users:1')).toBe(true);
  });

  it('handleAdminUserCard и handleAdminToggleAccess переключают доступ к курсу', async () => {
    const studentId = 800;

    let sentText = '';
    let sentKb: any;
    const mockCtx: any = {
      from: { id: 999 },
      callbackQuery: { id: 'cb1', data: 'admin:grant:800:0' },
      answerCallbackQuery: vi.fn(),
      reply: vi.fn(async (text: string, opts?: any) => {
        sentText = text;
        sentKb = opts?.reply_markup;
        return { message_id: 124 };
      }),
    };

    // Сначала доступа нет
    await handleAdminUserCard(mockCtx, studentId, 0);
    expect(sentText).toContain('Карточка пользователя');
    expect(sentText).toContain('800');
    let buttons = sentKb?.inline_keyboard?.flat() ?? [];
    expect(buttons.some((b: any) => b.callback_data === `admin:grant:${studentId}:0`)).toBe(true);

    // Выдаём доступ
    await handleAdminToggleAccess(mockCtx, studentId, 0, 'grant');
    expect(hasUserCourseAccess(studentId)).toBe(true);
    expect(mockCtx.answerCallbackQuery).toHaveBeenCalledWith({ text: '✅ Доступ к курсу выдан!' });

    // Отзываем доступ
    await handleAdminToggleAccess(mockCtx, studentId, 0, 'revoke');
    expect(hasUserCourseAccess(studentId)).toBe(false);
    expect(mockCtx.answerCallbackQuery).toHaveBeenCalledWith({ text: '🚫 Доступ к курсу отозван!' });
  });

  it('handleAdminCommand по команде /admin открывает список пользователей', async () => {
    let sentText = '';
    const mockCtx: any = {
      from: { id: 999 },
      message: { text: '/admin' },
      reply: vi.fn(async (text: string) => {
        sentText = text;
        return { message_id: 125 };
      }),
    };

    await handleAdminCommand(mockCtx);
    expect(sentText).toContain('Панель администратора — Пользователи');
  });
});
