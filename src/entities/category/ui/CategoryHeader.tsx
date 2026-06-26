import type { ReactNode } from 'react';
import type { Category } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/IconButton';
import {
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@/shared/ui/icons';

interface CategoryHeaderProps {
  category: Category;
  count: number;
  dragHandle?: ReactNode;
  canDelete: boolean;
  onToggleCollapse: () => void;
  onAddTask: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryHeader({
  category,
  count,
  dragHandle,
  canDelete,
  onToggleCollapse,
  onAddTask,
  onEdit,
  onDelete,
}: CategoryHeaderProps) {
  return (
    <div className="group flex items-center gap-1.5 rounded-lg px-1 py-1">
      {dragHandle}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex flex-1 items-center gap-2 overflow-hidden text-left"
      >
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform',
            category.collapsed && '-rotate-90',
          )}
        />
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="truncate text-sm font-semibold text-slate-700">
          {category.name}
        </span>
        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-500">
          {count}
        </span>
      </button>
      <div className="flex items-center">
        <IconButton
          onClick={onAddTask}
          aria-label="Добавить задачу в категорию"
          title="Добавить задачу"
        >
          <PlusIcon className="h-4 w-4" />
        </IconButton>
        <IconButton
          className="opacity-0 group-hover:opacity-100"
          onClick={onEdit}
          aria-label="Редактировать категорию"
          title="Редактировать"
        >
          <PencilIcon className="h-4 w-4" />
        </IconButton>
        <IconButton
          tone="danger"
          className="opacity-0 group-hover:opacity-100"
          onClick={onDelete}
          disabled={!canDelete}
          aria-label="Удалить категорию"
          title={
            canDelete
              ? 'Удалить категорию'
              : 'Сначала перенесите или удалите задачи'
          }
        >
          <TrashIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
