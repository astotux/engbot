import type Database from 'better-sqlite3';

export const version = 8;

export function up(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_funnel_deliveries (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id   INTEGER NOT NULL,
      step          INTEGER NOT NULL,
      trigger_type  TEXT NOT NULL,
      scheduled_at  TEXT NOT NULL,
      sent_at       TEXT,
      status        TEXT NOT NULL DEFAULT 'pending',
      last_error    TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(telegram_id, step)
    );

    CREATE INDEX IF NOT EXISTS idx_funnel_pending
      ON lead_funnel_deliveries (status, scheduled_at);
  `);
}
