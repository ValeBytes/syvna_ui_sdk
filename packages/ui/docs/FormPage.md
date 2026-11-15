# FormPage

A page whose job is a form: settings, a record's details, a long create form. The page uses its whole width; the fields never stretch across it. They sit in one column of at most 40rem (640px), and titles, navigation, a preview or a record's details use the rest of the width.

A short form (fewer than five fields, done in one go) is a `Dialog`, not a page. A long form people fill while looking at the list behind it is a `SidePanel`. Everything else is a `FormPage`.

Put it inside one `<form>` (with the server action) and give it `sections`: each an `id`, a `title`, a one or two sentence `description`, and its fields as `children` (`Field` with `Input`, `Select`, `Textarea`), or its settings as `rows` (a label, a description and a `Switch` or small `Select` at the right). Every section stays in the page on another tab or step, so all its fields are sent.

**Which variant:**

- **Settings of one thing:** `annotated` (the default: each section's title and description in a column at the left, its fields in a card; Shopify's layout), `annotated-plain` (the same without cards, ruled), `sheet` (one card, ruled sections), `rows` (mostly toggles: each setting a row with its control at the right).
- **Many categories of settings:** `nav` (the categories in a list at the left, one shown at a time; GitHub's), `tabs` (three to seven groups across the top), `index` (one long page with an "On this page" list that follows the scroll).
- **Independent settings, each saved on its own:** `cards` (a card per setting, with its own Save in the card's footer; Vercel's). Use it only when each card truly stands alone.
- **Viewed more than edited:** `inline-edit` (values as text; Edit turns a row into its control).
- **Create forms:** `single` (sections down one column), `create` (a long one: its actions in a bar fixed to the bottom), `focus` (a slim bar with the title and actions, the form centred under it), `disclosure` (the main fields, the rest behind "Advanced settings"; mark those sections `advanced`).
- **Done once, in order:** `steps` and `steps-side` (one step at a time, "Continue to …"), `question` (one question a screen, for people who don't know the product).
- **With something beside it:** `preview` (a fixed form column beside a live preview: a branded email, an invoice, a page), `record` (a record's fields in two thirds, its status, owner and dates in a third, through `aside`).
- **Long desktop admin forms:** `labels-left` (each label in a left column).

**Rules it follows, and you should too:**

- **One Save for the page,** the submit button first in `actions` ("Save changes", then Cancel), at the bottom. Never a Save in every section (`cards` is the one exception), never only at the top. `savebar` shows Discard and Save in a bar once something changes.
- **One column of fields.** Only short fields that are one thing share a row (city and postcode, first and last name). Never two textareas side by side.
- **Size each field to what goes in it:** a postcode or a quantity is short (`className="max-w-[12rem]"`); an email or a name fills the column.
- **Labels above, one to three words, sentence case;** hints under the field. Never a placeholder as the label.
- **Mark the rarer of required and optional:** most forms are mostly required, so write "(optional)" on the few that aren't.
- **Destructive settings** (close, delete, transfer) are a section with `tone: "danger"`: set apart at the end, in red, with their own button that opens a confirming `Dialog`. They're never saved with the rest.
- **Toggles in `rows` save themselves;** don't mix them with fields that wait for Save in the same section.
- No page title above it: the Topbar's `PageCrumbs` say where you are.
