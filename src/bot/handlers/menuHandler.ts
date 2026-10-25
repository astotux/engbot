import type { BotContext } from '../context.js';
import { mainMenuKeyboard, supportKeyboard } from '../keyboards/mainMenu.js';
import { hasUserCourseAccess } from '../../db/repositories/courseAccess.js';
import { sendScreen, editScreen } from '../sendHelper.js';
import { setRemindersEnabled } from '../../db/repositories/users.js';

const HELP_TEXT = `🆘 <b>Помощь</b>

Используй кнопки меню для навигации.

<b>Команды:</b>
/start — перезапустить бота
/menu — главное меню
/lesson — текущий урок
/progress — мой прогресс и витрина значков
/notes — мои конспекты и чек-лист
/games — мини-игры (словарь, конструктор фраз, диалоги)
/vocab — словарный тренажёр
/cancel — отменить текущее действие`;

export const SUPPORT_TEXT = `💬 <b>Служба поддержки</b>

Если у тебя возникли вопросы по обучению, оплате или работе тренажёров, напиши напрямую администратору:
👉 @adm_koval

Я всегда на связи и помогу во всём разобраться!`;

function hasCourseAccess(telegramId: number): boolean {
  return hasUserCourseAccess(telegramId);
}

export function formatMenuText(hasCourse: boolean, firstName?: string): string {
  const name = firstName ? `, ${firstName}` : '';

  if (hasCourse) {
    return (
      `👋 <b>С возвращением${name}!</b>\n\n` +
      `Твой ежедневный шаг к уверенному английскому 🇬🇧\n\n` +
      `📌 <b>Твоё обучение:</b>\n` +
      `• <b>Урок дня</b> — интерактивная практика с аудио и кружками\n` +
      `• <b>Мой прогресс</b> — статистика курса и витрина секретных значков 🏅\n` +
      `• <b>Мои конспекты</b> — слайдер всех открытых PDF-конспектов и чек-листа 📂\n` +
      `• <b>Мини-игры</b> — тренажёр слов (A1–C2), конструктор фраз и симулятор диалогов 🎮\n\n` +
      `<i>Выбери нужный раздел:</i>`
    );
  }

  return (
    `🇬🇧 <b>Курс «Английский за 30 дней»</b>\n\n` +
    `Привет${name}! Это твой личный бот-тренажёр для освоения английского с нуля до уверенной базы.\n\n` +
    `✨ <b>Что внутри бота:</b>\n` +
    `• <b>30 пошаговых уроков</b> (15–20 минут в день)\n` +
    `• <b>Голосовые и видео-кружки</b> с живым произношением\n` +
    `• <b>Мини-игры и тренажёры:</b> словарь на 500+ слов (A1–C2), конструктор фраз и симулятор диалогов 🎮\n` +
    `• <b>Мои конспекты, витрина значков</b> и еженедельные отчёты прямо в Telegram\n\n` +
    `🎁 <i>Забери бесплатный чек-лист или начни полный курс прямо сейчас!</i>`
  );
}

export async function handleMenu(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  const hasCourse = telegramId ? hasCourseAccess(telegramId) : false;
  const text = formatMenuText(hasCourse, ctx.from?.first_name);
  await sendScreen(ctx, text, {
    parse_mode: 'HTML',
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
  await editScreen(ctx, SUPPORT_TEXT, {
    parse_mode: 'HTML',
    reply_markup: supportKeyboard(),
  });
}

export async function handleCancel(ctx: BotContext): Promise<void> {
  ctx.session.awaitingStep = undefined;
  ctx.session.vocabAwaitingAnswer = undefined;
  ctx.session.phraseBuilderState = undefined;
  ctx.session.dialogueState = undefined;
  const telegramId = ctx.from?.id;
  const hasCourse = telegramId ? hasCourseAccess(telegramId) : false;
  const text = `❌ <i>Действие отменено.</i>\n\n` + formatMenuText(hasCourse, ctx.from?.first_name);
  await editScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: mainMenuKeyboard(hasCourse),
  });
}

export async function handleDisableReminders(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  setRemindersEnabled(telegramId, false);
  await ctx.answerCallbackQuery('Напоминания отключены');
  const hasCourse = hasCourseAccess(telegramId);
  await editScreen(ctx, '🔕 Напоминания отключены.\n\nВыбери нужный раздел:', {
    reply_markup: mainMenuKeyboard(hasCourse),
  });
}
