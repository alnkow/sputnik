/** Ключ хранилища в localStorage. */
export const STORAGE_KEY = 'task-manager';

/** Версия схемы сохранённого состояния (для миграций при импорте). */
export const SCHEMA_VERSION = 1;

/** Цвет категории по умолчанию (пастельная лаванда). */
export const DEFAULT_CATEGORY_COLOR = '#A5B4FC';

/** Запасной цвет, если у задачи нет ни своего цвета, ни категории. */
export const FALLBACK_COLOR = '#CBD5E1';

/** Предустановленная пастельная палитра для выбора цвета задач и категорий. */
export const PALETTE: readonly string[] = [
  '#ec2c2c', // red
  '#da9751', // orange
  '#FCD34D', // amber
  '#FDE047', // yellow
  '#BEF264', // lime
  '#86EFAC', // green
  '#5EEAD4', // teal
  '#67E8F9', // cyan
  '#93C5FD', // blue
  '#A5B4FC', // indigo
  '#C4B5FD', // violet
  '#D8B4FE', // purple
  '#F9A8D4', // pink
  '#CBD5E1', // slate
];

/** Набор эмодзи для быстрого выбора. */
export const EMOJIS: readonly string[] = [
  '📝', '✅', '⭐', '🔥', '💡', '📌', '📅', '⏰', '🎯', '🚀',
  '💼', '📞', '✉️', '🏠', '🛒', '🍽️', '🏋️', '📚', '🎓', '💻',
  '🐛', '🔧', '🎨', '🎉', '❤️', '☕', '🌱', '🧹', '💰', '✈️',
  '🩺', '🎵', '🎮', '💉', '🔑', '⚙️', '📈', '🧪', '🥗', '🐶',
];
