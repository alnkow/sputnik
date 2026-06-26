import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { dndId } from '@/shared/lib/dnd';
import { InboxIcon } from '@/shared/ui/icons';
import { SidebarTaskItem } from './SidebarTaskItem';

interface UncategorizedSectionProps {
  tasks: Task[];
  colorOf: (task: Task) => string;
}

export function UncategorizedSection({
  tasks,
  colorOf,
}: UncategorizedSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dndId.categoryDrop(null),
  });
  const taskIds = tasks.map((t) => dndId.sidebarTask(t.id));

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl border border-transparent transition-colors',
        isOver && 'border-accent-200 bg-accent-50/60',
      )}
    >
      <div className="flex items-center gap-2 px-2 py-1">
        <InboxIcon className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-500">
          Без категории
        </span>
        <span className="rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1 py-1 pr-1 pl-5">
          {tasks.map((task) => (
            <SidebarTaskItem key={task.id} task={task} color={colorOf(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
