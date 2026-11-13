"use client";

import { forwardRef, useId, useState } from "react";

import { cn, focusRing } from "../cx";
import { CheckGlyph } from "./icons";

function Text({ label, description }: { label?: React.ReactNode; description?: React.ReactNode }) {
  if (!label && !description) return null;
  return (
    <span className="flex flex-col gap-0.5">
      {label ? <span className="text-label font-medium text-ink">{label}</span> : null}
      {description ? <span className="text-small text-ink-3">{description}</span> : null}
    </span>
  );
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** What checking it means: "Email me when an order is placed". */
  label?: React.ReactNode;
  /** A line under the label. */
  description?: React.ReactNode;
}

/** On or off for one thing, or one of several in a list. Takes effect when the form is saved; for an instant setting use Switch. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <label
      htmlFor={inputId}
      className={cn("inline-flex cursor-pointer items-start gap-2", rest.disabled && "cursor-not-allowed opacity-55", className)}
    >
      <span className="relative mt-px inline-flex size-4 flex-none">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "peer absolute inset-0 m-0 cursor-[inherit] appearance-none rounded-[4px] border border-line-strong bg-surface transition-colors",
            "hover:enabled:border-ink-3 checked:border-brand checked:bg-brand",
            focusRing,
          )}
          {...rest}
        />
        <CheckGlyph
          size={12}
          className="pointer-events-none absolute inset-0.5 scale-60 text-brand-ink opacity-0 transition duration-150 peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
        />
      </span>
      <Text label={label} description={description} />
    </label>
  );
});

export interface SwitchProps {
  /** On or off, when you keep it yourself. */
  checked?: boolean;
  /** On or off at first. */
  defaultChecked?: boolean;
  /** Called with the new state when it's flipped. */
  onCheckedChange?: (checked: boolean) => void;
  /** The setting's name: "Online bookings". */
  label?: React.ReactNode;
  /** A line under the label: what it changes. */
  description?: React.ReactNode;
  /** Shown but can't be flipped. */
  disabled?: boolean;
  /** Submitted with a form as "on" when checked. */
  name?: string;
  /** The switch's id; one is made if not given. */
  id?: string;
  className?: string;
}

/** A setting that takes effect at once: notifications on, a product visible. */
export function Switch({ checked, defaultChecked = false, onCheckedChange, label, description, disabled, name, id, className }: SwitchProps) {
  const [own, setOwn] = useState(defaultChecked);
  const on = checked ?? own;
  const auto = useId();
  const switchId = id ?? auto;
  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setOwn(!on);
    onCheckedChange?.(!on);
  };
  return (
    <span className={cn("inline-flex items-start gap-2", disabled && "opacity-55", className)}>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "group relative mt-px h-[18px] w-8 flex-none cursor-pointer rounded-full bg-line-strong transition-colors duration-200 aria-checked:bg-brand disabled:cursor-not-allowed motion-reduce:transition-none",
          focusRing,
        )}
      >
        <span className="absolute left-0.5 top-0.5 size-[14px] rounded-full bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-[cubic-bezier(.16,1,.3,1)] group-aria-checked:translate-x-[14px] group-aria-checked:bg-brand-ink motion-reduce:transition-none" />
      </button>
      {name && on ? <input type="hidden" name={name} value="on" /> : null}
      {label || description ? (
        <label htmlFor={switchId} className={cn("cursor-pointer", disabled && "cursor-not-allowed")}>
          <Text label={label} description={description} />
        </label>
      ) : null}
    </span>
  );
}
