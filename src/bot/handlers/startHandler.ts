import type { BotContext } from '../context.js';
import { upsertUser } from '../../db/repositories/users.js';
import { mainMenuKeyboard, checklistKeyboard } from '../keyboards/mainMenu.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { getBotInstance } from '../botInstance.js';
import { notifyNewUser } from '../../services/notifyService.js';
import fs from 'fs';
import path from 'path';
import { InputFile } from 'grammy';

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

  if (isNew) {
    await ctx.reply(
      `👋 Привет, ${user.first_name || 'друг'}!\n\n` +
        `Я помогу тебе выучить базовый английский за 30 дней.\n\n` +
        `🎁 Начнём с бесплатного чек-листа — 50 самых нужных английских слов для начинающих.\n\n` +
        `А потом расскажу про полный курс из 30 уроков 📚`,
      { reply_markup: mainMenuKeyboard() },
    );
    await sendFreeChecklist(ctx);

    // Уведомляем администраторов
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
    await ctx.reply(
      `С возвращением, ${user.first_name || 'друг'}! 👋\n\nИспользуй меню ниже для навигации.`,
      { reply_markup: mainMenuKeyboard() },
    );
  }
}

export async function sendFreeChecklist(ctx: BotContext): Promise<void> {
  const checklistPath = path.resolve(config.freeChecklistPath);

  if (!fs.existsSync(checklistPath)) {
    logger.warn({ path: checklistPath }, 'PDF чек-лист не найден');
    await ctx.reply(
      '🎁 <b>Бесплатный чек-лист: 50 слов для начинающих</b>\n\n' +
        '1. Hello — привет\n2. Goodbye — пока\n3. Please — пожалуйста\n4. Thank you — спасибо\n5. Sorry — извините\n' +
        '6. Yes — да\n7. No — нет\n8. Good — хорошо\n9. Bad — плохо\n10. Water — вода\n' +
        '11. Food — еда\n12. Home — дом\n13. Work — работа\n14. Day — день\n15. Time — время\n' +
        '...\n\n<i>Полный PDF будет добавлен администратором.</i>',
      { parse_mode: 'HTML', reply_markup: checklistKeyboard() },
    );
    return;
  }

  await ctx.replyWithDocument(new InputFile(checklistPath, 'checklist-english-50-words.pdf'), {
    caption: '🎁 Вот твой бесплатный чек-лист — 50 самых нужных английских слов!\n\nСохрани его и используй как шпаргалку.',
    reply_markup: checklistKeyboard(),
  });
}
