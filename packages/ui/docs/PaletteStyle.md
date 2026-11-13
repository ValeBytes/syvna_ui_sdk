# PaletteStyle

Gives an app its colours: a ready-made palette (`preset`), or one made from a few seed colours (`seed`), in light and dark. Put it once in the root layout. Every component follows, because every component reads colour roles, not colours.

## The colour roles

- **brand**: the main action (primary buttons) and the identity. One per screen should stand out: the main button, the logo.
- **accent**: what's selected or in progress: switches, checkboxes, the tab underline, progress, the open link's marker, counts in the sidebar. A second colour that differs from the brand in hue.
- **ink-heading**: titles and big numbers. A dark brand reads well here; a bright one doesn't, and the generator decides.
- **chrome**: the sidebar, with its own text, hover, active and lines. `surface` (quiet, like the cards), `brand` (the classic admin look), `dark` (near-black), `tinted` (a light wash of the brand).
- **bar**: the top bar, a step off the page when the sidebar has colour.
- **greys**: ground, surface, lines and ink, leaning toward the brand (`brand`), blue (`cool`), sand (`warm`) or pure (`none`).
- **chart-1…6**: data colours, told apart by hue and lightness, starting from the brand and the accent.
- **tones** (success, warning, danger, info) stay the same in every palette, so a status always means the same thing.

## Mixing colours well

- Pick **one brand and one accent**, far apart in hue (navy and teal, green and gold, violet and coral). Three loud colours fight; two plus greys look designed.
- Let **most of the screen be greys**. Colour marks what matters: the sidebar, the main action, what's selected, the data.
- A **coloured sidebar** suits tools people live in all day (admin, operations, finance); a **surface** sidebar suits content-led apps and shops.
- **Warm greys** with earthy brands (terracotta, forest, espresso); **cool greys** with blues, indigos and slates.
- Don't pick text colours yourself: the generator gives every fill a readable text colour and checks contrast (4.5:1 for text, 3:1 for the accent on cards).
- Never write hex colours in components. If a colour is missing, it's a missing role: say so.

## For agents

`list_palettes` shows the ready-made ones and when each suits; `make_palette` builds one from the user's brand colour and reports contrast. Offer two or three that fit the business (a clinic: ocean, emerald; a coffee roaster: amber, sand) and let the user pick, the way VariantChooser offers looks.
