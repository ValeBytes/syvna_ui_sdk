# Table

Rows of the same kind of thing: orders, customers, bookings. Most app screens are a table with a header above it.

- The first column names the row and is drawn strongest. Numbers and money are right-aligned (`align: "end"`) and tabular.
- Status is a Badge; dates are relative when recent ("2 hours ago") and full when older, in the reader's locale.
- `sort` on a column makes its header sortable. `onRowClick` opens the row, ideally in a side panel so people keep their place.
- `empty` takes an EmptyState for when there's nothing yet; `dense` for long lists; `flush` inside a Card with `padded={false}`.

## On a phone

Narrow, each row becomes a card. Say where each column goes with `mobile`, or the card lists every column's name and value and a long list gets slow to scan:

- The thing itself (a person, an order) is the `title`: the first column, unless another says so.
- Short facts that need no name (a team, a date, an id) are `meta`: small text under the title.
- The one or two values that matter most stay `row` (an amount, a status).
- The row's buttons are `actions`, along the card's foot.
- What a phone can do without is `hide`.

