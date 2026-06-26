import type { Task } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { getReadableTextColor } from '@/shared/lib/color';
import { CloseIcon, FlameIcon } from '@/shared/ui/icons';

interface TaskChipProps {
  task: Task;
  color: string;
  dragging?: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

/** Чип задачи в колонке дня (режим «Неделя»). Перетаскивается между днями. */
export function TaskChip({
  task,
  color,
  dragging = false,
  onEdit,
  onRemove,
}: TaskChipProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md px-1.5 py-1 text-xs shadow-sm',
        dragging && 'opacity-50',
      )}
      style={{ backgroundColor: color, color: getReadableTextColor(color) }}
    >
      {task.emoji && <span className="leading-none">{task.emoji}</span>}
      {task.important && (
        <FlameIcon className="h-3 w-3 shrink-0" fill="currentColor" />
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onEdit}
        className="flex-1 truncate text-left font-medium"
        title={task.title}
      >
        {task.title}
      </button>
      <div
        className="flex items-center opacity-0 transition-opacity group-hover:opacity-100"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onRemove}
          aria-label="Убрать с этого дня"
          title="Убрать с этого дня"
          className="flex h-4 w-4 items-center justify-center rounded hover:bg-white/25"
        >
          <CloseIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
