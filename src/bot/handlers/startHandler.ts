import type { BotContext } from '../context.js';
import { upsertUser } from '../../db/repositories/users.js';
import { mainMenuKeyboard, checklistKeyboard } from '../keyboards/mainMenu.js';
import { formatMenuText } from './menuHandler.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { getBotInstance } from '../botInstance.js';
import { notifyNewUser } from '../../services/notifyService.js';
import { isSubscribed, getChannelLink, getChannelName } from '../../services/subscriptionService.js';
import { sendScreen, sendPersistentDocument, editScreen, deletePrevious } from '../sendHelper.js';
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
    .url('📢 Подписаться на канал', "https://t.me/engl_zero").row()
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

    const welcomeText =
      `👋 <b>Привет, ${user.first_name || 'друг'}! Рады знакомству!</b>\n\n` +
      `Добро пожаловать в <b>«Английский за 30 дней»</b> 🇬🇧\n\n` +
      `Здесь ты легко освоишь базовый английский язык всего за <b>15–20 минут в день</b> — без зубрёжки, с понятными объяснениями, живыми голосовыми и видео-кружками.\n\n` +
      `🎁 <b>Твой приветственный подарок:</b>\n` +
      `Бесплатный <b>PDF-чек-лист</b> — это фундамент, на котором строится большинство простых диалогов.\n\n` +
      `🎮 <b>А ещё внутри:</b>\n` +
      `Мини-игры и тренажёры: словарный тренажёр на <b>500+ слов</b> (A1–C2), конструктор фраз и симулятор реальных диалогов!\n\n` +
      `<i>Жми кнопку ниже, чтобы забрать чек-лист 👇</i>`;

    await sendScreen(
      ctx,
      welcomeText,
      {
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard()
          .text('🎁 Получить бесплатный чек-лист', 'show_checklist').row()
      },
    );
  } else {
    const text = formatMenuText(hasCourse, user.first_name);
    await sendScreen(
      ctx,
      text,
      { parse_mode: 'HTML', reply_markup: mainMenuKeyboard(hasCourse) },
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
            `Чтобы скачать PDF-конспект, подпишись на наш канал <a href="https://t.me/engl_zero">ENGLISH zero</a> — там выходят полезные разборы и лайфхаки по английскому.\n\n` +
            `После подписки нажми <b>«✅ Я подписался(ась)»</b>, и бот сразу пришлёт тебе файл!`,
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

  const caption =
    `🎁 <b>Твой бесплатный чек-лист готов!</b>\n\n` +
    `🔥 <b>Хочешь заговорить на английском?</b>\n` +
    `В полном курсе <b>«Английский за 30 дней»</b> тебя ждут:\n` +
    `• 30 пошаговых интерактивных уроков (15–20 минут в день)\n` +
    `• Голосовые аудио и видео-кружки с произношением\n` +
    `• <b>Мини-игры и тренажёры в подарок:</b> 500+ слов (A1–C2), конструктор фраз и диалоги\n` +
    `💳 <b>Стоимость полного курса: всего ${config.coursePriceRub} ₽</b>`;

  if (!fs.existsSync(checklistPath)) {
    logger.warn({ path: checklistPath }, 'PDF чек-лист не найден');
    await sendScreen(
      ctx,
      caption + '\n\n<i>(Файл конспекта скоро появится, начни обучение кнопками ниже):</i>',
      { parse_mode: 'HTML', reply_markup: checklistKeyboard() },
    );
    return;
  }

  await sendPersistentDocument(
    ctx,
    new InputFile(checklistPath, 'checklist-english-50-words.pdf'),
    {
      caption: '📄 <b>Бесплатный гид и чек-лист «Английский с нуля за 30 дней»</b>',
      parse_mode: 'HTML',
    },
    {
      text: caption,
      options: {
        parse_mode: 'HTML',
        reply_markup: checklistKeyboard(),
      },
    },
  );
}
