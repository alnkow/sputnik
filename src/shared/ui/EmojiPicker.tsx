import { EMOJIS } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

interface EmojiPickerProps {
  value: string | null;
  onChange: (emoji: string | null) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md text-xs text-slate-500',
          'hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
          value === null && 'bg-slate-200 ring-1 ring-slate-300',
        )}
        title="Без эмодзи"
      >
        ✕
      </button>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-lg',
            'hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
            value === emoji && 'bg-accent-100 ring-1 ring-accent-300',
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
