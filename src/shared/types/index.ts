export type ID = string;

export type ViewMode = 'week' | 'month';

export interface Category {
  id: ID;
  name: string;
  /** hex-цвет, например '#6366f1' */
  color: string;
  /** свёрнута ли категория в правой панели */
  collapsed: boolean;
}

export interface Task {
  id: ID;
  title: string;
  /** null => служебная секция «Без категории» */
  categoryId: ID | null;
  /** null => наследует цвет категории */
  color: string | null;
  /** эмодзи задачи или null */
  emoji: string | null;
  important: boolean;
  completed: boolean;
  completedAt: number | null;
  /** 'YYYY-MM-DD' или null (не размещена в календаре) */
  scheduledDate: string | null;
  createdAt: number;
}

export interface UiState {
  viewMode: ViewMode;
  /** 'YYYY-MM-DD' — определяет текущую отображаемую неделю/месяц */
  anchorDate: string;
  /** фильтр правой панели — показывать только важные */
  importantOnly: boolean;
}

/** Снимок состояния, который сохраняется в localStorage и используется для экспорта/импорта. */
export interface PersistedState {
  version: number;
  categories: Category[];
  tasks: Task[];
  ui: UiState;
}
