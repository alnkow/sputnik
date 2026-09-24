import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAppStore } from '@/shared/store/useAppStore';
import { useUiStore } from '@/shared/store/useUiStore';
import { todayISO } from '@/shared/lib/date';
import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/IconButton';
import {
  DownloadIcon,
  FileTextIcon,
  SettingsIcon,
  UploadIcon,
} from '@/shared/ui/icons';
import { buildExport, downloadFile, parseImport } from '../lib/io';

function exportJson() {
  const snapshot = buildExport(useAppStore.getState());
  downloadFile(
    `task-manager-${todayISO()}.json`,
    JSON.stringify(snapshot, null, 2),
  );
}

async function importFile(file: File) {
  const result = parseImport(await file.text());
  if (!result.ok) {
    window.alert(`Не удалось импортировать: ${result.error}`);
    return;
  }
  const { categories, tasks, payments, events } = result.data;
  const confirmed = window.confirm(
    `Импортировать ${categories.length} категорий, ${tasks.length} задач, ` +
      `${payments.length} платежей и ${events.length} событий? ` +
      'Текущие данные будут заменены.',
  );
  if (confirmed) useAppStore.getState().replaceState(result.data);
}

function MenuItem({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
    >
      <span className="text-slate-400">{icon}</span>
      {children}
    </button>
  );
}

/** Шестерёнка в шапке: экспорт JSON, экспорт PDF (печать), импорт. */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestPrint = useUiStore((s) => s.requestPrint);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        aria-label="Настройки"
        title="Настройки"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn('h-8 w-8', open && 'bg-slate-200 text-slate-700')}
      >
        <SettingsIcon className="h-5 w-5" />
      </IconButton>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-1.5 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <MenuItem
            icon={<DownloadIcon className="h-4 w-4" />}
            onClick={run(exportJson)}
          >
            Экспорт
          </MenuItem>
          <MenuItem
            icon={<FileTextIcon className="h-4 w-4" />}
            onClick={run(requestPrint)}
          >
            Экспорт PDF
          </MenuItem>
          <MenuItem
            icon={<UploadIcon className="h-4 w-4" />}
            onClick={run(() => inputRef.current?.click())}
          >
            Импорт
          </MenuItem>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
