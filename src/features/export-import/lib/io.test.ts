import { DEFAULT_CATEGORY_COLOR, FALLBACK_COLOR, SCHEMA_VERSION } from '@/shared/config/constants';
import { buildExport, parseImport } from './io';

describe('parseImport', () => {
  it('возвращает ошибку для невалидного JSON', () => {
    const result = parseImport('не json {{{');
    expect(result.ok).toBe(false);
  });

  it('возвращает ошибку, если структура не похожа на резервную копию', () => {
    const result = parseImport(JSON.stringify({ foo: 'bar' }));
    expect(result.ok).toBe(false);
  });

  it('нормализует валидную категорию и задачу', () => {
    const raw = {
      categories: [{ id: 'cat-1', name: 'Работа', color: '#ff0000', collapsed: true }],
      tasks: [
        {
          id: 'task-1',
          title: 'Сделать отчёт',
          categoryId: 'cat-1',
          color: '#00ff00',
          emoji: '🔥',
          description: 'детали задачи',
          important: true,
          completed: false,
          completedAt: null,
          scheduledDate: '2026-06-28',
          createdAt: 123,
        },
      ],
      ui: { viewMode: 'month', anchorDate: '2026-06-28', importantOnly: true },
    };

    const result = parseImport(JSON.stringify(raw));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.categories).toEqual([
      { id: 'cat-1', name: 'Работа', color: '#ff0000', collapsed: true },
    ]);
    expect(result.data.tasks[0]).toMatchObject({
      id: 'task-1',
      title: 'Сделать отчёт',
      description: 'детали задачи',
      important: true,
      scheduledDate: '2026-06-28',
    });
    expect(result.data.ui).toEqual({
      viewMode: 'month',
      anchorDate: '2026-06-28',
      importantOnly: true,
    });
    expect(result.data.version).toBe(SCHEMA_VERSION);
  });

  it('подставляет значения по умолчанию для отсутствующих полей', () => {
    const raw = {
      categories: [{ id: 'cat-1' }],
      tasks: [{ id: 'task-1' }],
    };

    const result = parseImport(JSON.stringify(raw));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.categories[0]).toMatchObject({
      name: 'Без названия',
      color: DEFAULT_CATEGORY_COLOR,
      collapsed: false,
    });
    expect(result.data.tasks[0]).toMatchObject({
      title: 'Без названия',
      categoryId: null,
      color: null,
      emoji: null,
      description: null,
      important: false,
      completed: false,
      scheduledDate: null,
    });
  });

  it('заменяет некорректный цвет задачи на запасной, а отсутствующий — на null', () => {
    const raw = {
      categories: [],
      tasks: [
        { id: 't1', color: 'не-цвет' },
        { id: 't2' },
      ],
    };

    const result = parseImport(JSON.stringify(raw));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tasks[0].color).toBe(FALLBACK_COLOR);
    expect(result.data.tasks[1].color).toBeNull();
  });

  it('убирает ссылку на несуществующую категорию', () => {
    const raw = {
      categories: [{ id: 'cat-1', name: 'Работа' }],
      tasks: [{ id: 't1', categoryId: 'missing-category' }],
    };

    const result = parseImport(JSON.stringify(raw));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tasks[0].categoryId).toBeNull();
  });

  it('отбрасывает категории и задачи без id', () => {
    const raw = {
      categories: [{ name: 'Без id' }],
      tasks: [{ title: 'Без id' }],
    };

    const result = parseImport(JSON.stringify(raw));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.categories).toHaveLength(0);
    expect(result.data.tasks).toHaveLength(0);
  });
});

describe('buildExport', () => {
  it('собирает снимок состояния с текущей версией схемы', () => {
    const snapshot = buildExport({
      categories: [{ id: 'cat-1', name: 'Работа', color: '#fff', collapsed: false }],
      tasks: [],
      payments: [],
      ui: { viewMode: 'week', anchorDate: '2026-06-28', importantOnly: false },
    });

    expect(snapshot).toEqual({
      version: SCHEMA_VERSION,
      categories: [{ id: 'cat-1', name: 'Работа', color: '#fff', collapsed: false }],
      tasks: [],
      payments: [],
      ui: { viewMode: 'week', anchorDate: '2026-06-28', importantOnly: false },
    });
  });
});
