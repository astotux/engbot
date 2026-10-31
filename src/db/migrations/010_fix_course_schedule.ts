import type Database from 'better-sqlite3';
import { toZonedScheduledTime } from '../../utils/time.js';

export const version = 10;

function parseSqliteUtcDate(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr.replace(' ', 'T') + 'Z');
}

export function up(db: Database.Database): void {
  // 1. Добавляем колонку start_day в course_access, если её ещё нет
  try {
    db.exec(`ALTER TABLE course_access ADD COLUMN start_day INTEGER NOT NULL DEFAULT 1;`);
  } catch {
    // Колонка уже существует
  }

  // 2. Исправляем расписание и ошибочно открытые наперёд уроки для активных пользователей
  const tz = 'Europe/Moscow';
  const now = new Date();

  const activeUsers = db
    .prepare("SELECT * FROM course_access WHERE started_at IS NOT NULL AND status IN ('active', 'completed', 'paused')")
    .all() as Array<{
      id: number;
      telegram_id: number;
      started_at: string;
      current_day: number;
      start_day?: number;
    }>;

  for (const access of activeUsers) {
    const startedAt = parseSqliteUtcDate(access.started_at);

    // Получаем дни, которые пользователь РЕАЛЬНО завершил (сдал правильные ответы)
    const completedRows = db
      .prepare('SELECT DISTINCT day_number FROM lesson_submissions WHERE telegram_id = ? AND is_correct = 1')
      .all(access.telegram_id) as Array<{ day_number: number }>;
    const completedDays = new Set(completedRows.map((r) => r.day_number));

    // Определяем start_day: если пользователь прошёл дни 1..3 до покупки и начал с 4
    let startDay = access.start_day;
    if (!startDay || startDay < 1) {
      if (completedDays.has(1) && completedDays.has(2) && completedDays.has(3) && access.current_day >= 4) {
        startDay = 4;
      } else {
        startDay = 1;
      }
    }

    db.prepare('UPDATE course_access SET start_day = ? WHERE id = ?').run(startDay, access.id);

    let maxValidDay = startDay;

    for (let day = 1; day <= 30; day++) {
      const existingDelivery = db
        .prepare('SELECT * FROM lesson_deliveries WHERE telegram_id = ? AND day_number = ?')
        .get(access.telegram_id, day) as { status: string } | undefined;

      if (day < startDay) {
        // Уроки до startDay (например, пройденные на бесплатном триале 1..3)
        if (existingDelivery) {
          db.prepare(`
            UPDATE lesson_deliveries
            SET status = 'sent', scheduled_at = ?
            WHERE telegram_id = ? AND day_number = ?
          `).run(startedAt.toISOString(), access.telegram_id, day);
        } else {
          db.prepare(`
            INSERT INTO lesson_deliveries (telegram_id, day_number, scheduled_at, status, sent_at)
            VALUES (?, ?, ?, 'sent', ?)
          `).run(access.telegram_id, day, startedAt.toISOString(), startedAt.toISOString());
        }
        continue;
      }

      const daysOffset = day - startDay;
      const d = new Date(startedAt.getTime() + daysOffset * 86_400_000);
      const scheduled = daysOffset === 0 ? startedAt : toZonedScheduledTime(d, 0, 1, tz);
      const scheduledIso = scheduled.toISOString();
      const isPastOrNow = scheduled <= now;

      if (isPastOrNow || completedDays.has(day)) {
        // Урок наступил по календарному графику или уже реально пройден пользователем
        if (day > maxValidDay) {
          maxValidDay = day;
        }
        if (existingDelivery) {
          db.prepare(`
            UPDATE lesson_deliveries
            SET scheduled_at = ?
            WHERE telegram_id = ? AND day_number = ?
          `).run(scheduledIso, access.telegram_id, day);
        } else {
          db.prepare(`
            INSERT INTO lesson_deliveries (telegram_id, day_number, scheduled_at, status, sent_at)
            VALUES (?, ?, ?, 'sent', ?)
          `).run(access.telegram_id, day, scheduledIso, scheduledIso);
        }
      } else {
        // Урок в БУДУЩЕМ (завтра или позже) и пользователь его НЕ завершал.
        // Если он был ошибочно переведён в 'sent', сбрасываем обратно в 'pending'
        if (existingDelivery) {
          db.prepare(`
            UPDATE lesson_deliveries
            SET status = 'pending', scheduled_at = ?, sent_at = NULL
            WHERE telegram_id = ? AND day_number = ?
          `).run(scheduledIso, access.telegram_id, day);
        } else {
          db.prepare(`
            INSERT INTO lesson_deliveries (telegram_id, day_number, scheduled_at, status)
            VALUES (?, ?, ?, 'pending')
          `).run(access.telegram_id, day, scheduledIso);
        }
      }
    }

    // Восстанавливаем корректный current_day в course_access (не забегающий вперёд в будущее)
    db.prepare('UPDATE course_access SET current_day = ? WHERE id = ?').run(maxValidDay, access.id);
  }
}
