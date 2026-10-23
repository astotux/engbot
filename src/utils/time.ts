/**
 * Разница между временем пользователя (МСК, UTC+3) и серверным временем (UTC): 3 часа.
 */
export const SERVER_OFFSET_HOURS = 3;

/**
 * Переводит час по Москве (0..23 МСК) в серверный час (UTC, -3 часа).
 */
export function mskHourToServerHour(mskHour: number): number {
  return ((mskHour - SERVER_OFFSET_HOURS) % 24 + 24) % 24;
}

/**
 * Переводит серверный час (UTC) в час по Москве (+3 часа).
 */
export function serverHourToMskHour(serverHour: number): number {
  return ((serverHour + SERVER_OFFSET_HOURS) % 24 + 24) % 24;
}

/**
 * Возвращает текущие компоненты даты и времени по МСК (с учётом 3-часовой разницы с сервером).
 */
export function getMskDateTimeParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0 = воскресенье, 1 = понедельник, ...
  hour: number;
  minute: number;
  dateKey: string; // YYYY-MM-DD
} {
  const mskMs = date.getTime() + SERVER_OFFSET_HOURS * 3_600_000;
  const mskDate = new Date(mskMs);
  const year = mskDate.getUTCFullYear();
  const month = mskDate.getUTCMonth() + 1;
  const day = mskDate.getUTCDate();
  const dayOfWeek = mskDate.getUTCDay();
  const hour = mskDate.getUTCHours();
  const minute = mskDate.getUTCMinutes();
  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { year, month, day, dayOfWeek, hour, minute, dateKey };
}

/**
 * Рассчитывает серверное UTC-время отправки урока для заданного часа/минуты по МСК (с учётом сдвига в 3 часа).
 */
export function toZonedScheduledTime(
  baseDate: Date,
  hour: number,
  minute: number,
  timezone = 'Europe/Moscow',
): Date {
  if (timezone === 'Europe/Moscow') {
    const { year, month, day } = getMskDateTimeParts(baseDate);
    // На сервере время отличается на 3 часа (UTC = МСК - 3ч)
    return new Date(Date.UTC(year, month - 1, day, hour - SERVER_OFFSET_HOURS, minute, 0, 0));
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(baseDate);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? 0);
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 1);
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? 1);

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  return zonedTimeToUtc(dateStr, timezone);
}

export function zonedTimeToUtc(dateStr: string, timezone: string): Date {
  const date = new Date(dateStr);
  const utcMs = date.getTime();

  const utcDate = new Date(utcMs);
  const localStr = utcDate.toLocaleString('en-US', { timeZone: timezone });
  const localDate = new Date(localStr);
  const offset = utcDate.getTime() - localDate.getTime();

  return new Date(utcMs + offset);
}

export function nowInTimezone(timezone: string): Date {
  const now = new Date();
  const str = now.toLocaleString('en-US', { timeZone: timezone });
  return new Date(str);
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
