import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { createTestDb } from './helpers.js';

let testDb: Database.Database;

vi.mock('../src/db/connection.js', () => ({ getDb: () => testDb, closeDb: () => {} }));
vi.mock('../src/config/index.js', () => ({
  config: {
    logLevel: 'silent', nodeEnv: 'test', isProduction: false, isTest: true,
    databasePath: ':memory:', coursePriceKopecks: 50000,
    botToken: 'test', botUsername: 'testbot', adminIds: [],
    yookassa: { enabled: false }, webhook: { enabled: false },
  },
}));
vi.mock('../src/utils/logger.js', () => ({ logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} } }));

const { saveWebhookEvent, markWebhookProcessed, isWebhookProcessed } = await import('../src/db/repositories/webhookEvents.js');

describe('WebhookEvents', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  it('сохраняет новое событие и возвращает true', () => {
    const isNew = saveWebhookEvent('evt-1', 'payment.succeeded', '{}');
    expect(isNew).toBe(true);
  });

  it('возвращает false для дублирующегося события', () => {
    saveWebhookEvent('evt-1', 'payment.succeeded', '{}');
    const isNew = saveWebhookEvent('evt-1', 'payment.succeeded', '{}');
    expect(isNew).toBe(false);
  });

  it('помечает событие как обработанное', () => {
    saveWebhookEvent('evt-2', 'payment.succeeded', '{}');
    markWebhookProcessed('evt-2');
    expect(isWebhookProcessed('evt-2')).toBe(true);
  });

  it('неизвестное событие не считается обработанным', () => {
    expect(isWebhookProcessed('evt-unknown')).toBe(false);
  });
});
