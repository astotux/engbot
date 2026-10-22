import { getLessonByDay, getStep, getTotalSteps, type Lesson, type ChoiceStep, type InputStep } from '../content/course.js';
import {
  scheduleLessonDelivery,
  saveSubmission,
  getCompletedDays,
} from '../db/repositories/lessons.js';
import {
  getStepProgress,
  initStepProgress,
  advanceStep,
  completeAllSteps,
  getCompletedStepIndices,
} from '../db/repositories/lessonSteps.js';
import { getCourseAccess } from '../db/repositories/courseAccess.js';
import { toZonedScheduledTime } from '../utils/time.js';
import { config } from '../config/index.js';

export function scheduleAllLessons(telegramId: number): void {
  const access = getCourseAccess(telegramId);
  if (!access || access.status !== 'active' || !access.started_at) return;

  const startDate = new Date(access.started_at);
  const hour = access.send_hour ?? config.lessonSendHour;
  const minute = access.send_minute ?? config.lessonSendMinute;
  const tz = config.courseTimezone;

  for (let day = 1; day <= 30; day++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + (day - 1));
    const scheduled = toZonedScheduledTime(d, hour, minute, tz);
    scheduleLessonDelivery(telegramId, day, scheduled.toISOString());
  }
}

// ─── Проверка ответов ─────────────────────────────────────────────────────────

export interface CheckAnswerResult {
  isCorrect: boolean | null;
  score: number | null;
  feedback: string;
  explanation: string;
  hint: string;
}

export function checkStepAnswer(
  day: number,
  stepIndex: number,
  userAnswer: string,
): CheckAnswerResult {
  const step = getStep(day, stepIndex);
  if (!step) {
    return { isCorrect: null, score: null, feedback: 'Шаг не найден.', explanation: '', hint: '' };
  }

  if (step.type === 'free') {
    return {
      isCorrect: null,
      score: null,
      feedback: '✅ Отлично! Ответ сохранён.',
      explanation: `💡 Пример: <i>${step.exampleAnswer}</i>`,
      hint: step.tip,
    };
  }

  if (step.type === 'input') {
    const s = step as InputStep;
    const normalizedUser = normalizeAnswer(userAnswer);
    const isCorrect = s.answerKey.some((key) => normalizeAnswer(key) === normalizedUser);
    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect ? '✅ Правильно!' : '🤔 Не совсем...',
      explanation: isCorrect ? s.explanation : '',
      hint: s.hint,
    };
  }

  return { isCorrect: null, score: null, feedback: '', explanation: '', hint: '' };
}

export function checkChoiceAnswer(
  day: number,
  stepIndex: number,
  chosenIndex: number,
): CheckAnswerResult {
  const step = getStep(day, stepIndex) as ChoiceStep | undefined;
  if (!step || step.type !== 'choice') {
    return { isCorrect: null, score: null, feedback: '', explanation: '', hint: '' };
  }
  const isCorrect = chosenIndex === step.correctIndex;
  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect ? '✅ Правильно!' : '🤔 Не совсем...',
    explanation: isCorrect ? step.explanation : '',
    hint: step.hint,
  };
}

function normalizeAnswer(s: string): string {
  return s.toLowerCase().trim().replace(/[.,!?;:]+$/, '').replace(/\s+/g, ' ');
}

// ─── Прогресс шагов ───────────────────────────────────────────────────────────

export function getOrInitStepProgress(telegramId: number, day: number) {
  return getStepProgress(telegramId, day) ?? initStepProgress(telegramId, day);
}

export function markStepDone(telegramId: number, day: number, stepIndex: number): void {
  advanceStep(telegramId, day, stepIndex);
  const total = getTotalSteps(day);
  const completed = getCompletedStepIndices(telegramId, day);
  if (completed.length >= total) {
    completeAllSteps(telegramId, day);
    // Сохраняем в lesson_submissions для совместимости с прогресс-репозиторием
    saveSubmission(telegramId, day, 'completed', true, 100);
  }
}

export function isStepDone(telegramId: number, day: number, stepIndex: number): boolean {
  const completed = getCompletedStepIndices(telegramId, day);
  return completed.includes(stepIndex);
}

// ─── Прогресс пользователя ────────────────────────────────────────────────────

export function getUserProgress(telegramId: number) {
  const access = getCourseAccess(telegramId);
  if (!access) return null;

  const completedDays = getCompletedDays(telegramId);
  const totalDays = 30;
  const completedCount = completedDays.length;
  const remaining = totalDays - completedCount;
  const percent = Math.round((completedCount / totalDays) * 100);

  return {
    currentDay: access.current_day,
    completedDays,
    completedCount,
    remaining,
    percent,
    nextDay: access.current_day,
    status: access.status,
    startedAt: access.started_at,
  };
}

export function getLessonForUser(telegramId: number, day?: number): Lesson | undefined {
  const access = getCourseAccess(telegramId);
  if (!access || (access.status !== 'active' && access.status !== 'completed')) return undefined;
  const requestedDay = day ?? access.current_day;
  if (requestedDay > access.current_day) return undefined;
  return getLessonByDay(requestedDay);
}
