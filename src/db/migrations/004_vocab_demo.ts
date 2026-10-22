import type Database from 'better-sqlite3';

export const version = 4;

export function up(db: Database.Database): void {
  db.exec(`
    -- Добавляем флаг использования демо-теста словаря
    -- 0 = ещё не использован, 1 = уже был пройден
    ALTER TABLE vocabulary_user_settings ADD COLUMN demo_quiz_used INTEGER NOT NULL DEFAULT 0;
  `);
}
