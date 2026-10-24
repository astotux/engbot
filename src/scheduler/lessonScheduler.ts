import {
  getPendingDeliveries,
  markLessonSent,
  markLessonFailed,
  saveLessonNotification,
} from '../db/repositories/lessons.js';
import { getActiveCourseUsers, getCourseAccess, setCourseDay } from '../db/repositories/courseAccess.js';
import { getUserByTelegramId, setUserBlocked } from '../db/repositories/users.js';
import { scheduleAllLessons } from '../services/lessonService.js';
import { logger } from '../utils/logger.js';
import { InlineKeyboard, type Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { getLessonByDay } from '../content/course.js';
import { formatLessonMessage } from '../bot/handlers/lessonHandler.js';

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export function startScheduler(bot: Bot<BotContext>): void {
  if (schedulerInterval) return;

  initSchedules(bot);

  schedulerInterval = setInterval(() => { void runSchedulerTick(bot); }, 60_000);
  logger.info('Планировщик уроков запущен');
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('Планировщик уроков остановлен');
  }
}

function initSchedules(bot: Bot<BotContext>): void {
  const users = getActiveCourseUsers();
  for (const access of users) {
    scheduleAllLessons(access.telegram_id);
  }
  logger.info({ count: users.length }, 'Расписание уроков инициализировано');
  void runSchedulerTick(bot);
}

async function runSchedulerTick(bot: Bot<BotContext>): Promise<void> {
  const now = new Date().toISOString();
  const pending = getPendingDeliveries(now);
  if (pending.length === 0) return;

  logger.info({ count: pending.length }, 'Уроков к отправке');

  for (const delivery of pending) {
    const user = getUserByTelegramId(delivery.telegram_id);
    if (user?.is_blocked) {
      markLessonFailed(delivery.telegram_id, delivery.day_number, 'Пользователь заблокировал бота');
      continue;
    }

    const lesson = getLessonByDay(delivery.day_number);
    if (!lesson) {
      markLessonFailed(delivery.telegram_id, delivery.day_number, 'Урок не найден');
      continue;
    }

    try {
      const kb = new InlineKeyboard().text('🚀 Начать урок', `start_scheduled_lesson:${delivery.day_number}`);
      const sentMsg = await bot.api.sendMessage(delivery.telegram_id, formatLessonMessage(lesson), {
        parse_mode: 'HTML',
        reply_markup: kb,
      });
      markLessonSent(delivery.telegram_id, delivery.day_number);
      saveLessonNotification(delivery.telegram_id, sentMsg.message_id, delivery.day_number);
      const access = getCourseAccess(delivery.telegram_id);
      if (access && delivery.day_number > access.current_day) {
        setCourseDay(delivery.telegram_id, delivery.day_number);
      }
      logger.info({ telegramId: delivery.telegram_id, day: delivery.day_number }, 'Урок отправлен');
      await sleep(50);
    } catch (err: unknown) {
      const errorMsg = String(err);
      markLessonFailed(delivery.telegram_id, delivery.day_number, errorMsg);
      if (errorMsg.includes('403') || errorMsg.includes('bot was blocked')) {
        setUserBlocked(delivery.telegram_id, true);
        logger.warn({ telegramId: delivery.telegram_id }, 'Пользователь заблокировал бота');
      } else {
        logger.error({ err, telegramId: delivery.telegram_id, day: delivery.day_number }, 'Ошибка отправки урока');
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
