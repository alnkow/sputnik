import type { Payment } from '@/shared/types';
import { isPaidInMonthOf, paymentsOn } from './selectors';

const make = (patch: Partial<Payment>): Payment => ({
  id: 'p',
  title: 'Платёж',
  amount: null,
  dueDay: null,
  notes: '',
  paid: false,
  paidAt: null,
  ...patch,
});

describe('paymentsOn', () => {
  it('возвращает платежи с подходящим числом, пропуская без даты', () => {
    const a = make({ id: 'a', dueDay: 30 });
    const b = make({ id: 'b', dueDay: 10 });
    const c = make({ id: 'c', dueDay: null });

    expect(paymentsOn([a, b, c], '2026-02-28')).toEqual([a]);
    expect(paymentsOn([a, b, c], '2026-02-10')).toEqual([b]);
  });
});

describe('isPaidInMonthOf', () => {
  it('оплачен только в месяце отметки', () => {
    const paid = make({ paid: true, paidAt: new Date(2026, 8, 24).getTime() });
    expect(isPaidInMonthOf(paid, '2026-09-30')).toBe(true);
    expect(isPaidInMonthOf(paid, '2026-10-30')).toBe(false);
    expect(isPaidInMonthOf(make({ paid: false }), '2026-09-30')).toBe(false);
  });
});
