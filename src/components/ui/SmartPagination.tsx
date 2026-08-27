'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

// ---------------------------------------------------------------------------
// Sliding-window page list
// Returns an array of page numbers and 'ellipsis' sentinel strings.
// Always shows: first page, last page, current +/- 1, and ellipses for gaps.
// ---------------------------------------------------------------------------
function buildPageWindow(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 1) return [1];

  const show = new Set<number>();
  show.add(1);
  show.add(total);
  for (let p = Math.max(1, current - 1); p <= Math.min(total, current + 1); p++) {
    show.add(p);
  }

  const sorted = Array.from(show).sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('ellipsis');
    }
    result.push(sorted[i]);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Shared visual styles
// ---------------------------------------------------------------------------
const baseBtn =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition select-none';
const activeBtn = 'border-brand-navy bg-brand-navy text-white';
const idleBtn =
  'border-slate-300 bg-white text-slate-700 hover:border-brand-navy hover:text-brand-navy dark:border-[#334155] dark:bg-[#1e293b] dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300';
const disabledBtn =
  'pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-[#334155] dark:bg-[#0f172a] dark:text-slate-600';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Client mode: fire this callback instead of navigating. */
  onPageChange?: (page: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SmartPagination({ currentPage, totalPages, onPageChange }: SmartPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const pageWindow = buildPageWindow(currentPage, totalPages);
  const isClientMode = typeof onPageChange === 'function';

  // Build a full href for server mode, preserving every existing param.
  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  }

  // Render a single page button in either mode.
  function PageButton({ page }: { page: number }) {
    const isCurrent = page === currentPage;
    const className = `${baseBtn} ${isCurrent ? activeBtn : idleBtn}`;

    if (isClientMode) {
      return (
        <button
          aria-current={isCurrent ? 'page' : undefined}
          className={className}
          disabled={isCurrent}
          onClick={() => onPageChange!(page)}
          type="button"
        >
          {page}
        </button>
      );
    }

    return (
      <Link aria-current={isCurrent ? 'page' : undefined} className={className} href={buildHref(page)}>
        {page}
      </Link>
    );
  }

  // Render Prev / Next.
  function NavButton({ direction }: { direction: 'prev' | 'next' }) {
    const isPrev = direction === 'prev';
    const targetPage = isPrev ? currentPage - 1 : currentPage + 1;
    const isDisabled = isPrev ? currentPage <= 1 : currentPage >= totalPages;
    const label = isPrev ? '← Prev' : 'Next →';
    const className = `${baseBtn} ${isDisabled ? disabledBtn : idleBtn}`;

    if (isDisabled) {
      return (
        <span aria-disabled="true" className={className}>
          {label}
        </span>
      );
    }

    if (isClientMode) {
      return (
        <button className={className} onClick={() => onPageChange!(targetPage)} type="button">
          {label}
        </button>
      );
    }

    return (
      <Link className={className} href={buildHref(targetPage)}>
        {label}
      </Link>
    );
  }

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      <NavButton direction="prev" />

      {pageWindow.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className={`${baseBtn} border-transparent text-slate-400`}>
            &hellip;
          </span>
        ) : (
          <PageButton key={item} page={item} />
        ),
      )}

      <NavButton direction="next" />
    </nav>
  );
}
