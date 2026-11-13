# Changelog

Every release of Syvna UI: the library (`@syvna/ui`), the copy-in registry and CLI (`syvna-ui`), and the MCP server move together under one version, tagged `vX.Y.Z`.

- **patch** (0.1.1): fixes. Nothing for an app to change.
- **minor** (0.2.0): new components, props, variants or tokens. Before 1.0, a minor release may also rename or remove something; it says so under **Changed** with what to do.
- **major** (1.0.0 and on): something apps must change: a prop renamed or removed, a default changed, a token renamed.

Write what changed under **Unreleased** as you go (Added, Changed, Fixed), in words an app's author understands. `npm run release` turns it into the release's notes, and `npx syvna-ui upgrade` links to it.

## Unreleased

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
