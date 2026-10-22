/**
 * Вспомогательные функции отправки сообщений.
 *
 * Бот работает в концепции одного главного экрана (постоянно его редактирует).
 * Все вспомогательные сообщения (медиафайлы, голосовые сообщения, видео-кружки,
 * документы, подсказки) отслеживаются в session.cleanupMessageIds
 * и автоматически удаляются при переходе к следующему экрану или ответу.
 */
import type { BotContext } from './context.js';
import type { InlineKeyboard } from 'grammy';
import { logger } from '../utils/logger.js';

type SendOptions = {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: InlineKeyboard | { inline_keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> };
  skipCleanup?: boolean;
};

// ─── Очистка сообщений ────────────────────────────────────────────────────────

/**
 * Добавляет ID сообщения во временный список на удаление (голосовые, кружки, подсказки и т.д.)
 */
export function addCleanupMessage(ctx: BotContext, messageId: number): void {
  if (!ctx.session) return;
  if (!ctx.session.cleanupMessageIds) {
    ctx.session.cleanupMessageIds = [];
  }
  ctx.session.cleanupMessageIds.push(messageId);
}

/**
 * Удаляет все накопленные вспомогательные сообщения (медиафайлы шага, голосовые, кружки, подсказки)
 */
export async function cleanupAuxiliaryMessages(ctx: BotContext): Promise<void> {
  const ids = ctx.session?.cleanupMessageIds;
  const chatId = ctx.chat?.id;
  if (!ids || ids.length === 0 || !chatId || !ctx.api?.deleteMessage) {
    if (ctx.session) ctx.session.cleanupMessageIds = [];
    return;
  }

  const toDelete = [...ids];
  ctx.session.cleanupMessageIds = [];

  for (const msgId of toDelete) {
    try {
      await ctx.api.deleteMessage(chatId, msgId);
    } catch {
      // Игнорируем ошибки (если сообщение уже удалено пользователем)
    }
  }
}

/**
 * Удаляет входящее сообщение пользователя (команду, текстовый ответ), чтобы не засорять чат
 */
export function deleteUserMessage(ctx: BotContext): void {
  const msgId = ctx.message?.message_id;
  const chatId = ctx.chat?.id;
  if (!msgId || !chatId || !ctx.api?.deleteMessage) return;
  ctx.api.deleteMessage(chatId, msgId).catch(() => {});
}

/**
 * Удаляет предыдущий главный экран бота (если необходимо начать с чистого листа)
 */
export async function deletePrevious(ctx: BotContext): Promise<void> {
  const msgId = ctx.session?.lastBotMessageId;
  const chatId = ctx.chat?.id;
  if (!msgId || !chatId || !ctx.api?.deleteMessage) return;
  if (ctx.session) ctx.session.lastBotMessageId = undefined;
  try {
    await ctx.api.deleteMessage(chatId, msgId);
  } catch {
    // Уже удалено или слишком старое — игнорируем
  }
}

// ─── Единый экран (sendScreen / editScreen) ──────────────────────────────────

/**
 * Отображает экран бота. Всегда пытается отредактировать уже существующее главное сообщение,
 * чтобы бот работал в одном сообщении. Перед обновлением удаляет все вспомогательные медиафайлы.
 */
export async function sendScreen(
  ctx: BotContext,
  text: string,
  options: SendOptions = {},
): Promise<void> {
  const chatId = ctx.chat?.id;
  const lastId = ctx.session?.lastBotMessageId ?? ctx.callbackQuery?.message?.message_id;

  // 1. Очищаем вспомогательные сообщения (медиафайлы шагов, подсказки и т.д.)
  if (!options.skipCleanup) {
    await cleanupAuxiliaryMessages(ctx);
  }

  // 2. Если есть ID существующего экрана — пробуем отредактировать прямо на месте
  if (chatId && lastId && ctx.api?.editMessageText) {
    try {
      const editOpts: Record<string, unknown> = {};
      if (options.parse_mode) editOpts.parse_mode = options.parse_mode;
      if (options.reply_markup) editOpts.reply_markup = options.reply_markup;

      await ctx.api.editMessageText(
        chatId,
        lastId,
        text,
        editOpts as Parameters<typeof ctx.api.editMessageText>[3],
      );
      if (ctx.session) ctx.session.lastBotMessageId = lastId;
      return;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('message is not modified')) {
        if (ctx.session) ctx.session.lastBotMessageId = lastId;
        return;
      }
      logger.debug({ err, lastId }, 'Не удалось отредактировать сообщение, создаём новое');
      try {
        await ctx.api.deleteMessage(chatId, lastId);
      } catch {}
      if (ctx.session) ctx.session.lastBotMessageId = undefined;
    }
  }

  // 3. Если редактировать нечего или не удалось — отправляем новое сообщение
  const replyOpts: Record<string, unknown> = {};
  if (options.parse_mode) replyOpts.parse_mode = options.parse_mode;
  if (options.reply_markup) replyOpts.reply_markup = options.reply_markup;

  const sent = await ctx.reply(text, replyOpts as Parameters<typeof ctx.reply>[1]);
  if (ctx.session) {
    ctx.session.lastBotMessageId = sent.message_id;
  }
}

/**
 * Редактирует текущее сообщение бота.
 */
export async function editScreen(
  ctx: BotContext,
  text: string,
  options: SendOptions = {},
): Promise<void> {
  if (!options.skipCleanup) {
    await cleanupAuxiliaryMessages(ctx);
  }

  if (ctx.callbackQuery?.message) {
    try {
      const editOpts: Record<string, unknown> = {};
      if (options.parse_mode) editOpts.parse_mode = options.parse_mode;
      if (options.reply_markup) editOpts.reply_markup = options.reply_markup;

      await ctx.editMessageText(text, editOpts as Parameters<typeof ctx.editMessageText>[1]);
      if (ctx.session) {
        ctx.session.lastBotMessageId = ctx.callbackQuery.message.message_id;
      }
      return;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('message is not modified')) {
        if (ctx.session) {
          ctx.session.lastBotMessageId = ctx.callbackQuery.message.message_id;
        }
        return;
      }
      logger.debug({ err }, 'ctx.editMessageText не удался, фоллбек на sendScreen');
    }
  }

  await sendScreen(ctx, text, options);
}

/**
 * Отправляет вспомогательное сообщение (подсказку/ошибку), автоматически
 * добавляя его в список на очистку при следующем действии.
 */
export async function sendEphemeral(
  ctx: BotContext,
  text: string,
  options: SendOptions = {},
): Promise<void> {
  const replyOpts: Record<string, unknown> = {};
  if (options.parse_mode) replyOpts.parse_mode = options.parse_mode;
  if (options.reply_markup) replyOpts.reply_markup = options.reply_markup;

  const sent = await ctx.reply(text, replyOpts as Parameters<typeof ctx.reply>[1]);
  addCleanupMessage(ctx, sent.message_id);
}

// ─── Документы ───────────────────────────────────────────────────────────────

export async function sendDocumentScreen(
  ctx: BotContext,
  document: Parameters<typeof ctx.replyWithDocument>[0],
  options: Parameters<typeof ctx.replyWithDocument>[1] = {},
): Promise<void> {
  await cleanupAuxiliaryMessages(ctx);
  await deletePrevious(ctx);
  const sent = await ctx.replyWithDocument(document, options);
  if (ctx.session) {
    ctx.session.lastBotMessageId = sent.message_id;
  }
}

export function silentDeleteMessage(ctx: BotContext, messageId: number): void {
  const chatId = ctx.chat?.id;
  if (!chatId || !ctx.api?.deleteMessage) return;
  ctx.api.deleteMessage(chatId, messageId).catch((err) => {
    logger.debug({ err, messageId }, 'Не удалось удалить сообщение');
  });
}
