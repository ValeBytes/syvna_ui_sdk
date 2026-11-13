# NumberInput

A number, typed or stepped. Arrow keys step it (Shift for ten steps), it stays within `min` and `max`, and it's shown formatted for the reader (1,250.5) while emitting the plain number.

- `controls`: stepper (− and + at the sides) for small counts like seats; arrows for dense forms; none for amounts.
- `format="percent"` adds %; for money use CurrencyInput.
- `prefix` / `suffix` for units: "seats", "kg", "days".
