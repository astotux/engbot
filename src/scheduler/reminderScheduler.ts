import { getDb } from '../db/connection.js';
import { getActiveCourseUsers } from '../db/repositories/courseAccess.js';
import { getUserByTelegramId, setUserBlocked } from '../db/repositories/users.js';
import { getSubmission } from '../db/repositories/lessons.js';
import { logger } from '../utils/logger.js';
import type { Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';

let reminderInterval: ReturnType<typeof setInterval> | null = null;

export function startReminderScheduler(bot: Bot<BotContext>): void {
  if (reminderInterval) return;
  reminderInterval = setInterval(() => { void runReminderTick(bot); }, 3_600_000);
  logger.info('Планировщик напоминаний запущен');
}

export function stopReminderScheduler(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

async function runReminderTick(bot: Bot<BotContext>): Promise<void> {
  const db = getDb();
  const now = new Date();
  const hour = now.getUTCHours();

  // Напоминания отправляем вечером (18:00 UTC ≈ 21:00 МСК)
  if (hour !== 18) return;

  const users = getActiveCourseUsers();
  for (const access of users) {
    const user = getUserByTelegramId(access.telegram_id);
    if (!user || user.is_blocked || !user.reminders_enabled) continue;

    const submission = getSubmission(access.telegram_id, access.current_day);
    if (submission) continue;

    const today = new Date().toISOString().split('T')[0];
    const alreadySent = db
      .prepare(
        "SELECT id FROM reminders WHERE telegram_id = ? AND day_number = ? AND sent_at LIKE ? AND status = 'sent'",
      )
      .get(access.telegram_id, access.current_day, `${today}%`) as { id: number } | undefined;

    if (alreadySent) continue;

    try {
      await bot.api.sendMessage(
        access.telegram_id,
        `📚 Привет! Ты ещё не выполнил(а) задание к уроку ${access.current_day}.\n\nОтправь /lesson чтобы открыть урок.`,
      );

      db.prepare(`
        INSERT OR REPLACE INTO reminders (telegram_id, day_number, scheduled_at, sent_at, status)
        VALUES (?, ?, datetime('now'), datetime('now'), 'sent')
      `).run(access.telegram_id, access.current_day, new Date().toISOString());

      logger.info({ telegramId: access.telegram_id, day: access.current_day }, 'Напоминание отправлено');
    } catch (err: unknown) {
      if (String(err).includes('403')) {
        setUserBlocked(access.telegram_id, true);
      }
      logger.error({ err, telegramId: access.telegram_id }, 'Ошибка отправки напоминания');
    }
  }
}
