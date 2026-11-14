"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "../cx";
import { useFocusTrap } from "./focus";

export interface CommandItem {
  /** What it does or where it goes: "New order", "Customers". */
  label: string;
  /** A lucide-react icon at 16px. */
  icon?: React.ReactNode;
  /** Extra words it's found by: ["invoice", "bill"]. */
  keywords?: string[];
  /** A shortcut shown on the right: "N", "⌘ ,". */
  shortcut?: string;
  /** A muted note on the right: "Customer", "Lagos". */
  hint?: string;
  /** Runs it; the palette closes after. */
  onSelect: () => void;
}

export interface CommandGroup {
  /** A heading over the group: "Go to", "Create", "Customers". */
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  /** Shown or not; you keep it (useCommandKey opens it on ⌘K). */
  open: boolean;
  /** Escape, a click outside and running an item call it. */
  onClose: () => void;
  /** What can be done or found, in groups. Filtered as the person types. */
  groups: CommandGroup[];
  /** The input's hint: "Search or jump to…". */
  placeholder?: string;
  /** Shown when nothing matches. */
  empty?: React.ReactNode;
}

const match = (item: CommandItem, q: string) => {
  const words = [item.label, item.hint ?? "", ...(item.keywords ?? [])].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => words.includes(w));
};

/**
 * Search and jump anywhere from the keyboard: screens, records, actions.
 * Opens with ⌘K or Ctrl K (useCommandKey) or from a search button. Arrow keys
 * move, Enter runs, Escape closes.
 */
export function CommandPalette({ open, onClose, groups, placeholder = "Search or jump to…", empty = "Nothing found." }: CommandPaletteProps) {
  const panel = useFocusTrap(open, onClose);
  const [query, setQuery] = useState("");
  const [at, setAt] = useState(0);
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const shown = useMemo(
    () => groups.map((g) => ({ ...g, items: query ? g.items.filter((i) => match(i, query)) : g.items })).filter((g) => g.items.length),
    [groups, query],
  );
  const flat = shown.flatMap((g) => g.items);
  useEffect(() => {
    if (open) {
      setQuery("");
      setAt(0);
    }
  }, [open]);
  useEffect(() => setAt(0), [query]);
  useEffect(() => {
    list.current?.querySelector(`[data-index="${at}"]`)?.scrollIntoView({ block: "nearest" });
  }, [at]);
  if (!open) return null;
  const run = (item?: CommandItem) => {
    if (!item) return;
    onClose();
    item.onSelect();
  };
  let n = -1;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-overlay px-4 pt-[12vh] animate-fade-in motion-reduce:animate-none" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Command palette" className="w-full max-w-[560px] overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-3 animate-rise motion-reduce:animate-none">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setAt((a) => Math.min(flat.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAt((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              run(flat[at]);
            }
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-activedescendant={flat[at] ? `${id}-${at}` : undefined}
          className="h-12 w-full border-0 border-b border-line bg-transparent px-4 text-body text-ink outline-none! placeholder:text-ink-4"
        />
        <div ref={list} id={`${id}-list`} role="listbox" className="max-h-[min(360px,50vh)] overflow-y-auto p-1.5">
          {shown.length === 0 ? <p className="m-0 px-3 py-8 text-center text-label text-ink-3">{empty}</p> : null}
          {shown.map((g) => (
            <div key={g.label} role="group" aria-label={g.label} className="pb-1">
              <p className="m-0 px-2.5 pb-1 pt-2 text-small text-ink-3">{g.label}</p>
              {g.items.map((item) => {
                n++;
                const i = n;
                return (
                  <div
                    key={`${g.label}-${item.label}`}
                    id={`${id}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={i === at}
                    onMouseMove={() => setAt(i)}
                    onClick={() => run(item)}
                    className={cn("flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-label [&>svg]:flex-none [&>svg]:text-ink-3", i === at ? "bg-surface-2 text-ink" : "text-ink-2")}
                  >
                    {item.icon}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.hint ? <span className="text-small text-ink-3">{item.hint}</span> : null}
                    {item.shortcut ? <kbd className="rounded-sm border border-line px-1.5 font-body text-caption text-ink-3">{item.shortcut}</kbd> : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-caption text-ink-3">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}

/** Opens the palette on ⌘K (Mac) or Ctrl K (elsewhere). */
export function useCommandKey(open: () => void) {
  const latest = useRef(open);
  latest.current = open;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        latest.current();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
}
