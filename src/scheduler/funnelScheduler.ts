import { InlineKeyboard, type Bot } from 'grammy';
import type { BotContext } from '../bot/context.js';
import {
  getPendingFunnelDeliveries,
  markFunnelSent,
  markFunnelSkipped,
  markFunnelFailed,
} from '../db/repositories/leadFunnel.js';
import { hasUserCourseAccess } from '../db/repositories/courseAccess.js';
import { getUserByTelegramId, setUserBlocked } from '../db/repositories/users.js';
import {
  saveLessonNotification,
  getLessonNotification,
  clearLessonNotification,
} from '../db/repositories/lessons.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let funnelInterval: ReturnType<typeof setInterval> | null = null;

export function formatFunnelMessage(step: number, priceRub: number): { text: string; keyboard: InlineKeyboard } {
  if (step === 1) {
    const text =
      `💡 <b>Секрет быстрого старта: разбор главной ошибки новичков</b>\n\n` +
      `Привет! Заметили, что ты скачивал(а) наш чек-лист (или присматривался(лась) к курсу), и хотим поделиться важным наблюдением 👇\n\n` +
      `❌ <b>Ошибка №1: Зубрить длинные списки слов без контекста</b>\n` +
      `Многие учат по 50 слов в день, но уже через неделю забывают 90% из них, а связать даже 3 слова в предложение всё равно не могут.\n\n` +
      `✅ <b>Как надо:</b>\n` +
      `Учить готовые речевые конструкции и сразу применять их в жизненных ситуациях (в кофейне, отеле, магазине). Всего 1 правило + 5 фраз в день дают в 10 раз больше, чем часы зубрёжки!\n\n` +
      `В курсе <b>«Английский за 30 дней»</b> каждый урок построен именно так: 15 минут в день, понятные правила на пальцах, голосовые с живым произношением и тренажёр фраз.\n\n` +
      `🎁 <i>При покупке курса — все 3 мини-игры и симулятор диалогов идут в подарок!</i>`;

    const keyboard = new InlineKeyboard()
      .text(`🚀 Начать курс`, 'funnel:buy')
      .row()
      .text('🏠 В главное меню', 'funnel:menu');

    return { text, keyboard };
  }

  // Шаг 2 (через 24 часа)
  const text =
    `⏳ <b>«А вдруг у меня не получится?» или главный страх новичка</b>\n\n` +
    `Прошёл уже день, а первый шаг к свободному английскому всё ещё откладывается?\n\n` +
    `Самые частые сомнения, которые мы слышим:\n` +
    `1️⃣ <i>«У меня нет времени»</i> — уроки курса занимают ровно <b>15–20 минут в день</b>. Их можно проходить по дороге на работу или за чашкой чая.\n` +
    `2️⃣ <i>«У меня языковой барьер»</i> — мы учим говорить с первого дня: в уроках есть аудиосообщения и симулятор диалогов, где ты пробуешь говорить без страха ошибки.\n` +
    `3️⃣ <i>«Я уже пробовал(а), но бросал(а)»</i> — у нас нет скучных учебников. Только понятный русский язык, практика и конспект-шпаргалка к каждому уроку.\n\n` +
    `Через 30 дней ты сможешь уверенно общаться в поездках, понимать базовую речь и строить предложения без паники.\n\n` +
    `💳 <b>Стоимость полного курса со всеми тренажёрами — всего ${priceRub} ₽</b> <i>(разовый платёж)</i>.`;

  const keyboard = new InlineKeyboard()
    .text(`💳 Забрать курс со всеми играми`, 'funnel:buy')
    .row()
    .text('🏠 В главное меню', 'funnel:menu');

  return { text, keyboard };
}

export function startFunnelScheduler(bot: Bot<BotContext>): void {
  if (funnelInterval) return;
  funnelInterval = setInterval(() => { void runFunnelTick(bot); }, 60_000);
  logger.info('Планировщик автоворонки запущен');
}

export function stopFunnelScheduler(): void {
  if (funnelInterval) {
    clearInterval(funnelInterval);
    funnelInterval = null;
    logger.info('Планировщик автоворонки остановлен');
  }
}

export async function runFunnelTick(
  bot: Pick<Bot<BotContext>, 'api'>,
  now: Date = new Date(),
): Promise<number> {
  const pending = getPendingFunnelDeliveries(now.toISOString());
  if (pending.length === 0) return 0;

  let sentCount = 0;

  for (const delivery of pending) {
    // Если пользователь уже купил курс — отменяем отправку
    if (hasUserCourseAccess(delivery.telegram_id)) {
      markFunnelSkipped(delivery.id);
      continue;
    }

    const user = getUserByTelegramId(delivery.telegram_id);
    if (user?.is_blocked) {
      markFunnelFailed(delivery.id, 'User blocked bot');
      continue;
    }

    try {
      // Удаляем предыдущее висящее уведомление, если есть
      const prevNotif = getLessonNotification(delivery.telegram_id);
      if (prevNotif) {
        clearLessonNotification(delivery.telegram_id);
        try {
          await bot.api.deleteMessage(delivery.telegram_id, prevNotif.message_id);
        } catch {}
      }

      const { text, keyboard } = formatFunnelMessage(delivery.step, config.coursePriceRub);
      const sentMsg = await bot.api.sendMessage(delivery.telegram_id, text, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });

      if (sentMsg?.message_id) {
        saveLessonNotification(delivery.telegram_id, sentMsg.message_id, 0);
      }

      markFunnelSent(delivery.id);
      sentCount++;
      logger.info(
        { telegramId: delivery.telegram_id, step: delivery.step, trigger: delivery.trigger_type },
        'Сообщение автоворонки отправлено',
      );
    } catch (err: unknown) {
      const errorMsg = String(err);
      markFunnelFailed(delivery.id, errorMsg);
      if (errorMsg.includes('403') || errorMsg.includes('bot was blocked')) {
        setUserBlocked(delivery.telegram_id, true);
      }
      logger.error({ err, telegramId: delivery.telegram_id, step: delivery.step }, 'Ошибка отправки воронки');
    }
  }

  return sentCount;
}
