import { act, render, screen } from '@testing-library/react';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { PaymentPreviewModal } from './PaymentPreviewModal';

beforeEach(() => {
  useAppStore.setState({ payments: [] });
  useUiStore.setState({ viewedPayment: null });
});

describe('PaymentPreviewModal', () => {
  it('показывает данные платежа без кнопок редактирования и удаления', () => {
    const id = useAppStore.getState().addPayment();
    useAppStore.getState().updatePayment(id, {
      title: 'Аренда',
      amount: 45000,
      dueDay: 30,
      notes: 'Перевод хозяину',
    });
    render(<PaymentPreviewModal />);

    act(() => useUiStore.getState().openPaymentPreview(id, '2026-02-28'));

    expect(screen.getByText('Аренда')).toBeInTheDocument();
    expect(screen.getByText('45 000')).toBeInTheDocument();
    expect(screen.getByText(/30 число каждого месяца/)).toBeInTheDocument();
    expect(screen.getByText(/28 февраля 2026/)).toBeInTheDocument();
    expect(screen.getByText('Перевод хозяину')).toBeInTheDocument();
    expect(screen.getByText('Не оплачено')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Редактировать|Удалить/ })).not.toBeInTheDocument();
  });
});
