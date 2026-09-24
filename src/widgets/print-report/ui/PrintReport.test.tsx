import { render, screen } from '@testing-library/react';
import { useAppStore } from '@/shared/store/useAppStore';
import { ReportContent } from './PrintReport';

describe('ReportContent', () => {
  it('выводит категории с задачами, выполненные, платежи и события', () => {
    const store = useAppStore.getState();
    useAppStore.setState({ categories: [], tasks: [], payments: [], events: [] });

    const work = store.addCategory({ name: 'Работа', color: '#ff0000' });
    store.addCategory({ name: 'Пустая', color: '#00ff00' });
    store.addTask({ title: 'Отчёт', categoryId: work, color: null, emoji: null, description: 'до пятницы' });
    const done = store.addTask({ title: 'Созвон', categoryId: null, color: null, emoji: null, description: null });
    store.setCompleted(done, true);
    const payment = store.addPayment();
    store.updatePayment(payment, { title: 'Аренда', amount: 45000, dueDay: 5 });
    store.addEvent({ title: 'Отпуск', description: null, month: 7, color: '#A5B4FC', emoji: null, calendarDay: 15 });

    render(<ReportContent />);

    expect(screen.getByText('Работа')).toBeInTheDocument();
    expect(screen.queryByText('Пустая')).not.toBeInTheDocument();
    expect(screen.getByText('до пятницы')).toBeInTheDocument();
    expect(screen.getByText('Выполненные задачи')).toBeInTheDocument();
    expect(screen.getByText('Созвон')).toBeInTheDocument();
    expect(screen.getByText('Аренда')).toBeInTheDocument();
    expect(screen.getByText('5 число')).toBeInTheDocument();
    expect(screen.getByText('Июль')).toBeInTheDocument();
    expect(screen.getByText(/В календаре: 15 июля/)).toBeInTheDocument();
  });
});
