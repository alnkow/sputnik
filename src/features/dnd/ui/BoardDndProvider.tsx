import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  CollisionDetection,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Category, Task } from '@/shared/types';
import { getReadableTextColor } from '@/shared/lib/color';
import type { DragId } from '@/shared/lib/dnd';
import { parseDndId } from '@/shared/lib/dnd';

const byType =
  (...types: DragId['type'][]) =>
  (container: { id: string | number }): boolean => {
    const parsed = parseDndId(container.id);
    return parsed ? types.includes(parsed.type) : false;
  };

/**
 * Задача из календаря: приоритет у дня под курсором; над календарём, но мимо
 * дня — область календаря (дата не меняется); вне календаря — пусто (дата
 * снимается). С клавиатуры курсора нет — берём ближайший день.
 */
const calendarTaskCollision: CollisionDetection = (args) => {
  const days = args.droppableContainers.filter(byType('day'));
  if (!args.pointerCoordinates) {
    return closestCenter({ ...args, droppableContainers: days });
  }
  const overDay = pointerWithin({ ...args, droppableContainers: days });
  if (overDay.length > 0) return overDay;
  return pointerWithin({
    ...args,
    droppableContainers: args.droppableContainers.filter(byType('calendar')),
  });
};

/**
 * Разводит столкновения по типу перетаскиваемого: категория — только среди
 * категорий; задача из панели — задачи, контейнеры категорий и дни;
 * задача из календаря — см. calendarTaskCollision.
 */
const collisionDetection: CollisionDetection = (args) => {
  const active = parseDndId(args.active.id);

  if (active?.type === 'calendar-task') return calendarTaskCollision(args);

  if (active?.type === 'category') {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(byType('category')),
    });
  }

  const droppableContainers = args.droppableContainers.filter(
    byType('sidebar-task', 'category-drop', 'day'),
  );
  const pointerCollisions = pointerWithin({ ...args, droppableContainers });
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter({ ...args, droppableContainers });
};
import { useAppStore } from '@/shared/store/useAppStore';
import {
  buildCategoryIndex,
  resolveTaskColor,
} from '@/entities/task/model/selectors';

type ActiveDrag =
  | { kind: 'task'; task: Task; color: string; variant: 'chip' | 'square' }
  | { kind: 'category'; category: Category };

interface BoardDndProviderProps {
  children: ReactNode;
}

/** Единый DndContext: реордеринг списков, перенос между категориями, дроп на дни. */
export function BoardDndProvider({ children }: BoardDndProviderProps) {
  const [active, setActive] = useState<ActiveDrag | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const parsed = parseDndId(event.active.id);
    if (!parsed) return;
    const state = useAppStore.getState();

    if (parsed.type === 'category') {
      const category = state.categories.find((c) => c.id === parsed.id);
      if (category) setActive({ kind: 'category', category });
      return;
    }
    if (parsed.type === 'sidebar-task' || parsed.type === 'calendar-task') {
      const task = state.tasks.find((t) => t.id === parsed.id);
      if (task) {
        const color = resolveTaskColor(
          task,
          buildCategoryIndex(state.categories),
        );
        const variant =
          event.active.data.current?.variant === 'square'
            ? 'square'
            : 'chip';
        setActive({ kind: 'task', task, color, variant });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActive(null);
    const a = parseDndId(event.active.id);
    const o = event.over ? parseDndId(event.over.id) : null;
    if (!a) return;
    const store = useAppStore.getState();

    if (a.type === 'category') {
      if (o?.type === 'category' && o.id !== a.id) {
        store.reorderCategories(a.id, o.id);
      }
      return;
    }

    if (a.type === 'sidebar-task') {
      if (!o) return;
      if (o.type === 'day') store.scheduleTask(a.id, o.iso);
      else if (o.type === 'sidebar-task')
        store.moveTask(a.id, { kind: 'task', id: o.id });
      else if (o.type === 'category-drop')
        store.moveTask(a.id, { kind: 'category', id: o.id });
      return;
    }

    if (a.type === 'calendar-task') {
      if (o?.type === 'day') store.scheduleTask(a.id, o.iso);
      else if (!o) store.unscheduleTask(a.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActive(null)}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {active?.kind === 'task' && active.variant === 'square' && (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-[4px] text-[10px] leading-none shadow-lg ring-1 ring-black/5"
            style={{
              backgroundColor: active.color,
              color: getReadableTextColor(active.color),
            }}
          >
            {active.task.emoji ?? (active.task.important ? '🔥' : '')}
          </div>
        )}
        {active?.kind === 'task' && active.variant === 'chip' && (
          <div
            className="flex max-w-40 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium shadow-lg"
            style={{
              backgroundColor: active.color,
              color: getReadableTextColor(active.color),
            }}
          >
            {active.task.emoji && <span>{active.task.emoji}</span>}
            <span className="min-w-0 flex-1 truncate">
              {active.task.title}
            </span>
          </div>
        )}
        {active?.kind === 'category' && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-lg">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: active.category.color }}
            />
            {active.category.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
