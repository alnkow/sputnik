import { useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Payment } from '@/shared/types';
import { formatAmount } from '@/shared/lib/money';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { RotateCcwIcon } from '@/shared/ui/icons';
import { getPaymentTotals } from '@/entities/payment/model/selectors';
import { PaymentRow } from './PaymentRow';

const HEADERS = ['', 'Название', 'Сумма', 'Дата платежа', 'Заметки', '', ''];

export function PaymentsTable() {
  const payments = useAppStore((s) => s.payments);
  const resetPaid = useAppStore((s) => s.resetPaymentsPaid);
  const reorder = useAppStore((s) => s.reorderPayments);
  const deletePayment = useAppStore((s) => s.deletePayment);
  const createdId = useUiStore((s) => s.createdPaymentId);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = useMemo(() => payments.map((p) => p.id), [payments]);
  const totals = useMemo(() => getPaymentTotals(payments), [payments]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id));
    }
  };

  const confirmDelete = () => {
    if (pendingDelete) deletePayment(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
        <h2 className="mr-auto text-base font-semibold text-slate-800">
          Ежемесячные платежи
        </h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={resetPaid}
          disabled={totals.paidCount === 0}
        >
          <RotateCcwIcon className="h-4 w-4" />
          Снять все отметки
        </Button>
      </div>

      {payments.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-400">
          Платежей пока нет — нажмите «Создать», чтобы добавить первый.
        </p>
      ) : (
        <div className="thin-scrollbar min-h-0 overflow-auto">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-10" />
              <col />
              <col className="w-36" />
              <col className="w-36" />
              <col />
              <col className="w-28" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium tracking-wide text-slate-400 uppercase">
                {HEADERS.map((label, i) => (
                  <th
                    key={i}
                    className={
                      label === 'Сумма' ? 'px-3 py-2 text-right' : 'px-3 py-2'
                    }
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={ids}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {payments.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      initiallyEditing={payment.id === createdId}
                      onRequestDelete={setPendingDelete}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
            <tfoot>
              <tr className="border-t border-slate-200 text-sm">
                <td />
                <td className="px-3 py-2.5 font-semibold text-slate-700">
                  Итого
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-slate-800 tabular-nums">
                  {formatAmount(totals.total)}
                </td>
                <td colSpan={2} className="px-3 py-2.5 text-slate-500">
                  Осталось оплатить:{' '}
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatAmount(totals.unpaid)}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-center text-xs text-slate-500">
                  {totals.paidCount} из {payments.length}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Удаление платежа"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Удалить
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Удалить запись «
          <span className="font-medium text-slate-800">
            {pendingDelete?.title || 'Без названия'}
          </span>
          »?
        </p>
      </Modal>
    </section>
  );
}
