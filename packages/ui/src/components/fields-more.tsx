"use client";

// The fields business apps need beyond text: several values, numbers and
// money, editing in place, keys and values, secrets, and a slider.

import { useId, useMemo, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { Button, CopyButton } from "./button";
import { CloseGlyph, EyeGlyph, EyeOffGlyph, MinusGlyph, PlusGlyph } from "./icons";
import { fieldBox, type FieldSize, type FieldVariant } from "./inputs";
import { floatingPanel } from "./popover";

const heights: Record<FieldSize, string> = { sm: "min-h-7", md: "min-h-8", lg: "min-h-10" };
const texts: Record<FieldSize, string> = { sm: "text-small", md: "text-body", lg: "text-body-lg" };

/* ---------- TagInput ---------- */

export interface TagInputProps {
  /** The values, when you keep them yourself. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** Offered as they type; picking one adds it. */
  suggestions?: string[];
  /** Only values from suggestions can be added. */
  strict?: boolean;
  /** Checks a value before it's added: return a message to refuse it ("Not an email address"). */
  validate?: (value: string) => string | undefined;
  /** At most this many. */
  max?: number;
  /** Tokens shown before "+N"; all when not given. */
  visible?: number;
  placeholder?: string;
  variant?: FieldVariant;
  size?: FieldSize;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  /** Read by screen readers: "Recipients". */
  label?: string;
  className?: string;
}

/**
 * Several values in one field: emails to invite, tags, recipients. Enter,
 * comma or Tab adds what's typed; pasting a list adds them all; Backspace
 * in an empty field removes the last.
 */
export function TagInput({ value, defaultValue = [], onChange, suggestions = [], strict, validate, max, visible, placeholder = "Add…", variant = "outline", size = "md", invalid, disabled, id, label, className }: TagInputProps) {
  const [own, setOwn] = useState(defaultValue);
  const tags = value ?? own;
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const set = (next: string[]) => {
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };
  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    return suggestions.filter((s) => !tags.includes(s) && (!q || s.toLowerCase().includes(q))).slice(0, 8);
  }, [suggestions, tags, text]);

  const add = (raw: string[]) => {
    const next = [...tags];
    for (const r of raw) {
      const v = r.trim();
      if (!v || next.includes(v)) continue;
      if (strict && !suggestions.includes(v)) return setError(`"${v}" isn't one of the choices.`);
      const msg = validate?.(v);
      if (msg) return setError(msg);
      if (max && next.length >= max) return setError(`Up to ${max}.`);
      next.push(v);
    }
    setError(undefined);
    setText("");
    set(next);
  };
  const remove = (t: string) => set(tags.filter((x) => x !== t));
  const shown = visible && !expanded ? tags.slice(0, visible) : tags;
  const hidden = tags.length - shown.length;
  const open = focused && matches.length > 0 && !disabled;

  return (
    <div className={cn("relative flex w-full flex-col gap-1", className)}>
      <div
        onClick={() => input.current?.focus()}
        className={cn(fieldBox(variant, { invalid: invalid || !!error, disabled }), heights[size], "flex-wrap gap-1 py-1", variant === "pill" ? "px-2.5" : "px-1.5", "cursor-text")}
      >
        {shown.map((t) => (
          <span key={t} className={cn("inline-flex max-w-full items-center gap-1 rounded-sm bg-surface-2 pl-2 pr-0.5 text-ink ring-1 ring-inset ring-line", size === "sm" ? "h-5 text-caption" : "h-6 text-small")}>
            <span className="truncate">{t}</span>
            {!disabled ? (
              <button type="button" aria-label={`Remove ${t}`} onClick={(e) => { e.stopPropagation(); remove(t); }} className={cn("grid size-4 flex-none cursor-pointer place-items-center rounded-sm text-ink-3 hover:bg-line hover:text-ink", focusRing)}>
                <CloseGlyph size={10} />
              </button>
            ) : null}
          </span>
        ))}
        {hidden > 0 ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded(true); }} className={cn("h-6 cursor-pointer rounded-sm px-1.5 text-small font-medium text-ink-2 hover:bg-surface-2", focusRing)}>
            +{hidden}
          </button>
        ) : null}
        <input
          ref={input}
          id={id}
          value={text}
          disabled={disabled}
          aria-label={label}
          aria-invalid={invalid || !!error || undefined}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={tags.length ? "" : placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            if (text.trim() && !strict) add([text]);
          }}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
            setError(undefined);
          }}
          onPaste={(e) => {
            const t = e.clipboardData.getData("text");
            if (/[,;\n\t]/.test(t)) {
              e.preventDefault();
              add(t.split(/[,;\n\t]+/));
            }
          }}
          onKeyDown={(e) => {
            if (open && e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(a + 1, matches.length - 1)));
            else if (open && e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
            else if (e.key === "Enter" || e.key === "," || (e.key === "Tab" && text.trim())) {
              if (!text.trim() && !open) return;
              e.preventDefault();
              add([open && matches[active] && (strict || !text.trim() || matches[active]!.toLowerCase().startsWith(text.trim().toLowerCase())) ? matches[active]! : text]);
            } else if (e.key === "Backspace" && !text && tags.length) remove(tags[tags.length - 1]!);
            else if (e.key === "Escape") setText("");
          }}
          className={cn("h-6 min-w-[80px] flex-1 bg-transparent px-1 text-ink outline-none placeholder:text-ink-4", texts[size])}
        />
      </div>
      {open ? (
        <ul id={listId} role="listbox" className={cn("absolute left-0 right-0 top-full m-0 mt-1 max-h-56 list-none overflow-y-auto p-1", floatingPanel)}>
          {matches.map((m, i) => (
            <li
              key={m}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                add([m]);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn("cursor-pointer rounded-md px-2.5 py-1.5 text-body", i === active ? "bg-surface-2 text-ink" : "text-ink-2")}
            >
              {m}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="m-0 text-small text-danger">{error}</p> : null}
    </div>
  );
}

/* ---------- NumberInput ---------- */

export interface NumberInputProps {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** How much the buttons and arrow keys change it; Shift+arrow changes it ten times as much. */
  step?: number;
  /** Decimal places kept: 2 for money. */
  precision?: number;
  /** Formats it while not typing: "decimal" (1,250.5), "percent" (shown with %), "currency" (with currency). */
  format?: "decimal" | "percent" | "currency";
  /** ISO code for format="currency". */
  currency?: string;
  locale?: string;
  /** Text before or after: "$", "seats", "kg". */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** stepper: − and + at the sides. arrows: small up and down at the right. none: no buttons. */
  controls?: "stepper" | "arrows" | "none";
  variant?: FieldVariant;
  size?: FieldSize;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

/** A number, typed or stepped, kept within min and max and shown formatted for the reader's locale. Emits the plain number. */
export function NumberInput({
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  precision,
  format = "decimal",
  currency = "USD",
  locale,
  prefix,
  suffix,
  controls = "stepper",
  variant = "outline",
  size = "md",
  invalid,
  disabled,
  id,
  name,
  placeholder,
  className,
  ...aria
}: NumberInputProps) {
  const [own, setOwn] = useState<number | null>(defaultValue);
  const n = value !== undefined ? value : own;
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (v: number) => {
    let x = v;
    if (min !== undefined) x = Math.max(min, x);
    if (max !== undefined) x = Math.min(max, x);
    if (precision !== undefined) x = Number(x.toFixed(precision));
    return x;
  };
  const set = (v: number | null) => {
    const c = v === null ? null : clamp(v);
    if (value === undefined) setOwn(c);
    onChange?.(c);
  };
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: format === "currency" ? "currency" : "decimal",
        currency: format === "currency" ? currency : undefined,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision ?? 6,
      }),
    [locale, format, currency, precision],
  );
  const parse = (s: string) => {
    const cleaned = s.replace(/[^\d.,\-]/g, "");
    if (!cleaned) return null;
    // Treat the last of . or , as the decimal mark.
    const lastSep = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
    const normal = lastSep > -1 && cleaned.length - lastSep - 1 <= (precision ?? 6) && cleaned.length - lastSep - 1 !== 3 ? cleaned.slice(0, lastSep).replace(/[.,]/g, "") + "." + cleaned.slice(lastSep + 1) : cleaned.replace(/[.,]/g, "");
    const x = Number(normal);
    return Number.isFinite(x) ? x : null;
  };
  const shown = draft ?? (n === null ? "" : format === "percent" ? fmt.format(n) : fmt.format(n));
  const bump = (dir: 1 | -1, big = false) => set((n ?? min ?? 0) + dir * step * (big ? 10 : 1));
  const atMin = min !== undefined && n !== null && n <= min;
  const atMax = max !== undefined && n !== null && n >= max;
  const btn = cn("grid h-full flex-none cursor-pointer place-items-center text-ink-3 hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40", focusRing);
  return (
    <span className={cn(fieldBox(variant, { invalid, disabled }), size === "sm" ? "h-7" : size === "lg" ? "h-10" : "h-8", "overflow-hidden", className)}>
      {controls === "stepper" ? (
        <button type="button" tabIndex={-1} aria-label="Less" disabled={disabled || atMin} onClick={() => bump(-1)} className={cn(btn, "w-8 border-r border-line")}>
          <MinusGlyph size={13} />
        </button>
      ) : null}
      {prefix ? <span className="pl-3 text-label text-ink-3">{prefix}</span> : null}
      <input
        id={id}
        inputMode="decimal"
        role="spinbutton"
        aria-valuenow={n ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        placeholder={placeholder}
        value={shown}
        onFocus={() => setDraft(n === null ? "" : String(n))}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== null) set(parse(draft));
          setDraft(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const base = draft !== null ? parse(draft) : n;
            const next = clamp((base ?? min ?? 0) + (e.key === "ArrowUp" ? 1 : -1) * step * (e.shiftKey ? 10 : 1));
            setDraft(String(next));
            set(next);
          } else if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
        }}
        className={cn("h-full min-w-0 flex-1 bg-transparent tabular-nums text-ink outline-none placeholder:text-ink-4", texts[size], controls === "stepper" ? "px-2 text-center" : "px-3", prefix && "pl-1.5", suffix && "pr-1.5")}
        {...aria}
      />
      {format === "percent" && draft === null && n !== null ? <span className="-ml-2 pr-2 text-label text-ink-3">%</span> : null}
      {suffix ? <span className="pr-3 text-label text-ink-3">{suffix}</span> : null}
      {controls === "stepper" ? (
        <button type="button" tabIndex={-1} aria-label="More" disabled={disabled || atMax} onClick={() => bump(1)} className={cn(btn, "w-8 border-l border-line")}>
          <PlusGlyph size={13} />
        </button>
      ) : controls === "arrows" ? (
        <span className="flex h-full flex-none flex-col border-l border-line">
          <button type="button" tabIndex={-1} aria-label="More" disabled={disabled || atMax} onClick={() => bump(1)} className={cn(btn, "h-1/2 w-6")}>
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 6.5 5 3.5l3 3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button type="button" tabIndex={-1} aria-label="Less" disabled={disabled || atMin} onClick={() => bump(-1)} className={cn(btn, "h-1/2 w-6 border-t border-line")}>
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </span>
      ) : null}
      {name ? <input type="hidden" name={name} value={n ?? ""} /> : null}
    </span>
  );
}

export interface CurrencyInputProps extends Omit<NumberInputProps, "format" | "currency" | "prefix" | "controls"> {
  /** The currency, as an ISO code. */
  currency?: string;
  /** Lets them change the currency: called with the new code. Shows a picker beside the amount. */
  onCurrencyChange?: (currency: string) => void;
  /** The codes offered in the picker. */
  currencies?: string[];
}

/** An amount of money: the currency beside it (pickable), two decimals, formatted for the reader. */
export function CurrencyInput({ currency = "USD", onCurrencyChange, currencies = ["USD", "EUR", "GBP", "JPY", "INR", "BRL", "NGN", "KES", "ZAR", "AUD", "CAD"], precision, size = "md", className, ...rest }: CurrencyInputProps) {
  const digits = precision ?? new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits;
  return (
    <span className={cn("flex w-full items-stretch", className)}>
      {onCurrencyChange ? (
        <select
          aria-label="Currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className={cn("-mr-px flex-none cursor-pointer rounded-l-md border border-line-strong bg-surface-2 px-2 font-medium text-ink-2 outline-none focus:border-focus", texts[size], size === "sm" ? "h-7" : size === "lg" ? "h-10" : "h-8")}
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      ) : null}
      <NumberInput
        {...rest}
        size={size}
        controls="none"
        format="decimal"
        precision={digits}
        prefix={onCurrencyChange ? undefined : currency}
        min={rest.min ?? 0}
        className={cn("flex-1", onCurrencyChange && "rounded-l-none")}
      />
    </span>
  );
}

/* ---------- InlineEdit ---------- */

export interface InlineEditProps {
  value: string;
  /** Saves the new value; return a promise to show "Saving…", throw (or reject) with a message to show it. */
  onSave: (value: string) => void | Promise<void>;
  /** Shown when there's no value: "Add a description". */
  placeholder?: string;
  /** Several lines. */
  multiline?: boolean;
  /** Checks before saving: return a message to refuse. */
  validate?: (value: string) => string | undefined;
  /** Look of the text: body, or title for a page's name. */
  size?: "body" | "title";
  /** Read by screen readers: "Customer name". */
  label: string;
  disabled?: boolean;
  className?: string;
}

/** A value that's edited where it's shown: click, change, Enter saves and Escape cancels. */
export function InlineEdit({ value, onSave, placeholder = "Click to add", multiline, validate, size = "body", label, disabled, className }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const text = size === "title" ? "text-title font-semibold" : "text-body";
  const save = async () => {
    if (draft === value) return setEditing(false);
    const msg = validate?.(draft);
    if (msg) return setError(msg);
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
      setError(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };
  if (!editing) {
    return (
      <button
        type="button"
        disabled={disabled}
        aria-label={`${label}: ${value || "empty"}. Edit`}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className={cn("group -mx-1.5 inline-flex max-w-full cursor-text items-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-left hover:border-line hover:bg-surface-2 disabled:cursor-default disabled:hover:border-transparent disabled:hover:bg-transparent", text, value ? "text-ink" : "text-ink-4", focusRing, className)}
      >
        <span className={cn("min-w-0", multiline ? "whitespace-pre-wrap" : "truncate")}>{value || placeholder}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-ink-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16z" />
        </svg>
      </button>
    );
  }
  const Field = multiline ? "textarea" : "input";
  return (
    <span className={cn("inline-flex w-full flex-col gap-1", className)}>
      <span className="flex items-start gap-1.5">
        <Field
          autoFocus
          aria-label={label}
          value={draft}
          disabled={saving}
          rows={multiline ? 3 : undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
            setDraft(e.target.value);
            setError(undefined);
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Escape") setEditing(false);
            if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void save();
            }
          }}
          className={cn(fieldBox("outline", { invalid: !!error }), "-mx-1.5 min-w-0 flex-1 px-1.5 py-0.5 outline-none", text, multiline && "resize-y")}
        />
        <Button size="sm" variant="primary" aria-label="Save" loading={saving} onClick={() => void save()} icon={saving ? undefined : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>} />
        <Button size="sm" aria-label="Cancel" disabled={saving} onClick={() => setEditing(false)} icon={<CloseGlyph size={13} />} />
      </span>
      {error ? <span className="text-small text-danger">{error}</span> : multiline ? <span className="text-caption text-ink-4">Ctrl+Enter saves, Escape cancels.</span> : null}
    </span>
  );
}

/* ---------- KeyValueEditor ---------- */

export interface KeyValuePair {
  key: string;
  value: string;
  /** Hidden like a password: tokens, passwords. */
  secret?: boolean;
}

export interface KeyValueEditorProps {
  value?: KeyValuePair[];
  defaultValue?: KeyValuePair[];
  onChange?: (pairs: KeyValuePair[]) => void;
  /** Column names: "Name" and "Value", or "Header" and "Value". */
  keyLabel?: string;
  valueLabel?: string;
  /** Lets each row be marked secret. */
  secrets?: boolean;
  /** Keys must look like this: env names are /^[A-Z_][A-Z0-9_]*$/. */
  keyPattern?: RegExp;
  /** Words for the add button: "Add variable". */
  addLabel?: string;
  className?: string;
}

/**
 * Pairs of keys and values: environment variables, request headers, metadata.
 * Duplicate keys are flagged; pasting a .env file fills many rows at once.
 */
export function KeyValueEditor({ value, defaultValue = [{ key: "", value: "" }], onChange, keyLabel = "Key", valueLabel = "Value", secrets = true, keyPattern, addLabel = "Add another", className }: KeyValueEditorProps) {
  const [own, setOwn] = useState(defaultValue);
  const rows = value ?? own;
  const [shown, setShown] = useState<number[]>([]);
  const set = (next: KeyValuePair[]) => {
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };
  const patch = (i: number, p: Partial<KeyValuePair>) => set(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const counts = rows.reduce<Record<string, number>>((acc, r) => (r.key ? { ...acc, [r.key]: (acc[r.key] ?? 0) + 1 } : acc), {});
  const cell = "h-8 min-w-0 rounded-md border border-line-strong bg-surface px-2.5 font-mono text-[12.5px] text-ink outline-none placeholder:font-sans placeholder:text-ink-4 focus:border-focus focus:outline-1 focus:outline-focus";
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2 text-caption font-medium text-ink-3">
        <span>{keyLabel}</span>
        <span>{valueLabel}</span>
        <span className="w-[60px]" />
      </div>
      {rows.map((r, i) => {
        const dup = r.key && (counts[r.key] ?? 0) > 1;
        const bad = r.key && keyPattern && !keyPattern.test(r.key);
        const hide = r.secret && !shown.includes(i);
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-2">
              <input
                aria-label={`${keyLabel} ${i + 1}`}
                aria-invalid={!!(dup || bad) || undefined}
                value={r.key}
                placeholder="NAME"
                onChange={(e) => patch(i, { key: e.target.value })}
                onPaste={(e) => {
                  const t = e.clipboardData.getData("text");
                  if (!t.includes("\n") && !t.includes("=")) return;
                  e.preventDefault();
                  const parsed = t
                    .split(/\r?\n/)
                    .map((l) => l.trim())
                    .filter((l) => l && !l.startsWith("#") && l.includes("="))
                    .map((l) => {
                      const at = l.indexOf("=");
                      return { key: l.slice(0, at).replace(/^export\s+/, "").trim(), value: l.slice(at + 1).trim().replace(/^["']|["']$/g, "") };
                    });
                  set([...rows.slice(0, i), ...parsed, ...rows.slice(i + 1)].filter((x, j, all) => x.key || j === all.length - 1));
                }}
                className={cn(cell, (dup || bad) && "border-danger")}
              />
              <input
                aria-label={`${valueLabel} ${i + 1}`}
                type={hide ? "password" : "text"}
                value={r.value}
                placeholder="value"
                onChange={(e) => patch(i, { value: e.target.value })}
                className={cell}
              />
              <span className="flex w-[60px] items-center justify-end gap-0.5">
                {secrets ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={r.secret ? (hide ? "Show value" : "Hide value") : "Mark as secret"}
                    aria-pressed={!!r.secret}
                    icon={r.secret && !hide ? <EyeGlyph size={14} /> : <EyeOffGlyph size={14} className={r.secret ? "text-ink" : undefined} />}
                    onClick={() => {
                      if (!r.secret) patch(i, { secret: true });
                      else setShown((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
                    }}
                  />
                ) : null}
                <Button variant="ghost" size="sm" aria-label={`Remove row ${i + 1}`} icon={<CloseGlyph size={13} />} onClick={() => set(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ key: "", value: "" }])} />
              </span>
            </div>
            {dup ? <span className="text-small text-danger">{r.key} is used twice; the last one wins.</span> : bad ? <span className="text-small text-danger">Use capital letters, digits and _ only.</span> : null}
          </div>
        );
      })}
      <div className="flex items-center gap-3">
        <Button variant="dashed" size="sm" icon={<PlusGlyph size={13} />} onClick={() => set([...rows, { key: "", value: "" }])}>
          {addLabel}
        </Button>
        <span className="text-caption text-ink-4">Tip: paste a .env file into a name field.</span>
      </div>
    </div>
  );
}

/* ---------- ApiKeyField ---------- */

export interface ApiKeyFieldProps {
  /** The full key. Leave it off after the first view: only the start and end are shown. */
  value?: string;
  /** The start and end, for keys you can't show again: "sk_live_…3f9a". */
  masked?: string;
  /** Its name: "Production server". */
  name?: React.ReactNode;
  /** "Created 3 Mar 2026 · Last used 2 hours ago". */
  meta?: React.ReactNode;
  /** Just created: a warning that it won't be shown again, and it starts revealed. */
  fresh?: boolean;
  /** Shows Revoke; called when it's confirmed. */
  onRevoke?: () => void;
  className?: string;
}

/** An API key or secret: hidden until asked, copyable, with when it was made and used, and Revoke. */
export function ApiKeyField({ value, masked, name, meta, fresh, onRevoke, className }: ApiKeyFieldProps) {
  const [shown, setShown] = useState(!!fresh);
  const [confirm, setConfirm] = useState(false);
  const dots = value ? `${value.slice(0, 7)}${"•".repeat(Math.max(8, Math.min(24, value.length - 11)))}${value.slice(-4)}` : masked;
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border bg-surface p-3", fresh ? "border-warning" : "border-line", className)}>
      {name || meta ? (
        <div className="flex items-baseline justify-between gap-3">
          {name ? <span className="text-label font-semibold text-ink">{name}</span> : null}
          {meta ? <span className="text-caption text-ink-3">{meta}</span> : null}
        </div>
      ) : null}
      <div className="flex items-center gap-1.5">
        <code className="flex h-8 min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap rounded-md border border-line bg-surface-2 px-2.5 font-mono text-[12.5px] text-ink">{shown && value ? value : dots}</code>
        {value ? <Button variant="ghost" size="md" aria-label={shown ? "Hide key" : "Show key"} aria-pressed={shown} icon={shown ? <EyeOffGlyph size={15} /> : <EyeGlyph size={15} />} onClick={() => setShown(!shown)} /> : null}
        {value ? <CopyButton value={value} size="md" variant="secondary" /> : null}
        {onRevoke ? (
          confirm ? (
            <span className="flex items-center gap-1">
              <Button size="md" variant="danger" onClick={() => { setConfirm(false); onRevoke(); }}>
                Revoke
              </Button>
              <Button size="md" variant="ghost" onClick={() => setConfirm(false)}>
                Keep
              </Button>
            </span>
          ) : (
            <Button size="md" variant="danger-soft" onClick={() => setConfirm(true)}>
              Revoke
            </Button>
          )
        ) : null}
      </div>
      {confirm ? <p className="m-0 text-small text-danger">Anything using this key stops working at once. This can't be undone.</p> : null}
      {fresh ? <p className="m-0 text-small text-ink-2">Copy it now and keep it somewhere safe: it won&apos;t be shown again.</p> : null}
    </div>
  );
}

/* ---------- Slider ---------- */

export interface SliderProps {
  /** One value, or two for a range: [20, 80]. */
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shows the value(s) above the track, formatted. */
  format?: (n: number) => string;
  /** Tick labels under the track: [0, 50, 100]. */
  marks?: number[];
  /** Read by screen readers: "Price", or two for a range: ["Lowest price", "Highest price"]. */
  label: string | [string, string];
  disabled?: boolean;
  className?: string;
}

/** A value, or a range, picked along a track: a price range, a limit, a percentage. Arrow keys move it. */
export function Slider({ value, defaultValue, onChange, min = 0, max = 100, step = 1, format = String, marks, label, disabled, className }: SliderProps) {
  const [own, setOwn] = useState<number | [number, number]>(defaultValue ?? min);
  const v = value ?? own;
  const range = Array.isArray(v);
  const vals = range ? v : [v];
  const track = useRef<HTMLDivElement>(null);
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const snap = (n: number) => Math.min(max, Math.max(min, Math.round((n - min) / step) * step + min));
  const set = (i: number, n: number) => {
    let next: number | [number, number];
    if (range) {
      const pair: [number, number] = [...(v as [number, number])];
      pair[i] = snap(n);
      if (pair[0] > pair[1]) pair.reverse();
      next = pair;
    } else next = snap(n);
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };
  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return min + ((clientX - r.left) / r.width) * (max - min);
  };
  const drag = (i: number) => (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    const move = (ev: PointerEvent) => set(i, fromPointer(ev.clientX));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const lo = range ? pct(vals[0]!) : 0;
  const hi = pct(vals[range ? 1 : 0]!);
  return (
    <div className={cn("flex w-full flex-col gap-2 py-1", disabled && "opacity-50", className)}>
      <div
        ref={track}
        className="relative mx-2 h-5 cursor-pointer touch-none"
        onPointerDown={(e) => {
          if (disabled) return;
          const n = fromPointer(e.clientX);
          const i = range ? (Math.abs(n - vals[0]!) <= Math.abs(n - vals[1]!) ? 0 : 1) : 0;
          set(i, n);
          drag(i)(e);
        }}
      >
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-2 ring-1 ring-inset ring-line" />
        <span className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
        {vals.map((n, i) => (
          <span
            key={i}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={Array.isArray(label) ? label[i] : label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={n}
            aria-valuetext={format(n)}
            onPointerDown={(e) => {
              e.stopPropagation();
              drag(i)(e);
            }}
            onKeyDown={(e) => {
              const big = (max - min) / 10;
              const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? step : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -step : e.key === "PageUp" ? big : e.key === "PageDown" ? -big : 0;
              if (e.key === "Home") (e.preventDefault(), set(i, min));
              else if (e.key === "End") (e.preventDefault(), set(i, max));
              else if (d) (e.preventDefault(), set(i, n + d));
            }}
            className={cn("group absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-accent bg-surface shadow-2 active:cursor-grabbing", focusRing)}
            style={{ left: `${pct(n)}%` }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-1.5 py-0.5 text-caption tabular-nums text-ground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100">{format(n)}</span>
          </span>
        ))}
      </div>
      {marks ? (
        <div className="relative mx-2 h-4">
          {marks.map((m) => (
            <span key={m} className="absolute -translate-x-1/2 text-caption tabular-nums text-ink-3" style={{ left: `${pct(m)}%` }}>
              {format(m)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
