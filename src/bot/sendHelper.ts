/**
 * Вспомогательные функции отправки сообщений.
 *
 * editScreen  — для навигационных переходов: редактирует текущее сообщение.
 *               Если редактировать нельзя — фоллбек на sendScreen.
 * sendScreen  — для уроков и тестов: удаляет предыдущее, отправляет новое.
 * sendEphemeral — для подсказок/ошибок в середине теста.
 */
import type { BotContext } from './context.js';
import type { InlineKeyboard } from 'grammy';
import { logger } from '../utils/logger.js';

type SendOptions = {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: InlineKeyboard | { inline_keyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> };
};

// ─── Навигационный переход (edit) ─────────────────────────────────────────────

/**
 * Редактирует текущее сообщение бота (для навигационных переходов).
 * Если callbackQuery есть — использует editMessageText прямо через него.
 * Если нет (команда / нет сохранённого ID) — падает обратно на sendScreen.
 */
export async function editScreen(
  ctx: BotContext,
  text: string,
  options: SendOptions = {},
): Promise<void> {
  // Пробуем отредактировать через callback query (самый надёжный способ)
  if (ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(text, options as Parameters<typeof ctx.editMessageText>[1]);
      // Сохраняем ID отредактированного сообщения
      ctx.session.lastBotMessageId = ctx.callbackQuery.message.message_id;
      return;
    } catch (err: unknown) {
      // Telegram возвращает ошибку если текст не изменился — это нормально
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('message is not modified')) {
        ctx.session.lastBotMessageId = ctx.callbackQuery.message.message_id;
        return;
      }
      // Любая другая ошибка — логируем и фоллбек
      logger.debug({ err }, 'editMessageText не удался, фоллбек на sendScreen');
    }
  }

  // Фоллбек: если нет callbackQuery (вызов из команды) — обычный sendScreen
  await sendScreen(ctx, text, options);
}

// ─── Новое сообщение (для уроков и тестов) ───────────────────────────────────

/**
 * Удаляет предыдущее сообщение бота и отправляет новое.
 * Используй для шагов урока и вопросов теста.
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
 * Отправляет сообщение не удаляя предыдущее (для фидбека внутри теста).
 * Сохраняет ID, чтобы следующий sendScreen/editScreen мог его убрать.
 */
export async function sendEphemeral(
  ctx: BotContext,
  text: string,
  options: SendOptions = {},
): Promise<void> {
  const sent = await ctx.reply(text, options as Parameters<typeof ctx.reply>[1]);
  ctx.session.lastBotMessageId = sent.message_id;
}

// ─── Удаление ─────────────────────────────────────────────────────────────────

export async function deletePrevious(ctx: BotContext): Promise<void> {
  const msgId = ctx.session.lastBotMessageId;
  if (!msgId || !ctx.chat?.id) return;
  ctx.session.lastBotMessageId = undefined;
  try {
    await ctx.api.deleteMessage(ctx.chat.id, msgId);
  } catch {
    // Уже удалено или слишком старое — игнорируем
  }
}

// ─── Документы ───────────────────────────────────────────────────────────────

export async function sendDocumentScreen(
  ctx: BotContext,
  document: Parameters<typeof ctx.replyWithDocument>[0],
  options: Parameters<typeof ctx.replyWithDocument>[1] = {},
): Promise<void> {
  await deletePrevious(ctx);
  const sent = await ctx.replyWithDocument(document, options);
  ctx.session.lastBotMessageId = sent.message_id;
}

export function silentDeleteMessage(ctx: BotContext, messageId: number): void {
  if (!ctx.chat?.id) return;
  ctx.api.deleteMessage(ctx.chat.id, messageId).catch((err) => {
    logger.debug({ err, messageId }, 'Не удалось удалить сообщение');
  });
}
