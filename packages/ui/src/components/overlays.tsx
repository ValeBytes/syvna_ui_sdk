"use client";

import { useId } from "react";

import { cn, focusRing, toneSoft, toneText, type Tone } from "../cx";
import { useFocusTrap } from "./focus";
import { AlertGlyph, CloseGlyph, InfoGlyph, SuccessGlyph } from "./icons";

export interface DialogProps {
  /** Shown or not; you keep it. */
  open: boolean;
  /** Escape, the close button and a click on the backdrop call it; ignored while busy. */
  onClose: () => void;
  /** The question or the task: "Delete this order?", "New customer". */
  title: React.ReactNode;
  /** A line under the title: what happens, what can't be undone. */
  description?: React.ReactNode;
  /** The body: a short form or a few lines. */
  children?: React.ReactNode;
  /** The buttons, right-aligned: Cancel, then the action. */
  footer?: React.ReactNode;
  /** sm for confirmations, md for short forms, lg for wider content. */
  size?: "sm" | "md" | "lg";
  /** While true it can't be closed: a save is in flight. */
  busy?: boolean;
  className?: string;
}

const dialogSizes = { sm: "max-w-[400px]", md: "max-w-[520px]", lg: "max-w-[720px]" };
export const closeButton =
  "inline-flex flex-none cursor-pointer rounded-sm text-ink-3 hover:enabled:bg-surface-2 hover:enabled:text-ink disabled:cursor-not-allowed " + focusRing;

/** A task that needs the whole of someone's attention: a short form, or a confirmation. Focus stays inside until it closes. */
export function Dialog({ open, onClose, title, description, children, footer, size = "md", busy, className }: DialogProps) {
  const panel = useFocusTrap(open, onClose, busy);
  const titleId = useId();
  const descId = useId();

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-overlay p-4 animate-fade-in motion-reduce:animate-none"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "flex max-h-[calc(100vh-32px)] w-full flex-col overflow-auto rounded-xl border border-line bg-surface text-ink shadow-3 outline-none animate-rise motion-reduce:animate-none",
          dialogSizes[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 id={titleId} className="m-0 font-display text-title font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="m-0 mt-1 text-label text-ink-3">
                {description}
              </p>
            ) : null}
          </div>
          <button type="button" className={cn(closeButton, "-mr-1.5 -mt-1 p-1.5")} onClick={onClose} disabled={busy} aria-label="Close">
            <CloseGlyph size={18} />
          </button>
        </header>
        {children ? <div className="px-5 pt-4 text-body text-ink-2">{children}</div> : null}
        {footer ? <footer className="flex justify-end gap-2 p-5">{footer}</footer> : <div className="h-5" />}
      </div>
    </div>
  );
}

export interface AlertProps {
  /** danger: something failed. warning: soon a problem. success: done. info: news. */
  tone?: Exclude<Tone, "brand" | "neutral">;
  /** What happened, in a few words. */
  title?: React.ReactNode;
  /** What it means, or what to do. */
  children?: React.ReactNode;
  /** A Button that fixes it: "Update card". */
  action?: React.ReactNode;
  /** Shows a close button. */
  onDismiss?: () => void;
  className?: string;
}

const glyph = { info: InfoGlyph, success: SuccessGlyph, warning: AlertGlyph, danger: AlertGlyph };

/** A message about the whole screen or form: a failed save, a trial ending. Not for every small success. */
export function Alert({ tone = "info", title, children, action, onDismiss, className }: AlertProps) {
  const Icon = glyph[tone];
  return (
    <div
      className={cn("flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-ink", toneSoft[tone], className)}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span className={cn("mt-px inline-flex flex-none", toneText[tone])}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1 text-label">
        {title ? <p className="m-0 font-semibold">{title}</p> : null}
        {children ? <div className={cn("text-ink-2", title && "mt-0.5")}>{children}</div> : null}
      </div>
      {action ? <div className="flex-none self-center">{action}</div> : null}
      {onDismiss ? (
        <button type="button" className={cn(closeButton, "-mr-1.5 -mt-0.5 p-1")} onClick={onDismiss} aria-label="Dismiss">
          <CloseGlyph size={16} />
        </button>
      ) : null}
    </div>
  );
}
