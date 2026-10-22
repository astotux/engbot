import type { Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Отправляет сообщение всем администраторам.
 * Ошибки отправки логируются, но не прерывают выполнение.
 */
export async function notifyAdmins(
  bot: Bot<BotContext>,
  text: string,
): Promise<void> {
  for (const adminId of config.adminIds) {
    try {
      await bot.api.sendMessage(adminId, text, { parse_mode: 'HTML' });
    } catch (err) {
      logger.warn({ err, adminId }, 'Не удалось отправить уведомление администратору');
    }
  }
}

/**
 * Уведомление о новом пользователе.
 */
export async function notifyNewUser(
  bot: Bot<BotContext>,
  params: {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    source: string | null;
    isNew: boolean;
  },
): Promise<void> {
  if (!params.isNew) return;
  if (config.adminIds.length === 0) return;

  const name = [params.firstName, params.lastName].filter(Boolean).join(' ') || 'Без имени';
  const username = params.username ? `@${params.username}` : 'нет username';
  const source = params.source ? `\n🔗 Источник: <code>${params.source}</code>` : '';
  const profileLink = `<a href="tg://user?id=${params.telegramId}">${name}</a>`;

  const text =
    `👤 <b>Новый пользователь!</b>\n\n` +
    `👋 ${profileLink}\n` +
    `🆔 ID: <code>${params.telegramId}</code>\n` +
    `📛 Username: ${username}` +
    source;

  await notifyAdmins(bot, text);
}

/**
 * Уведомление об успешной покупке.
 */
export async function notifyPurchase(
  bot: Bot<BotContext>,
  params: {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    amountRub: number;
    orderId: string;
  },
): Promise<void> {
  if (config.adminIds.length === 0) return;

  const name = [params.firstName, params.lastName].filter(Boolean).join(' ') || 'Без имени';
  const username = params.username ? `@${params.username}` : 'нет username';
  const profileLink = `<a href="tg://user?id=${params.telegramId}">${name}</a>`;

  const text =
    `💳 <b>Новая покупка!</b>\n\n` +
    `👤 ${profileLink}\n` +
    `🆔 ID: <code>${params.telegramId}</code>\n` +
    `📛 Username: ${username}\n` +
    `💰 Сумма: <b>${params.amountRub} ₽</b>\n` +
    `🧾 Заказ: <code>${params.orderId}</code>`;

  await notifyAdmins(bot, text);
}
