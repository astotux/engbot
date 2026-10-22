import type { BotContext } from '../context.js';
import { upsertUser } from '../../db/repositories/users.js';
import { mainMenuKeyboard, checklistKeyboard } from '../keyboards/mainMenu.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { getBotInstance } from '../botInstance.js';
import { notifyNewUser } from '../../services/notifyService.js';
import { sendScreen, sendDocumentScreen, deletePrevious } from '../sendHelper.js';
import { getCourseAccess } from '../../db/repositories/courseAccess.js';
import fs from 'fs';
import path from 'path';
import { InputFile } from 'grammy';

function hasCourseAccess(telegramId: number): boolean {
  const access = getCourseAccess(telegramId);
  return !!access && (access.status === 'active' || access.status === 'completed');
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

  // Удаляем предыдущий экран (если есть)
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
    await sendScreen(
      ctx,
      `С возвращением, ${user.first_name || 'друг'}! 👋\n\nВыбери нужный раздел:`,
      { reply_markup: mainMenuKeyboard(hasCourse) },
    );
  }
}

export async function sendFreeChecklist(ctx: BotContext): Promise<void> {
  const checklistPath = path.resolve(config.freeChecklistPath);

  if (!fs.existsSync(checklistPath)) {
    logger.warn({ path: checklistPath }, 'PDF чек-лист не найден');
    await sendScreen(
      ctx,
      '🎁 <b>Бесплатный чек-лист: 50 слов для начинающих</b>\n\n' +
        '1. Hello — привет\n2. Goodbye — пока\n3. Please — пожалуйста\n4. Thank you — спасибо\n5. Sorry — извините\n' +
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
      caption: '🎁 Вот твой бесплатный чек-лист — 50 самых нужных английских слов!\n\nСохрани его и используй как шпаргалку.',
      reply_markup: checklistKeyboard(),
    },
  );
}
