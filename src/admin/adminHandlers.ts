import type { BotContext } from '../bot/context.js';
import { config } from '../config/index.js';
import { countUsers, getUserByTelegramId } from '../db/repositories/users.js';
import { countPaidOrders, sumRevenue } from '../db/repositories/orders.js';
import {
  countActiveCourses,
  countCompletedCourses,
  getCourseAccess,
  grantCourseAccess,
  revokeCourse,
  startCourse,
} from '../db/repositories/courseAccess.js';
import { logAdminAction, getRecentAuditLogs } from '../db/repositories/adminAudit.js';
import { getLessonByDay } from '../content/course.js';
import { formatLessonMessage } from '../bot/handlers/lessonHandler.js';
import { logger } from '../utils/logger.js';

function isAdmin(telegramId: number): boolean {
  return config.adminIds.includes(telegramId);
}

function requireAdmin(ctx: BotContext): boolean {
  const id = ctx.from?.id;
  if (!id || !isAdmin(id)) {
    void ctx.reply('❌ Нет доступа.');
    return false;
  }
  return true;
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

export async function handleAdminCommand(ctx: BotContext): Promise<void> {
  if (!requireAdmin(ctx)) return;

  const text = ctx.message?.text ?? '';
  const parts = text.trim().split(/\s+/);
  const cmd = parts[0]?.toLowerCase();

  try {
    switch (cmd) {
      case '/admin_stats':
        await handleAdminStats(ctx);
        break;
      case '/admin_user': {
        const id = Number(parts[1]);
        if (!id) { await ctx.reply('Использование: /admin_user <telegram_id>'); return; }
        await handleAdminUser(ctx, id);
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
      case '/admin_help':
        await ctx.reply(
          `🔑 <b>Команды администратора:</b>\n\n` +
            `/admin_stats — статистика\n` +
            `/admin_user <id> — информация о пользователе\n` +
            `/admin_grant <id> — выдать доступ\n` +
            `/admin_revoke <id> — отозвать доступ\n` +
            `/admin_lesson <id> <день> — повторно отправить урок\n` +
            `/admin_msg <id> <текст> — отправить сообщение\n` +
            `/admin_audit — лог действий`,
          { parse_mode: 'HTML' },
        );
        break;
      default:
        await ctx.reply('Неизвестная команда. Используй /admin_help');
    }
  } catch (err) {
    logger.error({ err, cmd }, 'Ошибка выполнения admin-команды');
    await ctx.reply(`❌ Ошибка: ${String(err)}`);
  }
}
