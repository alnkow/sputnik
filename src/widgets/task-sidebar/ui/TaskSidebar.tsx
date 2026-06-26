import { useMemo } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ID, Task } from '@/shared/types';
import { dndId } from '@/shared/lib/dnd';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import {
  buildCategoryIndex,
  groupActiveTasks,
  resolveTaskColor,
} from '@/entities/task/model/selectors';
import { Button } from '@/shared/ui/Button';
import { Toggle } from '@/shared/ui/Toggle';
import { PlusIcon } from '@/shared/ui/icons';
import { SortableCategorySection } from './SortableCategorySection';
import { UncategorizedSection } from './UncategorizedSection';

export function TaskSidebar() {
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);
  const importantOnly = useAppStore((s) => s.ui.importantOnly);
  const toggleImportantOnly = useAppStore((s) => s.toggleImportantOnly);
  const openCreateTask = useUiStore((s) => s.openCreateTask);
  const openCreateCategory = useUiStore((s) => s.openCreateCategory);

  const index = useMemo(() => buildCategoryIndex(categories), [categories]);
  const colorOf = useMemo(
    () => (task: Task) => resolveTaskColor(task, index),
    [index],
  );
  const groups = useMemo(
    () => groupActiveTasks(tasks, categories, importantOnly),
    [tasks, categories, importantOnly],
  );
  const totalByCategory = useMemo(() => {
    const map = new Map<ID, number>();
    for (const task of tasks) {
      if (task.categoryId) {
        map.set(task.categoryId, (map.get(task.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [tasks]);

  const categoryGroups = groups.filter((g) => g.category !== null);
  const uncategorized = groups.find((g) => g.category === null);
  const visibleCategoryGroups = importantOnly
    ? categoryGroups.filter((g) => g.tasks.length > 0)
    : categoryGroups;
  const categoryItems = visibleCategoryGroups.map((g) =>
    dndId.category(g.category!.id),
  );

  const hasAnyActive = groups.some((g) => g.tasks.length > 0);
  const showEmptyState =
    !importantOnly && categories.length === 0 && !hasAnyActive;
  const showNoImportant =
    importantOnly && visibleCategoryGroups.length === 0 && !uncategorized;

  return (
    <aside className="flex h-full w-full flex-col border-l border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">Задачи</h2>
        <Toggle
          checked={importantOnly}
          onChange={toggleImportantOnly}
          label="Только важные"
        />
      </div>

      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2">
        <Button size="sm" variant="secondary" onClick={() => openCreateTask(null)}>
          <PlusIcon className="h-4 w-4" />
          Задача
        </Button>
        <Button size="sm" variant="secondary" onClick={openCreateCategory}>
          <PlusIcon className="h-4 w-4" />
          Категория
        </Button>
      </div>

      <div className="thin-scrollbar flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {showEmptyState ? (
          <div className="mt-10 px-4 text-center text-sm text-slate-500">
            <p className="mb-3">Пока пусто.</p>
            <p className="text-slate-400">
              Создайте категорию или задачу, чтобы начать планировать.
            </p>
          </div>
        ) : (
          <>
            <SortableContext
              items={categoryItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {visibleCategoryGroups.map((group) => (
                  <SortableCategorySection
                    key={group.category!.id}
                    category={group.category!}
                    tasks={group.tasks}
                    canDelete={
                      (totalByCategory.get(group.category!.id) ?? 0) === 0
                    }
                    colorOf={colorOf}
                  />
                ))}
              </div>
            </SortableContext>

            {uncategorized && uncategorized.tasks.length > 0 && (
              <UncategorizedSection
                tasks={uncategorized.tasks}
                colorOf={colorOf}
              />
            )}

            {showNoImportant && (
              <p className="px-2 py-10 text-center text-sm text-slate-400">
                Нет важных задач.
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
