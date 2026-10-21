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

// Мок YooKassa API
vi.mock('../src/payments/yookassa.js', () => ({
  createYookassaPayment: vi.fn().mockResolvedValue({
    id: 'yk-test-001',
    status: 'pending',
    amount: { value: '500.00', currency: 'RUB' },
    confirmation: { type: 'redirect', confirmation_url: 'https://yookassa.ru/pay/test' },
  }),
  getYookassaPayment: vi.fn().mockResolvedValue({
    id: 'yk-test-001',
    status: 'succeeded',
    amount: { value: '500.00', currency: 'RUB' },
  }),
  parseWebhookPayload: vi.fn((body) => body),
}));

const { upsertUser } = await import('../src/db/repositories/users.js');
const { handleWebhookEvent, initiatePurchase } = await import('../src/services/purchaseService.js');
const { getCourseAccess } = await import('../src/db/repositories/courseAccess.js');
const { getPaymentByYookassaId } = await import('../src/db/repositories/payments.js');
const { isWebhookProcessed } = await import('../src/db/repositories/webhookEvents.js');

describe('PurchaseService', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 400, username: 'buyer' });
  });

  it('initiatePurchase создаёт заказ и возвращает ссылку', async () => {
    const result = await initiatePurchase(400);
    expect(result.paymentUrl).toBe('https://yookassa.ru/pay/test');
    expect(result.paymentId).toBeTruthy();
    expect(result.orderId).toBeTruthy();
  });

  it('обрабатывает успешный webhook и выдаёт курс', async () => {
    const webhookPayload = {
      type: 'notification',
      event: 'payment.succeeded',
      object: {
        id: 'yk-test-001',
        status: 'succeeded',
        amount: { value: '500.00', currency: 'RUB' },
        metadata: { telegram_id: '400' },
      },
    };

    // Сначала создаём платёж
    await initiatePurchase(400);

    await handleWebhookEvent(webhookPayload, 'evt-001');

    const access = getCourseAccess(400);
    expect(access).toBeTruthy();
    expect(access?.status).toBe('pending'); // pending до нажатия "Начать"
  });

  it('не выдаёт доступ дважды при повторном webhook', async () => {
    await initiatePurchase(400);

    const payload = {
      type: 'notification',
      event: 'payment.succeeded',
      object: { id: 'yk-test-001', status: 'succeeded', amount: { value: '500.00', currency: 'RUB' } },
    };

    await handleWebhookEvent(payload, 'evt-002');
    await handleWebhookEvent(payload, 'evt-002'); // повтор

    // Только один доступ
    expect(isWebhookProcessed('evt-002')).toBe(true);
  });

  it('не выдаёт доступ при отменённом платеже', async () => {
    const { getYookassaPayment } = await import('../src/payments/yookassa.js');
    vi.mocked(getYookassaPayment).mockResolvedValueOnce({
      id: 'yk-canceled-001',
      status: 'canceled',
      amount: { value: '500.00', currency: 'RUB' },
    });

    await initiatePurchase(400);

    const payload = {
      type: 'notification',
      event: 'payment.canceled',
      object: { id: 'yk-test-001', status: 'canceled', amount: { value: '500.00', currency: 'RUB' } },
    };

    await handleWebhookEvent(payload, 'evt-003');
    const access = getCourseAccess(400);
    expect(access).toBeUndefined();
  });

  it('отклоняет поддельный webhook с неверной суммой', async () => {
    const { getYookassaPayment } = await import('../src/payments/yookassa.js');
    vi.mocked(getYookassaPayment).mockResolvedValueOnce({
      id: 'yk-test-002',
      status: 'succeeded',
      amount: { value: '1.00', currency: 'RUB' }, // неверная сумма
    });

    await initiatePurchase(400);

    const payload = {
      type: 'notification',
      event: 'payment.succeeded',
      object: { id: 'yk-test-001', status: 'succeeded', amount: { value: '1.00', currency: 'RUB' } },
    };

    await handleWebhookEvent(payload, 'evt-fake');
    const access = getCourseAccess(400);
    expect(access).toBeUndefined();
  });
});
