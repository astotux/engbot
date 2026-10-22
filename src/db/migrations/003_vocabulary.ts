import type Database from 'better-sqlite3';

export const version = 3;

export function up(db: Database.Database): void {
  db.exec(`
    -- ─── Словарь ───────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS vocabulary_words (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      english_word         TEXT NOT NULL,
      russian_translation  TEXT NOT NULL,
      -- Дополнительные допустимые переводы (JSON-массив строк)
      accepted_translations TEXT NOT NULL DEFAULT '[]',
      -- Пример предложения (может быть NULL)
      example_en           TEXT,
      example_ru           TEXT,
      -- Признак активности (0 — слово скрыто, 1 — используется)
      is_active            INTEGER NOT NULL DEFAULT 1,
      created_at           TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_vocab_words_active ON vocabulary_words(is_active);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_vocab_words_english ON vocabulary_words(english_word);

    -- ─── Прогресс пользователя по словам ───────────────────────────────────────
    CREATE TABLE IF NOT EXISTS user_vocabulary (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id       INTEGER NOT NULL REFERENCES users(telegram_id),
      word_id           INTEGER NOT NULL REFERENCES vocabulary_words(id),
      -- Дата первого просмотра слова
      seen_at           TEXT NOT NULL DEFAULT (datetime('now')),
      -- Суммарная статистика
      attempts          INTEGER NOT NULL DEFAULT 0,
      correct_answers   INTEGER NOT NULL DEFAULT 0,
      wrong_answers     INTEGER NOT NULL DEFAULT 0,
      last_attempt_at   TEXT,
      -- Слово считается усвоенным когда correct_in_a_row >= 3 и accuracy >= 0.75
      mastered          INTEGER NOT NULL DEFAULT 0,
      mastered_at       TEXT,
      -- Для планирования повторений
      next_review_at    TEXT,
      UNIQUE(telegram_id, word_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_vocab_user ON user_vocabulary(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_user_vocab_word ON user_vocabulary(word_id);
    CREATE INDEX IF NOT EXISTS idx_user_vocab_mastered ON user_vocabulary(telegram_id, mastered);

    -- ─── Сессии занятий ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS vocabulary_sessions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id   INTEGER NOT NULL REFERENCES users(telegram_id),
      -- 'study' | 'quiz' | 'review_errors'
      session_type  TEXT NOT NULL,
      -- 'active' | 'completed' | 'cancelled'
      status        TEXT NOT NULL DEFAULT 'active',
      -- Настройки снимок на момент старта (JSON)
      settings_json TEXT NOT NULL DEFAULT '{}',
      started_at    TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at  TEXT,
      -- Итоги (заполняются при завершении)
      total_questions  INTEGER,
      correct_count    INTEGER,
      wrong_count      INTEGER,
      skipped_count    INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_vocab_sessions_user ON vocabulary_sessions(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_vocab_sessions_status ON vocabulary_sessions(status);

    -- ─── Вопросы сессии ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS vocabulary_session_questions (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id     INTEGER NOT NULL REFERENCES vocabulary_sessions(id),
      word_id        INTEGER NOT NULL REFERENCES vocabulary_words(id),
      question_order INTEGER NOT NULL,
      -- 'test' | 'written'
      question_type  TEXT NOT NULL,
      -- 'en_to_ru' | 'ru_to_en'
      direction      TEXT NOT NULL,
      -- Варианты ответа для теста (JSON-массив строк)
      options_json   TEXT NOT NULL DEFAULT '[]',
      -- Правильный вариант (текст, а не индекс — защита от перемешивания)
      correct_answer TEXT NOT NULL,
      -- Ответ пользователя (NULL пока не ответил)
      user_answer    TEXT,
      -- Нормализованный ответ
      user_answer_normalized TEXT,
      -- 'correct' | 'wrong' | 'skipped' | NULL
      result         TEXT,
      -- 'pending' | 'answered' | 'skipped'
      status         TEXT NOT NULL DEFAULT 'pending',
      answered_at    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_vocab_questions_session ON vocabulary_session_questions(session_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_vocab_questions_order ON vocabulary_session_questions(session_id, question_order);

    -- ─── История ответов ───────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS vocabulary_answer_history (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id   INTEGER NOT NULL REFERENCES users(telegram_id),
      word_id       INTEGER NOT NULL REFERENCES vocabulary_words(id),
      session_id    INTEGER REFERENCES vocabulary_sessions(id),
      question_id   INTEGER REFERENCES vocabulary_session_questions(id),
      -- Сырой ответ пользователя
      raw_answer    TEXT NOT NULL,
      -- 'correct' | 'wrong'
      result        TEXT NOT NULL,
      -- 'test' | 'written'
      answer_type   TEXT NOT NULL,
      direction     TEXT NOT NULL,
      answered_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_vocab_history_user ON vocabulary_answer_history(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_vocab_history_word ON vocabulary_answer_history(word_id);
    CREATE INDEX IF NOT EXISTS idx_vocab_history_session ON vocabulary_answer_history(session_id);

    -- ─── Настройки пользователя ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS vocabulary_user_settings (
      telegram_id   INTEGER PRIMARY KEY REFERENCES users(telegram_id),
      -- 'en_to_ru' | 'ru_to_en'
      direction     TEXT NOT NULL DEFAULT 'en_to_ru',
      -- 'test' | 'written' | 'alternating'
      answer_mode   TEXT NOT NULL DEFAULT 'test',
      -- Следующий режим при чередовании ('test' или 'written')
      alt_next      TEXT NOT NULL DEFAULT 'test',
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
