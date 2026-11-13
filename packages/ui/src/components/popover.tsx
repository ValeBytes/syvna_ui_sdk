"use client";

import { cloneElement, useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "../cx";

/** Closes something on a click outside `box` or on Escape, while it's open. */
export function useDismiss(box: React.RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  const latest = useRef(close);
  latest.current = close;
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !box.current?.contains(e.target as Node) && latest.current();
    const key = (e: KeyboardEvent) => e.key === "Escape" && latest.current();
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open, box]);
}

/** The panel every floating thing shares: surface, line, shadow, a quick fade. */
export const floatingPanel = "z-40 rounded-lg border border-line bg-surface text-ink shadow-2 animate-fade-in motion-reduce:animate-none";

export interface PopoverProps {
  /** What opens it: a Button. It gets the click and the aria. */
  trigger: React.ReactElement;
  /** The content; a function gets `close` for a button inside that's done. */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Which edge of the trigger it lines up with. */
  align?: "start" | "end";
  /** Opens above the trigger, for triggers near the bottom of the screen. */
  side?: "below" | "above";
  /** Open, when you keep it yourself. */
  open?: boolean;
  /** Called when it opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Read by screen readers: "Filter by status". */
  label?: string;
  /** The panel's classes: its width ("w-72"), its padding. */
  panelClassName?: string;
  className?: string;
}

/**
 * Content that opens from a button and stays until you click away or press
 * Escape: a short form, filters, a picker. For actions, use Menu; for a hint,
 * Tooltip; for a task that needs full attention, Dialog.
 */
export function Popover({ trigger, children, align = "start", side = "below", open, onOpenChange, label, panelClassName, className }: PopoverProps) {
  const [own, setOwn] = useState(false);
  const shown = open ?? own;
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const set = useCallback(
    (v: boolean) => {
      if (open === undefined) setOwn(v);
      onOpenChange?.(v);
    },
    [open, onOpenChange],
  );
  const close = useCallback(() => set(false), [set]);
  useDismiss(box, shown, close);
  const props = trigger.props as { onClick?: (e: React.MouseEvent) => void };
  return (
    <div ref={box} className={cn("relative inline-flex", className)}>
      {cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
        "aria-haspopup": "dialog",
        "aria-expanded": shown,
        "aria-controls": shown ? id : undefined,
        onClick: (e: React.MouseEvent) => {
          props.onClick?.(e);
          set(!shown);
        },
      })}
      {shown ? (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute p-3",
            floatingPanel,
            side === "below" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}

export interface TooltipProps {
  /** The hint: a few words, never the only way to learn something important. */
  content: React.ReactNode;
  /** What it explains: an icon button, a truncated name. Shown on hover and keyboard focus. */
  children: React.ReactElement;
  /** Above the thing it explains, or below when there's no room above. */
  side?: "top" | "bottom";
  className?: string;
}

/** A few words on hover or focus: what an icon button does, a full name that was cut short. */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const id = useId();
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {cloneElement(children as React.ReactElement<Record<string, unknown>>, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none invisible absolute left-1/2 z-50 w-max max-w-60 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-small text-ground opacity-0 shadow-2",
          "transition-[opacity,transform] delay-0 duration-150 group-hover/tip:visible group-hover/tip:opacity-100 group-hover/tip:delay-300 group-focus-within/tip:visible group-focus-within/tip:opacity-100",
          side === "top" ? "bottom-full mb-1.5 translate-y-0.5 group-hover/tip:translate-y-0" : "top-full mt-1.5 -translate-y-0.5 group-hover/tip:translate-y-0",
        )}
      >
        {content}
      </span>
    </span>
  );
}
