# Reveal

A container that eases in: when it's scrolled to (`when="view"`, the default) or as the page opens (`when="load"`). Wrap a heading, a picture, a card or a whole band in it.

For public pages only: landing pages, shops, a company's site. App screens (dashboards, lists, forms) never use it; people there are working, and things arriving late slow them down.

- **One idea per page.** Pick one effect (`up` is right for almost everything) and one duration, and use them throughout. Pictures beside text can come from their own side (`left`, `right`).
- **The first screen**: the hero's words with `when="load"`, then its picture with a `delay` of 100 to 200. Nothing else on load.
- **Down the page**: each section's heading and content, with `when="view"`. What is already on screen when the page opens stays still, so nothing blinks.
- Keep it short and small: 400 to 800 ms, 12 to 24 px. `scale` and `blur` once or twice a page at most.
- Rows of things (cards, features, logos) use `Stagger`, not a `Reveal` each with hand-counted delays.
- It does nothing for people who ask for less motion, and hides nothing when JavaScript is off.

Many kit sections take `animate` and do this themselves: `Section`, `FeatureGrid`, `Bento`, `FeatureRows`, `Stats`, `Steps`. Prefer that to wrapping them.
