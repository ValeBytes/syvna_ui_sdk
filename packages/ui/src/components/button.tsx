"use client";

import { forwardRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { buttonBase as base, buttonLooks as variants, buttonSizes as sizes, type ButtonSize, type ButtonVariant } from "./button-class";
import { CheckGlyph, ChevronDownGlyph, CopyGlyph } from "./icons";
import { Menu, type MenuItem } from "./menu";
import { Spinner } from "./spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary: the one main action in a view. secondary: everything else. ghost: in toolbars and rows.
   * danger: deletes. soft: a tinted second action. outline: bordered in the brand colour. subtle: a
   * grey fill, for filters. link: text that acts. dashed: "Add another…" at the end of a list.
   * inverse: on the ink colour, for dark bands. gradient: a launch or upgrade moment, once per page.
   * success: approve, confirm. danger-soft: a quieter destructive action (Remove, Revoke).
   * For a shop's or landing page's main action (Add to cart, Check out, Start free), one look used
   * everywhere: raised (a solid edge that presses in), shine (a sheen crosses it on hover), fill (an
   * outline that fills with the brand colour), hard (an outlined button on a hard brand-coloured shadow, for bold brands),
   * underline (text over a line that draws in, for quiet premium brands). Not for app screens.
   */
  variant?: ButtonVariant;
  /** xs in dense rows, sm in tables and toolbars, md everywhere else, lg and xl for a page's one call to action. */
  size?: ButtonSize;
  /** default: the radius of the design. pill: fully round. square: no rounding, for joined bars. */
  shape?: "default" | "pill" | "square";
  /** Shows a spinner in place of the icon and stops clicks until it's done. */
  loading?: boolean;
  /** An icon before the label; alone, it makes a square icon button (give it an aria-label). */
  icon?: React.ReactNode;
  /** An icon after the label, such as a chevron. */
  iconRight?: React.ReactNode;
  /** A count after the label: unread, selected, waiting. */
  badge?: React.ReactNode;
  /** A key hint after the label: "⌘K", "N". */
  shortcut?: string;
  /** Full width of its container. */
  block?: boolean;
  /**
   * Classes for the button's inner parts, when a design needs one adjusted: label (the words), badge,
   * shortcut. They win over the button's own. className is the button itself.
   * classNames={{ label: "uppercase tracking-[0.08em]" }}
   */
  classNames?: { label?: string; badge?: string; shortcut?: string };
}

/** A button. Verb first, sentence case: "Save changes", "Add customer". */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", shape = "default", loading = false, icon, iconRight, badge, shortcut, block, className, classNames, children, disabled, type = "button", ...rest },
  ref,
) {
  const iconOnly = children == null || children === false;
  const loud = variant === "primary" || variant === "danger" || variant === "inverse" || variant === "gradient" || variant === "success" || variant === "raised" || variant === "shine";
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        base,
        focusRing,
        variants[variant],
        sizes[size].text,
        shape === "pill" ? "rounded-full" : shape === "square" ? "rounded-none" : sizes[size].radius,
        iconOnly && sizes[size].icon,
        block && "flex w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size={size === "xs" || size === "sm" ? 13 : 15} /> : icon}
      {iconOnly ? null : <span className={cn("relative truncate", classNames?.label)}>{children}</span>}
      {badge !== undefined && badge !== null ? (
        <span className={cn("ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-caption font-semibold tabular-nums", loud ? "bg-black/15 text-inherit" : "bg-surface-2 text-ink-2", classNames?.badge)}>{badge}</span>
      ) : null}
      {shortcut ? <kbd className={cn("ml-1 rounded-sm border px-1 font-sans text-caption font-normal", loud ? "border-current/30 opacity-80" : "border-line text-ink-3", classNames?.shortcut)}>{shortcut}</kbd> : null}
      {iconRight}
    </button>
  );
});

export interface ButtonGroupProps {
  /** Buttons that belong together: Day / Week / Month, Bold / Italic, Previous / Next. */
  children: React.ReactNode;
  /** Read by screen readers: "Text style". */
  label?: string;
  /** Joined into one bar (the default), or separate with a small gap. */
  attached?: boolean;
  className?: string;
}

/** Buttons joined into one bar, so they read as one control. */
export function ButtonGroup({ children, label, attached = true, className }: ButtonGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-stretch",
        attached
          ? "[&>*]:rounded-none [&>*]:shadow-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px [&>*:focus-visible]:z-10 [&>*:hover]:z-10 shadow-1 rounded-md"
          : "gap-1.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface SplitButtonProps {
  /** The main action's words: "Save". */
  children: React.ReactNode;
  /** The main action. */
  onClick?: () => void;
  /** The other ways to do it, in the menu: Save as draft, Save and send. */
  items: MenuItem[];
  variant?: "primary" | "secondary" | "soft";
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Read by screen readers on the arrow: "More ways to save". */
  menuLabel?: string;
  className?: string;
}

/** One main action and its alternatives behind an arrow: Save, with Save as draft and Save and send in the menu. */
export function SplitButton({ children, onClick, items, variant = "primary", size = "md", icon, loading, disabled, menuLabel = "More options", className }: SplitButtonProps) {
  return (
    <ButtonGroup className={className}>
      <Button variant={variant} size={size} icon={icon} loading={loading} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
      <Menu
        label={menuLabel}
        items={items}
        trigger={<Button variant={variant} size={size} aria-label={menuLabel} disabled={disabled} icon={<ChevronDownGlyph size={14} />} className={cn(variant === "primary" && "border-l-black/15")} />}
      />
    </ButtonGroup>
  );
}

export interface ToggleButtonProps extends Omit<ButtonProps, "onChange" | "variant"> {
  /** On or off, when you keep it yourself. */
  pressed?: boolean;
  defaultPressed?: boolean;
  /** Called with the new state. */
  onPressedChange?: (pressed: boolean) => void;
}

/** A button that stays on until pressed again: Bold, Pin, Follow, Mute. */
export function ToggleButton({ pressed, defaultPressed = false, onPressedChange, className, ...rest }: ToggleButtonProps) {
  const [own, setOwn] = useState(defaultPressed);
  const on = pressed ?? own;
  return (
    <Button
      {...rest}
      variant="ghost"
      aria-pressed={on}
      onClick={() => {
        setOwn(!on);
        onPressedChange?.(!on);
      }}
      className={cn(on && "bg-brand-soft text-ink hover:not-disabled:bg-brand-soft", className)}
    />
  );
}

export interface CopyButtonProps {
  /** What's copied. */
  value: string;
  /** The words; an icon-only button without them. */
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Copies a value (an API key, an ID, a link) and says so for two seconds. */
export function CopyButton({ value, children, variant = "ghost", size = "sm", className }: CopyButtonProps) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={children ? undefined : done ? "Copied" : "Copy"}
      icon={done ? <CheckGlyph size={14} className="text-success" /> : <CopyGlyph size={14} />}
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className={className}
    >
      {children ? (done ? "Copied" : children) : null}
    </Button>
  );
}
