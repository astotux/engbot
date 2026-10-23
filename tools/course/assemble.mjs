// Assembles tools/course/parts/dayNN.part.js -> src/content/course_.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const parts = [];
for (let d = 1; d <= 30; d++) {
  const f = path.join(here, 'parts', `day${String(d).padStart(2, '0')}.part.js`);
  if (!fs.existsSync(f)) throw new Error(`missing ${f}`);
  const src = fs.readFileSync(f, 'utf8').replace(/\s+$/, '');
  const bar = '═'.repeat(75);
  parts.push(`  // ${bar}\n  // ДЕНЬ ${d}\n  // ${bar}\n${src}\n`);
}

const header = `// ═════════════════════════════════════════════════════════════════════════════
// РАСШИРЕННЫЙ КУРС (30 дней × 15–20 шагов) — файл «course_.ts»
//
// Это ВТОРОЙ вариант курса. Оригинальный файл course.ts не тронут.
// Типы (Lesson, LessonStep и т.д.) берутся из course.ts, формат шагов тот же.
//
// ЧТО ВСТАВЛЯТЬ ВРУЧНУЮ (везде оставлены подробные комментарии):
//   • «🎬 ВСТАВИТЬ КРУЖОК»      — видео-кружок .mp4  (поле videoNoteFile)
//   • «🎙 ВСТАВИТЬ ГОЛОСОВОЕ»   — голосовое .mp3     (поле voiceFile)
//   • «📄 ВСТАВИТЬ PDF-КОНСПЕКТ» — PDF дня (pdfFile) — над ним полный текст PDF
//
// PDF отправляется ОДИН раз и В НАЧАЛЕ урока (до 1-го шага).
// На шаге можно держать одновременно голосовое + кружок (отправляются перед текстом шага).
// Если файла нет на диске — бот просто пропустит его без ошибки.
//
// КАК ПЕРЕКЛЮЧИТЬ БОТА НА ЭТОТ КУРС: в файлах, где есть импорт из
// '../content/course.js', замени путь на '../content/course_.js'
// (экспортируются те же имена: LESSONS, getLessonByDay, getTotalSteps, getStep).
// ═════════════════════════════════════════════════════════════════════════════

import type { Lesson, LessonStep } from './course.js';

export const LESSONS_: Lesson[] = [
`;

const footer = `];

// ─── Утилиты (те же имена, что в course.ts — для простого переключения) ──────

export const LESSONS: Lesson[] = LESSONS_;

export function getLessonByDay(day: number): Lesson | undefined {
  return LESSONS_.find((l) => l.day === day);
}

export function getTotalSteps(day: number): number {
  return getLessonByDay(day)?.steps.length ?? 0;
}

export function getStep(day: number, stepIndex: number): LessonStep | undefined {
  return getLessonByDay(day)?.steps[stepIndex];
}
`;

fs.writeFileSync(path.join(root, 'src', 'content', 'course_.ts'), header + parts.join('\n') + footer, 'utf8');
console.log('written src/content/course_.ts');
