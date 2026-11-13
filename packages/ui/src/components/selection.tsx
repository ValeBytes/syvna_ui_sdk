"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

import { cn, focusRing } from "../cx";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  /** A line under the label: what choosing it means. */
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** The choices: { value, label, description?, disabled? }. */
  options: RadioOption[];
  /** The chosen value, when you keep it yourself. */
  value?: string;
  /** The choice at first. */
  defaultValue?: string;
  /** Called with the value picked. */
  onValueChange?: (value: string) => void;
  /** Submitted with a form under this name. */
  name?: string;
  /** Read by screen readers when there's no visible label: "Delivery speed". */
  label?: string;
  /** cards: each choice a bordered card, for choices with descriptions (plans, delivery). */
  variant?: "list" | "cards";
  /** Side by side instead of stacked. */
  inline?: boolean;
  className?: string;
}

/** One of a few choices, all on show: a plan, a delivery speed, who can see something. For many choices, Select. */
export function RadioGroup({ options, value, defaultValue, onValueChange, name, label, variant = "list", inline, className }: RadioGroupProps) {
  const [own, setOwn] = useState(defaultValue ?? "");
  const current = value ?? own;
  const auto = useId();
  const group = name ?? auto;
  const cards = variant === "cards";
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex gap-2", inline ? "flex-row flex-wrap" : "flex-col", cards && !inline && "gap-2", className)}>
      {options.map((o) => {
        const on = o.value === current;
        return (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-start gap-2.5",
              cards && "rounded-lg border p-3 transition-colors",
              cards && (on ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong hover:bg-surface-2"),
              o.disabled && "cursor-not-allowed opacity-55",
            )}
          >
            <input
              type="radio"
              name={group}
              value={o.value}
              checked={on}
              disabled={o.disabled}
              onChange={() => {
                if (value === undefined) setOwn(o.value);
                onValueChange?.(o.value);
              }}
              className={cn(
                "mt-px size-4 flex-none cursor-[inherit] appearance-none rounded-full border border-line-strong bg-surface transition-[border-width,border-color] duration-150",
                "checked:border-[5px] checked:border-brand hover:enabled:border-ink-3 checked:hover:enabled:border-brand",
                focusRing,
              )}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-label font-medium text-ink">{o.label}</span>
              {o.description ? <span className="text-small text-ink-3">{o.description}</span> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export interface SegmentedControlProps {
  /** Two to five short choices: { value, label }. */
  options: { value: string; label: React.ReactNode; disabled?: boolean }[];
  /** The chosen option, when you keep it yourself. */
  value?: string;
  /** The option chosen at first; the first one if not given. */
  defaultValue?: string;
  /** Called with the option picked. */
  onValueChange?: (value: string) => void;
  /** Read by screen readers: "View". */
  label?: string;
  /** sm in toolbars and tight spots, md everywhere else. */
  size?: "sm" | "md";
  /** As wide as its container, choices sharing it equally. */
  block?: boolean;
  className?: string;
}

/**
 * A switch between two to five short options that act at once: list or
 * board, day or week, monthly or yearly. The chosen one is marked by a pill
 * that slides to it. For views with content under them, Tabs.
 */
export function SegmentedControl({ options, value, defaultValue, onValueChange, label, size = "md", block, className }: SegmentedControlProps) {
  const [own, setOwn] = useState(defaultValue ?? options[0]?.value ?? "");
  const current = value ?? own;
  const box = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<{ x: number; w: number } | null>(null);
  const [moving, setMoving] = useState(false);
  useLayoutEffect(() => {
    const el = box.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(current)}"]`);
    if (el) setMark({ x: el.offsetLeft, w: el.offsetWidth });
    const t = setTimeout(() => setMoving(true), 50);
    return () => clearTimeout(t);
  }, [current, options]);
  const pick = (v: string) => {
    if (value === undefined) setOwn(v);
    onValueChange?.(v);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const enabled = options.filter((o) => !o.disabled);
    const at = enabled.findIndex((o) => o.value === current);
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? enabled[(at + 1) % enabled.length] : e.key === "ArrowLeft" || e.key === "ArrowUp" ? enabled[(at - 1 + enabled.length) % enabled.length] : undefined;
    if (!next) return;
    e.preventDefault();
    pick(next.value);
    box.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(next.value)}"]`)?.focus();
  };
  return (
    <div ref={box} role="radiogroup" aria-label={label} onKeyDown={onKey} className={cn("relative inline-flex rounded-md bg-surface-2 p-0.5", block && "flex w-full", className)}>
      {mark ? (
        <span
          aria-hidden="true"
          className={cn("absolute bottom-0.5 left-0 top-0.5 rounded-[calc(var(--radius-md)-2px)] bg-surface shadow-1", moving && "transition-[transform,width] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none")}
          style={{ transform: `translateX(${mark.x}px)`, width: mark.w }}
        />
      ) : null}
      {options.map((o) => {
        const on = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={o.disabled}
            data-value={o.value}
            onClick={() => pick(o.value)}
            className={cn(
              "relative inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-md)-2px)] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5",
              focusRing,
              size === "sm" ? "h-6 px-2 text-small" : "h-7 px-3 text-label",
              block && "flex-1",
              on ? "text-ink" : "text-ink-3 hover:text-ink",
              on && !mark && "bg-surface shadow-1",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
