import type { CalendarEvent } from '@/shared/types';
import { eventsOn } from './selectors';

const make = (patch: Partial<CalendarEvent>): CalendarEvent => ({
  id: 'e',
  title: 'Событие',
  description: null,
  month: 3,
  color: '#A5B4FC',
  emoji: null,
  calendarDay: null,
  ...patch,
});

describe('eventsOn', () => {
  it('показывает только события с днём в календаре в своём месяце', () => {
    const shown = make({ id: 'a', month: 3, calendarDay: 8 });
    const hidden = make({ id: 'b', month: 3, calendarDay: null });
    const otherMonth = make({ id: 'c', month: 4, calendarDay: 8 });

    expect(eventsOn([shown, hidden, otherMonth], '2026-03-08')).toEqual([
      shown,
    ]);
    expect(eventsOn([shown], '2027-03-08')).toEqual([shown]);
    expect(eventsOn([shown], '2026-04-08')).toEqual([]);
  });

  it('29 февраля в невисокосный год — на 28-е', () => {
    const leap = make({ month: 2, calendarDay: 29 });
    expect(eventsOn([leap], '2026-02-28')).toEqual([leap]);
    expect(eventsOn([leap], '2028-02-28')).toEqual([]);
    expect(eventsOn([leap], '2028-02-29')).toEqual([leap]);
  });
});
