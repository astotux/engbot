import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.resolve(config.databasePath);
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = -64000');
    logger.info({ path: dbPath }, 'База данных подключена');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('База данных закрыта');
  }
}

/** Создаёт SQLite-бэкап без копирования «горячего» файла */
export async function backupDb(destPath: string): Promise<void> {
  const database = getDb();
  await database.backup(destPath);
  logger.info({ dest: destPath }, 'Резервная копия БД создана');
}
