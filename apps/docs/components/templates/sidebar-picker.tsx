"use client";

// Picks one of the 21 sidebars for the templates: ‹ › to step through them,
// or a panel of small sketches, grouped, to pick one by sight.

import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";
import { Button, ButtonGroup, Kbd, cn, sideNavVariants, useDismiss, type SideNavVariant } from "@syvna/ui";

export const variantNames: Record<SideNavVariant, string> = {
  classic: "Classic",
  rail: "Icon rail",
  "rail-panel": "Rail and panel",
  admin: "Admin menu",
  accordion: "Accordion",
  tree: "Tree",
  floating: "Floating card",
  minimal: "Minimal",
  pills: "Pills",
  bar: "Bar marker",
  inverted: "Inverted",
  brand: "On brand colour",
  compact: "Compact",
  tiles: "Tiles",
  collapsible: "Collapsible",
  search: "With search",
  workspace: "Workspace switcher",
  steps: "Steps",
  cards: "Grouped cards",
  colorful: "Colourful icons",
  threads: "Threads",
};

const groups: { name: string; items: SideNavVariant[] }[] = [
  { name: "Layout", items: ["classic", "rail", "rail-panel", "admin", "floating", "collapsible", "workspace"] },
  { name: "Way to navigate", items: ["accordion", "tree", "search", "steps", "tiles", "cards", "threads"] },
  { name: "Look", items: ["minimal", "pills", "bar", "compact", "colorful", "inverted", "brand"] },
];

type Sketch = { width: "rail" | "normal" | "double"; tone: "surface" | "ink" | "brand"; float?: boolean; marker: "pill" | "bar" | "fill" | "none"; rows: number; extra?: "search" | "workspace" | "tiles" | "cards" | "tree" | "steps" | "dots" | "colour" };

const sketches: Record<SideNavVariant, Sketch> = {
  classic: { width: "normal", tone: "surface", marker: "pill", rows: 5 },
  rail: { width: "rail", tone: "surface", marker: "fill", rows: 5 },
  "rail-panel": { width: "double", tone: "surface", marker: "pill", rows: 4 },
  admin: { width: "normal", tone: "ink", marker: "fill", rows: 6 },
  accordion: { width: "normal", tone: "surface", marker: "pill", rows: 3, extra: "cards" },
  tree: { width: "normal", tone: "surface", marker: "pill", rows: 5, extra: "tree" },
  floating: { width: "normal", tone: "surface", float: true, marker: "pill", rows: 5 },
  minimal: { width: "normal", tone: "surface", marker: "none", rows: 5 },
  pills: { width: "normal", tone: "surface", marker: "fill", rows: 5 },
  bar: { width: "normal", tone: "surface", marker: "bar", rows: 5 },
  inverted: { width: "normal", tone: "ink", marker: "pill", rows: 5 },
  brand: { width: "normal", tone: "brand", marker: "pill", rows: 5 },
  compact: { width: "normal", tone: "surface", marker: "pill", rows: 8 },
  tiles: { width: "normal", tone: "surface", marker: "none", rows: 0, extra: "tiles" },
  collapsible: { width: "normal", tone: "surface", marker: "pill", rows: 5, extra: "dots" },
  search: { width: "normal", tone: "surface", marker: "pill", rows: 4, extra: "search" },
  workspace: { width: "normal", tone: "surface", marker: "pill", rows: 4, extra: "workspace" },
  steps: { width: "normal", tone: "surface", marker: "none", rows: 0, extra: "steps" },
  cards: { width: "normal", tone: "surface", marker: "pill", rows: 0, extra: "cards" },
  colorful: { width: "normal", tone: "surface", marker: "pill", rows: 5, extra: "colour" },
  threads: { width: "normal", tone: "surface", marker: "fill", rows: 9 },
};

const hues = ["bg-[#3b82f6]", "bg-[#10b981]", "bg-[#f59e0b]", "bg-[#ec4899]", "bg-[#8b5cf6]"];

/** A small drawing of a sidebar beside a page, enough to tell the 21 apart. */
function SidebarSketch({ v }: { v: SideNavVariant }) {
  const s = sketches[v];
  const bg = s.tone === "ink" ? "bg-ink" : s.tone === "brand" ? "bg-brand" : "bg-surface";
  const line = s.tone === "surface" ? "bg-line-strong" : s.tone === "ink" ? "bg-ground/35" : "bg-brand-ink/35";
  const on = s.tone === "surface" ? "bg-ink-4" : s.tone === "ink" ? "bg-ground/70" : "bg-brand-ink/70";
  const rowH = s.rows > 6 ? "h-[3px]" : "h-1";
  const rows = (n: number, narrow?: boolean) =>
    Array.from({ length: n }, (_, i) => (
      <span key={i} className={cn("relative flex items-center gap-1 rounded-[2px]", i === 1 && s.marker === "fill" && cn("-mx-0.5 px-0.5 py-0.5", s.tone === "surface" ? "bg-surface-2" : "bg-white/15"), i === 1 && s.marker === "pill" && cn("-mx-0.5 px-0.5 py-0.5 ring-1", s.tone === "surface" ? "ring-line-strong" : "ring-white/30"))}>
        {i === 1 && s.marker === "bar" ? <span className={cn("absolute -left-1.5 h-2.5 w-[2px] rounded-full", on)} /> : null}
        {s.extra === "colour" ? <span className={cn("size-1.5 flex-none rounded-[2px]", hues[i % hues.length])} /> : <span className={cn("size-1.5 flex-none rounded-[2px]", i === 1 ? on : line)} />}
        {!narrow ? <span className={cn("rounded-full", rowH, i === 1 ? on : line)} style={{ width: `${55 - ((i * 13) % 25)}%` }} /> : null}
        {s.extra === "tree" && i > 1 && i < 4 ? <span className="absolute -left-0.5 top-0 h-full border-l border-dashed border-line-strong" /> : null}
      </span>
    ));
  const side = (
    <div className={cn("flex flex-col gap-1.5 p-1.5", bg, s.float ? "m-1 rounded-md shadow-2 ring-1 ring-line" : "border-r border-line", s.width === "rail" ? "w-[18px] items-center px-1" : "w-[46px]")}>
      <span className={cn("mb-0.5 size-2 rounded-[2px]", on)} />
      {s.extra === "search" ? <span className={cn("mb-0.5 h-2 rounded-[2px] ring-1", s.tone === "surface" ? "ring-line-strong" : "ring-white/30")} /> : null}
      {s.extra === "workspace" ? <span className={cn("mb-0.5 flex h-2.5 items-center gap-0.5 rounded-[2px] px-0.5 ring-1 ring-line-strong")}><span className="size-1.5 rounded-[1px] bg-brand" /><span className={cn("h-0.5 flex-1 rounded-full", line)} /></span> : null}
      {s.extra === "tiles" ? (
        <span className="grid grid-cols-2 gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={cn("aspect-square rounded-[2px]", i === 1 ? on : line)} />
          ))}
        </span>
      ) : null}
      {s.extra === "cards" ? (
        <span className="flex flex-col gap-1">
          {[3, 2].map((n, k) => (
            <span key={k} className="flex flex-col gap-1 rounded-[3px] p-1 ring-1 ring-line-strong">
              {rows(n)}
            </span>
          ))}
        </span>
      ) : null}
      {s.extra === "steps" ? (
        <span className="flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="flex items-center gap-1">
              <span className={cn("size-2 flex-none rounded-full", i < 2 ? "bg-brand" : "ring-1 ring-line-strong")} />
              <span className={cn("h-1 flex-1 rounded-full", line)} />
            </span>
          ))}
        </span>
      ) : null}
      {rows(s.rows, s.width === "rail")}
      {s.extra === "dots" ? <span className={cn("mt-auto h-1 w-3 self-end rounded-full", line)} /> : null}
    </div>
  );
  return (
    <div className="flex h-[66px] w-full overflow-hidden rounded-md border border-line bg-ground">
      {s.width === "double" ? (
        <div className="flex w-[18px] flex-col items-center gap-1.5 border-r border-line bg-surface-2 py-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("size-1.5 rounded-[2px]", i === 0 ? "bg-ink-4" : "bg-line-strong")} />
          ))}
        </div>
      ) : null}
      {side}
      <div className="flex flex-1 flex-col gap-1 p-1.5">
        <span className="h-1.5 w-1/3 rounded-full bg-line" />
        <span className="mt-0.5 h-5 rounded-[3px] bg-surface ring-1 ring-line" />
        <span className="flex gap-1">
          <span className="h-3 flex-1 rounded-[3px] bg-surface ring-1 ring-line" />
          <span className="h-3 flex-1 rounded-[3px] bg-surface ring-1 ring-line" />
        </span>
      </div>
    </div>
  );
}

/** ‹ Sidebar · Bar marker 10/21 › : step through the sidebars, or open the sketches to pick one. */
export function SidebarPicker({ value, onChange }: { value: SideNavVariant; onChange: (v: SideNavVariant) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  const at = sideNavVariants.indexOf(value);
  const step = (d: number) => onChange(sideNavVariants[(at + d + sideNavVariants.length) % sideNavVariants.length]!);
  return (
    <div ref={box} className="relative">
      <ButtonGroup label="Sidebar">
        <Button size="sm" aria-label="Previous sidebar" icon={<ChevronLeft size={14} />} onClick={() => step(-1)} />
        <Button size="sm" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)} icon={<PanelLeft size={14} />} iconRight={<ChevronDown size={13} className={cn("text-ink-3 transition-transform", open && "rotate-180")} />} className="min-w-[210px] justify-start">
          <span className="flex flex-1 items-baseline gap-2 text-left">
            <span className="text-ink-3">Sidebar</span>
            <span className="truncate">{variantNames[value]}</span>
            <span className="ml-auto text-caption tabular-nums text-ink-4">
              {at + 1}/{sideNavVariants.length}
            </span>
          </span>
        </Button>
        <Button size="sm" aria-label="Next sidebar" icon={<ChevronRight size={14} />} onClick={() => step(1)} />
      </ButtonGroup>
      {open ? (
        <div
          role="dialog"
          aria-label="Pick a sidebar"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") (e.preventDefault(), step(1));
            if (e.key === "ArrowLeft") (e.preventDefault(), step(-1));
          }}
          className="absolute left-0 top-full z-40 mt-1.5 flex max-h-[min(560px,calc(100dvh-8rem))] w-[min(640px,calc(100vw-2rem))] animate-fade-in flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-3"
        >
          <div className="flex flex-col gap-4 overflow-y-auto p-3">
            {groups.map((g) => (
              <section key={g.name} className="flex flex-col gap-2">
                <h3 className="m-0 px-0.5 text-caption font-semibold uppercase tracking-[0.06em] text-ink-3">{g.name}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {g.items.map((v) => {
                    const on = v === value;
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          onChange(v);
                          setOpen(false);
                        }}
                        className={cn(
                          "group flex cursor-pointer flex-col gap-1.5 rounded-lg p-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                          on ? "bg-brand-soft ring-1 ring-brand" : "hover:bg-surface-2",
                        )}
                      >
                        <SidebarSketch v={v} />
                        <span className="flex items-baseline justify-between gap-1 px-0.5">
                          <span className={cn("truncate text-small", on ? "font-semibold text-ink" : "text-ink-2 group-hover:text-ink")}>{variantNames[v]}</span>
                          <span className="text-[10px] tabular-nums text-ink-4">{sideNavVariants.indexOf(v) + 1}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2 text-caption text-ink-3">
            <span>The links stay the same; only how they&apos;re drawn changes.</span>
            <span className="flex items-center gap-1.5">
              <Kbd keys="←" /> <Kbd keys="→" /> to step
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
