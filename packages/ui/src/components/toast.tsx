"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn, toneText, type Tone } from "../cx";
import { AlertGlyph, CloseGlyph, InfoGlyph, SuccessGlyph } from "./icons";

export interface ToastOptions {
  /** What happened, in a few words: "Order marked as packed". */
  title: React.ReactNode;
  /** A line more, when the title isn't enough. */
  description?: React.ReactNode;
  tone?: Exclude<Tone, "brand" | "neutral"> | "neutral";
  /** One button that acts on it: { label: "Undo", onClick }. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds on screen; 0 keeps it until closed. Errors stay longer by default. */
  duration?: number;
}

type Item = ToastOptions & { id: number };

let items: Item[] = [];
let next = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/**
 * Shows a short message in the corner and returns its id: after something
 * finished somewhere the person isn't looking, or with an Undo. Needs one
 * <Toaster /> on the page.
 */
export function toast(options: ToastOptions | string): number {
  const o = typeof options === "string" ? { title: options } : options;
  const id = next++;
  items = [...items, { ...o, id }].slice(-4);
  emit();
  return id;
}

/** Closes a toast early. */
toast.dismiss = (id: number) => {
  items = items.filter((t) => t.id !== id);
  emit();
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => items;
const empty: Item[] = [];

const glyph = { info: InfoGlyph, success: SuccessGlyph, warning: AlertGlyph, danger: AlertGlyph, neutral: InfoGlyph };

function ToastCard({ t }: { t: Item }) {
  const [paused, setPaused] = useState(false);
  const left = useRef(t.duration ?? (t.tone === "danger" ? 8000 : 4500));
  useEffect(() => {
    if (paused || left.current <= 0) return;
    const start = Date.now();
    const timer = setTimeout(() => toast.dismiss(t.id), left.current);
    return () => {
      clearTimeout(timer);
      left.current -= Date.now() - start;
    };
  }, [paused, t.id]);
  const tone = t.tone ?? "neutral";
  const Icon = glyph[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full items-start gap-2.5 rounded-lg border border-line bg-surface p-3 text-ink shadow-3 animate-toast-in motion-reduce:animate-none"
    >
      <span className={cn("mt-px flex-none", toneText[tone === "neutral" ? "info" : tone])}>
        <Icon size={16} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="m-0 text-label font-medium">{t.title}</p>
        {t.description ? <p className="m-0 text-small text-ink-3">{t.description}</p> : null}
      </div>
      {t.action ? (
        <button
          type="button"
          onClick={() => {
            t.action!.onClick();
            toast.dismiss(t.id);
          }}
          className="flex-none cursor-pointer rounded-sm px-1.5 text-label font-medium text-ink underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus"
        >
          {t.action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Close"
        onClick={() => toast.dismiss(t.id)}
        className="-mr-1 -mt-0.5 flex-none cursor-pointer rounded-sm p-0.5 text-ink-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
      >
        <CloseGlyph size={14} />
      </button>
    </div>
  );
}

export interface ToasterProps {
  /** Which corner they stack in. */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-center";
  className?: string;
}

/** Where toasts appear: put one in the app's root layout. They stack, newest last, and pause while hovered. */
export function Toaster({ position = "bottom-right", className }: ToasterProps) {
  const list = useSyncExternalStore(subscribe, snapshot, () => empty);
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed z-[60] flex w-[min(360px,calc(100%-2rem))] flex-col gap-2",
        position === "bottom-right" && "bottom-4 right-4",
        position === "bottom-left" && "bottom-4 left-4",
        position === "top-right" && "right-4 top-4",
        position === "top-center" && "left-1/2 top-4 -translate-x-1/2",
        className,
      )}
    >
      {list.map((t) => (
        <ToastCard key={t.id} t={t} />
      ))}
    </div>
  );
}
