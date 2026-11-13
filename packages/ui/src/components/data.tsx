"use client";

import { useState } from "react";

import { cn, focusRing, toneFill, toneSoft, toneText, type Tone } from "../cx";
import { CheckGlyph, ChevronDownGlyph, ChevronRightGlyph, CloseGlyph } from "./icons";
import { Popover } from "./popover";

// ---------- Pagination ----------

export interface PaginationProps {
  /** The page on show, from 1. */
  page: number;
  /** How many pages there are. */
  pageCount: number;
  /** Called with the page to go to. */
  onPageChange: (page: number) => void;
  /** With total and pageSize, shows "21–40 of 312" on the left. */
  total?: number;
  /** Rows on a page, for the "21–40 of 312" line. */
  pageSize?: number;
  /** What's counted, for that line: "orders". */
  noun?: string;
  className?: string;
}

function pages(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(count - 1, page + 1);
  if (from > 2) out.push("…");
  for (let p = from; p <= to; p++) out.push(p);
  if (to < count - 1) out.push("…");
  out.push(count);
  return out;
}

/** Moves through a long list a page at a time, under a Table. */
export function Pagination({ page, pageCount, onPageChange, total, pageSize, noun = "results", className }: PaginationProps) {
  const fmt = new Intl.NumberFormat();
  const btn = cn("inline-flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-2 text-label tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40", focusRing);
  return (
    <nav aria-label="Pages" className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      {total !== undefined && pageSize ? (
        <span className="text-small text-ink-3 tabular-nums">
          {fmt.format(Math.min(total, (page - 1) * pageSize + 1))}–{fmt.format(Math.min(total, page * pageSize))} of {fmt.format(total)} {noun}
        </span>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-0.5">
        <button type="button" className={cn(btn, "text-ink-2 hover:bg-surface-2")} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronRightGlyph size={15} className="rotate-180" />
        </button>
        {pages(page, pageCount).map((p, i) =>
          p === "…" ? (
            <span key={`gap${i}`} className="px-1 text-ink-4">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={cn(btn, p === page ? "bg-brand font-medium text-brand-ink" : "text-ink-2 hover:bg-surface-2")}
            >
              {p}
            </button>
          ),
        )}
        <button type="button" className={cn(btn, "text-ink-2 hover:bg-surface-2")} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRightGlyph size={15} />
        </button>
      </div>
    </nav>
  );
}

// ---------- FilterBar ----------

export interface Filter {
  /** The field it filters: "status". */
  key: string;
  /** Its name on the chip: "Status". */
  label: string;
  /** The values to pick from. */
  options: { value: string; label: string }[];
}

export interface FilterBarProps {
  /** The filters on offer, each a chip that opens its values. */
  filters: Filter[];
  /** What's picked, by filter key: { status: ["paid"] }. */
  values: Record<string, string[]>;
  /** Called with every filter's picks after one changes. */
  onValuesChange: (values: Record<string, string[]>) => void;
  /** The search text, when the bar has a search box. */
  query?: string;
  /** Called with the search text; gives the bar a search box. */
  onQueryChange?: (query: string) => void;
  /** The search box's hint: "Search customers". */
  placeholder?: string;
  /** On the right: a view switch, an export button. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Search and filters over a list, in one row above it: chips that open their
 * values, a count on each chip once something's picked, and Clear.
 */
export function FilterBar({ filters, values, onValuesChange, query, onQueryChange, placeholder = "Search", actions, className }: FilterBarProps) {
  const toggle = (key: string, v: string) => {
    const now = values[key] ?? [];
    onValuesChange({ ...values, [key]: now.includes(v) ? now.filter((x) => x !== v) : [...now, v] });
  };
  const any = Object.values(values).some((v) => v.length) || !!query;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {onQueryChange ? (
        <span className="relative flex h-8 w-full items-center rounded-md border border-line-strong bg-surface shadow-1 focus-within:border-focus focus-within:outline-1 focus-within:outline-focus @lg:w-64">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="ml-2.5 flex-none text-ink-3" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            aria-label={placeholder}
            placeholder={placeholder}
            value={query ?? ""}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-body text-ink outline-none placeholder:text-ink-4"
          />
        </span>
      ) : null}
      {filters.map((f) => {
        const picked = values[f.key] ?? [];
        return (
          <Popover
            key={f.key}
            label={`Filter by ${f.label}`}
            panelClassName="w-52 p-1"
            trigger={
              <button
                type="button"
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-label transition-colors",
                  focusRing,
                  picked.length ? "border-brand bg-brand-soft text-ink" : "border-dashed border-line-strong text-ink-2 hover:border-ink-4 hover:text-ink",
                )}
              >
                {f.label}
                {picked.length ? <span className="rounded-full bg-brand px-1.5 text-caption leading-[18px] font-medium text-brand-ink">{picked.length}</span> : null}
                <ChevronDownGlyph size={14} className="text-ink-3" />
              </button>
            }
          >
            {f.options.map((o) => {
              const on = picked.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={on}
                  onClick={() => toggle(f.key, o.value)}
                  className={cn("flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-label text-ink-2 hover:bg-surface-2 hover:text-ink", focusRing)}
                >
                  <span className={cn("grid size-4 flex-none place-items-center rounded-[4px] border", on ? "border-brand bg-brand text-brand-ink" : "border-line-strong")}>
                    {on ? <CheckGlyph size={11} /> : null}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </Popover>
        );
      })}
      {any ? (
        <button
          type="button"
          onClick={() => {
            onValuesChange(Object.fromEntries(filters.map((f) => [f.key, []])));
            onQueryChange?.("");
          }}
          className={cn("inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-label text-ink-3 hover:text-ink", focusRing)}
        >
          <CloseGlyph size={13} />
          Clear
        </button>
      ) : null}
      {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

// ---------- Timeline ----------

export interface TimelineItem {
  id: string;
  /** What happened: "Order placed", "Lucía added a note". */
  title: React.ReactNode;
  /** More about it: the note, the amount. */
  description?: React.ReactNode;
  /** When, formatted for the reader: "Today, 09:24", "3 days ago". */
  time?: string;
  /** A lucide-react icon at 14px, or an Avatar. Without one, a dot. */
  icon?: React.ReactNode;
  /** Colours the icon's ring: success for paid, danger for failed. */
  tone?: Tone;
}

export interface TimelineProps {
  /** What happened, newest first: { id, title, description?, time?, icon?, tone? }. */
  items: TimelineItem[];
  className?: string;
}

/** What happened to one thing, newest first: an order's history, a customer's activity. */
export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("m-0 flex list-none flex-col p-0", className)}>
      {items.map((it, i) => (
        <li key={it.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < items.length - 1 ? <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-7 w-px bg-line" /> : null}
          <span className={cn("relative grid size-6 flex-none place-items-center rounded-full [&_svg]:size-3.5", it.tone ? cn(toneSoft[it.tone], toneText[it.tone]) : "bg-surface-2 text-ink-3")}>
            {it.icon ?? <span className={cn("size-1.5 rounded-full", it.tone ? toneFill[it.tone] : "bg-ink-3")} />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-label font-medium text-ink">{it.title}</span>
              {it.time ? <span className="text-small tabular-nums text-ink-3">{it.time}</span> : null}
            </div>
            {it.description ? <div className="text-body text-ink-2">{it.description}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------- Charts ----------

export interface ChartPoint {
  /** The x-axis label: "Mon", "Mar". */
  label: string;
  value: number;
}

export interface BarChartProps {
  /** The bars, in order: { label, value }. */
  data: ChartPoint[];
  /** How a value is written on hover and in the labels: (v) => money.format(v). */
  format?: (value: number) => string;
  /** The bar drawn strongest: "Sat", the best day. Others are lighter. */
  highlight?: string;
  /** Pixels. */
  height?: number;
  /** Read by screen readers: what the chart shows, and its point. */
  label: string;
  className?: string;
}

/** Amounts over a few periods, side by side: sales by day, orders by month. Hover a bar for its value. */
export function BarChart({ data, format = (v) => new Intl.NumberFormat().format(v), highlight, height = 160, label, className }: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const top = Math.max(1, ...data.map((d) => d.value));
  return (
    <div role="img" aria-label={label} className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const strong = highlight ? d.label === highlight : true;
          return (
            <div key={d.label} className="relative flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {hover === i ? (
                <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-caption tabular-nums text-ground">{format(d.value)}</span>
              ) : null}
              <div
                className={cn("w-full origin-bottom rounded-t-sm bg-chart-1 transition-[opacity,height] duration-500 ease-[cubic-bezier(.16,1,.3,1)] animate-grow motion-reduce:animate-none", hover === i ? "opacity-100" : strong ? "opacity-90" : "opacity-40")}
                style={{ height: `${Math.max(2, (d.value / top) * 100)}%`, animationDelay: `${i * 40}ms` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-caption text-ink-3">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface LineChartProps {
  /** The points, in order: { label, value }. */
  data: ChartPoint[];
  /** How a value is written on hover: (v) => money.format(v). */
  format?: (value: number) => string;
  /** Pixels; a sparkline is usually 32 to 40. */
  height?: number;
  /** Read by screen readers: what the chart shows, and its point. */
  label: string;
  /** No axis labels or hover: a small trend beside a number (a sparkline). */
  bare?: boolean;
  /** The line's tone; brand by default. */
  tone?: Tone;
  className?: string;
}

/** A trend over time: visitors over a month, revenue over a year. `bare` makes a sparkline. */
export function LineChart({ data, format = (v) => new Intl.NumberFormat().format(v), height = 160, label, bare, tone = "brand", className }: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 100;
  const h = 100;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const span = max - min || 1;
  const pts = data.map((d, i) => [data.length === 1 ? w / 2 : (i / (data.length - 1)) * w, h - ((d.value - min) / span) * (h - 8) - 4] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const stroke = tone === "brand" ? "text-chart-1" : toneText[tone];
  return (
    <div role="img" aria-label={label} className={cn("relative flex flex-col gap-2", className)}>
      <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
        {/* Drawn in left to right with a clip: dashes (pathLength) break on a stretched, non-scaling stroke in Chrome. */}
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("absolute inset-0 size-full animate-reveal overflow-visible motion-reduce:animate-none", stroke)} aria-hidden="true">
          <path d={area} fill="currentColor" opacity="0.08" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth={bare ? 1.75 : 2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        {!bare
          ? data.map((d, i) => (
              <div key={d.label} className="absolute inset-y-0" style={{ left: `${(i / Math.max(1, data.length - 1)) * 100}%`, width: `${100 / data.length}%`, transform: "translateX(-50%)" }} onMouseEnter={() => setHover(i)} />
            ))
          : null}
        {!bare && hover !== null ? (
          <>
            <span className="pointer-events-none absolute inset-y-0 w-px bg-line-strong" style={{ left: `${pts[hover]![0]}%` }} />
            <span className={cn("pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-current", stroke)} style={{ left: `${pts[hover]![0]}%`, top: `${pts[hover]![1]}%` }} />
            <span className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-caption tabular-nums text-ground" style={{ left: `${pts[hover]![0]}%`, top: -22 }}>
              {data[hover]!.label}: {format(data[hover]!.value)}
            </span>
          </>
        ) : null}
      </div>
      {!bare ? (
        <div className="flex justify-between">
          {data.filter((_, i) => i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0).map((d) => (
            <span key={d.label} className="text-caption text-ink-3">
              {d.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
