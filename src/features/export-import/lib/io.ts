import type {
  Category,
  PersistedState,
  Task,
  UiState,
  ViewMode,
} from '@/shared/types';
import { SCHEMA_VERSION } from '@/shared/config/constants';
import { todayISO } from '@/shared/lib/date';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asBool(v: unknown): boolean {
  return v === true;
}

function normalizeCategory(raw: unknown): Category | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string') return null;
  return {
    id: raw.id,
    name: asString(raw.name, 'Без названия'),
    color: asString(raw.color, '#6366f1'),
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
    color: typeof raw.color === 'string' ? raw.color : null,
    emoji: typeof raw.emoji === 'string' ? raw.emoji : null,
    important: asBool(raw.important),
    completed: asBool(raw.completed),
    completedAt: typeof raw.completedAt === 'number' ? raw.completedAt : null,
    scheduledDate:
      typeof raw.scheduledDate === 'string' ? raw.scheduledDate : null,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
}

function normalizeUi(raw: unknown): UiState {
  const obj = isObject(raw) ? raw : {};
  const viewMode: ViewMode = obj.viewMode === 'month' ? 'month' : 'week';
  return {
    viewMode,
    anchorDate: asString(obj.anchorDate, todayISO()),
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
      ui: normalizeUi(raw.ui),
    },
  };
}

/** Формирует снимок состояния для экспорта. */
export function buildExport(
  categories: Category[],
  tasks: Task[],
  ui: UiState,
): PersistedState {
  return { version: SCHEMA_VERSION, categories, tasks, ui };
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
