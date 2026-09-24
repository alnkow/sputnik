import type { CalendarEvent } from '@/shared/types';
import { getReadableTextColor } from '@/shared/lib/color';
import { StarIcon } from '@/shared/ui/icons';

interface EventChipProps {
  event: CalendarEvent;
  onOpen: () => void;
}

/** Чип события: в колонке дня календаря и в ячейке месяца на странице «События». */
export function EventChip({ event, onOpen }: EventChipProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={event.title}
      className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-xs shadow-sm ring-1 ring-black/5 transition-[filter] hover:brightness-95"
      style={{
        backgroundColor: event.color,
        color: getReadableTextColor(event.color),
      }}
    >
      {event.emoji ? (
        <span className="leading-none">{event.emoji}</span>
      ) : (
        <StarIcon className="h-3 w-3 shrink-0" fill="currentColor" />
      )}
      <span className="flex-1 truncate font-medium">{event.title}</span>
    </button>
  );
}
