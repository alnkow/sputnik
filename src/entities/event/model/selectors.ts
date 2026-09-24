import type { CalendarEvent } from '@/shared/types';
import { isMonthlyDayOn } from '@/shared/lib/date';

/** Максимум дней в каждом месяце (февраль — с учётом високосного года). */
export const MONTH_MAX_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * События, показываемые в календаре на дату: совпадает месяц и число
 * (29 февраля в невисокосный год переносится на 28-е).
 */
export function eventsOn(
  events: CalendarEvent[],
  iso: string,
): CalendarEvent[] {
  const month = Number(iso.slice(5, 7));
  return events.filter(
    (e) =>
      e.month === month &&
      e.calendarDay !== null &&
      isMonthlyDayOn(e.calendarDay, iso),
  );
}

/**
 * События по месяцам (индекс 0 — январь). Внутри месяца сначала события
 * с днём в календаре — по возрастанию дня, затем без дня.
 */
export function groupEventsByMonth(events: CalendarEvent[]): CalendarEvent[][] {
  const months: CalendarEvent[][] = Array.from({ length: 12 }, () => []);
  for (const event of events) months[event.month - 1].push(event);
  for (const list of months) {
    list.sort((a, b) => (a.calendarDay ?? 32) - (b.calendarDay ?? 32));
  }
  return months;
}
