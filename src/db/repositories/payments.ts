import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../connection.js';

export interface Payment {
  id: string;
  order_id: string;
  yookassa_id: string | null;
  telegram_id: number;
  amount_kopecks: number;
  currency: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  idempotence_key: string;
  payment_url: string | null;
  created_at: string;
  updated_at: string;
}

export function createPayment(
  orderId: string,
  telegramId: number,
  amountKopecks: number,
): Payment {
  const id = uuidv4();
  const idempotenceKey = uuidv4();
  const db = getDb();
  db.prepare(`
    INSERT INTO payments (id, order_id, telegram_id, amount_kopecks, idempotence_key)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, orderId, telegramId, amountKopecks, idempotenceKey);
  return db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as Payment;
}

export function updatePaymentYookassa(
  paymentId: string,
  yookassaId: string,
  paymentUrl: string,
): void {
  getDb()
    .prepare(
      "UPDATE payments SET yookassa_id = ?, payment_url = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .run(yookassaId, paymentUrl, paymentId);
}

export function updatePaymentStatus(
  paymentId: string,
  status: Payment['status'],
): void {
  getDb()
    .prepare("UPDATE payments SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, paymentId);
}

export function getPaymentById(id: string): Payment | undefined {
  return getDb().prepare('SELECT * FROM payments WHERE id = ?').get(id) as Payment | undefined;
}

export function getPaymentByYookassaId(yookassaId: string): Payment | undefined {
  return getDb()
    .prepare('SELECT * FROM payments WHERE yookassa_id = ?')
    .get(yookassaId) as Payment | undefined;
}

export function getPaymentByOrderId(orderId: string): Payment | undefined {
  return getDb()
    .prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(orderId) as Payment | undefined;
}

export function getActivePaymentForUser(telegramId: number): Payment | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM payments WHERE telegram_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1",
    )
    .get(telegramId) as Payment | undefined;
}

export function getPendingPaymentsOlderThan(
  minAgeMinutes = 5,
  maxAgeHours = 48,
): Payment[] {
  return getDb()
    .prepare(
      `SELECT * FROM payments
       WHERE status = 'pending'
         AND yookassa_id IS NOT NULL
         AND created_at <= datetime('now', '-' || ? || ' minutes')
         AND created_at >= datetime('now', '-' || ? || ' hours')
       ORDER BY created_at ASC`,
    )
    .all(minAgeMinutes, maxAgeHours) as Payment[];
}
