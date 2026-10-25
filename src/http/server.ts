import express from 'express';
import type { Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { handleWebhookEvent } from '../services/purchaseService.js';
import { v4 as uuidv4 } from 'uuid';
import { sendCourseAccessMessage } from '../bot/handlers/courseHandler.js';
import { getLastScreenMessageId, setLastScreenMessageId } from '../bot/sendHelper.js';
import { getPendingOutboxEvents, markOutboxProcessed, markOutboxFailed } from '../db/repositories/outbox.js';
import { hasUserCourseAccess } from '../db/repositories/courseAccess.js';
import { hasSucceededPaymentForUser } from '../db/repositories/payments.js';
import { mainMenuKeyboard } from '../bot/keyboards/mainMenu.js';

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
      const payload = JSON.parse(event.payload) as { telegramId?: number; messageId?: number };
      if (event.event_type === 'course_access_granted' && payload.telegramId) {
        await sendCourseAccessMessage(bot, payload.telegramId, payload.messageId);
      } else if (event.event_type === 'payment_canceled' && payload.telegramId) {
        // Не отправляем уведомление об отмене, если пользователь уже оплатил курс
        const hasAccess = hasUserCourseAccess(payload.telegramId);
        const hasSucceeded = hasSucceededPaymentForUser(payload.telegramId);
        if (!hasAccess && !hasSucceeded) {
          const cancelText = '❌ Оплата отменена. Если это ошибка, попробуй снова через /course.';
          const targetMsgId = payload.messageId ?? getLastScreenMessageId(payload.telegramId);
          let edited = false;
          if (targetMsgId && bot.api.editMessageText) {
            try {
              await bot.api.editMessageText(payload.telegramId, targetMsgId, cancelText, {
                reply_markup: mainMenuKeyboard(false),
              });
              edited = true;
            } catch {
              // Фоллбек на отправку нового сообщения
            }
          }
          if (!edited) {
            const sent = (await bot.api.sendMessage(payload.telegramId, cancelText, {
              reply_markup: mainMenuKeyboard(false),
            })) as { message_id?: number } | undefined;
            if (sent?.message_id) {
              setLastScreenMessageId(payload.telegramId, sent.message_id);
            }
          }
        } else {
          logger.info(
            { telegramId: payload.telegramId, eventId: event.id },
            'Outbox: уведомление payment_canceled пропущено, так как пользователь уже оплатил курс',
          );
        }
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
