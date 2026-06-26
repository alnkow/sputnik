import { useRef } from 'react';
import { useAppStore } from '@/shared/store/useAppStore';
import { todayISO } from '@/shared/lib/date';
import { Button } from '@/shared/ui/Button';
import { DownloadIcon, UploadIcon } from '@/shared/ui/icons';
import { buildExport, downloadFile, parseImport } from '../lib/io';

export function ExportImportButtons() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const { categories, tasks, ui } = useAppStore.getState();
    const snapshot = buildExport(categories, tasks, ui);
    downloadFile(
      `task-manager-${todayISO()}.json`,
      JSON.stringify(snapshot, null, 2),
    );
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const result = parseImport(text);
    if (!result.ok) {
      window.alert(`Не удалось импортировать: ${result.error}`);
      return;
    }
    const { categories, tasks } = result.data;
    const confirmed = window.confirm(
      `Импортировать ${categories.length} категорий и ${tasks.length} задач? ` +
        'Текущие данные будут заменены.',
    );
    if (confirmed) {
      useAppStore.getState().replaceState(result.data);
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleExport}>
        <DownloadIcon className="h-4 w-4" />
        Экспорт
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon className="h-4 w-4" />
        Импорт
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </>
  );
}
