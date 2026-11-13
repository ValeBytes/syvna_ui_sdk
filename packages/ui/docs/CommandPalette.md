# CommandPalette

Search and jump anywhere from the keyboard: screens, records, actions. Open it with ⌘K / Ctrl K (`useCommandKey(() => setOpen(true))`) and from a search button in the Topbar.

- Groups in the order people need them: "Go to", "Create", then records ("Customers", "Orders").
- Labels are what happens: "New order", "Customers". Add `keywords` for other words people use ("invoice" for bills) and `shortcut` when a key does it too.
- It runs the item and closes; long work shows a toast when it's done.
