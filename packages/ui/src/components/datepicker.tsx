"use client";

import { useMemo, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { ChevronRightGlyph } from "./icons";
import { fieldBox, type FieldSize, type FieldVariant } from "./inputs";
import { floatingPanel, useDismiss } from "./popover";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const same = (a: Date | null | undefined, b: Date) => !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export interface CalendarProps {
  /** The chosen day. */
  value?: Date | null;
  /** Called with the day picked. */
  onChange?: (date: Date) => void;
  /** Days before this can't be picked: today, for a delivery date. */
  min?: Date;
  /** Days after this can't be picked. */
  max?: Date;
  /** The locale for month and day names; the reader's by default. */
  locale?: string;
  /** 0 for Sunday, 1 for Monday (most of the world). */
  weekStartsOn?: 0 | 1;
  className?: string;
}

/** A month to pick a day from. DatePicker opens one from a field; use it alone for a booking screen. */
export function Calendar({ value, onChange, min, max, locale, weekStartsOn = 1, className }: CalendarProps) {
  const [month, setMonth] = useState(() => {
    const d = value ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const today = startOfDay(new Date());
  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
  const days = useMemo(() => {
    const first = (month.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(month.getFullYear(), month.getMonth(), 1 - first);
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [month, weekStartsOn]);
  const names = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return days.slice(0, 7).map((d) => f.format(d));
  }, [days, locale]);
  const long = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  const off = (d: Date) => (min && d < startOfDay(min)) || (max && d > startOfDay(max));
  const nav = cn("grid size-7 cursor-pointer place-items-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink", focusRing);
  return (
    <div className={cn("w-[252px] select-none", className)}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" className={nav} onClick={() => shift(-1)}>
          <ChevronRightGlyph size={15} className="rotate-180" />
        </button>
        <span className="text-label font-medium text-ink" aria-live="polite">
          {title}
        </span>
        <button type="button" aria-label="Next month" className={nav} onClick={() => shift(1)}>
          <ChevronRightGlyph size={15} />
        </button>
      </div>
      <div role="grid" aria-label={title} className="grid grid-cols-7 gap-0.5">
        {names.map((n, i) => (
          <span key={i} role="columnheader" className="grid h-7 place-items-center text-caption text-ink-3">
            {n}
          </span>
        ))}
        {days.map((d) => {
          const out = d.getMonth() !== month.getMonth();
          const picked = same(value, d);
          const disabled = off(d);
          return (
            <button
              key={d.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={picked}
              aria-label={long.format(d)}
              disabled={!!disabled}
              onClick={() => onChange?.(d)}
              className={cn(
                "grid h-8 cursor-pointer place-items-center rounded-md text-label tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                focusRing,
                picked ? "bg-brand font-medium text-brand-ink" : out ? "text-ink-4 hover:bg-surface-2" : "text-ink hover:bg-surface-2",
                !picked && same(today, d) && "font-semibold underline decoration-2 underline-offset-4",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface DatePickerProps extends Omit<CalendarProps, "className"> {
  /** Shown before a day is chosen: "Pick a date". */
  placeholder?: string;
  /** Submitted with a form as YYYY-MM-DD under this name. */
  name?: string;
  /** The same looks as Input (outline, filled, underline, cupertino, pill, ghost); floating and notched draw as filled and outline. */
  variant?: FieldVariant;
  /** sm in toolbars and tables, md by default, lg on short forms. */
  size?: FieldSize;
  /** Draws the field in danger; Field sets it when it has an error. */
  invalid?: boolean;
  /** Shown but can't be changed. */
  disabled?: boolean;
  /** The button's id; Field sets it. */
  id?: string;
  className?: string;
  "aria-describedby"?: string;
}

/** A field for one day: shows it in the reader's format, opens a Calendar to change it. */
export function DatePicker({ value, onChange, placeholder = "Pick a date", name, variant = "outline", size = "md", invalid, disabled, id, className, locale, min, max, weekStartsOn, ...aria }: DatePickerProps) {
  const [own, setOwn] = useState<Date | null>(null);
  const day = value !== undefined ? value : own;
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  const label = day ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(day) : placeholder;
  const iso = day ? `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}` : "";
  return (
    <div ref={box} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen(!open)}
        className={cn(
          fieldBox(variant === "floating" ? "filled" : variant === "notched" ? "outline" : variant, { invalid, disabled }),
          "cursor-pointer gap-2 text-left disabled:cursor-not-allowed",
          size === "sm" ? "h-7 text-small" : size === "lg" ? "h-10 text-body-lg" : "h-8 text-body",
          variant === "pill" ? "px-4" : variant === "underline" ? "px-0.5" : "px-3",
          focusRing,
          day ? "text-ink" : "text-ink-4",
        )}
        {...aria}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="flex-none text-ink-3" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className="truncate">{label}</span>
      </button>
      {name ? <input type="hidden" name={name} value={iso} /> : null}
      {open ? (
        <div role="dialog" aria-label="Choose a date" className={cn("absolute left-0 top-full mt-1.5 p-3", floatingPanel)}>
          <Calendar
            value={day}
            min={min}
            max={max}
            locale={locale}
            weekStartsOn={weekStartsOn}
            onChange={(d) => {
              if (value === undefined) setOwn(d);
              onChange?.(d);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
