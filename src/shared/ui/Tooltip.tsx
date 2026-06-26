import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

interface Position {
  top: number;
  left: number;
}

const GAP = 6;
const MAX_WIDTH = 220;
const VIEWPORT_PADDING = 8;

/** Тултип через портал в `body`, чтобы не обрезаться родителями с `overflow-hidden`. */
export function Tooltip({ content, children }: TooltipProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const updatePosition = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const left = Math.min(
      Math.max(rect.left + rect.width / 2, VIEWPORT_PADDING + MAX_WIDTH / 2),
      window.innerWidth - VIEWPORT_PADDING - MAX_WIDTH / 2,
    );

    setPosition({ top: rect.top - GAP, left });
  };

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex"
      onMouseEnter={updatePosition}
      onMouseLeave={() => setPosition(null)}
      onFocus={updatePosition}
      onBlur={() => setPosition(null)}
    >
      {children}
      {position &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-50 max-w-[220px] -translate-x-1/2 -translate-y-full rounded-md bg-slate-800 px-2 py-1 text-xs leading-snug whitespace-normal break-words text-white shadow-lg"
            style={{ top: position.top, left: position.left }}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
