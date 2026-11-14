"use client";

import Link from "next/link";
import { ArrowRight, Lock, Zap } from "lucide-react";
import { Badge, Bento, CallToAction, Faq, FeatureRows, Hero, LogoCloud, PricingTable, Reveal, Section, SiteFooter, SiteHeader, Stats, Steps, Testimonials, siteAction, toast } from "@syvna/ui";

import { base, dashboardShot } from "./catalogue";

const Brand = () => (
  <>
    <span className="grid size-7 place-items-center rounded-md bg-brand font-display text-caption font-bold text-brand-ink">N</span>
    Northwind
  </>
);

function Header() {
  return (
    <SiteHeader
      sticky
      as={Link}
      brand={<Brand />}
      brandHref={`${base}/landing`}
      links={[
        { label: "Product", href: `${base}/landing#features` },
        { label: "Customers", href: `${base}/landing#customers` },
        { label: "Pricing", href: `${base}/pricing` },
        { label: "Questions", href: `${base}/pricing#faq` },
      ]}
      actions={
        <>
          <Link className={siteAction("ghost")} href="/templates/sign-in">
            Sign in
          </Link>
          <Link className={siteAction("primary")} href={`${base}/pricing`}>
            Start free
          </Link>
        </>
      }
    />
  );
}

function Footer() {
  return (
    <SiteFooter
      as={Link}
      brand={<Brand />}
      tagline="Invoices and payments for shops that sell across borders."
      columns={[
        { title: "Product", links: [{ label: "Features", href: `${base}/landing#features` }, { label: "Pricing", href: `${base}/pricing` }, { label: "Customers", href: `${base}/landing#customers` }] },
        { title: "Company", links: [{ label: "About", href: `${base}/landing` }, { label: "Careers", href: `${base}/landing` }, { label: "Contact", href: `${base}/landing` }] },
        { title: "Legal", links: [{ label: "Privacy", href: `${base}/landing` }, { label: "Terms", href: `${base}/landing` }] },
      ]}
      legal="© 2026 Northwind. All rights reserved."
    />
  );
}

const quotes = [
  { name: "Amara Okafor", role: "Owner, Okafor Textiles", quote: "We sell to twelve countries now. Getting paid in each one used to take a day a week; now it takes nothing." },
  { name: "Kenji Watanabe", role: "Founder, Hinoki Goods", quote: "The reports showed us half our sales came from one product. We doubled down on it the same month." },
  { name: "Lucía Fernández", role: "Manager, Casa Verde", quote: "Late invoices dropped by two thirds once reminders went out on their own." },
];

const plans = [
  { name: "Starter", monthly: 0, yearly: 0, description: "For a shop's first sales.", features: ["Up to 50 orders a month", "Invoices and receipts", "Email support"], cta: "Start free" },
  { name: "Growth", monthly: 29, yearly: 24, description: "For shops selling every day.", features: ["Unlimited orders", "30 currencies", "Recurring invoices", "Reports by product and country"], cta: "Try 14 days free", featured: true },
  { name: "Scale", monthly: 89, yearly: 74, description: "For teams and several shops.", features: ["Everything in Growth, plus", "Up to 5 shops", "Roles and permissions", "Priority support"], cta: "Try 14 days free" },
];

const faqs = [
  { question: "Can I cancel any time?", answer: "Yes. Plans are month to month unless you pay yearly; cancel in Settings and you keep access until the period ends." },
  { question: "Which currencies can customers pay in?", answer: "Thirty, including USD, EUR, GBP, JPY, INR, BRL, NGN and KES. You choose which ones your shop shows." },
  { question: "What happens to my data if I leave?", answer: "Export everything as CSV at any time. When you close your account, it's deleted within 30 days." },
  { question: "Do you take a cut of sales?", answer: "No. You pay the plan's price and the payment provider's own fee, nothing on top." },
  { question: "Is there a contract for Scale?", answer: "No. Every plan is month to month or yearly, and you can move between them whenever you like." },
];

const Cta = () => (
  <Section>
    <CallToAction
      title="Start selling abroad this week"
      description="Free for 14 days. Bring your products from a spreadsheet."
      actions={
        <Link className={siteAction("primary", "lg")} href={`${base}/pricing`}>
          Start free <ArrowRight size={16} />
        </Link>
      }
    />
  </Section>
);

// Pieces of the product itself, built from the kit with real-looking data:
// what a landing page shows instead of stock pictures.
function InvoicesShot({ rows = 5 }: { rows?: number }) {
  const data = [
    ["INV-1042", "Okafor Textiles", "NGN 1,840,000", "Paid", "success"],
    ["INV-1041", "Hinoki Goods", "JPY 212,000", "Sent", "info"],
    ["INV-1040", "Casa Verde", "EUR 1,260.00", "Paid", "success"],
    ["INV-1039", "Fjord & Co", "NOK 18,400", "Late", "danger"],
    ["INV-1038", "Tamarind", "INR 96,500", "Paid", "success"],
  ].slice(0, rows);
  return (
    <div className="@container w-full bg-surface text-left">
      {data.map((r) => (
        <div key={r[0]} className="flex items-center gap-3 border-b border-line px-4 py-3 text-label last:border-0">
          <span className="font-mono text-caption text-ink-3">{r[0]}</span>
          <span className="min-w-0 flex-1 truncate text-ink">{r[1]}</span>
          <span className="hidden tabular-nums text-ink-2 @sm:block">{r[2]}</span>
          <Badge tone={r[4] as "success"}>{r[3]}</Badge>
        </div>
      ))}
    </div>
  );
}

function RevenueBars() {
  const bars = [34, 48, 44, 61, 57, 72, 90];
  return (
    <div className="flex h-28 w-full items-end gap-2 pb-6">
      {bars.map((h, i) => (
        <span key={i} className={i === bars.length - 1 ? "flex-1 rounded-t-sm bg-current" : "flex-1 rounded-t-sm bg-current/35"} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function Currencies() {
  return (
    <div className="flex flex-wrap gap-2 pb-6">
      {["USD", "EUR", "GBP", "JPY", "INR", "BRL", "NGN", "KES", "NOK", "+21"].map((c) => (
        <span key={c} className="rounded-md border border-line bg-surface-2 px-2.5 py-1 font-mono text-caption text-ink-2">{c}</span>
      ))}
    </div>
  );
}

/**
 * A landing page with the sections a buyer needs, in order: what it is (hero,
 * with the product in view), who uses it, what it does (Bento), how each part
 * works (FeatureRows with real screens), proof (Stats, Testimonials), how to
 * start (Steps), what it costs, the questions people ask, and the one action.
 * The first screen eases in as the page opens; the rest as it's scrolled to.
 */
export function Landing() {
  return (
    <>
      <Header />
      <Reveal when="load" effect="up">
        <Hero
          eyebrow="New: invoices in 30 currencies"
          title="Get paid by customers anywhere, in their currency"
          description="Northwind sends invoices, takes payments and shows where your money comes from, for shops selling across borders."
          actions={
            <>
              <Link className={siteAction("primary", "lg")} href={`${base}/pricing`}>
                Start free
              </Link>
              <Link className={siteAction("secondary", "lg")} href={`${base}/landing#features`}>
                See how it works
              </Link>
            </>
          }
          note="Free for 14 days. No card needed."
          media={<img src={dashboardShot} alt="Northwind's dashboard" className="aspect-[16/10] w-full rounded-xl border border-line object-cover shadow-3" />}
        />
      </Reveal>
      <div className="mx-auto max-w-[1200px] px-4 pb-6 @3xl:px-6">
        <LogoCloud title="Trusted by shops in 40 countries" logos={["Okafor Textiles", "Hinoki", "Casa Verde", "Lumen", "Fjord & Co", "Tamarind"].map((name) => ({ name }))} />
      </div>
      <Section id="features" animate eyebrow="Product" title="Everything a shop needs to sell abroad" description="From the first invoice to the monthly report, in one place.">
        <Bento
          animate
          items={[
            { title: "Invoices that send themselves", description: "Recurring invoices go out on the day, with reminders when one is late.", media: <InvoicesShot rows={4} />, span: "wide" },
            { title: "See where money comes from", description: "Revenue by product, country and channel.", media: <RevenueBars />, tone: "brand" },
            { title: "Paid in their currency", description: "Thirty currencies in; yours out, at the day's rate.", media: <Currencies /> },
            { title: "Set up in an afternoon", description: "Import products and customers from a spreadsheet; nothing to install.", icon: <Zap /> },
            { title: "Your data stays yours", description: "Encrypted at rest, exportable at any time, deleted when you leave.", icon: <Lock /> },
          ]}
        />
      </Section>
      <Section tone="surface">
        <FeatureRows
          animate
          rows={[
            {
              eyebrow: "Invoices",
              title: "Send it once, get paid every month",
              description: "Set an invoice to repeat and Northwind sends it, takes the payment and chases the late ones.",
              points: ["Reminders at 3, 7 and 14 days", "Customers pay by card or bank transfer", "Receipts in their language"],
              media: <InvoicesShot />,
            },
            {
              eyebrow: "Reports",
              title: "Know which products carry the shop",
              description: "Revenue by product, country and channel, updated as orders come in, so the next decision isn't a guess.",
              points: ["Compare any two periods", "Export to a spreadsheet"],
              media: <img src={dashboardShot} alt="Northwind's revenue report" className="aspect-[16/10] w-full object-cover" />,
            },
          ]}
        />
      </Section>
      <Section animate>
        <Stats
          variant="band"
          stats={[
            { value: "40", label: "countries shops sell to" },
            { value: "30", label: "currencies customers pay in" },
            { value: "2/3", label: "fewer late invoices", note: "once reminders go out on their own" },
          ]}
        />
      </Section>
      <Section id="customers" animate align="center" eyebrow="Customers" title="Shops that sell everywhere">
        <Testimonials quotes={quotes} />
      </Section>
      <Section animate tone="surface" eyebrow="Getting started" title="Selling abroad by Friday">
        <Steps
          animate
          steps={[
            { title: "Bring your products", description: "Import products and customers from a spreadsheet." },
            { title: "Choose your currencies", description: "Pick which of the thirty your shop shows." },
            { title: "Send the first invoice", description: "It goes out in the customer's language and currency." },
          ]}
        />
      </Section>
      <Section animate align="center" eyebrow="Pricing" title="Pay as you grow" description="Start free; upgrade when you sell every day.">
        <PricingTable plans={plans} yearlyNote="Save 17%" onSelect={(p) => toast({ title: `${p} chosen`, description: "This is where sign-up would start.", tone: "success" })} />
      </Section>
      <Section animate align="center" eyebrow="Questions" title="What people ask first">
        <Faq items={faqs.slice(0, 4)} className="mx-auto w-full max-w-[760px] text-left" />
      </Section>
      <Cta />
      <Footer />
    </>
  );
}

export function Pricing() {
  return (
    <>
      <Header />
      <Section align="center" title="Simple prices, no cut of your sales" description="Every plan includes invoices, payments in 30 currencies and help from real people.">
        <PricingTable
          plans={[...plans, { name: "Enterprise", monthly: "Custom", description: "For large catalogues.", features: ["Everything in Scale, plus", "Single sign-on", "A named contact"], cta: "Talk to us" }]}
          yearlyNote="Save 17%"
          onSelect={(p) => toast({ title: `${p} chosen`, description: "This is where sign-up would start.", tone: "success" })}
        />
      </Section>
      <Section id="faq" tone="surface" align="center" title="Questions people ask">
        <Faq items={faqs} className="mx-auto" />
      </Section>
      <Cta />
      <Footer />
    </>
  );
}
