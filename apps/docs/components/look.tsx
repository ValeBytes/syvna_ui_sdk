"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, Laptop, Maximize2, SlidersHorizontal, Smartphone, Tablet } from "lucide-react";
import { Button, Popover, Select, Switch, Tabs, cn, createPalette, palettePresets, paletteVars, type PaletteSeed } from "@syvna/ui";
import tokens from "@syvna/ui/tokens.json";

// The look a preview is drawn in: what a room's design changes. Every option
// works by setting token variables on the preview, so components need no
// code of their own for it.

export type Look = {
  /** Size, line height and weights matched to Wix Madefor (fonts); off draws each face raw. */
  tune: boolean;
  /** The width the preview is drawn at (devices). */
  device: "fit" | "phone" | "tablet" | "laptop";
  theme: "page" | "light" | "dark" | "both";
  radius: keyof typeof radii;
  brand: string | null;
  /** A ready-made palette (palettePresets), or "custom" for the seeds below. */
  palette: string;
  /** The seeds for palette "custom". */
  seed: PaletteSeed;
  font: keyof typeof fonts;
  size: keyof typeof sizes;
  leading: keyof typeof leadings;
  ink: keyof typeof inks;
  density: keyof typeof densities;
};

export const defaultLook: Look = { tune: true, device: "fit", theme: "page", radius: "default", brand: null, palette: "neutral", seed: { brand: "#2a3f54", accent: "#1abb9c", chrome: "brand", neutral: "brand" }, font: "wix", size: "m", leading: "normal", ink: "stone", density: "default" };

const radii = {
  default: null,
  sharp: { "--radius-sm": "2px", "--radius-md": "3px", "--radius-lg": "4px", "--radius-xl": "6px" },
  soft: { "--radius-sm": "8px", "--radius-md": "12px", "--radius-lg": "16px", "--radius-xl": "24px" },
  round: { "--radius-sm": "9999px", "--radius-md": "9999px", "--radius-lg": "20px", "--radius-xl": "28px" },
};

/**
 * The faces on offer, each with what it takes to read like Wix Madefor at the
 * same size, measured from the font files (scripts in the docs' fonts note):
 * - xHeight: its lowercase height as a share of the em. Every face is drawn at
 *   Wix Madefor's (0.492) with font-size-adjust, so 13px reads as 13px.
 * - leading: line height against Wix's. Inter's short ascenders and descenders
 *   (2.22 x-heights against Wix's 2.56) take tighter lines.
 * - weights: normal, medium, semibold chosen so the stem matches Wix's at the
 *   same role once sized (Wix: 0.077, 0.100, 0.116 of the em). Manrope is thin
 *   and needs heavier numbers.
 * - display: variation settings for headings in a display-only face.
 */
export const fonts = {
  wix: { label: "Wix Madefor", body: '"Wix Madefor Text Variable", sans-serif', display: '"Wix Madefor Display Variable", sans-serif', xHeight: 0.492, leading: 1, weights: [400, 500, 600], display_vs: null },
  geist: { label: "Geist", body: '"Geist Variable", sans-serif', display: '"Geist Variable", sans-serif', xHeight: 0.53, leading: 0.98, weights: [400, 500, 600], display_vs: null },
  inter: { label: "Inter", body: '"Inter Variable", sans-serif', display: '"Inter Variable", sans-serif', xHeight: 0.546, leading: 0.95, weights: [400, 520, 600], display_vs: null },
  manrope: { label: "Manrope", body: '"Manrope Variable", sans-serif', display: '"Manrope Variable", sans-serif', xHeight: 0.54, leading: 1, weights: [470, 630, 740], display_vs: null },
  dmsans: { label: "DM Sans", body: '"DM Sans Variable", sans-serif', display: '"DM Sans Variable", sans-serif', xHeight: 0.504, leading: 1, weights: [400, 510, 600], display_vs: null },
  fraunces: { label: "Fraunces + Geist", body: '"Geist Variable", sans-serif', display: '"Fraunces Variable", serif', xHeight: 0.53, leading: 0.98, weights: [400, 500, 600], display_vs: '"wght" 480' },
} as const;

/** Wix Madefor's x-height: what every face is sized to. */
const REFERENCE_X = 0.492;

const sizes = { s: 0.93, m: 1, l: 1.08 };
const leadings = { tight: 0.9, normal: 1, relaxed: 1.15 };
const densities = { compact: "0.22rem", default: null, roomy: "0.285rem" };

/** Text colour families: ink, ink-2, ink-3, per theme. */
const inks = {
  stone: null,
  slate: { light: ["#0f172a", "#334155", "#5b6577"], dark: ["#f1f5f9", "#cbd5e1", "#94a3b8"] },
  warm: { light: ["#2a2016", "#4b3f32", "#76665a"], dark: ["#f7f1e8", "#dacbb6", "#a8977f"] },
  contrast: { light: ["#000000", "#1f1f1f", "#454545"], dark: ["#ffffff", "#ededed", "#c4c4c4"] },
};

/** A palette as a strip: its sidebar, brand, accent and data colours. */
function Swatch({ seed, mode = "light", className }: { seed: PaletteSeed; mode?: "light" | "dark"; className?: string }) {
  const p = createPalette(seed)[mode];
  return (
    <span aria-hidden="true" className={cn("flex h-5 w-14 flex-none overflow-hidden rounded-sm ring-1 ring-line-strong", className)}>
      <span className="w-3" style={{ background: p.chrome }} />
      <span className="flex-1" style={{ background: p.ground }}>
        <span className="flex h-full items-center justify-center gap-0.5">
          <span className="size-2 rounded-full" style={{ background: p.brand }} />
          <span className="size-2 rounded-full" style={{ background: p.accent }} />
          <span className="size-2 rounded-full" style={{ background: p["chart-3"] }} />
        </span>
      </span>
    </span>
  );
}

/** Picks the preview's palette: the ready-made ones, or one made from seeds. */
function PalettePicker({ look, setLook }: { look: Look; setLook: SetLook }) {
  const current = look.palette === "custom" ? { name: "Your own", seed: look.seed } : (palettePresets[look.palette] ?? palettePresets.neutral!);
  const setSeed = (k: keyof PaletteSeed, v: string) => setLook((l) => ({ ...l, palette: "custom", seed: { ...l.seed, [k]: v } }));
  const field = "h-7 rounded-md border border-line-strong bg-surface px-2 text-small text-ink";
  return (
    <Popover
      label="Palette"
      panelClassName="w-[min(520px,calc(100vw-2rem))] p-0"
      trigger={
        <Button size="sm" iconRight={<ChevronDown size={13} className="text-ink-3" />}>
          <span className="flex items-center gap-2">
            <Swatch seed={current.seed} />
            <span>{current.name}</span>
          </span>
        </Button>
      }
    >
      {(close) => (
        <div className="flex max-h-[min(560px,70vh)] flex-col">
          <div className="grid gap-1.5 overflow-y-auto p-2 sm:grid-cols-2">
            {Object.entries(palettePresets).map(([id, pr]) => (
              <button
                key={id}
                type="button"
                aria-pressed={look.palette === id}
                onClick={() => {
                  setLook((l) => ({ ...l, palette: id, brand: null }));
                  close();
                }}
                className={cn("flex cursor-pointer items-start gap-2.5 rounded-md p-2 text-left focus-visible:outline-2 focus-visible:outline-focus", look.palette === id ? "bg-brand-soft ring-1 ring-line-strong" : "hover:bg-surface-2")}
              >
                <span className="flex flex-col gap-1">
                  <Swatch seed={pr.seed} />
                  <Swatch seed={pr.seed} mode="dark" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-label font-medium text-ink">{pr.name}</span>
                  <span className="text-caption text-ink-3">{pr.note}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 border-t border-line p-3">
            <span className="text-caption font-semibold uppercase tracking-[0.06em] text-ink-3">Your own, from a few colours</span>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-caption text-ink-3">
                Brand
                <input type="color" value={look.seed.brand} onChange={(e) => setSeed("brand", e.target.value)} className="h-7 w-12 cursor-pointer rounded-md border border-line-strong bg-surface p-0.5" />
              </label>
              <label className="flex flex-col gap-1 text-caption text-ink-3">
                Accent
                <input type="color" value={look.seed.accent ?? "#1abb9c"} onChange={(e) => setSeed("accent", e.target.value)} className="h-7 w-12 cursor-pointer rounded-md border border-line-strong bg-surface p-0.5" />
              </label>
              <label className="flex flex-col gap-1 text-caption text-ink-3">
                Sidebar
                <select value={String(look.seed.chrome ?? "brand")} onChange={(e) => setSeed("chrome", e.target.value)} className={field}>
                  <option value="surface">Like the cards</option>
                  <option value="brand">Brand colour</option>
                  <option value="dark">Near-black</option>
                  <option value="tinted">Tinted</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-caption text-ink-3">
                Greys
                <select value={String(look.seed.neutral ?? "brand")} onChange={(e) => setSeed("neutral", e.target.value)} className={field}>
                  <option value="brand">Toward the brand</option>
                  <option value="cool">Cool</option>
                  <option value="warm">Warm</option>
                  <option value="none">Pure grey</option>
                </select>
              </label>
              <Button size="sm" variant={look.palette === "custom" ? "primary" : "secondary"} onClick={() => setLook((l) => ({ ...l, palette: "custom", brand: null }))}>
                Use it
              </Button>
            </div>
          </div>
        </div>
      )}
    </Popover>
  );
}

export const brands: { name: string; value: string | null }[] = [
  { name: "Ink", value: null },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#15803d" },
  { name: "Orange", value: "#ea580c" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" },
];

type Style = { name: string; fontSize: string; lineHeight: string | number };
const styles: Style[] = tokens.type.groups.flatMap((g) => g.styles as Style[]);

/** The page's own theme, followed when the preview's is "page". */
export function usePageTheme(): "light" | "dark" {
  const [t, setT] = useState<"light" | "dark">("light");
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const read = () => {
      const set = document.documentElement.dataset.theme;
      setT(set === "light" || set === "dark" ? set : media.matches ? "dark" : "light");
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    media.addEventListener("change", read);
    return () => {
      obs.disconnect();
      media.removeEventListener("change", read);
    };
  }, []);
  return t;
}

/** The variables that draw a look, for a preview in theme t. */
export function lookStyle(look: Look, t: "light" | "dark"): React.CSSProperties {
  const v: Record<string, string> = { ...(radii[look.radius] ?? {}) };
  if (look.palette !== "neutral") {
    const seed = look.palette === "custom" ? look.seed : palettePresets[look.palette]?.seed;
    if (seed) Object.assign(v, paletteVars(createPalette(seed), t));
  }
  if (look.brand) {
    v["--brand"] = look.brand;
    v["--brand-hover"] = `color-mix(in oklch, ${look.brand} 86%, black)`;
    v["--brand-ink"] = "#ffffff";
    v["--brand-soft"] = `color-mix(in oklch, ${look.brand} 14%, transparent)`;
  }
  const f = fonts[look.font];
  v["--font-body"] = f.body;
  v["--font-display"] = f.display;
  if (look.tune) {
    [v["--font-weight-normal"], v["--font-weight-medium"], v["--font-weight-semibold"]] = f.weights.map(String) as [string, string, string];
    v["--font-size-adjust"] = `ex-height ${REFERENCE_X}`;
    if (f.display_vs) v["--font-display--font-variation-settings"] = f.display_vs;
  }
  const scale = sizes[look.size];
  const lead = leadings[look.leading] * (look.tune ? f.leading : 1);
  if (scale !== 1 || lead !== 1) {
    for (const s of styles) {
      const px = parseFloat(s.fontSize);
      v[`--text-${s.name}`] = `${(px * scale).toFixed(2)}px`;
      const lh = String(s.lineHeight);
      v[`--text-${s.name}--line-height`] = lh.endsWith("px") ? `${(parseFloat(lh) * scale * lead).toFixed(2)}px` : `${(parseFloat(lh) * lead).toFixed(3)}`;
    }
  }
  const ink = inks[look.ink];
  if (ink) [v["--ink"], v["--ink-2"], v["--ink-3"]] = ink[t];
  const d = densities[look.density];
  if (d) v["--spacing"] = d;
  return v as React.CSSProperties;
}

type SetLook = React.Dispatch<React.SetStateAction<Look>>;
const LookContext = createContext<{ look: Look; setLook: SetLook } | null>(null);

/** Keeps one look across pages (the templates share theirs). */
/** ?embed: the page shows only what it previews, full window (for screenshots and iframes). Read after mounting. */
export function useEmbed() {
  const [embed, setEmbed] = useState(false);
  useEffect(() => setEmbed(new URLSearchParams(location.search).has("embed")), []);
  return embed;
}

/** A look from the address: ?palette=navy&theme=light&device=laptop, so a preview can be linked to. */
function lookFromUrl(): Partial<Look> {
  const q = new URLSearchParams(location.search);
  const out: Partial<Look> = {};
  const palette = q.get("palette");
  if (palette && (palette === "custom" || palettePresets[palette])) out.palette = palette;
  const theme = q.get("theme");
  if (theme === "light" || theme === "dark" || theme === "both" || theme === "page") out.theme = theme;
  const device = q.get("device");
  if (device === "fit" || device === "phone" || device === "tablet" || device === "laptop") out.device = device;
  return out;
}

export function LookProvider({ children }: { children: React.ReactNode }) {
  const [look, setLook] = useState(defaultLook);
  useEffect(() => setLook((l) => ({ ...l, ...lookFromUrl() })), []);
  return <LookContext.Provider value={{ look, setLook }}>{children}</LookContext.Provider>;
}

/** The shared look if there is a provider, else this component's own. */
export function useLook(): [Look, SetLook] {
  const shared = useContext(LookContext);
  const [own, setOwn] = useState(defaultLook);
  return shared ? [shared.look, shared.setLook] : [own, setOwn];
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption text-ink-3">{label}</span>
      {children}
    </div>
  );
}

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/** Screen widths to test at; "fit" is the width there is. */
export const devices = {
  fit: { label: "Fit", width: null, icon: Maximize2 },
  phone: { label: "Phone", width: 390, icon: Smartphone },
  tablet: { label: "Tablet", width: 820, icon: Tablet },
  laptop: { label: "Laptop", width: 1280, icon: Laptop },
} as const;

/**
 * The testing bar: device width, theme and brand always on show in one row,
 * with the finer controls (corners, font, text size, line spacing, text
 * colour, density) behind "Type & shape". `children` go first in the row
 * (the templates' sidebar picker). `both` adds the side-by-side theme.
 */
export function LookControls({
  look,
  setLook,
  both = true,
  flat,
  children,
}: {
  look: Look;
  setLook: SetLook;
  both?: boolean;
  /** No box of its own: for a bar that runs edge to edge. */
  flat?: boolean;
  /** Kept for callers; the row now shows every main choice itself. */
  summary?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // From the latest look, so two quick changes both stick.
  const set = <K extends keyof Look>(k: K, v: Look[K]) => setLook((l) => ({ ...l, [k]: v }));
  const changed = (["radius", "font", "size", "leading", "ink", "density", "tune"] as const).filter((k) => look[k] !== defaultLook[k]).length;
  return (
    <div className={flat ? "" : "rounded-lg border border-line bg-surface"}>
      <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", flat ? "px-(--page-x) py-2" : "p-3")}>
        {children}
        <Tabs
          variant="pills"
          label="Screen width"
          value={look.device}
          onValueChange={(v) => set("device", v as Look["device"])}
          items={Object.entries(devices).map(([value, d]) => ({
            value,
            label: (
              <span className="inline-flex items-center gap-1.5" title={d.width ? `${d.label}, ${d.width}px` : "As wide as there is room"}>
                <d.icon size={15} />
                <span className="max-sm:sr-only">{d.label}</span>
              </span>
            ),
          }))}
        />
        <Tabs
          variant="pills"
          label="Preview theme"
          value={look.theme}
          onValueChange={(v) => set("theme", v as Look["theme"])}
          items={(both ? ["page", "light", "dark", "both"] : ["page", "light", "dark"]).map((t) => ({ value: t, label: cap(t) }))}
        />
        <PalettePicker look={look} setLook={setLook} />
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          aria-expanded={open}
          icon={<SlidersHorizontal size={15} />}
          iconRight={<ChevronDown size={15} className={cn("transition-transform", open && "rotate-180")} />}
          onClick={() => setOpen(!open)}
        >
          Type &amp; shape{changed ? ` · ${changed}` : ""}
        </Button>
      </div>
      {open ? (
        <div className={cn("flex flex-wrap items-end gap-x-5 gap-y-4 border-t border-line", flat ? "px-(--page-x) py-3" : "p-4")}>
          <Labelled label="Corners">
            <Tabs variant="pills" label="Corner rounding" value={look.radius} onValueChange={(v) => set("radius", v as Look["radius"])} items={Object.keys(radii).map((r) => ({ value: r, label: cap(r) }))} />
          </Labelled>
          <Labelled label="Font">
            <Select
              aria-label="Font"
              className="w-[170px]"
              value={look.font}
              onChange={(e) => set("font", e.target.value as Look["font"])}
              options={Object.entries(fonts).map(([value, f]) => ({ value, label: f.label }))}
            />
          </Labelled>
          <Labelled label="Text size">
            <Tabs variant="pills" label="Text size" value={look.size} onValueChange={(v) => set("size", v as Look["size"])} items={["s", "m", "l"].map((s) => ({ value: s, label: s.toUpperCase() }))} />
          </Labelled>
          <Labelled label="Line spacing">
            <Tabs variant="pills" label="Line spacing" value={look.leading} onValueChange={(v) => set("leading", v as Look["leading"])} items={Object.keys(leadings).map((l) => ({ value: l, label: cap(l) }))} />
          </Labelled>
          <Labelled label="Text colour">
            <Select
              aria-label="Text colour"
              className="w-[130px]"
              value={look.ink}
              onChange={(e) => set("ink", e.target.value as Look["ink"])}
              options={Object.keys(inks).map((i) => ({ value: i, label: cap(i) }))}
            />
          </Labelled>
          <Labelled label="Font tuning">
            <Switch
              label={<span className="text-small font-normal text-ink-2">Match Wix Madefor</span>}
              checked={look.tune}
              onCheckedChange={(on) => set("tune", on)}
            />
          </Labelled>
          <Labelled label="Density">
            <Tabs variant="pills" label="Density" value={look.density} onValueChange={(v) => set("density", v as Look["density"])} items={Object.keys(densities).map((d) => ({ value: d, label: cap(d) }))} />
          </Labelled>
          {changed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLook((l) => ({ ...defaultLook, device: l.device, theme: l.theme, brand: l.brand }))}
            >
              Reset
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Draws a box `width` pixels wide, scaled down when there's less room, so a
 * preview can be seen at a real phone, tablet or laptop width.
 */
function Device({ width, label, children }: { width: number | null; label: string; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!width) return;
    const ro = new ResizeObserver(() => {
      setRoom(outer.current?.clientWidth ?? 0);
      setHeight(inner.current?.offsetHeight ?? 0);
    });
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [width]);
  if (!width) return <>{children}</>;
  const scale = room ? Math.min(1, room / width) : 1;
  return (
    <div ref={outer} className="flex min-w-0 flex-col items-center gap-2">
      <div style={{ width: width * scale, height: height ? height * scale : undefined }}>
        <div ref={inner} style={{ width, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
      <span className="text-caption tabular-nums text-ink-3">
        {label} · {width}px{scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ""}
      </span>
    </div>
  );
}

/**
 * A preview drawn in a look and at a device width: one stage, or light and
 * dark side by side. Fixed children (dialogs, panels, drawers) stay inside it,
 * and an AppShell inside lays itself out for the stage's width.
 */
export function Stage({ look, className, wide, children }: { look: Look; className?: string; wide?: boolean; children: () => React.ReactNode }) {
  const page = usePageTheme();
  const device = devices[look.device];
  const one = (t: "light" | "dark" | undefined) => (
    <Device width={device.width} label={`${device.label}${t ? `, ${t}` : ""}`}>
      <div
        data-theme={t}
        style={lookStyle(look, t ?? page)}
        className={cn(
          "relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-lg border border-line bg-ground p-8 font-body font-normal text-ink [font-size-adjust:var(--font-size-adjust)] [transform:translateZ(0)]",
          device.width && "shadow-2",
          className,
        )}
      >
        {children()}
      </div>
    </Device>
  );
  if (look.theme !== "both") return one(look.theme === "page" ? undefined : look.theme);
  // Side by side when both fit; a phone pair always does.
  const pair = !wide || look.device === "phone";
  return (
    <div className={cn("grid min-w-0 gap-4", pair && "md:grid-cols-2")}>
      {one("light")}
      {one("dark")}
    </div>
  );
}
