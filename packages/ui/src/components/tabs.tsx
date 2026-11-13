"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

import { cn, focusRing } from "../cx";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  /** A number after the label: open orders, unread. */
  count?: number;
  disabled?: boolean;
}

export type TabsVariant = "line" | "pills" | "cupertino" | "soft" | "solid" | "enclosed" | "vertical";

export interface TabsProps {
  /** The tabs: { value, label, count?, disabled? }. */
  items: TabItem[];
  /** The open tab, when you keep it yourself (in the URL, say). */
  value?: string;
  /** The tab open at first; the first one if not given. */
  defaultValue?: string;
  /** Called with the tab picked. */
  onValueChange?: (value: string) => void;
  /**
   * line: an underline slides to the open tab; views of one screen. pills: a raised pill in a
   * grey track; filters over a list. cupertino: iOS's segmented look, equal widths, dividers.
   * soft: a soft brand tint behind the open tab. solid: the brand colour behind it. enclosed:
   * folder tabs joined to their content. vertical: a list down the side, content beside it;
   * settings with many sections.
   */
  variant?: TabsVariant;
  /** Read by screen readers: "Order views". */
  label?: string;
  /**
   * The screen's actions, at the right end of the tab row: Add product, Export. A screen with tabs
   * puts its actions here rather than on a row of their own above.
   */
  actions?: React.ReactNode;
  /** The open tab's content; given the value, so it can switch. */
  children?: (value: string) => React.ReactNode;
  className?: string;
}

type Marker = { x: number; y: number; w: number; h: number };

/** How each variant draws its list, its tabs and the marker that slides between them. */
const looks: Record<TabsVariant, { list: string; tab: string; on: string; off: string; marker?: "underline" | "fill"; mark?: string; self: string }> = {
  line: {
    list: "flex gap-4 border-b border-line",
    tab: "h-9 px-0",
    on: "text-ink",
    off: "text-ink-3",
    marker: "underline",
    mark: "h-0.5 rounded-full bg-brand",
    self: "shadow-[inset_0_-2px_0_var(--color-brand)]",
  },
  pills: {
    list: "inline-flex gap-0.5 rounded-md bg-surface-2 p-0.5",
    tab: "h-7 rounded-[calc(var(--radius-md)-2px)] px-2.5",
    on: "text-ink",
    off: "text-ink-3",
    marker: "fill",
    mark: "rounded-[calc(var(--radius-md)-2px)] bg-surface shadow-1",
    self: "bg-surface shadow-1",
  },
  cupertino: {
    list: "inline-grid auto-cols-fr grid-flow-col rounded-[9px] bg-surface-2 p-0.5",
    tab: "h-7 justify-center rounded-[7px] px-3.5",
    on: "text-ink",
    off: "text-ink-2",
    marker: "fill",
    mark: "rounded-[7px] bg-surface shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)] ring-[0.5px] ring-black/5",
    self: "bg-surface shadow-1",
  },
  soft: {
    list: "flex gap-1",
    tab: "h-8 rounded-full px-3.5",
    on: "text-ink",
    off: "text-ink-3",
    marker: "fill",
    mark: "rounded-full bg-brand-soft",
    self: "bg-brand-soft",
  },
  solid: {
    list: "flex gap-1",
    tab: "h-8 rounded-md px-3",
    on: "text-brand-ink",
    off: "text-ink-3",
    marker: "fill",
    mark: "rounded-md bg-brand shadow-1",
    self: "bg-brand",
  },
  enclosed: {
    list: "flex border-b border-line",
    tab: "-mb-px h-9 rounded-t-md border border-transparent px-3.5",
    on: "border-line border-b-surface bg-surface text-ink",
    off: "text-ink-3 hover:bg-surface-2",
    self: "",
  },
  vertical: {
    list: "flex w-full flex-col gap-0.5 @xl:w-48",
    tab: "h-8 w-full justify-start rounded-md px-3",
    on: "text-ink",
    off: "text-ink-3 hover:bg-surface-2",
    marker: "fill",
    mark: "rounded-md bg-brand-soft",
    self: "bg-brand-soft",
  },
};

/**
 * Switches between views of the same thing, in seven looks. A marker slides
 * to the open tab and the content fades in; arrow keys move between tabs.
 */
export function Tabs({ items, value, defaultValue, onValueChange, variant = "line", label, actions, children, className }: TabsProps) {
  const [own, setOwn] = useState(defaultValue ?? items[0]?.value ?? "");
  const current = value ?? own;
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<Marker | null>(null);
  // The first placement doesn't slide in from nowhere; later ones do.
  const [moving, setMoving] = useState(false);
  const look = looks[variant];
  const vertical = variant === "vertical";

  const pick = (v: string) => {
    if (value === undefined) setOwn(v);
    onValueChange?.(v);
  };

  useLayoutEffect(() => {
    const el = list.current;
    if (!el || !look.marker) return;
    const place = () => {
      const tab = el.querySelector<HTMLElement>(`[data-value="${CSS.escape(current)}"]`);
      setMarker(tab ? { x: tab.offsetLeft, y: tab.offsetTop, w: tab.offsetWidth, h: tab.offsetHeight } : null);
    };
    place();
    // Again when the tabs change size: a font arriving, a count changing.
    const ro = new ResizeObserver(place);
    ro.observe(el);
    for (const t of el.querySelectorAll("[role=tab]")) ro.observe(t);
    const t = setTimeout(() => setMoving(true), 50);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [current, items, look.marker]);

  const enabled = items.filter((i) => !i.disabled);
  const onKey = (e: React.KeyboardEvent) => {
    const at = enabled.findIndex((i) => i.value === current);
    const forward = vertical ? "ArrowDown" : "ArrowRight";
    const back = vertical ? "ArrowUp" : "ArrowLeft";
    let next = -1;
    if (e.key === forward) next = (at + 1) % enabled.length;
    else if (e.key === back) next = (at - 1 + enabled.length) % enabled.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    const item = enabled[next];
    if (!item) return;
    e.preventDefault();
    pick(item.value);
    list.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(item.value)}"]`)?.focus();
  };
  // Until the marker is placed (before the script runs), the open tab marks itself.
  const self = look.marker ? marker === null : true;
  const at = items.findIndex((i) => i.value === current);

  return (
    // Vertical tabs sit beside their content when there is room for both: their own width decides.
    <div className={cn(vertical && "@container", className)}>
    <div className={cn(vertical && "flex flex-col gap-4 @xl:flex-row @xl:gap-6")}>
      {/* With actions, the tab row and the actions share one line (and the line variant's rule). */}
      <div className={cn(actions && !vertical && "flex flex-wrap items-center gap-x-3 gap-y-2", actions && !vertical && look.list.includes("border-b") && "border-b border-line")}>
      <div
        ref={list}
        role="tablist"
        aria-label={label}
        aria-orientation={vertical ? "vertical" : "horizontal"}
        onKeyDown={onKey}
        className={cn("relative flex-none overflow-x-auto [scrollbar-width:none]", look.list, actions && !vertical && "min-w-0 flex-1 border-b-0 sm:flex-initial")}
      >
        {marker && look.marker ? (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-0 top-0",
              look.mark,
              moving && "transition-[transform,width,height] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
            )}
            style={
              look.marker === "underline"
                ? { transform: `translate(${marker.x}px, ${marker.y + marker.h - 2}px)`, width: marker.w }
                : { transform: `translate(${marker.x}px, ${marker.y}px)`, width: marker.w, height: marker.h }
            }
          />
        ) : null}
        {items.map((t, i) => {
          const on = t.value === current;
          // Cupertino draws a hairline between two tabs that aren't open.
          const divider = variant === "cupertino" && i > 0 && i !== at && i - 1 !== at;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={`${id}-tab-${t.value}`}
              aria-selected={on}
              aria-controls={children ? `${id}-panel` : undefined}
              tabIndex={on ? 0 : -1}
              disabled={t.disabled}
              data-value={t.value}
              onClick={() => pick(t.value)}
              className={cn(
                "relative inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-label font-medium transition-colors duration-200 hover:enabled:text-ink disabled:cursor-not-allowed disabled:opacity-50",
                focusRing,
                look.tab,
                on ? look.on : look.off,
                on && self && look.self,
                on && variant === "solid" && "hover:enabled:text-brand-ink",
                divider && "before:absolute before:-left-px before:top-1.5 before:bottom-1.5 before:w-px before:bg-line-strong",
              )}
            >
              {t.label}
              {t.count !== undefined ? (
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-caption leading-[18px] tabular-nums transition-colors duration-200",
                    on
                      ? variant === "solid"
                        ? "bg-[color-mix(in_oklch,var(--color-brand-ink)_22%,transparent)] text-brand-ink"
                        : "bg-brand text-brand-ink"
                      : variant === "pills" || variant === "cupertino"
                        ? "bg-surface text-ink-3"
                        : "bg-surface-2 text-ink-3",
                    vertical && "ml-auto",
                  )}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {actions && !vertical ? <div className={cn("ml-auto flex flex-none items-center gap-2", look.list.includes("border-b") && "pb-1.5")}>{actions}</div> : null}
      </div>
      {children ? (
        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${current}`}
          className={cn(
            "min-w-0 flex-1",
            vertical ? "" : variant === "enclosed" ? "rounded-b-lg rounded-tr-lg border border-t-0 border-line bg-surface p-4" : "pt-4",
            focusRing,
          )}
        >
          {/* Keyed by tab, so each switch draws its content in fresh. */}
          <div key={current} className="animate-tab-in motion-reduce:animate-none">
            {children(current)}
          </div>
        </div>
      ) : null}
    </div>
    </div>
  );
}
