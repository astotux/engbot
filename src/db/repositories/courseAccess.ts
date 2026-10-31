import { getDb } from '../connection.js';
import { config } from '../../config/index.js';

export interface CourseAccess {
  id: number;
  telegram_id: number;
  product_id: string;
  order_id: string | null;
  purchased_at: string;
  started_at: string | null;
  current_day: number;
  status: 'pending' | 'active' | 'completed' | 'paused' | 'revoked';
  completed_at: string | null;
  send_hour: number | null;
  send_minute: number | null;
  paused: number;
}

const PRODUCT = 'english_30_days';

export function createCourseAccess(
  telegramId: number,
  orderId: string | null,
  status: CourseAccess['status'] = 'active',
): CourseAccess | null {
  const db = getDb();

  const existing = db
    .prepare(
      "SELECT * FROM course_access WHERE telegram_id = ? AND product_id = ? AND status != 'revoked'",
    )
    .get(telegramId, PRODUCT) as CourseAccess | undefined;

  let initialDay = 1;
  try {
    const completed = db
      .prepare('SELECT DISTINCT day_number FROM lesson_submissions WHERE telegram_id = ? AND is_correct = 1')
      .all(telegramId) as Array<{ day_number: number }>;
    const completedDays = new Set(completed.map((r) => r.day_number));
    while (completedDays.has(initialDay) && initialDay < 30) {
      initialDay++;
    }
  } catch {}

  if (existing) {
    if (existing.status === 'pending' && status === 'active') {
      const nextDay = Math.max(existing.current_day, initialDay);
      db.prepare(`
        UPDATE course_access
        SET status = 'active', started_at = datetime('now'), current_day = ?,
            send_hour = ?, send_minute = ?, order_id = COALESCE(?, order_id)
        WHERE id = ?
      `).run(nextDay, config.lessonSendHour, config.lessonSendMinute, orderId, existing.id);
      return getCourseAccess(telegramId) ?? null;
    }
    return null;
  }

  const startedAt = status === 'active' ? new Date().toISOString() : null;
  const currentDay = status === 'active' ? initialDay : 0;
  const sendHour = status === 'active' ? config.lessonSendHour : null;
  const sendMinute = status === 'active' ? config.lessonSendMinute : null;

  db.prepare(`
    INSERT OR IGNORE INTO course_access (
      telegram_id, product_id, order_id, status, started_at, current_day, send_hour, send_minute
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(telegramId, PRODUCT, orderId, status, startedAt, currentDay, sendHour, sendMinute);

  return db
    .prepare('SELECT * FROM course_access WHERE telegram_id = ? AND product_id = ?')
    .get(telegramId, PRODUCT) as CourseAccess | null;
}

export function hasUserCourseAccess(telegramId: number): boolean {
  const access = getCourseAccess(telegramId);
  return !!access && (access.status === 'active' || access.status === 'completed' || access.status === 'pending');
}

export function getCourseAccess(telegramId: number): CourseAccess | undefined {
  return getDb()
    .prepare('SELECT * FROM course_access WHERE telegram_id = ? AND product_id = ?')
    .get(telegramId, PRODUCT) as CourseAccess | undefined;
}

export function startCourse(telegramId: number): void {
  getDb()
    .prepare(`
      UPDATE course_access
      SET status = 'active', started_at = datetime('now'), current_day = 1, send_hour = ?, send_minute = ?
      WHERE telegram_id = ? AND product_id = ? AND status = 'pending'
    `)
    .run(config.lessonSendHour, config.lessonSendMinute, telegramId, PRODUCT);
}

export function advanceCourseDay(telegramId: number): void {
  getDb()
    .prepare(`
      UPDATE course_access
      SET current_day = current_day + 1
      WHERE telegram_id = ? AND product_id = ?
    `)
    .run(telegramId, PRODUCT);
}

export function setCourseDay(telegramId: number, day: number): void {
  getDb()
    .prepare(`
      UPDATE course_access
      SET current_day = ?
      WHERE telegram_id = ? AND product_id = ?
    `)
    .run(day, telegramId, PRODUCT);
}

export function completeCourse(telegramId: number): void {
  getDb()
    .prepare(`
      UPDATE course_access
      SET status = 'completed', completed_at = datetime('now')
      WHERE telegram_id = ? AND product_id = ?
    `)
    .run(telegramId, PRODUCT);
}

export function pauseCourse(telegramId: number, paused: boolean): void {
  getDb()
    .prepare('UPDATE course_access SET paused = ? WHERE telegram_id = ? AND product_id = ?')
    .run(paused ? 1 : 0, telegramId, PRODUCT);
}

export function updateCourseSendTime(telegramId: number, sendHour: number, sendMinute = 0): void {
  getDb()
    .prepare(`
      UPDATE course_access
      SET send_hour = ?, send_minute = ?
      WHERE telegram_id = ? AND product_id = ?
    `)
    .run(sendHour, sendMinute, telegramId, PRODUCT);
}

export function revokeCourse(telegramId: number): void {
  getDb()
    .prepare("UPDATE course_access SET status = 'revoked' WHERE telegram_id = ? AND product_id = ?")
    .run(telegramId, PRODUCT);
}

export function grantCourseAccess(telegramId: number): CourseAccess {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO course_access (telegram_id, product_id, status)
    VALUES (?, ?, 'pending')
  `).run(telegramId, PRODUCT);
  return db
    .prepare('SELECT * FROM course_access WHERE telegram_id = ? AND product_id = ?')
    .get(telegramId, PRODUCT) as CourseAccess;
}

export function countActiveCourses(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as cnt FROM course_access WHERE status = 'active'")
    .get() as { cnt: number };
  return row.cnt;
}

export function countCompletedCourses(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as cnt FROM course_access WHERE status = 'completed'")
    .get() as { cnt: number };
  return row.cnt;
}

export function getActiveCourseUsers(): CourseAccess[] {
  return getDb()
    .prepare("SELECT * FROM course_access WHERE status = 'active' AND paused = 0")
    .all() as CourseAccess[];
}
