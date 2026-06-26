import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { Task } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { dndId } from '@/shared/lib/dnd';
import { dayNumber, isToday } from '@/shared/lib/date';
import { useUiStore } from '@/shared/store/useUiStore';
import { TaskSquare } from '@/entities/task/ui/TaskSquare';

interface MonthDayCellProps {
  iso: string;
  tasks: Task[];
  inMonth: boolean;
  colorOf: (task: Task) => string;
}

function DraggableTaskSquare({
  task,
  color,
  onEdit,
}: {
  task: Task;
  color: string;
  onEdit: () => void;
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: dndId.calendarTask(task.id),
    data: { variant: 'square' },
  });

  return (
    <span
      ref={setNodeRef}
      className={cn(
        'inline-flex h-5 w-5 shrink-0 touch-none items-center justify-center',
        isDragging && 'opacity-50',
      )}
      {...listeners}
      {...attributes}
    >
      <TaskSquare task={task} color={color} onEdit={onEdit} />
    </span>
  );
}

export function MonthDayCell({
  iso,
  tasks,
  inMonth,
  colorOf,
}: MonthDayCellProps) {
  const openEditTask = useUiStore((s) => s.openEditTask);
  const { setNodeRef, isOver } = useDroppable({ id: dndId.day(iso) });
  const today = isToday(iso);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-lg border p-1 transition-colors',
        inMonth
          ? 'border-slate-200 bg-white'
          : 'border-slate-100 bg-slate-50/60',
        isOver && 'ring-2 ring-accent-300',
      )}
    >
      <div className="mb-1 flex justify-end">
        <span
          className={cn(
            'flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium',
            today
              ? 'bg-accent-600 text-white'
              : inMonth
                ? 'text-slate-600'
                : 'text-slate-400',
          )}
        >
          {dayNumber(iso)}
        </span>
      </div>
      <div className="thin-scrollbar flex flex-wrap content-start gap-1 overflow-y-auto">
        {tasks.map((task) => (
          <DraggableTaskSquare
            key={task.id}
            task={task}
            color={colorOf(task)}
            onEdit={() => openEditTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
}
