import {
  addDays,
  formatWeekRange,
  getMonthGrid,
  getWeekDays,
  isPast,
  isSameMonth,
  isToday,
  isValidISODate,
  isWeekend,
  normalizeISODate,
  startOfWeek,
  todayISO,
} from './date';

describe('isValidISODate', () => {
  it('принимает корректную дату', () => {
    expect(isValidISODate('2026-06-28')).toBe(true);
  });

  it('отклоняет несуществующую дату (например, 30 февраля)', () => {
    expect(isValidISODate('2026-02-30')).toBe(false);
  });

  it('отклоняет произвольную строку', () => {
    expect(isValidISODate('не дата')).toBe(false);
  });
});

describe('normalizeISODate', () => {
  it('возвращает значение, если это валидная ISO-дата', () => {
    expect(normalizeISODate('2026-01-15', '2000-01-01')).toBe('2026-01-15');
  });

  it('возвращает fallback для невалидного значения', () => {
    expect(normalizeISODate('garbage', '2000-01-01')).toBe('2000-01-01');
    expect(normalizeISODate(undefined, '2000-01-01')).toBe('2000-01-01');
  });
});

describe('startOfWeek / getWeekDays', () => {
  it('неделя начинается с понедельника и содержит исходную дату', () => {
    // 2026-06-28 — воскресенье
    expect(startOfWeek('2026-06-28')).toBe('2026-06-22');
  });

  it('возвращает 7 последовательных дат начиная с понедельника', () => {
    const days = getWeekDays('2026-06-24');
    expect(days).toEqual([
      '2026-06-22',
      '2026-06-23',
      '2026-06-24',
      '2026-06-25',
      '2026-06-26',
      '2026-06-27',
      '2026-06-28',
    ]);
  });
});

describe('getMonthGrid', () => {
  it('возвращает 6 недель по 7 дней, начиная с понедельника', () => {
    const weeks = getMonthGrid('2026-06-15');
    expect(weeks).toHaveLength(6);
    weeks.forEach((week) => expect(week).toHaveLength(7));
  });

  it('покрывает все дни месяца', () => {
    const weeks = getMonthGrid('2026-06-15');
    const allDays = weeks.flat();
    expect(allDays).toContain('2026-06-01');
    expect(allDays).toContain('2026-06-30');
  });
});

describe('isToday / isPast', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 5, 28));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('isToday верно определяет текущую дату', () => {
    expect(todayISO()).toBe('2026-06-28');
    expect(isToday('2026-06-28')).toBe(true);
    expect(isToday('2026-06-27')).toBe(false);
  });

  it('isPast верно отделяет прошлые дни от сегодня и будущих', () => {
    expect(isPast('2026-06-27')).toBe(true);
    expect(isPast('2026-06-28')).toBe(false);
    expect(isPast('2026-06-29')).toBe(false);
  });
});

describe('isSameMonth', () => {
  it('true для дат в одном месяце', () => {
    expect(isSameMonth('2026-06-01', '2026-06-30')).toBe(true);
  });

  it('false для дат в разных месяцах', () => {
    expect(isSameMonth('2026-06-30', '2026-07-01')).toBe(false);
  });
});

describe('isWeekend', () => {
  it('субботу и воскресенье считает выходными', () => {
    expect(isWeekend('2026-06-27')).toBe(true); // сб
    expect(isWeekend('2026-06-28')).toBe(true); // вс
  });

  it('будни не считает выходными', () => {
    expect(isWeekend('2026-06-25')).toBe(false); // чт
  });
});

describe('addDays', () => {
  it('корректно переходит через границу месяца', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
  });
});

describe('formatWeekRange', () => {
  it('форматирует диапазон в пределах одного месяца', () => {
    expect(formatWeekRange('2026-06-24')).toBe('22–28 июня');
  });

  it('форматирует диапазон на стыке месяцев', () => {
    // неделя 29 июня — 5 июля 2026
    expect(formatWeekRange('2026-07-01')).toBe('29 июня – 5 июля');
  });
});
