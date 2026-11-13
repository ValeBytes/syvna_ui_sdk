"""Stem width of 'l' and 'n' at half the x-height: the stroke a reader sees,
at weights 400, 500 and 600, as a share of the em."""

import os

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

base = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "node_modules", "@fontsource-variable")
fonts = ["wix-madefor-text", "wix-madefor-display", "geist", "inter", "manrope", "dm-sans", "fraunces"]


class Segments(BasePen):
    """Flattens the outline into line segments."""

    def __init__(self, gs):
        super().__init__(gs)
        self.segs = []
        self.pt = None
        self.start = None

    def _moveTo(self, p):
        self.pt = self.start = p

    def _lineTo(self, p):
        self.segs.append((self.pt, p))
        self.pt = p

    def _curveToOne(self, a, b, c):
        p0 = self.pt
        prev = p0
        for i in range(1, 17):
            t = i / 16
            x = (1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * a[0] + 3 * (1 - t) * t * t * b[0] + t**3 * c[0]
            y = (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * a[1] + 3 * (1 - t) * t * t * b[1] + t**3 * c[1]
            self.segs.append((prev, (x, y)))
            prev = (x, y)
        self.pt = c

    def _qCurveToOne(self, a, b):
        p0 = self.pt
        prev = p0
        for i in range(1, 17):
            t = i / 16
            x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * a[0] + t * t * b[0]
            y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * a[1] + t * t * b[1]
            self.segs.append((prev, (x, y)))
            prev = (x, y)
        self.pt = b

    def _closePath(self):
        if self.pt and self.start and self.pt != self.start:
            self.segs.append((self.pt, self.start))


def crossings(font, ch, y):
    gs = font.getGlyphSet()
    pen = Segments(gs)
    gs[font.getBestCmap()[ord(ch)]].draw(pen)
    xs = []
    for (x0, y0), (x1, y1) in pen.segs:
        if (y0 - y) * (y1 - y) < 0:
            xs.append(x0 + (y - y0) * (x1 - x0) / (y1 - y0))
    return sorted(xs)


print(f"{'font':22} {'l@400':>6} {'l@500':>6} {'l@600':>6} {'n@400':>6}")
for f in fonts:
    path = os.path.join(base, f, "files", f"{f}-latin-wght-normal.woff2")
    font = TTFont(path)
    upm = font["head"].unitsPerEm
    xh = font["OS/2"].sxHeight
    axis = next(a for a in font["fvar"].axes if a.axisTag == "wght")
    out = []
    for w in (400, 500, 600):
        inst = instantiateVariableFont(TTFont(path), {"wght": max(axis.minValue, min(axis.maxValue, w))}, inplace=False)
        xs = crossings(inst, "l", xh / 2)
        out.append((xs[1] - xs[0]) / upm if len(xs) >= 2 else float("nan"))
        if w == 400:
            n = crossings(inst, "n", xh / 2)
            nstem = (n[1] - n[0]) / upm if len(n) >= 2 else float("nan")
    print(f"{f:22} {out[0]:6.4f} {out[1]:6.4f} {out[2]:6.4f} {nstem:6.4f}")
