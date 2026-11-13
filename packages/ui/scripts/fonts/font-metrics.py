"""Measures the fonts the docs offer, from their files: what decides how big
they read, how much line height they need, and how heavy each weight looks."""

import os

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

base = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "node_modules", "@fontsource-variable")
fonts = ["wix-madefor-text", "wix-madefor-display", "geist", "inter", "manrope", "dm-sans", "fraunces"]


def bounds(font, ch):
    gs = font.getGlyphSet()
    name = font.getBestCmap().get(ord(ch))
    pen = BoundsPen(gs)
    gs[name].draw(pen)
    return pen.bounds, gs[name].width


def stem(font, ch="l"):
    """Width of the 'l' stem: a fair proxy for stroke weight."""
    (xmin, _, xmax, _), _ = bounds(font, ch)
    return xmax - xmin


print(f"{'font':22} {'x-h':>5} {'cap':>5} {'asc':>5} {'desc':>5} {'gap':>5} {'avgw':>5} {'stem400':>7} {'stem500':>7} {'wght':>9}")
for f in fonts:
    path = os.path.join(base, f, "files", f"{f}-latin-wght-normal.woff2")
    font = TTFont(path)
    upm = font["head"].unitsPerEm
    os2 = font["OS/2"]
    hhea = font["hhea"]
    xh = getattr(os2, "sxHeight", 0) or bounds(font, "x")[0][3]
    cap = getattr(os2, "sCapHeight", 0) or bounds(font, "H")[0][3]
    axis = next(a for a in font["fvar"].axes if a.axisTag == "wght")
    widths = [bounds(font, c)[1] for c in "abcdefghijklmnopqrstuvwxyz"]
    # Instances at 400 and 500 for stroke weight.
    s = {}
    for w in (400, 500):
        inst = instantiateVariableFont(TTFont(path), {"wght": max(axis.minValue, min(axis.maxValue, w))}, inplace=False)
        s[w] = stem(inst) / upm
    print(
        f"{f:22} {xh / upm:5.3f} {cap / upm:5.3f} {hhea.ascent / upm:5.3f} {-hhea.descent / upm:5.3f} {hhea.lineGap / upm:5.3f} "
        f"{sum(widths) / len(widths) / upm:5.3f} {s[400]:7.4f} {s[500]:7.4f} {axis.minValue:>4.0f}-{axis.maxValue:<4.0f}"
    )
