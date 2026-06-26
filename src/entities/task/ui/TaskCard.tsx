import type { ReactNode } from 'react';
import type { Task } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/IconButton';
import {
  CheckCircleIcon,
  FlameIcon,
  PencilIcon,
  TrashIcon,
} from '@/shared/ui/icons';

interface TaskCardProps {
  task: Task;
  /** Уже разрешённый цвет (свой или категории). */
  color: string;
  /** Слот для drag-ручки (предоставляется sortable-обёрткой). */
  dragHandle?: ReactNode;
  dragging?: boolean;
  onToggleImportant: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Презентационная карточка задачи для правой панели. */
export function TaskCard({
  task,
  color,
  dragHandle,
  dragging = false,
  onToggleImportant,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-1.5 py-1.5 shadow-sm transition-colors hover:border-slate-200',
        dragging && 'opacity-50',
      )}
    >
      {dragHandle}
      <span
        className="h-6 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {task.emoji && (
        <span className="text-base leading-none">{task.emoji}</span>
      )}
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 truncate text-left text-sm text-slate-700 hover:text-slate-900"
        title={task.title}
      >
        {task.title}
      </button>
      <div className="flex items-center">
        <IconButton
          tone="amber"
          active={task.important}
          onClick={onToggleImportant}
          aria-label="Отметить важной"
          title={task.important ? 'Снять важность' : 'Сделать важной'}
        >
          <FlameIcon
            className="h-4 w-4"
            fill={task.important ? 'currentColor' : 'none'}
          />
        </IconButton>
        <IconButton
          tone="green"
          onClick={onToggleComplete}
          aria-label="Выполнить"
          title="Выполнить"
        >
          <CheckCircleIcon className="h-4 w-4" />
        </IconButton>
        <IconButton
          className="opacity-0 group-hover:opacity-100"
          onClick={onEdit}
          aria-label="Редактировать"
          title="Редактировать"
        >
          <PencilIcon className="h-4 w-4" />
        </IconButton>
        <IconButton
          tone="danger"
          className="opacity-0 group-hover:opacity-100"
          onClick={onDelete}
          aria-label="Удалить"
          title="Удалить"
        >
          <TrashIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
