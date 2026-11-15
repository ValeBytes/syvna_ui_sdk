# Changelog

Every release of Syvna UI: the library (`@syvna/ui`), the copy-in registry and CLI (`syvna-ui`), and the MCP server move together under one version, tagged `vX.Y.Z`.

- **patch** (0.1.1): fixes. Nothing for an app to change.
- **minor** (0.2.0): new components, props, variants or tokens. Before 1.0, a minor release may also rename or remove something; it says so under **Changed** with what to do.
- **major** (1.0.0 and on): something apps must change: a prop renamed or removed, a default changed, a token renamed.

Write what changed under **Unreleased** as you go (Added, Changed, Fixed), in words an app's author understands. `npm run release` turns it into the release's notes, and `npx syvna-ui upgrade` links to it.

## Unreleased

### Fixed

- v0.9.0 dropped `font-synthesis-weight: none` from the theme by mistake, so
  one-weight fonts (Instrument Serif, Bebas Neue) were smeared into a fake bold
  again under `font-semibold`. It's back.

## v0.9.0 (2026-11-15)

### Added

- `FormPage`: a page whose job is a form, in 20 layouts drawn from the best
  settings and create pages (Shopify's annotated sections, GitHub's category
  nav, Vercel's setting cards, Linear's setting rows, GOV.UK's one question a
  screen, wizards, a form beside a live preview, a record with its details).
  The page uses its whole width while the fields stay in one column of at
  most 40rem, 24px apart, with 40px between sections and one Save. Sections
  take fields, setting `rows` (a control at the right), a `danger` tone and
  an `advanced` flag. Guide: docs/FormPage.md.

### Fixed

- `BarChart` with many bars (30 days, say) names every few, counting back
  from the latest, so each name shows whole instead of cut to "1…".

## v0.8.1 (2026-11-15)

### Fixed

- In dark mode, a black or grey brand (the Neutral palette, a `#171717`
  seed) makes near-white main buttons instead of mid-grey ones, which read as
  switched off. Coloured brands are unchanged.

## v0.8.0 (2026-11-15)

### Added

- `SiteHeader` has 25 variants. New: `track` (a highlight slides to the link
  pointed at), `spotlight` (the other links dim), `editorial` (numbered small
  capitals) and `progress` (a brand-coloured line fills as the page is read).
- `SiteHeader`'s links mark the section in view as the page scrolls, when they
  point at sections of the same page (`#pricing`) and no `current` is given. A
  hover draws a line in under a link from its middle.
- Three website templates, one per page shape: a product tour
  (`/sites/tour`), a place such as a restaurant (`/sites/venue`), and an
  editorial site for a practice (`/sites/studio`). Each is built around a
  section only that kind of business has.

### Changed

- `SiteHeader` is solid: no see-through background and no blur, in every
  variant but `glass`. A sticky bar takes a soft shadow once the page scrolls
  under it. Nothing to change in apps.

## v0.7.1 (2026-11-15)

### Added

- `siteAction` takes every one of Button's looks (`siteAction("inverse", "lg")`
  is a light button on a dark page) and the sizes `sm` and `xl`. Before, any
  look but primary, secondary and ghost gave a link with no button at all.
- `PaletteStyle`'s `neutral` takes a colour too (`neutral: "#8b8373"`): the
  greys lean toward its hue.
- `FilterBar` works as a search box alone: `filters`, `values` and
  `onValuesChange` are optional.
- `Table` columns take `align: "right"` (and `"left"`) as well as `end`/`start`.
- `BarChart` and `LineChart` take `format` as number-format options as well as
  a function (`format={{ style: "currency", currency: "EUR" }}`), so a server
  page can format a chart; a function from a server page fails the whole page.
- Palette seeds take `oklch(…)`, `rgb(…)` and short hex colours, not only
  six-digit hex.

### Fixed

- A seed given as `oklch(…)` made a broken palette (black buttons, black
  accent); it now reads as the colour it is.
- A palette scoped to part of a page (`PaletteStyle selector=…` on an element
  with `data-theme="dark"`) now turns dark there; it stayed light.
- Words over a `Hero` photo stay readable on bright photos: a soft shadow under
  the text and a deeper shade on the photo.
- `Table` numbers (`align: "end"`) never break across two lines.
- A typeface with one weight (Instrument Serif, Bebas Neue) shows at that
  weight in headings, instead of a smeared bold the browser made up.
- `Bento` rows take their own height instead of all matching the tallest, a
  cell's table or chart follows its words with no hole between, and a lone
  photo fills the space its cell is given.

## v0.7.0 (2026-11-14)

### Added

- `Table` columns take `mobile` (`title`, `meta`, `row`, `actions`, `hide`):
  where each goes when the table stacks into cards on a phone, so a long list
  stays scannable. And `nowrap`, for ids, dates and amounts that must not
  break in two.
- `BarChart` takes `layout="rows"` (and `sorted`): bars lying one under
  another with their whole names and values, for comparing named things.
  Columns cut long names to "Con…"; rows never do.
- `MobileBar`: a bar fixed to the bottom of the screen on phones only, for
  the one action a visitor should always reach (Add to cart, Book).

### Changed

- `buttonClass`, `siteAction`, `buttonVariants` and the button types live in
  a file of their own (`button-class`) without "use client", so a server page
  can call them: `<Link className={buttonClass({ variant: "shine" })}>` used
  to crash a server page ("Attempted to call buttonClass() from the server").
  Apps import them from the same place as before. An app that copied
  components in should add `button-class` (`npx syvna-ui upgrade` does).

### Fixed

- The MCP server's `check_code` read props with a pattern that took words
  inside a prop's JSX value for props (`actions={<a>Get started</a>}` gave
  "Hero has no prop Get"), burying real faults under false ones. It now
  scans tags properly. It also reports a kit component used without being
  imported (which crashes the page), no longer flags types the kit exports
  (`TableColumn`) or a brand's hex in `PaletteStyle`'s seed, and `call` takes
  `@file.json` for code longer than a command line.

## v0.6.0 (2026-11-14)

### Added

- `AuthLayout` has twelve arrangements, picked with `variant` (the list is
  `authLayoutVariants`): `split` (as before), `split-reverse`, `inset`,
  `centered`, `card`, `card-brand`, `compact`, `topbar`, `banner`, `photo`,
  `showcase` and `frame`. Its guide says which suits staff tools, customer
  portals and sign-ups.
- The panel (`aside`) can carry `points` (short reasons), `stats` (real
  numbers), an `image` (for `photo`) and `media` (a piece of the product, for
  `showcase`), besides the headline, body and quote. Its type is `AuthAside`.
- `AuthLayout` takes `legal` (small print under the form) and `help` (a quiet
  link in the corner).

- Five `Button` looks for a shop's or landing page's main action: `raised`,
  `shine`, `fill`, `hard` and `underline`. `buttonClass({ variant, size,
  shape })` gives any button look to a link.
- `classNames`: a prop that adjusts a component's inner parts when a design
  needs it. On `Button` (label, badge, shortcut), `ProductCard`, `PriceTag`,
  `CartSummary`, `Hero`, `SiteHeader`, `PricingTable`, `Section`,
  `FeatureGrid`, `Testimonials`, `CallToAction`, the new sections, and `Card`,
  `StatCard`, `EmptyState` and `Field`.
- `ProductCard` takes `addVariant`, `addLabel`, `addShape` and
  `addPlacement="overlay"` (the add button slides up over the photo);
  `CartSummary` takes `checkoutVariant` and `checkoutShape`.
- `Reveal` and `Stagger`: containers that ease in when scrolled to, or as the
  page opens. `Section`, `FeatureGrid` and `Testimonials` take `animate`. For public pages.
- Four landing sections: `Bento` (unequal cells, each with a picture),
  `FeatureRows` (words beside a large real screen, swapping sides), `Stats`
  and `Steps`. The Landing template uses them, and the Shop template shows one
  buying look across its buttons.

### Changed

- Button hover and press classes are `hover:not-disabled:` (were
  `hover:enabled:`), so they also work on links. Nothing to change unless an
  app overrides a button's hover with `hover:enabled:`.
- `ProductCard`'s add button and `CartSummary`'s checkout button are a size
  larger, and are drawn with `buttonClass`.

### Fixed

- `AuthLayout` with a panel keeps to a height given in `className`; it was
  always as tall as the window.

## v0.5.2 (2026-11-14)

### Fixed

- Text boxes no longer show a second, inner focus outline when an app's own CSS
  outlines everything focused (`:focus-visible { outline: … }`): the box draws
  its one focus line and the text field inside it never does. Input, Select,
  Combobox, NumberInput, TagInput, FilterBar's search, the command palette,
  PromptInput, the site header's search and the quantity stepper.

## v0.5.1 (2026-11-14)

### Fixed

- `AuthLayout` has its guide, which v0.5.0 left out. It and the Sign in template
  no longer show a hard-coded "Continue with Google": apps offer only the
  sign-in options Syvna has set up, through the template's `OAuthButtons`.

## v0.5.0 (2026-11-14)

### Added

- `AuthLayout` and `AuthDivider`: the page around sign-in, sign-up and password
  forms. The brand, a short title, the form in a narrow column without a card,
  and on wide screens a panel in the sidebar's colours with a promise and a
  quote. The Sign in template uses it.

## v0.4.0 (2026-11-14)

### Fixed

- `Field` wires its label to the control inside it even when that control
  comes from a server page (it shares the id through context), so clicking a
  label focuses its field and the hydration warning on field ids is gone.
  `Input`, `Textarea` and `Select` read it.
- On touch screens, sidebar links (`NavItem`), the menu button, `FilterBar`'s
  search, chips and options are 44px tall, big enough to tap. Desktop is
  unchanged.
- `text-caption` is 12px (was 11.5px), the smallest size that reads on a phone.

- Focused fields (`Input`, its notched look, `Select` and `Textarea` looks, the
  table and site-header search) drew their focus line outside the border, a
  box inside a box. It's drawn over the border now: one clean edge.

- `PaletteStyle`'s `chrome` takes `surface`, `brand`, `dark`, `tinted` or a
  colour; anything else (`"neutral"`, a typo) used to be read as a colour and
  made the sidebar's text unreadable. It's the plain surface now.
- The `as` prop of `SiteHeader`, `SiteFooter`, `NavItem` and `Breadcrumbs` now
  says it's for client components only: Next refuses a component passed from
  a server page, which broke whole pages. Leave it out there; plain links work.

### Added

- `PageCrumbs`: a page sets its breadcrumbs with it, from anywhere in the page
  (a server page too), and the `Topbar` draws them. `Topbar` takes `crumbs` and
  `linkAs` for a trail that's the same on every screen. Screens no longer put a
  title or Breadcrumbs over their content, which repeated what the Topbar said.
- `Table` stacks each row into a card when its box is narrower than 32rem (a
  phone, a side panel): the first cell as the title, then each column's name and
  value, so status and actions no longer sit off-screen to the right.
- `Calendar` (and `DatePicker`) take `marked`: days with something on them
  (assignments due, bookings), shown with a dot.

## v0.3.0 (2026-11-14)

### Changed

- **Dark mode no longer follows the device by default.** The default (light)
  look is unchanged, and so is `data-theme="dark"`. What changed: on a device
  set to dark mode, the tokens and `PaletteStyle` used to turn dark by
  themselves, under an app's own light colours, which put light text on a light
  ground. Now they stay light unless the page says `data-theme="dark"`, and
  follow the device only where it says `data-theme="system"`. Apps need no
  change; one that wants to follow the device puts `data-theme="system"` on
  `<html>`.
- `pricing.tsx` names its plan type `PricingPlan` inside the file too, as
  `index.ts` already exported it. Apps that import from `@/components/syvna`
  see no change.

### Added

- `scripts/app-guide.mjs` writes the guide an app's agents read about the
  Syvna UI copied into it (Syvna's template keeps it at `docs/ui.md`).

## v0.2.0 (2026-11-13)

### Added

- **Palettes beyond light and dark.** `createPalette({ brand, accent, chrome, neutral })` makes every colour token, light and dark, in OKLCH, contrast-checked; 12 ready-made palettes (`palettePresets`: Neutral, Admin navy, Ocean, Forest, Plum, Midnight, Sand, Coral, Slate and lime, Rose, Emerald, Amber); `PaletteStyle` applies one; `paletteCss` and `paletteVars` for other setups.
- **Colour roles**: `accent` (what's selected or in progress), `ink-heading` (titles and big numbers), `chrome-*` (the sidebar), `bar` (the top bar) and `chart-1…6` (data). Sidebars take the chrome through the `chrome-scope` class, so all 21 SideNav variants follow a palette.
- **MCP**: `list_palettes` and `make_palette`, and a colour guide (PaletteStyle) on mixing colours well.
- **Docs**: a palette picker in the testing bar (ready-made or your own from seed colours); `?palette=…&theme=…&sidebar=…` and `?embed` in the address.
- README with screenshots.

### Changed

- Switches, checkboxes, radios, sliders, the tab underline, steps and picked dates use the `accent` (the same as the brand in the Neutral palette, so nothing changes until a palette is chosen). Card titles and stat numbers use `ink-heading`. Bar and line charts use `chart-1`.

### Fixed

- LineChart's line could show gaps on wide charts in Chrome; it now draws in with a clip instead of dashes.
- CI: the lockfile now includes the CLI and MCP packages, so `npm ci` installs.

## v0.1.0 (2026-11-13)

### Added

- **Three kits** in the docs: Dashboard, Website and Agent.
- **Agent kit**: Conversation, Message, PromptInput, Suggestions, Thinking, StreamCaret, MessageActions, Attachment, ModelSelector, ContextMeter; Trace and TraceStep, with Plan, TaskList, ToolCall, Reasoning, Subagent, Sources, InlineCitation and Checkpoint built on them; Confirmation, Questionnaire and VariantChooser (other looks for a part of the screen, previewed in the chat and compared in a dialog); CodeBlock, Terminal, StackTrace, TestResults, FileTree.
- **Business components**: TagInput, NumberInput, CurrencyInput, InlineEdit, KeyValueEditor, ApiKeyField, Slider, DateRangePicker and RangeCalendar (presets, compare to the previous period), Accordion, Stepper, Banner, Kbd, AvatarGroup, RelativeTime, BulkActionBar, ColumnSettings, SavedViews, TransferList, TreeView, NotificationCenter, AuditLog, PermissionMatrix, InviteMembers, UsageMeter, PlanSummary, SetupChecklist, SaveBar, ConfirmByTyping, ApprovalCard.
- **Website kit**: SiteHeader, Hero and PricingTable in 21 variants each; Section, FeatureGrid, LogoCloud, Testimonials, Faq, CallToAction, SiteFooter; ProductCard, PriceTag, Rating, QuantityStepper, CartSummary.
- **Button**: 13 looks (soft, outline, subtle, link, dashed, inverse, gradient, success, danger-soft added), sizes xs to xl, `shape`, `badge`, `shortcut`; ButtonGroup, SplitButton, ToggleButton, CopyButton.
- **Input**: 15 looks (soft, inset, elevated, bold, dashed, minimal, inline added); `clearable`, `counter`, `loading`, `valid`, `copyable`, `shortcut`, `addonBefore`, `addonAfter`, `action`.
- **Tabs `actions`**: a screen's buttons on the tab row.
- **Copy-in registry and CLI**: `npx github:ValeBytes/syvna_ui_sdk#v<version> init`, then `add`, `list`, `upgrade`, `version`.
- **MCP server** for agents: list, search, get a component, its variants, the tokens, the add command, and a check of code against the design.
- **Templates**: workspace screens (reports, approvals, assistant, team, billing, developers) and website templates (landing, pricing, a shop with product, cart and checkout).

### Changed

- Hero's `layout` prop is now `variant` (`center` and `split` keep their names).
- PricingTable's plan type is exported as `PricingPlan` (`Plan` is now the agent component).
- RelativeTime renders in the browser only (its text depends on the clock).
