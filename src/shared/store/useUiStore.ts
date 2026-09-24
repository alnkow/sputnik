import { create } from 'zustand';
import type { ID } from '@/shared/types';

export type DialogState =
  | { kind: 'closed' }
  | { kind: 'create-task'; presetCategoryId: ID | null }
  | { kind: 'create-category' }
  | { kind: 'edit-task'; id: ID }
  | { kind: 'edit-category'; id: ID };

export type EventDialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  /** readOnly — карточка открыта из календаря: только просмотр. */
  | { kind: 'view'; id: ID; readOnly: boolean }
  | { kind: 'edit'; id: ID };

interface UiStore {
  dialog: DialogState;
  completedOpen: boolean;
  /** Только что созданный платёж — его строка открывается в режиме редактирования. */
  createdPaymentId: ID | null;
  /** Платёж, открытый из календаря на просмотр, и дата, на которую он выпал. */
  viewedPayment: { id: ID; iso: string } | null;
  eventDialog: EventDialogState;
  /** Запрошена печать отчёта (экспорт в PDF через диалог печати). */
  printRequested: boolean;
  openCreateTask: (presetCategoryId?: ID | null) => void;
  openCreateCategory: () => void;
  openEditTask: (id: ID) => void;
  openEditCategory: (id: ID) => void;
  closeDialog: () => void;
  openCompleted: () => void;
  closeCompleted: () => void;
  markPaymentCreated: (id: ID) => void;
  openPaymentPreview: (id: ID, iso: string) => void;
  closePaymentPreview: () => void;
  setEventDialog: (state: EventDialogState) => void;
  requestPrint: () => void;
  finishPrint: () => void;
}

/** Транзиентное состояние интерфейса (диалоги, модалки) — не сохраняется. */
export const useUiStore = create<UiStore>((set) => ({
  dialog: { kind: 'closed' },
  completedOpen: false,
  createdPaymentId: null,
  viewedPayment: null,
  eventDialog: { kind: 'closed' },
  printRequested: false,
  openCreateTask: (presetCategoryId = null) =>
    set({ dialog: { kind: 'create-task', presetCategoryId } }),
  openCreateCategory: () => set({ dialog: { kind: 'create-category' } }),
  openEditTask: (id) => set({ dialog: { kind: 'edit-task', id } }),
  openEditCategory: (id) => set({ dialog: { kind: 'edit-category', id } }),
  closeDialog: () => set({ dialog: { kind: 'closed' } }),
  openCompleted: () => set({ completedOpen: true }),
  closeCompleted: () => set({ completedOpen: false }),
  markPaymentCreated: (id) => set({ createdPaymentId: id }),
  openPaymentPreview: (id, iso) => set({ viewedPayment: { id, iso } }),
  closePaymentPreview: () => set({ viewedPayment: null }),
  setEventDialog: (eventDialog) => set({ eventDialog }),
  requestPrint: () => set({ printRequested: true }),
  finishPrint: () => set({ printRequested: false }),
}));
