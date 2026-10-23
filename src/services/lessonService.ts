import { getLessonByDay, getStep, getTotalSteps, type Lesson, type ChoiceStep, type InputStep } from '../content/course.js';
import {
  scheduleLessonDelivery,
  updatePendingLessonDelivery,
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
import { getCourseAccess, updateCourseSendTime } from '../db/repositories/courseAccess.js';
import { countMasteredWords, hasFlawlessQuizSession } from '../db/repositories/vocabulary.js';
import { toZonedScheduledTime, mskHourToServerHour } from '../utils/time.js';
import { config } from '../config/index.js';

function parseSqliteUtcDate(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr.replace(' ', 'T') + 'Z');
}

export function scheduleAllLessons(telegramId: number, forceUpdatePending = false): void {
  const access = getCourseAccess(telegramId);
  if (!access || access.status !== 'active' || !access.started_at) return;

  const startDate = parseSqliteUtcDate(access.started_at);
  const hour = access.send_hour ?? config.lessonSendHour;
  const minute = access.send_minute ?? config.lessonSendMinute;
  const tz = config.courseTimezone;

  for (let day = 1; day <= 30; day++) {
    const d = new Date(startDate.getTime() + (day - 1) * 86_400_000);
    const scheduled = toZonedScheduledTime(d, hour, minute, tz);
    if (forceUpdatePending) {
      updatePendingLessonDelivery(telegramId, day, scheduled.toISOString());
    } else {
      scheduleLessonDelivery(telegramId, day, scheduled.toISOString());
    }
  }
}

export function setUserLessonTime(telegramId: number, mskHour: number, mskMinute = 0): {
  mskHour: number;
  mskMinute: number;
  serverHour: number;
} {
  const clampedHour = ((Math.round(mskHour) % 24) + 24) % 24;
  const clampedMinute = ((Math.round(mskMinute) % 60) + 60) % 60;
  updateCourseSendTime(telegramId, clampedHour, clampedMinute);
  scheduleAllLessons(telegramId, true);
  return {
    mskHour: clampedHour,
    mskMinute: clampedMinute,
    serverHour: mskHourToServerHour(clampedHour),
  };
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
    let isCorrect: boolean;
    if (s.matchMode === 'startsWith') {
      isCorrect = s.answerKey.some((key) => normalizedUser.startsWith(normalizeAnswer(key)));
    } else {
      isCorrect = s.answerKey.some((key) => normalizeAnswer(key) === normalizedUser);
    }
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

// ─── Достижения (Витрина значков) ─────────────────────────────────────────────

export interface AchievementBadge {
  id: 'first_step' | 'flawless_quiz' | 'equator' | 'polyglot_sniper';
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressText: string;
}

export function getUserAchievements(telegramId: number): AchievementBadge[] {
  const completedDays = getCompletedDays(telegramId);
  const completedCount = completedDays.length;
  const firstStepDone = completedDays.includes(1) || completedCount >= 1;
  const flawlessQuizDone = hasFlawlessQuizSession(telegramId);
  const equatorDone = completedCount >= 15;
  const masteredWordsCount = countMasteredWords(telegramId);
  const polyglotDone = masteredWordsCount >= 100;

  return [
    {
      id: 'first_step',
      title: 'Первый шаг',
      description: 'пройден 1-й урок',
      icon: '🌱',
      unlocked: firstStepDone,
      progressText: firstStepDone ? 'Открыто' : '0/1 ур.',
    },
    {
      id: 'flawless_quiz',
      title: 'Без единой ошибки',
      description: 'тест в словаре на 10/10',
      icon: '🎯',
      unlocked: flawlessQuizDone,
      progressText: flawlessQuizDone ? 'Открыто' : 'Нужен тест 10/10',
    },
    {
      id: 'equator',
      title: 'Экватор',
      description: 'пройдено 15 дней курса',
      icon: '🏔',
      unlocked: equatorDone,
      progressText: equatorDone ? 'Открыто' : `${Math.min(completedCount, 15)}/15 дн.`,
    },
    {
      id: 'polyglot_sniper',
      title: 'Полиглот-снайпер',
      description: '100 усвоенных слов в тренажёре',
      icon: '🏆',
      unlocked: polyglotDone,
      progressText: polyglotDone ? 'Открыто' : `${Math.min(masteredWordsCount, 100)}/100 сл.`,
    },
  ];
}
