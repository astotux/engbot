import { getDb } from '../connection.js';

export interface OutboxEvent {
  id: number;
  event_type: string;
  payload: string;
  status: 'pending' | 'processed' | 'failed';
  attempts: number;
  created_at: string;
  processed_at: string | null;
  last_error: string | null;
}

export function addOutboxEvent(eventType: string, payload: unknown): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO outbox (event_type, payload)
    VALUES (?, ?)
  `).run(eventType, JSON.stringify(payload));
  return result.lastInsertRowid as number;
}

export function getPendingOutboxEvents(limit = 20): OutboxEvent[] {
  return getDb()
    .prepare(`
      SELECT * FROM outbox
      WHERE status = 'pending' AND attempts < 5
      ORDER BY created_at ASC
      LIMIT ${limit}
    `)
    .all() as OutboxEvent[];
}

export function markOutboxProcessed(id: number): void {
  getDb()
    .prepare("UPDATE outbox SET status = 'processed', processed_at = datetime('now') WHERE id = ?")
    .run(id);
}

export function markOutboxFailed(id: number, error: string): void {
  getDb()
    .prepare(`
      UPDATE outbox SET attempts = attempts + 1, last_error = ?
      WHERE id = ?
    `)
    .run(error, id);
}
