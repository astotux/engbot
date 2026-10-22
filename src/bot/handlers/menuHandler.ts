import type { BotContext } from '../context.js';
import { mainMenuKeyboard } from '../keyboards/mainMenu.js';
import { getCourseAccess } from '../../db/repositories/courseAccess.js';
import { sendScreen } from '../sendHelper.js';
import { setRemindersEnabled } from '../../db/repositories/users.js';

const HELP_TEXT = `🆘 <b>Помощь</b>

Используй кнопки меню для навигации.\n\nДоступные команды (только для продвинутых):\n/start — начать или перезапустить\n/menu — главное меню\n/lesson — текущий урок\n/progress — мой прогресс\n/cancel — отменить текущее действие`;

const SUPPORT_TEXT = `🆘 <b>Поддержка</b>

Если что-то пошло не так с оплатой или доступом — опиши проблему ниже 👇

Мы ответим в ближайшее время.`;

function hasCourseAccess(telegramId: number): boolean {
  const access = getCourseAccess(telegramId);
  return !!access && (access.status === 'active' || access.status === 'completed');
}

export async function handleMenu(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  const hasCourse = telegramId ? hasCourseAccess(telegramId) : false;
  await sendScreen(ctx, '📱 Главное меню\n\nВыбери нужный раздел:', {
    reply_markup: mainMenuKeyboard(hasCourse),
  });
}

export async function handleHelp(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  const hasCourse = telegramId ? hasCourseAccess(telegramId) : false;
  await sendScreen(ctx, HELP_TEXT, {
    parse_mode: 'HTML',
    reply_markup: mainMenuKeyboard(hasCourse),
  });
}

export async function handleSupport(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  const hasCourse = telegramId ? hasCourseAccess(telegramId) : false;
  await sendScreen(ctx, SUPPORT_TEXT, {
    parse_mode: 'HTML',
    reply_markup: mainMenuKeyboard(hasCourse),
  });
}

export async function handleCancel(ctx: BotContext): Promise<void> {
  ctx.session.awaitingStep = undefined;
  const telegramId = ctx.from?.id;
  const hasCourse = telegramId ? hasCourseAccess(telegramId) : false;
  await sendScreen(ctx, '❌ Действие отменено.\n\nВыбери нужный раздел:', {
    reply_markup: mainMenuKeyboard(hasCourse),
  });
}

export async function handleDisableReminders(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  setRemindersEnabled(telegramId, false);
  await ctx.answerCallbackQuery('Напоминания отключены');
  const hasCourse = hasCourseAccess(telegramId);
  await sendScreen(ctx, '🔕 Напоминания отключены.\n\nВыбери нужный раздел:', {
    reply_markup: mainMenuKeyboard(hasCourse),
  });
}
