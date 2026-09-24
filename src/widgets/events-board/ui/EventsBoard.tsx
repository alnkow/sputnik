import { useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import { MONTHS_NOMINATIVE } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { EventChip } from '@/entities/event/ui/EventChip';
import { groupEventsByMonth } from '@/entities/event/model/selectors';

/** Двенадцать ячеек-месяцев с событиями года. */
export function EventsBoard() {
  const events = useAppStore((s) => s.events);
  const setEventDialog = useUiStore((s) => s.setEventDialog);
  const currentMonth = new Date().getMonth() + 1;

  const byMonth = useMemo(() => groupEventsByMonth(events), [events]);

  return (
    <div className="grid h-full auto-rows-fr grid-cols-2 gap-2 p-3 md:grid-cols-3 xl:grid-cols-4">
      {MONTHS_NOMINATIVE.map((name, i) => (
        <section
          key={name}
          aria-label={name}
          className={cn(
            'flex min-h-32 flex-col overflow-hidden rounded-xl border bg-white',
            i + 1 === currentMonth ? 'border-accent-300' : 'border-slate-200',
          )}
        >
          <header
            className={cn(
              'flex items-center justify-between border-b border-slate-100 px-3 py-2',
              i + 1 === currentMonth && 'bg-accent-50',
            )}
          >
            <span className="text-sm font-semibold text-slate-700">{name}</span>
            {byMonth[i].length > 0 && (
              <span className="text-xs text-slate-400">
                {byMonth[i].length}
              </span>
            )}
          </header>
          <div className="thin-scrollbar flex-1 space-y-1.5 overflow-y-auto p-2">
            {byMonth[i].map((event) => (
              <EventChip
                key={event.id}
                event={event}
                onOpen={() =>
                  setEventDialog({
                    kind: 'view',
                    id: event.id,
                    readOnly: false,
                  })
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
