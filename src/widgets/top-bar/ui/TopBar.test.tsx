import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ViewMode } from '@/shared/types';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { TopBar } from './TopBar';

const setup = (viewMode: ViewMode) => {
  useAppStore.setState({
    payments: [],
    ui: { viewMode, anchorDate: '2026-06-28', importantOnly: false },
  });
  useUiStore.setState({ dialog: { kind: 'closed' }, createdPaymentId: null });
  render(<TopBar />);
};

describe('TopBar — кнопка «Создать»', () => {
  it('в календаре открывает диалог создания задачи', async () => {
    setup('week');
    await userEvent.click(screen.getByRole('button', { name: 'Создать' }));

    expect(useUiStore.getState().dialog).toEqual({
      kind: 'create-task',
      presetCategoryId: null,
    });
    expect(useAppStore.getState().payments).toHaveLength(0);
  });

  it('на странице платежей добавляет платёж в режиме редактирования', async () => {
    setup('payments');
    await userEvent.click(screen.getByRole('button', { name: 'Создать' }));

    const { payments } = useAppStore.getState();
    expect(payments).toHaveLength(1);
    expect(useUiStore.getState().createdPaymentId).toBe(payments[0].id);
    expect(useUiStore.getState().dialog.kind).toBe('closed');
  });
});

describe('TopBar — логотип', () => {
  it('клик по логотипу открывает страницу «Сегодня»', async () => {
    setup('payments');
    await userEvent.click(screen.getByRole('button', { name: 'Сегодня' }));
    expect(useAppStore.getState().ui.viewMode).toBe('today');
  });
});

describe('TopBar — страница «Сегодня»', () => {
  it('кнопка «Создать» скрыта', () => {
    setup('today');
    expect(screen.queryByRole('button', { name: 'Создать' })).not.toBeInTheDocument();
  });
});
