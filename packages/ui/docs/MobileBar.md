# MobileBar

A bar fixed to the bottom of the screen on phones only, holding the one action a visitor should never have to scroll back for: Add to cart (with the price), Book a table, Start free. It isn't drawn on wider screens, so the same action must also be on the page itself.

Use it once per page, on shop product pages and long landing pages. Never build a fixed bottom bar by hand: one without the phone-only rule floats over the page on a computer.

```tsx
<MobileBar note={<PriceTag amount={38} />}>
  <Button variant="raised" size="lg" onClick={add}>Add to cart</Button>
</MobileBar>
```
