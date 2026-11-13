"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import {
  CartSummary,
  Field,
  Input,
  PriceTag,
  ProductCard,
  QuantityStepper,
  RadioGroup,
  Rating,
  Section,
  Select,
  SiteFooter,
  SiteHeader,
  Tabs,
  Faq,
  cn,
  siteAction,
  toast,
} from "@syvna/ui";

import { base, heroPhoto, productBySlug, products, type Product } from "./catalogue";
import { useCart } from "./data";

const shop = `${base}/shop`;

const Mark = () => <span className="grid size-7 place-items-center rounded-md bg-brand font-display text-caption font-bold text-brand-ink">CV</span>;

function CartLink() {
  const { lines } = useCart();
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  return (
    <Link href={`${shop}/cart`} aria-label={`Cart, ${count} items`} className={cn(siteAction("ghost"), "relative px-2.5")}>
      <ShoppingBag size={18} />
      {count ? <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-ink tabular-nums">{count}</span> : null}
    </Link>
  );
}

function Header() {
  return (
    <SiteHeader
      sticky
      as={Link}
      brand={
        <>
          <Mark />
          Casa Verde
        </>
      }
      brandHref={shop}
      links={[
        { label: "Kitchen", href: `${shop}?c=Kitchen` },
        { label: "Living", href: `${shop}?c=Living` },
        { label: "Decor", href: `${shop}?c=Decor` },
        { label: "Our studio", href: shop },
      ]}
      actions={<CartLink />}
    />
  );
}

function Footer() {
  return (
    <SiteFooter
      as={Link}
      brand={
        <>
          <Mark />
          Casa Verde
        </>
      }
      tagline="Homeware made by hand in Lisbon, shipped to 40 countries."
      columns={[
        { title: "Shop", links: [{ label: "Kitchen", href: `${shop}?c=Kitchen` }, { label: "Living", href: `${shop}?c=Living` }, { label: "Decor", href: `${shop}?c=Decor` }] },
        { title: "Help", links: [{ label: "Shipping", href: shop }, { label: "Returns", href: shop }, { label: "Contact", href: shop }] },
      ]}
      legal="© 2026 Casa Verde, Lisbon."
    />
  );
}

/** Free shipping, returns and secure payment: the three doubts every shop answers. */
function Promises() {
  return (
    <ul className="m-0 grid list-none gap-3 p-0 text-small text-ink-2 @xl:grid-cols-3">
      {[
        [<Truck key="t" size={16} />, "Free shipping over $100"],
        [<RotateCcw key="r" size={16} />, "30 days to return"],
        [<Lock key="l" size={16} />, "Secure payment"],
      ].map(([icon, text], i) => (
        <li key={i} className="flex items-center gap-2 [&>svg]:text-ink-3">
          {icon}
          {text}
        </li>
      ))}
    </ul>
  );
}

function Grid({ items, onAdd }: { items: Product[]; onAdd?: (p: Product) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 @3xl:grid-cols-3 @5xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard
          key={p.slug}
          as={Link}
          href={`${shop}/product/${p.slug}`}
          name={p.name}
          vendor={p.category}
          image={p.photos[0]!}
          hoverImage={p.photos[1]}
          price={p.price}
          compareAt={p.compareAt}
          rating={{ value: p.rating, count: p.reviews }}
          badge={p.badge}
          soldOut={p.stock === 0}
          onAdd={onAdd ? () => onAdd(p) : undefined}
        />
      ))}
    </div>
  );
}

export function Store({ category }: { category?: string }) {
  const cart = useCart();
  const [tab, setTab] = useState(category ?? "All");
  const [sort, setSort] = useState("featured");
  const shown = products
    .filter((p) => tab === "All" || p.category === tab)
    .sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0));
  return (
    <>
      <Header />
      <section className="@container">
        <div className="relative mx-auto max-w-[1200px] px-4 pt-4 @3xl:px-6">
          <div className="relative overflow-hidden rounded-xl">
            <img src={heroPhoto} alt="" className="h-[300px] w-full object-cover @3xl:h-[400px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 @3xl:p-10">
              <h1 className="m-0 max-w-[560px] font-display text-display font-semibold tracking-[-0.025em] text-white">Made slowly, for every day</h1>
              <p className="m-0 max-w-[460px] text-body-lg text-white/85">Stoneware and furniture from our studio in Lisbon.</p>
              <a href="#products" className={cn(siteAction("secondary", "lg"), "mt-1 border-transparent")}>
                Shop the collection
              </a>
            </div>
          </div>
        </div>
      </section>
      <Section id="products">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-center @2xl:justify-between">
          <Tabs variant="pills" label="Category" value={tab} onValueChange={setTab} items={["All", "Kitchen", "Living", "Decor"].map((c) => ({ value: c, label: c, count: c === "All" ? products.length : products.filter((p) => p.category === c).length }))} />
          <Select
            aria-label="Sort by"
            size="sm"
            className="w-44"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: "featured", label: "Featured" },
              { value: "low", label: "Price, low to high" },
              { value: "high", label: "Price, high to low" },
            ]}
          />
        </div>
        <Grid
          items={shown}
          onAdd={(p) => {
            cart.add(p);
            toast({ title: `${p.name} added`, description: "It's in your cart.", tone: "success" });
          }}
        />
        <div className="border-t border-line pt-6">
          <Promises />
        </div>
      </Section>
      <Footer />
    </>
  );
}

export function ProductPage({ slug }: { slug: string }) {
  const p = productBySlug(slug) ?? products[0]!;
  const cart = useCart();
  const router = useRouter();
  const [photo, setPhoto] = useState(0);
  const [colour, setColour] = useState(p.colours[0]!);
  const [qty, setQty] = useState(1);
  const soldOut = p.stock === 0;
  return (
    <>
      <Header />
      <div className="@container">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 @3xl:px-6 @3xl:py-10">
          <Link href={shop} className="inline-flex w-fit items-center gap-1.5 text-label text-ink-3 no-underline hover:text-ink">
            <ArrowLeft size={14} /> {p.category}
          </Link>
          <div className="grid gap-8 @4xl:grid-cols-[1.1fr_1fr] @4xl:gap-12">
            <div className="flex flex-col gap-3">
              <div className="aspect-square overflow-hidden rounded-xl border border-line bg-surface-2">
                <img key={photo} src={p.photos[photo]} alt={p.name} className="size-full animate-fade-in object-cover" />
              </div>
              {p.photos.length > 1 ? (
                <div className="flex gap-2">
                  {p.photos.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      aria-label={`Photo ${i + 1}`}
                      aria-pressed={i === photo}
                      onClick={() => setPhoto(i)}
                      className={cn("size-18 cursor-pointer overflow-hidden rounded-md border-2 p-0", i === photo ? "border-ink" : "border-transparent opacity-70 hover:opacity-100")}
                    >
                      <img src={src} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h1 className="m-0 font-display text-heading font-semibold tracking-[-0.02em] text-ink @2xl:text-display">{p.name}</h1>
                <Rating value={p.rating} count={p.reviews} />
              </div>
              <PriceTag size="lg" amount={p.price} compareAt={p.compareAt} />
              <p className="m-0 text-body-lg text-ink-2">{p.description}</p>
              {p.colours.length > 1 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-label font-medium text-ink">
                    Colour: <span className="font-normal text-ink-2">{colour}</span>
                  </span>
                  <RadioGroup variant="cards" inline label="Colour" value={colour} onValueChange={setColour} options={p.colours.map((c) => ({ value: c, label: c }))} />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <QuantityStepper value={qty} onValueChange={setQty} max={Math.max(1, p.stock)} label={`Quantity of ${p.name}`} />
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    cart.add(p, colour, qty);
                    toast({ title: `${qty} × ${p.name} added`, tone: "success" });
                    router.push(`${shop}/cart`);
                  }}
                  className={cn(siteAction("primary", "lg"), "flex-1 disabled:cursor-not-allowed disabled:opacity-50")}
                >
                  {soldOut ? "Sold out" : "Add to cart"}
                </button>
              </div>
              <p className={cn("m-0 text-small", soldOut ? "text-danger" : p.stock <= 5 ? "text-warning" : "text-ink-3")}>
                {soldOut ? "Sold out. Back in about three weeks." : p.stock <= 5 ? `Only ${p.stock} left.` : "In stock, ships in 2 days."}
              </p>
              <div className="border-t border-line pt-5">
                <Promises />
              </div>
              <Faq
                items={[
                  { question: "Materials and care", answer: "Stoneware or solid wood, finished by hand. Wipe wood with a damp cloth; stoneware goes in the dishwasher." },
                  { question: "Shipping", answer: "Free over $100; otherwise $6.50. Most countries in 3–7 working days, tracked." },
                  { question: "Returns", answer: "Send it back within 30 days, unused, for a full refund. We pay return shipping in the EU." },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
      <Section title="You may also like">
        <Grid items={products.filter((x) => x.slug !== p.slug).slice(0, 4)} />
      </Section>
      <Footer />
    </>
  );
}

export function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const subtotal = cart.lines.reduce((s, l) => s + l.price * l.quantity, 0);
  return (
    <>
      <Header />
      <div className="@container">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 @3xl:px-6 @4xl:grid-cols-[1fr_400px]">
          <div className="flex flex-col gap-4">
            <h1 className="m-0 font-display text-heading font-semibold tracking-[-0.02em] text-ink">Your cart</h1>
            {subtotal > 0 && subtotal < 100 ? (
              <p className="m-0 rounded-md bg-brand-soft px-3 py-2 text-body text-ink-2">
                Add <strong className="text-ink">${(100 - subtotal).toFixed(2)}</strong> more for free shipping.
              </p>
            ) : null}
            <CartSummary
              lines={cart.lines}
              shipping={subtotal >= 100 ? 0 : subtotal ? 6.5 : undefined}
              onQuantity={cart.setQuantity}
              onRemove={cart.remove}
              note="Taxes are worked out at checkout."
              onCheckout={() => router.push(`${shop}/checkout`)}
              empty={
                <span className="flex flex-col items-center gap-4">
                  Your cart is empty.
                  <Link className={siteAction("primary")} href={shop}>
                    Keep shopping
                  </Link>
                </span>
              }
            />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="m-0 text-subtitle font-semibold text-ink">Add to your order</h2>
            <div className="grid grid-cols-2 gap-4">
              {products
                .filter((p) => p.stock > 0 && !cart.lines.some((l) => l.id.startsWith(p.slug)))
                .slice(0, 2)
                .map((p) => (
                  <ProductCard key={p.slug} as={Link} href={`${shop}/product/${p.slug}`} name={p.name} image={p.photos[0]!} price={p.price} compareAt={p.compareAt} onAdd={() => cart.add(p)} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export function Checkout() {
  const cart = useCart();
  const router = useRouter();
  const [delivery, setDelivery] = useState("standard");
  const [placing, setPlacing] = useState(false);
  const subtotal = cart.lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const shipping = delivery === "express" ? 18 : subtotal >= 100 ? 0 : 6.5;
  const place = (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      cart.clear();
      toast({ title: "Order placed", description: "A confirmation is on its way by email.", tone: "success" });
      router.push(shop);
    }, 1200);
  };
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-4 @3xl:px-6">
          <Link href={shop} className="flex items-center gap-2 font-display text-subtitle font-semibold text-ink no-underline">
            <Mark />
            Casa Verde
          </Link>
          <span className="inline-flex items-center gap-1.5 text-small text-ink-3">
            <Lock size={13} /> Secure checkout
          </span>
        </div>
      </header>
      <div className="@container">
        <form onSubmit={place} className="mx-auto grid max-w-[1100px] gap-10 px-4 py-8 @3xl:px-6 @4xl:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-8">
            <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
              <legend className="mb-4 p-0 text-title font-semibold text-ink">Contact</legend>
              <Field label="Email" hint="For the receipt and tracking." required>
                <Input type="email" autoComplete="email" placeholder="you@example.com" required />
              </Field>
            </fieldset>
            <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
              <legend className="mb-4 p-0 text-title font-semibold text-ink">Delivery address</legend>
              <div className="grid gap-4 @xl:grid-cols-2">
                <Field label="First name" required>
                  <Input autoComplete="given-name" required />
                </Field>
                <Field label="Last name" required>
                  <Input autoComplete="family-name" required />
                </Field>
              </div>
              <Field label="Address" required>
                <Input autoComplete="street-address" required />
              </Field>
              <div className="grid gap-4 @xl:grid-cols-3">
                <Field label="City" required>
                  <Input autoComplete="address-level2" required />
                </Field>
                <Field label="Postcode" required>
                  <Input autoComplete="postal-code" required />
                </Field>
                <Field label="Country" required>
                  <Select
                    autoComplete="country-name"
                    defaultValue="Portugal"
                    options={["Portugal", "Spain", "Germany", "United Kingdom", "United States", "Japan", "Brazil", "Nigeria", "Kenya", "India"].map((c) => ({ value: c, label: c }))}
                  />
                </Field>
              </div>
            </fieldset>
            <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
              <legend className="mb-4 p-0 text-title font-semibold text-ink">Delivery</legend>
              <RadioGroup
                variant="cards"
                label="Delivery speed"
                value={delivery}
                onValueChange={setDelivery}
                options={[
                  { value: "standard", label: subtotal >= 100 ? "Standard: free" : "Standard: $6.50", description: "3–7 working days, tracked." },
                  { value: "express", label: "Express: $18.00", description: "1–2 working days, tracked." },
                ]}
              />
            </fieldset>
            <p className="m-0 text-small text-ink-3">Payment comes next, on the payment provider&apos;s own secure page.</p>
          </div>
          <aside className="flex flex-col gap-4 @4xl:sticky @4xl:top-6 @4xl:self-start">
            <h2 className="m-0 text-title font-semibold text-ink">Order</h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {cart.lines.map((l) => (
                <li key={l.id} className="flex items-center gap-3">
                  <span className="relative">
                    <img src={l.image} alt="" className="size-14 rounded-md border border-line object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-ground">{l.quantity}</span>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-body font-medium text-ink">{l.name}</span>
                    <span className="text-small text-ink-3">{l.variant}</span>
                  </span>
                  <span className="text-body tabular-nums text-ink">${(l.price * l.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-line pt-4 text-body">
              <div className="flex justify-between text-ink-2">
                <span>Subtotal</span>
                <span className="tabular-nums text-ink">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>Shipping</span>
                <span className="tabular-nums text-ink">{shipping ? `$${shipping.toFixed(2)}` : "Free"}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-line pt-3">
                <span className="text-subtitle font-semibold text-ink">Total</span>
                <span className="text-title font-semibold tabular-nums text-ink">${(subtotal + shipping).toFixed(2)}</span>
              </div>
            </div>
            <button type="submit" disabled={placing || !cart.lines.length} className={cn(siteAction("primary", "lg"), "w-full disabled:cursor-not-allowed disabled:opacity-60")}>
              {placing ? "Placing order…" : "Continue to payment"}
            </button>
            <Link href={`${shop}/cart`} className="text-center text-small text-ink-3 no-underline hover:text-ink">
              Back to cart
            </Link>
          </aside>
        </form>
      </div>
    </>
  );
}
