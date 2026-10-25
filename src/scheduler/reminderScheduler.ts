import { getDb } from '../db/connection.js';
import { getActiveCourseUsers } from '../db/repositories/courseAccess.js';
import { getUserByTelegramId, setUserBlocked } from '../db/repositories/users.js';
import {
  getSubmission,
  saveLessonNotification,
  getLessonNotification,
  clearLessonNotification,
} from '../db/repositories/lessons.js';
import { getMskDateTimeParts } from '../utils/time.js';
import { logger } from '../utils/logger.js';
import { InlineKeyboard, type Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';

let reminderInterval: ReturnType<typeof setInterval> | null = null;

/** Часы по МСК для отправки уведомлений о непройденном уроке */
export const REMINDER_MSK_HOURS = [9, 15, 21] as const;

export function startReminderScheduler(bot: Bot<BotContext>): void {
  if (reminderInterval) return;
  reminderInterval = setInterval(() => { void runReminderTick(bot); }, 60_000);
  logger.info('Планировщик напоминаний запущен');
}

export function stopReminderScheduler(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

export async function runReminderTick(
  bot: Pick<Bot<BotContext>, 'api'>,
  now: Date = new Date(),
): Promise<number> {
  const db = getDb();
  const msk = getMskDateTimeParts(now);

  // Напоминания отправляем в 9:00, 15:00 и 21:00 по МСК (06:00, 12:00 и 18:00 UTC на сервере)
  if (!REMINDER_MSK_HOURS.includes(msk.hour as (typeof REMINDER_MSK_HOURS)[number])) {
    return 0;
  }

  const slotPrefix = `${msk.dateKey}T${String(msk.hour).padStart(2, '0')}:`;
  const users = getActiveCourseUsers();
  let sentCount = 0;

  for (const access of users) {
    const user = getUserByTelegramId(access.telegram_id);
    if (!user || user.is_blocked || !user.reminders_enabled) continue;

    const submission = getSubmission(access.telegram_id, access.current_day);
    if (submission) continue;

    const alreadySent = db
      .prepare(
        "SELECT id FROM reminders WHERE telegram_id = ? AND day_number = ? AND sent_at LIKE ? AND status = 'sent'",
      )
      .get(access.telegram_id, access.current_day, `${slotPrefix}%`) as { id: number } | undefined;

    if (alreadySent) continue;

    try {
      const prevNotif = getLessonNotification(access.telegram_id);
      if (prevNotif) {
        clearLessonNotification(access.telegram_id);
        if (bot.api.deleteMessage) {
          try {
            await bot.api.deleteMessage(access.telegram_id, prevNotif.message_id);
          } catch {
            // Предыдущее уведомление уже удалено
          }
        }
      }

      const kb = new InlineKeyboard().text('🚀 Начать урок', `start_scheduled_lesson:${access.current_day}`);
      const sentMsg = await bot.api.sendMessage(
        access.telegram_id,
        `📚 Привет! Ты ещё не выполнил(а) задание к уроку ${access.current_day}.\n\nНажми кнопку ниже, чтобы открыть урок 👇`,
        {
          parse_mode: 'HTML',
          reply_markup: kb,
        },
      );

      if (sentMsg?.message_id) {
        saveLessonNotification(access.telegram_id, sentMsg.message_id, access.current_day);
      }

      db.prepare(`
        INSERT OR REPLACE INTO reminders (telegram_id, day_number, scheduled_at, sent_at, status)
        VALUES (?, ?, ?, ?, 'sent')
      `).run(
        access.telegram_id,
        access.current_day,
        now.toISOString(),
        `${slotPrefix}${String(msk.minute).padStart(2, '0')}:00`,
      );

      sentCount++;
      logger.info({ telegramId: access.telegram_id, day: access.current_day, mskHour: msk.hour }, 'Напоминание отправлено');
    } catch (err: unknown) {
      if (String(err).includes('403') || String(err).includes('bot was blocked')) {
        setUserBlocked(access.telegram_id, true);
      }
      logger.error({ err, telegramId: access.telegram_id }, 'Ошибка отправки напоминания');
    }
  }

  return sentCount;
}
