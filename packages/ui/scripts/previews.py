"""Writes canvas/components/<Comp>/{README.md,preview.html}: each component's
guidelines and live preview on the design-system canvas. The previews run
the real bundle (window.Syvna) with React from the page.

python scripts/previews.py
"""

import os
import textwrap

ROOT = os.path.join(os.path.dirname(__file__), "..", "canvas", "components")

PAGE = """<!-- @dsCard group="{group}" height={height}{width} -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>{name}</title></head>
<body>
<div id="root" class="{wrap}"></div>
<script>
var S = window.Syvna, h = React.createElement, F = React.Fragment, useState = React.useState;
{code}
ReactDOM.createRoot(document.getElementById("root")).render(h(Preview));
</script>
</body>
</html>
"""

C = {}


def comp(name, group, height, readme, code, wrap="p-6", width=None):
    C[name] = dict(group=group, height=height, readme=readme, code=code, wrap=wrap, width=f" width={width}" if width else "")


comp(
    "Button", "Actions", 150,
    """# Button

A button does one thing, named by a verb in sentence case: "Save changes", "Add customer", "Send invoice".

- **primary**: the one main action of a view. Never two side by side.
- **secondary** (the default): every other action.
- **ghost**: actions inside toolbars, table rows and cards, where a border would be noise.
- **danger**: deletes and other actions that can't be undone; ask in a Dialog first.

Sizes `sm`, `md`, `lg`. `loading` shows a spinner and blocks clicks until the work is done: set it for every action that waits on the server. An icon-only button needs an `aria-label`. Icons come from `lucide-react` at 16px.
""",
    """
function Preview() {
  var [busy, setBusy] = useState(false);
  var plus = h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" }, h("path", { d: "M12 5v14M5 12h14" }));
  return h("div", { className: "flex flex-col gap-4" },
    h("div", { className: "flex flex-wrap items-center gap-3" },
      h(S.Button, { variant: "primary", icon: plus }, "Add customer"),
      h(S.Button, null, "Export"),
      h(S.Button, { variant: "ghost" }, "Cancel"),
      h(S.Button, { variant: "danger" }, "Delete order"),
      h(S.Button, { "aria-label": "Add", icon: plus })),
    h("div", { className: "flex flex-wrap items-center gap-3" },
      h(S.Button, { variant: "primary", size: "sm" }, "Small"),
      h(S.Button, { variant: "primary" }, "Medium"),
      h(S.Button, { variant: "primary", size: "lg" }, "Large"),
      h(S.Button, { variant: "primary", loading: busy, onClick: function () { setBusy(true); setTimeout(function () { setBusy(false); }, 1600); } }, busy ? "Saving" : "Save changes"),
      h(S.Button, { disabled: true }, "Disabled")));
}
""",
)

comp(
    "Spinner", "Actions", 80,
    """# Spinner

Something is loading where the person is looking. It takes the text colour, so it works on any surface. Inside a button, use the button's `loading` instead; for a whole region that's loading, use Skeletons in the shape of what's coming.
""",
    """
function Preview() {
  return h("div", { className: "flex items-center gap-6 text-ink-2" },
    h(S.Spinner, { size: 16 }), h(S.Spinner, { size: 20 }), h(S.Spinner, { size: 28 }),
    h("span", { className: "inline-flex items-center gap-2 text-sm text-ink-3" }, h(S.Spinner, { size: 14 }), "Checking availability"));
}
""",
)

comp(
    "Field", "Forms", 250,
    """# Field

Wraps one control with its label, and a hint or an error under it. It gives the control its id, ties the hint to it for screen readers, and draws it invalid when there's an error.

- Labels are nouns, short: "Email address", not "Please enter your email address".
- A hint says what goes in or what happens: "We'll send the receipt here."
- An error says what's wrong and how to fix it: "Enter a date after today." Show it after the person leaves the field or submits, not while they type.
- `required` marks the label; `aside` holds "Optional" or a link on the right.
""",
    """
function Preview() {
  return h("div", { className: "grid max-w-[640px] grid-cols-2 gap-5" },
    h(S.Field, { label: "Email address", hint: "We'll send the receipt here.", required: true }, h(S.Input, { type: "email", placeholder: "amara@example.com" })),
    h(S.Field, { label: "Company", aside: "Optional" }, h(S.Input, { placeholder: "Lumen Studio" })),
    h(S.Field, { label: "Delivery date", error: "Choose a date after today." }, h(S.Input, { type: "text", defaultValue: "2 March 2025" })),
    h(S.Field, { label: "Country" }, h(S.Select, { placeholder: "Choose a country", options: [{ value: "br", label: "Brazil" }, { value: "de", label: "Germany" }, { value: "in", label: "India" }, { value: "ke", label: "Kenya" }, { value: "us", label: "United States" }] })));
}
""",
)

comp(
    "Input", "Forms", 140,
    """# Input

One line of text: names, emails, amounts, search. Always inside a Field, except a search box in a toolbar (give that an `aria-label`).

`leading` and `trailing` put a unit or an icon inside the box: "$" before a price, "kg" after a weight, a search icon. Use the right `type` and `inputMode` so phones show the right keyboard.
""",
    """
function Preview() {
  var search = h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" }, h("circle", { cx: 11, cy: 11, r: 7 }), h("path", { d: "M20 20l-3.5-3.5" }));
  return h("div", { className: "grid max-w-[640px] grid-cols-2 gap-4" },
    h(S.Input, { "aria-label": "Search orders", placeholder: "Search orders", leading: search }),
    h(S.Input, { "aria-label": "Price", leading: "$", defaultValue: "48.00", inputMode: "decimal" }),
    h(S.Input, { "aria-label": "Weight", trailing: "kg", defaultValue: "2.5" }),
    h(S.Input, { "aria-label": "Disabled", defaultValue: "Can't be changed", disabled: true }));
}
""",
)

comp(
    "Textarea", "Forms", 170,
    """# Textarea

Text over several lines: notes, descriptions, messages. It grows by dragging; start it at the size of a typical answer (`rows`). Put it in a Field, with a hint if there's a limit.
""",
    """
function Preview() {
  return h("div", { className: "max-w-[520px]" },
    h(S.Field, { label: "Note for the kitchen", hint: "Allergies and timing. Up to 300 characters." },
      h(S.Textarea, { rows: 3, placeholder: "No nuts, please. We'll arrive around 7:30." })));
}
""",
)

comp(
    "Select", "Forms", 120,
    """# Select

Pick one from a short list, about 12 or fewer. It opens the browser's own list, so it works on phones and with a keyboard. Give it a `placeholder` when there's no sensible default; otherwise preselect the common choice. For longer lists, a searchable picker; for two or three options always on show, Tabs (pills) or checkboxes.
""",
    """
function Preview() {
  return h("div", { className: "grid max-w-[640px] grid-cols-2 gap-4" },
    h(S.Select, { "aria-label": "Status", placeholder: "Any status", options: [{ value: "paid", label: "Paid" }, { value: "due", label: "Due" }, { value: "overdue", label: "Overdue" }] }),
    h(S.Select, { "aria-label": "Currency", defaultValue: "usd", options: [{ value: "usd", label: "US dollar (USD)" }, { value: "eur", label: "Euro (EUR)" }, { value: "jpy", label: "Japanese yen (JPY)" }, { value: "brl", label: "Brazilian real (BRL)" }] }));
}
""",
)

comp(
    "Checkbox", "Forms", 150,
    """# Checkbox

Yes or no for one thing, or several picks from a list, saved with the form. A label says what checking it means; a `description` adds what follows from it. For a setting that applies at once, use Switch.
""",
    """
function Preview() {
  return h("div", { className: "flex flex-col gap-4" },
    h(S.Checkbox, { label: "Email me when an order is placed", defaultChecked: true }),
    h(S.Checkbox, { label: "Share stock with the online shop", description: "Items sold in store come off the website's count too." }),
    h(S.Checkbox, { label: "Archived products", disabled: true }));
}
""",
)

comp(
    "Switch", "Forms", 130,
    """# Switch

A setting that takes effect as soon as it's flipped: notifications on, a product visible in the shop. If the change waits for a Save button, use a Checkbox. The label names the setting, not the action ("Online bookings", not "Turn on bookings").
""",
    """
function Preview() {
  return h("div", { className: "flex flex-col gap-4" },
    h(S.Switch, { label: "Online bookings", description: "Customers can book from your website.", defaultChecked: true }),
    h(S.Switch, { label: "Show prices with tax" }),
    h(S.Switch, { label: "Two-factor sign-in", disabled: true, defaultChecked: true }));
}
""",
)

comp(
    "Table", "Data", 400,
    """# Table

Rows of the same kind of thing: orders, customers, bookings. Most app screens are a table with a header above it.

- The first column names the row and is drawn strongest. Numbers and money are right-aligned (`align: "end"`) and tabular.
- Status is a Badge; dates are relative when recent ("2 hours ago") and full when older, in the reader's locale.
- `sort` on a column makes its header sortable. `onRowClick` opens the row, ideally in a side panel so people keep their place.
- `empty` takes an EmptyState for when there's nothing yet; `dense` for long lists; `flush` inside a Card with `padded={false}`.
""",
    """
var money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
var rows = [
  { id: "INV-2041", customer: "Amara Okafor", country: "Nigeria", total: 1240, status: "paid" },
  { id: "INV-2040", customer: "Lumen Studio", country: "Germany", total: 860.5, status: "due" },
  { id: "INV-2039", customer: "Kenji Watanabe", country: "Japan", total: 3200, status: "overdue" },
  { id: "INV-2038", customer: "Casa Verde", country: "Brazil", total: 415, status: "paid" },
  { id: "INV-2037", customer: "Priya Raman", country: "India", total: 98.2, status: "draft" }
];
var tones = { paid: "success", due: "warning", overdue: "danger", draft: "neutral" };
var labels = { paid: "Paid", due: "Due", overdue: "Overdue", draft: "Draft" };
function Preview() {
  var [open, setOpen] = useState("INV-2039");
  return h(S.Table, {
    caption: "Invoices", rowKey: function (r) { return r.id; }, rows: rows, selected: [open],
    onRowClick: function (r) { setOpen(r.id); },
    columns: [
      { key: "customer", header: "Customer", sort: function (a, b) { return a.customer.localeCompare(b.customer); } },
      { key: "id", header: "Invoice", render: function (r) { return h("span", { className: "font-mono text-[13px]" }, r.id); } },
      { key: "country", header: "Country" },
      { key: "status", header: "Status", render: function (r) { return h(S.Badge, { tone: tones[r.status], dot: true }, labels[r.status]); } },
      { key: "total", header: "Total", align: "end", sort: function (a, b) { return a.total - b.total; }, render: function (r) { return money.format(r.total); } }
    ]
  });
}
""",
)

comp(
    "StatCard", "Data", 170,
    """# StatCard

One number that matters today, with what it's compared against. A number alone means little: give it a `change` ("+12%", up or down) and a `hint` ("vs last week"). When down is good (refunds, costs, wait times) set `upIsGood: false` so the colour reads right.

Three or four in a row at the top of a dashboard, the most important first. Lead with what needs doing, not vanity totals.
""",
    """
function Preview() {
  return h("div", { className: "grid grid-cols-3 gap-4" },
    h(S.StatCard, { label: "Revenue this week", value: "$18,240", change: { value: "12.4%", trend: "up" }, hint: "vs last week" }),
    h(S.StatCard, { label: "Bookings today", value: "37", change: { value: "4", trend: "down" }, hint: "vs last Tuesday" }),
    h(S.StatCard, { label: "Refunds", value: "$320", change: { value: "18%", trend: "down", upIsGood: false }, hint: "vs last week" }));
}
""",
)

comp(
    "Badge", "Data", 110,
    """# Badge

One or two words of status: Paid, Due, Overdue, Live, New. The tone carries the meaning and must match everywhere: `success` done, paid, live; `warning` needs attention soon; `danger` failed or overdue; `info` new or scheduled; `neutral` draft or archived; `brand` featured. `dot` suits tables. Never a badge just for decoration.
""",
    """
function Preview() {
  return h("div", { className: "flex flex-col gap-3" },
    h("div", { className: "flex flex-wrap gap-2" },
      h(S.Badge, { tone: "success" }, "Paid"), h(S.Badge, { tone: "warning" }, "Due"), h(S.Badge, { tone: "danger" }, "Overdue"),
      h(S.Badge, { tone: "info" }, "Scheduled"), h(S.Badge, null, "Draft"), h(S.Badge, { tone: "brand" }, "Featured")),
    h("div", { className: "flex flex-wrap gap-2" },
      h(S.Badge, { tone: "success", dot: true }, "Live"), h(S.Badge, { tone: "warning", dot: true }, "Low stock"), h(S.Badge, { tone: "danger", dot: true }, "Failed")));
}
""",
)

comp(
    "Avatar", "Data", 100,
    """# Avatar

A person or a business: their photo, or their initials when there isn't one. The name is required: it's the initials, the tooltip and the alt text. Sizes `sm` (in dense rows), `md`, `lg`, `xl` (profile headers).
""",
    """
function Preview() {
  return h("div", { className: "flex items-center gap-4" },
    h(S.Avatar, { name: "Amara Okafor", size: "sm" }), h(S.Avatar, { name: "Kenji Watanabe" }),
    h(S.Avatar, { name: "Lucía Fernández", size: "lg" }), h(S.Avatar, { name: "Casa Verde", size: "xl" }),
    h("span", { className: "inline-flex items-center gap-2.5" }, h(S.Avatar, { name: "Priya Raman" }),
      h("span", { className: "flex flex-col" }, h("span", { className: "text-sm font-medium text-ink" }, "Priya Raman"), h("span", { className: "text-[13px] text-ink-3" }, "Bengaluru"))));
}
""",
)

comp(
    "Progress", "Data", 130,
    """# Progress

How far along something is: an upload, a goal, a plan's usage. Give it a `label` for screen readers and usually `showValue`. Tone follows meaning: brand for progress, warning or danger as a quota runs out.
""",
    """
function Preview() {
  return h("div", { className: "flex max-w-[480px] flex-col gap-4" },
    h(S.Progress, { label: "Monthly sales goal", value: 62, showValue: true }),
    h(S.Progress, { label: "Storage used", value: 88, tone: "warning", showValue: true }),
    h(S.Progress, { label: "Upload", value: 100, tone: "success", showValue: true }));
}
""",
)

comp(
    "Card", "Layout", 300,
    """# Card

A surface for one group of things on a screen: a chart, a short list, a form section. Give it a `title`, a `description` if the title isn't enough, `actions` on the right, and a `footer` for totals or a "View all" link.

Cards hold groups, not items: a list of orders is a Table, not a card per order. For a table that runs to the card's edges, `padded={false}` and `<Table flush />`.
""",
    """
var money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
function Preview() {
  return h("div", { className: "grid grid-cols-2 gap-4" },
    h(S.Card, { title: "Payout", description: "Sent to your bank every Friday.", actions: h(S.Button, { size: "sm", variant: "ghost" }, "Details"), footer: h(F, null, h("span", null, "Next payout"), h("span", { className: "font-medium text-ink" }, "Friday")) },
      h("p", { className: "m-0 font-display text-[30px]/9 font-semibold tracking-tight text-ink tabular-nums" }, money.format(4380.25)),
      h("p", { className: "m-0 mt-1 text-sm text-ink-3" }, "From 46 orders")),
    h(S.Card, { title: "Top products", padded: false },
      h(S.Table, { flush: true, dense: true, rowKey: function (r) { return r.n; }, rows: [{ n: "Ceramic mug", s: 128 }, { n: "Linen apron", s: 74 }, { n: "Olive wood board", s: 51 }],
        columns: [{ key: "n", header: "Product" }, { key: "s", header: "Sold", align: "end" }] })));
}
""",
)

comp(
    "Tabs", "Layout", 190,
    """# Tabs

Switches between views of the same thing. `line` for the sections of one screen (Overview, Orders, Notes); `pills` for filters over one list (All, Open, Closed). `count` shows how many are in each. Arrow keys move between tabs.

Pass the content as a function of the open tab, or keep the value yourself (`value`, `onValueChange`) to put it in the URL.
""",
    """
function Preview() {
  return h("div", { className: "flex flex-col gap-6" },
    h(S.Tabs, { label: "Customer", items: [{ value: "overview", label: "Overview" }, { value: "orders", label: "Orders", count: 12 }, { value: "notes", label: "Notes" }] },
      function (v) { return h("p", { className: "m-0 text-sm text-ink-3" }, v === "orders" ? "12 orders since March." : v === "notes" ? "No notes yet." : "Last order 3 days ago."); }),
    h(S.Tabs, { variant: "pills", label: "Filter orders", items: [{ value: "all", label: "All" }, { value: "open", label: "Open", count: 4 }, { value: "done", label: "Completed" }] }));
}
""",
)

comp(
    "EmptyState", "Layout", 280,
    """# EmptyState

What a list shows before it has anything: what goes here, why it's empty, and the one button that adds the first. Write it for someone on their first day: "No customers yet. They appear here after their first order, or add one yourself." Inside a Table, pass it as `empty`.
""",
    """
function Preview() {
  var people = h("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" }, h("circle", { cx: 9, cy: 8, r: 3.5 }), h("path", { d: "M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.7 3 2.5 3.5 5.2" }));
  return h(S.Card, { padded: false },
    h(S.EmptyState, { icon: people, title: "No customers yet", description: "Customers appear here after their first order. You can also add one yourself.", action: h(S.Button, { variant: "primary" }, "Add customer") }));
}
""",
)

comp(
    "Skeleton", "Layout", 160,
    """# Skeleton

Stands in for content that's loading, in its shape, so the page doesn't jump when it arrives. Match the real layout: a circle for an avatar, lines for text, a block for a card or image. For a short wait on one control, a Spinner; for nothing to show at all, an EmptyState.
""",
    """
function Preview() {
  function row() { return h("div", { className: "flex items-center gap-3" }, h(S.Skeleton, { shape: "circle" }), h("div", { className: "flex flex-1 flex-col gap-2" }, h(S.Skeleton, { width: "40%" }), h(S.Skeleton, { width: "65%", height: 12 }))); }
  return h("div", { className: "grid max-w-[640px] grid-cols-[1fr_200px] gap-6" },
    h("div", { className: "flex flex-col gap-5" }, row(), row()),
    h(S.Skeleton, { shape: "block" }));
}
""",
)

comp(
    "Alert", "Feedback", 300,
    """# Alert

A message about the whole screen or form: a save that failed, a trial ending, a card about to expire. Title says what happened; the text what to do; `action` holds the button that does it. `danger` is announced at once to screen readers.

Not for small successes ("Saved"): show those on the control that did it. Not for errors on one field: that's the Field's `error`.
""",
    """
function Preview() {
  var [shown, setShown] = useState(true);
  return h("div", { className: "flex max-w-[640px] flex-col gap-3" },
    h(S.Alert, { tone: "danger", title: "Payment failed", action: h(S.Button, { size: "sm" }, "Update card") }, "Your card was declined. Update it to keep your shop online."),
    h(S.Alert, { tone: "warning", title: "Your trial ends in 3 days" }, "Choose a plan to keep your bookings and customers."),
    shown ? h(S.Alert, { tone: "success", onDismiss: function () { setShown(false); } }, "Your website is live at casaverde.shop.") : null,
    h(S.Alert, { tone: "info" }, "Prices now show tax for customers in the EU."));
}
""",
)

comp(
    "Dialog", "Feedback", 380,
    """# Dialog

A task that needs someone's whole attention: a short form, or a confirmation before something that can't be undone. Focus moves in and stays until it closes; Escape and the backdrop close it, except while `busy` (a save in flight).

The title asks or names the task ("Delete this order?", "New customer"); the footer has Cancel, then the action, named by what it does ("Delete order", not "OK"). Keep forms in a dialog short; anything longer is its own screen.
""",
    """
function Preview() {
  var [open, setOpen] = useState(true);
  var [busy, setBusy] = useState(false);
  function remove() { setBusy(true); setTimeout(function () { setBusy(false); setOpen(false); }, 1400); }
  return h(F, null,
    h(S.Button, { variant: "danger", onClick: function () { setOpen(true); } }, "Delete order"),
    h(S.Dialog, {
      open: open, onClose: function () { setOpen(false); }, busy: busy, size: "sm",
      title: "Delete order INV-2039?", description: "Kenji Watanabe's order for $3,200.00 goes for good. This can't be undone.",
      footer: h(F, null, h(S.Button, { onClick: function () { setOpen(false); }, disabled: busy }, "Cancel"), h(S.Button, { variant: "danger", loading: busy, onClick: remove }, busy ? "Deleting" : "Delete order"))
    }));
}
""",
)

SHELL = r'''
function ic(d) { return h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", dangerouslySetInnerHTML: { __html: d } }); }
var I = {
  home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  orders: '<path d="M6 2h12l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/><path d="M4 6h16M9 10a3 3 0 0 0 6 0"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.7 3 2.5 3.5 5.2"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9L7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'
};
var mark = h("span", { className: "grid size-7 place-items-center rounded-md bg-brand font-display text-[12px] font-bold text-brand-ink" }, "CV");
function nav(active) {
  return h(F, null,
    h(S.NavSection, null,
      h(S.NavItem, { href: "#", icon: ic(I.home), label: "Home", active: active === "home" }),
      h(S.NavItem, { href: "#", icon: ic(I.orders), label: "Orders", count: 4, active: active === "orders" }),
      h(S.NavItem, { href: "#", icon: ic(I.people), label: "Customers", active: active === "customers" }),
      h(S.NavItem, { href: "#", icon: ic(I.box), label: "Products" })),
    h(S.NavSection, { label: "Shop" },
      h(S.NavItem, { href: "#", icon: ic(I.calendar), label: "Bookings" }),
      h(S.NavItem, { href: "#", icon: ic(I.chart), label: "Reports" }),
      h(S.NavItem, { href: "#", icon: ic(I.settings), label: "Settings" })));
}
function account() {
  return h(S.Menu, { side: "above", align: "start", label: "Account", className: "w-full",
    trigger: h("button", { type: "button", className: "flex w-full cursor-pointer items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-surface-2" },
      h(S.Avatar, { name: "Lucía Fernández", size: "sm" }),
      h("span", { className: "flex min-w-0 flex-col" }, h("span", { className: "truncate text-sm font-medium text-ink" }, "Lucía Fernández"), h("span", { className: "truncate text-xs text-ink-3" }, "Owner"))),
    items: [{ label: "Your profile", icon: ic(I.user) }, { label: "Settings", icon: ic(I.settings) }, { label: "Sign out", icon: ic(I.out), separated: true }] });
}
'''

comp(
    "AppShell", "App shell", 640,
    """# AppShell

The frame of an app's signed-in screens: Sidebar on the left, Topbar over the screen, the screen in the middle. From 768px wide the sidebar stays on show; on phones it's behind the Topbar's menu button and slides in, closing when a link is picked or Escape is pressed.

Put it in the app's signed-in layout (`app/(app)/layout.tsx`) so every screen shares it. The Topbar says where you are, so a screen starts with its content, not a big title. `width="full"` lets wide tables use the whole screen; the default caps content at 1200px.

This preview is a whole screen: click a row to open it in a SidePanel, the dots for a row's Menu, and the account at the bottom for its Menu.
""",
    SHELL + r'''
var money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
var orders = [
  { id: "1042", who: "Amara Okafor", where: "Lagos", items: 3, total: 128, status: "new" },
  { id: "1041", who: "Kenji Watanabe", where: "Osaka", items: 1, total: 46, status: "packing" },
  { id: "1040", who: "Priya Raman", where: "Bengaluru", items: 5, total: 212.5, status: "shipped" },
  { id: "1039", who: "Jonas Becker", where: "Hamburg", items: 2, total: 74, status: "shipped" },
  { id: "1038", who: "Ana Souza", where: "São Paulo", items: 4, total: 159, status: "delivered" }
];
var tone = { new: "info", packing: "warning", shipped: "brand", delivered: "success" };
var word = { new: "New", packing: "Packing", shipped: "Shipped", delivered: "Delivered" };
function Preview() {
  var [open, setOpen] = useState(null);
  return h(S.AppShell, {
    className: "min-h-[640px]",
    sidebar: h(S.Sidebar, { brand: h(F, null, mark, "Casa Verde"), footer: account() }, nav("orders")),
    topbar: h(S.Topbar, { actions: h(F, null, h(S.Button, { variant: "ghost", "aria-label": "Notifications", icon: ic(I.bell) }), h(S.Button, { variant: "primary", size: "sm" }, "New order")) },
      h(S.Breadcrumbs, { items: [{ label: "Shop", href: "#" }, { label: "Orders" }] }))
  },
    h("div", { className: "flex flex-col gap-6" },
      h("div", { className: "grid gap-4 sm:grid-cols-3" },
        h(S.StatCard, { label: "To pack today", value: "6", hint: "2 due by noon" }),
        h(S.StatCard, { label: "Sales this week", value: "$4,380", change: { value: "9%", trend: "up" }, hint: "vs last week" }),
        h(S.StatCard, { label: "Returns", value: "1", change: { value: "2", trend: "down", upIsGood: false }, hint: "vs last week" })),
      h(S.Table, { caption: "Orders", rows: orders, rowKey: function (r) { return r.id; }, selected: open ? [open.id] : [], onRowClick: setOpen,
        columns: [
          { key: "who", header: "Customer", render: function (r) { return h("span", { className: "inline-flex items-center gap-2.5" }, h(S.Avatar, { name: r.who, size: "sm" }), r.who); } },
          { key: "id", header: "Order", render: function (r) { return h("span", { className: "font-mono text-[13px]" }, "#" + r.id); } },
          { key: "where", header: "City" },
          { key: "status", header: "Status", render: function (r) { return h(S.Badge, { tone: tone[r.status], dot: true }, word[r.status]); } },
          { key: "total", header: "Total", align: "end", render: function (r) { return money.format(r.total); } },
          { key: "more", header: h("span", { className: "sr-only" }, "Actions"), width: "56px", render: function (r) { return h("span", { onClick: function (e) { e.stopPropagation(); }, onKeyDown: function (e) { e.stopPropagation(); } }, h(S.Menu, { label: "Order actions", trigger: h(S.Button, { variant: "ghost", size: "sm", "aria-label": "Order actions", icon: ic(I.dots) }), items: [{ label: "Edit", icon: ic(I.edit) }, { label: "Duplicate", icon: ic(I.copy) }, { label: "Cancel order", icon: ic(I.trash), danger: true, separated: true }] })); } }
        ] })),
    h(S.SidePanel, { open: !!open, onClose: function () { setOpen(null); }, title: open ? "Order #" + open.id : "",
      description: open ? h(F, null, h(S.Badge, { tone: tone[open.status] }, word[open.status]), "Placed today at 09:24") : null,
      footer: h(F, null, h(S.Button, { onClick: function () { setOpen(null); } }, "Close"), h(S.Button, { variant: "primary" }, "Mark as packed")) },
      open ? h("div", { className: "flex flex-col gap-6" },
        h(S.DetailList, { items: [{ label: "Customer", value: open.who }, { label: "City", value: open.where }, { label: "Items", value: open.items }, { label: "Total", value: money.format(open.total) }, { label: "Payment", value: "Card ending 4242" }] }),
        h(S.Alert, { tone: "info" }, "Gift wrap requested.")) : null));
}
''',
    wrap="", width=1200,
)

comp(
    "Sidebar", "App shell", 520,
    """# Sidebar

The app's navigation, inside an AppShell: the brand at the top, groups of links, the signed-in person at the bottom. Seven or so links at most; a screen that's rarely visited goes under Settings. Group them with NavSections, the everyday ones first with no heading.
""",
    SHELL + r'''
function Preview() {
  return h("div", { className: "h-[520px] w-[248px]" }, h(S.Sidebar, { brand: h(F, null, mark, "Casa Verde"), footer: account() }, nav("home")));
}
''',
    wrap="",
)

comp(
    "NavSection", "App shell", 200,
    """# NavSection

A group of NavItems in the Sidebar, with a short heading ("Shop", "Team"). The first group usually has none.
""",
    SHELL + r'''
function Preview() {
  return h("div", { className: "w-[232px]" }, h(S.NavSection, { label: "Shop" },
    h(S.NavItem, { href: "#", icon: ic(I.calendar), label: "Bookings" }), h(S.NavItem, { href: "#", icon: ic(I.chart), label: "Reports" }), h(S.NavItem, { href: "#", icon: ic(I.settings), label: "Settings" })));
}
''',
)

comp(
    "NavItem", "App shell", 180,
    """# NavItem

One screen in the Sidebar: an icon, a name, and a count of what's waiting there. Mark the screen on show `active`. In Next.js pass `as={Link}` so it navigates without reloading; on a phone the drawer closes when it's picked.
""",
    SHELL + r'''
function Preview() {
  return h("div", { className: "flex w-[232px] flex-col gap-0.5" },
    h(S.NavItem, { href: "#", icon: ic(I.home), label: "Home" }),
    h(S.NavItem, { href: "#", icon: ic(I.orders), label: "Orders", count: 4, active: true }),
    h(S.NavItem, { href: "#", icon: ic(I.people), label: "Customers" }));
}
''',
)

comp(
    "Topbar", "App shell", 120,
    """# Topbar

The bar over each screen, inside an AppShell: Breadcrumbs or a search on the left, a few actions on the right. It stays at the top while the screen scrolls, and on phones holds the button that opens the Sidebar.
""",
    SHELL + r'''
function Preview() {
  var search = h("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" }, h("circle", { cx: 11, cy: 11, r: 7 }), h("path", { d: "M20 20l-3.5-3.5" }));
  return h("div", { className: "overflow-hidden rounded-lg border border-line" }, h(S.Topbar, { actions: h(F, null, h(S.Button, { variant: "ghost", "aria-label": "Notifications", icon: ic(I.bell) }), h(S.Avatar, { name: "Lucía Fernández", size: "sm" })) },
    h(S.Input, { "aria-label": "Search", placeholder: "Search orders, customers", leading: search, className: "max-w-[360px]" })));
}
''',
)

comp(
    "Breadcrumbs", "App shell", 90,
    """# Breadcrumbs

Where this screen sits, for screens two or more levels deep: Customers › Amara Okafor › Orders. Every crumb but the last is a link; the last is the screen on show. On phones only the last shows. Pass `as={Link}` in Next.js.
""",
    r'''
function Preview() {
  return h(S.Breadcrumbs, { items: [{ label: "Customers", href: "#" }, { label: "Amara Okafor", href: "#" }, { label: "Orders" }] });
}
''',
)

comp(
    "Menu", "App shell", 260,
    """# Menu

A short list of actions on one thing: a row's Edit, Duplicate, Delete; the account's Profile, Settings, Sign out. The trigger is usually a ghost icon Button (with an `aria-label`) or the account row. Arrow keys move through it, Escape closes it.

Destructive items go last, `danger`, after a `separated` line; they should still ask in a Dialog before acting. More than seven items is a screen, not a menu.
""",
    SHELL + r'''
function Preview() {
  return h("div", { className: "h-[200px]" },
    h(S.Menu, { defaultOpen: true, align: "start", label: "Order actions", trigger: h(S.Button, { iconRight: ic(I.dots) }, "Order #1042"),
      items: [{ label: "Edit", icon: ic(I.edit) }, { label: "Duplicate", icon: ic(I.copy) }, { label: "Print packing slip", disabled: true }, { label: "Cancel order", icon: ic(I.trash), danger: true, separated: true }] }));
}
''',
)

comp(
    "SidePanel", "App shell", 460,
    """# SidePanel

One row's details, opened beside its list so people keep their place: an order from Orders, a customer from Customers. The title names the thing, the description holds its status, the footer its actions. Use DetailList for its facts.

For a task that needs full attention (a confirmation, a short form), a Dialog. For anything long, its own screen.
""",
    r'''
function Preview() {
  var [open, setOpen] = useState(true);
  return h(F, null,
    h(S.Button, { onClick: function () { setOpen(true); } }, "Open customer"),
    h(S.SidePanel, { open: open, onClose: function () { setOpen(false); }, title: "Kenji Watanabe", width: 400,
      description: h(F, null, h(S.Badge, { tone: "success" }, "Active"), "Customer since 2022"),
      footer: h(F, null, h(S.Button, { onClick: function () { setOpen(false); } }, "Close"), h(S.Button, { variant: "primary" }, "New order")) },
      h(S.DetailList, { items: [{ label: "Email", value: "kenji@example.com" }, { label: "City", value: "Osaka, Japan" }, { label: "Orders", value: "14" }, { label: "Spent", value: "$1,912.40" }] })));
}
''',
)

comp(
    "DetailList", "App shell", 190,
    """# DetailList

Facts about one thing, label beside value: an order's customer, total and payment; a booking's time and place. Inside a SidePanel or a Card. Labels are short nouns; values are formatted for the reader (dates, money).
""",
    r'''
function Preview() {
  return h("div", { className: "max-w-[420px]" }, h(S.DetailList, { items: [
    { label: "Guest", value: "Ana Souza" }, { label: "Date", value: new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(2026, 11, 4)) },
    { label: "Party", value: "4 people" }, { label: "Table", value: "Terrace, by the window" }, { label: "Deposit", value: h(S.Badge, { tone: "success" }, "Paid") }] }));
}
''',
)


def main():
    for name, c in C.items():
        d = os.path.join(ROOT, name)
        os.makedirs(d, exist_ok=True)
        # The guide is docs/<Name>.md, which the docs site reads too; the
        # readme here is only the first draft, written there if missing.
        guide = os.path.join(ROOT, "..", "..", "docs", name + ".md")
        if not os.path.exists(guide):
            with open(guide, "w", encoding="utf-8", newline="\n") as f:
                f.write(textwrap.dedent(c["readme"]).strip() + "\n")
        with open(guide, encoding="utf-8") as src, open(os.path.join(d, "README.md"), "w", encoding="utf-8", newline="\n") as f:
            f.write(src.read())
        with open(os.path.join(d, "preview.html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(PAGE.format(group=c["group"], height=c["height"], width=c["width"], name=name, wrap=c["wrap"], code=c["code"].strip()))
    print(len(C), "components")


main()
