import type { ReactNode } from 'react';
import type { ViewMode } from '@/shared/types';
import { useAppStore } from '@/shared/store/useAppStore';
import { EntityDialog } from '@/features/entity-dialog/ui/EntityDialog';
import { EventDialog } from '@/features/event-dialog/ui/EventDialog';
import { TopBar } from '@/widgets/top-bar/ui/TopBar';
import { CompletedModal } from '@/widgets/completed-modal/ui/CompletedModal';
import { PaymentPreviewModal } from '@/widgets/payment-preview/ui/PaymentPreviewModal';
import { PrintReport } from '@/widgets/print-report/ui/PrintReport';
import { HomePage } from '@/pages/home/ui/HomePage';
import { PaymentsPage } from '@/pages/payments/ui/PaymentsPage';
import { EventsPage } from '@/pages/events/ui/EventsPage';

const pages: Record<ViewMode, () => ReactNode> = {
  week: HomePage,
  month: HomePage,
  payments: PaymentsPage,
  events: EventsPage,
};

export function App() {
  const Page = pages[useAppStore((s) => s.ui.viewMode)];

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-100 text-slate-900 print:hidden">
        <TopBar />
        <Page />
        <EntityDialog />
        <CompletedModal />
        <PaymentPreviewModal />
        <EventDialog />
      </div>
      <PrintReport />
    </>
  );
}
