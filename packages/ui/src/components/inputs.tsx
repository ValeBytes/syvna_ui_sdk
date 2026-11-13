"use client";

import { forwardRef, useId, useImperativeHandle, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { CheckGlyph, ChevronDownGlyph, CloseGlyph, CopyGlyph, EyeGlyph, EyeOffGlyph } from "./icons";
import { Spinner } from "./spinner";

export const fieldVariants = ["outline", "filled", "underline", "cupertino", "pill", "ghost", "floating", "notched", "soft", "inset", "elevated", "bold", "dashed", "minimal", "inline"] as const;
export type FieldVariant = (typeof fieldVariants)[number];
export type FieldSize = "sm" | "md" | "lg";

/** The box every text control shares, as outline; each variant overrides what it changes. */
const box =
  "relative flex w-full items-center rounded-md border border-line-strong bg-surface text-ink shadow-1 transition-[border-color,background-color,box-shadow] duration-150 " +
  "hover:border-ink-4 focus-within:border-focus focus-within:outline-1 focus-within:outline-focus";

const variants: Record<FieldVariant, string> = {
  outline: "",
  filled:
    "rounded-b-none border-0 border-b border-line-strong bg-surface-2 shadow-none hover:bg-[color-mix(in_oklch,var(--color-surface-2),var(--color-ink)_4%)] focus-within:border-b-2 focus-within:border-brand focus-within:outline-none",
  underline:
    "rounded-none border-0 border-b border-line-strong bg-transparent shadow-none focus-within:border-b-2 focus-within:border-brand focus-within:outline-none",
  cupertino:
    "rounded-[10px] border-transparent bg-surface-2 shadow-none hover:border-transparent focus-within:border-transparent focus-within:outline-none focus-within:ring-[3px] focus-within:ring-[color-mix(in_oklch,var(--color-focus)_35%,transparent)]",
  pill: "rounded-full",
  ghost: "border-transparent bg-transparent shadow-none hover:border-transparent hover:bg-surface-2 focus-within:border-line-strong focus-within:bg-surface",
  floating:
    "rounded-b-none border-0 border-b border-line-strong bg-surface-2 shadow-none hover:bg-[color-mix(in_oklch,var(--color-surface-2),var(--color-ink)_4%)] focus-within:border-b-2 focus-within:border-brand focus-within:outline-none",
  notched: "shadow-none focus-within:border-brand focus-within:outline-1 focus-within:outline-brand",
  soft: "border-transparent bg-brand-soft shadow-none hover:border-transparent focus-within:border-brand focus-within:bg-surface focus-within:outline-none",
  inset: "border-line bg-surface-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] focus-within:bg-surface",
  elevated: "border-transparent shadow-2 hover:border-transparent focus-within:border-focus",
  bold: "border-2 border-ink-4 shadow-none hover:border-ink-3 focus-within:border-brand focus-within:outline-none",
  dashed: "border-dashed shadow-none focus-within:border-solid",
  minimal:
    "rounded-none border-0 border-b border-transparent bg-transparent shadow-none hover:border-line focus-within:border-b-2 focus-within:border-brand focus-within:outline-none",
  inline: "",
};

const heights: Record<FieldSize, string> = { sm: "h-7", md: "h-8", lg: "h-10" };
const labelled: Record<FieldSize, string> = { sm: "h-10", md: "h-12", lg: "h-14" };
const texts: Record<FieldSize, string> = { sm: "text-small", md: "text-body", lg: "text-body-lg" };
const sides = (variant: FieldVariant) => (variant === "pill" ? "px-4" : variant === "underline" ? "px-0.5" : "px-3");

const invalidBox = "border-danger hover:border-danger focus-within:border-danger";
const disabledBox = "cursor-not-allowed bg-surface-2 text-ink-4 shadow-none hover:border-line-strong";

/** A text control's box, in a variant: for a custom control that should sit with Inputs. */
export function fieldBox(variant: FieldVariant = "outline", opts: { invalid?: boolean; disabled?: boolean } = {}) {
  return cn(box, variants[variant], opts.invalid && invalidBox, opts.disabled && disabledBox);
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * outline: a bordered box (the default). filled: a grey fill and a line that thickens on focus.
   * underline: only a bottom line, for dense forms. cupertino: iOS's grey rounded field. pill:
   * fully rounded, for search. ghost: no box until hovered, for editing in place. floating: filled,
   * the label inside rising as you type. notched: outlined, the label rising onto the border.
   * soft: a brand tint. inset: sunken. elevated: a shadow instead of a border. bold: a 2px border.
   * dashed: a dashed border, for optional or draft values. minimal: a line only on hover and focus.
   * inline: the label inside on the left, for settings rows.
   */
  variant?: FieldVariant;
  /** sm in tables and toolbars, md by default, lg on sign-in and other short forms. */
  size?: FieldSize;
  /** The label drawn inside the field, for the floating, notched and inline variants. */
  label?: string;
  /** Shown inside the field before the text: an icon or a unit ("$"). */
  leading?: React.ReactNode;
  /** Shown inside the field after the text: a unit ("kg") or a small button. */
  trailing?: React.ReactNode;
  /** Joined to the field's left as a grey block: "https://", a currency. */
  addonBefore?: React.ReactNode;
  /** Joined to the field's right as a grey block: ".com", a unit. */
  addonAfter?: React.ReactNode;
  /** A small button inside, at the right: Apply (a coupon), Verify, Send. */
  action?: React.ReactNode;
  /** A cross that empties the field, shown once there's text. */
  clearable?: boolean;
  /** Shows how many characters of maxLength are used: 12/80. */
  counter?: boolean;
  /** A spinner at the right: checking a name, searching. */
  loading?: boolean;
  /** A button that copies the value: API keys, IDs, links. Usually with readOnly. */
  copyable?: boolean;
  /** A key hint at the right: "⌘K", "/". */
  shortcut?: string;
  /** Draws the field in danger; Field sets it when it has an error. */
  invalid?: boolean;
  /** A green tick and border: the value was checked and is good (a free username, a valid VAT number). */
  valid?: boolean;
  /** For type="password": an eye button that shows what was typed. On unless false. */
  reveal?: boolean;
}

const tool = cn("grid size-6 flex-none cursor-pointer place-items-center rounded-sm text-ink-3 hover:text-ink disabled:cursor-not-allowed", focusRing);

/**
 * A one-line text field, in fifteen looks, with the extras forms need: a clear
 * button, a counter, a copy button, add-ons, an inline action. Put it in a Field
 * for its label, hint and error (or use floating, notched or inline, which draw
 * the label inside). A password field has a button that shows what was typed.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = "outline",
    size = "md",
    label,
    leading,
    trailing,
    addonBefore,
    addonAfter,
    action,
    clearable,
    counter,
    loading,
    copyable,
    shortcut,
    invalid,
    valid,
    reveal = true,
    className,
    type = "text",
    id,
    placeholder,
    onChange,
    ...rest
  },
  ref,
) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  const [ownLength, setOwnLength] = useState(String(rest.defaultValue ?? "").length);
  const length = rest.value !== undefined ? String(rest.value).length : ownLength;
  const auto = useId();
  const inputId = id ?? auto;
  const password = type === "password" && reveal;
  const inside = (variant === "floating" || variant === "notched") && !!label;
  const inlineLabel = variant === "inline" && !!label;

  const clear = () => {
    const el = inner.current;
    if (!el) return;
    // Through the native setter, so React's onChange hears it like typing.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, "");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
  };

  const extras = (
    <>
      {loading ? <Spinner size={14} className="mr-2 flex-none text-ink-3" /> : null}
      {valid && !loading ? <CheckGlyph size={15} className="mr-2 flex-none text-success" /> : null}
      {clearable && length > 0 && !rest.disabled && !rest.readOnly ? (
        <button type="button" aria-label="Clear" onClick={clear} className={cn(tool, "mr-1")}>
          <CloseGlyph size={13} />
        </button>
      ) : null}
      {counter && rest.maxLength ? (
        <span className={cn("mr-2.5 flex-none text-caption tabular-nums", length >= rest.maxLength ? "text-danger" : "text-ink-4")}>
          {length}/{rest.maxLength}
        </span>
      ) : null}
      {shortcut && length === 0 ? <kbd className="mr-2 flex-none rounded-sm border border-line px-1.5 font-sans text-caption text-ink-3">{shortcut}</kbd> : null}
      {copyable ? (
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy"}
          onClick={() => {
            void navigator.clipboard?.writeText(inner.current?.value ?? "");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={cn(tool, "mr-1.5")}
        >
          {copied ? <CheckGlyph size={14} className="text-success" /> : <CopyGlyph size={14} />}
        </button>
      ) : null}
      {password ? (
        <button
          type="button"
          onClick={() => setShown(!shown)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          disabled={rest.disabled}
          className={cn(tool, "mr-1.5")}
        >
          {shown ? <EyeOffGlyph size={15} /> : <EyeGlyph size={15} />}
        </button>
      ) : null}
      {action ? <span className="mr-1 flex flex-none items-center [&>button]:h-[calc(100%-6px)]">{action}</span> : null}
    </>
  );

  const field = (
    <span
      className={cn(
        fieldBox(variant, { invalid, disabled: rest.disabled }),
        valid && !invalid && "border-success hover:border-success",
        inside ? labelled[size] : heights[size],
        addonBefore && "rounded-l-none",
        addonAfter && "rounded-r-none",
        addonBefore || addonAfter ? "min-w-0 flex-1" : className,
      )}
    >
      {inlineLabel ? (
        <label htmlFor={inputId} className={cn("flex h-full flex-none items-center border-r border-line pl-3 pr-3 text-ink-3", texts[size])}>
          {label}
        </label>
      ) : null}
      {leading && !inside ? <span className={cn("inline-flex items-center text-label text-ink-3", variant === "underline" || variant === "minimal" ? "pl-0.5" : "pl-3")}>{leading}</span> : null}
      <input
        ref={inner}
        id={inputId}
        type={password && shown ? "text" : type}
        aria-invalid={invalid || undefined}
        placeholder={inside ? (placeholder ?? " ") : placeholder}
        onChange={(e) => {
          setOwnLength(e.target.value.length);
          onChange?.(e);
        }}
        className={cn(
          "peer h-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-ink-4 disabled:cursor-not-allowed",
          texts[size],
          variant === "minimal" ? "px-0.5" : sides(variant),
          leading && !inside && "pl-2",
          (trailing || password || clearable || copyable || action || loading || valid || counter || shortcut) && "pr-2",
          variant === "floating" && inside && "pt-4",
          inside && "placeholder:text-transparent focus:placeholder:text-ink-4",
        )}
        {...rest}
      />
      {inside ? (
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute top-1/2 origin-left -translate-y-1/2 text-ink-3 transition-[top,font-size,color,transform] duration-150 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
            texts[size],
            variant === "floating"
              ? "left-3 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-caption peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-caption"
              : "left-2 rounded-sm bg-surface px-1 peer-focus:top-0 peer-focus:text-caption peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-caption",
            invalid && "text-danger peer-focus:text-danger",
          )}
        >
          {label}
        </label>
      ) : null}
      {trailing ? <span className="inline-flex items-center pr-3 text-label text-ink-3">{trailing}</span> : null}
      {extras}
    </span>
  );

  if (!addonBefore && !addonAfter) return field;
  const addon = cn("inline-flex flex-none items-center border border-line-strong bg-surface-2 px-3 text-ink-3", texts[size], heights[size]);
  return (
    <span className={cn("flex w-full items-stretch", className)}>
      {addonBefore ? <span className={cn(addon, "-mr-px rounded-l-md")}>{addonBefore}</span> : null}
      {field}
      {addonAfter ? <span className={cn(addon, "-ml-px rounded-r-md")}>{addonAfter}</span> : null}
    </span>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Draws the field in danger; Field sets it when it has an error. */
  invalid?: boolean;
  /** The same looks as Input, but floating and notched draw as filled and outline (a Textarea's label goes in a Field). */
  variant?: FieldVariant;
}

/** Text over several lines: notes, descriptions, messages. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, variant = "outline", className, rows = 4, ...rest },
  ref,
) {
  const look = variant === "floating" ? "filled" : variant === "notched" ? "outline" : variant;
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldBox(look, { invalid, disabled: rest.disabled }),
        "block min-h-20 resize-y py-1.5 text-body outline-none placeholder:text-ink-4",
        look === "pill" ? "rounded-[18px] px-4" : sides(look),
        look === "outline" || look === "ghost" || look === "pill" ? "focus-visible:border-focus focus-visible:outline-1 focus-visible:outline-solid focus-visible:outline-focus" : "",
        look === "filled" || look === "underline" ? "focus-visible:border-b-2 focus-visible:border-brand" : "",
        look === "cupertino" ? "focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklch,var(--color-focus)_35%,transparent)]" : "",
        className,
      )}
      {...rest}
    />
  );
});

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children" | "size"> {
  /** The choices: { value, label, disabled? }. */
  options: SelectOption[];
  /** A first, empty choice shown until one is picked. */
  placeholder?: string;
  /** Draws the field in danger; Field sets it when it has an error. */
  invalid?: boolean;
  /** The same looks as Input; floating and notched draw as filled and outline. */
  variant?: FieldVariant;
  /** sm in tables and toolbars, md by default, lg on short forms. */
  size?: FieldSize;
}

/** Pick one from a short list (under about 12). The browser's own list opens, so it works on phones and with a keyboard. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, invalid, variant = "outline", size = "md", className, defaultValue, value, ...rest },
  ref,
) {
  const look = variant === "floating" ? "filled" : variant === "notched" ? "outline" : variant;
  const controlled = value !== undefined;
  return (
    <span className={cn(fieldBox(look, { invalid, disabled: rest.disabled }), heights[size], className)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent pr-8 text-inherit outline-none disabled:cursor-not-allowed",
          texts[size],
          look === "pill" ? "pl-4" : look === "underline" ? "pl-0.5" : "pl-3",
          "has-[option[value='']:checked]:text-ink-4 [&_option]:bg-surface [&_option]:text-ink",
        )}
        {...(controlled ? { value } : { defaultValue: defaultValue ?? (placeholder ? "" : undefined) })}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDownGlyph size={15} className="pointer-events-none absolute right-2.5 text-ink-3" />
    </span>
  );
});
