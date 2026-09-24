import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { PaymentsTable } from './PaymentsTable';

beforeEach(() => {
  useAppStore.setState({ payments: [] });
  useUiStore.setState({ createdPaymentId: null });
});

describe('PaymentsTable', () => {
  it('добавляет платёж, отмечает оплату и снимает все отметки', async () => {
    const user = userEvent.setup();
    render(<PaymentsTable />);

    act(() => {
      useUiStore
        .getState()
        .markPaymentCreated(useAppStore.getState().addPayment());
    });
    await user.type(screen.getByLabelText('Название'), 'Интернет');
    await user.type(screen.getByLabelText('Сумма'), '1 500,5');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(useAppStore.getState().payments[0]).toMatchObject({
      title: 'Интернет',
      amount: 1500.5,
    });

    await user.click(screen.getByRole('checkbox', { name: 'Оплачено' }));
    expect(screen.getByText(/^Оплачено/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Снять все отметки' }));
    expect(screen.getByRole('checkbox', { name: 'Оплачено' })).not.toBeChecked();
    expect(screen.queryByText(/^Оплачено/)).not.toBeInTheDocument();
  });

  it('поля редактируются только после нажатия «Редактировать»', async () => {
    const user = userEvent.setup();
    const id = useAppStore.getState().addPayment();
    useAppStore.getState().updatePayment(id, { title: 'Аренда', amount: 45000 });
    render(<PaymentsTable />);

    expect(screen.getByText('Аренда')).toBeInTheDocument();
    expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Редактировать' }));
    const title = screen.getByLabelText('Название');
    await user.clear(title);
    await user.type(title, 'Аренда квартиры');
    expect(useAppStore.getState().payments[0].title).toBe('Аренда');

    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(useAppStore.getState().payments[0].title).toBe('Аренда квартиры');
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeInTheDocument();
  });

  it('удаляет платёж только после подтверждения', async () => {
    const user = userEvent.setup();
    const id = useAppStore.getState().addPayment();
    useAppStore.getState().updatePayment(id, { title: 'Спортзал' });
    render(<PaymentsTable />);

    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    expect(screen.getByText(/Удалить запись/)).toHaveTextContent(
      'Удалить запись «Спортзал»?',
    );

    await user.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(useAppStore.getState().payments).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }));
    expect(useAppStore.getState().payments).toHaveLength(0);
  });
});
