import { getDb } from '../connection.js';

export interface LessonDelivery {
  id: number;
  telegram_id: number;
  day_number: number;
  scheduled_at: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  attempts: number;
  last_error: string | null;
}

export interface LessonSubmission {
  id: number;
  telegram_id: number;
  day_number: number;
  answer_text: string;
  is_correct: number | null;
  score: number | null;
  attempts: number;
  submitted_at: string;
  checked_at: string | null;
}

export function scheduleLessonDelivery(
  telegramId: number,
  dayNumber: number,
  scheduledAt: string,
): LessonDelivery | null {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM lesson_deliveries WHERE telegram_id = ? AND day_number = ?')
    .get(telegramId, dayNumber) as LessonDelivery | undefined;

  if (existing) return existing;

  db.prepare(`
    INSERT OR IGNORE INTO lesson_deliveries (telegram_id, day_number, scheduled_at)
    VALUES (?, ?, ?)
  `).run(telegramId, dayNumber, scheduledAt);

  return db
    .prepare('SELECT * FROM lesson_deliveries WHERE telegram_id = ? AND day_number = ?')
    .get(telegramId, dayNumber) as LessonDelivery | null;
}

export function markLessonSent(telegramId: number, dayNumber: number): void {
  getDb()
    .prepare(`
      UPDATE lesson_deliveries
      SET status = 'sent', sent_at = datetime('now'), attempts = attempts + 1
      WHERE telegram_id = ? AND day_number = ?
    `)
    .run(telegramId, dayNumber);
}

export function markLessonFailed(telegramId: number, dayNumber: number, error: string): void {
  getDb()
    .prepare(`
      UPDATE lesson_deliveries
      SET status = 'failed', attempts = attempts + 1, last_error = ?
      WHERE telegram_id = ? AND day_number = ?
    `)
    .run(error, telegramId, dayNumber);
}

export function getPendingDeliveries(nowIso: string): LessonDelivery[] {
  return getDb()
    .prepare(`
      SELECT * FROM lesson_deliveries
      WHERE status = 'pending' AND scheduled_at <= ? AND attempts < 3
      ORDER BY scheduled_at ASC
    `)
    .all(nowIso) as LessonDelivery[];
}

export function getLessonDelivery(telegramId: number, dayNumber: number): LessonDelivery | undefined {
  return getDb()
    .prepare('SELECT * FROM lesson_deliveries WHERE telegram_id = ? AND day_number = ?')
    .get(telegramId, dayNumber) as LessonDelivery | undefined;
}

export function saveSubmission(
  telegramId: number,
  dayNumber: number,
  answerText: string,
  isCorrect: boolean | null,
  score: number | null,
): LessonSubmission {
  const db = getDb();

  const existing = db
    .prepare(
      'SELECT * FROM lesson_submissions WHERE telegram_id = ? AND day_number = ? ORDER BY id DESC LIMIT 1',
    )
    .get(telegramId, dayNumber) as LessonSubmission | undefined;

  const isCorrectVal = isCorrect === null ? null : isCorrect ? 1 : 0;

  if (existing) {
    db.prepare(`
      UPDATE lesson_submissions
      SET answer_text = ?, is_correct = ?, score = ?, attempts = attempts + 1, checked_at = datetime('now')
      WHERE id = ?
    `).run(answerText, isCorrectVal, score, existing.id);
    return db
      .prepare('SELECT * FROM lesson_submissions WHERE id = ?')
      .get(existing.id) as LessonSubmission;
  }

  db.prepare(`
    INSERT INTO lesson_submissions (telegram_id, day_number, answer_text, is_correct, score, checked_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(telegramId, dayNumber, answerText, isCorrectVal, score);

  return db
    .prepare(
      'SELECT * FROM lesson_submissions WHERE telegram_id = ? AND day_number = ? ORDER BY id DESC LIMIT 1',
    )
    .get(telegramId, dayNumber) as LessonSubmission;
}

export function getSubmission(telegramId: number, dayNumber: number): LessonSubmission | undefined {
  return getDb()
    .prepare(
      'SELECT * FROM lesson_submissions WHERE telegram_id = ? AND day_number = ? ORDER BY id DESC LIMIT 1',
    )
    .get(telegramId, dayNumber) as LessonSubmission | undefined;
}

export function getCompletedDays(telegramId: number): number[] {
  const rows = getDb()
    .prepare(
      'SELECT DISTINCT day_number FROM lesson_submissions WHERE telegram_id = ? AND is_correct = 1',
    )
    .all(telegramId) as Array<{ day_number: number }>;
  return rows.map((r) => r.day_number);
}

// ─── Уведомления об уроках ────────────────────────────────────────────────────

export interface LessonNotification {
  telegram_id: number;
  message_id: number;
  day_number: number;
  created_at: string;
}

export function saveLessonNotification(
  telegramId: number,
  messageId: number,
  dayNumber: number,
): void {
  getDb()
    .prepare(`
      INSERT OR REPLACE INTO lesson_notifications (telegram_id, message_id, day_number)
      VALUES (?, ?, ?)
    `)
    .run(telegramId, messageId, dayNumber);
}

export function getLessonNotification(telegramId: number): LessonNotification | undefined {
  return getDb()
    .prepare('SELECT * FROM lesson_notifications WHERE telegram_id = ?')
    .get(telegramId) as LessonNotification | undefined;
}

export function clearLessonNotification(telegramId: number): void {
  getDb()
    .prepare('DELETE FROM lesson_notifications WHERE telegram_id = ?')
    .run(telegramId);
}
