import { useDroppable } from '@dnd-kit/core';
import type { Task } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { dndId } from '@/shared/lib/dnd';
import { dayNumber, isToday, isWeekend, weekdayShort } from '@/shared/lib/date';
import { DraggableChip } from './DraggableChip';

interface WeekDayColumnProps {
  iso: string;
  tasks: Task[];
  colorOf: (task: Task) => string;
}

export function WeekDayColumn({ iso, tasks, colorOf }: WeekDayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dndId.day(iso) });
  const today = isToday(iso);

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        className={cn(
          'flex items-center justify-between border-b border-slate-100 px-3 py-2',
          today && 'bg-accent-50',
        )}
      >
        <span
          className={cn(
            'text-xs font-medium uppercase',
            isWeekend(iso) ? 'text-rose-400' : 'text-slate-400',
          )}
        >
          {weekdayShort(iso)}
        </span>
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
            today ? 'bg-accent-600 text-white' : 'text-slate-700',
          )}
        >
          {dayNumber(iso)}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'thin-scrollbar flex-1 space-y-1.5 overflow-y-auto p-2 transition-colors',
          isOver && 'bg-accent-50/70',
        )}
      >
        {tasks.map((task) => (
          <DraggableChip key={task.id} task={task} color={colorOf(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-full min-h-16 items-center justify-center text-center text-xs text-slate-300">
            Перетащите задачу сюда
          </div>
        )}
      </div>
    </div>
  );
}
