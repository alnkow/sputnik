import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { EventDialog } from './EventDialog';

beforeEach(() => {
  useAppStore.setState({ events: [] });
  useUiStore.setState({ eventDialog: { kind: 'closed' } });
});

const seed = () =>
  useAppStore.getState().addEvent({
    title: 'День рождения',
    description: 'Купить подарок',
    month: 3,
    color: '#A5B4FC',
    emoji: '🎉',
    calendarDay: 8,
  });

describe('EventDialog', () => {
  it('создаёт событие с днём в календаре', async () => {
    const user = userEvent.setup();
    render(<EventDialog />);
    act(() => useUiStore.getState().setEventDialog({ kind: 'create' }));

    await user.type(screen.getByPlaceholderText('Например, день рождения'), 'Отпуск');
    await user.selectOptions(screen.getByLabelText('Месяц'), '7');
    expect(screen.queryByLabelText('День')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Отображать в календаре'));
    await user.selectOptions(screen.getByLabelText('День'), '15');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(useAppStore.getState().events[0]).toMatchObject({
      title: 'Отпуск',
      month: 7,
      calendarDay: 15,
    });
    expect(useUiStore.getState().eventDialog.kind).toBe('closed');
  });

  it('из календаря карточка только для просмотра', () => {
    const id = seed();
    render(<EventDialog />);
    act(() =>
      useUiStore.getState().setEventDialog({ kind: 'view', id, readOnly: true }),
    );

    expect(screen.getByText('День рождения')).toBeInTheDocument();
    expect(screen.getByText('8 марта, каждый год')).toBeInTheDocument();
    expect(screen.getByText('Купить подарок')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Редактировать' })).not.toBeInTheDocument();
  });

  it('редактирует и удаляет с подтверждением', async () => {
    const user = userEvent.setup();
    const id = seed();
    render(<EventDialog />);
    act(() =>
      useUiStore.getState().setEventDialog({ kind: 'view', id, readOnly: false }),
    );

    await user.click(screen.getByRole('button', { name: 'Редактировать' }));
    await user.click(screen.getByLabelText('Отображать в календаре'));
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(useAppStore.getState().events[0].calendarDay).toBeNull();
    expect(screen.getByText('Не отображается')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Редактировать' }));
    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    const confirm = screen.getByRole('dialog');
    expect(confirm).toHaveTextContent('Удалить событие «День рождения»?');
    await user.click(within(confirm).getByRole('button', { name: 'Удалить' }));

    expect(useAppStore.getState().events).toHaveLength(0);
    expect(useUiStore.getState().eventDialog.kind).toBe('closed');
  });
});
