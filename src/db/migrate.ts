import 'dotenv/config';
import { getDb, closeDb } from './connection.js';
import { up as migration001, version as v001 } from './migrations/001_initial.js';
import { up as migration002, version as v002 } from './migrations/002_lesson_steps.js';
import { up as migration003, version as v003 } from './migrations/003_vocabulary.js';
import { up as migration004, version as v004 } from './migrations/004_vocab_demo.js';
import { up as migration005, version as v005 } from './migrations/005_vocab_difficulty.js';
import { up as migration006, version as v006 } from './migrations/006_notifications_and_onboarding.js';
import { up as migration007, version as v007 } from './migrations/007_features_and_games.js';
import { up as migration008, version as v008 } from './migrations/008_lead_funnel.js';
import { logger } from '../utils/logger.js';

const migrations = [
  { version: v001, up: migration001 },
  { version: v002, up: migration002 },
  { version: v003, up: migration003 },
  { version: v004, up: migration004 },
  { version: v005, up: migration005 },
  { version: v006, up: migration006 },
  { version: v007, up: migration007 },
  { version: v008, up: migration008 },
];

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version   INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = (
    db.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as Array<{ version: number }>
  ).map((r) => r.version);

  for (const migration of migrations) {
    if (!applied.includes(migration.version)) {
      logger.info({ version: migration.version }, 'Применяю миграцию');
      const applyMigration = db.transaction(() => {
        migration.up(db);
        db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(migration.version);
      });
      applyMigration();
      logger.info({ version: migration.version }, 'Миграция применена');
    }
  }
}

// Если файл запускается напрямую через CLI
const isMain = process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js');
if (isMain) {
  runMigrations();
  closeDb();
  logger.info('Миграции завершены');
}
