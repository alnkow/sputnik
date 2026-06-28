import { useAppStore } from './useAppStore';

const resetStore = () => {
  useAppStore.setState({
    categories: [],
    tasks: [],
    ui: { viewMode: 'week', anchorDate: '2026-06-28', importantOnly: false },
  });
};

beforeEach(resetStore);

describe('категории', () => {
  it('addCategory создаёт категорию с обрезанным именем', () => {
    const id = useAppStore.getState().addCategory({ name: '  Работа  ', color: '#fff' });
    const category = useAppStore.getState().categories.find((c) => c.id === id);
    expect(category?.name).toBe('Работа');
    expect(category?.collapsed).toBe(false);
  });

  it('deleteCategory не удаляет категорию, в которой есть задачи', () => {
    const { addCategory, addTask, deleteCategory } = useAppStore.getState();
    const catId = addCategory({ name: 'Работа', color: '#fff' });
    addTask({ title: 'Задача', categoryId: catId, color: null, emoji: null, description: null });

    const ok = deleteCategory(catId);

    expect(ok).toBe(false);
    expect(useAppStore.getState().categories).toHaveLength(1);
  });

  it('deleteCategory удаляет пустую категорию', () => {
    const { addCategory, deleteCategory } = useAppStore.getState();
    const catId = addCategory({ name: 'Работа', color: '#fff' });

    const ok = deleteCategory(catId);

    expect(ok).toBe(true);
    expect(useAppStore.getState().categories).toHaveLength(0);
  });

  it('reorderCategories переставляет категории местами', () => {
    const { addCategory, reorderCategories } = useAppStore.getState();
    const a = addCategory({ name: 'A', color: '#fff' });
    const b = addCategory({ name: 'B', color: '#fff' });
    addCategory({ name: 'C', color: '#fff' });

    reorderCategories(a, b);

    expect(useAppStore.getState().categories.map((c) => c.name)).toEqual(['B', 'A', 'C']);
  });
});

describe('задачи', () => {
  it('addTask создаёт задачу с дефолтными флагами', () => {
    const { addTask } = useAppStore.getState();
    const id = addTask({
      title: '  Сделать отчёт  ',
      categoryId: null,
      color: null,
      emoji: '🔥',
      description: 'детали',
    });
    const task = useAppStore.getState().tasks.find((t) => t.id === id);

    expect(task?.title).toBe('Сделать отчёт');
    expect(task?.description).toBe('детали');
    expect(task?.important).toBe(false);
    expect(task?.completed).toBe(false);
    expect(task?.scheduledDate).toBeNull();
  });

  it('updateTask частично обновляет поля и обрезает название', () => {
    const { addTask, updateTask } = useAppStore.getState();
    const id = addTask({ title: 'Старое', categoryId: null, color: null, emoji: null, description: null });

    updateTask(id, { title: '  Новое  ', description: 'описание' });

    const task = useAppStore.getState().tasks.find((t) => t.id === id);
    expect(task?.title).toBe('Новое');
    expect(task?.description).toBe('описание');
  });

  it('deleteTask удаляет задачу из списка', () => {
    const { addTask, deleteTask } = useAppStore.getState();
    const id = addTask({ title: 'Задача', categoryId: null, color: null, emoji: null, description: null });

    deleteTask(id);

    expect(useAppStore.getState().tasks).toHaveLength(0);
  });

  it('toggleImportant переключает флаг важности', () => {
    const { addTask, toggleImportant } = useAppStore.getState();
    const id = addTask({ title: 'Задача', categoryId: null, color: null, emoji: null, description: null });

    toggleImportant(id);
    expect(useAppStore.getState().tasks.find((t) => t.id === id)?.important).toBe(true);

    toggleImportant(id);
    expect(useAppStore.getState().tasks.find((t) => t.id === id)?.important).toBe(false);
  });

  it('setCompleted фиксирует время выполнения и снимает его при отмене', () => {
    const { addTask, setCompleted } = useAppStore.getState();
    const id = addTask({ title: 'Задача', categoryId: null, color: null, emoji: null, description: null });

    setCompleted(id, true);
    const completedTask = useAppStore.getState().tasks.find((t) => t.id === id);
    expect(completedTask?.completed).toBe(true);
    expect(completedTask?.completedAt).not.toBeNull();

    setCompleted(id, false);
    const reopenedTask = useAppStore.getState().tasks.find((t) => t.id === id);
    expect(reopenedTask?.completed).toBe(false);
    expect(reopenedTask?.completedAt).toBeNull();
  });

  it('scheduleTask и unscheduleTask управляют датой задачи в календаре', () => {
    const { addTask, scheduleTask, unscheduleTask } = useAppStore.getState();
    const id = addTask({ title: 'Задача', categoryId: null, color: null, emoji: null, description: null });

    scheduleTask(id, '2026-07-01');
    expect(useAppStore.getState().tasks.find((t) => t.id === id)?.scheduledDate).toBe('2026-07-01');

    unscheduleTask(id);
    expect(useAppStore.getState().tasks.find((t) => t.id === id)?.scheduledDate).toBeNull();
  });
});

describe('навигация по календарю', () => {
  it('step переключает неделю на 7 дней вперёд/назад', () => {
    const { step } = useAppStore.getState();
    step(1);
    expect(useAppStore.getState().ui.anchorDate).toBe('2026-07-05');
    step(-1);
    expect(useAppStore.getState().ui.anchorDate).toBe('2026-06-28');
  });

  it('setViewMode переключает режим недели/месяца', () => {
    const { setViewMode } = useAppStore.getState();
    setViewMode('month');
    expect(useAppStore.getState().ui.viewMode).toBe('month');
  });
});
