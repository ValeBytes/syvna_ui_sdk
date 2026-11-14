"use client";

import { forwardRef, useId, useMemo, useRef, useState } from "react";

import { cn } from "../cx";
import { CheckGlyph, ChevronDownGlyph } from "./icons";
import { fieldBox, type FieldSize, type FieldVariant } from "./inputs";
import { floatingPanel, useDismiss } from "./popover";

export interface ComboboxOption {
  value: string;
  label: string;
  /** A muted line under the label: an email, a city. */
  description?: string;
  /** A small icon or Avatar before the label. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  /** The choices; long lists are fine, the person types to find one. */
  options: ComboboxOption[];
  /** The chosen value, when you keep it yourself. */
  value?: string | null;
  /** The choice at first. */
  defaultValue?: string | null;
  /** Called with the value picked. */
  onValueChange?: (value: string) => void;
  /** Shown before anything is chosen: "Choose a customer". */
  placeholder?: string;
  /** Shown when nothing matches what was typed. */
  empty?: React.ReactNode;
  /** Submitted with a form under this name. */
  name?: string;
  /** The same looks as Input (outline, filled, underline, cupertino, pill, ghost); floating and notched draw as filled and outline. */
  variant?: FieldVariant;
  /** sm in toolbars and tables, md by default, lg on short forms. */
  size?: FieldSize;
  /** Draws the field in danger; Field sets it when it has an error. */
  invalid?: boolean;
  /** Shown but can't be changed. */
  disabled?: boolean;
  /** The input's id; Field sets it. */
  id?: string;
  className?: string;
  "aria-describedby"?: string;
}

/**
 * Pick one from a long list by typing: a customer, a country, a product.
 * For under about 12 choices, Select is simpler.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  { options, value, defaultValue = null, onValueChange, placeholder = "Search…", empty = "Nothing matches.", name, variant = "outline", size = "md", invalid, disabled, id, className, ...aria },
  ref,
) {
  const [own, setOwn] = useState<string | null>(defaultValue);
  const chosen = value !== undefined ? value : own;
  const selected = options.find((o) => o.value === chosen);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [at, setAt] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const list = useId();
  const auto = useId();
  const inputId = id ?? auto;
  useDismiss(box, open, () => {
    setOpen(false);
    setQuery("");
  });
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => `${o.label} ${o.description ?? ""}`.toLowerCase().includes(q)) : options;
  }, [options, query]);
  const pick = (o?: ComboboxOption) => {
    if (!o || o.disabled) return;
    if (value === undefined) setOwn(o.value);
    onValueChange?.(o.value);
    setOpen(false);
    setQuery("");
  };
  return (
    <div ref={box} className={cn("relative w-full", className)}>
      <span
        className={cn(
          fieldBox(variant === "floating" ? "filled" : variant === "notched" ? "outline" : variant, { invalid, disabled }),
          size === "sm" ? "h-7" : size === "lg" ? "h-10" : "h-8",
        )}
      >
        {selected?.icon && !open ? <span className="pl-2.5 [&_svg]:size-4">{selected.icon}</span> : null}
        <input
          ref={ref}
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={list}
          aria-autocomplete="list"
          aria-activedescendant={open && shown[at] ? `${list}-${at}` : undefined}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          value={open ? query : (selected?.label ?? "")}
          placeholder={open && selected ? selected.label : placeholder}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setAt(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setAt((a) => Math.min(shown.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAt((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && open) {
              e.preventDefault();
              pick(shown[at]);
            } else if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
          }}
          className={cn("h-full min-w-0 flex-1 bg-transparent pr-8 text-inherit outline-none! placeholder:text-ink-4 disabled:cursor-not-allowed", size === "sm" ? "text-small" : size === "lg" ? "text-body-lg" : "text-body", variant === "pill" ? "pl-4" : variant === "underline" ? "pl-0.5" : "pl-3")}
          {...aria}
        />
        <ChevronDownGlyph size={15} className={cn("pointer-events-none absolute right-2.5 text-ink-3 transition-transform", open && "rotate-180")} />
      </span>
      {name ? <input type="hidden" name={name} value={chosen ?? ""} /> : null}
      {open ? (
        <div id={list} role="listbox" className={cn("absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto p-1", floatingPanel)}>
          {shown.length === 0 ? <p className="m-0 px-2.5 py-3 text-label text-ink-3">{empty}</p> : null}
          {shown.map((o, i) => (
            <div
              key={o.value}
              id={`${list}-${i}`}
              role="option"
              aria-selected={o.value === chosen}
              aria-disabled={o.disabled || undefined}
              onMouseMove={() => setAt(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(o)}
              className={cn(
                "flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1 text-label [&_svg]:size-4",
                i === at ? "bg-surface-2 text-ink" : "text-ink-2",
                o.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {o.icon}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{o.label}</span>
                {o.description ? <span className="truncate text-small text-ink-3">{o.description}</span> : null}
              </span>
              {o.value === chosen ? <CheckGlyph size={14} className="flex-none text-ink" /> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
});
