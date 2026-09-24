import type { Payment } from '@/shared/types';
import { formatAmount } from '@/shared/lib/money';
import { BanknoteIcon } from '@/shared/ui/icons';

interface PaymentChipProps {
  payment: Payment;
  onOpen: () => void;
}

/** Чип платежа в колонке дня (режим «Неделя»). Не перетаскивается. */
export function PaymentChip({ payment, onOpen }: PaymentChipProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={payment.title}
      className="flex w-full items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-1 text-left text-xs text-emerald-800 shadow-sm hover:bg-emerald-100"
    >
      <BanknoteIcon className="h-3 w-3 shrink-0" />
      <span className="flex-1 truncate font-medium">
        {payment.title || 'Без названия'}
      </span>
      {payment.amount !== null && (
        <span className="shrink-0 tabular-nums opacity-80">
          {formatAmount(payment.amount)}
        </span>
      )}
    </button>
  );
}
