import {
  getPendingDeliveries,
  markLessonSent,
  markLessonFailed,
} from '../db/repositories/lessons.js';
import { getActiveCourseUsers, getCourseAccess, setCourseDay } from '../db/repositories/courseAccess.js';
import { getUserByTelegramId } from '../db/repositories/users.js';
import { scheduleAllLessons } from '../services/lessonService.js';
import { logger } from '../utils/logger.js';
import type { Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { getLessonByDay } from '../content/course.js';

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
    scheduleAllLessons(access.telegram_id, false);
  }
  logger.info({ count: users.length }, 'Расписание уроков инициализировано');
  void runSchedulerTick(bot);
}

async function runSchedulerTick(_bot: Bot<BotContext>): Promise<void> {
  const now = new Date().toISOString();
  const pending = getPendingDeliveries(now);
  if (pending.length === 0) return;

  logger.info({ count: pending.length }, 'Уроков к открытию по расписанию (00:01 МСК)');

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

    // В 00:01 МСК тихо открываем доступ к уроку в БД без ночных пуш-уведомлений.
    // Уведомления отправляются только в 9:00, 15:00 и 21:00 МСК через reminderScheduler.
    markLessonSent(delivery.telegram_id, delivery.day_number);
    const access = getCourseAccess(delivery.telegram_id);
    if (access && delivery.day_number > access.current_day) {
      setCourseDay(delivery.telegram_id, delivery.day_number);
    }
    logger.info({ telegramId: delivery.telegram_id, day: delivery.day_number }, 'Урок открыт по расписанию (тихо, без ночного уведомления)');
  }
}
