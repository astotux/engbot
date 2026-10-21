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
const { createOrder } = await import('../src/db/repositories/orders.js');
const {
  createPayment,
  updatePaymentYookassa,
  updatePaymentStatus,
  getPaymentByYookassaId,
  getPaymentById,
} = await import('../src/db/repositories/payments.js');

describe('Payments repository', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 200, username: 'payer' });
  });

  it('создаёт платёж', () => {
    const order = createOrder(200, 50000);
    const payment = createPayment(order.id, 200, 50000);
    expect(payment.order_id).toBe(order.id);
    expect(payment.telegram_id).toBe(200);
    expect(payment.status).toBe('pending');
    expect(payment.idempotence_key).toBeTruthy();
  });

  it('обновляет данные YooKassa', () => {
    const order = createOrder(200, 50000);
    const payment = createPayment(order.id, 200, 50000);
    updatePaymentYookassa(payment.id, 'yk-123', 'https://pay.url');

    const updated = getPaymentById(payment.id);
    expect(updated?.yookassa_id).toBe('yk-123');
    expect(updated?.payment_url).toBe('https://pay.url');
  });

  it('находит платёж по yookassa_id', () => {
    const order = createOrder(200, 50000);
    const payment = createPayment(order.id, 200, 50000);
    updatePaymentYookassa(payment.id, 'yk-456', 'https://pay.url2');

    const found = getPaymentByYookassaId('yk-456');
    expect(found?.id).toBe(payment.id);
  });

  it('обновляет статус платежа', () => {
    const order = createOrder(200, 50000);
    const payment = createPayment(order.id, 200, 50000);
    updatePaymentStatus(payment.id, 'succeeded');

    const updated = getPaymentById(payment.id);
    expect(updated?.status).toBe('succeeded');
  });

  it('каждый платёж имеет уникальный idempotence_key', () => {
    const order = createOrder(200, 50000);
    const p1 = createPayment(order.id, 200, 50000);
    const order2 = createOrder(200, 50000);
    const p2 = createPayment(order2.id, 200, 50000);
    expect(p1.idempotence_key).not.toBe(p2.idempotence_key);
  });
});
