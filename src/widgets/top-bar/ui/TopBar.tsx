import type { ViewMode } from '@/shared/types';
import { cn } from '@/shared/lib/cn';
import { formatMonthYear, formatWeekRange } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { Logo } from '@/shared/ui/Logo';
import {
  BanknoteIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ColumnsIcon,
  GridIcon,
  PlusIcon,
} from '@/shared/ui/icons';
import { ExportImportButtons } from '@/features/export-import/ui/ExportImportButtons';

const modes: { value: ViewMode; label: string; icon: typeof GridIcon }[] = [
  { value: 'week', label: 'Неделя', icon: ColumnsIcon },
  { value: 'month', label: 'Месяц', icon: GridIcon },
  { value: 'payments', label: 'Платежи', icon: BanknoteIcon },
];

export function TopBar() {
  const viewMode = useAppStore((s) => s.ui.viewMode);
  const anchorDate = useAppStore((s) => s.ui.anchorDate);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const step = useAppStore((s) => s.step);
  const goToday = useAppStore((s) => s.goToday);
  const openCreateTask = useUiStore((s) => s.openCreateTask);
  const openCompleted = useUiStore((s) => s.openCompleted);
  const markPaymentCreated = useUiStore((s) => s.markPaymentCreated);
  const addPayment = useAppStore((s) => s.addPayment);

  const isCalendar = viewMode !== 'payments';
  const periodLabel =
    viewMode === 'week'
      ? formatWeekRange(anchorDate)
      : formatMonthYear(anchorDate);

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-white px-4 py-2.5">
      <h1 className="flex items-center gap-2">
        <Logo className="h-7 w-7 text-red-700" />
        <span className="font-soviet text-2xl tracking-wide text-red-700">
          Sputnik
        </span>
      </h1>

      <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
        {modes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setViewMode(value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === value
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {isCalendar && (
        <>
          <div className="flex items-center gap-1">
            <IconButton
              onClick={() => step(-1)}
              aria-label="Назад"
              title="Назад"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </IconButton>
            <Button size="sm" variant="secondary" onClick={goToday}>
              Сегодня
            </Button>
            <IconButton
              onClick={() => step(1)}
              aria-label="Вперёд"
              title="Вперёд"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </IconButton>
          </div>

          <span className="min-w-40 text-sm font-medium text-slate-600 capitalize">
            {periodLabel}
          </span>
        </>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            isCalendar
              ? openCreateTask(null)
              : markPaymentCreated(addPayment())
          }
        >
          <PlusIcon className="h-4 w-4" />
          Создать
        </Button>
        <Button variant="secondary" size="sm" onClick={openCompleted}>
          <CheckCircleIcon className="h-4 w-4" />
          Выполненные
        </Button>
        <ExportImportButtons />
      </div>
    </header>
  );
}
