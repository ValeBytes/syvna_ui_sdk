# Bento

What the product does, as a grid of unequal cells, each with its own picture. Use it where a `FeatureGrid` of icons would be too thin: it shows the product instead of listing it.

- Four to six cells. One or two are larger (`span: "wide"`, `"tall"` or `"big"`); if they're all the same size, use `FeatureGrid`.
- Each cell shows a different kind of thing: a piece of a real screen, a small chart, a number, a photograph, a short list. `media` is that picture; build it from the app's own components with real data, never a stock image of a laptop.
- At most one cell on the `brand` or `ink` tone: the thing that matters most.
- Titles are a few words; descriptions one sentence.
