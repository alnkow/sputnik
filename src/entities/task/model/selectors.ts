import type { Category, ID, Task } from '@/shared/types';
import { FALLBACK_COLOR } from '@/shared/config/constants';

export interface TaskGroup {
  /** null => служебная секция «Без категории» */
  category: Category | null;
  tasks: Task[];
}

/** Строит индекс категорий по id для быстрого доступа. */
export function buildCategoryIndex(categories: Category[]): Map<ID, Category> {
  return new Map(categories.map((c) => [c.id, c]));
}

/** Цвет задачи: собственный, иначе цвет категории, иначе запасной. */
export function resolveTaskColor(
  task: Task,
  categoryById: Map<ID, Category>,
): string {
  if (task.color) return task.color;
  if (task.categoryId) {
    const category = categoryById.get(task.categoryId);
    if (category) return category.color;
  }
  return FALLBACK_COLOR;
}

/**
 * Группирует активные (не выполненные) задачи по категориям в порядке категорий,
 * затем «Без категории». При importantOnly остаются только важные.
 * Пустые группы сохраняются (фильтрацию для отображения делает UI),
 * кроме «Без категории» — она появляется только при наличии задач.
 */
export function groupActiveTasks(
  tasks: Task[],
  categories: Category[],
  importantOnly: boolean,
): TaskGroup[] {
  const byCategory = new Map<ID | null, Task[]>();
  for (const task of tasks) {
    if (task.completed) continue;
    if (importantOnly && !task.important) continue;
    const list = byCategory.get(task.categoryId);
    if (list) list.push(task);
    else byCategory.set(task.categoryId, [task]);
  }

  const groups: TaskGroup[] = categories.map((category) => ({
    category,
    tasks: byCategory.get(category.id) ?? [],
  }));

  const uncategorized = byCategory.get(null) ?? [];
  if (uncategorized.length > 0) {
    groups.push({ category: null, tasks: uncategorized });
  }

  return groups;
}

/** Активные задачи, запланированные на конкретный день. */
export function tasksForDate(tasks: Task[], iso: string): Task[] {
  return tasks.filter((t) => !t.completed && t.scheduledDate === iso);
}

/** Выполненные задачи, отсортированные по времени выполнения (новые сверху). */
export function completedTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t.completed)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
}
