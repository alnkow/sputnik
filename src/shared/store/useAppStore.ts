import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CalendarEvent,
  Category,
  ID,
  Payment,
  PersistedState,
  Task,
  UiState,
  ViewMode,
} from '@/shared/types';
import { SCHEMA_VERSION, STORAGE_KEY } from '@/shared/config/constants';
import { createId } from '@/shared/lib/id';
import { addDays, addMonths, todayISO } from '@/shared/lib/date';

interface AppState {
  categories: Category[];
  tasks: Task[];
  payments: Payment[];
  events: CalendarEvent[];
  ui: UiState;
}

interface AppActions {
  // --- категории ---
  addCategory: (input: { name: string; color: string }) => ID;
  updateCategory: (
    id: ID,
    patch: Partial<Pick<Category, 'name' | 'color'>>,
  ) => void;
  /** Удаляет категорию только если в ней нет задач. Возвращает успех. */
  deleteCategory: (id: ID) => boolean;
  toggleCategoryCollapsed: (id: ID) => void;
  reorderCategories: (activeId: ID, overId: ID) => void;

  // --- задачи ---
  addTask: (input: {
    title: string;
    categoryId: ID | null;
    color: string | null;
    emoji: string | null;
    description: string | null;
  }) => ID;
  updateTask: (
    id: ID,
    patch: Partial<
      Pick<
        Task,
        | 'title'
        | 'categoryId'
        | 'color'
        | 'emoji'
        | 'description'
        | 'scheduledDate'
      >
    >,
  ) => void;
  deleteTask: (id: ID) => void;
  toggleImportant: (id: ID) => void;
  setCompleted: (id: ID, completed: boolean) => void;
  scheduleTask: (id: ID, date: string) => void;
  unscheduleTask: (id: ID) => void;
  /** Перемещает/переупорядочивает задачу в правой панели. */
  moveTask: (
    activeId: ID,
    over: { kind: 'task'; id: ID } | { kind: 'category'; id: ID | null },
  ) => void;

  // --- платежи ---
  addPayment: () => ID;
  updatePayment: (
    id: ID,
    patch: Partial<Pick<Payment, 'title' | 'amount' | 'dueDay' | 'notes'>>,
  ) => void;
  deletePayment: (id: ID) => void;
  setPaymentPaid: (id: ID, paid: boolean) => void;
  /** Снимает отметку «Оплачено» со всех платежей. */
  resetPaymentsPaid: () => void;
  reorderPayments: (activeId: ID, overId: ID) => void;

  // --- события ---
  addEvent: (input: Omit<CalendarEvent, 'id'>) => ID;
  updateEvent: (id: ID, patch: Partial<Omit<CalendarEvent, 'id'>>) => void;
  deleteEvent: (id: ID) => void;

  // --- интерфейс / навигация ---
  setViewMode: (mode: ViewMode) => void;
  setAnchorDate: (iso: string) => void;
  goToday: () => void;
  step: (dir: -1 | 1) => void;
  toggleImportantOnly: () => void;

  // --- импорт ---
  replaceState: (next: PersistedState) => void;
}

export type AppStore = AppState & AppActions;

/** Страница, с которой всегда открывается приложение. */
const START_VIEW: ViewMode = 'today';

const initialUi: UiState = {
  viewMode: START_VIEW,
  anchorDate: todayISO(),
  importantOnly: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      categories: [],
      tasks: [],
      payments: [],
      events: [],
      ui: initialUi,

      // --- категории ---
      addCategory: ({ name, color }) => {
        const category: Category = {
          id: createId(),
          name: name.trim(),
          color,
          collapsed: false,
        };
        set((state) => ({ categories: [...state.categories, category] }));
        return category.id;
      },

      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id
              ? { ...c, ...patch, name: patch.name?.trim() ?? c.name }
              : c,
          ),
        })),

      deleteCategory: (id) => {
        const hasTasks = get().tasks.some((t) => t.categoryId === id);
        if (hasTasks) return false;
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        return true;
      },

      toggleCategoryCollapsed: (id) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, collapsed: !c.collapsed } : c,
          ),
        })),

      reorderCategories: (activeId, overId) =>
        set((state) => {
          const from = state.categories.findIndex((c) => c.id === activeId);
          const to = state.categories.findIndex((c) => c.id === overId);
          if (from === -1 || to === -1 || from === to) return {};
          const next = [...state.categories];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { categories: next };
        }),

      // --- задачи ---
      addTask: ({ title, categoryId, color, emoji, description }) => {
        const task: Task = {
          id: createId(),
          title: title.trim(),
          categoryId,
          color,
          emoji,
          description,
          important: false,
          completed: false,
          completedAt: null,
          scheduledDate: null,
          createdAt: Date.now(),
        };
        set((state) => ({ tasks: [...state.tasks, task] }));
        return task.id;
      },

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...patch, title: patch.title?.trim() ?? t.title }
              : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      toggleImportant: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, important: !t.important } : t,
          ),
        })),

      setCompleted: (id, completed) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, completed, completedAt: completed ? Date.now() : null }
              : t,
          ),
        })),

      scheduleTask: (id, date) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, scheduledDate: date } : t,
          ),
        })),

      unscheduleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, scheduledDate: null } : t,
          ),
        })),

      moveTask: (activeId, over) =>
        set((state) => {
          const tasks = [...state.tasks];
          const fromIndex = tasks.findIndex((t) => t.id === activeId);
          if (fromIndex === -1) return {};
          const moving = { ...tasks[fromIndex] };

          if (over.kind === 'task') {
            if (over.id === activeId) return {};
            const targetCategory =
              tasks.find((t) => t.id === over.id)?.categoryId ?? null;
            moving.categoryId = targetCategory;
            const overIndex = tasks.findIndex((t) => t.id === over.id);
            if (overIndex === -1) return {};
            tasks.splice(fromIndex, 1);
            tasks.splice(overIndex, 0, moving);
          } else {
            moving.categoryId = over.id;
            tasks.splice(fromIndex, 1);
            let insertAt = tasks.length;
            for (let i = tasks.length - 1; i >= 0; i--) {
              if (tasks[i].categoryId === over.id) {
                insertAt = i + 1;
                break;
              }
            }
            tasks.splice(insertAt, 0, moving);
          }
          return { tasks };
        }),

      // --- платежи ---
      addPayment: () => {
        const payment: Payment = {
          id: createId(),
          title: '',
          amount: null,
          dueDay: null,
          notes: '',
          paid: false,
          paidAt: null,
        };
        set((state) => ({ payments: [...state.payments, payment] }));
        return payment.id;
      },

      updatePayment: (id, patch) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),

      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),

      setPaymentPaid: (id, paid) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id
              ? { ...p, paid, paidAt: paid ? Date.now() : null }
              : p,
          ),
        })),

      resetPaymentsPaid: () =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.paid ? { ...p, paid: false, paidAt: null } : p,
          ),
        })),

      reorderPayments: (activeId, overId) =>
        set((state) => {
          const from = state.payments.findIndex((p) => p.id === activeId);
          const to = state.payments.findIndex((p) => p.id === overId);
          if (from === -1 || to === -1 || from === to) return {};
          const next = [...state.payments];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { payments: next };
        }),

      // --- события ---
      addEvent: (input) => {
        const event: CalendarEvent = {
          ...input,
          id: createId(),
          title: input.title.trim(),
        };
        set((state) => ({ events: [...state.events, event] }));
        return event.id;
      },

      updateEvent: (id, patch) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id
              ? { ...e, ...patch, title: patch.title?.trim() ?? e.title }
              : e,
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      // --- интерфейс / навигация ---
      setViewMode: (mode) =>
        set((state) => ({ ui: { ...state.ui, viewMode: mode } })),

      setAnchorDate: (iso) =>
        set((state) => ({ ui: { ...state.ui, anchorDate: iso } })),

      goToday: () =>
        set((state) => ({ ui: { ...state.ui, anchorDate: todayISO() } })),

      step: (dir) =>
        set((state) => {
          const { viewMode, anchorDate } = state.ui;
          if (viewMode !== 'week' && viewMode !== 'month') return {};
          const nextAnchor =
            viewMode === 'week'
              ? addDays(anchorDate, 7 * dir)
              : addMonths(anchorDate, dir);
          return { ui: { ...state.ui, anchorDate: nextAnchor } };
        }),

      toggleImportantOnly: () =>
        set((state) => ({
          ui: { ...state.ui, importantOnly: !state.ui.importantOnly },
        })),

      // --- импорт ---
      replaceState: (next) =>
        set({
          categories: next.categories,
          tasks: next.tasks,
          payments: next.payments,
          events: next.events,
          ui: next.ui,
        }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      // Приложение всегда открывается на «Сегодня», остальное — из хранилища.
      merge: (persisted, current) => {
        const saved = persisted as Partial<AppState> | undefined;
        return {
          ...current,
          ...saved,
          ui: { ...current.ui, ...saved?.ui, viewMode: START_VIEW },
        };
      },
      partialize: (state) => ({
        categories: state.categories,
        tasks: state.tasks,
        payments: state.payments,
        events: state.events,
        ui: state.ui,
      }),
    },
  ),
);
