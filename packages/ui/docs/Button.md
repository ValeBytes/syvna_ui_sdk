# Button

A button. Verb first, sentence case: "Save changes", "Add customer". 18 looks, five sizes, three shapes.

- **primary**: the one main action in a view. Never two side by side.
- **secondary**: everything else (the default). **ghost**: toolbars, table rows, icon buttons.
- **soft**: a tinted second action next to a primary. **outline**: a bordered alternative on busy screens. **subtle**: filters and toggles in a toolbar.
- **link**: an action that reads like text, inside a sentence. **dashed**: "Add another…" at the end of a list or an empty slot.
- **danger**: deletes, in the confirmation. **danger-soft**: Remove, Revoke, in a row or a settings page. **success**: Approve, Confirm.
- **inverse**: on dark bands. **gradient**: a launch or upgrade moment, once per page at most; never in forms or tables.
- `badge` adds a count ("Inbox 3"); `shortcut` a key hint ("⌘K"). `shape="pill"` for chat and marketing; `square` for joined bars.
- Icon-only buttons need an `aria-label`. `loading` keeps the width and blocks clicks.
- **A shop's or landing page's main action** gets one look of its own, used on every buying or sign-up button and nowhere else: **raised** (a solid edge that presses in), **shine** (a sheen crosses on hover), **fill** (an outline that fills with the brand colour), **hard** (outlined, on a hard brand-coloured shadow, for bold brands), **underline** (text over a line that draws in, for quiet premium brands). Size `xl`, and one `shape` for the whole site. Never on app screens.
- A link that should look like a button takes `buttonClass({ variant, size, shape })` as its `className`.
- `classNames` adjusts the inner parts (`label`, `badge`, `shortcut`) when a design needs it, for example uppercase tracked labels: `classNames={{ label: "uppercase tracking-[0.08em]" }}`. `className` is the button itself. Keep to token classes.
