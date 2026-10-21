import type { BotContext } from '../context.js';
import { getCourseAccess, startCourse } from '../../db/repositories/courseAccess.js';
import { courseInfoKeyboard } from '../keyboards/mainMenu.js';
import { initiatePurchase } from '../../services/purchaseService.js';
import { scheduleAllLessons } from '../../services/lessonService.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/index.js';

const COURSE_DESCRIPTION = `📚 <b>Курс «Английский за 30 дней»</b>

<b>Что ты получишь:</b>
✅ 30 ежедневных уроков (15–30 минут каждый)
✅ Объяснения на русском языке
✅ Примеры с переводом
✅ Практические задания
✅ Проверку ответов прямо в боте
✅ Повторение изученного
✅ Отслеживание прогресса
✅ Итоговый тест

<b>Программа:</b>
📌 Дни 1–7: Приветствия, местоимения, глагол to be
📌 Дни 8–14: Present Simple, повседневные действия
📌 Дни 15–21: Предпочтения, can, кафе, покупки
📌 Дни 22–30: Будущее, прошедшее, итоговая практика

<b>Результат:</b>
После курса ты освоишь базовые конструкции английского и сможешь общаться в простых бытовых ситуациях.

💳 <b>Цена: ${config.coursePriceRub} ₽</b> (единоразовый платёж)
📱 Доступ открывается сразу после оплаты`;

export async function handleCourseInfo(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const access = getCourseAccess(telegramId);

  if (access && access.status !== 'revoked') {
    if (access.status === 'active' || access.status === 'completed') {
      await ctx.reply('✅ У тебя уже есть доступ к курсу!\n\nИспользуй /lesson чтобы открыть урок.');
      return;
    }
    if (access.status === 'pending') {
      await ctx.reply('⏳ Доступ к курсу обрабатывается. Как только оплата подтвердится, ты получишь уведомление.');
      return;
    }
  }

  await ctx.reply(COURSE_DESCRIPTION, {
    parse_mode: 'HTML',
    reply_markup: courseInfoKeyboard(),
  });
}

export async function handleBuyCourse(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.answerCallbackQuery('Ошибка идентификации.');
    return;
  }

  await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);
  if (access && (access.status === 'active' || access.status === 'completed')) {
    await ctx.reply('✅ У тебя уже есть доступ к курсу! Используй /lesson.');
    return;
  }

  if (!config.yookassa.enabled) {
    await ctx.reply('⚠️ Оплата временно недоступна. Обратитесь в поддержку /support.');
    return;
  }

  await ctx.reply('⏳ Создаю ссылку на оплату...');

  try {
    const { paymentUrl, paymentId, orderId } = await initiatePurchase(telegramId);
    ctx.session.lastPaymentId = paymentId;
    ctx.session.lastOrderId = orderId;

    await ctx.reply(
      `💳 <b>Оплата курса «Английский за 30 дней»</b>\n\n` +
        `Сумма: <b>${config.coursePriceRub} ₽</b>\n\n` +
        `Нажми кнопку ниже, чтобы перейти к оплате. После успешной оплаты доступ откроется автоматически.\n\n` +
        `⚠️ <i>Не нажимай «Я оплатил» без реальной оплаты — доступ открывается только после подтверждения платежа.</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '💳 Перейти к оплате', url: paymentUrl }]],
        },
      },
    );
    logger.info({ telegramId, paymentId }, 'Ссылка на оплату отправлена');
  } catch (err) {
    logger.error({ err, telegramId }, 'Ошибка создания платежа');
    await ctx.reply('❌ Не удалось создать платёж. Попробуй позже или обратись в поддержку /support.');
  }
}

export async function handleStartCourse(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);
  if (!access || access.status !== 'pending') {
    await ctx.reply('Курс уже начат или недоступен.');
    return;
  }

  startCourse(telegramId);
  scheduleAllLessons(telegramId);

  await ctx.reply(
    `🚀 <b>Обучение началось!</b>\n\n` +
      `Каждый день в ${String(config.lessonSendHour).padStart(2, '0')}:${String(config.lessonSendMinute).padStart(2, '0')} (МСК) ты будешь получать новый урок.\n\n` +
      `Первый урок уже ждёт тебя — нажми /lesson`,
    { parse_mode: 'HTML' },
  );
  logger.info({ telegramId }, 'Курс начат пользователем');
}

export async function sendCourseAccessMessage(
  bot: { api: { sendMessage: (id: number, text: string, opts?: Record<string, unknown>) => Promise<unknown> } },
  telegramId: number,
): Promise<void> {
  await bot.api.sendMessage(
    telegramId,
    `🎉 <b>Оплата прошла успешно!</b>\n\nДобро пожаловать на курс «Английский за 30 дней».\n\nТебя ждут короткие уроки, практика и постепенное закрепление материала.\n\nНажми кнопку ниже, чтобы начать обучение 👇`,
    { parse_mode: 'HTML', reply_markup: JSON.stringify({ inline_keyboard: [[{ text: '🚀 Начать обучение', callback_data: 'start_course' }]] }) },
  );
}
