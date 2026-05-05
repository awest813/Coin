import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'left-1/2 -translate-x-1/2 -bottom-1 border-t-0 border-l-0',
    bottom: 'left-1/2 -translate-x-1/2 -top-1 border-b-0 border-r-0',
    left: 'top-1/2 -translate-y-1/2 -right-1 border-l-0 border-b-0',
    right: 'top-1/2 -translate-y-1/2 -left-1 border-r-0 border-t-0',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          role="tooltip"
        >
          <div className="bg-stone-900 border border-stone-700 text-stone-200 text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap max-w-xs">
            {content}
          </div>
          <div
            className={`absolute w-2 h-2 bg-stone-900 border border-stone-700 rotate-45 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}

interface InfoTooltipProps {
  content: string;
  icon?: string;
}

export function InfoTooltip({ content, icon = 'ℹ️' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position="top">
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 text-stone-500 hover:text-stone-300 transition-colors text-xs"
        aria-label="More information"
      >
        {icon}
      </button>
    </Tooltip>
  );
}