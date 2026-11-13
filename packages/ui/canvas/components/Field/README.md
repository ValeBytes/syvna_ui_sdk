# Field

Wraps one control with its label, and a hint or an error under it. It gives the control its id, ties the hint to it for screen readers, and draws it invalid when there's an error.

- Labels are nouns, short: "Email address", not "Please enter your email address".
- A hint says what goes in or what happens: "We'll send the receipt here."
- An error says what's wrong and how to fix it: "Enter a date after today." Show it after the person leaves the field or submits, not while they type.
- `required` marks the label; `aside` holds "Optional" or a link on the right.
