"use client";

import { useId } from "react";

import { cn } from "../cx";
import { useFocusTrap } from "./focus";
import { CloseGlyph } from "./icons";
import { closeButton } from "./overlays";

export interface SidePanelProps {
  /** Shown or not; you keep it. */
  open: boolean;
  /** Escape, the close button and a click beside it call it; ignored while busy. */
  onClose: () => void;
  /** The thing on show: "Order #1042", a customer's name. */
  title: React.ReactNode;
  /** Under the title: a status Badge, a date. */
  description?: React.ReactNode;
  /** Its details: a DetailList, notes, a short form. */
  children: React.ReactNode;
  /** Pinned at the bottom: the panel's actions. */
  footer?: React.ReactNode;
  /** Pixels on wide screens; it's full width on phones. */
  width?: number;
  /** While true it can't be closed: a save is in flight. */
  busy?: boolean;
  className?: string;
}

/**
 * One row's details, opened beside its list so people keep their place:
 * an order from the orders table, a customer from customers. Focus stays
 * inside until it closes.
 */
export function SidePanel({ open, onClose, title, description, children, footer, width = 440, busy, className }: SidePanelProps) {
  const panel = useFocusTrap(open, onClose, busy);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="pointer-events-none absolute inset-0 bg-overlay animate-fade-in motion-reduce:animate-none" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface text-ink shadow-3 outline-none",
          "animate-slide-in motion-reduce:animate-none",
          className,
        )}
      >
        <header className="flex flex-none items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="m-0 truncate font-display text-title font-semibold">
              {title}
            </h2>
            {description ? <div className="mt-1 flex flex-wrap items-center gap-2 text-label text-ink-3">{description}</div> : null}
          </div>
          <button type="button" className={cn(closeButton, "-mr-1.5 -mt-0.5 p-1.5")} onClick={onClose} disabled={busy} aria-label="Close">
            <CloseGlyph size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-body text-ink-2">{children}</div>
        {footer ? <footer className="flex flex-none justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

export interface DetailListProps {
  /** Label and value pairs: "Email" and the address. */
  items: { label: React.ReactNode; value: React.ReactNode }[];
  className?: string;
}

/** Facts about one thing, label beside value: inside a SidePanel or a Card. */
export function DetailList({ items, className }: DetailListProps) {
  return (
    <dl className={cn("m-0 grid grid-cols-[minmax(96px,auto)_1fr] gap-x-6 gap-y-2.5 text-body", className)}>
      {items.map((it, i) => (
        <div key={i} className="contents">
          <dt className="text-ink-3">{it.label}</dt>
          <dd className="m-0 min-w-0 break-words text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
