/**
 * Проверка подписки пользователя на обязательный канал.
 * Использует Bot API getChatMember.
 */
import type { Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/** Статусы, при которых считаем пользователя подписанным */
const SUBSCRIBED_STATUSES = new Set(['creator', 'administrator', 'member']);

/**
 * Проверяет подписку через Bot API.
 * Возвращает true если подписан или проверка отключена (REQUIRED_CHANNEL не задан).
 */
export async function isSubscribed(
  bot: Bot<BotContext>,
  telegramId: number,
): Promise<boolean> {
  if (!config.requiredChannel) return true;

  try {
    const member = await bot.api.getChatMember(config.requiredChannel, telegramId);
    return SUBSCRIBED_STATUSES.has(member.status);
  } catch (err) {
    // Бот не добавлен в канал как администратор — логируем и пропускаем проверку
    logger.warn({ err, channel: config.requiredChannel }, 'Не удалось проверить подписку на канал');
    return true;
  }
}

/**
 * Формирует ссылку на канал для кнопки «Подписаться».
 * Работает для @username и числовых id (через t.me/c/...).
 */
export function getChannelLink(): string {
  const ch = config.requiredChannel ?? '';
  if (ch.startsWith('@')) {
    return `https://t.me/${ch.slice(1)}`;
  }
  // Числовой id вида -1001234567890 → убираем -100
  const numId = ch.replace(/^-100/, '');
  return `https://t.me/c/${numId}`;
}

/** Читаемое имя канала для сообщений (просто возвращаем то что в конфиге) */
export function getChannelName(): string {
  return config.requiredChannel ?? '';
}
