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
const {
  handleWebhookEvent,
  initiatePurchase,
  verifyPaymentById,
  reconcilePendingPayments,
} = await import('../src/services/purchaseService.js');
const { getCourseAccess } = await import('../src/db/repositories/courseAccess.js');
const { getPaymentByYookassaId, getPaymentById } = await import('../src/db/repositories/payments.js');
const { isWebhookProcessed } = await import('../src/db/repositories/webhookEvents.js');
const { getYookassaPayment } = await import('../src/payments/yookassa.js');
const { config } = await import('../src/config/index.js');

describe('PurchaseService', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 400, username: 'buyer' });
    (config as { coursePriceKopecks: number }).coursePriceKopecks = 50000;
    (config.yookassa as { enabled: boolean }).enabled = true;
    vi.mocked(getYookassaPayment).mockReset();
    vi.mocked(getYookassaPayment).mockResolvedValue({
      id: 'yk-test-001',
      status: 'succeeded',
      amount: { value: '500.00', currency: 'RUB' },
    });
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
    expect(access?.status).toBe('active'); // сразу active после подтверждения оплаты
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

  it('сверяет сумму платежа с конкретным заказом из БД, даже если config изменился', async () => {
    const { getYookassaPayment } = await import('../src/payments/yookassa.js');
    vi.mocked(getYookassaPayment).mockResolvedValue({
      id: 'yk-price-change',
      status: 'succeeded',
      amount: { value: '500.00', currency: 'RUB' }, // оплата по старой цене заказа
    });

    // Создаём заказ по цене 500 руб (50000 коп)
    const { paymentId } = await initiatePurchase(400);
    const payment = getPaymentById(paymentId);
    expect(payment?.amount_kopecks).toBe(50000);

    // Привязываем yookassaId
    testDb.prepare("UPDATE payments SET yookassa_id = 'yk-price-change' WHERE id = ?").run(paymentId);

    // Эмулируем изменение цены в config на 600 руб (60000 коп)
    (config as { coursePriceKopecks: number }).coursePriceKopecks = 60000;

    const payload = {
      type: 'notification',
      event: 'payment.succeeded',
      object: { id: 'yk-price-change', status: 'succeeded', amount: { value: '500.00', currency: 'RUB' } },
    };

    // Вебхук со старой ценой 500.00 ДОЛЖЕН успешно пройти, т.к. сверяется с заказом
    await handleWebhookEvent(payload, 'evt-price-change');

    const access = getCourseAccess(400);
    expect(access).toBeTruthy();
    expect(access?.status).toBe('active');

    // Возвращаем цену назад
    (config as { coursePriceKopecks: number }).coursePriceKopecks = 50000;
  });

  it('повторный вебхук (retry) выполняется при ошибке первой попытки', async () => {
    const { getYookassaPayment } = await import('../src/payments/yookassa.js');

    // Первая попытка падает с сетевой ошибкой
    vi.mocked(getYookassaPayment).mockRejectedValueOnce(new Error('Network failure'));

    await initiatePurchase(400);

    const payload = {
      type: 'notification',
      event: 'payment.succeeded',
      object: { id: 'yk-test-001', status: 'succeeded', amount: { value: '500.00', currency: 'RUB' } },
    };

    // Первая попытка завершается ошибкой
    await expect(handleWebhookEvent(payload, 'evt-retry-test')).rejects.toThrow('Network failure');
    // Событие НЕ должно быть помечено как обработанное
    expect(isWebhookProcessed('evt-retry-test')).toBe(false);

    // Вторая попытка от ЮKassa
    vi.mocked(getYookassaPayment).mockResolvedValueOnce({
      id: 'yk-test-001',
      status: 'succeeded',
      amount: { value: '500.00', currency: 'RUB' },
    });

    await handleWebhookEvent(payload, 'evt-retry-test');
    // Теперь успешно обработано!
    expect(isWebhookProcessed('evt-retry-test')).toBe(true);
    const access = getCourseAccess(400);
    expect(access?.status).toBe('active');
  });

  it('verifyPaymentById успешно проверяет и финализирует оплаченный платёж', async () => {
    const { getYookassaPayment } = await import('../src/payments/yookassa.js');
    vi.mocked(getYookassaPayment).mockResolvedValueOnce({
      id: 'yk-verify-01',
      status: 'succeeded',
      amount: { value: '500.00', currency: 'RUB' },
    });

    const { paymentId } = await initiatePurchase(400);
    testDb.prepare("UPDATE payments SET yookassa_id = 'yk-verify-01' WHERE id = ?").run(paymentId);

    const result = await verifyPaymentById(paymentId);
    expect(result.isPaid).toBe(true);
    expect(result.status).toBe('succeeded');

    const payment = getPaymentById(paymentId);
    expect(payment?.status).toBe('succeeded');

    const access = getCourseAccess(400);
    expect(access).toBeTruthy();
    expect(access?.status).toBe('active');
  });

  it('reconcilePendingPayments находит и завершает зависшие платежи старше 5 минут', async () => {
    const { getYookassaPayment } = await import('../src/payments/yookassa.js');
    vi.mocked(getYookassaPayment).mockResolvedValue({
      id: 'yk-reconcile-01',
      status: 'succeeded',
      amount: { value: '500.00', currency: 'RUB' },
    });

    (config.yookassa as { enabled: boolean }).enabled = true;

    const { paymentId } = await initiatePurchase(400);
    // Делаем платёж созданным 10 минут назад
    testDb
      .prepare("UPDATE payments SET yookassa_id = 'yk-reconcile-01', created_at = datetime('now', '-10 minutes') WHERE id = ?")
      .run(paymentId);

    const reconcileResult = await reconcilePendingPayments();
    expect(reconcileResult.checked).toBe(1);
    expect(reconcileResult.resolved).toBe(1);

    const access = getCourseAccess(400);
    expect(access?.status).toBe('active');

    (config.yookassa as { enabled: boolean }).enabled = false;
  });
});
