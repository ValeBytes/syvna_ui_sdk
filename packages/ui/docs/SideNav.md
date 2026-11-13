# SideNav

The app's navigation as data, drawn as one of 21 sidebars. Describe the screens once, as groups of links, and pick a `variant`; changing how the sidebar looks is changing that one word. Put it in AppShell's `sidebar`.

- Pass `current` (the path on show, `usePathname()` in Next.js) and `as={Link}`. The link with that `href`, and the parents of it, are drawn active.
- Every link should have an icon: the rails, tiles, colourful and admin variants show nothing else.
- `children` under a link become a submenu: nested in classic, folded in tree, opening beside the menu on hover in admin.
- Give each group an `icon` for **rail-panel**, whose rail shows groups and whose panel shows the open group's links.
- `mark` is the brand mark alone, for the narrow variants; `brand` is the mark and the name.

Which to pick:

- **classic**, **bar**, **pills**, **minimal**: most apps; the difference is taste.
- **rail**, **collapsible**: when the screen needs its width (editors, maps, big tables).
- **rail-panel**: many sections, each with several screens, like Syvna's own dashboard.
- **admin**: a long menu where each section has sub-pages (a CMS, a back office).
- **accordion**, **tree**: deep structures: documentation, file-like hierarchies.
- **compact**: many screens, and people who know where they're going.
- **tiles**, **colorful**: few screens, for people who aren't regulars.
- **workspace**: when one person works across several businesses.
- **steps**: a setup flow, where the order matters.
- **inverted**, **brand**, **floating**, **cards**: the same as classic with a stronger look; pick one that suits the room's design.

For a sidebar built by hand, use Sidebar with NavSection and NavItem.
