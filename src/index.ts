import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { closeDb } from './db/connection.js';
import { runMigrations } from './db/migrate.js';
import { createBot } from './bot/bot.js';
import { setBotInstance } from './bot/botInstance.js';
import { createHttpServer, startHttpServer, processOutbox } from './http/server.js';
import { startScheduler, stopScheduler } from './scheduler/lessonScheduler.js';
import { startReminderScheduler, stopReminderScheduler } from './scheduler/reminderScheduler.js';

async function main(): Promise<void> {
  logger.info('Запуск бота...');

  runMigrations();

  const bot = createBot();
  setBotInstance(bot);

  const app = createHttpServer(bot);
  const port = Number(process.env['PORT'] ?? 3000);
  startHttpServer(app, port);

  startScheduler(bot);
  startReminderScheduler(bot);

  await processOutbox(bot);

  if (config.webhook.enabled && config.isProduction) {
    // Инициализируем бота перед обработкой webhook-запросов
    await bot.init();
    logger.info({ username: bot.botInfo.username }, 'Бот инициализирован');

    // Если SKIP_WEBHOOK_SETUP=true — не вызываем setWebhook (webhook уже зарегистрирован вручную)
    if (process.env['SKIP_WEBHOOK_SETUP'] !== 'true') {
      const webhookUrl = `${config.webhook.baseUrl}/webhook/telegram/${config.webhook.pathSecret}`;
      await bot.api.setWebhook(webhookUrl);
      logger.info({ webhookUrl }, 'Telegram webhook установлен');
    } else {
      logger.info('Пропускаем setWebhook (SKIP_WEBHOOK_SETUP=true)');
    }
    logger.info('Бот запущен в webhook-режиме');
  } else {
    await bot.api.deleteWebhook();
    logger.info('Запуск в режиме long polling');
    bot.start({ onStart: (info) => logger.info({ username: info.username }, 'Бот запущен') });
  }

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Получен сигнал завершения');
    stopScheduler();
    stopReminderScheduler();
    await bot.stop();
    closeDb();
    logger.info('Бот остановлен');
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err }, 'Критическая ошибка запуска');
  process.exit(1);
});
