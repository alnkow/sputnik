import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { EntityDialog } from './EntityDialog';

const resetStores = () => {
  useAppStore.setState({
    categories: [],
    tasks: [],
    ui: { viewMode: 'week', anchorDate: '2026-06-28', importantOnly: false },
  });
  useUiStore.setState({ dialog: { kind: 'closed' }, completedOpen: false });
};

beforeEach(resetStores);

function seedTask() {
  return useAppStore.getState().addTask({
    title: 'Сделать отчёт',
    categoryId: null,
    color: null,
    emoji: null,
    description: 'Важные детали по отчёту',
  });
}

describe('EntityDialog — задача', () => {
  it('при редактировании сначала показывает превью, а не форму', () => {
    const id = seedTask();
    render(<EntityDialog />);

    act(() => useUiStore.getState().openEditTask(id));

    expect(screen.getByText('Сделать отчёт')).toBeInTheDocument();
    expect(screen.getByText('Важные детали по отчёту')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Что нужно сделать?')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeInTheDocument();
  });

  it('переходит в режим редактирования по нажатию на «Редактировать» и сохраняет изменения', async () => {
    const user = userEvent.setup();
    const id = seedTask();
    render(<EntityDialog />);
    act(() => useUiStore.getState().openEditTask(id));

    await user.click(screen.getByRole('button', { name: 'Редактировать' }));

    const titleInput = screen.getByPlaceholderText('Что нужно сделать?');
    expect(titleInput).toHaveValue('Сделать отчёт');

    await user.clear(titleInput);
    await user.type(titleInput, 'Обновлённый отчёт');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(useAppStore.getState().tasks.find((t) => t.id === id)?.title).toBe(
      'Обновлённый отчёт',
    );
  });

  it('отмена в режиме редактирования возвращает к превью без сохранения', async () => {
    const user = userEvent.setup();
    const id = seedTask();
    render(<EntityDialog />);
    act(() => useUiStore.getState().openEditTask(id));

    await user.click(screen.getByRole('button', { name: 'Редактировать' }));
    const titleInput = screen.getByPlaceholderText('Что нужно сделать?');
    await user.clear(titleInput);
    await user.type(titleInput, 'Черновое название');
    await user.click(screen.getByRole('button', { name: 'Отмена' }));

    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeInTheDocument();
    expect(useAppStore.getState().tasks.find((t) => t.id === id)?.title).toBe(
      'Сделать отчёт',
    );
  });

  it('кнопка «Завершить» в превью отмечает задачу выполненной и закрывает диалог', async () => {
    const user = userEvent.setup();
    const id = seedTask();
    render(<EntityDialog />);
    act(() => useUiStore.getState().openEditTask(id));

    await user.click(screen.getByRole('button', { name: 'Завершить' }));

    expect(useAppStore.getState().tasks.find((t) => t.id === id)?.completed).toBe(true);
    expect(useUiStore.getState().dialog.kind).toBe('closed');
  });

  it('создание задачи открывает форму сразу (без превью)', async () => {
    const user = userEvent.setup();
    render(<EntityDialog />);
    act(() => useUiStore.getState().openCreateTask(null));

    const titleInput = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(titleInput, 'Новая задача');
    await user.type(screen.getByPlaceholderText('Дополнительные детали (необязательно)'), 'Описание');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    const created = useAppStore.getState().tasks.find((t) => t.title === 'Новая задача');
    expect(created).toBeDefined();
    expect(created?.description).toBe('Описание');
  });
});
