import { getDb } from '../connection.js';

export interface WebhookEvent {
  id: string;
  event_type: string;
  payload: string;
  processed: number;
  processed_at: string | null;
  received_at: string;
  error: string | null;
}

export function saveWebhookEvent(id: string, eventType: string, payload: string): boolean {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM webhook_events WHERE id = ?')
    .get(id) as { id: string } | undefined;

  if (existing) return false;

  db.prepare(`
    INSERT INTO webhook_events (id, event_type, payload, processed)
    VALUES (?, ?, ?, 0)
  `).run(id, eventType, payload);
  return true;
}

export function markWebhookProcessed(id: string): void {
  getDb()
    .prepare(`
      UPDATE webhook_events
      SET processed = 1, processed_at = datetime('now'), error = NULL
      WHERE id = ?
    `)
    .run(id);
}

export function markWebhookFailed(id: string, error: string): void {
  getDb()
    .prepare(`
      UPDATE webhook_events
      SET processed = 0, error = ?
      WHERE id = ?
    `)
    .run(error, id);
}

export function isWebhookProcessed(id: string): boolean {
  const row = getDb()
    .prepare('SELECT processed FROM webhook_events WHERE id = ?')
    .get(id) as { processed: number } | undefined;
  return row?.processed === 1;
}
