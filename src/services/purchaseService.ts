import { getDb } from '../db/connection.js';
import { createOrder, updateOrderStatus } from '../db/repositories/orders.js';
import {
  createPayment,
  updatePaymentYookassa,
  updatePaymentStatus,
  getPaymentByYookassaId,
  getPaymentById,
  getPendingPaymentsOlderThan,
  hasSucceededPaymentForUser,
  hasNewerPendingPaymentForUser,
  type Payment,
} from '../db/repositories/payments.js';
import { createCourseAccess, hasUserCourseAccess } from '../db/repositories/courseAccess.js';
import { addOutboxEvent } from '../db/repositories/outbox.js';
import {
  saveWebhookEvent,
  markWebhookProcessed,
  markWebhookFailed,
  isWebhookProcessed,
} from '../db/repositories/webhookEvents.js';
import { getUserByTelegramId } from '../db/repositories/users.js';
import {
  createYookassaPayment,
  getYookassaPayment,
  parseWebhookPayload,
  type YookassaPayment,
} from '../payments/yookassa.js';
import { getBotInstance } from '../bot/botInstance.js';
import { notifyPurchase } from './notifyService.js';
import { scheduleAllLessons } from './lessonService.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface InitiatePurchaseResult {
  paymentUrl: string;
  paymentId: string;
  orderId: string;
}

export interface VerifyPaymentResult {
  status: 'succeeded' | 'canceled' | 'pending' | 'waiting_for_capture' | 'unknown';
  isPaid: boolean;
  message?: string;
}

export async function initiatePurchase(telegramId: number): Promise<InitiatePurchaseResult> {
  const db = getDb();

  // Создаём заказ и запись о платеже в одной транзакции
  const { order, payment } = db.transaction(() => {
    const order = createOrder(telegramId, config.coursePriceKopecks);
    const payment = createPayment(order.id, telegramId, config.coursePriceKopecks);
    return { order, payment };
  })();

  let yookassaPayment;
  try {
    yookassaPayment = await createYookassaPayment({
      orderId: order.id,
      telegramId,
      amountKopecks: config.coursePriceKopecks,
      idempotenceKey: payment.idempotence_key,
      description: 'Курс «Английский за 30 дней»',
    });
  } catch (err) {
    logger.error({ err, paymentId: payment.id }, 'Не удалось создать платёж в YooKassa');
    throw err;
  }

  // Сохраняем данные YooKassa
  updatePaymentYookassa(
    payment.id,
    yookassaPayment.id,
    yookassaPayment.confirmation?.confirmation_url ?? '',
  );

  const paymentUrl = yookassaPayment.confirmation?.confirmation_url;
  if (!paymentUrl) {
    throw new Error('YooKassa не вернула ссылку на оплату');
  }

  return { paymentUrl, paymentId: payment.id, orderId: order.id };
}

export async function handleWebhookEvent(rawBody: unknown, eventId: string): Promise<void> {
  // Идемпотентность: игнорируем только если webhook уже был успешно обработан (processed === 1)
  if (isWebhookProcessed(eventId)) {
    logger.info({ eventId }, 'Webhook уже успешно обработан, пропускаем');
    return;
  }

  const webhook = parseWebhookPayload(rawBody);
  // Сохраняем событие в БД, если его ещё нет
  saveWebhookEvent(eventId, webhook.event, JSON.stringify(rawBody));

  try {
    if (webhook.event === 'payment.succeeded') {
      await handlePaymentSucceeded(webhook.object.id);
    } else if (webhook.event === 'payment.canceled') {
      await handlePaymentCanceled(webhook.object.id);
    } else {
      logger.warn({ event: webhook.event }, 'Неизвестный тип webhook');
    }
    markWebhookProcessed(eventId);
  } catch (err) {
    markWebhookFailed(eventId, String(err));
    throw err;
  }
}

/**
 * Обрабатывает успешный платёж: обновляет БД, выдаёт активный доступ и планирует уроки
 */
export async function processPaymentSuccess(payment: Payment, _verified?: YookassaPayment): Promise<void> {
  const db = getDb();

  // Транзакционно обновляем статусы и создаём активный доступ к курсу
  db.transaction(() => {
    if (payment.status === 'succeeded') {
      logger.info({ paymentId: payment.id, yookassaId: payment.yookassa_id }, 'Платёж уже помечен как succeeded');
      return;
    }
    updatePaymentStatus(payment.id, 'succeeded');
    updateOrderStatus(payment.order_id, 'paid');

    const access = createCourseAccess(payment.telegram_id, payment.order_id, 'active');
    if (access) {
      addOutboxEvent('course_access_granted', {
        telegramId: payment.telegram_id,
        orderId: payment.order_id,
      });
      logger.info({ telegramId: payment.telegram_id }, 'Доступ к курсу активирован');
    } else {
      logger.warn({ telegramId: payment.telegram_id }, 'Доступ уже существует');
    }
  })();

  // Планируем все уроки для пользователя
  try {
    scheduleAllLessons(payment.telegram_id);
  } catch (err) {
    logger.error({ err, telegramId: payment.telegram_id }, 'Ошибка планирования уроков после оплаты');
  }

  // Уведомляем администраторов о покупке (вне транзакции) с реальной суммой заказа
  const user = getUserByTelegramId(payment.telegram_id);
  const bot = getBotInstance();
  if (bot) {
    void notifyPurchase(bot, {
      telegramId: payment.telegram_id,
      firstName: user?.first_name ?? null,
      lastName: user?.last_name ?? null,
      username: user?.username ?? null,
      amountRub: payment.amount_kopecks / 100,
      orderId: payment.order_id,
    });
  }
}

async function handlePaymentSucceeded(yookassaId: string): Promise<void> {
  const payment = getPaymentByYookassaId(yookassaId);
  if (!payment) {
    logger.error({ yookassaId }, 'Платёж не найден в БД');
    return;
  }

  // Верифицируем платёж через API (не доверяем только webhook)
  const verified = await getYookassaPayment(yookassaId);
  if (verified.status !== 'succeeded') {
    logger.warn({ yookassaId, status: verified.status }, 'Платёж не succeeded по данным API');
    return;
  }

  // Сверяем сумму и валюту с конкретным заказом из БД, а не с конфигом
  const expectedRub = (payment.amount_kopecks / 100).toFixed(2);
  if (verified.amount.value !== expectedRub || verified.amount.currency !== payment.currency) {
    logger.error(
      {
        verified,
        expectedRub,
        expectedCurrency: payment.currency,
        paymentId: payment.id,
      },
      'Несоответствие суммы или валюты платежа',
    );
    return;
  }

  await processPaymentSuccess(payment, verified);
}

async function handlePaymentCanceled(yookassaId: string): Promise<void> {
  const payment = getPaymentByYookassaId(yookassaId);
  if (!payment) return;

  getDb().transaction(() => {
    updatePaymentStatus(payment.id, 'canceled');
    updateOrderStatus(payment.order_id, 'canceled');
  })();

  // Если у пользователя уже есть доступ к курсу (например, вторая попытка оплаты прошла успешно),
  // или есть другой успешный платёж, или прямо сейчас оплачивается более новая попытка —
  // не отправляем сообщение об отмене старого платежа
  const hasAccess = hasUserCourseAccess(payment.telegram_id);
  const hasSucceeded = hasSucceededPaymentForUser(payment.telegram_id);
  const hasNewerPending = hasNewerPendingPaymentForUser(payment.telegram_id, payment.created_at);

  if (!hasAccess && !hasSucceeded && !hasNewerPending) {
    addOutboxEvent('payment_canceled', { telegramId: payment.telegram_id });
  } else {
    logger.info(
      { yookassaId, telegramId: payment.telegram_id, hasAccess, hasSucceeded, hasNewerPending },
      'Уведомление об отмене старого платежа пропущено (курс уже оплачен или есть более новая попытка)',
    );
  }

  logger.info({ yookassaId, telegramId: payment.telegram_id }, 'Платёж отменён');
}

/**
 * Проверяет платёж в ЮKassa и при необходимости финализирует его (выдаёт доступ).
 * Используется кнопкой «Проверить оплату» и фоновым планировщиком сверки.
 */
export async function verifyPaymentById(paymentId: string): Promise<VerifyPaymentResult> {
  const payment = getPaymentById(paymentId);
  if (!payment) {
    return { status: 'unknown', isPaid: false, message: 'Платёж не найден' };
  }

  if (payment.status === 'succeeded') {
    return { status: 'succeeded', isPaid: true };
  }

  if (!payment.yookassa_id) {
    return { status: payment.status, isPaid: false };
  }

  const verified = await getYookassaPayment(payment.yookassa_id);

  if (verified.status === 'succeeded') {
    const expectedRub = (payment.amount_kopecks / 100).toFixed(2);
    if (verified.amount.value !== expectedRub || verified.amount.currency !== payment.currency) {
      logger.error(
        { verified, expectedRub, paymentId: payment.id },
        'Несоответствие суммы платежа при верификации',
      );
      return { status: 'pending', isPaid: false, message: 'Несоответствие суммы платежа' };
    }

    await processPaymentSuccess(payment, verified);
    return { status: 'succeeded', isPaid: true };
  }

  if (verified.status === 'canceled') {
    await handlePaymentCanceled(payment.yookassa_id);
    return { status: 'canceled', isPaid: false };
  }

  if (verified.status !== payment.status) {
    updatePaymentStatus(payment.id, verified.status as Parameters<typeof updatePaymentStatus>[1]);
  }

  return { status: verified.status as VerifyPaymentResult['status'], isPaid: false };
}

/**
 * Фоновая сверка зависших платежей старше minAgeMinutes
 */
export async function reconcilePendingPayments(): Promise<{ checked: number; resolved: number }> {
  if (!config.yookassa.enabled) {
    return { checked: 0, resolved: 0 };
  }

  const pendingPayments = getPendingPaymentsOlderThan(5, 48);
  if (pendingPayments.length === 0) {
    return { checked: 0, resolved: 0 };
  }

  logger.info({ count: pendingPayments.length }, 'Запуск фоновой сверки незавершённых платежей');
  let resolved = 0;

  for (const payment of pendingPayments) {
    try {
      const result = await verifyPaymentById(payment.id);
      if (result.isPaid) {
        resolved++;
        logger.info(
          { paymentId: payment.id, telegramId: payment.telegram_id },
          'Платёж успешно подтверждён при фоновой сверке',
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      logger.error({ err, paymentId: payment.id }, 'Ошибка при фоновой сверке платежа');
    }
  }

  return { checked: pendingPayments.length, resolved };
}

export async function checkPaymentStatus(paymentId: string): Promise<string> {
  const result = await verifyPaymentById(paymentId);
  return result.status;
}
