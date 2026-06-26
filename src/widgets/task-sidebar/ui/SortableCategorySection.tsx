import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category, Task } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { dndId } from '@/shared/lib/dnd';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { CategoryHeader } from '@/entities/category/ui/CategoryHeader';
import { GripIcon } from '@/shared/ui/icons';
import { SidebarTaskItem } from './SidebarTaskItem';

interface SortableCategorySectionProps {
  category: Category;
  tasks: Task[];
  canDelete: boolean;
  colorOf: (task: Task) => string;
}

export function SortableCategorySection({
  category,
  tasks,
  canDelete,
  colorOf,
}: SortableCategorySectionProps) {
  const toggleCollapsed = useAppStore((s) => s.toggleCategoryCollapsed);
  const deleteCategory = useAppStore((s) => s.deleteCategory);
  const openCreateTask = useUiStore((s) => s.openCreateTask);
  const openEditCategory = useUiStore((s) => s.openEditCategory);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dndId.category(category.id) });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dndId.categoryDrop(category.id),
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  const taskIds = tasks.map((t) => dndId.sidebarTask(t.id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(isDragging && 'opacity-60')}
    >
      <div
        ref={setDropRef}
        className={cn(
          'rounded-xl border border-transparent transition-colors',
          isOver && 'border-accent-200 bg-accent-50/60',
        )}
      >
        <CategoryHeader
          category={category}
          count={tasks.length}
          canDelete={canDelete}
          onToggleCollapse={() => toggleCollapsed(category.id)}
          onAddTask={() => openCreateTask(category.id)}
          onEdit={() => openEditCategory(category.id)}
          onDelete={() => deleteCategory(category.id)}
          dragHandle={
            <button
              type="button"
              aria-label="Перетащить категорию"
              className="flex h-7 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-slate-300 hover:text-slate-500"
              {...listeners}
            >
              <GripIcon className="h-4 w-4" />
            </button>
          }
        />
        {!category.collapsed && (
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 py-1 pr-1 pl-5">
              {tasks.map((task) => (
                <SidebarTaskItem
                  key={task.id}
                  task={task}
                  color={colorOf(task)}
                />
              ))}
              {tasks.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-slate-400">
                  Нет задач — перетащите сюда
                </p>
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
