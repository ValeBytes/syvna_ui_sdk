# Font measurements

Why each face in the docs' font control gets the size, line height and weights it does (see `fonts` in `apps/docs/components/look.tsx`). Needs Python with `fonttools` and `brotli`; run from anywhere after `npm install`:

    python packages/ui/scripts/fonts/font-metrics.py   # x-height, cap height, ascent, descent, average width
    python packages/ui/scripts/fonts/font-stems.py     # stem width of l and n at 400, 500 and 600

Wix Madefor Text is the reference. Each face is drawn at its x-height (`font-size-adjust: ex-height 0.492`), its line height scaled by how tall its ascenders and descenders are in x-heights, and its weights chosen so the stem, once sized, matches Wix's at the same role (0.077, 0.100, 0.116 of the em). Measured 2026-11-13:

| Face | x-height | asc+desc / x-height | stem 400 / 500 / 600 | weights used | line height |
|---|---|---|---|---|---|
| Wix Madefor Text | 0.492 | 2.56 | 0.077 / 0.100 / 0.116 | 400 / 500 / 600 | 1 |
| Geist | 0.530 | 2.45 | 0.084 / 0.106 / 0.128 | 400 / 500 / 600 | 0.98 |
| Inter | 0.546 | 2.22 | 0.088 / 0.107 / 0.127 | 400 / 520 / 600 | 0.95 |
| Manrope | 0.540 | 2.53 | 0.073 / 0.089 / 0.105 | 470 / 630 / 740 | 1 |
| DM Sans | 0.504 | 2.58 | 0.084 / 0.100 / 0.120 | 400 / 510 / 600 | 1 |
| Fraunces (headings) | 0.482 | 2.56 | 0.105 / 0.123 / 0.140 | wght 480 | – |
