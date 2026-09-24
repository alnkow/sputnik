import { BoardDndProvider } from '@/features/dnd/ui/BoardDndProvider';
import { CalendarBoard } from '@/widgets/calendar-board/ui/CalendarBoard';
import { TaskSidebar } from '@/widgets/task-sidebar/ui/TaskSidebar';

export function HomePage() {
  return (
    <BoardDndProvider>
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <CalendarBoard />
        </main>
        <div className="w-[34%] max-w-[460px] min-w-[320px]">
          <TaskSidebar />
        </div>
      </div>
    </BoardDndProvider>
  );
}
