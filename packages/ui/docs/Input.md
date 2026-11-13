# Input

A one-line text field in fifteen looks, with the extras forms need. Put it in a Field for its label, hint and error, or use floating, notched or inline, which draw the label inside.

Looks (`variant`):
- **outline** (default) for most forms. **filled**, **underline**, **minimal** for dense forms and inline editing.
- **cupertino**, **pill** (search), **soft** (a brand tint), **inset** (sunken), **elevated** (a shadow, on busy backgrounds), **bold** (a 2px border, for forms that must be noticed), **dashed** (optional or draft values).
- **floating** and **notched**: the label inside, rising as you type. **inline**: the label inside on the left, for settings rows.

Extras:
- `addonBefore` / `addonAfter`: joined grey blocks, "https://" | field | ".com".
- `leading` / `trailing`: an icon or unit inside.
- `clearable`, `counter` (with `maxLength`), `loading`, `valid` (a green tick once checked), `copyable` (with `readOnly`, for IDs and links), `shortcut` ("⌘K" on a search field), `action` (a small button inside: Apply, Verify).
- Passwords get an eye button that shows what was typed.
