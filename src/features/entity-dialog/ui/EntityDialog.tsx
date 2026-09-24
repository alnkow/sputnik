import { useState } from 'react';
import type { ID, Task } from '@/shared/types';
import {
  DEFAULT_CATEGORY_COLOR,
  PALETTE,
} from '@/shared/config/constants';
import { buildCategoryIndex, resolveTaskColor } from '@/entities/task/model/selectors';
import { cn } from '@/shared/lib/cn';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import type { DialogState } from '@/shared/store/useUiStore';
import {
  Button,
  ColorPicker,
  DateField,
  EmojiPicker,
  Field,
  Input,
  Modal,
  Textarea,
  Toggle,
} from '@/shared/ui';
import { CheckIcon, FlameIcon, PencilIcon } from '@/shared/ui/icons';

type OpenDialog = Exclude<DialogState, { kind: 'closed' }>;

type EntityType = 'task' | 'category';

interface FormState {
  type: EntityType;
  title: string;
  description: string;
  categoryId: ID | null;
  inheritColor: boolean;
  color: string;
  emoji: string | null;
  scheduledDate: string | null;
}

function getInitialState(dialog: OpenDialog): FormState {
  const { categories, tasks } = useAppStore.getState();
  const categoryColor = (id: ID | null): string => {
    const found = categories.find((c) => c.id === id);
    return found?.color ?? PALETTE[9];
  };

  switch (dialog.kind) {
    case 'create-task':
      return {
        type: 'task',
        title: '',
        description: '',
        categoryId: dialog.presetCategoryId,
        inheritColor: true,
        color: categoryColor(dialog.presetCategoryId),
        emoji: null,
        scheduledDate: null,
      };
    case 'create-category':
      return {
        type: 'category',
        title: '',
        description: '',
        categoryId: null,
        inheritColor: false,
        color: DEFAULT_CATEGORY_COLOR,
        emoji: null,
        scheduledDate: null,
      };
    case 'edit-task': {
      const task = tasks.find((t) => t.id === dialog.id);
      return {
        type: 'task',
        title: task?.title ?? '',
        description: task?.description ?? '',
        categoryId: task?.categoryId ?? null,
        inheritColor: task ? task.color === null : true,
        color: task?.color ?? categoryColor(task?.categoryId ?? null),
        emoji: task?.emoji ?? null,
        scheduledDate: task?.scheduledDate ?? null,
      };
    }
    case 'edit-category': {
      const category = useAppStore
        .getState()
        .categories.find((c) => c.id === dialog.id);
      return {
        type: 'category',
        title: category?.name ?? '',
        description: '',
        categoryId: null,
        inheritColor: false,
        color: category?.color ?? DEFAULT_CATEGORY_COLOR,
        emoji: null,
        scheduledDate: null,
      };
    }
  }
}

const titleByDialog: Record<OpenDialog['kind'], string> = {
  'create-task': 'Новая запись',
  'create-category': 'Новая запись',
  'edit-task': 'Редактировать задачу',
  'edit-category': 'Редактировать категорию',
};

/** Презентационный просмотр задачи в диалоге — до перехода в редактирование. */
function TaskPreview({
  task,
  color,
  categoryName,
}: {
  task: Task;
  color: string;
  categoryName: string;
}) {
  const handleDateChange = (date: string | null) => {
    const store = useAppStore.getState();
    if (date) store.scheduleTask(task.id, date);
    else store.unscheduleTask(task.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span
          className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-base font-semibold text-slate-800">
            {task.emoji && <span>{task.emoji}</span>}
            <span className="break-words">{task.title}</span>
            {task.important && (
              <FlameIcon
                className="h-4 w-4 shrink-0 text-amber-500"
                fill="currentColor"
              />
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{categoryName}</p>
        </div>
      </div>
      {task.description && (
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {task.description}
        </p>
      )}
      <Field label="Дата">
        <DateField value={task.scheduledDate} onChange={handleDateChange} />
      </Field>
    </div>
  );
}

function DialogForm({ dialog }: { dialog: OpenDialog }) {
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const [form, setForm] = useState<FormState>(() => getInitialState(dialog));
  const [mode, setMode] = useState<'view' | 'edit'>(
    dialog.kind === 'edit-task' ? 'view' : 'edit',
  );

  const isCreate =
    dialog.kind === 'create-task' || dialog.kind === 'create-category';
  const canSwitchType = isCreate;
  const trimmed = form.title.trim();
  const canSubmit = trimmed.length > 0;

  const patch = (next: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...next }));

  const handleSubmit = () => {
    if (!canSubmit) return;
    const store = useAppStore.getState();

    if (form.type === 'category') {
      if (dialog.kind === 'edit-category') {
        store.updateCategory(dialog.id, { name: trimmed, color: form.color });
      } else {
        store.addCategory({ name: trimmed, color: form.color });
      }
    } else {
      const payload = {
        title: trimmed,
        categoryId: form.categoryId,
        color: form.inheritColor ? null : form.color,
        emoji: form.emoji,
        description: form.description.trim() || null,
      };
      if (dialog.kind === 'edit-task') {
        store.updateTask(dialog.id, {
          ...payload,
          scheduledDate: form.scheduledDate,
        });
      } else {
        store.addTask(payload);
      }
    }
    closeDialog();
  };

  const handleComplete = () => {
    if (dialog.kind !== 'edit-task') return;
    useAppStore.getState().setCompleted(dialog.id, true);
    closeDialog();
  };

  const handleCancel = () => {
    if (dialog.kind === 'edit-task' && mode === 'edit') {
      setForm(getInitialState(dialog));
      setMode('view');
    } else {
      closeDialog();
    }
  };

  if (dialog.kind === 'edit-task' && mode === 'view') {
    const task = tasks.find((t) => t.id === dialog.id);
    if (!task) return null;
    const color = resolveTaskColor(task, buildCategoryIndex(categories));
    const categoryName =
      categories.find((c) => c.id === task.categoryId)?.name ?? 'Без категории';

    return (
      <Modal
        open
        onClose={closeDialog}
        title="Задача"
        footer={
          <>
            <Button variant="success" className="mr-auto" onClick={handleComplete}>
              <CheckIcon className="h-4 w-4" />
              Завершить
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setForm(getInitialState(dialog));
                setMode('edit');
              }}
            >
              <PencilIcon className="h-4 w-4" />
              Редактировать
            </Button>
            <Button variant="ghost" onClick={closeDialog}>
              Закрыть
            </Button>
          </>
        }
      >
        <TaskPreview task={task} color={color} categoryName={categoryName} />
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={closeDialog}
      title={titleByDialog[dialog.kind]}
      footer={
        <>
          {dialog.kind === 'edit-task' && (
            <Button variant="success" className="mr-auto" onClick={handleComplete}>
              <CheckIcon className="h-4 w-4" />
              Завершить
            </Button>
          )}
          <Button variant="ghost" onClick={handleCancel}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {isCreate ? 'Создать' : 'Сохранить'}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {canSwitchType && (
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm">
            {(['task', 'category'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => patch({ type: t })}
                className={cn(
                  'rounded-md px-3 py-1.5 font-medium transition-colors',
                  form.type === t
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {t === 'task' ? 'Задача' : 'Категория'}
              </button>
            ))}
          </div>
        )}

        <Field label="Название">
          <Input
            autoFocus
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder={
              form.type === 'task' ? 'Что нужно сделать?' : 'Название категории'
            }
          />
        </Field>

        {form.type === 'task' && (
          <>
            <Field label="Описание">
              <Textarea
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Дополнительные детали (необязательно)"
              />
            </Field>

            {dialog.kind === 'edit-task' && (
              <Field label="Дата">
                <DateField
                  value={form.scheduledDate}
                  onChange={(scheduledDate) => patch({ scheduledDate })}
                />
              </Field>
            )}

            <Field label="Категория">
              <select
                value={form.categoryId ?? ''}
                onChange={(e) =>
                  patch({ categoryId: e.target.value || null })
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-100"
              >
                <option value="">Без категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Цвет</span>
                <Toggle
                  checked={form.inheritColor}
                  onChange={(v) => patch({ inheritColor: v })}
                  label="Как у категории"
                />
              </div>
              {!form.inheritColor && (
                <ColorPicker
                  value={form.color}
                  onChange={(color) => patch({ color })}
                />
              )}
            </div>

            <Field label="Эмодзи">
              <EmojiPicker
                value={form.emoji}
                onChange={(emoji) => patch({ emoji })}
              />
            </Field>
          </>
        )}

        {form.type === 'category' && (
          <Field label="Цвет">
            <ColorPicker
              value={form.color}
              onChange={(color) => patch({ color })}
            />
          </Field>
        )}
      </form>
    </Modal>
  );
}

export function EntityDialog() {
  const dialog = useUiStore((s) => s.dialog);
  if (dialog.kind === 'closed') return null;

  const key =
    dialog.kind === 'edit-task' || dialog.kind === 'edit-category'
      ? `${dialog.kind}:${dialog.id}`
      : dialog.kind === 'create-task'
        ? `create-task:${dialog.presetCategoryId ?? 'none'}`
        : dialog.kind;

  return <DialogForm key={key} dialog={dialog} />;
}
