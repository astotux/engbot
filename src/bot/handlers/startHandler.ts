import type { BotContext } from '../context.js';
import { upsertUser } from '../../db/repositories/users.js';
import { mainMenuKeyboard, checklistKeyboard } from '../keyboards/mainMenu.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { getBotInstance } from '../botInstance.js';
import { notifyNewUser } from '../../services/notifyService.js';
import { isSubscribed, getChannelLink, getChannelName } from '../../services/subscriptionService.js';
import { sendScreen, sendDocumentScreen, editScreen, deletePrevious } from '../sendHelper.js';
import { getCourseAccess } from '../../db/repositories/courseAccess.js';
import fs from 'fs';
import path from 'path';
import { InputFile, InlineKeyboard } from 'grammy';

function hasCourseAccess(telegramId: number): boolean {
  const access = getCourseAccess(telegramId);
  return !!access && (access.status === 'active' || access.status === 'completed');
}

/** Клавиатура для экрана «подпишись на канал» */
function subscribeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .url('📢 Подписаться на канал', getChannelLink()).row()
    .text('✅ Я подписался(ась)', 'check_subscription').row()
    .text('🏠 На главную', 'main_menu');
}

export async function handleStart(ctx: BotContext): Promise<void> {
  const user = ctx.from;
  if (!user) return;

  const text = ctx.message?.text ?? '';
  const startParam = text.split(' ')[1]?.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);

  const { isNew } = upsertUser({
    telegram_id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    language_code: user.language_code,
    source: startParam || null,
  });

  logger.info({ telegramId: user.id, isNew, source: startParam }, 'Пользователь /start');

  const hasCourse = hasCourseAccess(user.id);
  await deletePrevious(ctx);

  if (isNew) {
    await sendScreen(
      ctx,
      `👋 Привет, ${user.first_name || 'друг'}!\n\n` +
        `Я помогу тебе выучить базовый английский за 30 дней.\n\n` +
        `🎁 Начнём с бесплатного чек-листа — 50 самых нужных английских слов для начинающих.\n\n` +
        `А потом расскажу про полный курс из 30 уроков 📚`,
      { reply_markup: mainMenuKeyboard(hasCourse) },
    );
    await sendFreeChecklist(ctx);

    const bot = getBotInstance();
    if (bot) {
      void notifyNewUser(bot, {
        telegramId: user.id,
        firstName: user.first_name ?? null,
        lastName: user.last_name ?? null,
        username: user.username ?? null,
        source: startParam || null,
        isNew: true,
      });
    }
  } else {
    await sendScreen(
      ctx,
      `С возвращением, ${user.first_name || 'друг'}! 👋\n\nВыбери нужный раздел:`,
      { reply_markup: mainMenuKeyboard(hasCourse) },
    );
  }
}

/**
 * Отправляет чек-лист. Если настроен REQUIRED_CHANNEL —
 * сначала проверяет подписку. При отсутствии — показывает экран «подпишись».
 */
export async function sendFreeChecklist(ctx: BotContext): Promise<void> {
  // Проверка подписки
  if (config.requiredChannel) {
    const bot = getBotInstance();
    const telegramId = ctx.from?.id;

    if (bot && telegramId) {
      const subscribed = await isSubscribed(bot, telegramId);

      if (!subscribed) {
        const channelName = getChannelName();
        await sendScreen(
          ctx,
          `🎁 <b>Бесплатный чек-лист</b>\n\n` +
            `Чтобы получить чек-лист, подпишись на наш канал ${channelName} — там выходят полезные материалы по английскому.\n\n` +
            `После подписки нажми кнопку «✅ Я подписался(ась)»:`,
          { parse_mode: 'HTML', reply_markup: subscribeKeyboard() },
        );
        return;
      }
    }
  }

  await deliverChecklist(ctx);
}

/**
 * Callback «✅ Я подписался(ась)» — повторная проверка и выдача чек-листа.
 */
export async function handleCheckSubscription(ctx: BotContext): Promise<void> {
  await ctx.answerCallbackQuery();

  const bot = getBotInstance();
  const telegramId = ctx.from?.id;

  if (!bot || !telegramId) return;

  const subscribed = await isSubscribed(bot, telegramId);

  if (!subscribed) {
    // Редактируем то же сообщение — не спамим новыми
    await editScreen(
      ctx,
      `❌ <b>Подписка не обнаружена.</b>\n\n` +
        `Убедись, что подписался на канал ${getChannelName()}, и нажми кнопку снова.`,
      { parse_mode: 'HTML', reply_markup: subscribeKeyboard() },
    );
    return;
  }

  // Подписан — выдаём чек-лист
  await deliverChecklist(ctx);
}

/** Непосредственная отправка PDF (или текстового фоллбека) */
async function deliverChecklist(ctx: BotContext): Promise<void> {
  const checklistPath = path.resolve(config.freeChecklistPath);

  if (!fs.existsSync(checklistPath)) {
    logger.warn({ path: checklistPath }, 'PDF чек-лист не найден');
    await sendScreen(
      ctx,
      '🎁 <b>Бесплатный чек-лист: 50 слов для начинающих</b>\n\n' +
        '1. Hello — привет\n2. Goodbye — пока\n3. Please — пожалуйста\n' +
        '4. Thank you — спасибо\n5. Sorry — извините\n' +
        '6. Yes — да\n7. No — нет\n8. Good — хорошо\n9. Bad — плохо\n10. Water — вода\n' +
        '11. Food — еда\n12. Home — дом\n13. Work — работа\n14. Day — день\n15. Time — время\n' +
        '...\n\n<i>Полный PDF будет добавлен администратором.</i>',
      { parse_mode: 'HTML', reply_markup: checklistKeyboard() },
    );
    return;
  }

  await sendDocumentScreen(
    ctx,
    new InputFile(checklistPath, 'checklist-english-50-words.pdf'),
    {
      caption:
        '🎁 Вот твой бесплатный чек-лист — 50 самых нужных английских слов!\n\n' +
        'Сохрани его и используй как шпаргалку.',
      reply_markup: checklistKeyboard(),
    },
  );
}
