"use client";

// Website pieces: what a landing page, a product site or a shop's front is
// built from. Each sizes itself by its own width (@container), so it reads
// the same in a phone frame, a preview or a full page.

import { useState } from "react";

import type { SiteLink } from "./site-header";

import { cn, focusRing } from "../cx";

/** A link or button styled like Button, for websites where most actions go somewhere. */
export function siteAction(variant: "primary" | "secondary" | "ghost" = "primary", size: "md" | "lg" = "md") {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium no-underline transition-colors",
    size === "lg" ? "h-11 px-5 text-body-lg" : "h-9 px-4 text-body",
    variant === "primary" && "bg-brand text-brand-ink shadow-1 hover:bg-brand-hover",
    variant === "secondary" && "border border-line-strong bg-surface text-ink shadow-1 hover:bg-surface-2",
    variant === "ghost" && "text-ink-2 hover:bg-surface-2 hover:text-ink",
    focusRing,
  );
}

export interface SectionProps {
  /** A word or two over the title: "Features", "Pricing". */
  eyebrow?: React.ReactNode;
  /** The section's point, as a heading. */
  title?: React.ReactNode;
  /** A sentence under the title. */
  description?: React.ReactNode;
  /** start: heading left. center: heading centred, for pricing and testimonials. */
  align?: "start" | "center";
  /** surface: on the raised colour, to set one section apart from the next. */
  tone?: "ground" | "surface";
  /** The anchor id, for links from the header ("#pricing"). */
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

/** A band of a landing page: a heading and what's under it, at the page's width. */
export function Section({ eyebrow, title, description, align = "start", tone = "ground", id, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("@container w-full scroll-mt-16", tone === "surface" && "border-y border-line bg-surface", className)}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-14 @3xl:px-6 @3xl:py-20">
        {title || eyebrow || description ? (
          <div className={cn("flex max-w-[680px] flex-col gap-3", align === "center" && "mx-auto items-center text-center")}>
            {eyebrow ? <span className="text-label font-semibold text-brand">{eyebrow}</span> : null}
            {title ? <h2 className="m-0 text-balance font-display text-heading font-semibold tracking-[-0.02em] text-ink @2xl:text-display">{title}</h2> : null}
            {description ? <p className="m-0 text-pretty text-body-lg text-ink-2">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export interface Feature {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}

export interface FeatureGridProps {
  /** Three, four or six is best: { icon, title, description }. */
  features: Feature[];
  /** Columns on a wide screen; fewer on a narrow one. */
  columns?: 2 | 3 | 4;
  /** plain: icon and text on the ground. cards: each in a raised card. */
  variant?: "plain" | "cards";
  className?: string;
}

const featureCols = { 2: "@2xl:grid-cols-2", 3: "@2xl:grid-cols-2 @4xl:grid-cols-3", 4: "@2xl:grid-cols-2 @4xl:grid-cols-4" };

/** What the product does, as short points with an icon each. */
export function FeatureGrid({ features, columns = 3, variant = "plain", className }: FeatureGridProps) {
  return (
    <div className={cn("@container w-full", className)}>
      <ul className={cn("m-0 grid list-none gap-x-8 gap-y-8 p-0", variant === "cards" && "gap-4", featureCols[columns])}>
        {features.map((f, i) => (
          <li key={i} className={cn("flex flex-col gap-2", variant === "cards" && "rounded-lg border border-line bg-surface p-5 shadow-1")}>
            {f.icon ? <span className="mb-1 grid size-9 place-items-center rounded-md bg-brand-soft text-brand [&>svg]:size-[18px]">{f.icon}</span> : null}
            <h3 className="m-0 font-display text-subtitle font-semibold text-ink">{f.title}</h3>
            <p className="m-0 text-body text-ink-2">{f.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface LogoCloudProps {
  /** A line over the logos: "Trusted by teams in 40 countries". */
  title?: React.ReactNode;
  /** The logos: images or wordmarks, shown greyed so none shouts. */
  logos: { name: string; logo?: React.ReactNode }[];
  className?: string;
}

/** Who uses it, as a quiet row of logos. */
export function LogoCloud({ title, logos, className }: LogoCloudProps) {
  return (
    <div className={cn("@container flex w-full flex-col items-center gap-6", className)}>
      {title ? <p className="m-0 text-center text-label text-ink-3">{title}</p> : null}
      <ul className="m-0 grid w-full list-none grid-cols-2 items-center gap-x-8 gap-y-6 p-0 @xl:grid-cols-3 @3xl:flex @3xl:flex-wrap @3xl:justify-center @3xl:gap-x-12">
        {logos.map((l) => (
          <li key={l.name} className="flex items-center justify-center font-display text-title font-semibold tracking-[-0.02em] text-ink-3 opacity-80 grayscale transition-opacity hover:opacity-100 [&_img]:max-h-7 [&_svg]:max-h-7">
            {l.logo ?? l.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface Quote {
  quote: React.ReactNode;
  name: string;
  /** Their role and company: "Owner, Casa Verde". */
  role?: React.ReactNode;
  /** Their photo; initials show without one. */
  avatar?: string;
}

export interface TestimonialsProps {
  quotes: Quote[];
  /** grid: cards in columns. single: one large quote, centred. */
  variant?: "grid" | "single";
  className?: string;
}

function Person({ q, large }: { q: Quote; large?: boolean }) {
  const initials = q.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <figcaption className={cn("flex items-center gap-3", large && "justify-center")}>
      {q.avatar ? (
        <img src={q.avatar} alt="" className={cn("rounded-full object-cover", large ? "size-11" : "size-9")} />
      ) : (
        <span className={cn("grid place-items-center rounded-full bg-brand-soft font-semibold text-ink-2", large ? "size-11 text-label" : "size-9 text-caption")}>{initials}</span>
      )}
      <span className="flex flex-col text-left">
        <span className="text-label font-semibold text-ink">{q.name}</span>
        {q.role ? <span className="text-small text-ink-3">{q.role}</span> : null}
      </span>
    </figcaption>
  );
}

/** What customers say, in their words, with their name and role. */
export function Testimonials({ quotes, variant = "grid", className }: TestimonialsProps) {
  if (variant === "single" && quotes[0]) {
    const q = quotes[0];
    return (
      <figure className={cn("mx-auto flex max-w-[760px] flex-col gap-6 text-center", className)}>
        <blockquote className="m-0 text-balance font-display text-title font-medium tracking-[-0.01em] text-ink @container">
          <span className="@2xl:text-heading">“{q.quote}”</span>
        </blockquote>
        <Person q={q} large />
      </figure>
    );
  }
  return (
    <div className={cn("@container w-full", className)}>
      <ul className="m-0 grid list-none gap-4 p-0 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {quotes.map((q, i) => (
          <li key={i}>
            <figure className="m-0 flex h-full flex-col justify-between gap-5 rounded-lg border border-line bg-surface p-5 shadow-1">
              <blockquote className="m-0 text-body-lg text-ink">“{q.quote}”</blockquote>
              <Person q={q} />
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface FaqProps {
  /** The questions, in the order people ask them. */
  items: { question: React.ReactNode; answer: React.ReactNode }[];
  /** Only one answer open at a time. */
  single?: boolean;
  className?: string;
}

/** Common questions; each opens to its answer. */
export function Faq({ items, single, className }: FaqProps) {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : single ? [i] : [...o, i]));
  return (
    <ul className={cn("m-0 flex w-full max-w-[760px] list-none flex-col divide-y divide-line border-y border-line p-0", className)}>
      {items.map((it, i) => {
        const on = open.includes(i);
        return (
          <li key={i}>
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => toggle(i)}
                className={cn("flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-subtitle font-medium text-ink", focusRing)}
              >
                {it.question}
                <span aria-hidden="true" className={cn("relative size-4 flex-none text-ink-3 transition-transform duration-200", on && "rotate-45")}>
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current" />
                </span>
              </button>
            </h3>
            <div className={cn("grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <div className="pb-5 pr-8 text-body text-ink-2">{it.answer}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export interface CallToActionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The main action, and at most one more. */
  actions?: React.ReactNode;
  /** brand: on the brand colour, the page's loudest band. surface: a quiet raised card. */
  tone?: "brand" | "surface";
  className?: string;
}

/** The band near a page's end that asks for the one thing: sign up, book a call, shop now. */
export function CallToAction({ title, description, actions, tone = "brand", className }: CallToActionProps) {
  const brand = tone === "brand";
  return (
    <div className={cn("@container w-full", className)}>
      <div
        className={cn(
          "flex flex-col items-start gap-6 rounded-xl p-8 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:p-10",
          brand ? "bg-brand text-brand-ink" : "border border-line bg-surface shadow-1",
        )}
      >
        <div className="flex max-w-[560px] flex-col gap-2">
          <h2 className={cn("m-0 text-balance font-display text-heading font-semibold tracking-[-0.02em]", brand ? "text-brand-ink" : "text-ink")}>{title}</h2>
          {description ? <p className={cn("m-0 text-body-lg", brand ? "text-brand-ink/80" : "text-ink-2")}>{description}</p> : null}
        </div>
        {actions ? (
          <div
            className={cn(
              "flex flex-none flex-wrap gap-3",
              // On the brand colour the primary action inverts, so it still stands out.
              brand && "[&_.bg-brand]:bg-brand-ink [&_.bg-brand]:text-brand [&_.bg-brand:hover]:opacity-90",
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export interface SiteFooterProps {
  /** The logo or name, over a line about the company. */
  brand?: React.ReactNode;
  /** One line under the brand. */
  tagline?: React.ReactNode;
  /** Columns of links: { title, links }. */
  columns?: { title: React.ReactNode; links: SiteLink[] }[];
  /** The bottom line: copyright, legal links. */
  legal?: React.ReactNode;
  /** What renders links, from a client component only: Next's Link, say, so moving between pages keeps state. A server page can't pass a component here (Next refuses it), so leave it out there: plain <a> links work. An <a> by default. */
  as?: React.ElementType;
  className?: string;
}

/** The bottom of every page: the brand, links by topic, and the legal line. */
export function SiteFooter({ brand, tagline, columns = [], legal, as: A = "a", className }: SiteFooterProps) {
  return (
    <footer className={cn("@container w-full border-t border-line bg-surface", className)}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-12 @3xl:px-6">
        <div className="grid gap-10 @3xl:grid-cols-[1.4fr_repeat(var(--cols),1fr)]" style={{ "--cols": columns.length || 1 } as React.CSSProperties}>
          {brand || tagline ? (
            <div className="flex max-w-[300px] flex-col gap-3">
              {brand ? <div className="flex items-center gap-2 font-display text-subtitle font-semibold text-ink">{brand}</div> : null}
              {tagline ? <p className="m-0 text-body text-ink-3">{tagline}</p> : null}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-8 @xl:grid-cols-3 @3xl:contents">
            {columns.map((c, i) => (
              <div key={i} className="flex flex-col gap-3">
                <h3 className="m-0 text-label font-semibold text-ink">{c.title}</h3>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {c.links.map((l, j) => (
                    <li key={j}>
                      <A href={l.href} className={cn("rounded-sm text-body text-ink-3 no-underline hover:text-ink", focusRing)}>
                        {l.label}
                      </A>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {legal ? <div className="border-t border-line pt-6 text-small text-ink-3">{legal}</div> : null}
      </div>
    </footer>
  );
}
