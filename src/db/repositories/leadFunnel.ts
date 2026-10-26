import { getDb } from '../connection.js';
import { hasUserCourseAccess } from './courseAccess.js';

export interface LeadFunnelDelivery {
  id: number;
  telegram_id: number;
  step: number;
  trigger_type: 'checklist' | 'buy_abandoned';
  scheduled_at: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'skipped' | 'failed';
  last_error: string | null;
  created_at: string;
}

/**
 * Планирует шаги автоворонки (Шаг 1: через 4 часа, Шаг 2: через 24 часа).
 * Если у пользователя уже есть доступ к курсу — ничего не планирует.
 */
export function scheduleLeadFunnel(
  telegramId: number,
  triggerType: 'checklist' | 'buy_abandoned',
  baseDate: Date = new Date(),
): void {
  if (hasUserCourseAccess(telegramId)) return;

  const db = getDb();
  const step1Time = new Date(baseDate.getTime() + 4 * 3_600_000).toISOString();
  const step2Time = new Date(baseDate.getTime() + 24 * 3_600_000).toISOString();

  // Шаг 1: через 4 часа
  db.prepare(`
    INSERT INTO lead_funnel_deliveries (telegram_id, step, trigger_type, scheduled_at, status)
    VALUES (?, 1, ?, ?, 'pending')
    ON CONFLICT(telegram_id, step) DO UPDATE SET
      trigger_type = excluded.trigger_type,
      scheduled_at = CASE WHEN lead_funnel_deliveries.status = 'pending' THEN excluded.scheduled_at ELSE lead_funnel_deliveries.scheduled_at END
  `).run(telegramId, triggerType, step1Time);

  // Шаг 2: через 24 часа (1 день)
  db.prepare(`
    INSERT INTO lead_funnel_deliveries (telegram_id, step, trigger_type, scheduled_at, status)
    VALUES (?, 2, ?, ?, 'pending')
    ON CONFLICT(telegram_id, step) DO UPDATE SET
      trigger_type = excluded.trigger_type,
      scheduled_at = CASE WHEN lead_funnel_deliveries.status = 'pending' THEN excluded.scheduled_at ELSE lead_funnel_deliveries.scheduled_at END
  `).run(telegramId, triggerType, step2Time);
}

/**
 * Отменяет все ожидающие сообщения воронки (например, после успешной оплаты).
 */
export function cancelLeadFunnel(telegramId: number): void {
  getDb()
    .prepare("UPDATE lead_funnel_deliveries SET status = 'skipped' WHERE telegram_id = ? AND status = 'pending'")
    .run(telegramId);
}

export function getPendingFunnelDeliveries(nowIso: string): LeadFunnelDelivery[] {
  return getDb()
    .prepare(`
      SELECT * FROM lead_funnel_deliveries
      WHERE status = 'pending' AND datetime(scheduled_at) <= datetime(?)
      ORDER BY scheduled_at ASC
    `)
    .all(nowIso) as LeadFunnelDelivery[];
}

export function markFunnelSent(id: number): void {
  getDb()
    .prepare("UPDATE lead_funnel_deliveries SET status = 'sent', sent_at = datetime('now') WHERE id = ?")
    .run(id);
}

export function markFunnelSkipped(id: number): void {
  getDb()
    .prepare("UPDATE lead_funnel_deliveries SET status = 'skipped' WHERE id = ?")
    .run(id);
}

export function markFunnelFailed(id: number, error: string): void {
  getDb()
    .prepare("UPDATE lead_funnel_deliveries SET status = 'failed', last_error = ? WHERE id = ?")
    .run(error, id);
}

export function getFunnelDeliveriesForUser(telegramId: number): LeadFunnelDelivery[] {
  return getDb()
    .prepare('SELECT * FROM lead_funnel_deliveries WHERE telegram_id = ? ORDER BY step ASC')
    .all(telegramId) as LeadFunnelDelivery[];
}
