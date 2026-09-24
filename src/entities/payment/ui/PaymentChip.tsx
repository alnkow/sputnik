import type { Payment } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { formatAmount } from '@/shared/lib/money';
import { BanknoteIcon, CheckIcon } from '@/shared/ui/icons';

interface PaymentChipProps {
  payment: Payment;
  paid: boolean;
  onOpen: () => void;
}

/** Чип платежа в колонке дня (режим «Неделя»). Не перетаскивается. */
export function PaymentChip({ payment, paid, onOpen }: PaymentChipProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={payment.title}
      className={cn(
        'flex w-full items-center gap-1 rounded-md border px-1.5 py-1 text-left text-xs shadow-sm',
        paid
          ? 'border-slate-200 bg-slate-50 text-slate-400'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
      )}
    >
      {paid ? (
        <CheckIcon className="h-3 w-3 shrink-0" />
      ) : (
        <BanknoteIcon className="h-3 w-3 shrink-0" />
      )}
      <span className={cn('flex-1 truncate font-medium', paid && 'line-through')}>
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
