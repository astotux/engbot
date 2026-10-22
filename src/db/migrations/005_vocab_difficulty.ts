import type Database from 'better-sqlite3';

export const version = 5;

export function up(db: Database.Database): void {
  db.exec(`
    -- Добавляем уровень сложности слов: 'A1-A2' | 'B1-B2' | 'C1-C2'
    ALTER TABLE vocabulary_words ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'A1-A2';
    CREATE INDEX IF NOT EXISTS idx_vocab_words_diff ON vocabulary_words(difficulty, is_active);

    -- Добавляем выбранный уровень в настройки пользователя
    ALTER TABLE vocabulary_user_settings ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'A1-A2';
  `);
}
