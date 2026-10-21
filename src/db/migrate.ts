import 'dotenv/config';
import { getDb, closeDb } from './connection.js';
import { up as migration001, version as v001 } from './migrations/001_initial.js';
import { logger } from '../utils/logger.js';

const migrations = [{ version: v001, up: migration001 }];

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
