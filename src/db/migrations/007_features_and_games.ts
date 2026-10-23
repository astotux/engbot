import type Database from 'better-sqlite3';

export const version = 7;

export function up(db: Database.Database): void {
  db.exec(`
    -- Еженедельные отчёты по воскресеньям
    CREATE TABLE IF NOT EXISTS weekly_reports (
      telegram_id INTEGER NOT NULL,
      week_key    TEXT NOT NULL,
      message_id  INTEGER,
      sent_at     TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (telegram_id, week_key)
    );

    -- Прогресс пользователя в мини-играх (Конструктор фраз и Тренажёр диалогов)
    CREATE TABLE IF NOT EXISTS minigame_progress (
      telegram_id              INTEGER PRIMARY KEY,
      phrases_completed        INTEGER NOT NULL DEFAULT 0,
      dialogues_completed_json TEXT NOT NULL DEFAULT '[]',
      demo_builder_used        INTEGER NOT NULL DEFAULT 0,
      demo_dialogue_used       INTEGER NOT NULL DEFAULT 0,
      updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
