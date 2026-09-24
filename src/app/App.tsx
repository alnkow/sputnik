import { useAppStore } from '@/shared/store/useAppStore';
import { EntityDialog } from '@/features/entity-dialog/ui/EntityDialog';
import { TopBar } from '@/widgets/top-bar/ui/TopBar';
import { CompletedModal } from '@/widgets/completed-modal/ui/CompletedModal';
import { HomePage } from '@/pages/home/ui/HomePage';
import { PaymentsPage } from '@/pages/payments/ui/PaymentsPage';

export function App() {
  const isPayments = useAppStore((s) => s.ui.viewMode === 'payments');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <TopBar />
      {isPayments ? <PaymentsPage /> : <HomePage />}
      <EntityDialog />
      <CompletedModal />
    </div>
  );
}
