import type { BotContext } from '../context.js';
import { mainMenuKeyboard } from '../keyboards/mainMenu.js';
import { hasUserCourseAccess } from '../../db/repositories/courseAccess.js';
import { sendScreen, editScreen } from '../sendHelper.js';
import { setRemindersEnabled } from '../../db/repositories/users.js';

const HELP_TEXT = `🆘 <b>Помощь</b>

Используй кнопки меню для навигации.

<b>Команды:</b>
/start — перезапустить бота
/menu — главное меню
/lesson — текущий урок
/progress — мой прогресс
/vocab — словарный запас
/cancel — отменить текущее действие`;

const SUPPORT_TEXT = `💬 <b>Служба поддержки и заботы</b>

Возник вопрос по обучению, оплате или доступу к словарю?
Мы всегда на связи и рады помочь!

✍️ <b>Напиши свой вопрос прямо в этот чат</b> — служба поддержки ответит тебе в ближайшее время.`;

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
      `• <b>Мой урок</b> — интерактивная практика с аудио и кружками\n` +
      `• <b>Словарный тренажёр</b> — 500+ слов с разделением по уровням (A1–C2)\n` +
      `• <b>Прогресс</b> — статистика пройденных шагов\n\n` +
      `<i>Выбери нужный раздел:</i>`
    );
  }

  return (
    `🇬🇧 <b>Курс «Английский за 30 дней»</b>\n\n` +
    `Привет${name}! Это твой личный бот-тренажёр для освоения английского с нуля до уверенной базы.\n\n` +
    `✨ <b>Что внутри бота:</b>\n` +
    `• <b>30 пошаговых уроков</b> (15–20 минут в день, без зубрежки)\n` +
    `• <b>Голосовые и видео-кружки</b> с живым произношением\n` +
    `• <b>Интерактивный словарь на 500+ слов</b> (уровни A1–C2, умное повторение ошибок)\n` +
    `• <b>Проверка ответов и конспекты</b> прямо в Telegram\n\n` +
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
  const telegramId = ctx.from?.id;
  const hasCourse = telegramId ? hasCourseAccess(telegramId) : false;
  await editScreen(ctx, SUPPORT_TEXT, {
    parse_mode: 'HTML',
    reply_markup: mainMenuKeyboard(hasCourse),
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
