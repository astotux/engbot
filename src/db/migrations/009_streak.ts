import { Database } from 'better-sqlite3';

export const version = 9;

export function up(db: Database): void {
  db.exec(`
    ALTER TABLE users ADD COLUMN streak_count INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE users ADD COLUMN last_lesson_date TEXT;
  `);
}
