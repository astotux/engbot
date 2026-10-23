import { describe, it, expect } from 'vitest';
import { LESSONS_, getLessonByDay, getStep, getTotalSteps } from '../src/content/course_.js';

describe('Расширенный курс (course_.ts)', () => {
  it('содержит 30 уникальных дней по порядку', () => {
    expect(LESSONS_).toHaveLength(30);
    LESSONS_.forEach((l, i) => expect(l.day).toBe(i + 1));
  });

  it.each(LESSONS_.map((l) => [l.day, l] as const))('день %i: 15–20 шагов, корректные задания', (_day, lesson) => {
    expect(lesson.steps.length).toBeGreaterThanOrEqual(15);
    expect(lesson.steps.length).toBeLessThanOrEqual(20);
    expect(lesson.steps[0].type).toBe('explain');
    expect(lesson.steps[lesson.steps.length - 1].type).toBe('explain');

    for (const s of lesson.steps) {
      if (s.type === 'choice') {
        expect(s.options.length).toBeGreaterThanOrEqual(3);
        expect(s.correctIndex).toBeGreaterThanOrEqual(0);
        expect(s.correctIndex).toBeLessThan(s.options.length);
        expect(new Set(s.options).size).toBe(s.options.length);
        expect(s.hint.length).toBeGreaterThan(0);
        expect(s.explanation.length).toBeGreaterThan(0);
      }
      if (s.type === 'input') {
        expect(s.answerKey.length).toBeGreaterThan(0);
        for (const k of s.answerKey) {
          expect(k).toBe(k.toLowerCase().trim());
          expect(k).not.toMatch(/[.,!?;:]$/);
        }
      }
    }
  });

  it('PDF указан у всех дней, кроме теста (28) и финала (30)', () => {
    for (const l of LESSONS_) {
      if (l.day === 28 || l.day === 30) expect(l.pdfFile).toBeUndefined();
      else expect(l.pdfFile).toBe(`assets/lessons/day${String(l.day).padStart(2, '0')}.pdf`);
    }
  });

  it('пути к медиа соответствуют номеру дня и шага', () => {
    for (const l of LESSONS_) {
      const nn = String(l.day).padStart(2, '0');
      l.steps.forEach((s, i) => {
        const files = [
          (s as { voiceFile?: string }).voiceFile,
          (s as { videoNoteFile?: string }).videoNoteFile,
          (s as { audioFile?: string }).audioFile,
        ].filter(Boolean) as string[];
        for (const f of files) {
          expect(f).toMatch(new RegExp(`^assets/audio/day${nn}_s${String(i + 1).padStart(2, '0')}_[a-z0-9_]+\\.(mp3|mp4)$`));
        }
      });
    }
  });

  it('утилиты работают', () => {
    expect(getLessonByDay(1)?.title).toBeTruthy();
    expect(getTotalSteps(1)).toBe(getLessonByDay(1)!.steps.length);
    expect(getStep(1, 0)?.type).toBe('explain');
    expect(getStep(99, 0)).toBeUndefined();
  });
});
