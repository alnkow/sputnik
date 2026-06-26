import { useState } from 'react';
import type { ID } from '@/shared/types';
import {
  DEFAULT_CATEGORY_COLOR,
  PALETTE,
} from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import type { DialogState } from '@/shared/store/useUiStore';
import {
  Button,
  ColorPicker,
  EmojiPicker,
  Field,
  Input,
  Modal,
  Toggle,
} from '@/shared/ui';
import { CheckIcon } from '@/shared/ui/icons';

type OpenDialog = Exclude<DialogState, { kind: 'closed' }>;

type EntityType = 'task' | 'category';

interface FormState {
  type: EntityType;
  title: string;
  categoryId: ID | null;
  inheritColor: boolean;
  color: string;
  emoji: string | null;
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
        categoryId: dialog.presetCategoryId,
        inheritColor: true,
        color: categoryColor(dialog.presetCategoryId),
        emoji: null,
      };
    case 'create-category':
      return {
        type: 'category',
        title: '',
        categoryId: null,
        inheritColor: false,
        color: DEFAULT_CATEGORY_COLOR,
        emoji: null,
      };
    case 'edit-task': {
      const task = tasks.find((t) => t.id === dialog.id);
      return {
        type: 'task',
        title: task?.title ?? '',
        categoryId: task?.categoryId ?? null,
        inheritColor: task ? task.color === null : true,
        color: task?.color ?? categoryColor(task?.categoryId ?? null),
        emoji: task?.emoji ?? null,
      };
    }
    case 'edit-category': {
      const category = useAppStore
        .getState()
        .categories.find((c) => c.id === dialog.id);
      return {
        type: 'category',
        title: category?.name ?? '',
        categoryId: null,
        inheritColor: false,
        color: category?.color ?? DEFAULT_CATEGORY_COLOR,
        emoji: null,
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

function DialogForm({ dialog }: { dialog: OpenDialog }) {
  const categories = useAppStore((s) => s.categories);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const [form, setForm] = useState<FormState>(() => getInitialState(dialog));

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
      };
      if (dialog.kind === 'edit-task') {
        store.updateTask(dialog.id, payload);
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
          <Button variant="ghost" onClick={closeDialog}>
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

/** Диалог создания и редактирования задач и категорий. */
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
