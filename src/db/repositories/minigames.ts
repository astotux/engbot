import { getDb } from '../connection.js';

export interface MinigameProgressRow {
  telegram_id: number;
  phrases_completed: number;
  dialogues_completed_json: string;
  demo_builder_used: number;
  demo_dialogue_used: number;
  updated_at: string;
}

export interface MinigameProgress {
  telegramId: number;
  phrasesCompleted: number;
  dialoguesCompleted: string[];
  demoBuilderUsed: boolean;
  demoDialogueUsed: boolean;
}

function ensureMinigameRow(telegramId: number): MinigameProgressRow {
  const db = getDb();
  const existing = db
    .prepare('SELECT * FROM minigame_progress WHERE telegram_id = ?')
    .get(telegramId) as MinigameProgressRow | undefined;

  if (existing) return existing;

  db.prepare('INSERT OR IGNORE INTO minigame_progress (telegram_id) VALUES (?)').run(telegramId);

  return db
    .prepare('SELECT * FROM minigame_progress WHERE telegram_id = ?')
    .get(telegramId) as MinigameProgressRow;
}

export function getMinigameProgress(telegramId: number): MinigameProgress {
  const row = ensureMinigameRow(telegramId);
  let dialoguesCompleted: string[] = [];
  try {
    const parsed = JSON.parse(row.dialogues_completed_json);
    if (Array.isArray(parsed)) {
      dialoguesCompleted = parsed.filter((x): x is string => typeof x === 'string');
    }
  } catch {
    dialoguesCompleted = [];
  }

  return {
    telegramId: row.telegram_id,
    phrasesCompleted: row.phrases_completed,
    dialoguesCompleted,
    demoBuilderUsed: row.demo_builder_used === 1,
    demoDialogueUsed: row.demo_dialogue_used === 1,
  };
}

export function incrementPhrasesCompleted(telegramId: number): number {
  ensureMinigameRow(telegramId);
  getDb()
    .prepare(`
      UPDATE minigame_progress
      SET phrases_completed = phrases_completed + 1,
          updated_at = datetime('now')
      WHERE telegram_id = ?
    `)
    .run(telegramId);

  return getMinigameProgress(telegramId).phrasesCompleted;
}

export function markDialogueCompleted(telegramId: number, scenarioId: string): string[] {
  const progress = getMinigameProgress(telegramId);
  if (!progress.dialoguesCompleted.includes(scenarioId)) {
    const updated = [...progress.dialoguesCompleted, scenarioId];
    getDb()
      .prepare(`
        UPDATE minigame_progress
        SET dialogues_completed_json = ?,
            updated_at = datetime('now')
        WHERE telegram_id = ?
      `)
      .run(JSON.stringify(updated), telegramId);
    return updated;
  }
  return progress.dialoguesCompleted;
}
