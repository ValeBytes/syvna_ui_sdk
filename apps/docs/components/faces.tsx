"use client";

import { fonts } from "./look";

/**
 * Each face in the font control, drawn the way the look draws it when tuned:
 * at Wix Madefor's x-height, with its own weights. The numbers come from
 * packages/ui/scripts/fonts (measured from the font files).
 */
export function Faces() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-1">
      {Object.entries(fonts).map(([key, f]) => (
        <div key={key} className="grid gap-x-6 gap-y-2 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-label font-medium text-ink">{f.label}</span>
            <span className="text-small text-ink-3">
              x-height {f.xHeight} · weights {f.weights.join(" / ")}
              {f.leading !== 1 ? ` · lines ×${f.leading}` : ""}
              {f.display_vs ? ` · headings ${f.display_vs.replace(/"/g, "")}` : ""}
            </span>
          </div>
          <div style={{ fontSizeAdjust: "ex-height 0.492" }} className="flex min-w-0 flex-col gap-1">
            <span style={{ fontFamily: f.display, fontWeight: f.weights[2], fontVariationSettings: f.display_vs ?? undefined }} className="text-title text-ink">
              Six orders to pack today
            </span>
            <span style={{ fontFamily: f.body, fontWeight: f.weights[0] }} className="text-body text-ink-2">
              Amara Okafor ordered three ceramic mugs from Lagos. <span style={{ fontWeight: f.weights[1] }} className="text-ink">Mark as packed</span> when they&apos;re ready.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
