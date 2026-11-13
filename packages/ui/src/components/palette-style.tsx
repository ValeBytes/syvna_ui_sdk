import { createPalette, paletteCss, palettePresets, type Palette, type PaletteSeed } from "../palette";

export interface PaletteStyleProps {
  /** A ready-made palette by name: "navy", "forest", "midnight"… (palettePresets). */
  preset?: keyof typeof palettePresets | (string & {});
  /** Or seeds to make one from: { brand, accent, chrome, neutral }. */
  seed?: PaletteSeed;
  /** Or a palette already made with createPalette. */
  palette?: Palette;
  /** Where it applies: the whole app (":root") or a part of it ("[data-palette=ocean]"). */
  selector?: string;
}

/**
 * Applies a palette, light and dark, as a <style> tag: put it in the root
 * layout. One of preset, seed or palette; the neutral palette if none.
 */
export function PaletteStyle({ preset, seed, palette, selector = ":root" }: PaletteStyleProps) {
  const p = palette ?? createPalette(seed ?? palettePresets[preset ?? "neutral"]?.seed ?? palettePresets.neutral!.seed);
  return <style data-syvna-palette="" dangerouslySetInnerHTML={{ __html: paletteCss(p, selector) }} />;
}
