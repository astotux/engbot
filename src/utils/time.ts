/**
 * Рассчитывает UTC-время отправки урока для заданного часового пояса.
 */
export function toZonedScheduledTime(
  baseDate: Date,
  hour: number,
  minute: number,
  timezone: string,
): Date {
  // Получаем текущую дату в нужном TZ
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
