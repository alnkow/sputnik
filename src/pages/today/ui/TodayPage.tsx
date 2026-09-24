import { TodayBoard } from '@/widgets/today-board/ui/TodayBoard';

export function TodayPage() {
  return (
    <main className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
      <TodayBoard />
    </main>
  );
}
