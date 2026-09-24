import type { ID } from '@/shared/types';

/**
 * Идентификаторы drag-and-drop элементов префиксуются по типу, чтобы один
 * DndContext мог различать цели: карточки в правой панели, чипы в календаре,
 * категории, контейнеры категорий, ячейки дней и область календаря целиком.
 */
export type DragId =
  | { type: 'sidebar-task'; id: ID }
  | { type: 'calendar-task'; id: ID }
  | { type: 'category'; id: ID }
  | { type: 'category-drop'; id: ID | null }
  | { type: 'day'; iso: string }
  | { type: 'calendar' };

const NONE = 'none';

export const dndId = {
  sidebarTask: (id: ID) => `sidebar-task:${id}`,
  calendarTask: (id: ID) => `calendar-task:${id}`,
  category: (id: ID) => `category:${id}`,
  categoryDrop: (id: ID | null) => `category-drop:${id ?? NONE}`,
  day: (iso: string) => `day:${iso}`,
  calendar: () => 'calendar:board',
};

export function parseDndId(raw: string | number): DragId | null {
  const value = String(raw);
  const sep = value.indexOf(':');
  if (sep === -1) return null;
  const prefix = value.slice(0, sep);
  const rest = value.slice(sep + 1);

  switch (prefix) {
    case 'sidebar-task':
      return { type: 'sidebar-task', id: rest };
    case 'calendar-task':
      return { type: 'calendar-task', id: rest };
    case 'category':
      return { type: 'category', id: rest };
    case 'category-drop':
      return { type: 'category-drop', id: rest === NONE ? null : rest };
    case 'day':
      return { type: 'day', iso: rest };
    case 'calendar':
      return { type: 'calendar' };
    default:
      return null;
  }
}
