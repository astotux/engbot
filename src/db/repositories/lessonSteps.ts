import { getDb } from '../connection.js';

export interface LessonStepProgress {
  id: number;
  telegram_id: number;
  day_number: number;
  step_index: number;
  completed_steps: string; // JSON array of completed step indices
  started_at: string;
  completed_at: string | null;
}

export function getStepProgress(telegramId: number, dayNumber: number): LessonStepProgress | undefined {
  return getDb()
    .prepare('SELECT * FROM lesson_step_progress WHERE telegram_id = ? AND day_number = ?')
    .get(telegramId, dayNumber) as LessonStepProgress | undefined;
}

export function initStepProgress(telegramId: number, dayNumber: number): LessonStepProgress {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO lesson_step_progress (telegram_id, day_number, step_index, completed_steps)
    VALUES (?, ?, 0, '[]')
  `).run(telegramId, dayNumber);
  return db
    .prepare('SELECT * FROM lesson_step_progress WHERE telegram_id = ? AND day_number = ?')
    .get(telegramId, dayNumber) as LessonStepProgress;
}

export function advanceStep(telegramId: number, dayNumber: number, completedStepIndex: number): void {
  const db = getDb();
  const prog = getStepProgress(telegramId, dayNumber);
  if (!prog) return;

  const completed = JSON.parse(prog.completed_steps) as number[];
  if (!completed.includes(completedStepIndex)) {
    completed.push(completedStepIndex);
  }
  const nextStep = completedStepIndex + 1;

  db.prepare(`
    UPDATE lesson_step_progress
    SET step_index = ?, completed_steps = ?
    WHERE telegram_id = ? AND day_number = ?
  `).run(nextStep, JSON.stringify(completed), telegramId, dayNumber);
}

export function completeAllSteps(telegramId: number, dayNumber: number): void {
  getDb()
    .prepare(`
      UPDATE lesson_step_progress
      SET completed_at = datetime('now')
      WHERE telegram_id = ? AND day_number = ?
    `)
    .run(telegramId, dayNumber);
}

export function isDayCompleted(telegramId: number, dayNumber: number): boolean {
  const prog = getStepProgress(telegramId, dayNumber);
  return !!prog?.completed_at;
}

export function getCompletedStepIndices(telegramId: number, dayNumber: number): number[] {
  const prog = getStepProgress(telegramId, dayNumber);
  if (!prog) return [];
  return JSON.parse(prog.completed_steps) as number[];
}
