import type Database from 'better-sqlite3';

export const version = 1;

export function up(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version   INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Пользователи
    CREATE TABLE IF NOT EXISTS users (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id     INTEGER NOT NULL UNIQUE,
      username        TEXT,
      first_name      TEXT,
      last_name       TEXT,
      language_code   TEXT,
      source          TEXT,
      registered_at   TEXT NOT NULL DEFAULT (datetime('now')),
      is_blocked      INTEGER NOT NULL DEFAULT 0,
      reminders_enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

    -- Заказы
    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY,
      telegram_id     INTEGER NOT NULL REFERENCES users(telegram_id),
      product_id      TEXT NOT NULL DEFAULT 'english_30_days',
      amount_kopecks  INTEGER NOT NULL,
      currency        TEXT NOT NULL DEFAULT 'RUB',
      status          TEXT NOT NULL DEFAULT 'pending',
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_orders_telegram_id ON orders(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    -- Платежи
    CREATE TABLE IF NOT EXISTS payments (
      id              TEXT PRIMARY KEY,
      order_id        TEXT NOT NULL REFERENCES orders(id),
      yookassa_id     TEXT UNIQUE,
      telegram_id     INTEGER NOT NULL,
      amount_kopecks  INTEGER NOT NULL,
      currency        TEXT NOT NULL DEFAULT 'RUB',
      status          TEXT NOT NULL DEFAULT 'pending',
      idempotence_key TEXT NOT NULL UNIQUE,
      payment_url     TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_yookassa_id ON payments(yookassa_id);
    CREATE INDEX IF NOT EXISTS idx_payments_telegram_id ON payments(telegram_id);

    -- Доступ к курсу
    CREATE TABLE IF NOT EXISTS course_access (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id     INTEGER NOT NULL,
      product_id      TEXT NOT NULL DEFAULT 'english_30_days',
      order_id        TEXT REFERENCES orders(id),
      purchased_at    TEXT NOT NULL DEFAULT (datetime('now')),
      started_at      TEXT,
      current_day     INTEGER NOT NULL DEFAULT 0,
      status          TEXT NOT NULL DEFAULT 'pending',
      completed_at    TEXT,
      send_hour       INTEGER,
      send_minute     INTEGER,
      paused          INTEGER NOT NULL DEFAULT 0,
      UNIQUE(telegram_id, product_id)
    );
    CREATE INDEX IF NOT EXISTS idx_course_access_telegram_id ON course_access(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_course_access_status ON course_access(status);

    -- Доставка уроков
    CREATE TABLE IF NOT EXISTS lesson_deliveries (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id     INTEGER NOT NULL,
      day_number      INTEGER NOT NULL,
      scheduled_at    TEXT NOT NULL,
      sent_at         TEXT,
      status          TEXT NOT NULL DEFAULT 'pending',
      attempts        INTEGER NOT NULL DEFAULT 0,
      last_error      TEXT,
      UNIQUE(telegram_id, day_number)
    );
    CREATE INDEX IF NOT EXISTS idx_lesson_deliveries_scheduled ON lesson_deliveries(scheduled_at, status);
    CREATE INDEX IF NOT EXISTS idx_lesson_deliveries_user ON lesson_deliveries(telegram_id);

    -- Ответы на задания
    CREATE TABLE IF NOT EXISTS lesson_submissions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id     INTEGER NOT NULL,
      day_number      INTEGER NOT NULL,
      answer_text     TEXT NOT NULL,
      is_correct      INTEGER,
      score           INTEGER,
      attempts        INTEGER NOT NULL DEFAULT 1,
      submitted_at    TEXT NOT NULL DEFAULT (datetime('now')),
      checked_at      TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_submissions_user_day ON lesson_submissions(telegram_id, day_number);

    -- Прогресс
    CREATE TABLE IF NOT EXISTS user_progress (
      telegram_id     INTEGER PRIMARY KEY REFERENCES users(telegram_id),
      completed_days  TEXT NOT NULL DEFAULT '[]',
      total_correct   INTEGER NOT NULL DEFAULT 0,
      total_wrong     INTEGER NOT NULL DEFAULT 0,
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Напоминания
    CREATE TABLE IF NOT EXISTS reminders (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id     INTEGER NOT NULL,
      day_number      INTEGER NOT NULL,
      scheduled_at    TEXT NOT NULL,
      sent_at         TEXT,
      status          TEXT NOT NULL DEFAULT 'pending',
      UNIQUE(telegram_id, day_number)
    );
    CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_at, status);

    -- События webhook
    CREATE TABLE IF NOT EXISTS webhook_events (
      id              TEXT PRIMARY KEY,
      event_type      TEXT NOT NULL,
      payload         TEXT NOT NULL,
      processed       INTEGER NOT NULL DEFAULT 0,
      processed_at    TEXT,
      received_at     TEXT NOT NULL DEFAULT (datetime('now')),
      error           TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

    -- Outbox для надёжной доставки сообщений
    CREATE TABLE IF NOT EXISTS outbox (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type      TEXT NOT NULL,
      payload         TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'pending',
      attempts        INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      processed_at    TEXT,
      last_error      TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);

    -- Аудит администратора
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id        INTEGER NOT NULL,
      action          TEXT NOT NULL,
      target_telegram_id INTEGER,
      details         TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at);
  `);
}
