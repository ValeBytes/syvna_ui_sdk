# InlineEdit

A value edited where it's shown: a customer's name on their page, a project's description. Click to edit; Enter saves, Escape cancels. While `onSave`'s promise runs it shows saving; if it throws, the message shows and the edit stays open.

- `size="title"` for a page's own name. `multiline` for descriptions (Ctrl+Enter saves).
