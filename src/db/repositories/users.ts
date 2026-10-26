import { getDb } from '../connection.js';

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  source: string | null;
  registered_at: string;
  is_blocked: number;
  reminders_enabled: number;
}

export interface UpsertUserInput {
  telegram_id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  language_code?: string | null;
  source?: string | null;
}

export function upsertUser(input: UpsertUserInput): { user: User; isNew: boolean } {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(input.telegram_id) as User | undefined;

  if (existing) {
    db.prepare(`
      UPDATE users SET
        username = COALESCE(?, username),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        language_code = COALESCE(?, language_code)
      WHERE telegram_id = ?
    `).run(input.username, input.first_name, input.last_name, input.language_code, input.telegram_id);

    const updated = db
      .prepare('SELECT * FROM users WHERE telegram_id = ?')
      .get(input.telegram_id) as User;
    return { user: updated, isNew: false };
  }

  db.prepare(`
    INSERT INTO users (telegram_id, username, first_name, last_name, language_code, source)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    input.telegram_id,
    input.username ?? null,
    input.first_name ?? null,
    input.last_name ?? null,
    input.language_code ?? null,
    input.source ?? null,
  );

  const created = db
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(input.telegram_id) as User;
  return { user: created, isNew: true };
}

export function getUserByTelegramId(telegramId: number): User | undefined {
  return getDb()
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(telegramId) as User | undefined;
}

export function setUserBlocked(telegramId: number, blocked: boolean): void {
  getDb()
    .prepare('UPDATE users SET is_blocked = ? WHERE telegram_id = ?')
    .run(blocked ? 1 : 0, telegramId);
}

export function setRemindersEnabled(telegramId: number, enabled: boolean): void {
  getDb()
    .prepare('UPDATE users SET reminders_enabled = ? WHERE telegram_id = ?')
    .run(enabled ? 1 : 0, telegramId);
}

export function countUsers(): number {
  const row = getDb().prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  return row.cnt;
}

export function getUsersPaginated(limit: number, offset: number): User[] {
  return getDb()
    .prepare('SELECT * FROM users ORDER BY id DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as User[];
}
