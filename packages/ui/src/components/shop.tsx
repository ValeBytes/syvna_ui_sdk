"use client";

// A shop's front: products, prices, ratings and the cart.

import { useId, useState } from "react";

import { cn, focusRing } from "../cx";
import { CloseGlyph } from "./icons";
import { siteAction } from "./site";

const formatter = (currency: string, locale?: string) => new Intl.NumberFormat(locale ?? "en-US", { style: "currency", currency });

export interface PriceTagProps {
  /** The price now. */
  amount: number;
  /** The price before a sale; shown struck through, with the saving. */
  compareAt?: number;
  /** ISO code: USD, EUR, KES, JPY. */
  currency?: string;
  /** Formats the number: "de-DE" writes 1.299,00 €. */
  locale?: string;
  /** sm on cards, md by default, lg on a product's own page. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const priceSizes = { sm: "text-subtitle", md: "text-title", lg: "text-heading" };

/** A price, and when it's on sale, the old price struck through and how much is saved. */
export function PriceTag({ amount, compareAt, currency = "USD", locale, size = "md", className }: PriceTagProps) {
  const f = formatter(currency, locale);
  const sale = compareAt !== undefined && compareAt > amount;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-semibold tabular-nums tracking-[-0.01em]", sale ? "text-danger" : "text-ink", priceSizes[size])}>{f.format(amount)}</span>
      {sale ? (
        <>
          <s className="text-body tabular-nums text-ink-3">{f.format(compareAt)}</s>
          <span className="text-caption font-semibold text-danger">−{Math.round((1 - amount / compareAt) * 100)}%</span>
        </>
      ) : null}
    </span>
  );
}

export interface RatingProps {
  /** 0 to 5; halves show as half stars. */
  value: number;
  /** How many reviews it's from: shown after the stars. */
  count?: number;
  /** Lets the visitor pick a rating; called with 1–5. */
  onRate?: (value: number) => void;
  /** sm on cards, md elsewhere. */
  size?: "sm" | "md";
  className?: string;
}

function Star({ fill, size }: { fill: number; size: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--color-warning)" />
          <stop offset={`${fill * 100}%`} stopColor="var(--color-line-strong)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
    </svg>
  );
}

/** Stars out of five, with how many reviews; or, with onRate, a way to give one. */
export function Rating({ value, count, onRate, size = "md", className }: RatingProps) {
  const [hover, setHover] = useState<number>();
  const px = size === "sm" ? 14 : 18;
  const shown = hover ?? value;
  const stars = [1, 2, 3, 4, 5].map((n) => {
    const fill = Math.max(0, Math.min(1, Math.round((shown - n + 1) * 2) / 2));
    return onRate ? (
      <button
        key={n}
        type="button"
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        aria-pressed={Math.round(value) === n}
        onClick={() => onRate(n)}
        onMouseEnter={() => setHover(n)}
        className={cn("cursor-pointer rounded-sm p-0.5 transition-transform hover:scale-110", focusRing)}
      >
        <Star fill={fill} size={px} />
      </button>
    ) : (
      <Star key={n} fill={fill} size={px} />
    );
  });
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="inline-flex items-center gap-px"
        role={onRate ? "group" : "img"}
        aria-label={onRate ? "Your rating" : `${value} out of 5 stars`}
        onMouseLeave={() => setHover(undefined)}
      >
        {stars}
      </span>
      {count !== undefined ? <span className={cn("tabular-nums text-ink-3", size === "sm" ? "text-caption" : "text-small")}>({count.toLocaleString("en-US")})</span> : null}
    </span>
  );
}

export interface QuantityStepperProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  /** What's in stock; + stops there. */
  max?: number;
  /** sm in a cart line, md on a product page. */
  size?: "sm" | "md";
  /** Read by screen readers: "Quantity of Ceramic mug". */
  label?: string;
  className?: string;
}

/** How many: − and + around a number that can also be typed. */
export function QuantityStepper({ value, defaultValue = 1, onValueChange, min = 1, max = 99, size = "md", label = "Quantity", className }: QuantityStepperProps) {
  const [own, setOwn] = useState(defaultValue);
  const n = value ?? own;
  const set = (v: number) => {
    const c = Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
    setOwn(c);
    onValueChange?.(c);
  };
  const btn = cn("grid h-full cursor-pointer place-items-center text-ink-2 hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:text-ink-4 disabled:hover:bg-transparent", size === "sm" ? "w-7" : "w-9", focusRing);
  return (
    <span role="group" aria-label={label} className={cn("inline-flex items-stretch overflow-hidden rounded-md border border-line-strong bg-surface shadow-1", size === "sm" ? "h-7" : "h-9", className)}>
      <button type="button" aria-label="One fewer" disabled={n <= min} onClick={() => set(n - 1)} className={btn}>
        <span aria-hidden="true" className="h-px w-2.5 bg-current" />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={n}
        onChange={(e) => set(parseInt(e.target.value, 10))}
        className={cn("w-9 border-x border-line bg-transparent text-center tabular-nums text-ink outline-none! focus:bg-surface-2", size === "sm" ? "text-small" : "text-body")}
      />
      <button type="button" aria-label="One more" disabled={n >= max} onClick={() => set(n + 1)} className={btn}>
        <span aria-hidden="true" className="relative size-2.5">
          <span className="absolute left-0 top-1/2 h-px w-2.5 bg-current" />
          <span className="absolute left-1/2 top-0 h-2.5 w-px bg-current" />
        </span>
      </button>
    </span>
  );
}

export interface ProductCardProps {
  name: React.ReactNode;
  /** The product's page. */
  href?: string;
  /** The photo; a second one shows on hover when given. */
  image: string;
  hoverImage?: string;
  /** Alt text for the photo; the name if not given. */
  imageAlt?: string;
  price: number;
  compareAt?: number;
  currency?: string;
  /** A line over the name: the brand or the category. */
  vendor?: React.ReactNode;
  /** 0–5 and how many reviews. */
  rating?: { value: number; count?: number };
  /** A word on the photo: "New", "Sold out", "−20%". */
  badge?: React.ReactNode;
  /** Shows an "Add to cart" button; called when it's clicked. */
  onAdd?: () => void;
  /** Greys it out and disables the button. */
  soldOut?: boolean;
  /** square for most goods, tall for clothes and posters. */
  ratio?: "square" | "tall";
  /** What renders links: Next's Link, say, so moving between pages keeps state. An <a> by default. */
  as?: React.ElementType;
  className?: string;
}

/** A product in a grid: photo, name, price and, when asked, a button to add it to the cart. */
export function ProductCard({ name, href, image, hoverImage, imageAlt, price, compareAt, currency, vendor, rating, badge, onAdd, soldOut, ratio = "square", as = "a", className }: ProductCardProps) {
  const Name = href ? as : "span";
  return (
    <article className={cn("group/product relative flex flex-col gap-3", soldOut && "opacity-70", className)}>
      <div className={cn("relative overflow-hidden rounded-lg border border-line bg-surface-2", ratio === "tall" ? "aspect-[3/4]" : "aspect-square")}>
        <img src={image} alt={imageAlt ?? (typeof name === "string" ? name : "")} loading="lazy" className="size-full object-cover transition-transform duration-500 ease-out group-hover/product:scale-[1.03]" />
        {hoverImage ? <img src={hoverImage} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover/product:opacity-100" /> : null}
        {badge || soldOut ? (
          <span className={cn("absolute left-2.5 top-2.5 rounded-sm px-1.5 py-0.5 text-caption font-semibold shadow-1", soldOut ? "bg-surface text-ink-2" : "bg-ink text-ground")}>{soldOut ? "Sold out" : badge}</span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        {vendor ? <span className="text-caption font-medium uppercase tracking-[0.04em] text-ink-3">{vendor}</span> : null}
        <Name {...(href ? { href } : {})} className={cn("rounded-sm text-body font-medium text-ink no-underline", href && "after:absolute after:inset-0 hover:underline", focusRing)}>
          {name}
        </Name>
        {rating ? <Rating size="sm" value={rating.value} count={rating.count} /> : null}
        <PriceTag size="sm" amount={price} compareAt={compareAt} currency={currency} />
      </div>
      {onAdd ? (
        <button type="button" disabled={soldOut} onClick={onAdd} className={cn(siteAction("secondary"), "relative z-10 w-full disabled:cursor-not-allowed disabled:opacity-60")}>
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      ) : null}
    </article>
  );
}

export interface CartLine {
  id: string;
  name: React.ReactNode;
  /** Size, colour: "Large · Sage". */
  variant?: React.ReactNode;
  image?: string;
  price: number;
  quantity: number;
  /** What's in stock: the stepper stops there. */
  max?: number;
}

export interface CartSummaryProps {
  lines: CartLine[];
  currency?: string;
  /** Called with a line's id and its new quantity. */
  onQuantity?: (id: string, quantity: number) => void;
  /** Called with a line's id to take it out. */
  onRemove?: (id: string) => void;
  /** Shipping cost; 0 says Free; leave off and it says it's worked out at checkout. */
  shipping?: number;
  /** Tax, when it's known before checkout. */
  tax?: number;
  /** A line over the button: "Free shipping over $50". */
  note?: React.ReactNode;
  /** The checkout button's words. */
  checkoutLabel?: React.ReactNode;
  onCheckout?: () => void;
  /** Shown when there are no lines. */
  empty?: React.ReactNode;
  className?: string;
}

/** The cart: each line with its photo, quantity and price, then the totals and the checkout button. */
export function CartSummary({
  lines,
  currency = "USD",
  onQuantity,
  onRemove,
  shipping,
  tax,
  note,
  checkoutLabel = "Check out",
  onCheckout,
  empty = "Your cart is empty.",
  className,
}: CartSummaryProps) {
  const f = formatter(currency);
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const total = subtotal + (shipping ?? 0) + (tax ?? 0);
  const row = "flex items-center justify-between text-body";
  return (
    <div className={cn("flex w-full flex-col rounded-lg border border-line bg-surface shadow-1", className)}>
      {lines.length === 0 ? (
        <p className="m-0 p-8 text-center text-body text-ink-3">{empty}</p>
      ) : (
        <>
          <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
            {lines.map((l) => (
              <li key={l.id} className="flex gap-3 p-4">
                {l.image ? <img src={l.image} alt="" className="size-16 flex-none rounded-md border border-line object-cover" /> : null}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 text-body font-medium text-ink">{l.name}</span>
                    <span className="text-body font-medium tabular-nums text-ink">{f.format(l.price * l.quantity)}</span>
                  </div>
                  {l.variant ? <span className="text-small text-ink-3">{l.variant}</span> : null}
                  <div className="mt-1 flex items-center justify-between">
                    <QuantityStepper size="sm" value={l.quantity} max={l.max} label={`Quantity of ${typeof l.name === "string" ? l.name : "item"}`} onValueChange={(q) => onQuantity?.(l.id, q)} />
                    {onRemove ? (
                      <button type="button" onClick={() => onRemove(l.id)} className={cn("inline-flex cursor-pointer items-center gap-1 rounded-sm text-small text-ink-3 hover:text-danger", focusRing)}>
                        <CloseGlyph size={12} />
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 border-t border-line p-4">
            <div className={row}>
              <span className="text-ink-2">Subtotal</span>
              <span className="tabular-nums text-ink">{f.format(subtotal)}</span>
            </div>
            <div className={row}>
              <span className="text-ink-2">Shipping</span>
              <span className="tabular-nums text-ink">{shipping === undefined ? <span className="text-ink-3">At checkout</span> : shipping === 0 ? "Free" : f.format(shipping)}</span>
            </div>
            {tax !== undefined ? (
              <div className={row}>
                <span className="text-ink-2">Tax</span>
                <span className="tabular-nums text-ink">{f.format(tax)}</span>
              </div>
            ) : null}
            <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
              <span className="text-subtitle font-semibold text-ink">Total</span>
              <span className="text-title font-semibold tabular-nums text-ink">{f.format(total)}</span>
            </div>
            {note ? <p className="m-0 text-small text-ink-3">{note}</p> : null}
            <button type="button" onClick={onCheckout} className={cn(siteAction("primary", "lg"), "mt-2 w-full")}>
              {checkoutLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
