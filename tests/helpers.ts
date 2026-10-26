import Database from 'better-sqlite3';
import { up as migration001, version as v001 } from '../src/db/migrations/001_initial.js';
import { up as migration002, version as v002 } from '../src/db/migrations/002_lesson_steps.js';
import { up as migration003, version as v003 } from '../src/db/migrations/003_vocabulary.js';
import { up as migration004, version as v004 } from '../src/db/migrations/004_vocab_demo.js';
import { up as migration005, version as v005 } from '../src/db/migrations/005_vocab_difficulty.js';
import { up as migration006, version as v006 } from '../src/db/migrations/006_notifications_and_onboarding.js';
import { up as migration007, version as v007 } from '../src/db/migrations/007_features_and_games.js';
import { up as migration008, version as v008 } from '../src/db/migrations/008_lead_funnel.js';

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

  migration005(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v005);

  migration006(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v006);

  migration007(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v007);

  migration008(db);
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(v008);

  return db;
}
