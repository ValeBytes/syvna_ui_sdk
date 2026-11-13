"use client";

// Small pieces every business app reaches for: sections that open, keys,
// stacked avatars, "3 minutes ago", a page-wide notice, and steps.

import { useEffect, useId, useState } from "react";

import { cn, focusRing, toneSoft, toneText, type Tone } from "../cx";
import { Avatar } from "./display";
import { CheckGlyph, ChevronDownGlyph, CloseGlyph, InfoGlyph } from "./icons";

/* ---------- Accordion ---------- */

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  /** A few words at the right of the title: a count, a status. */
  meta?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Only one open at a time. */
  single?: boolean;
  /** Open at first. */
  defaultOpen?: string[];
  /** lines: divided by rules. cards: each a bordered card. plain: no lines. */
  variant?: "lines" | "cards" | "plain";
  className?: string;
}

/** Sections that open one at a time or together: settings groups, details, help. */
export function Accordion({ items, single, defaultOpen = [], variant = "lines", className }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const base = useId();
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : single ? [id] : [...o, id]));
  return (
    <div className={cn("flex flex-col", variant === "lines" && "divide-y divide-line border-y border-line", variant === "cards" && "gap-2", className)}>
      {items.map((it) => {
        const on = open.includes(it.id);
        return (
          <div key={it.id} className={cn(variant === "cards" && "rounded-lg border border-line bg-surface shadow-1")}>
            <h3 className="m-0">
              <button
                type="button"
                id={`${base}-${it.id}-h`}
                aria-expanded={on}
                aria-controls={`${base}-${it.id}`}
                disabled={it.disabled}
                onClick={() => toggle(it.id)}
                className={cn("flex w-full cursor-pointer items-center gap-3 text-left text-body font-medium text-ink disabled:cursor-not-allowed disabled:text-ink-4", variant === "cards" ? "px-4 py-3" : "py-3", focusRing)}
              >
                <span className="min-w-0 flex-1">{it.title}</span>
                {it.meta ? <span className="text-small font-normal text-ink-3">{it.meta}</span> : null}
                <ChevronDownGlyph size={15} className={cn("flex-none text-ink-3 transition-transform duration-200", on && "rotate-180")} />
              </button>
            </h3>
            <div id={`${base}-${it.id}`} role="region" aria-labelledby={`${base}-${it.id}-h`} className={cn("grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <div className={cn("text-body text-ink-2", variant === "cards" ? "px-4 pb-4" : "pb-4")}>{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Kbd ---------- */

export interface KbdProps {
  /** The keys: "mod+k" shows ⌘K on a Mac and Ctrl K elsewhere. */
  keys: string;
  className?: string;
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** A keyboard shortcut, written the way the reader's computer writes it. */
export function Kbd({ keys, className }: KbdProps) {
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(isMac()), []);
  const names: Record<string, string> = mac
    ? { mod: "⌘", cmd: "⌘", ctrl: "⌃", alt: "⌥", shift: "⇧", enter: "↵", esc: "Esc" }
    : { mod: "Ctrl", cmd: "Ctrl", ctrl: "Ctrl", alt: "Alt", shift: "Shift", enter: "Enter", esc: "Esc" };
  const parts = keys.split("+").map((k) => names[k.toLowerCase()] ?? (k.length === 1 ? k.toUpperCase() : k));
  return (
    <kbd className={cn("inline-flex items-center gap-0.5 font-sans", className)}>
      {parts.map((p, i) => (
        <span key={i} className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line border-b-2 bg-surface px-1 text-caption font-medium text-ink-2">
          {p}
        </span>
      ))}
    </kbd>
  );
}

/* ---------- AvatarGroup ---------- */

export interface AvatarGroupProps {
  people: { name: string; src?: string }[];
  /** How many before "+N". */
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Who's on something: overlapping faces, then "+N", with names on hover. */
export function AvatarGroup({ people, max = 4, size = "sm", className }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  const box = size === "sm" ? "size-6 text-[10px]" : size === "md" ? "size-8 text-caption" : "size-10 text-label";
  return (
    <span role="group" aria-label={`${people.length} people: ${people.map((p) => p.name).join(", ")}`} className={cn("inline-flex items-center", className)}>
      {shown.map((p, i) => (
        <span key={i} title={p.name} className={cn("rounded-full ring-2 ring-surface", i > 0 && "-ml-1.5")}>
          <Avatar name={p.name} src={p.src} size={size} />
        </span>
      ))}
      {rest > 0 ? (
        <span title={people.slice(max).map((p) => p.name).join(", ")} className={cn("-ml-1.5 inline-flex items-center justify-center rounded-full bg-surface-2 font-semibold text-ink-2 ring-2 ring-surface", box)}>
          +{rest}
        </span>
      ) : null}
    </span>
  );
}

/* ---------- RelativeTime ---------- */

export interface RelativeTimeProps {
  date: Date | string | number;
  locale?: string;
  /** "3 min. ago" (short) or "3 minutes ago" (long). */
  style?: "long" | "short";
  className?: string;
}

/** "3 minutes ago", kept fresh while it's on screen; the exact time on hover. */
export function RelativeTime({ date, locale, style = "long", className }: RelativeTimeProps) {
  const d = new Date(date);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const diff = ((now ?? d.getTime()) - d.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style });
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
    [Infinity, "year"],
  ];
  const sizes: Record<string, number> = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 };
  const [, unit] = steps.find(([lim]) => Math.abs(diff) < lim)!;
  // Empty until mounted: "3 minutes ago" depends on the clock, so the server can't render it.
  const text = now === null ? "" : Math.abs(diff) < 45 ? rtf.format(0, "second") : rtf.format(-Math.round(diff / sizes[unit]!), unit);
  return (
    <time dateTime={now === null ? undefined : d.toISOString()} title={now === null ? undefined : new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(d)} className={className}>
      {text}
    </time>
  );
}

/* ---------- Banner ---------- */

export interface BannerProps {
  /** What's going on: "Your trial ends in 3 days." */
  children: React.ReactNode;
  /** info, warning (trial ending, degraded service), danger (payment failed), success, brand. */
  tone?: Tone;
  /** One action: "Add a payment method". */
  action?: React.ReactNode;
  /** Shows a close button. */
  onDismiss?: () => void;
  /** An icon in place of the tone's. */
  icon?: React.ReactNode;
  className?: string;
}

/** A notice across the top of the app that stays until it's dealt with: a trial ending, a failed payment, maintenance. */
export function Banner({ children, tone = "info", action, onDismiss, icon, className }: BannerProps) {
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("flex w-full items-center gap-3 border-b border-line px-4 py-2 text-body", toneSoft[tone], className)}>
      <span className={cn("flex-none [&>svg]:size-4", toneText[tone])}>{icon ?? <InfoGlyph size={16} />}</span>
      <span className="min-w-0 flex-1 text-ink">{children}</span>
      {action ? <span className="flex-none">{action}</span> : null}
      {onDismiss ? (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className={cn("grid size-6 flex-none cursor-pointer place-items-center rounded-sm text-ink-3 hover:text-ink", focusRing)}>
          <CloseGlyph size={13} />
        </button>
      ) : null}
    </div>
  );
}

/* ---------- Stepper ---------- */

export interface StepperStep {
  title: React.ReactNode;
  /** A line under the title. */
  description?: React.ReactNode;
  /** Marks it optional. */
  optional?: boolean;
  /** Something's wrong in this step. */
  error?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  /** The step they're on, from 0. */
  current: number;
  /** Lets them go back to an earlier step: called with its index. Later steps can't be jumped to. */
  onStep?: (index: number) => void;
  /** Across the top, or down the side for long forms. */
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/** Where they are in a task of several steps: setup, an import, a checkout. Done steps are ticked. */
export function Stepper({ steps, current, onStep, orientation = "horizontal", className }: StepperProps) {
  const vertical = orientation === "vertical";
  return (
    <ol className={cn("m-0 flex list-none p-0", vertical ? "flex-col" : "items-start", className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        const can = !!onStep && i < current;
        const dot = (
          <span
            className={cn(
              "grid size-7 flex-none place-items-center rounded-full border text-label font-semibold tabular-nums transition-colors",
              s.error ? "border-danger bg-danger-soft text-danger" : done ? "border-accent bg-accent text-accent-ink" : now ? "border-accent bg-surface text-ink ring-4 ring-accent-soft" : "border-line-strong bg-surface text-ink-3",
            )}
          >
            {s.error ? "!" : done ? <CheckGlyph size={14} /> : i + 1}
          </span>
        );
        const words = (
          <span className={cn("flex min-w-0 flex-col", !vertical && "items-center text-center")}>
            <span className={cn("text-label font-medium", now || done ? "text-ink" : "text-ink-3", s.error && "text-danger")}>{s.title}</span>
            {s.description || s.optional ? (
              <span className="text-caption text-ink-3">
                {s.description}
                {s.optional ? <>{s.description ? " · " : ""}Optional</> : null}
              </span>
            ) : null}
          </span>
        );
        const inner = vertical ? (
          <span className="flex items-start gap-3">
            {dot}
            <span className="pt-1">{words}</span>
          </span>
        ) : (
          <span className="flex flex-col items-center gap-2">
            {dot}
            {words}
          </span>
        );
        return (
          <li key={i} aria-current={now ? "step" : undefined} className={cn("relative flex", vertical ? "flex-col pb-6 last:pb-0" : "min-w-0 flex-1 flex-col items-center")}>
            {vertical && i < steps.length - 1 ? (
              <span aria-hidden="true" className={cn("absolute bottom-1 left-[13px] top-8 w-0.5 rounded-full", done ? "bg-accent" : "bg-line")} />
            ) : null}
            {!vertical && i > 0 ? (
              <span aria-hidden="true" className={cn("absolute right-[calc(50%+18px)] top-[13px] h-0.5 w-[calc(100%-36px)] rounded-full", done || now ? "bg-accent" : "bg-line")} />
            ) : null}
            {can ? (
              <button type="button" onClick={() => onStep!(i)} className={cn("cursor-pointer rounded-md", focusRing)}>
                {inner}
              </button>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}
