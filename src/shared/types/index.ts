export type ID = string;

export type ViewMode = 'today' | 'week' | 'month' | 'payments' | 'events';

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
  /** доп. описание задачи или null */
  description: string | null;
  important: boolean;
  completed: boolean;
  completedAt: number | null;
  /** 'YYYY-MM-DD' или null (не размещена в календаре) */
  scheduledDate: string | null;
  createdAt: number;
}

/** Ежемесячный платёж. Порядок = порядок в массиве. */
export interface Payment {
  id: ID;
  title: string;
  /** сумма или null, если не указана */
  amount: number | null;
  /** число месяца (1–31) или null */
  dueDay: number | null;
  notes: string;
  paid: boolean;
  /** момент отметки об оплате (ms) или null */
  paidAt: number | null;
}

/** Ежегодное событие, привязанное к месяцу (например, день рождения, отпуск). */
export interface CalendarEvent {
  id: ID;
  title: string;
  description: string | null;
  /** месяц 1–12 */
  month: number;
  /** hex-цвет */
  color: string;
  /** эмодзи-иконка или null */
  emoji: string | null;
  /** число месяца (1–31) для показа в календаре; null — не показывать */
  calendarDay: number | null;
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
  payments: Payment[];
  events: CalendarEvent[];
  ui: UiState;
}
