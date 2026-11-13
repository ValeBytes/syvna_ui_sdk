# SiteHeader

A website's top bar: the brand, four to six links, and at the right a quiet "Sign in" with the one main action. On a phone the links fold into a menu button. 21 variants take the same brand, links and actions.

- Use `siteAction("primary")` on a link for the main action: `<a className={siteAction()} href="/signup">Start free</a>`.
- Pass `current` (the page's href) so its link is marked.
- `sticky` keeps it at the top as the page scrolls. With Next.js, pass `as={Link}`.

Which variant:

- **Most sites:** `classic`, `centered` (links in the middle), `split` (links beside the actions).
- **Brands and shops:** `brand-center` (the logo in the middle), `stacked` (logo on top, links under), `utility` (a row of small links above, `utility`).
- **Over a hero:** `transparent`, `glass`, `floating` (a pill off the edges), `floating-card`.
- **Strong colour:** `inverted`, `brand`.
- **Few links:** `minimal` (brand and menu only), `fullscreen` (the menu covers the page in large type).
- **Marking where they are:** `underline`, `pills`, `boxed`.
- **Extras:** `announcement` (a strip of news, `announcement`), `search` (a search field, `search`), `tall`, `compact`.
