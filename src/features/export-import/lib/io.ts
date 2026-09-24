import type {
  CalendarEvent,
  Category,
  Payment,
  PersistedState,
  Task,
  UiState,
  ViewMode,
} from '@/shared/types';
import {
  DEFAULT_CATEGORY_COLOR,
  FALLBACK_COLOR,
  SCHEMA_VERSION,
} from '@/shared/config/constants';
import { normalizeHexColor } from '@/shared/lib/color';
import { normalizeISODate, todayISO } from '@/shared/lib/date';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asBool(v: unknown): boolean {
  return v === true;
}

function asTaskColor(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  return normalizeHexColor(v, FALLBACK_COLOR);
}

function asNullableISODate(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const normalized = normalizeISODate(v, '');
  return normalized || null;
}

function normalizeCategory(raw: unknown): Category | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string') return null;
  return {
    id: raw.id,
    name: asString(raw.name, 'Без названия'),
    color: normalizeHexColor(raw.color, DEFAULT_CATEGORY_COLOR),
    collapsed: asBool(raw.collapsed),
  };
}

function normalizeTask(raw: unknown): Task | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string') return null;
  return {
    id: raw.id,
    title: asString(raw.title, 'Без названия'),
    categoryId: typeof raw.categoryId === 'string' ? raw.categoryId : null,
    color: asTaskColor(raw.color),
    emoji: typeof raw.emoji === 'string' ? raw.emoji : null,
    description: typeof raw.description === 'string' ? raw.description : null,
    important: asBool(raw.important),
    completed: asBool(raw.completed),
    completedAt: typeof raw.completedAt === 'number' ? raw.completedAt : null,
    scheduledDate: asNullableISODate(raw.scheduledDate),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function normalizePayment(raw: unknown): Payment | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string') return null;
  const amount =
    typeof raw.amount === 'number' && Number.isFinite(raw.amount)
      ? raw.amount
      : null;
  const dueDay =
    typeof raw.dueDay === 'number' &&
    Number.isInteger(raw.dueDay) &&
    raw.dueDay >= 1 &&
    raw.dueDay <= 31
      ? raw.dueDay
      : null;
  const paid = asBool(raw.paid);
  return {
    id: raw.id,
    title: asString(raw.title),
    amount,
    dueDay,
    notes: asString(raw.notes),
    paid,
    paidAt: paid && typeof raw.paidAt === 'number' ? raw.paidAt : null,
  };
}

function asIntInRange(v: unknown, min: number, max: number): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
    ? v
    : null;
}

function normalizeEvent(raw: unknown): CalendarEvent | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string') return null;
  const month = asIntInRange(raw.month, 1, 12);
  if (month === null) return null;
  return {
    id: raw.id,
    title: asString(raw.title, 'Без названия'),
    description: typeof raw.description === 'string' ? raw.description : null,
    month,
    color: normalizeHexColor(raw.color, DEFAULT_CATEGORY_COLOR),
    emoji: typeof raw.emoji === 'string' ? raw.emoji : null,
    calendarDay: asIntInRange(raw.calendarDay, 1, 31),
  };
}

const VIEW_MODES: readonly ViewMode[] = [
  'today',
  'week',
  'month',
  'payments',
  'events',
];

function normalizeUi(raw: unknown): UiState {
  const obj = isObject(raw) ? raw : {};
  const viewMode = VIEW_MODES.find((m) => m === obj.viewMode) ?? 'week';
  return {
    viewMode,
    anchorDate: normalizeISODate(obj.anchorDate, todayISO()),
    importantOnly: asBool(obj.importantOnly),
  };
}

export type ImportResult =
  | { ok: true; data: PersistedState }
  | { ok: false; error: string };

/** Разбирает и валидирует JSON-строку резервной копии. */
export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Файл не является корректным JSON.' };
  }

  if (!isObject(raw) || !Array.isArray(raw.categories) || !Array.isArray(raw.tasks)) {
    return {
      ok: false,
      error: 'Структура файла не похожа на резервную копию планировщика.',
    };
  }

  const categories = raw.categories
    .map(normalizeCategory)
    .filter((c): c is Category => c !== null);
  const tasks = raw.tasks
    .map(normalizeTask)
    .filter((t): t is Task => t !== null);
  // Платежей может не быть в старых резервных копиях.
  const payments = (Array.isArray(raw.payments) ? raw.payments : [])
    .map(normalizePayment)
    .filter((p): p is Payment => p !== null);
  const events = (Array.isArray(raw.events) ? raw.events : [])
    .map(normalizeEvent)
    .filter((e): e is CalendarEvent => e !== null);

  // Подчищаем ссылки на несуществующие категории.
  const categoryIds = new Set(categories.map((c) => c.id));
  for (const task of tasks) {
    if (task.categoryId && !categoryIds.has(task.categoryId)) {
      task.categoryId = null;
    }
  }

  return {
    ok: true,
    data: {
      version: SCHEMA_VERSION,
      categories,
      tasks,
      payments,
      events,
      ui: normalizeUi(raw.ui),
    },
  };
}

/** Формирует снимок состояния для экспорта. */
export function buildExport({
  categories,
  tasks,
  payments,
  events,
  ui,
}: {
  categories: Category[];
  tasks: Task[];
  payments: Payment[];
  events: CalendarEvent[];
  ui: UiState;
}): PersistedState {
  return { version: SCHEMA_VERSION, categories, tasks, payments, events, ui };
}

/** Скачивает строку как файл. */
export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
