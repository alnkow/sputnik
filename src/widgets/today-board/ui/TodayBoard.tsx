import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  MONTHS_GENITIVE,
  MONTHS_NOMINATIVE,
  dayNumber,
  todayISO,
  weekdayFull,
} from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { formatAmount } from '@/shared/lib/money';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import {
  BanknoteIcon,
  CheckIcon,
  FlameIcon,
  StarIcon,
} from '@/shared/ui/icons';
import {
  buildCategoryIndex,
  resolveTaskColor,
  tasksForDate,
} from '@/entities/task/model/selectors';
import {
  isPaidInMonthOf,
  paymentsOn,
} from '@/entities/payment/model/selectors';
import { groupEventsByMonth } from '@/entities/event/model/selectors';

interface ItemProps {
  color: string;
  icon: ReactNode;
  title: string;
  subtitle?: string | null;
  badge?: ReactNode;
  muted?: boolean;
  onClick: () => void;
}

/** Строка списка: задача, платёж или событие. */
function Item({
  color,
  icon,
  title,
  subtitle,
  badge,
  muted,
  onClick,
}: ItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50',
          muted && 'opacity-60',
        )}
      >
        <span
          className="mt-0.5 h-5 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="mt-0.5 flex w-5 shrink-0 justify-center text-slate-500">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-sm font-medium text-slate-800',
              muted && 'line-through',
            )}
          >
            {title}
          </span>
          {subtitle && (
            <span className="block truncate text-xs text-slate-500">
              {subtitle}
            </span>
          )}
        </span>
        {badge}
      </button>
    </li>
  );
}

function Block({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
        {title}
        {count > 0 && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
            {count}
          </span>
        )}
      </h2>
      {count === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}
    </section>
  );
}

const PAYMENT_COLOR = '#34d399';

export function TodayBoard() {
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);
  const payments = useAppStore((s) => s.payments);
  const events = useAppStore((s) => s.events);
  const openEditTask = useUiStore((s) => s.openEditTask);
  const openPaymentPreview = useUiStore((s) => s.openPaymentPreview);
  const setEventDialog = useUiStore((s) => s.setEventDialog);

  const today = todayISO();
  const monthIndex = Number(today.slice(5, 7)) - 1;
  const day = dayNumber(today);

  const index = useMemo(() => buildCategoryIndex(categories), [categories]);
  const todayTasks = useMemo(() => tasksForDate(tasks, today), [tasks, today]);
  const todayPayments = useMemo(
    () => paymentsOn(payments, today),
    [payments, today],
  );
  const monthEvents = useMemo(
    () => groupEventsByMonth(events)[monthIndex],
    [events, monthIndex],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-end gap-5">
        <span className="text-8xl leading-none font-bold tracking-tight text-accent-600 tabular-nums">
          {day}
        </span>
        <div className="pb-2">
          <div className="text-2xl font-semibold text-slate-800">
            {weekdayFull(today)}
          </div>
          <div className="text-base text-slate-500">
            {MONTHS_NOMINATIVE[monthIndex]} {today.slice(0, 4)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Block
          title="Задачи на сегодня"
          count={todayTasks.length + todayPayments.length}
          empty="На сегодня ничего не запланировано."
        >
          {todayPayments.map((p) => {
            const paid = isPaidInMonthOf(p, today);
            return (
              <Item
                key={p.id}
                color={PAYMENT_COLOR}
                icon={
                  paid ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <BanknoteIcon className="h-4 w-4" />
                  )
                }
                title={p.title || 'Без названия'}
                subtitle={
                  p.amount === null
                    ? 'Платёж'
                    : `Платёж · ${formatAmount(p.amount)}`
                }
                muted={paid}
                onClick={() => openPaymentPreview(p.id, today)}
              />
            );
          })}
          {todayTasks.map((task) => (
            <Item
              key={task.id}
              color={resolveTaskColor(task, index)}
              icon={task.emoji ?? null}
              title={task.title}
              subtitle={
                index.get(task.categoryId ?? '')?.name ?? 'Без категории'
              }
              badge={
                task.important && (
                  <FlameIcon
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                    fill="currentColor"
                  />
                )
              }
              onClick={() => openEditTask(task.id)}
            />
          ))}
        </Block>

        <Block
          title="В этом месяце"
          count={monthEvents.length}
          empty="Событий в этом месяце нет."
        >
          {monthEvents.map((event) => (
            <Item
              key={event.id}
              color={event.color}
              icon={
                event.emoji ?? (
                  <StarIcon className="h-4 w-4" fill="currentColor" />
                )
              }
              title={event.title}
              subtitle={
                event.calendarDay === null
                  ? event.description
                  : `${event.calendarDay} ${MONTHS_GENITIVE[monthIndex]}`
              }
              badge={
                event.calendarDay === day && (
                  <span className="shrink-0 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
                    Сегодня
                  </span>
                )
              }
              onClick={() =>
                setEventDialog({ kind: 'view', id: event.id, readOnly: true })
              }
            />
          ))}
        </Block>
      </div>
    </div>
  );
}
