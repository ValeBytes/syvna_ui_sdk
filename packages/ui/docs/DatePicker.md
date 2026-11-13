# DatePicker

A field for one day: it shows the date in the reader's format and opens a Calendar to change it. `min` and `max` keep it to days that make sense (no deliveries in the past). Submits YYYY-MM-DD under `name`.

- Weeks start on Monday, as in most of the world; `weekStartsOn={0}` for Sunday.
- For a time too, put an Input for the time beside it.

It takes the same `variant` and `size` as Input, so it matches the fields around it.
