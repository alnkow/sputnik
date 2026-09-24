import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { todayISO } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { TodayBoard } from './TodayBoard';

beforeEach(() => {
  useAppStore.setState({ categories: [], tasks: [], payments: [], events: [] });
  useUiStore.setState({
    dialog: { kind: 'closed' },
    eventDialog: { kind: 'closed' },
    viewedPayment: null,
  });
});

describe('TodayBoard', () => {
  it('показывает задачи и платежи на сегодня и события месяца; клики как в календаре', async () => {
    const user = userEvent.setup();
    const today = todayISO();
    const month = Number(today.slice(5, 7));
    const day = Number(today.slice(8, 10));
    const store = useAppStore.getState();

    const task = store.addTask({ title: 'Сдать отчёт', categoryId: null, color: null, emoji: null, description: null });
    store.scheduleTask(task, today);
    store.addTask({ title: 'Без даты', categoryId: null, color: null, emoji: null, description: null });
    const payment = store.addPayment();
    store.updatePayment(payment, { title: 'Интернет', dueDay: day });
    const event = store.addEvent({ title: 'Праздник', description: null, month, color: '#A5B4FC', emoji: null, calendarDay: null });
    store.addEvent({ title: 'Другой месяц', description: null, month: (month % 12) + 1, color: '#A5B4FC', emoji: null, calendarDay: null });

    render(<TodayBoard />);

    expect(screen.getByText(String(day))).toBeInTheDocument();
    expect(screen.queryByText('Без даты')).not.toBeInTheDocument();
    expect(screen.queryByText('Другой месяц')).not.toBeInTheDocument();

    await user.click(screen.getByText('Сдать отчёт'));
    expect(useUiStore.getState().dialog).toEqual({ kind: 'edit-task', id: task });

    await user.click(screen.getByText('Интернет'));
    expect(useUiStore.getState().viewedPayment).toEqual({ id: payment, iso: today });

    await user.click(screen.getByText('Праздник'));
    expect(useUiStore.getState().eventDialog).toEqual({ kind: 'view', id: event, readOnly: true });
  });
});
