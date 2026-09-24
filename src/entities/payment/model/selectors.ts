import type { Payment } from '@/shared/types';
import { isMonthlyDayOn } from '@/shared/lib/date';

/** Платежи, приходящиеся на дату (с переносом на последний день месяца). */
export function paymentsOn(payments: Payment[], iso: string): Payment[] {
  return payments.filter(
    (p) => p.dueDay !== null && isMonthlyDayOn(p.dueDay, iso),
  );
}

/** Неоплаченные платежи на дату — то, что показывается в календаре. */
export function unpaidPaymentsOn(payments: Payment[], iso: string): Payment[] {
  return paymentsOn(payments, iso).filter((p) => !isPaidInMonthOf(p, iso));
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

export interface PaymentTotals {
  total: number;
  unpaid: number;
  paidCount: number;
}

/** Итоги по платежам: общая сумма, остаток к оплате и число оплаченных. */
export function getPaymentTotals(payments: Payment[]): PaymentTotals {
  let total = 0;
  let unpaid = 0;
  let paidCount = 0;
  for (const p of payments) {
    total += p.amount ?? 0;
    if (p.paid) paidCount += 1;
    else unpaid += p.amount ?? 0;
  }
  return { total, unpaid, paidCount };
}
