import { useDraggable } from '@dnd-kit/core';
import type { Task } from '@/shared/types';
import { dndId } from '@/shared/lib/dnd';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { TaskChip } from '@/entities/task/ui/TaskChip';

interface DraggableChipProps {
  task: Task;
  color: string;
}

export function DraggableChip({ task, color }: DraggableChipProps) {
  const unscheduleTask = useAppStore((s) => s.unscheduleTask);
  const openEditTask = useUiStore((s) => s.openEditTask);

  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: dndId.calendarTask(task.id),
  });

  return (
    <div ref={setNodeRef} className="touch-none" {...listeners} {...attributes}>
      <TaskChip
        task={task}
        color={color}
        dragging={isDragging}
        onEdit={() => openEditTask(task.id)}
        onRemove={() => unscheduleTask(task.id)}
      />
    </div>
  );
}
