import Database from 'better-sqlite3';
import { up as migration001, version as v001 } from '../src/db/migrations/001_initial.js';
import { up as migration002, version as v002 } from '../src/db/migrations/002_lesson_steps.js';
import { up as migration003, version as v003 } from '../src/db/migrations/003_vocabulary.js';
import { up as migration004, version as v004 } from '../src/db/migrations/004_vocab_demo.js';

/** Создаёт временную in-memory SQLite базу для тестов */
export function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version   INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  migration001(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v001);

  migration002(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v002);

  migration003(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v003);

  migration004(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v004);

  return db;
}
