# SiteHeader

A website's top bar: the brand, four to six links, and at the right a quiet "Sign in" with the one main action. On a phone the links fold into a menu button. 25 variants take the same brand, links and actions.

- Use `siteAction("primary")` on a link for the main action: `<a className={siteAction()} href="/signup">Start free</a>`.
  It takes any of Button's looks and sizes `sm`–`xl`: on a dark page the main action is `siteAction("inverse", "lg")`.
- Pass `current` (the page's href) so its link is marked.
- `sticky` keeps it at the top as the page scrolls: a solid bar that takes a soft shadow once the page moves under it. Never frosted; only `glass` blurs what's behind it. With Next.js, pass `as={Link}`.
- Links to the page's own sections (`#pricing`) mark the section in view as the reader scrolls, so leave `current` out on a one-page site.

Which variant:

- **Most sites:** `classic`, `centered` (links in the middle), `split` (links beside the actions).
- **Brands and shops:** `brand-center` (the logo in the middle), `stacked` (logo on top, links under), `utility` (a row of small links above, `utility`).
- **Over a hero:** `transparent`, `glass`, `floating` (a pill off the edges), `floating-card`.
- **Strong colour:** `inverted`, `brand`.
- **Few links:** `minimal` (brand and menu only), `fullscreen` (the menu covers the page in large type).
- **Marking where they are:** `underline`, `pills`, `boxed`.
- **Extras:** `announcement` (a strip of news, `announcement`), `search` (a search field, `search`), `tall`, `compact`.
- **Links with life:** `track` (a highlight slides to the link pointed at), `spotlight` (the other links dim), `editorial` (numbered small capitals, for studios and publications), `progress` (a brand-coloured line fills as the page is read, for long pages).

`classNames` adjusts `inner`, `brand`, `link` and `actions` with token classes; `className` is the bar itself.
