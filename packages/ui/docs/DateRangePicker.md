# DateRangePicker

A field for a period: a report's dates, a filter, a billing period. Presets down the side (Today, Last 7 days, This quarter, Year to date…), two months to pick on with the range previewed as you hover, and Apply, so a half-picked range never reaches the report.

- `compare` adds "Compare to previous period"; onChange then also gets the period before, of the same length.
- `instant` applies as soon as a preset or range is picked, for quick filters.
- `presets={[]}` hides them; pass your own (fiscal quarters) with `{ label, range }`.
- `align="end"` when the field sits at the right of a toolbar.
