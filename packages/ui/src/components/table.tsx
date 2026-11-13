"use client";

import { useMemo, useState } from "react";

import { cn } from "../cx";
import { surface } from "./display";
import { ArrowDownGlyph, ArrowUpGlyph, SortGlyph } from "./icons";

export interface TableColumn<T> {
  /** The row field it shows, and the column's id. */
  key: string;
  /** The column's heading: a short noun. */
  header: React.ReactNode;
  /** The cell; without it, the row's value at key. */
  render?: (row: T) => React.ReactNode;
  /** "end" for numbers and money, so the digits line up. */
  align?: "start" | "end";
  /** Makes the header sortable with this comparison. */
  sort?: (a: T, b: T) => number;
  /** A CSS width: "120px", "30%". */
  width?: string;
}

export interface TableProps<T> {
  /** What each column shows: { key, header, render?, align?, sort?, width? }. */
  columns: TableColumn<T>[];
  /** The rows, already filtered; sorting a column reorders them here. */
  rows: T[];
  /** A stable id for each row. */
  rowKey: (row: T) => string;
  /** Opens the row, usually in a side panel; the row gets hover and keyboard focus. */
  onRowClick?: (row: T) => void;
  /** Shown in place of the rows when there are none: an EmptyState. */
  empty?: React.ReactNode;
  /** Tighter rows for long lists. */
  dense?: boolean;
  /** Without its own border and shadow: inside a Card with padded={false}. */
  flush?: boolean;
  /** Rows whose key is here are drawn selected. */
  selected?: string[];
  /** Read by screen readers. */
  caption?: string;
  className?: string;
}

type SortState = { key: string; dir: 1 | -1 } | null;

/** Rows of the same kind of thing: orders, customers, bookings. Numbers right-aligned, statuses as Badges. */
export function Table<T>({ columns, rows, rowKey, onRowClick, empty, dense, flush, selected, caption, className }: TableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!sort || !col?.sort) return rows;
    const by = col.sort;
    return [...rows].sort((a, b) => by(a, b) * sort.dir);
  }, [rows, columns, sort]);
  const toggle = (key: string) => setSort((s) => (s?.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null));
  const edge = flush ? "first:pl-4 last:pr-4" : "first:rounded-tl-[calc(var(--radius-lg)-1px)] last:rounded-tr-[calc(var(--radius-lg)-1px)]";

  return (
    <div className={cn("w-full overflow-x-auto", !flush && surface, className)}>
      <table className="w-full border-separate border-spacing-0 text-body text-ink-2">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width }}
                  className={cn(
                    "h-8 whitespace-nowrap border-b border-line bg-surface-2 px-3 text-left text-small font-medium text-ink-3",
                    edge,
                    c.align === "end" && "text-right",
                  )}
                  aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
                >
                  {c.sort ? (
                    <button
                      type="button"
                      className={cn(
                        "-mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 hover:text-ink focus-visible:outline-2 focus-visible:outline-focus [&_svg]:opacity-60",
                        active && "text-ink [&_svg]:opacity-100",
                        c.align === "end" && "flex-row-reverse",
                      )}
                      onClick={() => toggle(c.key)}
                    >
                      {c.header}
                      {active ? sort.dir === 1 ? <ArrowUpGlyph size={13} /> : <ArrowDownGlyph size={13} /> : <SortGlyph size={13} />}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {empty ?? <p className="m-0 px-4 py-10 text-center text-label text-ink-3">Nothing here yet.</p>}
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  className={cn(
                    "[&:last-child>td]:border-b-0",
                    onRowClick &&
                      "cursor-pointer transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
                    selected?.includes(key) && "bg-surface-2",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "border-b border-line px-3 align-middle first:font-medium first:text-ink",
                        dense ? "h-8" : "h-10",
                        flush && "first:pl-4 last:pr-4",
                        c.align === "end" && "text-right tabular-nums",
                      )}
                    >
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
