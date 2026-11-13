# Button

A button does one thing, named by a verb in sentence case: "Save changes", "Add customer", "Send invoice".

- **primary**: the one main action of a view. Never two side by side.
- **secondary** (the default): every other action.
- **ghost**: actions inside toolbars, table rows and cards, where a border would be noise.
- **danger**: deletes and other actions that can't be undone; ask in a Dialog first.

Sizes `sm`, `md`, `lg`. `loading` shows a spinner and blocks clicks until the work is done: set it for every action that waits on the server. An icon-only button needs an `aria-label`. Icons come from `lucide-react` at 16px.
