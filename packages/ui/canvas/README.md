# Syvna UI

The components every Syvna app is built from. Agents put screens together from these instead of styling each one from scratch, so apps look finished from the first build, cost fewer credits to make, and stay consistent as they grow.

A room's **design** is a set of token values: colours, faces, radii, shadows. Change the values and every component follows. Nothing in a component names a colour or a size of its own.

## A screen, put together

Signed-in screens share one frame: an **AppShell** with a **Sidebar** (the app's sections) and a **Topbar** (Breadcrumbs or search, a few actions). The breadcrumbs say where you are, so a screen has no big title: it opens with a toolbar row of actions and filters, leads with what needs doing (**StatCard**s), then the list itself as a **Table**. A row opens in a **SidePanel** beside the list, its facts in a **DetailList**; a row's other actions sit in a **Menu**. The AppShell card shows a whole screen built this way.

## Using it in an app

The package is `@syvna/ui`, built with Tailwind CSS 4 and React. An app's `app/globals.css`:

```css
@import "tailwindcss";
@import "@syvna/ui/theme.css";   /* the tokens as Tailwind values, and the components' classes */
@import "@syvna/ui/tokens.css";  /* the values: replace with the room's design */
```

Then in any component:

```tsx
import { Button, Card, Table, Badge } from "@syvna/ui";

<Button variant="primary">Add customer</Button>
<div className="bg-surface text-ink rounded-lg shadow-1 p-5">…</div>
```

Every token is a Tailwind value: `bg-ground`, `bg-surface`, `text-ink-3`, `border-line`, `rounded-lg`, `shadow-2`, `font-display`. Use them for the app's own layout too. Never a raw hex, and never Tailwind's default palette (`bg-gray-100`): those don't change with the design.

Every component takes `className`, and a class passed in wins over the component's own of the same kind (`<Button className="px-8">`), so adjust in place rather than copying a component.

## Colour

- **ground** is the page, **surface** what sits on it (cards, tables, inputs, dialogs), **surface-2** sunken or hovered areas inside a surface.
- Text steps down from **ink** (headings, body) to **ink-2** (secondary), **ink-3** (hints, captions) and **ink-4** (placeholders and disabled only).
- **brand** is the main action and the selected state, with **brand-ink** on it. One primary button per view.
- Status colours mean the same on every screen: **success** done, paid, live; **warning** needs attention soon; **danger** failed, overdue, destructive; **info** new or neutral news. Each has a **-soft** fill for badges and alerts. Never colour alone: a badge has a word, a change has an arrow.
- **focus** is the keyboard ring, 2px, offset 2px. Every control shows it on keyboard focus only.

Light and dark come from the same tokens. An app follows the system setting, and `data-theme="light"` or `"dark"` on any element fixes it there.

## Type

Wix Madefor carries the interface: Wix Madefor Text for text, Wix Madefor Display for headings (`font-display`). A design can give either its own face. App screens are compact, like Syvna's own dashboard: 13px body, 12.5px labels and buttons, 12px hints, headings no bigger than 20px. Numbers in tables and stats are tabular so columns line up.

## Shape and depth

Radii are small and follow size: 4px for badges, 6px for controls, 8px for cards and tables, 12px for dialogs. Controls are 32px tall, table rows 40px. Surfaces have a soft shadow (`shadow-1`); hovered and floating things rise (`shadow-2`), dialogs most (`shadow-3`).

## Words

The components are written for anyone, anywhere: plain words, sentence case, verbs on buttons ("Save changes", not "Submit"). Dates, numbers and money are formatted for the reader's locale with `Intl`; prices default to USD. Errors say what happened and how to fix it.

## What's here

App shell: AppShell, Sidebar, NavSection, NavItem, Topbar, Breadcrumbs, Menu, SidePanel, DetailList. Actions: Button, Spinner. Forms: Field, Input, Textarea, Select, Checkbox, Switch. Data: Table, StatCard, Badge, Avatar, Progress. Layout: Card, Tabs, EmptyState, Skeleton. Feedback: Alert, Dialog.
