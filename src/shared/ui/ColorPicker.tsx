import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { PALETTE } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`Цвет ${color}`}
            onClick={() => onChange(color)}
            className={cn(
              'h-7 w-7 rounded-full transition-transform hover:scale-110',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-400',
              value.toLowerCase() === color.toLowerCase() &&
                'ring-2 ring-slate-800 ring-offset-2',
            )}
            style={{ backgroundColor: color }}
          />
        ))}
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className={cn(
            'flex h-7 items-center rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600',
            'hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
            customOpen && 'bg-slate-100',
          )}
        >
          Свой цвет
        </button>
      </div>

      {customOpen && (
        <div className="flex items-center gap-3">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="space-y-1">
            <div
              className="h-9 w-9 rounded-lg border border-slate-200"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs text-slate-500 uppercase">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
}
