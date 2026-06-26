/** Ключ хранилища в localStorage. */
export const STORAGE_KEY = 'task-manager';

/** Версия схемы сохранённого состояния (для миграций при импорте). */
export const SCHEMA_VERSION = 1;

/** Цвет категории по умолчанию. */
export const DEFAULT_CATEGORY_COLOR = '#6366f1';

/** Запасной цвет, если у задачи нет ни своего цвета, ни категории. */
export const FALLBACK_COLOR = '#94a3b8';

/** Предустановленная палитра для выбора цвета задач и категорий. */
export const PALETTE: readonly string[] = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#64748b', // slate
];

/** Набор эмодзи для быстрого выбора. */
export const EMOJIS: readonly string[] = [
  '📝', '✅', '⭐', '🔥', '💡', '📌', '📅', '⏰', '🎯', '🚀',
  '💼', '📞', '✉️', '🏠', '🛒', '🍽️', '🏋️', '📚', '🎓', '💻',
  '🐛', '🔧', '🎨', '🎉', '❤️', '☕', '🌱', '🧹', '💰', '✈️',
  '🩺', '🎵', '🎮', '📦', '🔑', '⚙️', '📈', '🧪', '🥗', '🐶',
];
