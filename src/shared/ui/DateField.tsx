import { CalendarXIcon } from './icons';
import { IconButton } from './IconButton';
import { Input } from './Input';

interface DateFieldProps {
  /** Дата 'YYYY-MM-DD' или null, если не назначена. */
  value: string | null;
  onChange: (value: string | null) => void;
}

/** Поле даты с кнопкой снятия назначенного дня. */
export function DateField({ value, onChange }: DateFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        aria-label="Дата"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      />
      <IconButton
        tone="danger"
        className="h-10 w-10"
        onClick={() => onChange(null)}
        disabled={value === null}
        aria-label="Убрать дату"
        title="Убрать дату"
      >
        <CalendarXIcon className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
