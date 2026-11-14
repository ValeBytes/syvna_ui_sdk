# ProductCard

A product in a grid: photo, name, price, and optionally a rating and an Add to cart button. The whole card links to the product's page through `href`.

- `hoverImage` shows a second photo on hover (the back, worn, in use).
- `compareAt` shows a sale: the old price struck through and the saving.
- `soldOut` greys it and disables the button; keep sold-out products visible so people can come back.
- `ratio="tall"` for clothes and posters.

The add button takes the shop's one buying look (`addVariant`: `raised`, `shine`, `fill`, `hard` or `primary`), its words (`addLabel`) and shape, and can slide up over the photo on hover (`addPlacement="overlay"`; on touch screens it's always shown). Use the same look on the product page's button and `CartSummary`'s `checkoutVariant`.

`classNames` restyles its parts for the shop's design without rewriting the card: `media` (the photo's frame: sharp corners, no border, another ratio), `image`, `badge`, `body`, `vendor`, `name`, `price`, `action`. Token classes only.
