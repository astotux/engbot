import type Database from 'better-sqlite3';

export const version = 2;

export function up(db: Database.Database): void {
  db.exec(`
    -- Прогресс по шагам внутри дня
    CREATE TABLE IF NOT EXISTS lesson_step_progress (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id     INTEGER NOT NULL,
      day_number      INTEGER NOT NULL,
      step_index      INTEGER NOT NULL DEFAULT 0,
      completed_steps TEXT NOT NULL DEFAULT '[]',
      started_at      TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at    TEXT,
      UNIQUE(telegram_id, day_number)
    );
    CREATE INDEX IF NOT EXISTS idx_step_progress_user ON lesson_step_progress(telegram_id);
  `);
}
