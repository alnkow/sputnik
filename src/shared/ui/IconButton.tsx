import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Подсветка активного состояния (например, включённого «огонька»). */
  active?: boolean;
  /** Цветовой акцент при наведении. */
  tone?: 'default' | 'danger' | 'amber' | 'green';
}

const toneClasses: Record<NonNullable<IconButtonProps['tone']>, string> = {
  default: 'hover:bg-slate-200 hover:text-slate-700',
  danger: 'hover:bg-red-100 hover:text-red-600',
  amber: 'hover:bg-amber-100 hover:text-amber-600',
  green: 'hover:bg-green-100 hover:text-green-600',
};

export function IconButton({
  children,
  active = false,
  tone = 'default',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
        'disabled:cursor-not-allowed disabled:opacity-40',
        toneClasses[tone],
        active && 'text-amber-500',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
