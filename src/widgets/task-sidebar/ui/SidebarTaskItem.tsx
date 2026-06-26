import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/shared/types';
import { dndId } from '@/shared/lib/dnd';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { TaskCard } from '@/entities/task/ui/TaskCard';
import { GripIcon } from '@/shared/ui/icons';

interface SidebarTaskItemProps {
  task: Task;
  color: string;
}

export function SidebarTaskItem({ task, color }: SidebarTaskItemProps) {
  const toggleImportant = useAppStore((s) => s.toggleImportant);
  const setCompleted = useAppStore((s) => s.setCompleted);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const openEditTask = useUiStore((s) => s.openEditTask);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: dndId.sidebarTask(task.id) });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить задачу «${task.title}»?`)) {
      deleteTask(task.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        color={color}
        dragging={isDragging}
        onToggleImportant={() => toggleImportant(task.id)}
        onToggleComplete={() => setCompleted(task.id, true)}
        onEdit={() => openEditTask(task.id)}
        onDelete={handleDelete}
        dragHandle={
          <button
            type="button"
            aria-label="Перетащить задачу"
            className="flex h-7 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-slate-300 hover:text-slate-500"
            {...listeners}
          >
            <GripIcon className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}
