import { useMemo } from 'react';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import {
  buildCategoryIndex,
  completedTasks,
  resolveTaskColor,
} from '@/entities/task/model/selectors';
import { Modal } from '@/shared/ui/Modal';
import { IconButton } from '@/shared/ui/IconButton';
import { CircleIcon, TrashIcon } from '@/shared/ui/icons';

function formatDate(ts: number | null): string {
  if (!ts) return '';
  return new Date(ts).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CompletedModal() {
  const open = useUiStore((s) => s.completedOpen);
  const close = useUiStore((s) => s.closeCompleted);
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);
  const setCompleted = useAppStore((s) => s.setCompleted);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const index = useMemo(() => buildCategoryIndex(categories), [categories]);
  const done = useMemo(() => completedTasks(tasks), [tasks]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Удалить задачу «${title}» навсегда?`)) {
      deleteTask(id);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Выполненные задачи${done.length ? ` (${done.length})` : ''}`}
      size="lg"
    >
      {done.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          Пока нет выполненных задач.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {done.map((task) => {
            const categoryName = task.categoryId
              ? (index.get(task.categoryId)?.name ?? 'Без категории')
              : 'Без категории';
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <span
                  className="h-6 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: resolveTaskColor(task, index) }}
                />
                {task.emoji && <span>{task.emoji}</span>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700 line-through">
                    {task.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {categoryName} · {formatDate(task.completedAt)}
                  </p>
                </div>
                <IconButton
                  tone="green"
                  onClick={() => setCompleted(task.id, false)}
                  title="Вернуть в активные"
                  aria-label="Вернуть в активные"
                >
                  <CircleIcon className="h-4 w-4" />
                </IconButton>
                <IconButton
                  tone="danger"
                  onClick={() => handleDelete(task.id, task.title)}
                  title="Удалить навсегда"
                  aria-label="Удалить навсегда"
                >
                  <TrashIcon className="h-4 w-4" />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
