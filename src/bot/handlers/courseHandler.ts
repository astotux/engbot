import type { BotContext } from '../context.js';
import { getCourseAccess, startCourse, hasUserCourseAccess } from '../../db/repositories/courseAccess.js';
import { getActivePaymentForUser } from '../../db/repositories/payments.js';
import { mainMenuKeyboard, courseInfoKeyboard } from '../keyboards/mainMenu.js';
import { initiatePurchase, verifyPaymentById } from '../../services/purchaseService.js';
import { scheduleAllLessons } from '../../services/lessonService.js';
import { editScreen } from '../sendHelper.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/index.js';

const COURSE_DESCRIPTION = `🇬🇧 <b>Курс «Английский за 30 дней» + Тренажёр словаря и диалогов</b>

Полноценная авторская система, которая поможет заговорить на английском с нуля и заложить крепкую грамматическую базу!

🌟 <b>Что входит в курс:</b>
━━━━━━━━━━━━━━━━━━
📖 <b>30 пошаговых интерактивных уроков:</b>
  • Простые и понятные объяснения правил на русском
  • Наглядные жизненные примеры и диалоги
  • Практика: выбор вариантов, письменные задания, свободные ответы

🎧 <b>Мультимедиа и конспекты:</b>
  • Голосовые аудиосообщения и видео-кружки с произношением
  • Слайдер PDF-конспектов в разделе «📂 Мои конспекты», которые остаются навсегда

🎮 <b>ПОДАРОК К КУРСУ: Мини-игры и тренажёры</b>
  • 🧠 <b>Словарный тренажёр:</b> 500+ слов по уровням (A1–C2) и работа над ошибками
  • 🧩 <b>Конструктор фраз:</b> 35 предложений для тренировки порядка слов
  • 💬 <b>Тренажёр диалогов:</b> 8 реальных жизненных сценариев (кафе, отель, аэропорт, врач, собеседование)

⏱ <b>Всего 15–30 минут в день:</b>
  • Новые уроки открываются каждый день в 00:01 (МСК)

━━━━━━━━━━━━━━━━━━
💳 <b>Стоимость: всего ${config.coursePriceRub} ₽</b> <i>(разовый платёж, доступ навсегда)</i>
⚡️ <i>Доступ ко всем урокам, словарному тренажёру, тренажёру диалогов и конструктору фраз открывается сразу после оплаты!</i>`;

export async function handleCourseInfo(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // Если вызов из callback — отвечаем на него
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);

  if (access && access.status !== 'revoked') {
    await editScreen(
      ctx,
      '✅ У тебя уже есть доступ к курсу!\n\nВыбери нужный раздел:',
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  await editScreen(ctx, COURSE_DESCRIPTION, {
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
  if (access && access.status !== 'revoked') {
    await editScreen(
      ctx,
      '✅ У тебя уже есть доступ к курсу!\n\nВыбери нужный раздел:',
      { reply_markup: mainMenuKeyboard(true) },
    );
    return;
  }

  if (!config.yookassa.enabled) {
    await editScreen(
      ctx,
      '⚠️ Оплата временно недоступна. Напиши в поддержку: @adm_koval.',
      { reply_markup: mainMenuKeyboard(false) },
    );
    return;
  }

  await editScreen(ctx, '⏳ Создаю ссылку на оплату...');

  try {
    const { paymentUrl, paymentId, orderId } = await initiatePurchase(telegramId);
    ctx.session.lastPaymentId = paymentId;
    ctx.session.lastOrderId = orderId;

    await editScreen(
      ctx,
      `💳 <b>Оплата курса «Английский за 30 дней»</b>\n\n` +
        `Сумма: <b>${config.coursePriceRub} ₽</b>\n\n` +
        `Нажми кнопку ниже, чтобы перейти к оплате. После оплаты нажми «🔄 Проверить оплату» — доступ откроется сразу после подтверждения платежа.\n\n` +
        `⚡️ <i>Доступ ко всем урокам и словарному тренажёру открывается навсегда!</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Перейти к оплате', url: paymentUrl }],
            [{ text: '🔄 Проверить оплату', callback_data: `check_payment:${paymentId}` }],
            [{ text: '🏠 На главную', callback_data: 'main_menu' }],
          ],
        },
      },
    );
    logger.info({ telegramId, paymentId }, 'Ссылка на оплату отправлена');
  } catch (err) {
    logger.error({ err, telegramId }, 'Ошибка создания платежа');
    await editScreen(
      ctx,
      '❌ Не удалось создать платёж. Попробуй позже или напиши в поддержку: @adm_koval.',
      { reply_markup: mainMenuKeyboard(false) },
    );
  }
}

export async function handleCheckPayment(ctx: BotContext, explicitPaymentId?: string): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const paymentId =
    explicitPaymentId ??
    ctx.session.lastPaymentId ??
    getActivePaymentForUser(telegramId)?.id;

  if (!paymentId) {
    if (hasUserCourseAccess(telegramId)) {
      await ctx.answerCallbackQuery('Курс уже оплачен и доступен!');
      await editScreen(ctx, '✅ У тебя уже есть полный доступ к курсу!\n\nВыбери нужный раздел:', {
        reply_markup: mainMenuKeyboard(true),
      });
      return;
    }
    await ctx.answerCallbackQuery('Активный платёж не найден');
    await editScreen(ctx, '⚠️ Активный платёж не найден. Ты можешь оформить заказ заново:', {
      reply_markup: mainMenuKeyboard(false),
    });
    return;
  }

  try {
    const result = await verifyPaymentById(paymentId);
    if (result.isPaid) {
      await ctx.answerCallbackQuery('🎉 Оплата подтверждена!');
      await editScreen(
        ctx,
        `🎉 <b>Оплата подтверждена!</b>\n\n` +
          `Добро пожаловать на курс «Английский за 30 дней»!\n\n` +
          `Доступ ко всем материалам открыт. Первый урок уже ждёт тебя 👇`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Начать обучение (Урок 1)', callback_data: 'my_lesson' }],
              [{ text: '🏠 В главное меню', callback_data: 'main_menu' }],
            ],
          },
        },
      );
      return;
    }

    if (result.status === 'canceled') {
      if (hasUserCourseAccess(telegramId)) {
        await ctx.answerCallbackQuery('Курс уже оплачен и доступен!');
        await editScreen(ctx, '✅ У тебя уже есть полный доступ к курсу!\n\nВыбери нужный раздел:', {
          reply_markup: mainMenuKeyboard(true),
        });
        return;
      }
      await ctx.answerCallbackQuery('Платёж был отменён');
      await editScreen(
        ctx,
        '❌ Платёж был отменён. Нажми кнопку ниже, чтобы создать новую ссылку на оплату:',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Оплатить курс', callback_data: 'buy_course' }],
              [{ text: '🏠 На главную', callback_data: 'main_menu' }],
            ],
          },
        },
      );
      return;
    }

    // pending / waiting_for_capture
    await ctx.answerCallbackQuery({
      text: '⏳ Банк ещё обрабатывает платёж. Если деньги списались, подожди 10–30 секунд и нажми кнопку снова.',
      show_alert: true,
    });
  } catch (err) {
    logger.error({ err, paymentId, telegramId }, 'Ошибка проверки платежа пользователем');
    await ctx.answerCallbackQuery({
      text: '⚠️ Не удалось проверить статус платежа. Попробуй ещё раз через пару секунд.',
      show_alert: true,
    });
  }
}

export async function handleStartCourse(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);
  if (!access || access.status === 'revoked') {
    await editScreen(
      ctx,
      'Курс уже начат или недоступен.',
      { reply_markup: mainMenuKeyboard(access?.status === 'active' || access?.status === 'completed') },
    );
    return;
  }

  if (access.status === 'pending') {
    startCourse(telegramId);
    scheduleAllLessons(telegramId);
  }

  await editScreen(
    ctx,
    `🚀 <b>Обучение началось!</b>\n\n` +
      `Новые уроки открываются каждый день в 00:01 (МСК).\n\n` +
      `Первый урок уже ждёт тебя — нажми «📖 Урок дня» в меню ниже!`,
    {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(true),
    },
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
    {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '🚀 Начать обучение', callback_data: 'start_course' }],
          [{ text: '🏠 В главное меню', callback_data: 'main_menu' }],
        ],
      }),
    },
  );
}
