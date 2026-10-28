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
  streak_count: number;
  last_lesson_date: string | null;
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

export function updateStreak(telegramId: number): number {
  const db = getDb();
  const user = getUserByTelegramId(telegramId);
  if (!user) return 0;

  const today = new Date().toISOString().split('T')[0];
  const lastLessonDate = user.last_lesson_date;

  let newStreak = 1;

  if (lastLessonDate) {
    const lastDate = new Date(lastLessonDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = user.streak_count + 1;
    } else if (diffDays === 0) {
      // Already did a lesson today
      return user.streak_count;
    } else {
      // Reset streak
      newStreak = 1;
    }
  }

  db.prepare(`
    UPDATE users SET streak_count = ?, last_lesson_date = ? WHERE telegram_id = ?
  `).run(newStreak, today, telegramId);

  return newStreak;
}

