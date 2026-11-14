# Changelog

Every release of Syvna UI: the library (`@syvna/ui`), the copy-in registry and CLI (`syvna-ui`), and the MCP server move together under one version, tagged `vX.Y.Z`.

- **patch** (0.1.1): fixes. Nothing for an app to change.
- **minor** (0.2.0): new components, props, variants or tokens. Before 1.0, a minor release may also rename or remove something; it says so under **Changed** with what to do.
- **major** (1.0.0 and on): something apps must change: a prop renamed or removed, a default changed, a token renamed.

Write what changed under **Unreleased** as you go (Added, Changed, Fixed), in words an app's author understands. `npm run release` turns it into the release's notes, and `npx syvna-ui upgrade` links to it.

## Unreleased

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
