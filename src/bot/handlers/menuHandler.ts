import type { BotContext } from '../context.js';
import { mainMenuKeyboard } from '../keyboards/mainMenu.js';
import { handleCourseInfo } from './courseHandler.js';
import { handleLesson, handleProgress } from './lessonHandler.js';
import { sendFreeChecklist } from './startHandler.js';
import { setRemindersEnabled } from '../../db/repositories/users.js';

const PROGRAM_TEXT = `📚 <b>Программа курса «Английский за 30 дней»</b>

<b>Неделя 1 (дни 1–7):</b>
Приветствия, местоимения, глагол to be, отрицания, вопросы, числа, мини-тест

<b>Неделя 2 (дни 8–14):</b>
Present Simple, повседневные действия, don't/doesn't, вопросы Do/Does, наречия, время, тест

<b>Неделя 3 (дни 15–21):</b>
Предпочтения, can, в кафе, покупки, направления, семья, диалоги

<b>Неделя 4 (дни 22–30):</b>
Повторение, going to, прошедшее время, вопросит. слова, рассказ о себе, ошибки, финальный тест

Каждый урок: объяснение + примеры + 3-5 заданий + аудио + PDF конспект`;

const HELP_TEXT = `🆘 <b>Помощь</b>

<b>Команды:</b>
/start — начать или перезапустить
/menu — главное меню
/course — информация о курсе
/lesson — текущий урок
/progress — мой прогресс
/help — эта справка
/support — поддержка
/cancel — отменить текущее действие`;

const SUPPORT_TEXT = `🆘 <b>Поддержка</b>

Если что-то пошло не так с оплатой или доступом — опиши проблему ниже 👇

Мы ответим в ближайшее время.`;

export async function handleMenu(ctx: BotContext): Promise<void> {
  await ctx.reply('📱 Главное меню\n\nВыбери нужный раздел:', { reply_markup: mainMenuKeyboard() });
}

export async function handleHelp(ctx: BotContext): Promise<void> {
  await ctx.reply(HELP_TEXT, { parse_mode: 'HTML' });
}

export async function handleSupport(ctx: BotContext): Promise<void> {
  await ctx.reply(SUPPORT_TEXT, { parse_mode: 'HTML' });
}

export async function handleCancel(ctx: BotContext): Promise<void> {
  ctx.session.awaitingStep = undefined;
  await ctx.reply('❌ Действие отменено.', { reply_markup: mainMenuKeyboard() });
}

export async function handleTextButton(ctx: BotContext): Promise<void> {
  const text = ctx.message?.text;
  switch (text) {
    case '🎁 Бесплатный чек-лист':
      await sendFreeChecklist(ctx);
      break;
    case '📚 Программа курса':
      await ctx.reply(PROGRAM_TEXT, { parse_mode: 'HTML' });
      break;
    case '💳 Купить курс за 500 ₽':
      await handleCourseInfo(ctx);
      break;
    case '📖 Мой урок':
      await handleLesson(ctx);
      break;
    case '📊 Мой прогресс':
      await handleProgress(ctx);
      break;
    case '🆘 Поддержка':
      await handleSupport(ctx);
      break;
  }
}

export async function handleDisableReminders(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  setRemindersEnabled(telegramId, false);
  await ctx.answerCallbackQuery('Напоминания отключены');
  await ctx.reply('🔕 Напоминания отключены.\n\nМожешь включить их снова через /menu.');
}
