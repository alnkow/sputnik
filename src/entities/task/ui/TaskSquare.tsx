import type { Task } from '@/shared/types';
import { Tooltip } from '@/shared/ui/Tooltip';

interface TaskSquareProps {
  task: Task;
  color: string;
  onEdit: () => void;
}

/** Маленький цветной квадрат задачи в ячейке дня (режим «Месяц»). */
export function TaskSquare({ task, color, onEdit }: TaskSquareProps) {
  return (
    <Tooltip
      content={
        <span>
          {task.emoji ? `${task.emoji} ` : ''}
          {task.title}
        </span>
      }
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={task.title}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-[10px] leading-none shadow-sm ring-1 ring-black/5 transition-transform"
        style={{ backgroundColor: color }}
      >
        {task.emoji ?? (task.important ? '🔥' : '')}
      </button>
    </Tooltip>
  );
}
