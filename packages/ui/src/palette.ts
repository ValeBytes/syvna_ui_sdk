// Palettes: every colour token, light and dark, from a few seed colours.
//
// A design (or an agent) says what it wants in a few words: the brand, an
// accent, what the sidebar looks like, how the greys lean. createPalette works
// out the rest in OKLCH, so lightness steps look even across hues, tints the
// greys toward the brand, keeps text readable (it checks contrast), and picks
// a data palette that starts from the brand. Apply it with paletteCss (a
// stylesheet) or paletteVars (inline style).
//
// Plain TypeScript, no dependencies; erasable syntax only, so Node runs it
// directly (the MCP server's make_palette uses it).

export type Mode = "light" | "dark";
export type Tokens = Record<string, string>;
export interface Palette {
  light: Tokens;
  dark: Tokens;
}

export interface PaletteSeed {
  /** The brand: primary buttons, headings when it's dark enough, the identity. A hex colour. */
  brand: string;
  /** What's selected or in progress: switches, checkboxes, tab underlines, progress bars, active nav. Derived from the brand if left out. */
  accent?: string;
  /**
   * The sidebar. surface: like the page's cards (quiet). brand: the brand colour, darkened to carry
   * white text (the classic admin look). dark: near-black. tinted: a light wash of the brand. Or a hex colour.
   */
  chrome?: "surface" | "brand" | "dark" | "tinted" | string;
  /** How the greys lean. brand: toward the brand's hue (the default). cool: blue-grey. warm: sand. none: pure grey. Or a hue, 0–360. */
  neutral?: "brand" | "cool" | "warm" | "none" | number;
  /** How strongly the greys lean, 0–1. 0.5 by default. */
  tint?: number;
  /** Headings and big numbers in the brand colour (light mode) instead of the text colour. On by default when the brand is dark enough to read. */
  brandHeadings?: boolean;
}

/* ---------- colour maths ---------- */

type Lch = { l: number; c: number; h: number };

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const to = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function toOklch(hex: string): Lch {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.sqrt(A * A + B * B);
  const h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h: c < 0.002 ? 0 : h };
}

function lchToLinear({ l, c, h }: Lch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S];
}

const inGamut = (rgb: number[]) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);

/** An OKLCH colour as hex, lowering chroma until it fits sRGB. */
export function oklch(l: number, c: number, h: number): string {
  const L = Math.min(1, Math.max(0, l));
  let lo = 0;
  let hi = Math.max(0, c);
  if (inGamut(lchToLinear({ l: L, c: hi, h }))) return rgbToHex(lchToLinear({ l: L, c: hi, h }).map(fromLinear) as [number, number, number]);
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(lchToLinear({ l: L, c: mid, h }))) lo = mid;
    else hi = mid;
  }
  return rgbToHex(lchToLinear({ l: L, c: lo, h }).map(fromLinear) as [number, number, number]);
}

const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio of two colours, 1–21. */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

/** Moves a colour's lightness away from `bg` until it reaches `min` contrast with it. */
export function readable(fg: string, bg: string, min = 4.5): string {
  if (contrast(fg, bg) >= min) return fg;
  const { l, c, h } = toOklch(fg);
  const darker = luminance(bg) > 0.18;
  for (let i = 1; i <= 50; i++) {
    const next = oklch(darker ? l - i * 0.02 : l + i * 0.02, c, h);
    if (contrast(next, bg) >= min) return next;
  }
  return darker ? "#000000" : "#ffffff";
}

/** White or near-black text, whichever reads better on `bg`. */
export const inkOn = (bg: string, hue = 0) => {
  const light = oklch(0.985, 0.005, hue);
  const dark = oklch(0.2, 0.01, hue);
  return contrast(light, bg) >= contrast(dark, bg) ? light : dark;
};

/** Deepens (or, on dark, lifts) a fill until the text on it reads at 4.5:1. */
function fillable(bg: string, lighten = false): string {
  let c = bg;
  for (let i = 0; i < 30 && contrast(inkOn(c, toOklch(c).h), c) < 4.6; i++) {
    const { l, c: ch, h } = toOklch(c);
    c = oklch(lighten ? l + 0.015 : l - 0.015, ch, h);
  }
  return c;
}

/* ---------- the palette ---------- */

/** The tones, steady across palettes so a status means the same thing everywhere. */
const tones: Record<Mode, Tokens> = {
  light: { success: "#15803d", "success-soft": "#dcfce7", warning: "#a14a04", "warning-soft": "#fef3c7", danger: "#b91c1c", "danger-soft": "#fee2e2", "danger-ink": "#ffffff", info: "#1d4ed8", "info-soft": "#dbeafe", overlay: "rgba(15, 23, 42, 0.45)" },
  dark: { success: "#8bd5a8", "success-soft": "#16241c", warning: "#f2b65a", "warning-soft": "#221e16", danger: "#f28b82", "danger-soft": "#2a1a19", "danger-ink": "#1c1c1c", info: "#6ea8fe", "info-soft": "#18202e", overlay: "rgba(0, 0, 0, 0.6)" },
};

const hueDistance = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** Six data colours told apart by hue and lightness, starting from the brand and the accent. */
function chartColours(brand: Lch, accent: Lch, mode: Mode): string[] {
  const L = mode === "light" ? [0.5, 0.66, 0.74, 0.56, 0.62, 0.7] : [0.72, 0.8, 0.84, 0.7, 0.76, 0.82];
  const hues: number[] = [];
  const want = [brand.c > 0.04 ? brand.h : 255, accent.h, 70, 300, 15, 190, 140, 230];
  for (const h of want) if (hues.length < 6 && hues.every((x) => hueDistance(x, h) > 34)) hues.push(h);
  for (let h = 0; hues.length < 6; h += 45) if (hues.every((x) => hueDistance(x, h) > 25)) hues.push(h);
  return hues.map((h, i) => oklch(L[i]!, mode === "light" ? 0.15 : 0.13, h));
}

/** Every colour token, light and dark, from a few seeds. */
export function createPalette(seed: PaletteSeed): Palette {
  const brand = toOklch(seed.brand);
  const nh = seed.neutral === "cool" ? 250 : seed.neutral === "warm" ? 70 : typeof seed.neutral === "number" ? seed.neutral : brand.h;
  const tint = seed.neutral === "none" ? 0 : Math.min(1, Math.max(0, seed.tint ?? 0.5));
  const nc = (brand.c > 0.02 || seed.neutral === "cool" || seed.neutral === "warm" || typeof seed.neutral === "number" ? 0.022 : 0) * tint;
  const accent = toOklch(seed.accent ?? oklch(0.66, Math.max(0.12, brand.c), (brand.h + 160) % 360));
  const chrome = seed.chrome ?? "surface";

  const build = (mode: Mode): Tokens => {
    const light = mode === "light";
    const t: Tokens = {};
    // Greys, leaning toward the neutral hue.
    t.ground = light ? oklch(0.975, nc * 0.6, nh) : oklch(0.18, nc * 0.8, nh);
    t.surface = light ? oklch(0.998, nc * 0.15, nh) : oklch(0.215, nc * 0.8, nh);
    t["surface-2"] = light ? oklch(0.955, nc * 0.8, nh) : oklch(0.25, nc, nh);
    t.line = light ? oklch(0.915, nc, nh) : oklch(0.275, nc, nh);
    t["line-strong"] = light ? oklch(0.855, nc * 1.2, nh) : oklch(0.33, nc * 1.2, nh);
    t.ink = light ? oklch(0.21, nc * 1.4, nh) : oklch(0.965, nc * 0.5, nh);
    t["ink-2"] = light ? oklch(0.37, nc * 1.4, nh) : oklch(0.87, nc * 0.7, nh);
    t["ink-3"] = readable(light ? oklch(0.52, nc * 1.4, nh) : oklch(0.71, nc, nh), t.surface, 4.5);
    t["ink-4"] = light ? oklch(0.7, nc, nh) : oklch(0.52, nc, nh);

    // The brand: dark enough for white text in light mode; lighter in dark mode.
    const b = light ? (brand.l > 0.62 && brand.c < 0.12 ? oklch(0.5, brand.c, brand.h) : seed.brand) : brand.l < 0.62 ? oklch(Math.max(0.72, brand.l + 0.25), Math.min(brand.c, 0.16), brand.h) : seed.brand;
    // A mid-tone brand is deepened just enough to carry white text on a button.
    t.brand = fillable(b, !light && toOklch(b).l > 0.6);
    const bl = toOklch(t.brand);
    t["brand-hover"] = oklch(light ? bl.l - 0.05 : bl.l + 0.05, bl.c, bl.h);
    t["brand-ink"] = inkOn(t.brand, bl.h);
    t["brand-soft"] = light ? oklch(0.945, Math.min(bl.c * 0.3, 0.045), bl.h) : oklch(0.29, Math.min(bl.c * 0.4, 0.06), bl.h);

    // The accent: visible against cards, with its own soft wash.
    const a = readable(light ? oklch(Math.min(accent.l, 0.66), accent.c, accent.h) : oklch(Math.max(accent.l, 0.72), Math.min(accent.c, 0.15), accent.h), t.surface, 3);
    t.accent = fillable(a, !light && toOklch(a).l > 0.6);
    const al = toOklch(t.accent);
    t["accent-ink"] = inkOn(t.accent, al.h);
    t["accent-soft"] = light ? oklch(0.95, Math.min(al.c * 0.3, 0.05), al.h) : oklch(0.3, Math.min(al.c * 0.4, 0.06), al.h);
    t.focus = readable(t.accent, t.surface, 3);

    // Headings: the brand when it reads as text, else the ink.
    const brandText = light && (seed.brandHeadings ?? (contrast(seed.brand, t.surface) >= 7 && brand.c > 0.03));
    t["ink-heading"] = brandText ? readable(seed.brand, t.surface, 7) : t.ink;

    // The sidebar.
    let cbg: string;
    if (chrome === "brand") cbg = light ? (brand.l > 0.42 ? oklch(0.34, Math.min(brand.c, 0.09), brand.h) : seed.brand) : oklch(0.2, Math.min(brand.c, 0.07), brand.h);
    else if (chrome === "dark") cbg = light ? oklch(0.22, nc * 1.5, nh) : oklch(0.15, nc, nh);
    else if (chrome === "tinted") cbg = light ? oklch(0.95, Math.min(brand.c * 0.25, 0.035), brand.h) : oklch(0.23, Math.min(brand.c * 0.35, 0.05), brand.h);
    else if (chrome === "surface") cbg = t.surface;
    else cbg = light ? chrome : oklch(Math.min(toOklch(chrome).l, 0.24), Math.min(toOklch(chrome).c, 0.07), toOklch(chrome).h);
    const cl = toOklch(cbg);
    const darkChrome = luminance(cbg) < 0.18;
    if (chrome === "surface") {
      Object.assign(t, { chrome: t.surface, "chrome-2": t["surface-2"], "chrome-active": t["brand-soft"], "chrome-line": t.line, "chrome-ink": t.ink, "chrome-ink-2": t["ink-2"], "chrome-ink-3": t["ink-3"] });
    } else {
      t.chrome = cbg;
      t["chrome-2"] = oklch(darkChrome ? cl.l + 0.05 : cl.l - 0.035, cl.c, cl.h);
      t["chrome-active"] = oklch(darkChrome ? cl.l - 0.045 : cl.l - 0.07, cl.c * (darkChrome ? 1.1 : 1.4), cl.h);
      t["chrome-line"] = oklch(darkChrome ? cl.l + 0.08 : cl.l - 0.08, cl.c * 0.8, cl.h);
      t["chrome-ink"] = inkOn(cbg, cl.h);
      t["chrome-ink-2"] = readable(darkChrome ? oklch(0.88, Math.min(cl.c, 0.03), cl.h) : oklch(0.35, Math.min(cl.c, 0.04), cl.h), cbg, 4.5);
      t["chrome-ink-3"] = readable(darkChrome ? oklch(0.74, Math.min(cl.c, 0.03), cl.h) : oklch(0.5, Math.min(cl.c, 0.04), cl.h), cbg, 3.2);
    }
    // The top bar: a step off the page when the sidebar has colour.
    t.bar = chrome === "surface" ? t.ground : light ? oklch(0.955, nc * 0.9, nh) : oklch(0.2, nc * 0.9, nh);

    chartColours(brand, accent, mode).forEach((c, i) => (t[`chart-${i + 1}`] = c));
    return { ...t, ...tones[mode] };
  };
  return { light: build("light"), dark: build("dark") };
}

/* ---------- presets ---------- */

export interface PalettePreset {
  name: string;
  /** A line on when it suits. */
  note: string;
  seed: PaletteSeed;
}

/** Ready-made palettes, each a seed for createPalette. Pick one, or use it as a starting point. */
export const palettePresets: Record<string, PalettePreset> = {
  neutral: { name: "Neutral", note: "Black, white and greys: lets content and photos lead.", seed: { brand: "#171717", accent: "#171717", neutral: "none", chrome: "surface", brandHeadings: false } },
  navy: { name: "Admin navy", note: "A navy sidebar and teal highlights: the classic business dashboard.", seed: { brand: "#2a3f54", accent: "#1abb9c", chrome: "brand", neutral: "cool" } },
  ocean: { name: "Ocean", note: "Deep blue with an aqua accent; calm and trustworthy for finance and health.", seed: { brand: "#0b4f8a", accent: "#00a3a3", chrome: "brand", neutral: "cool" } },
  forest: { name: "Forest", note: "Pine green and gold on warm greys: sustainability, food, outdoors.", seed: { brand: "#1f5135", accent: "#c8950f", chrome: "brand", neutral: "warm" } },
  plum: { name: "Plum", note: "Deep violet with coral: creative tools and agencies.", seed: { brand: "#4b2e83", accent: "#e26d5c", chrome: "brand", neutral: "brand" } },
  midnight: { name: "Midnight", note: "Indigo with cyan, a near-black sidebar: developer tools and AI products.", seed: { brand: "#4f46e5", accent: "#06b6d4", chrome: "dark", neutral: "cool" } },
  sand: { name: "Sand", note: "Terracotta and teal on warm paper; a light sidebar: craft, hospitality, shops.", seed: { brand: "#9a4a24", accent: "#2f7d6d", chrome: "tinted", neutral: "warm" } },
  coral: { name: "Coral", note: "Bright coral with deep teal, a light sidebar: friendly consumer apps.", seed: { brand: "#d9482b", accent: "#147d74", chrome: "surface", neutral: "warm", brandHeadings: false } },
  slate: { name: "Slate and lime", note: "Graphite with a lime accent: operations, logistics, energy.", seed: { brand: "#26323d", accent: "#65a30d", chrome: "dark", neutral: "cool" } },
  rose: { name: "Rose", note: "Raspberry with sky blue, a tinted sidebar: beauty, fashion, wellness.", seed: { brand: "#a3164f", accent: "#0284c7", chrome: "tinted", neutral: "brand" } },
  emerald: { name: "Emerald", note: "Emerald with violet on cool greys: health, education, non-profits.", seed: { brand: "#047857", accent: "#7c3aed", chrome: "surface", neutral: "cool" } },
  amber: { name: "Amber", note: "Espresso brown and amber: logistics, construction, coffee.", seed: { brand: "#3b2a20", accent: "#d97706", chrome: "brand", neutral: "warm" } },
};

/* ---------- applying it ---------- */

/** A palette's values for one mode, as CSS variables for an element's style. */
export function paletteVars(palette: Palette, mode: Mode): Record<string, string> {
  return Object.fromEntries(Object.entries(palette[mode]).map(([k, v]) => [`--${k}`, v]));
}

/**
 * A palette as a stylesheet for `selector` (":root" for the whole app), light
 * by default, dark where data-theme="dark" says so, and the system's choice
 * only where data-theme="system": the same rules as tokens.css. Put it after
 * tokens.css.
 */
export function paletteCss(palette: Palette, selector = ":root"): string {
  const block = (t: Tokens) => Object.entries(t).map(([k, v]) => `  --${k}: ${v};`).join("\n");
  const sel = selector === ":root" ? "" : selector;
  return [
    `${selector} {\n${block(palette.light)}\n}`,
    `@media (prefers-color-scheme: dark) {\n  ${selector === ":root" ? ':root[data-theme="system"]' : `${sel}[data-theme="system"], [data-theme="system"] ${sel}`} {\n${block(palette.dark).replace(/^/gm, "  ")}\n  }\n}`,
    `${selector === ":root" ? "" : `${sel}`}[data-theme="dark"]${selector === ":root" ? "" : `, [data-theme="dark"] ${sel}`} {\n${block(palette.dark)}\n}`,
    `${selector === ":root" ? "" : `${sel}`}[data-theme="light"]${selector === ":root" ? "" : `, [data-theme="light"] ${sel}`} {\n${block(palette.light)}\n}`,
  ].join("\n");
}
