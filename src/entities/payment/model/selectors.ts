import type { Payment } from '@/shared/types';
import { isMonthlyDayOn } from '@/shared/lib/date';

/** Платежи, приходящиеся на дату (с переносом на последний день месяца). */
export function paymentsOn(payments: Payment[], iso: string): Payment[] {
  return payments.filter(
    (p) => p.dueDay !== null && isMonthlyDayOn(p.dueDay, iso),
  );
}

/**
 * Отметка «Оплачено» относится к месяцу, в котором её поставили:
 * в календаре платёж считается оплаченным только в этом месяце.
 */
export function isPaidInMonthOf(payment: Payment, iso: string): boolean {
  if (!payment.paid || payment.paidAt === null) return false;
  const paidAt = new Date(payment.paidAt);
  const [year, month] = iso.split('-').map(Number);
  return paidAt.getFullYear() === year && paidAt.getMonth() + 1 === month;
}
