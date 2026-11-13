"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Globe2, Lock, Receipt, Sparkles, Zap } from "lucide-react";
import { CallToAction, Faq, FeatureGrid, Hero, LogoCloud, PricingTable, Section, SiteFooter, SiteHeader, Testimonials, siteAction, toast } from "@syvna/ui";

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

const features = [
  { icon: <Globe2 />, title: "Paid in their currency", description: "Customers pay in any of 30 currencies; you're paid out in yours, at the day's rate." },
  { icon: <Receipt />, title: "Invoices that send themselves", description: "Recurring invoices go out on the day, with reminders when one is late." },
  { icon: <BarChart3 />, title: "See where money comes from", description: "Revenue by product, country and channel, updated as orders come in." },
  { icon: <Zap />, title: "Set up in an afternoon", description: "Import products and customers from a spreadsheet; nothing to install." },
  { icon: <Lock />, title: "Your data stays yours", description: "Encrypted at rest, exportable at any time, deleted when you leave." },
  { icon: <Sparkles />, title: "Help from real people", description: "Answers within the hour on weekdays, from people who know the product." },
];

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

export function Landing() {
  return (
    <>
      <Header />
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
      <div className="mx-auto max-w-[1200px] px-4 pb-6 @3xl:px-6">
        <LogoCloud title="Trusted by shops in 40 countries" logos={["Okafor Textiles", "Hinoki", "Casa Verde", "Lumen", "Fjord & Co", "Tamarind"].map((name) => ({ name }))} />
      </div>
      <Section id="features" eyebrow="Features" title="Everything a shop needs to sell abroad" description="From the first invoice to the monthly report, in one place.">
        <FeatureGrid features={features} />
      </Section>
      <Section id="customers" tone="surface" align="center" eyebrow="Customers" title="Shops that sell everywhere">
        <Testimonials quotes={quotes} />
      </Section>
      <Section align="center" eyebrow="Pricing" title="Pay as you grow" description="Start free; upgrade when you sell every day.">
        <PricingTable plans={plans} yearlyNote="Save 17%" onSelect={(p) => toast({ title: `${p} chosen`, description: "This is where sign-up would start.", tone: "success" })} />
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
