# Table

Rows of the same kind of thing: orders, customers, bookings. Most app screens are a table with a header above it.

- The first column names the row and is drawn strongest. Numbers and money are right-aligned (`align: "end"`) and tabular.
- Status is a Badge; dates are relative when recent ("2 hours ago") and full when older, in the reader's locale.
- `sort` on a column makes its header sortable. `onRowClick` opens the row, ideally in a side panel so people keep their place.
- `empty` takes an EmptyState for when there's nothing yet; `dense` for long lists; `flush` inside a Card with `padded={false}`.
