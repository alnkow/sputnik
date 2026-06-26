/**
 * Работа с датами в формате 'YYYY-MM-DD' в локальном времени.
 * Неделя начинается с понедельника (Пн–Вс).
 */

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export const MONTHS_NOMINATIVE = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
] as const;

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
] as const;

const pad = (n: number): string => String(n).padStart(2, '0');

/** Преобразует Date в строку 'YYYY-MM-DD' (локальное время). */
export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Парсит 'YYYY-MM-DD' в локальный Date (полночь). */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Сегодняшняя дата в формате ISO. */
export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function addMonths(iso: string, months: number): string {
  const d = fromISO(iso);
  d.setMonth(d.getMonth() + months);
  return toISO(d);
}

/** Индекс дня недели начиная с понедельника: Пн=0 … Вс=6. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Понедельник недели, содержащей дату. */
export function startOfWeek(iso: string): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() - mondayIndex(d));
  return toISO(d);
}

/** 7 дат недели (Пн…Вс), содержащей anchor. */
export function getWeekDays(anchorISO: string): string[] {
  const start = startOfWeek(anchorISO);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Сетка месяца: массив недель (по 7 дат), покрывающих месяц anchor.
 * Включает «хвосты» соседних месяцев, неделя начинается с понедельника.
 */
export function getMonthGrid(anchorISO: string): string[][] {
  const anchor = fromISO(anchorISO);
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(toISO(firstOfMonth));

  const weeks: string[][] = [];
  let cursor = gridStart;
  // 6 недель покрывают любой месяц
  for (let w = 0; w < 6; w++) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

export function isToday(iso: string): boolean {
  return iso === todayISO();
}

export function isSameMonth(iso: string, anchorISO: string): boolean {
  return iso.slice(0, 7) === anchorISO.slice(0, 7);
}

export function isWeekend(iso: string): boolean {
  const idx = mondayIndex(fromISO(iso));
  return idx === 5 || idx === 6;
}

/** Короткая подпись дня недели для даты. */
export function weekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[mondayIndex(fromISO(iso))];
}

/** Номер дня месяца. */
export function dayNumber(iso: string): number {
  return fromISO(iso).getDate();
}

/** Заголовок месяца, например «Июнь 2026». */
export function formatMonthYear(anchorISO: string): string {
  const d = fromISO(anchorISO);
  return `${MONTHS_NOMINATIVE[d.getMonth()]} ${d.getFullYear()}`;
}

/** Диапазон недели, например «23–29 июня». */
export function formatWeekRange(anchorISO: string): string {
  const days = getWeekDays(anchorISO);
  const start = fromISO(days[0]);
  const end = fromISO(days[6]);
  const startMonth = MONTHS_GENITIVE[start.getMonth()];
  const endMonth = MONTHS_GENITIVE[end.getMonth()];
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${endMonth}`;
  }
  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}`;
}

/** Полная дата, например «25 июня 2026». */
export function formatFullDate(iso: string): string {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]} ${d.getFullYear()}`;
}
