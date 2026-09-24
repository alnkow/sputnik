import { EventsBoard } from '@/widgets/events-board/ui/EventsBoard';

export function EventsPage() {
  return (
    <main className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
      <EventsBoard />
    </main>
  );
}
