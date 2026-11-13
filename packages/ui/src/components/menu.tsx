"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "../cx";

export interface MenuItem {
  label: React.ReactNode;
  /** A lucide-react icon at 16px. */
  icon?: React.ReactNode;
  /** Called when picked; the menu closes. */
  onSelect?: () => void;
  /** Makes it a link instead. */
  href?: string;
  /** Drawn in danger: delete, sign out of every device. */
  danger?: boolean;
  disabled?: boolean;
  /** A line above this item, to group the ones after it. */
  separated?: boolean;
}

export interface MenuProps {
  /** What opens it: a Button (often ghost, icon-only) or an account row. It gets the click and the aria. */
  trigger: React.ReactElement;
  /** The actions: { label, icon?, onSelect?, href?, danger?, disabled?, separated? }. */
  items: MenuItem[];
  /** Which edge of the trigger it lines up with. */
  align?: "start" | "end";
  /** Opens above the trigger: for menus at the bottom of the screen, like the sidebar's account. */
  side?: "below" | "above";
  /** Read by screen readers: "Order actions". */
  label?: string;
  /** Starts open: for showing it, as on the canvas. */
  defaultOpen?: boolean;
  className?: string;
}

/** A short list of actions on one thing: a row's Edit, Duplicate, Delete; the account's Settings, Sign out. Arrow keys move, Escape closes. */
export function Menu({ trigger, items, align = "end", side = "below", label, defaultOpen = false, className }: MenuProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const entries = () => [...(list.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])];
  useEffect(() => {
    if (!open) return;
    entries()[0]?.focus({ preventScroll: true });
    const away = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) box.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const all = entries();
    const at = all.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;
    if (e.key === "ArrowDown") next = all[(at + 1) % all.length];
    else if (e.key === "ArrowUp") next = all[(at - 1 + all.length) % all.length];
    else if (e.key === "Home") next = all[0];
    else if (e.key === "End") next = all[all.length - 1];
    else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      close(e.key === "Escape");
      return;
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const triggerProps = trigger.props as { onClick?: (e: React.MouseEvent) => void };
  const Trigger = trigger.type as React.ElementType;
  return (
    <div ref={box} className={cn("relative inline-flex", className)}>
      <Trigger
        {...(trigger.props as object)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(e: React.MouseEvent) => {
          triggerProps.onClick?.(e);
          setOpen((o) => !o);
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      {open ? (
        <div
          ref={list}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onKey}
          className={cn(
            "absolute z-40 min-w-[200px] rounded-lg border border-line bg-surface p-1 shadow-2 animate-fade-in motion-reduce:animate-none",
            side === "below" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) => {
            const Tag = item.href ? "a" : "button";
            return (
              <div key={i}>
                {item.separated ? <div className="-mx-1 my-1 h-px bg-line" role="separator" /> : null}
                <Tag
                  role="menuitem"
                  tabIndex={-1}
                  href={item.href}
                  type={item.href ? undefined : "button"}
                  aria-disabled={item.disabled || undefined}
                  onClick={(e: React.MouseEvent) => {
                    if (item.disabled) {
                      e.preventDefault();
                      return;
                    }
                    item.onSelect?.();
                    close();
                  }}
                  className={cn(
                    "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 text-left text-label no-underline outline-none",
                    "[&>svg]:flex-none",
                    item.danger ? "text-danger focus:bg-danger-soft hover:bg-danger-soft" : "text-ink focus:bg-surface-2 hover:bg-surface-2 [&>svg]:text-ink-3",
                    item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent focus:bg-transparent",
                  )}
                >
                  {item.icon}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </Tag>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
