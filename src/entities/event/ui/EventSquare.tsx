import type { CalendarEvent } from '@/shared/types';
import { getReadableTextColor } from '@/shared/lib/color';
import { Tooltip } from '@/shared/ui/Tooltip';
import { StarIcon } from '@/shared/ui/icons';

interface EventSquareProps {
  event: CalendarEvent;
  onOpen: () => void;
}

/** Маленький квадрат события в ячейке дня (режим «Месяц»). Не перетаскивается. */
export function EventSquare({ event, onOpen }: EventSquareProps) {
  return (
    <Tooltip content={event.title}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={event.title}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] leading-none shadow-sm ring-1 ring-black/5"
        style={{
          backgroundColor: event.color,
          color: getReadableTextColor(event.color),
        }}
      >
        {event.emoji ?? <StarIcon className="h-3 w-3" fill="currentColor" />}
      </button>
    </Tooltip>
  );
}
