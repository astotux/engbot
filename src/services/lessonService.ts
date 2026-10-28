import { getLessonByDay, getStep, getTotalSteps, type Lesson, type ChoiceStep, type InputStep } from '../content/course.js';
import { getDb } from '../db/connection.js';
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
  isDayCompleted,
} from '../db/repositories/lessonSteps.js';
import { getCourseAccess, updateCourseSendTime } from '../db/repositories/courseAccess.js';
import { updateStreak } from '../db/repositories/users.js';
import { getUserByTelegramId } from '../db/repositories/users.js';
import { countMasteredWords, hasFlawlessQuizSession } from '../db/repositories/vocabulary.js';
import { getMinigameProgress } from '../db/repositories/minigames.js';
import { DIALOGUE_SCENARIOS } from '../content/minigames.js';
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
  const tz = config.courseTimezone;

  // День 1 открывается сразу при старте, а все следующие уроки (2..30) — в 00:01 МСК следующего дня
  for (let day = 1; day <= 30; day++) {
    const d = new Date(startDate.getTime() + (day - 1) * 86_400_000);
    const scheduled = day === 1 ? startDate : toZonedScheduledTime(d, 0, 1, tz);
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
    updateStreak(telegramId);
  }
}

export function isStepDone(telegramId: number, day: number, stepIndex: number): boolean {
  const completed = getCompletedStepIndices(telegramId, day);
  return completed.includes(stepIndex);
}

// ─── Доступность и статус уроков ───────────────────────────────────────────

/**
 * Возвращает список всех номеров уроков (1..30), которые уже открыты для пользователя.
 */
export function getAvailableDays(telegramId: number): number[] {
  const access = getCourseAccess(telegramId);
  if (!access || access.status === 'revoked') return [];

  const daysSet = new Set<number>();

  // Если курс активен или завершён, День 1 всегда доступен
  if (access.status === 'active' || access.status === 'completed') {
    daysSet.add(1);
  }

  // Все когда-либо пройденные дни
  for (const day of getCompletedDays(telegramId)) {
    daysSet.add(day);
  }

  // Все дни из lesson_deliveries, которые уже отправлены или наступили по расписанию
  try {
    const deliveries = getDb()
      .prepare(`
        SELECT day_number FROM lesson_deliveries
        WHERE telegram_id = ? AND (status = 'sent' OR datetime(scheduled_at) <= datetime('now'))
      `)
      .all(telegramId) as Array<{ day_number: number }>;
    for (const d of deliveries) {
      daysSet.add(d.day_number);
    }
  } catch {
    // Таблица может отсутствовать в отдельных юнит-тестах
  }

  // Если в course_access зафиксирован current_day, все дни до него также считаем доступными
  if (access.current_day > 0) {
    for (let d = 1; d <= access.current_day; d++) {
      daysSet.add(d);
    }
  }

  return Array.from(daysSet)
    .filter((d) => d >= 1 && d <= 30)
    .sort((a, b) => a - b);
}

/**
 * Возвращает наименьший номер ещё не завершённого урока (1..30)
 * или null, если все 30 уроков пройдены.
 */
export function getEarliestUncompletedDay(telegramId: number): number | null {
  const completedDays = new Set(getCompletedDays(telegramId));
  for (let day = 1; day <= 30; day++) {
    if (!completedDays.has(day) && !isDayCompleted(telegramId, day)) {
      return day;
    }
  }
  return null;
}

export interface LessonWarningInfo {
  hasWarning: boolean;
  currentRequiredDay: number;
  targetDay?: number;
  availableDays: number[];
  upcomingDays: number[];
}

/**
 * Проверяет, нужно ли показать предупреждение о необходимости сначала пройти предыдущий урок.
 */
export function checkLessonWarning(telegramId: number, targetDay?: number): LessonWarningInfo {
  const earliestUncompleted = getEarliestUncompletedDay(telegramId);
  const availableDays = getAvailableDays(telegramId);

  // Если целевой урок передан, он также считается доступным (пользователь получил его через уведомление)
  if (targetDay !== undefined && targetDay >= 1 && targetDay <= 30 && !availableDays.includes(targetDay)) {
    availableDays.push(targetDay);
    availableDays.sort((a, b) => a - b);
  }

  // Если все 30 уроков курса пройдены — предупреждение не нужно
  if (earliestUncompleted === null) {
    return {
      hasWarning: false,
      currentRequiredDay: 30,
      targetDay,
      availableDays,
      upcomingDays: [],
    };
  }

  // Уроки, которые уже доступны пользователю, но идут ПОСЛЕ текущего незавершённого
  const upcomingDays = availableDays.filter((d) => d > earliestUncompleted);

  // Предупреждение нужно:
  // 1) Если пользователь нажал на уведомление конкретного урока targetDay, и этот урок позже текущего незавершённого
  //    (например, нажал «Начать урок» на День 3, а День 2 ещё не пройден);
  // 2) ИЛИ пользователь заходит через «Мой урок» (/lesson или 'my_lesson'), и при этом уже открыты уроки наперёд
  //    (например, открыты 3, 4, 5, а сделан только 1-й).
  const isDirectTargetLater = targetDay !== undefined && targetDay > earliestUncompleted;
  const isGeneralEntryWithUpcoming = targetDay === undefined && upcomingDays.length > 0;

  const hasWarning = isDirectTargetLater || isGeneralEntryWithUpcoming;

  return {
    hasWarning,
    currentRequiredDay: earliestUncompleted,
    targetDay,
    availableDays,
    upcomingDays,
  };
}

// ─── Прогресс пользователя ────────────────────────────────────────────────────

export function getUserProgress(telegramId: number) {
  const access = getCourseAccess(telegramId);
  if (!access) return null;
  const user = getUserByTelegramId(telegramId);

  const completedDays = getCompletedDays(telegramId);
  const totalDays = 30;
  const completedCount = completedDays.length;
  const remaining = totalDays - completedCount;
  const percent = Math.round((completedCount / totalDays) * 100);

  const earliestUncompleted = getEarliestUncompletedDay(telegramId);
  const currentDay = earliestUncompleted ?? Math.max(1, access.current_day);

  return {
    currentDay,
    completedDays,
    completedCount,
    remaining,
    percent,
    nextDay: currentDay,
    status: access.status,
    startedAt: access.started_at,
    streak: user?.streak_count || 0,
  };
}

export function getLessonForUser(telegramId: number, day?: number): Lesson | undefined {
  const access = getCourseAccess(telegramId);
  if (!access || (access.status !== 'active' && access.status !== 'completed')) return undefined;
  const earliestUncompleted = getEarliestUncompletedDay(telegramId);
  const requestedDay = day ?? earliestUncompleted ?? access.current_day;
  const availableDays = getAvailableDays(telegramId);
  if (!availableDays.includes(requestedDay) && requestedDay > access.current_day) return undefined;
  return getLessonByDay(requestedDay);
}

// ─── Достижения (Витрина значков) ─────────────────────────────────────────────

export type AchievementBadgeId =
  | 'first_step'
  | 'week_streak'
  | 'equator'
  | 'course_graduate'
  | 'flawless_quiz'
  | 'polyglot_sniper'
  | 'phrase_architect'
  | 'dialogue_master';

export interface AchievementBadge {
  id: AchievementBadgeId;
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
  const weekStreakDone = completedCount >= 7;
  const equatorDone = completedCount >= 15;
  const graduateDone = completedCount >= 30;

  const flawlessQuizDone = hasFlawlessQuizSession(telegramId);
  const masteredWordsCount = countMasteredWords(telegramId);
  const polyglotDone = masteredWordsCount >= 100;

  const minigames = getMinigameProgress(telegramId);
  const phraseArchitectDone = minigames.phrasesCompleted >= 10;
  const totalDialogues = DIALOGUE_SCENARIOS.length;
  const dialogueMasterDone =
    totalDialogues > 0 && minigames.dialoguesCompleted.length >= totalDialogues;

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
      id: 'week_streak',
      title: 'Первая неделя',
      description: 'пройдено 7 дней курса',
      icon: '🔥',
      unlocked: weekStreakDone,
      progressText: weekStreakDone ? 'Открыто' : `${Math.min(completedCount, 7)}/7 дн.`,
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
    {
      id: 'phrase_architect',
      title: 'Архитектор фраз',
      description: 'собрано 10 предложений в конструкторе фраз',
      icon: '🧩',
      unlocked: phraseArchitectDone,
      progressText: phraseArchitectDone
        ? 'Открыто'
        : `${Math.min(minigames.phrasesCompleted, 10)}/10 фраз`,
    },
    {
      id: 'dialogue_master',
      title: 'Душа компании',
      description: 'пройдены все сценарии в тренажёре диалогов',
      icon: '💬',
      unlocked: dialogueMasterDone,
      progressText: dialogueMasterDone
        ? 'Открыто'
        : `${minigames.dialoguesCompleted.length}/${totalDialogues} диал.`,
    },
    {
      id: 'course_graduate',
      title: 'Выпускник курса',
      description: 'пройдены все 30 дней курса',
      icon: '🎓',
      unlocked: graduateDone,
      progressText: graduateDone ? 'Открыто' : `${Math.min(completedCount, 30)}/30 дн.`,
    },
  ];
}
