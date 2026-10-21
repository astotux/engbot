import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { createTestDb } from './helpers.js';

// Мокаем connection.ts до импорта репозитория
let testDb: Database.Database;

vi.mock('../src/db/connection.js', () => ({
  getDb: () => testDb,
  closeDb: () => {},
}));

vi.mock('../src/config/index.js', () => ({
  config: {
    logLevel: 'silent',
    nodeEnv: 'test',
    isProduction: false,
    isTest: true,
    databasePath: ':memory:',
    freeChecklistPath: '',
    coursePriceRub: 500,
    coursePriceKopecks: 50000,
    courseTimezone: 'Europe/Moscow',
    lessonSendHour: 10,
    lessonSendMinute: 0,
    botToken: 'test',
    botUsername: 'testbot',
    adminIds: [999],
    yookassa: { enabled: false, shopId: '', secretKey: '', returnUrl: '' },
    webhook: { enabled: false, baseUrl: '', pathSecret: '' },
  },
}));

vi.mock('../src/utils/logger.js', () => ({
  logger: {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  },
}));

const { upsertUser, getUserByTelegramId, countUsers } = await import('../src/db/repositories/users.js');

describe('Users repository', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  it('регистрирует нового пользователя', () => {
    const { user, isNew } = upsertUser({
      telegram_id: 123456,
      username: 'testuser',
      first_name: 'Тест',
    });

    expect(isNew).toBe(true);
    expect(user.telegram_id).toBe(123456);
    expect(user.username).toBe('testuser');
    expect(user.first_name).toBe('Тест');
  });

  it('не дублирует пользователя при повторном /start', () => {
    upsertUser({ telegram_id: 123456, username: 'testuser' });
    const { isNew } = upsertUser({ telegram_id: 123456, username: 'testuser2' });

    expect(isNew).toBe(false);
  });

  it('обновляет имя пользователя', () => {
    upsertUser({ telegram_id: 123456, first_name: 'Старое' });
    upsertUser({ telegram_id: 123456, first_name: 'Новое' });

    const user = getUserByTelegramId(123456);
    expect(user?.first_name).toBe('Новое');
  });

  it('находит пользователя по telegram_id', () => {
    upsertUser({ telegram_id: 111222, username: 'findme' });
    const user = getUserByTelegramId(111222);
    expect(user).toBeTruthy();
    expect(user?.username).toBe('findme');
  });

  it('возвращает undefined для несуществующего пользователя', () => {
    const user = getUserByTelegramId(99999);
    expect(user).toBeUndefined();
  });

  it('корректно считает пользователей', () => {
    upsertUser({ telegram_id: 1 });
    upsertUser({ telegram_id: 2 });
    upsertUser({ telegram_id: 3 });
    expect(countUsers()).toBe(3);
  });
});
