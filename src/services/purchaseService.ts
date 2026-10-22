import { getDb } from '../db/connection.js';
import { createOrder, updateOrderStatus } from '../db/repositories/orders.js';
import {
  createPayment,
  updatePaymentYookassa,
  updatePaymentStatus,
  getPaymentByYookassaId,
  getPaymentById,
} from '../db/repositories/payments.js';
import { createCourseAccess } from '../db/repositories/courseAccess.js';
import { addOutboxEvent } from '../db/repositories/outbox.js';
import {
  saveWebhookEvent,
  markWebhookProcessed,
  isWebhookProcessed,
} from '../db/repositories/webhookEvents.js';
import { getUserByTelegramId } from '../db/repositories/users.js';
import { createYookassaPayment, getYookassaPayment, parseWebhookPayload } from '../payments/yookassa.js';
import { getBotInstance } from '../bot/botInstance.js';
import { notifyPurchase } from './notifyService.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface InitiatePurchaseResult {
  paymentUrl: string;
  paymentId: string;
  orderId: string;
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
  // Идемпотентность: проверяем, не обработан ли уже этот ивент
  if (isWebhookProcessed(eventId)) {
    logger.info({ eventId }, 'Webhook уже обработан, пропускаем');
    return;
  }

  const webhook = parseWebhookPayload(rawBody);
  const isNew = saveWebhookEvent(eventId, webhook.event, JSON.stringify(rawBody));
  if (!isNew) {
    logger.info({ eventId }, 'Webhook дублируется, пропускаем');
    return;
  }

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
    markWebhookProcessed(eventId, String(err));
    throw err;
  }
}

async function handlePaymentSucceeded(yookassaId: string): Promise<void> {
  const db = getDb();
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

  // Проверяем сумму
  const expectedRub = (config.coursePriceKopecks / 100).toFixed(2);
  if (verified.amount.value !== expectedRub || verified.amount.currency !== 'RUB') {
    logger.error({ verified, expected: expectedRub }, 'Несоответствие суммы платежа');
    return;
  }

  // Транзакционно обновляем статусы и создаём доступ
  db.transaction(() => {
    if (payment.status === 'succeeded') {
      logger.info({ yookassaId }, 'Платёж уже помечен как succeeded');
      return;
    }
    updatePaymentStatus(payment.id, 'succeeded');
    updateOrderStatus(payment.order_id, 'paid');

    const access = createCourseAccess(payment.telegram_id, payment.order_id);
    if (access) {
      addOutboxEvent('course_access_granted', {
        telegramId: payment.telegram_id,
        orderId: payment.order_id,
      });
      logger.info({ telegramId: payment.telegram_id }, 'Доступ к курсу создан');
    } else {
      logger.warn({ telegramId: payment.telegram_id }, 'Доступ уже существует (повторный webhook)');
    }
  })();

  // Уведомляем администраторов о покупке (вне транзакции)
  const user = getUserByTelegramId(payment.telegram_id);
  const bot = getBotInstance();
  if (bot) {
    void notifyPurchase(bot, {
      telegramId: payment.telegram_id,
      firstName: user?.first_name ?? null,
      lastName: user?.last_name ?? null,
      username: user?.username ?? null,
      amountRub: config.coursePriceRub,
      orderId: payment.order_id,
    });
  }
}

async function handlePaymentCanceled(yookassaId: string): Promise<void> {
  const payment = getPaymentByYookassaId(yookassaId);
  if (!payment) return;

  getDb().transaction(() => {
    updatePaymentStatus(payment.id, 'canceled');
    updateOrderStatus(payment.order_id, 'canceled');
  })();

  addOutboxEvent('payment_canceled', { telegramId: payment.telegram_id });
  logger.info({ yookassaId, telegramId: payment.telegram_id }, 'Платёж отменён');
}

export async function checkPaymentStatus(paymentId: string): Promise<string> {
  const payment = getPaymentById(paymentId);
  if (!payment) throw new Error('Платёж не найден');
  if (!payment.yookassa_id) return payment.status;

  const verified = await getYookassaPayment(payment.yookassa_id);
  if (verified.status !== payment.status) {
    updatePaymentStatus(payment.id, verified.status as Parameters<typeof updatePaymentStatus>[1]);
  }
  return verified.status;
}
