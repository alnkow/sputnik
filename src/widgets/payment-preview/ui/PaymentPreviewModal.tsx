import type { ReactNode } from 'react';
import { formatFullDate } from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/money';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { BanknoteIcon } from '@/shared/ui/icons';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 text-sm">
      <dt className="w-28 shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 break-words text-slate-800">{children}</dd>
    </div>
  );
}

/** Карточка платежа, открытая из календаря. Только просмотр. */
export function PaymentPreviewModal() {
  const viewed = useUiStore((s) => s.viewedPayment);
  const close = useUiStore((s) => s.closePaymentPreview);
  const payment = useAppStore((s) =>
    viewed ? s.payments.find((p) => p.id === viewed.id) : undefined,
  );

  if (!viewed || !payment) return null;

  return (
    <Modal
      open
      onClose={close}
      title="Платёж"
      size="sm"
      footer={
        <Button variant="ghost" onClick={close}>
          Закрыть
        </Button>
      }
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <BanknoteIcon className="h-4 w-4" />
        </span>
        <span className="text-base font-semibold break-words text-slate-800">
          {payment.title || 'Без названия'}
        </span>
      </div>
      <dl className="space-y-2.5">
        <Row label="Сумма">
          {payment.amount === null ? '—' : formatAmount(payment.amount)}
        </Row>
        <Row label="Дата платежа">
          {payment.dueDay === null ? '—' : `${payment.dueDay} число каждого месяца`}
          <div className="text-xs text-slate-500">
            В этот раз — {formatFullDate(viewed.iso)}
          </div>
        </Row>
        <Row label="Заметки">
          {payment.notes ? (
            <span className="whitespace-pre-wrap">{payment.notes}</span>
          ) : (
            '—'
          )}
        </Row>
        <Row label="Статус">
          {payment.paid && payment.paidAt !== null ? (
            <span className="text-green-700">
              Оплачено {new Date(payment.paidAt).toLocaleDateString('ru-RU')}
            </span>
          ) : (
            'Не оплачено'
          )}
        </Row>
      </dl>
    </Modal>
  );
}
