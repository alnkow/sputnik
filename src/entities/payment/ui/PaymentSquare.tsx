import type { Payment } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { formatAmount } from '@/shared/lib/money';
import { Tooltip } from '@/shared/ui/Tooltip';
import { BanknoteIcon, CheckIcon } from '@/shared/ui/icons';

interface PaymentSquareProps {
  payment: Payment;
  paid: boolean;
  onOpen: () => void;
}

/** Маленький квадрат платежа в ячейке дня (режим «Месяц»). Не перетаскивается. */
export function PaymentSquare({ payment, paid, onOpen }: PaymentSquareProps) {
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
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border',
          paid
            ? 'border-slate-200 bg-slate-50 text-slate-400'
            : 'border-emerald-300 bg-emerald-50 text-emerald-700',
        )}
      >
        {paid ? (
          <CheckIcon className="h-3 w-3" />
        ) : (
          <BanknoteIcon className="h-3 w-3" />
        )}
      </button>
    </Tooltip>
  );
}
