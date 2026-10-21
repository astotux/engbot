import express from 'express';
import type { Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { handleWebhookEvent } from '../services/purchaseService.js';
import { v4 as uuidv4 } from 'uuid';
import { sendCourseAccessMessage } from '../bot/handlers/courseHandler.js';
import { getPendingOutboxEvents, markOutboxProcessed, markOutboxFailed } from '../db/repositories/outbox.js';

export function createHttpServer(bot: Bot<BotContext>): express.Application {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Webhook от YooKassa
  const yookassaPath = `/webhook/yookassa/${config.webhook.pathSecret}`;
  app.post(yookassaPath, async (req, res) => {
    const body = req.body as unknown;

    // YooKassa не присылает уникальный ID события в заголовке,
    // поэтому генерируем идемпотентный ключ из данных платежа
    let eventId: string;
    try {
      const b = body as { event?: string; object?: { id?: string } };
      eventId = `${b.event ?? 'unknown'}_${b.object?.id ?? uuidv4()}`;
    } catch {
      eventId = uuidv4();
    }

    try {
      await handleWebhookEvent(body, eventId);
      // Обрабатываем outbox: отправляем уведомления пользователям
      await processOutbox(bot);
      res.sendStatus(200);
    } catch (err) {
      logger.error({ err }, 'Ошибка обработки YooKassa webhook');
      // Возвращаем 500 чтобы YooKassa повторила доставку
      res.sendStatus(500);
    }
  });

  // Webhook от Telegram (только если настроен)
  if (config.webhook.enabled) {
    const tgPath = `/webhook/telegram/${config.webhook.pathSecret}`;
    app.use(tgPath, (req, res) => {
      bot.handleUpdate(req.body as Parameters<typeof bot.handleUpdate>[0]).catch((err) => {
        logger.error({ err }, 'Ошибка обработки Telegram webhook');
      });
      res.sendStatus(200);
    });
    logger.info({ path: tgPath }, 'Telegram webhook зарегистрирован');
  }

  // Health check
  app.get('/health', (_, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
  });

  // Неизвестные маршруты → 404
  app.use((_, res) => {
    res.sendStatus(404);
  });

  return app;
}

/** Обрабатывает очередь outbox событий */
export async function processOutbox(bot: Bot<BotContext>): Promise<void> {
  const events = getPendingOutboxEvents();
  for (const event of events) {
    try {
      const payload = JSON.parse(event.payload) as { telegramId?: number };
      if (event.event_type === 'course_access_granted' && payload.telegramId) {
        await sendCourseAccessMessage(bot, payload.telegramId);
      } else if (event.event_type === 'payment_canceled' && payload.telegramId) {
        await bot.api.sendMessage(
          payload.telegramId,
          '❌ Оплата отменена. Если это ошибка, попробуй снова через /course.',
        );
      }
      markOutboxProcessed(event.id);
    } catch (err) {
      markOutboxFailed(event.id, String(err));
      logger.error({ err, eventId: event.id }, 'Ошибка обработки outbox события');
    }
  }
}

export function startHttpServer(app: express.Application, port = 3000): void {
  app.listen(port, () => {
    logger.info({ port }, 'HTTP-сервер запущен');
  });
}
