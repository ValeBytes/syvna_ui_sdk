"use client";

import { useState } from "react";

import { BarChart3, Gem, Globe2, Lock, Receipt, Rocket, Sparkles, Sprout, Zap } from "lucide-react";
import {
  AuthDivider,
  AuthLayout,
  Button,
  Field,
  Input,
  CallToAction,
  CartSummary,
  Faq,
  FeatureGrid,
  Hero,
  LogoCloud,
  PriceTag,
  PricingTable,
  ProductCard,
  QuantityStepper,
  Rating,
  Section,
  SiteFooter,
  SiteHeader,
  Testimonials,
  heroVariants,
  pricingVariants,
  siteAction,
  siteHeaderVariants,
  type CartLine,
  type HeroVariant,
  type PricingVariant,
  type SiteHeaderVariant,
} from "@syvna/ui";

import { bool, jsx, num, raw, str } from "./code";
import type { Doc } from "./types";

// Website pieces fill their stage edge to edge, like they fill a page.
const flush = "block p-0";

const photo = (id: string, w = 600, h = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;
const mug = photo("photo-1514228742587-6b1558fcca3d");
const bowls = photo("photo-1610701596007-11502861dcfa");
const vase = photo("photo-1578749556568-bc2c40e68b61");

const Brand = () => (
  <>
    <span className="grid size-7 place-items-center rounded-md bg-brand font-display text-caption font-bold text-brand-ink">N</span>
    Northwind
  </>
);
const links = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#customers" },
  { label: "Blog", href: "#blog" },
];
const Actions = () => (
  <>
    <a className={siteAction("ghost")} href="#signin">
      Sign in
    </a>
    <a className={siteAction("primary")} href="#start">
      Start free
    </a>
  </>
);

function HeaderDemo({ variant, actions }: { variant: SiteHeaderVariant; actions: boolean }) {
  return (
    <SiteHeader
      variant={variant}
      brand={<Brand />}
      links={links}
      current="#pricing"
      announcement={
        <span>
          Invoices now work in 30 currencies.{" "}
          <a href="#news" className="font-medium text-inherit underline underline-offset-2">
            Read the news
          </a>
        </span>
      }
      utility={[
        { label: "Help", href: "#help" },
        { label: "Contact", href: "#contact" },
        { label: "English (US)", href: "#lang" },
      ]}
      search={{ placeholder: "Search guides and invoices" }}
      actions={actions ? <Actions /> : undefined}
    />
  );
}

const shot = photo("photo-1460925895917-afdab827c52f", 1200, 760);
const cover = photo("photo-1586023492125-27b2c045efd7", 1600, 1000);
const gallery = [
  "photo-1514228742587-6b1558fcca3d",
  "photo-1610701596007-11502861dcfa",
  "photo-1578749556568-bc2c40e68b61",
  "photo-1503602642458-232111445657",
  "photo-1592078615290-033ee584e267",
  "photo-1567538096630-e0c55bd6374c",
].map((id) => photo(id, 400, 540));

function HeroDemo({ variant, title, eyebrow, media }: { variant: HeroVariant; title: string; eyebrow: boolean; media: boolean }) {
  return (
    <Hero
      variant={variant}
      eyebrow={eyebrow ? "Invoices in 30 currencies" : undefined}
      title={title}
      description="Northwind sends invoices, takes payments and shows where your money comes from, for shops selling across borders."
      actions={
        <>
          <a className={siteAction("primary", "lg")} href="#start">
            Start free
          </a>
          <a className={siteAction("secondary", "lg")} href="#how">
            See how it works
          </a>
        </>
      }
      signup={variant === "signup" ? { cta: "Get early access", placeholder: "you@company.com" } : undefined}
      note="Free for 14 days. No card needed."
      image={cover}
      gallery={gallery}
      stats={[
        { value: "40", label: "countries" },
        { value: "30", label: "currencies" },
        { value: "$1.2B", label: "paid out in 2025" },
        { value: "4.8/5", label: "from 2,100 reviews" },
      ]}
      media={media ? <img src={shot} alt="The dashboard" className="aspect-[16/10] w-full rounded-xl border border-line object-cover shadow-3" /> : undefined}
    />
  );
}

const features = [
  { icon: <Globe2 />, title: "Paid in their currency", description: "Customers pay in any of 30 currencies; you're paid out in yours, at the day's rate." },
  { icon: <Receipt />, title: "Invoices that send themselves", description: "Recurring invoices go out on the day, with reminders when one is late." },
  { icon: <BarChart3 />, title: "See where money comes from", description: "Revenue by product, country and channel, updated as orders come in." },
  { icon: <Zap />, title: "Set up in an afternoon", description: "Import products and customers from a spreadsheet; nothing to install." },
  { icon: <Lock />, title: "Your data stays yours", description: "Encrypted at rest, exportable at any time, deleted when you leave." },
  { icon: <Sparkles />, title: "Help from real people", description: "Answers within the hour on weekdays, from people who know the product." },
];

const plans = [
  { name: "Starter", monthly: 0, yearly: 0, icon: <Sprout />, description: "For a shop's first sales.", features: ["Up to 50 orders a month", "Invoices and receipts", "Email support"], excluded: ["30 currencies", "Recurring invoices"], cta: "Start free" },
  { name: "Growth", monthly: 29, yearly: 24, icon: <Rocket />, description: "For shops selling every day.", features: ["Unlimited orders", "30 currencies", "Recurring invoices", "Reports by product and country"], excluded: ["Roles and permissions"], cta: "Try 14 days free", featured: true },
  { name: "Scale", monthly: 89, yearly: 74, icon: <Gem />, description: "For teams and several shops.", features: ["Everything in Growth, plus", "Up to 5 shops", "Roles and permissions", "Priority support"], cta: "Try 14 days free" },
  { name: "Enterprise", monthly: "Custom", description: "For large catalogues.", features: ["Everything in Scale, plus", "Single sign-on", "A named contact"], cta: "Talk to us" },
];

const quotes = [
  { name: "Amara Okafor", role: "Owner, Okafor Textiles", quote: "We sell to twelve countries now. Getting paid in each one used to take a day a week; now it takes nothing." },
  { name: "Kenji Watanabe", role: "Founder, Hinoki Goods", quote: "The reports showed us half our sales came from one product. We doubled down on it the same month." },
  { name: "Lucía Fernández", role: "Manager, Casa Verde", quote: "Late invoices dropped by two thirds once reminders went out on their own." },
];

const faqs = [
  { question: "Can I cancel any time?", answer: "Yes. Plans are month to month unless you pay yearly; cancel in Settings and you keep access until the period ends." },
  { question: "Which currencies can customers pay in?", answer: "Thirty, including USD, EUR, GBP, JPY, INR, BRL, NGN and KES. You choose which ones your shop shows." },
  { question: "What happens to my data if I leave?", answer: "Export everything as CSV at any time. When you close your account, it's deleted within 30 days." },
  { question: "Do you take a cut of sales?", answer: "No. You pay the plan's price and the payment provider's own fee, nothing on top." },
];

function CartDemo({ shipping, empty }: { shipping: string; empty: boolean }) {
  const [lines, setLines] = useState<CartLine[]>([
    { id: "mug", name: "Hand-thrown mug", variant: "Sage · 350 ml", image: mug, price: 24, quantity: 2, max: 8 },
    { id: "bowls", name: "Stacking bowls, set of 3", variant: "Sand", image: bowls, price: 58, quantity: 1, max: 3 },
  ]);
  return (
    <CartSummary
      className="max-w-[420px]"
      lines={empty ? [] : lines}
      shipping={shipping === "at checkout" ? undefined : shipping === "free" ? 0 : 6.5}
      note="Free shipping over $100."
      onQuantity={(id, q) => setLines((l) => l.map((x) => (x.id === id ? { ...x, quantity: q } : x)))}
      onRemove={(id) => setLines((l) => l.filter((x) => x.id !== id))}
    />
  );
}

function RatingDemo({ value, count, interactive }: { value: number; count: number; interactive: boolean }) {
  const [mine, setMine] = useState(0);
  return interactive ? (
    <div className="flex flex-col items-center gap-2">
      <Rating value={mine} onRate={setMine} />
      <span className="text-small text-ink-3">{mine ? `You gave it ${mine} of 5` : "Rate it"}</span>
    </div>
  ) : (
    <Rating value={value} count={count} />
  );
}

export const site: Doc[] = [
  {
    name: "SiteHeader",
    controls: {
      variant: { type: "select", options: siteHeaderVariants, default: "classic" },
      all: { type: "boolean", default: false, label: `Show all ${siteHeaderVariants.length}` },
      actions: { type: "boolean", default: true, label: "Sign in + Start free" },
    },
    preview: (v) =>
      bool(v.all) ? (
        <div className="flex flex-col">
          {siteHeaderVariants.map((x, i) => (
            <div key={x} className="border-b border-dashed border-line-strong pb-6">
              <p className="m-0 px-4 pb-2 pt-4 font-mono text-caption text-ink-3">
                {i + 1}. {x}
              </p>
              <HeaderDemo variant={x} actions={bool(v.actions)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-[300px]">
          <HeaderDemo variant={str(v.variant) as SiteHeaderVariant} actions={bool(v.actions)} />
          <p className="m-0 p-6 text-body text-ink-3">Switch the device to Phone to see the links fold into a menu.</p>
        </div>
      ),
    code: (v) =>
      jsx(
        "SiteHeader",
        {
          variant: str(v.variant),
          brand: raw("<Logo />"),
          links: raw('[{ label: "Product", href: "/product" }, { label: "Pricing", href: "/pricing" }, …]'),
          current: "/pricing",
          announcement: v.variant === "announcement" ? "Invoices now work in 30 currencies." : undefined,
          utility: v.variant === "utility" ? raw('[{ label: "Help", href: "/help" }, { label: "Contact", href: "/contact" }]') : undefined,
          search: v.variant === "search" ? raw('{ placeholder: "Search guides and invoices", onSearch }') : undefined,
          actions: bool(v.actions) ? raw('<><a className={siteAction("ghost")} href="/signin">Sign in</a><a className={siteAction()} href="/start">Start free</a></>') : undefined,
        },
        undefined,
        { variant: "classic" },
      ),
    stage: flush,
  },
  {
    name: "Hero",
    controls: {
      variant: { type: "select", options: heroVariants, default: "center" },
      all: { type: "boolean", default: false, label: `Show all ${heroVariants.length}` },
      title: { type: "text", default: "Get paid by customers anywhere, in their currency" },
      eyebrow: { type: "boolean", default: true },
      media: { type: "boolean", default: true },
    },
    preview: (v) =>
      bool(v.all) ? (
        <div className="flex flex-col">
          {heroVariants.map((x, i) => (
            <div key={x} className="border-b-4 border-double border-line-strong">
              <p className="m-0 bg-surface-2 px-4 py-2 font-mono text-caption text-ink-3">
                {i + 1}. {x}
              </p>
              <HeroDemo variant={x} title={str(v.title)} eyebrow={bool(v.eyebrow)} media={bool(v.media)} />
            </div>
          ))}
        </div>
      ) : (
        <HeroDemo variant={str(v.variant) as HeroVariant} title={str(v.title)} eyebrow={bool(v.eyebrow)} media={bool(v.media)} />
      ),
    code: (v) =>
      jsx(
        "Hero",
        {
          variant: str(v.variant),
          eyebrow: bool(v.eyebrow) ? "Invoices in 30 currencies" : undefined,
          title: str(v.title),
          description: "Northwind sends invoices, takes payments…",
          actions: v.variant === "signup" ? undefined : raw('<><a className={siteAction("primary", "lg")} href="/start">Start free</a>…</>'),
          signup: v.variant === "signup" ? raw('{ cta: "Get early access", onSubmit: join }') : undefined,
          note: "Free for 14 days. No card needed.",
          image: String(v.variant).startsWith("photo") ? raw("cover.src") : undefined,
          stats: v.variant === "stats" ? raw('[{ value: "40", label: "countries" }, …]') : undefined,
          gallery: v.variant === "collage" ? raw("photos") : undefined,
          media: bool(v.media) && !String(v.variant).startsWith("photo") && v.variant !== "minimal" ? raw('<img src="/dashboard.png" alt="The dashboard" />') : undefined,
        },
        undefined,
        { variant: "center" },
      ),
    stage: flush,
  },
  {
    name: "Section",
    controls: { align: { type: "select", options: ["start", "center"], default: "start" }, tone: { type: "select", options: ["ground", "surface"], default: "ground" } },
    preview: (v) => (
      <Section align={str(v.align) as "start"} tone={str(v.tone) as "ground"} eyebrow="Features" title="Everything a shop needs to sell abroad" description="From the first invoice to the monthly report.">
        <FeatureGrid features={features.slice(0, 3)} />
      </Section>
    ),
    code: (v) =>
      jsx("Section", { id: "features", align: str(v.align), tone: str(v.tone), eyebrow: "Features", title: "Everything a shop needs to sell abroad", description: "From the first invoice to the monthly report." }, "<FeatureGrid features={features} />", { align: "start", tone: "ground" }),
    stage: flush,
  },
  {
    name: "FeatureGrid",
    controls: {
      columns: { type: "select", options: ["2", "3", "4"], default: "3" },
      variant: { type: "select", options: ["plain", "cards"], default: "plain" },
      count: { type: "number", default: 6, min: 2, max: 6 },
    },
    preview: (v) => <FeatureGrid className="max-w-[1100px]" columns={num(v.columns) as 3} variant={str(v.variant) as "plain"} features={features.slice(0, num(v.count))} />,
    code: (v) => jsx("FeatureGrid", { columns: num(v.columns), variant: str(v.variant), features: raw('[{ icon: <Globe2 />, title: "Paid in their currency", description: "…" }, …]') }, undefined, { columns: 3, variant: "plain" }),
    stage: "items-start",
  },
  {
    name: "LogoCloud",
    controls: { title: { type: "text", default: "Trusted by shops in 40 countries" } },
    preview: (v) => <LogoCloud title={str(v.title) || undefined} logos={["Okafor Textiles", "Hinoki", "Casa Verde", "Lumen", "Fjord & Co", "Tamarind"].map((name) => ({ name }))} />,
    code: (v) => jsx("LogoCloud", { title: str(v.title), logos: raw('[{ name: "Hinoki", logo: <img src="/logos/hinoki.svg" alt="Hinoki" /> }, …]') }),
  },
  {
    name: "Testimonials",
    controls: { variant: { type: "select", options: ["grid", "single"], default: "grid" } },
    preview: (v) => <Testimonials className="max-w-[1100px]" variant={str(v.variant) as "grid"} quotes={quotes} />,
    code: (v) => jsx("Testimonials", { variant: str(v.variant), quotes: raw('[{ name: "Amara Okafor", role: "Owner, Okafor Textiles", quote: "…" }, …]') }, undefined, { variant: "grid" }),
    stage: "items-start",
  },
  {
    name: "PricingTable",
    controls: {
      variant: { type: "select", options: pricingVariants, default: "cards" },
      all: { type: "boolean", default: false, label: `Show all ${pricingVariants.length}` },
      plans: { type: "select", options: ["2", "3", "4"], default: "3" },
      yearly: { type: "boolean", default: true, label: "Yearly prices" },
    },
    preview: (v) => {
      const one = (x: PricingVariant) => (
        <PricingTable
          key={`${x}${v.plans}${v.yearly}`}
          variant={x}
          className="max-w-[1100px]"
          yearlyNote={bool(v.yearly) ? "Save 17%" : undefined}
          intro={
            <div className="flex flex-col gap-3">
              <h2 className="m-0 font-display text-heading font-semibold tracking-[-0.02em] text-ink">Pay as you grow</h2>
              <p className="m-0 text-body-lg text-ink-2">Start free. Upgrade when you sell every day; no cut of your sales on any plan.</p>
            </div>
          }
          unit={{ name: "seat", min: 1, max: 40, default: 3 }}
          plans={plans.slice(0, num(v.plans)).map((p) => (bool(v.yearly) ? p : { ...p, yearly: undefined }))}
        />
      );
      return bool(v.all) ? (
        <div className="flex w-full flex-col gap-16">
          {pricingVariants.map((x, i) => (
            <div key={x} className="flex flex-col items-center gap-4">
              <p className="m-0 self-start font-mono text-caption text-ink-3">
                {i + 1}. {x}
              </p>
              {one(x)}
            </div>
          ))}
        </div>
      ) : (
        one(str(v.variant) as PricingVariant)
      );
    },
    code: (v) =>
      jsx(
        "PricingTable",
        {
          variant: str(v.variant),
          yearlyNote: bool(v.yearly) ? "Save 17%" : undefined,
          intro: v.variant === "split" ? raw("<PricingIntro />") : undefined,
          unit: v.variant === "calculator" ? raw('{ name: "seat", min: 1, max: 40, default: 3 }') : undefined,
          plans: raw(`[\n  { name: "Starter", monthly: 0${bool(v.yearly) ? ", yearly: 0" : ""}, features: [...], cta: "Start free" },\n  { name: "Growth", monthly: 29${bool(v.yearly) ? ", yearly: 24" : ""}, features: [...], cta: "Try 14 days free", featured: true },\n  …\n]`),
          onSelect: raw("choosePlan"),
        },
        undefined,
        { variant: "cards" },
      ),
    stage: "items-start pt-10",
  },
  {
    name: "Faq",
    controls: { single: { type: "boolean", default: false, label: "One open at a time" } },
    preview: (v) => <Faq key={String(v.single)} single={bool(v.single)} items={faqs} />,
    code: (v) => jsx("Faq", { single: bool(v.single), items: raw('[{ question: "Can I cancel any time?", answer: "Yes. …" }, …]') }),
    stage: "items-start",
  },
  {
    name: "CallToAction",
    controls: { tone: { type: "select", options: ["brand", "surface"], default: "brand" }, title: { type: "text", default: "Start selling abroad this week" } },
    preview: (v) => (
      <CallToAction
        className="max-w-[1100px]"
        tone={str(v.tone) as "brand"}
        title={str(v.title)}
        description="Free for 14 days. Bring your products from a spreadsheet."
        actions={
          <>
            <a className={siteAction("primary", "lg")} href="#start">
              Start free
            </a>
            <a className={siteAction(str(v.tone) === "brand" ? "ghost" : "secondary", "lg")} href="#demo" style={str(v.tone) === "brand" ? { color: "var(--color-brand-ink)" } : undefined}>
              Book a demo
            </a>
          </>
        }
      />
    ),
    code: (v) => jsx("CallToAction", { tone: str(v.tone), title: str(v.title), description: "Free for 14 days…", actions: raw('<a className={siteAction("primary", "lg")} href="/start">Start free</a>') }, undefined, { tone: "brand" }),
  },
  {
    name: "SiteFooter",
    preview: () => (
      <SiteFooter
        brand={<Brand />}
        tagline="Invoices and payments for shops that sell across borders."
        columns={[
          { title: "Product", links: [{ label: "Invoices", href: "#i" }, { label: "Payments", href: "#p" }, { label: "Reports", href: "#r" }, { label: "Pricing", href: "#pr" }] },
          { title: "Company", links: [{ label: "About", href: "#a" }, { label: "Careers", href: "#c" }, { label: "Contact", href: "#co" }] },
          { title: "Legal", links: [{ label: "Privacy", href: "#pv" }, { label: "Terms", href: "#t" }] },
        ]}
        legal="© 2026 Northwind. All rights reserved."
      />
    ),
    code: () => jsx("SiteFooter", { brand: raw("<Logo />"), tagline: "Invoices and payments for shops that sell across borders.", columns: raw('[{ title: "Product", links: [{ label: "Invoices", href: "/invoices" }, …] }, …]'), legal: "© 2026 Northwind." }),
    stage: flush,
  },
  {
    name: "ProductCard",
    controls: {
      ratio: { type: "select", options: ["square", "tall"], default: "square" },
      sale: { type: "boolean", default: true, label: "On sale (compareAt)" },
      rating: { type: "boolean", default: true },
      add: { type: "boolean", default: true, label: "Add to cart" },
      soldOut: { type: "boolean", default: false },
    },
    preview: (v) => (
      <div className="grid w-full max-w-[760px] grid-cols-2 gap-5 @container sm:grid-cols-3">
        {[
          { name: "Hand-thrown mug", image: mug, hoverImage: bowls, price: 24, compareAt: 30 },
          { name: "Stacking bowls, set of 3", image: bowls, price: 58 },
          { name: "Glazed vase", image: vase, price: 72, compareAt: 90 },
        ].map((p, i) => (
          <ProductCard
            key={p.name}
            href="#product"
            vendor="Casa Verde"
            name={p.name}
            image={p.image}
            hoverImage={p.hoverImage}
            price={p.price}
            compareAt={bool(v.sale) ? p.compareAt : undefined}
            badge={i === 1 ? "New" : undefined}
            rating={bool(v.rating) ? { value: [4.5, 4, 5][i]!, count: [128, 42, 9][i] } : undefined}
            onAdd={bool(v.add) ? () => {} : undefined}
            soldOut={bool(v.soldOut) && i === 2}
            ratio={str(v.ratio) as "square"}
          />
        ))}
      </div>
    ),
    code: (v) =>
      jsx("ProductCard", {
        href: "/products/mug",
        vendor: "Casa Verde",
        name: "Hand-thrown mug",
        image: raw("product.photos[0]"),
        hoverImage: raw("product.photos[1]"),
        price: 24,
        compareAt: bool(v.sale) ? 30 : undefined,
        rating: bool(v.rating) ? raw("{ value: 4.5, count: 128 }") : undefined,
        onAdd: bool(v.add) ? raw("() => addToCart(product.id)") : undefined,
        soldOut: bool(v.soldOut),
        ratio: str(v.ratio) === "square" ? undefined : str(v.ratio),
      }),
    stage: "items-start",
  },
  {
    name: "PriceTag",
    controls: {
      amount: { type: "number", default: 1299, min: 0, max: 100000 },
      compareAt: { type: "number", default: 1599, min: 0, max: 100000 },
      currency: { type: "select", options: ["USD", "EUR", "GBP", "JPY", "KES", "INR"], default: "USD" },
      size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
    },
    preview: (v) => <PriceTag amount={num(v.amount)} compareAt={num(v.compareAt) || undefined} currency={str(v.currency)} size={str(v.size) as "md"} />,
    code: (v) => jsx("PriceTag", { amount: num(v.amount), compareAt: num(v.compareAt) || undefined, currency: str(v.currency), size: str(v.size) }, undefined, { currency: "USD", size: "md" }),
  },
  {
    name: "Rating",
    controls: { value: { type: "number", default: 4.5, min: 0, max: 5, step: 0.5 }, count: { type: "number", default: 128, min: 0, max: 99999 }, interactive: { type: "boolean", default: false, label: "Let them rate (onRate)" } },
    preview: (v) => <RatingDemo key={String(v.interactive)} value={num(v.value)} count={num(v.count)} interactive={bool(v.interactive)} />,
    code: (v) => (bool(v.interactive) ? jsx("Rating", { value: raw("mine"), onRate: raw("setMine") }) : jsx("Rating", { value: num(v.value), count: num(v.count) })),
  },
  {
    name: "QuantityStepper",
    controls: { size: { type: "select", options: ["sm", "md"], default: "md" }, max: { type: "number", default: 5, min: 1, max: 99, label: "In stock (max)" } },
    preview: (v) => <QuantityStepper key={String(v.max)} size={str(v.size) as "md"} max={num(v.max)} label="Quantity of Hand-thrown mug" />,
    code: (v) => jsx("QuantityStepper", { value: raw("quantity"), onValueChange: raw("setQuantity"), max: num(v.max), size: str(v.size) }, undefined, { size: "md" }),
  },
  {
    name: "CartSummary",
    controls: { shipping: { type: "select", options: ["at checkout", "free", "6.50"], default: "at checkout" }, empty: { type: "boolean", default: false } },
    preview: (v) => <CartDemo shipping={str(v.shipping)} empty={bool(v.empty)} />,
    code: (v) =>
      jsx("CartSummary", {
        lines: raw("cart.lines"),
        shipping: str(v.shipping) === "free" ? 0 : str(v.shipping) === "6.50" ? 6.5 : undefined,
        note: "Free shipping over $100.",
        onQuantity: raw("setQuantity"),
        onRemove: raw("removeLine"),
        onCheckout: raw("checkout"),
      }),
    stage: "items-start",
  },
  {
    name: "AuthLayout",
    controls: { aside: { type: "boolean", default: true, label: "Brand panel" } },
    stage: "block p-0",
    preview: (v) => (
      <AuthLayout
        className="min-h-[560px]"
        brand={<><Gem size={18} /> Lumen</>}
        title="Sign in"
        description="Welcome back."
        aside={bool(v.aside) ? { headline: "Your studio, booked and paid.", quote: { quote: "Half our admin went away.", name: "Amara Okafor", role: "Owner, Lumen" } } : undefined}
        footer={<>New here? <a href="#">Create an account</a></>}
      >
        <Button block size="lg">Continue with Google</Button>
        <AuthDivider />
        <Field label="Email"><Input type="email" /></Field>
        <Button variant="primary" size="lg" block>Sign in</Button>
      </AuthLayout>
    ),
    code: (v) =>
      jsx(
        "AuthLayout",
        {
          brand: raw("<><Mark /> Lumen</>"),
          title: "Sign in",
          description: "Welcome back.",
          aside: bool(v.aside) ? raw('{ headline: "Your studio, booked and paid.", quote: { quote: "Half our admin went away.", name: "Amara Okafor", role: "Owner, Lumen" } }') : undefined,
          footer: raw("<>New here? <Link href=\"/sign-up\">Create an account</Link></>"),
        },
        '<OAuthButtons />\n<AuthDivider />\n<AuthForm mode="sign-in" />',
      ),
  },
];
