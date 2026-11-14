# Stagger

A grid or row whose children ease in one after another. Give it the grid's classes in `className`; each child gets a wrapper that is the grid's item (`itemClassName` for `h-full` or a span).

Use it for a row of product cards, a set of features, logos or team members on a public page. Keep the whole row under a second: with more than eight children, lower `gap` to 40 or 50. See `Reveal` for the effects and for when not to animate at all.

Inside a `ul`, pass `as="ul"` and `itemAs="li"`.
