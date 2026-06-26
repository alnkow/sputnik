import { cn } from '@/shared/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer select-none items-center gap-2"
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-1',
          checked ? 'bg-accent-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
      {label && <span className="text-sm text-slate-600">{label}</span>}
    </label>
  );
}
