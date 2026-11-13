"use client";

import { Children, cloneElement, isValidElement, useId } from "react";

import { cn } from "../cx";

export interface FieldProps {
  /** What goes in the field: a short noun, "Email address". */
  label: React.ReactNode;
  /** Help under the field: what goes in it, a format. Hidden while there's an error. */
  hint?: React.ReactNode;
  /** What's wrong, in a sentence that says how to fix it. */
  error?: React.ReactNode;
  /** Marks the label; the control still needs its own required. */
  required?: boolean;
  /** Something small on the label's right: "Optional", a link. */
  aside?: React.ReactNode;
  /** One control: Input, Textarea, Select. It gets the id, aria and invalid it needs. */
  children: React.ReactNode;
  className?: string;
}

/** A label, a control, and its hint or error, wired together for screen readers. */
export function Field({ label, hint, error, required, aside, children, className }: FieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  const only = Children.count(children) === 1 && isValidElement(children) ? children : null;
  const own = only ? (only.props as { id?: string; invalid?: boolean }) : null;
  const controlId = own ? (own.id ?? id) : undefined;
  const control = only
    ? cloneElement(only as React.ReactElement<Record<string, unknown>>, {
        id: controlId,
        "aria-describedby": note ? noteId : undefined,
        invalid: error ? true : own?.invalid,
      })
    : children;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-label font-medium text-ink" htmlFor={controlId}>
          {label}
          {required ? (
            <span className="ml-0.5 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {aside ? <span className="text-small text-ink-3">{aside}</span> : null}
      </div>
      {control}
      {note ? (
        <p id={noteId} className={cn("m-0 text-small", error ? "text-danger" : "text-ink-3")} role={error ? "alert" : undefined}>
          {note}
        </p>
      ) : null}
    </div>
  );
}
