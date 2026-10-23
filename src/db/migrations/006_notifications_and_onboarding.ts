import type Database from 'better-sqlite3';

export const version = 6;

export function up(db: Database.Database): void {
  db.exec(`
    -- Таблица для отслеживания отправленных уведомлений об уроках
    CREATE TABLE IF NOT EXISTS lesson_notifications (
      telegram_id INTEGER PRIMARY KEY,
      message_id  INTEGER NOT NULL,
      day_number  INTEGER NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Флаг прохождения первого онбординга настроек словаря
    ALTER TABLE vocabulary_user_settings ADD COLUMN is_onboarded INTEGER NOT NULL DEFAULT 0;

    -- Пользователи, у которых уже есть история сессий, считаются прошедшими онбординг
    UPDATE vocabulary_user_settings
    SET is_onboarded = 1
    WHERE telegram_id IN (SELECT DISTINCT telegram_id FROM vocabulary_sessions);
  `);
}
