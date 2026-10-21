import { getLessonByDay, type Lesson } from '../content/course.js';
import {
  scheduleLessonDelivery,
  saveSubmission,
  getCompletedDays,
} from '../db/repositories/lessons.js';
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

export interface CheckAnswerResult {
  isCorrect: boolean | null;
  score: number | null;
  feedback: string;
  correctAnswer: string;
}

export function checkAnswer(dayNumber: number, userAnswer: string): CheckAnswerResult {
  const lesson = getLessonByDay(dayNumber);
  if (!lesson) {
    return { isCorrect: null, score: null, feedback: 'Урок не найден.', correctAnswer: '' };
  }

  if (lesson.answerKey.length === 0) {
    return {
      isCorrect: null,
      score: null,
      feedback: '✅ Ответ сохранён! Посмотри правильный пример ниже.',
      correctAnswer: lesson.hint,
    };
  }

  const normalizedUser = normalizeAnswer(userAnswer);
  const isCorrect = lesson.answerKey.some((key) => normalizeAnswer(key) === normalizedUser);

  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    feedback: isCorrect ? '✅ Отлично! Правильно!' : '❌ Не совсем верно. Посмотри правильный ответ.',
    correctAnswer: lesson.answerKey[0] ?? '',
  };
}

function normalizeAnswer(s: string): string {
  return s.toLowerCase().trim().replace(/[.,!?;:]+$/, '').replace(/\s+/g, ' ');
}

export async function processSubmission(
  telegramId: number,
  dayNumber: number,
  answerText: string,
): Promise<CheckAnswerResult & { saved: boolean }> {
  if (!answerText || answerText.length > 1000) {
    return { isCorrect: null, score: null, feedback: 'Ответ слишком длинный или пустой.', correctAnswer: '', saved: false };
  }

  const result = checkAnswer(dayNumber, answerText);
  saveSubmission(telegramId, dayNumber, answerText, result.isCorrect, result.score);
  return { ...result, saved: true };
}

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
