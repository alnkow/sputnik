import { memo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Payment } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { formatAmount, parseAmount } from '@/shared/lib/money';
import { useAppStore } from '@/shared/store/useAppStore';
import { IconButton } from '@/shared/ui/IconButton';
import { CheckIcon, GripIcon, PencilIcon, TrashIcon } from '@/shared/ui/icons';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const cellInput =
  'h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800 ' +
  'placeholder:text-slate-300 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-100';

const cellText = 'block truncate px-2 text-sm leading-9';

interface Draft {
  title: string;
  amount: string;
  dueDay: string;
  notes: string;
}

const toDraft = (p: Payment): Draft => ({
  title: p.title,
  amount: p.amount === null ? '' : String(p.amount),
  dueDay: p.dueDay === null ? '' : String(p.dueDay),
  notes: p.notes,
});

interface PaymentRowProps {
  payment: Payment;
  /** Открыть строку сразу в режиме редактирования (только что созданная). */
  initiallyEditing: boolean;
  onRequestDelete: (payment: Payment) => void;
}

export const PaymentRow = memo(function PaymentRow({
  payment,
  initiallyEditing,
  onRequestDelete,
}: PaymentRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: payment.id });

  const setPaid = useAppStore((s) => s.setPaymentPaid);
  const [draft, setDraft] = useState<Draft | null>(() =>
    initiallyEditing ? toDraft(payment) : null,
  );
  const editing = draft !== null;

  const patch = (next: Partial<Draft>) =>
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));

  const save = () => {
    if (!draft) return;
    useAppStore.getState().updatePayment(payment.id, {
      title: draft.title.trim(),
      amount: parseAmount(draft.amount),
      dueDay: draft.dueDay ? Number(draft.dueDay) : null,
      notes: draft.notes.trim(),
    });
    setDraft(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setDraft(null);
  };

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'border-b border-slate-100 last:border-b-0',
        'transition-colors',
        payment.paid
          ? 'bg-green-50/60 hover:bg-green-100/70'
          : 'bg-white hover:bg-slate-50',
        isDragging && 'relative z-10 shadow-lg ring-1 ring-slate-200',
      )}
    >
      <td className="px-1 py-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label="Перетащить платёж"
          className="flex h-8 w-6 cursor-grab touch-none items-center justify-center text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripIcon className="h-4 w-4" />
        </button>
      </td>

      <td className="px-1 py-1.5">
        {editing ? (
          <input
            autoFocus
            aria-label="Название"
            placeholder="Название платежа"
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            onKeyDown={handleKeyDown}
            className={cn(cellInput, 'font-medium')}
          />
        ) : (
          <span
            className={cn(
              cellText,
              'font-medium',
              payment.title ? 'text-slate-800' : 'text-slate-300',
            )}
          >
            {payment.title || 'Без названия'}
          </span>
        )}
      </td>

      <td className="px-1 py-1.5 text-right">
        {editing ? (
          <input
            inputMode="decimal"
            aria-label="Сумма"
            placeholder="0"
            value={draft.amount}
            onChange={(e) => patch({ amount: e.target.value })}
            onKeyDown={handleKeyDown}
            className={cn(cellInput, 'text-right tabular-nums')}
          />
        ) : (
          <span className={cn(cellText, 'text-slate-800 tabular-nums')}>
            {payment.amount === null ? '—' : formatAmount(payment.amount)}
          </span>
        )}
      </td>

      <td className="px-1 py-1.5">
        {editing ? (
          <select
            aria-label="Дата платежа"
            value={draft.dueDay}
            onChange={(e) => patch({ dueDay: e.target.value })}
            onKeyDown={handleKeyDown}
            className={cn(cellInput, 'cursor-pointer')}
          >
            <option value="">—</option>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day} число
              </option>
            ))}
          </select>
        ) : (
          <span className={cn(cellText, 'text-slate-700')}>
            {payment.dueDay === null ? '—' : `${payment.dueDay} число`}
          </span>
        )}
      </td>

      <td className="px-1 py-1.5">
        {editing ? (
          <input
            aria-label="Заметки"
            placeholder="—"
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            onKeyDown={handleKeyDown}
            className={cn(cellInput, 'text-slate-600')}
          />
        ) : (
          <span className={cn(cellText, 'text-slate-600')} title={payment.notes}>
            {payment.notes || '—'}
          </span>
        )}
      </td>

      <td className="px-2 py-1.5 text-center">
        <input
          type="checkbox"
          aria-label="Оплачено"
          checked={payment.paid}
          onChange={(e) => setPaid(payment.id, e.target.checked)}
          className="h-5 w-5 cursor-pointer accent-green-600"
        />
        {payment.paid && payment.paidAt !== null && (
          <div className="mt-0.5 text-[11px] leading-tight text-green-700">
            Оплачено
            <br />
            {new Date(payment.paidAt).toLocaleDateString('ru-RU')}
          </div>
        )}
      </td>

      <td className="px-2 py-1.5">
        <div className="flex items-center justify-end gap-1">
          {editing ? (
            <IconButton
              tone="green"
              aria-label="Сохранить"
              title="Сохранить"
              onClick={save}
              className="bg-green-50 text-green-600"
            >
              <CheckIcon className="h-4 w-4" />
            </IconButton>
          ) : (
            <IconButton
              aria-label="Редактировать"
              title="Редактировать"
              onClick={() => setDraft(toDraft(payment))}
            >
              <PencilIcon className="h-4 w-4" />
            </IconButton>
          )}
          <IconButton
            tone="danger"
            aria-label="Удалить"
            title="Удалить"
            onClick={() => onRequestDelete(payment)}
          >
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </td>
    </tr>
  );
});
