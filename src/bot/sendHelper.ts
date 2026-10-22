/**
 * Вспомогательные функции для отправки сообщений с удалением предыдущего.
 * Каждый раз, когда бот отправляет новое «экранное» сообщение,
 * предыдущее сообщение бота удаляется, чтобы чат выглядел чище.
 */
import type { BotContext } from './context.js';
import type { InlineKeyboard } from 'grammy';
import { logger } from '../utils/logger.js';

type SendOptions = {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: InlineKeyboard | { inline_keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> };
};

/**
 * Удаляет предыдущее «экранное» сообщение бота (если сохранено в сессии),
 * отправляет новое и сохраняет его ID в сессии.
 */
export async function sendScreen(
  ctx: BotContext,
  text: string,
  options: SendOptions = {},
): Promise<void> {
  await deletePrevious(ctx);
  const sent = await ctx.reply(text, options as Parameters<typeof ctx.reply>[1]);
  ctx.session.lastBotMessageId = sent.message_id;
}

/**
 * Удаляет предыдущее сообщение бота (не сохраняет новое — для временных подсказок).
 * Используй для коротких уведомлений (ошибки, подсказки), которые не нужно удалять следующим шагом.
 */
export async function sendEphemeral(
  ctx: BotContext,
  text: string,
  options: SendOptions = {},
): Promise<void> {
  const sent = await ctx.reply(text, options as Parameters<typeof ctx.reply>[1]);
  // Сохраняем ID этого эфемерного сообщения, чтобы следующий sendScreen его удалил
  ctx.session.lastBotMessageId = sent.message_id;
}

/**
 * Тихо удаляет предыдущее «экранное» сообщение бота из сессии.
 */
export async function deletePrevious(ctx: BotContext): Promise<void> {
  const msgId = ctx.session.lastBotMessageId;
  if (!msgId || !ctx.chat?.id) return;
  ctx.session.lastBotMessageId = undefined;
  try {
    await ctx.api.deleteMessage(ctx.chat.id, msgId);
  } catch {
    // Сообщение уже удалено или слишком старое — игнорируем
  }
}

/**
 * Отправляет документ и сохраняет его ID как последнее сообщение бота.
 */
export async function sendDocumentScreen(
  ctx: BotContext,
  document: Parameters<typeof ctx.replyWithDocument>[0],
  options: Parameters<typeof ctx.replyWithDocument>[1] = {},
): Promise<void> {
  await deletePrevious(ctx);
  const sent = await ctx.replyWithDocument(document, options);
  ctx.session.lastBotMessageId = sent.message_id;
}

/**
 * Логирует и глушит ошибки удаления (для безопасного вызова вне sendScreen).
 */
export function silentDeleteMessage(ctx: BotContext, messageId: number): void {
  if (!ctx.chat?.id) return;
  ctx.api.deleteMessage(ctx.chat.id, messageId).catch((err) => {
    logger.debug({ err, messageId }, 'Не удалось удалить сообщение');
  });
}
