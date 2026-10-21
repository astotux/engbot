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

const { createOrder, updateOrderStatus, getOrderById, countPaidOrders, sumRevenue } = await import('../src/db/repositories/orders.js');
const { upsertUser } = await import('../src/db/repositories/users.js');

describe('Orders repository', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 100, username: 'buyer' });
  });

  it('создаёт заказ', () => {
    const order = createOrder(100, 50000);
    expect(order.telegram_id).toBe(100);
    expect(order.amount_kopecks).toBe(50000);
    expect(order.status).toBe('pending');
  });

  it('обновляет статус заказа', () => {
    const order = createOrder(100, 50000);
    updateOrderStatus(order.id, 'paid');
    const updated = getOrderById(order.id);
    expect(updated?.status).toBe('paid');
  });

  it('считает оплаченные заказы', () => {
    const o1 = createOrder(100, 50000);
    const o2 = createOrder(100, 50000);
    updateOrderStatus(o1.id, 'paid');
    updateOrderStatus(o2.id, 'paid');
    expect(countPaidOrders()).toBe(2);
  });

  it('считает выручку только по paid заказам', () => {
    const o1 = createOrder(100, 50000);
    const o2 = createOrder(100, 50000);
    updateOrderStatus(o1.id, 'paid');
    updateOrderStatus(o2.id, 'canceled');
    expect(sumRevenue()).toBe(50000);
  });

  it('не считает отменённые заказы в выручку', () => {
    const o = createOrder(100, 50000);
    updateOrderStatus(o.id, 'canceled');
    expect(countPaidOrders()).toBe(0);
  });
});
