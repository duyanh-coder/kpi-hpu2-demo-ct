'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PagedTableColumn<T> {
  key: string;
  label: string;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
}

interface PagedTableProps<T> {
  columns: PagedTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  pageSizes?: number[];
  showIndex?: boolean;
  groupBy?: (row: T) => string;
  groupLabel?: (row: T) => string;
  emptyText?: string;
  className?: string;
}

type Group<T> = { label: string; rows: T[] };

export default function PagedTable<T>({
  columns,
  data,
  rowKey,
  pageSize = 10,
  pageSizes = [10, 20, 50],
  showIndex = false,
  groupBy,
  groupLabel,
  emptyText = 'Chưa có dữ liệu',
  className = '',
}: PagedTableProps<T>) {
  const [size, setSize] = useState(pageSize);
  const [page, setPage] = useState(1);

  const changeSize = (next: number) => { setSize(next); setPage(1); };

  const groups: Group<T>[] = useMemo(() => {
    if (!groupBy) return [];
    const out: Group<T>[] = [];
    for (const row of data) {
      const g = groupBy(row);
      const last = out[out.length - 1];
      if (last && last.label === g) {
        last.rows.push(row);
      } else {
        out.push({ label: groupLabel ? groupLabel(row) : g, rows: [row] });
      }
    }
    return out;
  }, [data, groupBy, groupLabel]);

  const totalRows = groups.length ? groups.reduce((n, g) => n + g.rows.length, 0) : data.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / size));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * size;

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  const pageItems = useMemo(() => {
    const total = totalPages;
    const items: (number | 'ellipsis')[] = [];
    if (total <= 7) {
      for (let p = 1; p <= total; p++) items.push(p);
      return items;
    }
    items.push(1);
    const start = Math.max(2, safePage - 1);
    const end = Math.min(total - 1, safePage + 1);
    if (start > 2) items.push('ellipsis');
    for (let p = start; p <= end; p++) items.push(p);
    if (end < total - 1) items.push('ellipsis');
    items.push(total);
    return items;
  }, [totalPages, safePage]);

  const colSpan = columns.length + (showIndex ? 1 : 0);

  const renderFlat = () => {
    const sliced = data.slice(from, from + size);
    return (
      <tbody>
        {sliced.map((row, i) => (
          <tr key={rowKey(row)}>
            {showIndex && <td>{from + i + 1}</td>}
            {columns.map(c => (
              <td key={c.key}>{c.render ? c.render(row, from + i) : String(row[c.key as keyof T] ?? '—')}</td>
            ))}
          </tr>
        ))}
        {sliced.length === 0 && (
          <tr><td colSpan={colSpan} className="text-center text-text-light text-sm py-8">{emptyText}</td></tr>
        )}
      </tbody>
    );
  };

  const renderGrouped = () => {
    const inView: { label: string; rows: T[]; startIndex: number }[] = [];
    let count = 0;
    for (const g of groups) {
      const start = count;
      const end = count + g.rows.length;
      if (end > from && start < from + size) {
        inView.push({ label: g.label, rows: g.rows, startIndex: start });
      }
      count = end;
      if (count >= from + size) break;
    }
    return (
      <tbody>
        {inView.map(gr => {
          const rows = gr.rows.filter((_, i) => {
            const abs = gr.startIndex + i;
            return abs >= from && abs < from + size;
          });
          return (
            <FragmentGroup key={gr.label} label={gr.label} colSpan={colSpan}>
              {rows.map((row, i) => (
                <tr key={rowKey(row)}>
                  {showIndex && <td>{i + 1}</td>}
                  {columns.map(c => (
                    <td key={c.key}>{c.render ? c.render(row, from + i) : String(row[c.key as keyof T] ?? '—')}</td>
                  ))}
                </tr>
              ))}
            </FragmentGroup>
          );
        })}
        {inView.length === 0 && (
          <tr><td colSpan={colSpan} className="text-center text-text-light text-sm py-8">{emptyText}</td></tr>
        )}
      </tbody>
    );
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className={`table ${className || 'table-fixed'}`}>
          <thead>
            <tr>
              {showIndex && <th className="w-[4%]">STT</th>}
              {columns.map(c => <th key={c.key} className={c.width}>{c.label}</th>)}
            </tr>
          </thead>
          {groupBy ? renderGrouped() : renderFlat()}
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-border">
        <div className="flex items-center gap-1 text-sm text-text-light">
          Hiển thị
          <select
            value={size}
            onChange={e => changeSize(Number(e.target.value))}
            className="px-2 py-1 border border-border rounded-lg text-text-dark text-sm focus:outline-none focus:border-primary"
            aria-label="Số dòng mỗi trang"
          >
            {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          trên tổng số {totalRows}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => setPage(safePage - 1)}
            className="flex h-7 min-w-7 items-center justify-center px-1 border border-border rounded-lg text-text-dark hover:bg-bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Trang trước"
          >
            <ChevronLeft size={14} />
          </button>
          {pageItems.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e${i}`} className="flex h-7 min-w-5 items-center justify-center text-sm text-text-light">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === safePage}
                className={`flex h-7 min-w-7 items-center justify-center px-1 text-sm rounded-lg border ${p === safePage ? 'border-primary bg-primary text-white font-medium' : 'border-border text-text-dark hover:bg-bg-cream'}`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => setPage(safePage + 1)}
            className="flex h-7 min-w-7 items-center justify-center px-1 border border-border rounded-lg text-text-dark hover:bg-bg-cream disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Trang sau"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FragmentGroup({ label, colSpan, children }: { label: string; colSpan: number; children: ReactNode }) {
  return (
    <>
      <tr className="bg-bg-cream">
        <td />
        <td colSpan={colSpan - 1} className="font-semibold text-primary">{label}</td>
      </tr>
      {children}
    </>
  );
}
