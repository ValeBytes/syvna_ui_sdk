# Tabs

Switches between views of the same thing. `line` for the sections of one screen (Overview, Orders, Notes); `pills` for filters over one list (All, Open, Closed). `count` shows how many are in each. Arrow keys move between tabs.

Pass the content as a function of the open tab, or keep the value yourself (`value`, `onValueChange`) to put it in the URL.

Seven looks, one app sticking to one or two:

- **line**: the sections of a screen (Overview, Orders, Notes). The default.
- **pills** or **cupertino**: filters over one list; cupertino is iOS's segmented look, equal widths with hairline dividers.
- **soft** or **solid**: tabs that should feel like buttons, on a busy screen; solid is the strongest.
- **enclosed**: folder tabs joined to their content, for content that needs its own frame (a code sample, a settings group).
- **vertical**: many sections (Settings with eight parts): a list down the side, the content beside it; it stacks when narrow.

## Where a screen's actions go

A screen's buttons (Add product, Export) go on the tab row, through `actions`, not on a row of their own above the tabs. A row with only buttons in it wastes the screen's most valuable space and pushes the content down.
