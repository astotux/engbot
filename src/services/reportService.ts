import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { getDb } from '../db/connection.js';
import { countUsers, getUserByTelegramId } from '../db/repositories/users.js';
import { countPaidOrders, sumRevenue } from '../db/repositories/orders.js';
import { countActiveCourses, countCompletedCourses } from '../db/repositories/courseAccess.js';

interface UserRow {
  telegram_id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  source: string | null;
  registered_at: string;
  is_blocked: number;
}

interface OrderRow {
  id: string;
  telegram_id: number;
  amount_kopecks: number;
  status: string;
  created_at: string;
}

interface AccessRow {
  telegram_id: number;
  status: string;
  current_day: number;
  started_at: string | null;
  completed_at: string | null;
}

interface SubmissionRow {
  telegram_id: number;
  completed_days: number;
  correct_answers: number;
}

export async function generateReport(): Promise<string> {
  const db = getDb();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'EngBot';
  workbook.created = new Date();

  // ─── Лист 1: Сводка ──────────────────────────────────────────────────────
  const summary = workbook.addWorksheet('📊 Сводка');
  summary.columns = [
    { header: 'Показатель', key: 'metric', width: 35 },
    { header: 'Значение', key: 'value', width: 20 },
  ];
  styleHeader(summary);

  const revenueKopecks = sumRevenue();
  const revenueRub = (revenueKopecks / 100).toFixed(2);

  const rows = [
    ['Всего пользователей', countUsers()],
    ['Оплаченных заказов', countPaidOrders()],
    ['Выручка (руб)', revenueRub],
    ['Активных курсов', countActiveCourses()],
    ['Завершённых курсов', countCompletedCourses()],
    ['Дата отчёта', new Date().toLocaleString('ru-RU')],
  ];
  rows.forEach(([metric, value]) => summary.addRow({ metric, value }));
  autoStyle(summary);

  // ─── Лист 2: Пользователи ─────────────────────────────────────────────────
  const usersSheet = workbook.addWorksheet('👥 Пользователи');
  usersSheet.columns = [
    { header: 'Telegram ID', key: 'telegram_id', width: 15 },
    { header: 'Имя', key: 'name', width: 25 },
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Источник', key: 'source', width: 20 },
    { header: 'Дата регистрации', key: 'registered_at', width: 22 },
    { header: 'Заблокировал', key: 'is_blocked', width: 14 },
  ];
  styleHeader(usersSheet);

  const users = db.prepare('SELECT * FROM users ORDER BY registered_at DESC').all() as UserRow[];
  for (const u of users) {
    usersSheet.addRow({
      telegram_id: u.telegram_id,
      name: [u.first_name, u.last_name].filter(Boolean).join(' ') || '—',
      username: u.username ? `@${u.username}` : '—',
      source: u.source || '—',
      registered_at: formatDate(u.registered_at),
      is_blocked: u.is_blocked ? 'Да' : 'Нет',
    });
  }
  autoStyle(usersSheet);

  // ─── Лист 3: Заказы и оплаты ──────────────────────────────────────────────
  const ordersSheet = workbook.addWorksheet('💳 Заказы');
  ordersSheet.columns = [
    { header: 'ID заказа', key: 'id', width: 38 },
    { header: 'Telegram ID', key: 'telegram_id', width: 15 },
    { header: 'Имя', key: 'name', width: 25 },
    { header: 'Сумма (руб)', key: 'amount', width: 14 },
    { header: 'Статус', key: 'status', width: 14 },
    { header: 'Дата', key: 'created_at', width: 22 },
  ];
  styleHeader(ordersSheet);

  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as OrderRow[];
  for (const o of orders) {
    const user = getUserByTelegramId(o.telegram_id);
    const name = user
      ? [user.first_name, user.last_name].filter(Boolean).join(' ') || `ID ${o.telegram_id}`
      : `ID ${o.telegram_id}`;
    ordersSheet.addRow({
      id: o.id,
      telegram_id: o.telegram_id,
      name,
      amount: (o.amount_kopecks / 100).toFixed(2),
      status: translateStatus(o.status),
      created_at: formatDate(o.created_at),
    });
  }
  autoStyle(ordersSheet);

  // ─── Лист 4: Прогресс по курсу ────────────────────────────────────────────
  const progressSheet = workbook.addWorksheet('📚 Прогресс курса');
  progressSheet.columns = [
    { header: 'Telegram ID', key: 'telegram_id', width: 15 },
    { header: 'Имя', key: 'name', width: 25 },
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Статус курса', key: 'status', width: 18 },
    { header: 'Текущий день', key: 'current_day', width: 15 },
    { header: '% прохождения', key: 'percent', width: 15 },
    { header: 'Правильных ответов', key: 'correct', width: 20 },
    { header: 'Дата начала', key: 'started_at', width: 22 },
    { header: 'Дата завершения', key: 'completed_at', width: 22 },
  ];
  styleHeader(progressSheet);

  const accesses = db
    .prepare('SELECT * FROM course_access ORDER BY purchased_at DESC')
    .all() as AccessRow[];

  for (const a of accesses) {
    const user = getUserByTelegramId(a.telegram_id);
    const name = user
      ? [user.first_name, user.last_name].filter(Boolean).join(' ') || `ID ${a.telegram_id}`
      : `ID ${a.telegram_id}`;

    const submStats = db
      .prepare(
        `SELECT
           COUNT(DISTINCT day_number) as completed_days,
           SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
         FROM lesson_submissions
         WHERE telegram_id = ?`,
      )
      .get(a.telegram_id) as SubmissionRow;

    const percent = Math.round((a.current_day / 30) * 100);

    progressSheet.addRow({
      telegram_id: a.telegram_id,
      name,
      username: user?.username ? `@${user.username}` : '—',
      status: translateStatus(a.status),
      current_day: a.current_day,
      percent: `${percent}%`,
      correct: submStats?.correct_answers ?? 0,
      started_at: a.started_at ? formatDate(a.started_at) : '—',
      completed_at: a.completed_at ? formatDate(a.completed_at) : '—',
    });
  }
  autoStyle(progressSheet);

  // ─── Сохраняем файл ───────────────────────────────────────────────────────
  const tmpDir = os.tmpdir();
  const fileName = `engbot_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const filePath = path.join(tmpDir, fileName);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

// ─── Утилиты ─────────────────────────────────────────────────────────────────

function styleHeader(sheet: ExcelJS.Worksheet): void {
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E86AB' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;
}

function autoStyle(sheet: ExcelJS.Worksheet): void {
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };
    });
    if (rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' },
        };
      });
    }
  });
}

function formatDate(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    pending: 'Ожидает',
    paid: 'Оплачен',
    canceled: 'Отменён',
    refunded: 'Возврат',
    active: 'Активен',
    completed: 'Завершён',
    paused: 'Пауза',
    revoked: 'Отозван',
  };
  return map[status] ?? status;
}

export function cleanupReport(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // игнорируем
  }
}
