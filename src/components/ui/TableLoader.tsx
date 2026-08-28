import React from 'react';

export function TableLoader({
  label = 'Loading...',
  minHeight = '300px',
  className = '',
}: {
  label?: string;
  minHeight?: string;
  className?: string;
}) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className={`flex w-full items-center justify-center rounded-[14px] border border-slate-200 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-[#334155] dark:bg-[#1e293b] ${className}`}
      role="status"
      style={{ minHeight }}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          aria-hidden="true"
          className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>
      </div>
    </div>
  );
}
