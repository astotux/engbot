import type { BotContext } from '../bot/context.js';
import { config } from '../config/index.js';
import { countUsers, getUserByTelegramId, getUsersPaginated, type User } from '../db/repositories/users.js';
import { countPaidOrders, sumRevenue } from '../db/repositories/orders.js';
import {
  countActiveCourses,
  countCompletedCourses,
  getCourseAccess,
  grantCourseAccess,
  revokeCourse,
  startCourse,
  hasUserCourseAccess,
} from '../db/repositories/courseAccess.js';
import { getCompletedDays } from '../db/repositories/lessons.js';
import { logAdminAction, getRecentAuditLogs } from '../db/repositories/adminAudit.js';
import { getLessonByDay } from '../content/course.js';
import { formatLessonMessage } from '../bot/handlers/lessonHandler.js';
import { scheduleAllLessons } from '../services/lessonService.js';
import { generateReport, cleanupReport } from '../services/reportService.js';
import { logger } from '../utils/logger.js';
import { InlineKeyboard, InputFile } from 'grammy';

export const ADMIN_USERS_PER_PAGE = 8;

function isAdmin(telegramId: number): boolean {
  return config.adminIds.includes(telegramId);
}

function requireAdmin(ctx: BotContext): boolean {
  const id = ctx.from?.id;
  if (!id || !isAdmin(id)) {
    if (ctx.callbackQuery) {
      void ctx.answerCallbackQuery({ text: '❌ Нет доступа.', show_alert: true });
    } else {
      void ctx.reply('❌ Нет доступа.');
    }
    return false;
  }
  return true;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatUserButtonLabel(user: User, hasAccess: boolean): string {
  const statusIcon = hasAccess ? '✅' : '⚪';
  const namePart = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'Без имени';
  const usernamePart = user.username ? ` (@${user.username})` : '';
  const raw = `${statusIcon} ${namePart}${usernamePart} • ${user.telegram_id}`;
  return raw.length > 55 ? raw.slice(0, 52) + '...' : raw;
}

export async function handleAdminUsersList(ctx: BotContext, page = 0): Promise<void> {
  if (!requireAdmin(ctx)) return;
  if (ctx.callbackQuery) {
    try {
      await ctx.answerCallbackQuery();
    } catch {}
  }

  const totalUsers = countUsers();
  const activeCourses = countActiveCourses();
  const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_USERS_PER_PAGE));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const offset = safePage * ADMIN_USERS_PER_PAGE;
  const users = getUsersPaginated(ADMIN_USERS_PER_PAGE, offset);

  const text =
    `🛠 <b>Панель администратора — Пользователи</b>\n\n` +
    `👥 Всего пользователей: <b>${totalUsers}</b>\n` +
    `📚 С активным курсом: <b>${activeCourses}</b>\n` +
    `📄 Страница: <b>${safePage + 1} из ${totalPages}</b>\n\n` +
    `<i>Нажми на пользователя ниже, чтобы посмотреть подробную информацию, выдать или забрать доступ к курсу:</i>\n` +
    `<i>(✅ — есть доступ к курсу, ⚪ — без доступа)</i>`;

  const kb = new InlineKeyboard();

  for (const u of users) {
    const hasAccess = hasUserCourseAccess(u.telegram_id);
    kb.text(formatUserButtonLabel(u, hasAccess), `admin:user:${u.telegram_id}:${safePage}`).row();
  }

  if (totalPages > 1) {
    if (safePage > 0) {
      kb.text('◀️ Сюда', `admin:users:${safePage - 1}`);
    }
    kb.text(`📄 ${safePage + 1} / ${totalPages}`, 'admin:noop');
    if (safePage < totalPages - 1) {
      kb.text('Туда ▶️', `admin:users:${safePage + 1}`);
    }
    kb.row();
  }

  kb.text('📊 Скачать отчёт (Excel)', 'admin:report')
    .text('🔄 Обновить', `admin:users:${safePage}`);

  if (ctx.callbackQuery?.message && ctx.api?.editMessageText) {
    try {
      await ctx.api.editMessageText(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id,
        text,
        { parse_mode: 'HTML', reply_markup: kb },
      );
      return;
    } catch {
      // Если сообщение не изменилось или не удалось отредактировать — игнорируем / отправляем заново
    }
  }

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: kb });
}

function formatCourseStatusRu(status?: string, paused?: number): string {
  if (!status) return '⚪ Нет доступа';
  if (status === 'active') return paused ? '⏸ Активен (на паузе)' : '✅ Активен';
  if (status === 'completed') return '🏆 Курс завершён';
  if (status === 'pending') return '⏳ Выдан (ожидает старта)';
  if (status === 'revoked') return '❌ Отозван';
  return status;
}

export async function handleAdminUserCard(
  ctx: BotContext,
  targetId: number,
  page = 0,
  notice?: string,
): Promise<void> {
  if (!requireAdmin(ctx)) return;
  if (ctx.callbackQuery && !notice) {
    try {
      await ctx.answerCallbackQuery();
    } catch {}
  }

  const user = getUserByTelegramId(targetId);
  if (!user) {
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: '❌ Пользователь не найден', show_alert: true });
    } else {
      await ctx.reply(`❌ Пользователь ${targetId} не найден.`);
    }
    return;
  }

  const access = getCourseAccess(targetId);
  const hasAccess = hasUserCourseAccess(targetId);
  const completedDays = getCompletedDays(targetId);
  const fullName = escapeHtml([user.first_name, user.last_name].filter(Boolean).join(' ').trim() || '—');
  const usernameStr = user.username ? `@${escapeHtml(user.username)}` : '—';

  let text = `👤 <b>Карточка пользователя</b>\n\n`;
  if (notice) {
    text += `${notice}\n\n`;
  }

  text +=
    `🆔 <b>Telegram ID:</b> <code>${user.telegram_id}</code>\n` +
    `📛 <b>Имя:</b> ${fullName}\n` +
    `🔗 <b>Username:</b> ${usernameStr}\n` +
    `📅 <b>Зарегистрирован:</b> ${user.registered_at}\n` +
    `🌐 <b>Язык:</b> ${user.language_code ?? '—'}  |  <b>Источник:</b> ${escapeHtml(user.source ?? '—')}\n` +
    `🔔 <b>Напоминания:</b> ${user.reminders_enabled ? 'Вкл' : 'Выкл'}\n` +
    `🚫 <b>Заблокировал бота:</b> ${user.is_blocked ? 'Да' : 'Нет'}\n\n` +
    `📚 <b>Доступ к курсу:</b>\n` +
    `• <b>Статус:</b> ${formatCourseStatusRu(access?.status, access?.paused)}\n`;

  if (access) {
    text +=
      `• <b>Текущий урок:</b> День ${access.current_day} из 30\n` +
      `• <b>Пройдено уроков:</b> ${completedDays.length} из 30\n` +
      `• <b>Дата старта:</b> ${access.started_at ?? '—'}\n`;
  }

  const kb = new InlineKeyboard();
  if (hasAccess) {
    kb.text('🚫 Забрать доступ к курсу', `admin:revoke:${targetId}:${page}`).row();
  } else {
    kb.text('✅ Выдать доступ к курсу', `admin:grant:${targetId}:${page}`).row();
  }
  kb.text('◀️ К списку пользователей', `admin:users:${page}`);

  if (ctx.callbackQuery?.message && ctx.api?.editMessageText) {
    try {
      await ctx.api.editMessageText(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id,
        text,
        { parse_mode: 'HTML', reply_markup: kb },
      );
      return;
    } catch {
      // Фоллбек на обычную отправку
    }
  }

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: kb });
}

export async function handleAdminToggleAccess(
  ctx: BotContext,
  targetId: number,
  page: number,
  action: 'grant' | 'revoke',
): Promise<void> {
  if (!requireAdmin(ctx)) return;
  const adminId = ctx.from!.id;

  const user = getUserByTelegramId(targetId);
  if (!user) {
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: '❌ Пользователь не найден', show_alert: true });
    }
    return;
  }

  if (action === 'grant') {
    grantCourseAccess(targetId);
    startCourse(targetId);
    scheduleAllLessons(targetId);
    logAdminAction(adminId, 'grant_access', targetId, 'Ручная выдача доступа (админ-панель)');
    logger.info({ adminId, targetId }, 'Ручная выдача доступа через админ-панель');
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCallbackQuery({ text: '✅ Доступ к курсу выдан!' });
      } catch {}
    }
    await handleAdminUserCard(ctx, targetId, page, '✅ <b>Доступ к курсу успешно выдан!</b>');
  } else {
    revokeCourse(targetId);
    logAdminAction(adminId, 'revoke_access', targetId, 'Ручной отзыв доступа (админ-панель)');
    logger.info({ adminId, targetId }, 'Ручной отзыв доступа через админ-панель');
    if (ctx.callbackQuery) {
      try {
        await ctx.answerCallbackQuery({ text: '🚫 Доступ к курсу отозван!' });
      } catch {}
    }
    await handleAdminUserCard(ctx, targetId, page, '🚫 <b>Доступ к курсу отозван.</b>');
  }
}

export async function handleAdminStats(ctx: BotContext): Promise<void> {
  if (!requireAdmin(ctx)) return;

  const totalUsers = countUsers();
  const paidOrders = countPaidOrders();
  const revenueKopecks = sumRevenue();
  const activeCourses = countActiveCourses();
  const completedCourses = countCompletedCourses();
  const revenueRub = (revenueKopecks / 100).toFixed(2);

  await ctx.reply(
    `📊 <b>Статистика</b>\n\n` +
      `👥 Всего пользователей: ${totalUsers}\n` +
      `💳 Оплаченных заказов: ${paidOrders}\n` +
      `💰 Выручка: ${revenueRub} ₽\n` +
      `📚 Активных курсов: ${activeCourses}\n` +
      `✅ Завершённых курсов: ${completedCourses}`,
    { parse_mode: 'HTML' },
  );
}

export async function handleAdminUser(ctx: BotContext, targetId: number): Promise<void> {
  if (!requireAdmin(ctx)) return;

  const user = getUserByTelegramId(targetId);
  if (!user) {
    await ctx.reply(`❌ Пользователь ${targetId} не найден.`);
    return;
  }
  const access = getCourseAccess(targetId);

  await ctx.reply(
    `👤 <b>Пользователь ${targetId}</b>\n\n` +
      `Имя: ${user.first_name ?? '—'} ${user.last_name ?? ''}\n` +
      `Username: @${user.username ?? '—'}\n` +
      `Зарегистрирован: ${user.registered_at}\n` +
      `Заблокировал бота: ${user.is_blocked ? 'Да' : 'Нет'}\n` +
      `Напоминания: ${user.reminders_enabled ? 'Вкл' : 'Выкл'}\n` +
      `Источник: ${user.source ?? '—'}\n\n` +
      `Курс: ${access ? `${access.status}, день ${access.current_day}` : 'Нет доступа'}`,
    { parse_mode: 'HTML' },
  );
}

export async function handleAdminGrant(ctx: BotContext, targetId: number): Promise<void> {
  if (!requireAdmin(ctx)) return;
  const adminId = ctx.from!.id;

  const user = getUserByTelegramId(targetId);
  if (!user) {
    await ctx.reply(`❌ Пользователь ${targetId} не найден. Он должен сначала написать /start.`);
    return;
  }

  grantCourseAccess(targetId);
  startCourse(targetId);
  scheduleAllLessons(targetId);
  logAdminAction(adminId, 'grant_access', targetId, 'Ручная выдача доступа');
  await ctx.reply(`✅ Доступ к курсу выдан пользователю ${targetId}.`);
  logger.info({ adminId, targetId }, 'Ручная выдача доступа');
}

export async function handleAdminRevoke(ctx: BotContext, targetId: number): Promise<void> {
  if (!requireAdmin(ctx)) return;
  const adminId = ctx.from!.id;

  revokeCourse(targetId);
  logAdminAction(adminId, 'revoke_access', targetId, 'Ручной отзыв доступа');
  await ctx.reply(`✅ Доступ к курсу отозван у пользователя ${targetId}.`);
  logger.info({ adminId, targetId }, 'Ручной отзыв доступа');
}

export async function handleAdminResendLesson(
  ctx: BotContext,
  targetId: number,
  dayNumber: number,
): Promise<void> {
  if (!requireAdmin(ctx)) return;
  const adminId = ctx.from!.id;

  const lesson = getLessonByDay(dayNumber);
  if (!lesson) {
    await ctx.reply(`❌ Урок ${dayNumber} не найден.`);
    return;
  }

  await ctx.api.sendMessage(targetId, formatLessonMessage(lesson), { parse_mode: 'HTML' });
  logAdminAction(adminId, 'resend_lesson', targetId, `День ${dayNumber}`);
  await ctx.reply(`✅ Урок ${dayNumber} повторно отправлен пользователю ${targetId}.`);
}

export async function handleAdminMessage(
  ctx: BotContext,
  targetId: number,
  message: string,
): Promise<void> {
  if (!requireAdmin(ctx)) return;
  const adminId = ctx.from!.id;

  if (!message || message.length > 4000) {
    await ctx.reply('❌ Сообщение слишком длинное или пустое.');
    return;
  }

  await ctx.api.sendMessage(targetId, `📬 Сообщение от поддержки:\n\n${message}`);
  logAdminAction(adminId, 'send_message', targetId, message.slice(0, 100));
  await ctx.reply(`✅ Сообщение отправлено пользователю ${targetId}.`);
}

export async function handleAdminAudit(ctx: BotContext): Promise<void> {
  if (!requireAdmin(ctx)) return;

  const logs = getRecentAuditLogs(10);
  if (logs.length === 0) {
    await ctx.reply('Лог пуст.');
    return;
  }

  const text = logs
    .map((l) => `[${l.created_at}] ${l.admin_id}: ${l.action} → ${l.target_telegram_id ?? '—'} — ${l.details ?? ''}`)
    .join('\n');

  await ctx.reply(`📋 <b>Последние действия:</b>\n\n<code>${text}</code>`, { parse_mode: 'HTML' });
}

export async function handleAdminReport(ctx: BotContext): Promise<void> {
  if (!requireAdmin(ctx)) return;
  if (ctx.callbackQuery) {
    try {
      await ctx.answerCallbackQuery({ text: '⏳ Генерирую Excel-отчёт...' });
    } catch {}
  } else {
    await ctx.reply('⏳ Генерирую отчёт...');
  }

  let filePath: string | null = null;
  try {
    filePath = await generateReport();
    await ctx.replyWithDocument(
      new InputFile(filePath, `engbot_report_${new Date().toISOString().slice(0, 10)}.xlsx`),
      { caption: `📊 Отчёт сформирован ${new Date().toLocaleString('ru-RU')}` },
    );
    logAdminAction(ctx.from!.id, 'generate_report');
  } catch (err) {
    logger.error({ err }, 'Ошибка генерации отчёта');
    await ctx.reply(`❌ Ошибка при генерации отчёта: ${String(err)}`);
  } finally {
    if (filePath) cleanupReport(filePath);
  }
}

export async function handleAdminCommand(ctx: BotContext): Promise<void> {
  if (!requireAdmin(ctx)) return;

  const text = ctx.message?.text ?? '';
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0]?.split('@')[0]?.toLowerCase();

  try {
    switch (cmd) {
      case '/admin':
      case '/admin_users':
        await handleAdminUsersList(ctx, 0);
        break;
      case '/admin_stats':
        await handleAdminStats(ctx);
        break;
      case '/admin_user': {
        const id = Number(parts[1]);
        if (!id) { await ctx.reply('Использование: /admin_user <telegram_id>'); return; }
        await handleAdminUserCard(ctx, id, 0);
        break;
      }
      case '/admin_grant': {
        const id = Number(parts[1]);
        if (!id) { await ctx.reply('Использование: /admin_grant <telegram_id>'); return; }
        await handleAdminGrant(ctx, id);
        break;
      }
      case '/admin_revoke': {
        const id = Number(parts[1]);
        if (!id) { await ctx.reply('Использование: /admin_revoke <telegram_id>'); return; }
        await handleAdminRevoke(ctx, id);
        break;
      }
      case '/admin_lesson': {
        const id = Number(parts[1]);
        const day = Number(parts[2]);
        if (!id || !day) { await ctx.reply('Использование: /admin_lesson <telegram_id> <day>'); return; }
        await handleAdminResendLesson(ctx, id, day);
        break;
      }
      case '/admin_msg': {
        const id = Number(parts[1]);
        const msg = parts.slice(2).join(' ');
        if (!id || !msg) { await ctx.reply('Использование: /admin_msg <telegram_id> <сообщение>'); return; }
        await handleAdminMessage(ctx, id, msg);
        break;
      }
      case '/admin_audit':
        await handleAdminAudit(ctx);
        break;
      case '/admin_report':
        await handleAdminReport(ctx);
        break;
      case '/admin_help':
        await ctx.reply(
          `🔑 <b>Команды администратора:</b>\n\n` +
            `/admin — 👥 панель пользователей (просмотр, выдача/отзыв доступа)\n` +
            `/admin_stats — статистика\n` +
            `/admin_user <id> — карточка пользователя\n` +
            `/admin_grant <id> — выдать доступ\n` +
            `/admin_revoke <id> — отозвать доступ\n` +
            `/admin_lesson <id> <день> — повторно отправить урок\n` +
            `/admin_msg <id> <текст> — отправить сообщение\n` +
            `/admin_audit — лог действий\n` +
            `/admin_report — 📊 Excel-отчёт со всей статистикой`,
          { parse_mode: 'HTML' },
        );
        break;
      default:
        await ctx.reply('Неизвестная команда. Используй /admin или /admin_help');
    }
  } catch (err) {
    logger.error({ err, cmd }, 'Ошибка выполнения admin-команды');
    await ctx.reply(`❌ Ошибка: ${String(err)}`);
  }
}
