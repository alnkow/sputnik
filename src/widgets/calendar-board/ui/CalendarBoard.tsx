import { useMemo } from 'react';
import type { Task } from '@/shared/types';
import { useAppStore } from '@/shared/store/useAppStore';
import {
  buildCategoryIndex,
  resolveTaskColor,
} from '@/entities/task/model/selectors';
import {
  WEEKDAYS_SHORT,
  getMonthGrid,
  getWeekDays,
  isSameMonth,
} from '@/shared/lib/date';
import { WeekDayColumn } from './WeekDayColumn';
import { MonthDayCell } from './MonthDayCell';

export function CalendarBoard() {
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);
  const viewMode = useAppStore((s) => s.ui.viewMode);
  const anchorDate = useAppStore((s) => s.ui.anchorDate);

  const index = useMemo(() => buildCategoryIndex(categories), [categories]);
  const colorOf = useMemo(
    () => (task: Task) => resolveTaskColor(task, index),
    [index],
  );

  const scheduled = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.completed && task.scheduledDate) {
        const list = map.get(task.scheduledDate);
        if (list) list.push(task);
        else map.set(task.scheduledDate, [task]);
      }
    }
    return map;
  }, [tasks]);

  const tasksOn = (iso: string): Task[] => scheduled.get(iso) ?? [];

  if (viewMode === 'week') {
    const days = getWeekDays(anchorDate);
    return (
      <div className="grid h-full grid-cols-7 gap-2 p-3">
        {days.map((iso) => (
          <WeekDayColumn
            key={iso}
            iso={iso}
            tasks={tasksOn(iso)}
            colorOf={colorOf}
          />
        ))}
      </div>
    );
  }

  const weeks = getMonthGrid(anchorDate);
  return (
    <div className="flex h-full flex-col p-3">
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS_SHORT.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-xs font-medium tracking-wide text-slate-400 uppercase"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-1">
        {weeks.flat().map((iso) => (
          <MonthDayCell
            key={iso}
            iso={iso}
            tasks={tasksOn(iso)}
            inMonth={isSameMonth(iso, anchorDate)}
            colorOf={colorOf}
          />
        ))}
      </div>
    </div>
  );
}
