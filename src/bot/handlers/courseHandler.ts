import type { BotContext } from '../context.js';
import { getCourseAccess, startCourse } from '../../db/repositories/courseAccess.js';
import { mainMenuKeyboard, courseInfoKeyboard } from '../keyboards/mainMenu.js';
import { initiatePurchase } from '../../services/purchaseService.js';
import { scheduleAllLessons } from '../../services/lessonService.js';
import { editScreen } from '../sendHelper.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/index.js';

const COURSE_DESCRIPTION = `🇬🇧 <b>Курс «Английский за 30 дней» + Тренажёр словаря</b>

Полноценная авторская система, которая поможет заговорить на английском с нуля и заложить крепкую грамматическую базу!

🌟 <b>Что входит в курс:</b>
━━━━━━━━━━━━━━━━━━
📖 <b>30 пошаговых интерактивных уроков:</b>
  • Простые и понятные объяснения правил на русском
  • Наглядные жизненные примеры и диалоги
  • Практика: выбор вариантов, письменные задания, свободные ответы

🎧 <b>Мультимедиа в каждом уроке:</b>
  • Голосовые аудиосообщения (MP3) с живым произношением
  • Видео-кружки (MP4) с разбором ключевых тем
  • PDF-конспекты уроков, которые останутся у тебя навсегда

🧠 <b>ПОДАРОК К КУРСУ: Интерактивный словарный тренажёр</b>
  • <b>500+ отборных слов</b> с примерами предложений и озвучкой
  • Чёткая градация по 3 уровням сложности:
    🔹 <b>A1–A2</b> (базовый быт, действия, семья, еда)
    🔹 <b>B1–B2</b> (разговорная речь, работа, путешествия)
    🔹 <b>C1–C2</b> (продвинутая лексика, идиомы и нюансы)
  • Тесты строго по выбранному уровню (без перемешивания)
  • Умный алгоритм повторения и отработки ошибок

⏱ <b>Всего 15–20 минут в день:</b>
  • Проходи уроки в своём ритме и удобное время
  • Возможность приостановить и возобновить обучение в любой момент
  • Персональный трекер прогресса и статистика ответов

━━━━━━━━━━━━━━━━━━
💳 <b>Стоимость: всего ${config.coursePriceRub} ₽</b> <i>(разовый платёж, доступ навсегда)</i>
⚡️ <i>Доступ ко всем урокам и словарному тренажёру открывается сразу после оплаты!</i>`;

export async function handleCourseInfo(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // Если вызов из callback — отвечаем на него
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);

  if (access && access.status !== 'revoked') {
    if (access.status === 'active' || access.status === 'completed') {
      await editScreen(
        ctx,
        '✅ У тебя уже есть доступ к курсу!\n\nВыбери нужный раздел:',
        { reply_markup: mainMenuKeyboard(true) },
      );
      return;
    }
    if (access.status === 'pending') {
      await editScreen(
        ctx,
        '⏳ Доступ к курсу обрабатывается. Как только оплата подтвердится, ты получишь уведомление.',
        { reply_markup: mainMenuKeyboard(false) },
      );
      return;
    }
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
  if (access && (access.status === 'active' || access.status === 'completed')) {
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
      '⚠️ Оплата временно недоступна. Обратись в поддержку.',
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
        `Нажми кнопку ниже, чтобы перейти к оплате. После успешной оплаты доступ откроется автоматически.\n\n` +
        `⚠️ <i>Не нажимай «Я оплатил» без реальной оплаты — доступ открывается только после подтверждения платежа.</i>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Перейти к оплате', url: paymentUrl }],
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
      '❌ Не удалось создать платёж. Попробуй позже или обратись в поддержку.',
      { reply_markup: mainMenuKeyboard(false) },
    );
  }
}

export async function handleStartCourse(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);
  if (!access || access.status !== 'pending') {
    await editScreen(
      ctx,
      'Курс уже начат или недоступен.',
      { reply_markup: mainMenuKeyboard(access?.status === 'active' || access?.status === 'completed') },
    );
    return;
  }

  startCourse(telegramId);
  scheduleAllLessons(telegramId);

  await editScreen(
    ctx,
    `🚀 <b>Обучение началось!</b>\n\n` +
      `Каждый день в ${String(config.lessonSendHour).padStart(2, '0')}:${String(config.lessonSendMinute).padStart(2, '0')} (МСК) ты будешь получать новый урок.\n\n` +
      `Первый урок уже ждёт тебя — нажми «📖 Мой урок» в меню ниже!`,
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
    { parse_mode: 'HTML', reply_markup: JSON.stringify({ inline_keyboard: [[{ text: '🚀 Начать обучение', callback_data: 'start_course' }]] }) },
  );
}
