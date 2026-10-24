import fs from 'fs';
import path from 'path';
import { InlineKeyboard, InputFile } from 'grammy';
import type { BotContext } from '../context.js';
import { config } from '../../config/index.js';
import { getCompletedDays } from '../../db/repositories/lessons.js';
import { getCourseAccess } from '../../db/repositories/courseAccess.js';
import { getLessonByDay } from '../../content/course.js';
import { setUserLessonTime } from '../../services/lessonService.js';
import { editScreen, sendPersistentDocument } from '../sendHelper.js';

export interface NoteItem {
  id: string;
  day: number;
  title: string;
  subtitle: string;
  filePath: string;
  fileName: string;
  isChecklist: boolean;
}

/**
 * Возвращает список доступных пользователю конспектов.
 * Даже если пользователь не прошёл ни одного урока, первым элементом (индекс 0)
 * всегда идёт бесплатный чек-лист.
 */
export function getUserNotesList(telegramId: number): NoteItem[] {
  const items: NoteItem[] = [
    {
      id: 'checklist',
      day: 0,
      title: 'Бесплатный чек-лист «50 самых нужных английских слов»',
      subtitle: 'Фундамент из 50 ключевых слов и выражений для старта и первых диалогов.',
      filePath: config.freeChecklistPath ? path.resolve(config.freeChecklistPath) : '',
      fileName: 'checklist-english-50-words.pdf',
      isChecklist: true,
    },
  ];

  const completedDays = [...new Set(getCompletedDays(telegramId))].sort((a, b) => a - b);

  for (const day of completedDays) {
    const lesson = getLessonByDay(day);
    const pdfRel = lesson?.pdfFile ?? `./assets/lessons/day${String(day).padStart(2, '0')}.pdf`;
    items.push({
      id: `day_${day}`,
      day,
      title: `День ${day}: ${lesson?.title ?? `Урок ${day}`}`,
      subtitle: `Краткая выжимка правил, примеры и шпаргалка по уроку ${day}.`,
      filePath: path.resolve(pdfRel),
      fileName: `day${String(day).padStart(2, '0')}.pdf`,
      isChecklist: false,
    });
  }

  return items;
}

export function notesSliderKeyboard(index: number, total: number): InlineKeyboard {
  const prevIndex = (index - 1 + total) % total;
  const nextIndex = (index + 1) % total;

  return new InlineKeyboard()
    .text('📥 Скачать этот PDF', `notes:download:${index}`)
    .row()
    .text('⬅️', `notes:slide:${prevIndex}`)
    .text(`📄 ${index + 1} / ${total}`, 'notes:noop')
    .text('➡️', `notes:slide:${nextIndex}`)
    .row()
    .text('🏠 В главное меню', 'main_menu');
}

export function formatNotesSlideText(items: NoteItem[], index: number): string {
  const item = items[index] ?? items[0];
  const completedLessonsCount = Math.max(0, items.length - 1);
  const icon = item.isChecklist ? '🎁' : '📄';

  let text =
    `📂 <b>Мои конспекты</b>  <i>(${index + 1} из ${items.length})</i>\n\n` +
    `${icon} <b>${item.title}</b>\n` +
    `<i>${item.subtitle}</i>\n\n` +
    `📚 Открыто конспектов уроков: <b>${completedLessonsCount} из 30</b>`;

  if (completedLessonsCount === 0) {
    text += `\n💡 <i>Пока у тебя открыт стартовый чек-лист. Завершай уроки курса, и здесь появится конспект каждого пройденного дня!</i>`;
  } else {
    text += `\n💡 <i>Используй стрелки ⬅️ ➡️, чтобы листать открытые материалы.</i>`;
  }

  return text;
}

export async function handleNotesMenu(ctx: BotContext, requestedIndex = 0): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const items = getUserNotesList(telegramId);
  const total = items.length;
  const normalizedIndex = ((requestedIndex % total) + total) % total;

  if (ctx.callbackQuery) {
    if (total === 1 && ctx.callbackQuery.data?.startsWith('notes:slide:')) {
      await ctx.answerCallbackQuery({
        text: 'Пока открыт только бесплатный чек-лист! Проходи уроки, чтобы открывать новые конспекты 📚',
        show_alert: false,
      });
    } else {
      await ctx.answerCallbackQuery();
    }
  }

  const text = formatNotesSlideText(items, normalizedIndex);
  await editScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: notesSliderKeyboard(normalizedIndex, total),
  });
}

export async function handleNotesDownload(ctx: BotContext, requestedIndex: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const items = getUserNotesList(telegramId);
  const total = items.length;
  const index = ((requestedIndex % total) + total) % total;
  const item = items[index];

  const slideText = formatNotesSlideText(items, index);
  const kb = notesSliderKeyboard(index, total);

  if (!item.filePath || !fs.existsSync(item.filePath)) {
    await editScreen(
      ctx,
      `${slideText}\n\n⚠️ <i>Файл PDF временно недоступен на сервере.</i>`,
      { parse_mode: 'HTML', reply_markup: kb },
    );
    return;
  }

  await sendPersistentDocument(
    ctx,
    new InputFile(item.filePath, item.fileName),
    {
      caption: `📄 <b>${item.title}</b>`,
      parse_mode: 'HTML',
    },
    {
      text: slideText,
      options: {
        parse_mode: 'HTML',
        reply_markup: kb,
      },
    },
  );
}

// ─── ⏰ Выбор времени уроков (с учётом 3-часовой разницы с сервером) ──────────

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function lessonTimeKeyboard(currentMskHour: number): InlineKeyboard {
  const prevHour = (currentMskHour + 23) % 24;
  const nextHour = (currentMskHour + 1) % 24;

  const presetsRow1 = [8, 10, 12];
  const presetsRow2 = [15, 18, 21];

  const kb = new InlineKeyboard()
    .text('➖ 1 ч', `lesson_time:set:${prevHour}`)
    .text(`🕒 ${pad2(currentMskHour)}:00 МСК`, 'lesson_time:noop')
    .text('➕ 1 ч', `lesson_time:set:${nextHour}`)
    .row();

  for (const h of presetsRow1) {
    kb.text(`${currentMskHour === h ? '✅ ' : ''}${pad2(h)}:00`, `lesson_time:set:${h}`);
  }
  kb.row();

  for (const h of presetsRow2) {
    kb.text(`${currentMskHour === h ? '✅ ' : ''}${pad2(h)}:00`, `lesson_time:set:${h}`);
  }
  kb.row().text('🏠 В главное меню', 'main_menu');

  return kb;
}

export function formatLessonTimeText(mskHour: number, mskMinute = 0): string {
  return (
    `⏰ <b>Выбрать время уроков</b>\n\n` +
    `Сейчас отправка уроков настроена на: <b>${pad2(mskHour)}:${pad2(mskMinute)} (МСК)</b>\n` +
    `Выбери удобный час для получения своих уроков! (время МСК)`
  );
}

export async function handleLessonTimeMenu(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  const access = getCourseAccess(telegramId);
  const currentMskHour = access?.send_hour ?? config.lessonSendHour;
  const currentMskMinute = access?.send_minute ?? config.lessonSendMinute;

  await editScreen(ctx, formatLessonTimeText(currentMskHour, currentMskMinute), {
    parse_mode: 'HTML',
    reply_markup: lessonTimeKeyboard(currentMskHour),
  });
}

export async function handleSetLessonTime(ctx: BotContext, mskHour: number): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const { mskHour: savedHour, mskMinute } = setUserLessonTime(telegramId, mskHour, 0);

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery(
      `⏰ Время установлено: ${pad2(savedHour)}:${pad2(mskMinute)}`,
    );
  }

  await editScreen(ctx, formatLessonTimeText(savedHour, mskMinute), {
    parse_mode: 'HTML',
    reply_markup: lessonTimeKeyboard(savedHour),
  });
}
