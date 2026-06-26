import { BoardDndProvider } from '@/features/dnd/ui/BoardDndProvider';
import { EntityDialog } from '@/features/entity-dialog/ui/EntityDialog';
import { TopBar } from '@/widgets/top-bar/ui/TopBar';
import { CalendarBoard } from '@/widgets/calendar-board/ui/CalendarBoard';
import { TaskSidebar } from '@/widgets/task-sidebar/ui/TaskSidebar';
import { CompletedModal } from '@/widgets/completed-modal/ui/CompletedModal';

export function HomePage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <TopBar />
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
      <EntityDialog />
      <CompletedModal />
    </div>
  );
}
