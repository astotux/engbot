import { InlineKeyboard, type Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { getDb } from '../db/connection.js';
import { getActiveCourseUsers } from '../db/repositories/courseAccess.js';
import { getUserByTelegramId, setUserBlocked } from '../db/repositories/users.js';
import { getCompletedDays } from '../db/repositories/lessons.js';
import { countSeenWords, countMasteredWords } from '../db/repositories/vocabulary.js';
import { getUserAchievements } from '../services/lessonService.js';
import { getLessonByDay } from '../content/course.js';
import { getMskDateTimeParts } from '../utils/time.js';
import { logger } from '../utils/logger.js';

let weeklyInterval: ReturnType<typeof setInterval> | null = null;

/** Час по Москве для отправки воскресного отчёта (19:00 МСК = 16:00 UTC на сервере) */
export const WEEKLY_REPORT_MSK_HOUR = 19;

export function startWeeklyReportScheduler(bot: Bot<BotContext>): void {
  if (weeklyInterval) return;
  weeklyInterval = setInterval(() => {
    void runWeeklyReportTick(bot);
  }, 1_800_000); // проверка каждые 30 минут
  logger.info('Планировщик еженедельных отчётов запущен');
}

export function stopWeeklyReportScheduler(): void {
  if (weeklyInterval) {
    clearInterval(weeklyInterval);
    weeklyInterval = null;
  }
}

export function isWeeklyReportSent(telegramId: number, weekKey: string): boolean {
  const row = getDb()
    .prepare('SELECT 1 FROM weekly_reports WHERE telegram_id = ? AND week_key = ?')
    .get(telegramId, weekKey);
  return !!row;
}

export function markWeeklyReportSent(telegramId: number, weekKey: string, messageId?: number): void {
  getDb()
    .prepare(`
      INSERT OR REPLACE INTO weekly_reports (telegram_id, week_key, message_id, sent_at)
      VALUES (?, ?, ?, datetime('now'))
    `)
    .run(telegramId, weekKey, messageId ?? null);
}

export function buildWeeklyReportText(telegramId: number): string {
  const user = getUserByTelegramId(telegramId);
  const name = user?.first_name ? `, ${user.first_name}` : '';
  const completedDays = getCompletedDays(telegramId);
  const completedCount = completedDays.length;

  // Уроки, сданные за последние 7 дней
  const recentLessonsRow = getDb()
    .prepare(`
      SELECT COUNT(DISTINCT day_number) as cnt
      FROM lesson_submissions
      WHERE telegram_id = ?
        AND is_correct = 1
        AND submitted_at >= datetime('now', '-7 days')
    `)
    .get(telegramId) as { cnt: number };
  const weeklyLessons = recentLessonsRow?.cnt ?? 0;

  const seenWords = countSeenWords(telegramId);
  const masteredWords = countMasteredWords(telegramId);
  const badges = getUserAchievements(telegramId);
  const unlockedBadges = badges.filter((b) => b.unlocked);

  const nextDay = Math.min(30, completedCount + 1);
  const nextLesson = getLessonByDay(nextDay);

  let text =
    `📊 <b>Твой воскресный мини-отчёт${name}!</b>\n\n` +
    `Подводим итоги твоей учебной недели 🇬🇧\n\n` +
    `📖 <b>Уроки за неделю:</b> +${weeklyLessons} (всего: ${completedCount} из 30)\n` +
    `🧠 <b>Словарный запас:</b> изучено ${seenWords} сл., усвоено ${masteredWords} сл.\n` +
    `🏅 <b>Открыто значков:</b> ${unlockedBadges.length} из ${badges.length}`;

  if (unlockedBadges.length > 0) {
    text += ` (${unlockedBadges.map((b) => `${b.icon} ${b.title}`).join(', ')})`;
  }

  text += '\n\n';

  if (completedCount >= 30) {
    text += `🎉 <b>Ты прошёл(ла) все 30 уроков курса!</b> Продолжай тренировать слова и диалоги в мини-играх.`;
  } else if (nextLesson) {
    text += `🔜 <b>Следующий шаг:</b> День ${nextLesson.day} — «${nextLesson.title}»\n\n` +
      `💪 <i>Регулярность важнее скорости — даже 15 минут сегодня приблизят тебя к цели!</i>`;
  }

  return text;
}

export async function runWeeklyReportTick(
  bot: Pick<Bot<BotContext>, 'api'>,
  now: Date = new Date(),
): Promise<number> {
  const msk = getMskDateTimeParts(now);

  // Отправляем только по воскресеньям (dayOfWeek === 0) в 19:00 МСК (16:00 UTC на сервере)
  if (msk.dayOfWeek !== 0 || msk.hour !== WEEKLY_REPORT_MSK_HOUR) {
    return 0;
  }

  const weekKey = msk.dateKey;
  const activeUsers = getActiveCourseUsers();
  let sentCount = 0;

  for (const access of activeUsers) {
    const user = getUserByTelegramId(access.telegram_id);
    if (!user || user.is_blocked || !user.reminders_enabled) continue;
    if (isWeeklyReportSent(access.telegram_id, weekKey)) continue;

    const reportText = buildWeeklyReportText(access.telegram_id);
    const kb = new InlineKeyboard()
      .text('📖 К моему уроку', 'my_lesson')
      .text('🎮 Мини-игры', 'games:menu')
      .row()
      .text('🏠 В главное меню', 'main_menu');

    try {
      const sent = await bot.api.sendMessage(access.telegram_id, reportText, {
        parse_mode: 'HTML',
        reply_markup: kb,
      });
      markWeeklyReportSent(access.telegram_id, weekKey, sent.message_id);
      sentCount++;
      logger.info({ telegramId: access.telegram_id, weekKey }, 'Еженедельный отчёт отправлен');
    } catch (err: unknown) {
      if (String(err).includes('403') || String(err).includes('bot was blocked')) {
        setUserBlocked(access.telegram_id, true);
      }
      logger.error({ err, telegramId: access.telegram_id }, 'Ошибка отправки еженедельного отчёта');
    }
  }

  return sentCount;
}
