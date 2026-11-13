"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The elements Tab can reach inside el, in order. */
export function focusables(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>(FOCUSABLE)];
}

/**
 * While open: focus moves into the panel (its [autofocus] or first control),
 * Tab cycles inside it, Escape calls onClose unless busy, the page behind
 * doesn't scroll, and focus goes back where it was on close. Dialogs and
 * side panels share it.
 */
export function useFocusTrap(open: boolean, onClose: () => void, busy?: boolean) {
  const panel = useRef<HTMLDivElement>(null);
  const latest = useRef({ onClose, busy });
  latest.current = { onClose, busy };

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = panel.current;
    const first = el?.querySelector<HTMLElement>("[autofocus]") ?? (el ? focusables(el)[0] : undefined);
    (first ?? el)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !latest.current.busy) {
        e.preventDefault();
        latest.current.onClose();
      }
      if (e.key !== "Tab" || !panel.current) return;
      const all = focusables(panel.current);
      const a = all[0];
      const z = all[all.length - 1];
      if (!a || !z) return;
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      before?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return panel;
}
