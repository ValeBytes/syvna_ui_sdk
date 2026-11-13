import { extendTailwindMerge } from "tailwind-merge";

// The tokens' class names, so merging knows text-label is a size and text-ink a
// colour (both are text-*), and keeps one of each. scripts/build.mjs keeps
// these lists in step with tokens.json.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // tokens:colors
      color: ["ground","surface","surface-2","line","line-strong","ink","ink-2","ink-3","ink-4","brand","brand-hover","brand-ink","brand-soft","focus","success","success-soft","warning","warning-soft","danger","danger-soft","danger-ink","info","info-soft","overlay"],
      // tokens:text
      text: ["display-xl","display","heading","stat","title","subtitle","body-lg","body","label","small","caption","code"],
      shadow: ["1", "2", "3"],
    },
  },
});

/**
 * Joins class names, skipping the falsy ones, and lets a later Tailwind class
 * win over an earlier one of the same kind: cn("px-3", props.className) with
 * className "px-6" gives px-6. Every component passes className through it.
 */
export function cn(...parts: unknown[]): string {
  return twMerge(parts.filter((p): p is string => typeof p === "string" && p !== "").join(" "));
}

/** The colours a status can take, the same in every component. */
export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

/** A tone's text and icon colour. */
export const toneText: Record<Tone, string> = {
  neutral: "text-ink-2",
  brand: "text-ink",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

/** A tone's quiet fill, behind its text. */
export const toneSoft: Record<Tone, string> = {
  neutral: "bg-surface-2",
  brand: "bg-brand-soft",
  success: "bg-success-soft",
  warning: "bg-warning-soft",
  danger: "bg-danger-soft",
  info: "bg-info-soft",
};

/** A tone as a solid fill: bars, dots. */
export const toneFill: Record<Tone, string> = {
  neutral: "bg-ink-3",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

/** The keyboard focus ring every control shares. */
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
