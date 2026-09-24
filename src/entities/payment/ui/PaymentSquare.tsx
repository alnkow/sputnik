import type { Payment } from '@/shared/types';
import { formatAmount } from '@/shared/lib/money';
import { Tooltip } from '@/shared/ui/Tooltip';
import { BanknoteIcon } from '@/shared/ui/icons';

interface PaymentSquareProps {
  payment: Payment;
  onOpen: () => void;
}

/** Маленький квадрат платежа в ячейке дня (режим «Месяц»). Не перетаскивается. */
export function PaymentSquare({ payment, onOpen }: PaymentSquareProps) {
  const title = payment.title || 'Без названия';
  return (
    <Tooltip
      content={
        payment.amount === null
          ? title
          : `${title} — ${formatAmount(payment.amount)}`
      }
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={title}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border border-emerald-300 bg-emerald-50 text-emerald-700"
      >
        <BanknoteIcon className="h-3 w-3" />
      </button>
    </Tooltip>
  );
}
