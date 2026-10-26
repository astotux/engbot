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
    adminIds: [999], yookassa: { enabled: true, shopId: 'test', secretKey: 'test', returnUrl: '' },
    webhook: { enabled: false, baseUrl: '', pathSecret: '' },
  },
}));
vi.mock('../src/utils/logger.js', () => ({
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
}));

const { upsertUser } = await import('../src/db/repositories/users.js');
const { createCourseAccess } = await import('../src/db/repositories/courseAccess.js');
const {
  saveLessonNotification,
  getLessonNotification,
} = await import('../src/db/repositories/lessons.js');
const {
  scheduleLeadFunnel,
  cancelLeadFunnel,
  getFunnelDeliveriesForUser,
  getPendingFunnelDeliveries,
} = await import('../src/db/repositories/leadFunnel.js');
const { runFunnelTick, formatFunnelMessage } = await import('../src/scheduler/funnelScheduler.js');

describe('Автоворонка для лидов (чек-лист и брошенная оплата)', () => {
  const USER_ID = 404;

  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: USER_ID, username: 'lead_user' });
  });

  it('планирует 2 шага воронки: через 4 часа и через 24 часа', () => {
    const now = new Date('2026-10-26T12:00:00.000Z');
    scheduleLeadFunnel(USER_ID, 'checklist', now);

    const deliveries = getFunnelDeliveriesForUser(USER_ID);
    expect(deliveries.length).toBe(2);

    expect(deliveries[0]?.step).toBe(1);
    expect(deliveries[0]?.trigger_type).toBe('checklist');
    expect(deliveries[0]?.status).toBe('pending');
    expect(deliveries[0]?.scheduled_at).toBe('2026-10-26T16:00:00.000Z'); // +4h

    expect(deliveries[1]?.step).toBe(2);
    expect(deliveries[1]?.trigger_type).toBe('checklist');
    expect(deliveries[1]?.status).toBe('pending');
    expect(deliveries[1]?.scheduled_at).toBe('2026-10-27T12:00:00.000Z'); // +24h
  });

  it('НЕ планирует воронку, если у пользователя уже куплен курс', () => {
    createCourseAccess(USER_ID, null, 'active');
    scheduleLeadFunnel(USER_ID, 'checklist');

    const deliveries = getFunnelDeliveriesForUser(USER_ID);
    expect(deliveries.length).toBe(0);
  });

  it('повторный триггер (например, брошенная оплата после чек-листа) не дублирует записи', () => {
    const t1 = new Date('2026-10-26T12:00:00.000Z');
    scheduleLeadFunnel(USER_ID, 'checklist', t1);

    const t2 = new Date('2026-10-26T13:00:00.000Z');
    scheduleLeadFunnel(USER_ID, 'buy_abandoned', t2);

    const deliveries = getFunnelDeliveriesForUser(USER_ID);
    expect(deliveries.length).toBe(2);
    expect(deliveries[0]?.trigger_type).toBe('buy_abandoned');
  });

  it('cancelLeadFunnel отменяет все ожидающие шаги воронки после покупки', () => {
    scheduleLeadFunnel(USER_ID, 'checklist');
    cancelLeadFunnel(USER_ID);

    const deliveries = getFunnelDeliveriesForUser(USER_ID);
    expect(deliveries.every((d) => d.status === 'skipped')).toBe(true);
  });

  it('runFunnelTick отправляет шаг 1 через 4 часа и сохраняет уведомление для очистки', async () => {
    const base = new Date('2026-10-26T10:00:00.000Z');
    scheduleLeadFunnel(USER_ID, 'checklist', base);

    let sentText = '';
    let sentKb: any;
    const mockBot: any = {
      api: {
        deleteMessage: vi.fn(),
        sendMessage: vi.fn(async (chatId: number, text: string, opts?: any) => {
          sentText = text;
          sentKb = opts?.reply_markup;
          return { message_id: 888 };
        }),
      },
    };

    // Спустя 2 часа — ничего не отправляется
    const after2h = new Date('2026-10-26T12:00:00.000Z');
    const sentCount2h = await runFunnelTick(mockBot, after2h);
    expect(sentCount2h).toBe(0);

    // Спустя 4 часа — отправляется шаг 1
    const after4h = new Date('2026-10-26T14:01:00.000Z');
    const sentCount4h = await runFunnelTick(mockBot, after4h);
    expect(sentCount4h).toBe(1);
    expect(sentText).toContain('Секрет быстрого старта: разбор главной ошибки новичков');
    expect(sentText).toContain('Ошибка №1: Зубрить длинные списки слов');

    const buttons = sentKb?.inline_keyboard?.flat() ?? [];
    expect(buttons.some((b: any) => b.callback_data === 'funnel:buy')).toBe(true);
    expect(buttons.some((b: any) => b.callback_data === 'funnel:menu')).toBe(true);

    // Проверяем, что сообщение зарегистрировано как уведомление для отслеживания удаления
    const notif = getLessonNotification(USER_ID);
    expect(notif?.message_id).toBe(888);
  });

  it('runFunnelTick отправляет шаг 2 через 24 часа с разбором страхов', async () => {
    const base = new Date('2026-10-26T10:00:00.000Z');
    scheduleLeadFunnel(USER_ID, 'checklist', base);

    let sentText = '';
    const mockBot: any = {
      api: {
        deleteMessage: vi.fn(),
        sendMessage: vi.fn(async (chatId: number, text: string) => {
          sentText = text;
          return { message_id: 999 };
        }),
      },
    };

    // Спустя 24 часа 5 минут
    const after25h = new Date('2026-10-27T10:05:00.000Z');
    const count = await runFunnelTick(mockBot, after25h);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(sentText).toContain('«А вдруг у меня не получится?»');
    expect(sentText).toContain('У меня нет времени');
    expect(sentText).toContain('У меня языковой барьер');
  });

  it('runFunnelTick пропускает отправку, если пользователь успел купить курс до срабатывания', async () => {
    const base = new Date('2026-10-26T10:00:00.000Z');
    scheduleLeadFunnel(USER_ID, 'checklist', base);

    // Пользователь купил курс
    createCourseAccess(USER_ID, null, 'active');

    const mockBot: any = {
      api: { sendMessage: vi.fn() },
    };

    const after4h = new Date('2026-10-26T15:00:00.000Z');
    const sent = await runFunnelTick(mockBot, after4h);
    expect(sent).toBe(0);
    expect(mockBot.api.sendMessage).not.toHaveBeenCalled();
  });
});
