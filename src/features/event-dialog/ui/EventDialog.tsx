import { useState } from 'react';
import type { CalendarEvent } from '@/shared/types';
import { DEFAULT_CATEGORY_COLOR } from '@/shared/config/constants';
import { MONTHS_GENITIVE, MONTHS_NOMINATIVE } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import type { EventDialogState } from '@/shared/store/useUiStore';
import {
  Button,
  ColorPicker,
  EmojiPicker,
  Field,
  Input,
  Modal,
  Textarea,
} from '@/shared/ui';
import { PencilIcon, StarIcon, TrashIcon } from '@/shared/ui/icons';
import { MONTH_MAX_DAYS } from '@/entities/event/model/selectors';

const selectClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm ' +
  'focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-100';

type OpenState = Exclude<EventDialogState, { kind: 'closed' }>;

interface FormState {
  title: string;
  description: string;
  month: number;
  color: string;
  emoji: string | null;
  showInCalendar: boolean;
  day: number;
}

function getInitialForm(event: CalendarEvent | undefined): FormState {
  if (!event) {
    return {
      title: '',
      description: '',
      month: new Date().getMonth() + 1,
      color: DEFAULT_CATEGORY_COLOR,
      emoji: null,
      showInCalendar: false,
      day: 1,
    };
  }
  return {
    title: event.title,
    description: event.description ?? '',
    month: event.month,
    color: event.color,
    emoji: event.emoji,
    showInCalendar: event.calendarDay !== null,
    day: event.calendarDay ?? 1,
  };
}

/** Просмотр события: только информация. */
function EventPreview({ event }: { event: CalendarEvent }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base ring-1 ring-black/5"
          style={{ backgroundColor: event.color }}
        >
          {event.emoji ?? (
            <StarIcon className="h-4 w-4 text-white" fill="currentColor" />
          )}
        </span>
        <span className="text-base font-semibold break-words text-slate-800">
          {event.title}
        </span>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex gap-3">
          <dt className="w-28 shrink-0 text-slate-500">Месяц</dt>
          <dd className="text-slate-800">
            {MONTHS_NOMINATIVE[event.month - 1]}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-28 shrink-0 text-slate-500">В календаре</dt>
          <dd className="text-slate-800">
            {event.calendarDay === null
              ? 'Не отображается'
              : `${event.calendarDay} ${MONTHS_GENITIVE[event.month - 1]}, каждый год`}
          </dd>
        </div>
      </dl>
      {event.description && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm whitespace-pre-wrap text-slate-600">
          {event.description}
        </p>
      )}
    </div>
  );
}

function EventForm({
  form,
  patch,
  onSubmit,
}: {
  form: FormState;
  patch: (next: Partial<FormState>) => void;
  onSubmit: () => void;
}) {
  const maxDay = MONTH_MAX_DAYS[form.month - 1];
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Field label="Название">
        <Input
          autoFocus
          value={form.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Например, день рождения"
        />
      </Field>

      <Field label="Описание">
        <Textarea
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Дополнительные детали (необязательно)"
        />
      </Field>

      <Field label="Месяц">
        <select
          aria-label="Месяц"
          value={form.month}
          onChange={(e) => {
            const month = Number(e.target.value);
            patch({
              month,
              day: Math.min(form.day, MONTH_MAX_DAYS[month - 1]),
            });
          }}
          className={selectClass}
        >
          {MONTHS_NOMINATIVE.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
      </Field>

      <div className="space-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.showInCalendar}
            onChange={(e) => patch({ showInCalendar: e.target.checked })}
            className="h-4 w-4 cursor-pointer accent-accent-600"
          />
          Отображать в календаре
        </label>
        {form.showInCalendar && (
          <select
            aria-label="День"
            value={form.day}
            onChange={(e) => patch({ day: Number(e.target.value) })}
            className={selectClass}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day} {MONTHS_GENITIVE[form.month - 1]}
              </option>
            ))}
          </select>
        )}
      </div>

      <Field label="Цвет">
        <ColorPicker
          value={form.color}
          onChange={(color) => patch({ color })}
        />
      </Field>

      <Field label="Иконка">
        <EmojiPicker
          value={form.emoji}
          onChange={(emoji) => patch({ emoji })}
        />
      </Field>
    </form>
  );
}

function EventDialogContent({ state }: { state: OpenState }) {
  const setEventDialog = useUiStore((s) => s.setEventDialog);
  const eventId = state.kind === 'create' ? null : state.id;
  const event = useAppStore((s) =>
    eventId ? s.events.find((e) => e.id === eventId) : undefined,
  );
  const [form, setForm] = useState<FormState>(() => getInitialForm(event));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = () => setEventDialog({ kind: 'closed' });
  const patch = (next: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...next }));

  if (state.kind !== 'create' && !event) return null;

  const trimmed = form.title.trim();
  const canSubmit = trimmed.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload = {
      title: trimmed,
      description: form.description.trim() || null,
      month: form.month,
      color: form.color,
      emoji: form.emoji,
      calendarDay: form.showInCalendar ? form.day : null,
    };
    const store = useAppStore.getState();
    if (state.kind === 'edit') {
      store.updateEvent(state.id, payload);
      setEventDialog({ kind: 'view', id: state.id, readOnly: false });
    } else {
      store.addEvent(payload);
      close();
    }
  };

  const handleDelete = () => {
    if (eventId) useAppStore.getState().deleteEvent(eventId);
    close();
  };

  if (state.kind === 'view' && event) {
    return (
      <Modal
        open
        onClose={close}
        title="Событие"
        footer={
          <>
            {!state.readOnly && (
              <Button
                variant="primary"
                onClick={() => setEventDialog({ kind: 'edit', id: event.id })}
              >
                <PencilIcon className="h-4 w-4" />
                Редактировать
              </Button>
            )}
            <Button variant="ghost" onClick={close}>
              Закрыть
            </Button>
          </>
        }
      >
        <EventPreview event={event} />
      </Modal>
    );
  }

  const isEdit = state.kind === 'edit';

  return (
    <>
      <Modal
        open={!confirmDelete}
        onClose={close}
        title={isEdit ? 'Редактировать событие' : 'Новое событие'}
        footer={
          <>
            {isEdit && (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                <TrashIcon className="h-4 w-4" />
                Удалить
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() =>
                isEdit
                  ? setEventDialog({
                      kind: 'view',
                      id: state.id,
                      readOnly: false,
                    })
                  : close()
              }
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Сохранить
            </Button>
          </>
        }
      >
        <EventForm form={form} patch={patch} onSubmit={handleSubmit} />
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Удаление события"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Удалить
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Удалить событие «
          <span className="font-medium text-slate-800">{event?.title}</span>»?
        </p>
      </Modal>
    </>
  );
}

export function EventDialog() {
  const state = useUiStore((s) => s.eventDialog);
  if (state.kind === 'closed') return null;
  // Ключ пересоздаёт форму при смене режима/события — без устаревших полей.
  const key = state.kind === 'create' ? 'create' : `${state.kind}:${state.id}`;
  return <EventDialogContent key={key} state={state} />;
}
