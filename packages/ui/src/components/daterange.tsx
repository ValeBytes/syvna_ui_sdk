"use client";

// DateRangePicker: a field for a period, for reports and filters. Presets on
// the left (Last 7 days, This quarter…), two months to pick from, and Apply,
// so a half-picked range never reaches the report.

import { useMemo, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { ChevronRightGlyph } from "./icons";
import { fieldBox, type FieldSize, type FieldVariant } from "./inputs";
import { floatingPanel, useDismiss } from "./popover";
import { Button } from "./button";

export type DateRange = { from: Date; to: Date };

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const add = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysBetween = (a: Date, b: Date) => Math.round((day0(b).getTime() - day0(a).getTime()) / 86400000) + 1;

export interface RangePreset {
  label: string;
  range: () => DateRange;
}

/** The presets reports need, measured from today. */
export function rangePresets(today = day0(new Date())): RangePreset[] {
  const y = today.getFullYear();
  const m = today.getMonth();
  const q = Math.floor(m / 3) * 3;
  return [
    { label: "Today", range: () => ({ from: today, to: today }) },
    { label: "Yesterday", range: () => ({ from: add(today, -1), to: add(today, -1) }) },
    { label: "Last 7 days", range: () => ({ from: add(today, -6), to: today }) },
    { label: "Last 30 days", range: () => ({ from: add(today, -29), to: today }) },
    { label: "Last 90 days", range: () => ({ from: add(today, -89), to: today }) },
    { label: "This month", range: () => ({ from: new Date(y, m, 1), to: today }) },
    { label: "Last month", range: () => ({ from: new Date(y, m - 1, 1), to: new Date(y, m, 0) }) },
    { label: "This quarter", range: () => ({ from: new Date(y, q, 1), to: today }) },
    { label: "Last quarter", range: () => ({ from: new Date(y, q - 3, 1), to: new Date(y, q, 0) }) },
    { label: "Year to date", range: () => ({ from: new Date(y, 0, 1), to: today }) },
    { label: "Last 12 months", range: () => ({ from: new Date(y - 1, m, today.getDate() + 1), to: today }) },
  ];
}

/** The period just before a range, of the same length: what "compare" compares with. */
export function previousPeriod(r: DateRange): DateRange {
  const n = daysBetween(r.from, r.to);
  return { from: add(r.from, -n), to: add(r.from, -1) };
}

export interface RangeCalendarProps {
  value?: DateRange | null;
  /** Called with the range once both ends are picked. */
  onChange?: (range: DateRange) => void;
  /** How many months side by side: 2 on a wide screen, 1 in a narrow panel. */
  months?: 1 | 2;
  min?: Date;
  max?: Date;
  locale?: string;
  weekStartsOn?: 0 | 1;
  className?: string;
}

/** Months to pick a range on: the first click starts it, the second ends it, and hovering shows what you'd get. */
export function RangeCalendar({ value, onChange, months = 2, min, max, locale, weekStartsOn = 1, className }: RangeCalendarProps) {
  const [first, setFirst] = useState(() => {
    const d = value?.to ?? new Date();
    return new Date(d.getFullYear(), d.getMonth() - (months === 2 ? 1 : 0), 1);
  });
  const [start, setStart] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const today = day0(new Date());
  const long = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "full" }), [locale]);
  const off = (d: Date) => (min && d < day0(min)) || (max && d > day0(max));

  // While picking, the range runs from the first click to the hovered day.
  const from = start ? (hover && hover < start ? hover : start) : value?.from;
  const to = start ? (hover && hover > start ? hover : start) : value?.to;

  const pick = (d: Date) => {
    if (!start) {
      setStart(d);
      return;
    }
    const r = d < start ? { from: d, to: start } : { from: start, to: d };
    setStart(null);
    setHover(null);
    onChange?.(r);
  };

  const month = (offset: number) => {
    const m = new Date(first.getFullYear(), first.getMonth() + offset, 1);
    const lead = (m.getDay() - weekStartsOn + 7) % 7;
    const s = new Date(m.getFullYear(), m.getMonth(), 1 - lead);
    const days = Array.from({ length: 42 }, (_, i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i));
    const names = days.slice(0, 7).map((d) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d));
    const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(m);
    return (
      <div key={offset} className="w-[252px]">
        <p className="m-0 mb-2 flex h-7 items-center justify-center text-label font-medium text-ink">{title}</p>
        <div role="grid" aria-label={title} className="grid grid-cols-7">
          {names.map((n, i) => (
            <span key={i} role="columnheader" className="grid h-7 place-items-center text-caption text-ink-3">
              {n}
            </span>
          ))}
          {days.map((d) => {
            const out = d.getMonth() !== m.getMonth();
            if (out) return <span key={d.toISOString()} aria-hidden="true" className="h-8" />;
            const isFrom = same(from, d);
            const isTo = same(to, d);
            const inside = from && to && d > from && d < to;
            const disabled = off(d);
            return (
              <div key={d.toISOString()} className={cn("relative h-8", inside && "bg-accent-soft", isFrom && to && !same(from, to) && "rounded-l-md bg-accent-soft", isTo && from && !same(from, to) && "rounded-r-md bg-accent-soft")}>
                <button
                  type="button"
                  role="gridcell"
                  aria-selected={!!(isFrom || isTo || inside)}
                  aria-label={long.format(d)}
                  disabled={!!disabled}
                  onClick={() => pick(d)}
                  onMouseEnter={() => start && setHover(d)}
                  className={cn(
                    "grid size-full cursor-pointer place-items-center rounded-md text-label tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                    focusRing,
                    isFrom || isTo ? "bg-accent font-medium text-accent-ink" : inside ? "text-ink hover:bg-surface-2" : "text-ink hover:bg-surface-2",
                    !isFrom && !isTo && same(today, d) && "font-semibold underline decoration-2 underline-offset-4",
                  )}
                >
                  {d.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const nav = cn("absolute top-0 grid size-7 cursor-pointer place-items-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink", focusRing);
  return (
    <div className={cn("relative select-none", className)} onMouseLeave={() => setHover(null)}>
      <button type="button" aria-label="Previous month" className={cn(nav, "left-0")} onClick={() => setFirst((f) => new Date(f.getFullYear(), f.getMonth() - 1, 1))}>
        <ChevronRightGlyph size={15} className="rotate-180" />
      </button>
      <button type="button" aria-label="Next month" className={cn(nav, "right-0")} onClick={() => setFirst((f) => new Date(f.getFullYear(), f.getMonth() + 1, 1))}>
        <ChevronRightGlyph size={15} />
      </button>
      <div className="flex gap-6">{Array.from({ length: months }, (_, i) => month(i))}</div>
      <p className="sr-only" aria-live="polite">
        {start ? "Now pick the last day." : ""}
      </p>
    </div>
  );
}

export interface DateRangePickerProps {
  /** The chosen period. */
  value?: DateRange | null;
  /** Called with the period when Apply is pressed (or a preset picked, with `instant`). */
  onChange?: (range: DateRange, compare: DateRange | null) => void;
  /** Shown before a period is chosen. */
  placeholder?: string;
  /** The presets down the side; rangePresets() by default, [] for none. */
  presets?: RangePreset[];
  /** Adds "Compare to previous period"; onChange then gets the period before as well. */
  compare?: boolean;
  /** Apply as soon as a preset or range is picked, without the Apply button. */
  instant?: boolean;
  /** Submitted with a form as from and to, YYYY-MM-DD, under name-from and name-to. */
  name?: string;
  /** The same looks as Input. */
  variant?: FieldVariant;
  size?: FieldSize;
  min?: Date;
  max?: Date;
  locale?: string;
  weekStartsOn?: 0 | 1;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  /** Opens to the right edge of the field, for fields at the right of a toolbar. */
  align?: "start" | "end";
  className?: string;
}

/** A field for a period (a report's dates, a filter): presets, two months to pick on, and Apply. */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick dates",
  presets = rangePresets(),
  compare: canCompare,
  instant,
  name,
  variant = "outline",
  size = "md",
  min,
  max,
  locale,
  weekStartsOn,
  invalid,
  disabled,
  id,
  align = "start",
  className,
}: DateRangePickerProps) {
  const [own, setOwn] = useState<DateRange | null>(null);
  const current = value !== undefined ? value : own;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | null>(current);
  const [preset, setPreset] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));

  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });
  const fmtShort = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  const label = (r: DateRange) =>
    same(r.from, r.to) ? fmt.format(r.from) : r.from.getFullYear() === r.to.getFullYear() ? `${fmtShort.format(r.from)} – ${fmt.format(r.to)}` : `${fmt.format(r.from)} – ${fmt.format(r.to)}`;
  const shownPreset = current ? presets.find((p) => { const r = p.range(); return same(r.from, current.from) && same(r.to, current.to); })?.label : undefined;

  const commit = (r: DateRange) => {
    if (value === undefined) setOwn(r);
    onChange?.(r, comparing ? previousPeriod(r) : null);
    setOpen(false);
  };

  return (
    <div ref={box} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        onClick={() => {
          setDraft(current);
          setPreset(null);
          setOpen(!open);
        }}
        className={cn(
          fieldBox(variant === "floating" ? "filled" : variant === "notched" ? "outline" : variant, { invalid, disabled }),
          "cursor-pointer gap-2 text-left disabled:cursor-not-allowed",
          size === "sm" ? "h-7 text-small" : size === "lg" ? "h-10 text-body-lg" : "h-8 text-body",
          variant === "pill" ? "px-4" : variant === "underline" ? "px-0.5" : "px-3",
          focusRing,
          current ? "text-ink" : "text-ink-4",
        )}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="flex-none text-ink-3" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className="min-w-0 flex-1 truncate">
          {current ? (
            <>
              {shownPreset ? <span className="mr-1.5 font-medium">{shownPreset}:</span> : null}
              <span className={shownPreset ? "text-ink-3" : undefined}>{label(current)}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
      </button>
      {name && current ? (
        <>
          <input type="hidden" name={`${name}-from`} value={iso(current.from)} />
          <input type="hidden" name={`${name}-to`} value={iso(current.to)} />
        </>
      ) : null}
      {open ? (
        <div role="dialog" aria-label="Choose dates" className={cn("@container absolute top-full mt-1.5 flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden", align === "end" ? "right-0" : "left-0", floatingPanel)}>
          <div className="flex max-sm:flex-col">
            {presets.length ? (
              <ul className="m-0 flex list-none gap-0.5 overflow-x-auto border-line p-2 max-sm:border-b sm:w-40 sm:flex-col sm:border-r">
                {presets.map((p) => {
                  const r = p.range();
                  const on = preset === p.label || (!preset && draft && same(draft.from, r.from) && same(draft.to, r.to));
                  return (
                    <li key={p.label} className="flex-none">
                      <button
                        type="button"
                        onClick={() => {
                          setPreset(p.label);
                          setDraft(r);
                          if (instant) commit(r);
                        }}
                        className={cn("w-full cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-label", on ? "bg-brand-soft font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink", focusRing)}
                      >
                        {p.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <div className="p-3">
              <RangeCalendar
                key={draft ? iso(draft.to) : "none"}
                value={draft}
                months={2}
                min={min}
                max={max}
                locale={locale}
                weekStartsOn={weekStartsOn}
                className="max-sm:[&>div]:flex-col"
                onChange={(r) => {
                  setPreset(null);
                  setDraft(r);
                  if (instant) commit(r);
                }}
              />
            </div>
          </div>
          {!instant ? (
            <div className="flex flex-wrap items-center gap-3 border-t border-line px-3 py-2.5">
              <span className="min-w-0 flex-1 text-small text-ink-3">
                {draft ? (
                  <>
                    <span className="text-ink">{label(draft)}</span> · {daysBetween(draft.from, draft.to)} days
                    {canCompare && comparing ? <> · vs {label(previousPeriod(draft))}</> : null}
                  </>
                ) : (
                  "Pick the first day, then the last."
                )}
              </span>
              {canCompare ? (
                <label className="flex cursor-pointer items-center gap-2 text-small text-ink-2">
                  <input type="checkbox" checked={comparing} onChange={(e) => setComparing(e.target.checked)} className="size-3.5 accent-[var(--color-brand)]" />
                  Compare to previous period
                </label>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" disabled={!draft} onClick={() => draft && commit(draft)}>
                Apply
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
