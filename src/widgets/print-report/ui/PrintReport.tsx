import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CalendarEvent, Category, Payment, Task } from '@/shared/types';
import {
  MONTHS_GENITIVE,
  MONTHS_NOMINATIVE,
  formatFullDate,
  todayISO,
} from '@/shared/lib/date';
import { formatAmount } from '@/shared/lib/money';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { FALLBACK_COLOR } from '@/shared/config/constants';
import {
  buildCategoryIndex,
  completedTasks,
  groupActiveTasks,
} from '@/entities/task/model/selectors';
import { getPaymentTotals } from '@/entities/payment/model/selectors';
import { groupEventsByMonth } from '@/entities/event/model/selectors';

const formatTimestamp = (ms: number) =>
  new Date(ms).toLocaleDateString('ru-RU');

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 border-b-2 border-slate-800 pb-1 text-lg font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500 italic">{children}</p>;
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function TaskItem({ task, meta }: { task: Task; meta: string[] }) {
  return (
    <li className="break-inside-avoid border-b border-slate-200 py-1.5 last:border-b-0">
      <div className="font-medium">
        {task.emoji && `${task.emoji} `}
        {task.title}
        {task.important && ' 🔥'}
      </div>
      {meta.length > 0 && (
        <div className="text-xs text-slate-500">{meta.join(' · ')}</div>
      )}
      {task.description && (
        <p className="mt-0.5 text-sm whitespace-pre-wrap text-slate-600">
          {task.description}
        </p>
      )}
    </li>
  );
}

function TaskGroup({
  title,
  color,
  tasks,
}: {
  title: string;
  color: string;
  tasks: Task[];
}) {
  return (
    <div className="mb-4">
      <h3 className="flex break-after-avoid items-center gap-2 text-base font-semibold">
        <Dot color={color} />
        {title}
        <span className="text-sm font-normal text-slate-500">
          ({tasks.length})
        </span>
      </h3>
      <ul className="mt-1 pl-4.5">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            meta={
              task.scheduledDate
                ? [`Дата: ${formatFullDate(task.scheduledDate)}`]
                : []
            }
          />
        ))}
      </ul>
    </div>
  );
}

function TasksSection({
  categories,
  tasks,
}: {
  categories: Category[];
  tasks: Task[];
}) {
  const index = buildCategoryIndex(categories);
  const groups = groupActiveTasks(tasks, categories, false).filter(
    (g) => g.tasks.length > 0,
  );
  const completed = completedTasks(tasks);

  return (
    <>
      <Section title="Задачи">
        {groups.length === 0 && <Empty>Активных задач нет.</Empty>}
        {groups.map(({ category, tasks: groupTasks }) => (
          <TaskGroup
            key={category?.id ?? 'none'}
            title={category?.name ?? 'Без категории'}
            color={category?.color ?? FALLBACK_COLOR}
            tasks={groupTasks}
          />
        ))}
      </Section>

      {completed.length > 0 && (
        <Section title="Выполненные задачи">
          <ul>
            {completed.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                meta={[
                  index.get(task.categoryId ?? '')?.name ?? 'Без категории',
                  ...(task.completedAt
                    ? [`Выполнено ${formatTimestamp(task.completedAt)}`]
                    : []),
                ]}
              />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

function PaymentsSection({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <Section title="Платежи">
        <Empty>Платежей нет.</Empty>
      </Section>
    );
  }
  const totals = getPaymentTotals(payments);
  const cell = 'border-b border-slate-200 px-2 py-1.5 align-top';

  return (
    <Section title="Платежи">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase">
            <th className={cell}>Название</th>
            <th className={`${cell} text-right`}>Сумма</th>
            <th className={cell}>Дата</th>
            <th className={cell}>Заметки</th>
            <th className={cell}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="break-inside-avoid">
              <td className={`${cell} font-medium`}>
                {p.title || 'Без названия'}
              </td>
              <td
                className={`${cell} text-right whitespace-nowrap tabular-nums`}
              >
                {p.amount === null ? '—' : formatAmount(p.amount)}
              </td>
              <td className={`${cell} whitespace-nowrap`}>
                {p.dueDay === null ? '—' : `${p.dueDay} число`}
              </td>
              <td className={`${cell} text-slate-600`}>{p.notes || '—'}</td>
              <td className={`${cell} whitespace-nowrap`}>
                {p.paid && p.paidAt !== null
                  ? `Оплачено ${formatTimestamp(p.paidAt)}`
                  : 'Не оплачено'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold">
            <td className="px-2 py-1.5">Итого</td>
            <td className="px-2 py-1.5 text-right tabular-nums">
              {formatAmount(totals.total)}
            </td>
            <td colSpan={3} className="px-2 py-1.5 font-normal text-slate-600">
              Осталось оплатить:{' '}
              <span className="font-semibold text-slate-900">
                {formatAmount(totals.unpaid)}
              </span>{' '}
              · оплачено {totals.paidCount} из {payments.length}
            </td>
          </tr>
        </tfoot>
      </table>
    </Section>
  );
}

function EventsSection({ events }: { events: CalendarEvent[] }) {
  const byMonth = groupEventsByMonth(events);
  const months = MONTHS_NOMINATIVE.map((name, i) => ({
    name,
    events: byMonth[i],
  })).filter((m) => m.events.length > 0);

  return (
    <Section title="События">
      {months.length === 0 && <Empty>Событий нет.</Empty>}
      {months.map((m) => (
        <div key={m.name} className="mb-4">
          <h3 className="break-after-avoid text-base font-semibold">
            {m.name}
          </h3>
          <ul className="mt-1">
            {m.events.map((e) => (
              <li
                key={e.id}
                className="flex break-inside-avoid gap-2 border-b border-slate-200 py-1.5 last:border-b-0"
              >
                <span className="mt-1.5">
                  <Dot color={e.color} />
                </span>
                <div>
                  <div className="font-medium">
                    {e.emoji && `${e.emoji} `}
                    {e.title}
                  </div>
                  {e.calendarDay !== null && (
                    <div className="text-xs text-slate-500">
                      В календаре: {e.calendarDay}{' '}
                      {MONTHS_GENITIVE[e.month - 1]}
                    </div>
                  )}
                  {e.description && (
                    <p className="mt-0.5 text-sm whitespace-pre-wrap text-slate-600">
                      {e.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  );
}

/** Содержимое отчёта: задачи по категориям, выполненные, платежи, события. */
export function ReportContent() {
  const categories = useAppStore((s) => s.categories);
  const tasks = useAppStore((s) => s.tasks);
  const payments = useAppStore((s) => s.payments);
  const events = useAppStore((s) => s.events);

  return (
    <article className="text-slate-900">
      <header className="border-b border-slate-300 pb-3">
        <h1 className="text-2xl font-bold">Sputnik — выгрузка данных</h1>
        <p className="text-sm text-slate-500">{formatFullDate(todayISO())}</p>
      </header>
      <TasksSection categories={categories} tasks={tasks} />
      <PaymentsSection payments={payments} />
      <EventsSection events={events} />
    </article>
  );
}

/**
 * Экспорт в PDF через печать браузера: отчёт монтируется только по запросу,
 * на экране скрыт, при печати выводится вместо приложения.
 */
export function PrintReport() {
  const printRequested = useUiStore((s) => s.printRequested);
  const finishPrint = useUiStore((s) => s.finishPrint);

  useEffect(() => {
    if (!printRequested) return;
    // Заголовок документа браузер предлагает как имя PDF-файла.
    const previousTitle = document.title;
    document.title = `Sputnik — ${todayISO()}`;
    window.print();
    document.title = previousTitle;
    finishPrint();
  }, [printRequested, finishPrint]);

  if (!printRequested) return null;
  return (
    <div className="hidden print:block">
      <ReportContent />
    </div>
  );
}
