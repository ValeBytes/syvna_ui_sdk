# Button

A button. Verb first, sentence case: "Save changes", "Add customer". 13 looks, five sizes, three shapes.

- **primary**: the one main action in a view. Never two side by side.
- **secondary**: everything else (the default). **ghost**: toolbars, table rows, icon buttons.
- **soft**: a tinted second action next to a primary. **outline**: a bordered alternative on busy screens. **subtle**: filters and toggles in a toolbar.
- **link**: an action that reads like text, inside a sentence. **dashed**: "Add another…" at the end of a list or an empty slot.
- **danger**: deletes, in the confirmation. **danger-soft**: Remove, Revoke, in a row or a settings page. **success**: Approve, Confirm.
- **inverse**: on dark bands. **gradient**: a launch or upgrade moment, once per page at most; never in forms or tables.
- `badge` adds a count ("Inbox 3"); `shortcut` a key hint ("⌘K"). `shape="pill"` for chat and marketing; `square` for joined bars.
- Icon-only buttons need an `aria-label`. `loading` keeps the width and blocks clicks.
