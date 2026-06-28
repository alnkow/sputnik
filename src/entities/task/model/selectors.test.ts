import type { Category, Task } from '@/shared/types';
import {
  buildCategoryIndex,
  completedTasks,
  groupActiveTasks,
  resolveTaskColor,
  tasksForDate,
} from './selectors';

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-1',
    name: 'Работа',
    color: '#6366f1',
    collapsed: false,
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Задача',
    categoryId: null,
    color: null,
    emoji: null,
    description: null,
    important: false,
    completed: false,
    completedAt: null,
    scheduledDate: null,
    createdAt: 1,
    ...overrides,
  };
}

describe('resolveTaskColor', () => {
  it('возвращает собственный цвет задачи, если он задан', () => {
    const index = buildCategoryIndex([makeCategory({ color: '#000000' })]);
    const task = makeTask({ categoryId: 'cat-1', color: '#ff0000' });
    expect(resolveTaskColor(task, index)).toBe('#ff0000');
  });

  it('наследует цвет категории, если у задачи цвет не задан', () => {
    const index = buildCategoryIndex([makeCategory({ color: '#abcdef' })]);
    const task = makeTask({ categoryId: 'cat-1', color: null });
    expect(resolveTaskColor(task, index)).toBe('#abcdef');
  });

  it('возвращает запасной цвет, если категория не найдена', () => {
    const index = buildCategoryIndex([]);
    const task = makeTask({ categoryId: 'missing', color: null });
    expect(resolveTaskColor(task, index)).not.toBe('');
  });
});

describe('groupActiveTasks', () => {
  const categories = [
    makeCategory({ id: 'cat-1', name: 'Работа' }),
    makeCategory({ id: 'cat-2', name: 'Дом' }),
  ];

  it('группирует задачи по категориям в порядке категорий', () => {
    const tasks = [
      makeTask({ id: 't1', categoryId: 'cat-2', title: 'Уборка' }),
      makeTask({ id: 't2', categoryId: 'cat-1', title: 'Отчёт' }),
    ];
    const groups = groupActiveTasks(tasks, categories, false);
    expect(groups.map((g) => g.category?.name)).toEqual(['Работа', 'Дом']);
    expect(groups[0].tasks.map((t) => t.id)).toEqual(['t2']);
    expect(groups[1].tasks.map((t) => t.id)).toEqual(['t1']);
  });

  it('добавляет секцию «Без категории» только если в ней есть задачи', () => {
    const tasks = [makeTask({ id: 't1', categoryId: null })];
    const groups = groupActiveTasks(tasks, categories, false);
    expect(groups).toHaveLength(3);
    expect(groups[2].category).toBeNull();
    expect(groups[2].tasks.map((t) => t.id)).toEqual(['t1']);
  });

  it('исключает выполненные задачи', () => {
    const tasks = [makeTask({ id: 't1', categoryId: 'cat-1', completed: true })];
    const groups = groupActiveTasks(tasks, categories, false);
    expect(groups[0].tasks).toHaveLength(0);
  });

  it('importantOnly оставляет только важные задачи', () => {
    const tasks = [
      makeTask({ id: 't1', categoryId: 'cat-1', important: true }),
      makeTask({ id: 't2', categoryId: 'cat-1', important: false }),
    ];
    const groups = groupActiveTasks(tasks, categories, true);
    expect(groups[0].tasks.map((t) => t.id)).toEqual(['t1']);
  });
});

describe('tasksForDate', () => {
  it('возвращает только незавершённые задачи на указанную дату', () => {
    const tasks = [
      makeTask({ id: 't1', scheduledDate: '2026-06-28' }),
      makeTask({ id: 't2', scheduledDate: '2026-06-29' }),
      makeTask({ id: 't3', scheduledDate: '2026-06-28', completed: true }),
    ];
    expect(tasksForDate(tasks, '2026-06-28').map((t) => t.id)).toEqual(['t1']);
  });
});

describe('completedTasks', () => {
  it('возвращает выполненные задачи, новые сверху', () => {
    const tasks = [
      makeTask({ id: 't1', completed: true, completedAt: 100 }),
      makeTask({ id: 't2', completed: true, completedAt: 200 }),
      makeTask({ id: 't3', completed: false }),
    ];
    expect(completedTasks(tasks).map((t) => t.id)).toEqual(['t2', 't1']);
  });
});
