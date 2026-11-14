"use client";

// Website pieces: what a landing page, a product site or a shop's front is
// built from. Each sizes itself by its own width (@container), so it reads
// the same in a phone frame, a preview or a full page.

import { useState } from "react";

import type { SiteLink } from "./site-header";

import { cn, focusRing } from "../cx";
import { siteAction } from "./button-class";
import { Reveal, Stagger } from "./motion";

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
  /** The heading, then what's under it, ease in as the section is scrolled to. For public pages. */
  animate?: boolean;
  className?: string;
  /** Classes for its parts: inner (the width and padding), header (the heading block), eyebrow, title, description. */
  classNames?: { inner?: string; header?: string; eyebrow?: string; title?: string; description?: string };
}

/** A band of a landing page: a heading and what's under it, at the page's width. */
export function Section({ eyebrow, title, description, align = "start", tone = "ground", id, children, animate, className, classNames }: SectionProps) {
  const header =
    title || eyebrow || description ? (
      <div className={cn("flex max-w-[680px] flex-col gap-3", align === "center" && "mx-auto items-center text-center", classNames?.header)}>
        {eyebrow ? <span className={cn("text-label font-semibold text-brand", classNames?.eyebrow)}>{eyebrow}</span> : null}
        {title ? <h2 className={cn("m-0 text-balance font-display text-heading font-semibold tracking-[-0.02em] text-ink @2xl:text-display", classNames?.title)}>{title}</h2> : null}
        {description ? <p className={cn("m-0 text-pretty text-body-lg text-ink-2", classNames?.description)}>{description}</p> : null}
      </div>
    ) : null;
  return (
    <section id={id} className={cn("@container w-full scroll-mt-16", tone === "surface" && "border-y border-line bg-surface", className)}>
      <div className={cn("mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-14 @3xl:px-6 @3xl:py-20", classNames?.inner)}>
        {header && animate ? <Reveal>{header}</Reveal> : header}
        {children && animate ? <Reveal delay={120}>{children}</Reveal> : children}
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
  /** The features ease in one after another as the grid is scrolled to. */
  animate?: boolean;
  className?: string;
  /** Classes for its parts: item (each feature), icon, title, description. */
  classNames?: { item?: string; icon?: string; title?: string; description?: string };
}

const featureCols = { 2: "@2xl:grid-cols-2", 3: "@2xl:grid-cols-2 @4xl:grid-cols-3", 4: "@2xl:grid-cols-2 @4xl:grid-cols-4" };

/** What the product does, as short points with an icon each. */
export function FeatureGrid({ features, columns = 3, variant = "plain", animate, className, classNames }: FeatureGridProps) {
  const grid = cn("m-0 grid list-none gap-x-8 gap-y-8 p-0", variant === "cards" && "gap-4", featureCols[columns]);
  const items = features.map((f, i) => (
    <div key={i} className={cn("flex h-full flex-col gap-2", variant === "cards" && "rounded-lg border border-line bg-surface p-5 shadow-1", classNames?.item)}>
      {f.icon ? <span className={cn("mb-1 grid size-9 place-items-center rounded-md bg-brand-soft text-brand [&>svg]:size-[18px]", classNames?.icon)}>{f.icon}</span> : null}
      <h3 className={cn("m-0 font-display text-subtitle font-semibold text-ink", classNames?.title)}>{f.title}</h3>
      <p className={cn("m-0 text-body text-ink-2", classNames?.description)}>{f.description}</p>
    </div>
  ));
  return (
    <div className={cn("@container w-full", className)}>
      {animate ? (
        <Stagger as="ul" itemAs="li" className={grid} itemClassName="h-full">
          {items}
        </Stagger>
      ) : (
        <ul className={grid}>
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
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
  /** The quotes ease in one after another as they're scrolled to. */
  animate?: boolean;
  className?: string;
  /** Classes for its parts: card (each quote's card), quote (the words). */
  classNames?: { card?: string; quote?: string };
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
export function Testimonials({ quotes, variant = "grid", animate, className, classNames }: TestimonialsProps) {
  if (variant === "single" && quotes[0]) {
    const q = quotes[0];
    const one = (
      <figure className={cn("mx-auto flex max-w-[760px] flex-col gap-6 text-center", className)}>
        <blockquote className={cn("m-0 text-balance font-display text-title font-medium tracking-[-0.01em] text-ink @container", classNames?.quote)}>
          <span className="@2xl:text-heading">“{q.quote}”</span>
        </blockquote>
        <Person q={q} large />
      </figure>
    );
    return animate ? <Reveal>{one}</Reveal> : one;
  }
  const grid = "m-0 grid list-none gap-4 p-0 @2xl:grid-cols-2 @4xl:grid-cols-3";
  const cards = quotes.map((q, i) => (
    <figure key={i} className={cn("m-0 flex h-full flex-col justify-between gap-5 rounded-lg border border-line bg-surface p-5 shadow-1", classNames?.card)}>
      <blockquote className={cn("m-0 text-body-lg text-ink", classNames?.quote)}>“{q.quote}”</blockquote>
      <Person q={q} />
    </figure>
  ));
  return (
    <div className={cn("@container w-full", className)}>
      {animate ? (
        <Stagger as="ul" itemAs="li" className={grid} itemClassName="h-full">
          {cards}
        </Stagger>
      ) : (
        <ul className={grid}>
          {cards.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
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
  /** Classes for its parts: panel (the coloured block: its radius, padding, background), title, description, actions. */
  classNames?: { panel?: string; title?: string; description?: string; actions?: string };
}

/** The band near a page's end that asks for the one thing: sign up, book a call, shop now. */
export function CallToAction({ title, description, actions, tone = "brand", className, classNames }: CallToActionProps) {
  const brand = tone === "brand";
  return (
    <div className={cn("@container w-full", className)}>
      <div
        className={cn(
          "flex flex-col items-start gap-6 rounded-xl p-8 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:p-10",
          brand ? "bg-brand text-brand-ink" : "border border-line bg-surface shadow-1",
          classNames?.panel,
        )}
      >
        <div className="flex max-w-[560px] flex-col gap-2">
          <h2 className={cn("m-0 text-balance font-display text-heading font-semibold tracking-[-0.02em]", brand ? "text-brand-ink" : "text-ink", classNames?.title)}>{title}</h2>
          {description ? <p className={cn("m-0 text-body-lg", brand ? "text-brand-ink/80" : "text-ink-2", classNames?.description)}>{description}</p> : null}
        </div>
        {actions ? (
          <div
            className={cn(
              "flex flex-none flex-wrap gap-3",
              // On the brand colour the primary action inverts, so it still stands out.
              brand && "[&_.bg-brand]:bg-brand-ink [&_.bg-brand]:text-brand [&_.bg-brand:hover]:opacity-90",
              classNames?.actions,
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

/** Every way AuthLayout can arrange a sign-in page. */
export const authLayoutVariants = [
  "split",
  "split-reverse",
  "inset",
  "centered",
  "card",
  "card-brand",
  "compact",
  "topbar",
  "banner",
  "photo",
  "showcase",
  "frame",
] as const;
export type AuthLayoutVariant = (typeof authLayoutVariants)[number];

/** What the panel beside the form says. Give what the app really has; every part but the headline is optional. */
export interface AuthAside {
  /** The promise, in a few words: "Every order, customer and delivery in one place." */
  headline: React.ReactNode;
  /** A sentence under the headline. */
  body?: React.ReactNode;
  /** Two to four short reasons, each on a line with a tick: "Approvals in one queue". */
  points?: React.ReactNode[];
  /** Two or three real numbers: [{ value: "1,240", label: "requests a month" }]. Never made up. */
  stats?: { value: React.ReactNode; label: React.ReactNode }[];
  /** A real customer's or colleague's words. */
  quote?: Quote;
  /** A photograph's address, for the photo variant: the workplace, the product, the team. */
  image?: string;
  /** A piece of the product (a screenshot, a small live table or chart), for the showcase variant. */
  media?: React.ReactNode;
}

export interface AuthLayoutProps {
  /** The product's mark and name: what it is, before anything else. */
  brand: React.ReactNode;
  /** What this page does, short: "Sign in", "Create your account", "Choose a new password". */
  title: React.ReactNode;
  /** One line under the title: "Welcome back. Your courses are where you left them." */
  description?: React.ReactNode;
  /** The form: OAuth buttons, then Fields and the submit Button (block, size lg). */
  children: React.ReactNode;
  /** Under the form: "New here? Create an account". The topbar variant shows it top right. */
  footer?: React.ReactNode;
  /**
   * How the page is arranged.
   * With a panel (they need aside): split (panel left), split-reverse (panel right), inset (a rounded panel
   * set into the page), photo (a photograph with the promise over it; needs aside.image), showcase (the
   * promise over a piece of the product; needs aside.media), banner (a band across the top, the form on a
   * card over its edge).
   * Without one: centered (a plain column), card (the form on a raised card), card-brand (that card on the
   * sidebar's colour), compact (a small card with everything centred: staff tools and admin sign-ins),
   * topbar (a bar with the brand and the link to the other page), frame (a bordered sheet with the small
   * print in its foot).
   * A panel variant without aside draws centered.
   */
  variant?: AuthLayoutVariant;
  /** The panel's words and proof; see AuthAside. Leave it out for a page with the form alone. */
  aside?: AuthAside;
  /** Small print under everything: "By continuing you agree to the Terms and Privacy Policy." or "© 2026 Lumen". */
  legal?: React.ReactNode;
  /** A quiet link in the top right corner: "Need help?", a language picker, "Back to site". */
  help?: React.ReactNode;
  className?: string;
}

const panelVariants: AuthLayoutVariant[] = ["split", "split-reverse", "inset", "photo", "showcase", "banner"];

function AuthTick() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-[3px] size-4 shrink-0 text-brand">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The promise and its proof, as the panel variants share them. */
function AuthPromise({ aside, onPhoto }: { aside: AuthAside; onPhoto?: boolean }) {
  const strong = onPhoto ? "text-white" : "text-ink";
  const soft = onPhoto ? "text-white/80" : "text-ink-2";
  const quiet = onPhoto ? "text-white/70" : "text-ink-3";
  const rule = onPhoto ? "border-white/25" : "border-line";
  return (
    <>
      <div className="flex max-w-[460px] flex-col gap-4">
        <h2 className={cn("m-0 font-display text-display font-semibold tracking-[-0.025em] text-balance @6xl:text-display-xl", strong)}>{aside.headline}</h2>
        {aside.body ? <p className={cn("m-0 text-body-lg text-pretty", soft)}>{aside.body}</p> : null}
        {aside.points?.length ? (
          <ul className="m-0 mt-2 flex list-none flex-col gap-2.5 p-0">
            {aside.points.map((p, i) => (
              <li key={i} className={cn("flex gap-2.5 text-body", soft)}>
                <AuthTick />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {aside.stats?.length || aside.quote ? (
        <div className="flex max-w-[460px] flex-col gap-6">
          {aside.stats?.length ? (
            <dl className={cn("m-0 flex flex-wrap gap-x-10 gap-y-4 border-t pt-6", rule)}>
              {aside.stats.map((s, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <dd className={cn("m-0 font-display text-heading font-semibold tabular-nums", strong)}>{s.value}</dd>
                  <dt className={cn("text-label", quiet)}>{s.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
          {aside.quote ? (
            <figure className={cn("m-0 flex flex-col gap-3 border-t pt-6", rule)}>
              <blockquote className={cn("m-0 text-body-lg text-pretty", strong)}>“{aside.quote.quote}”</blockquote>
              <figcaption className={cn("text-label", quiet)}>
                <span className={cn("font-medium", soft)}>{aside.quote.name}</span>
                {aside.quote.role ? <> · {aside.quote.role}</> : null}
              </figcaption>
            </figure>
          ) : null}
        </div>
      ) : (
        <span />
      )}
    </>
  );
}

/**
 * The page around sign-in, sign-up and password forms, in twelve
 * arrangements: beside a panel with the product's promise, alone in a centred
 * column, on a card, under a top bar. Every auth page of an app uses the same
 * one, so they read as one product. On phones every arrangement is the form
 * with the brand over it.
 */
export function AuthLayout({ brand, title, description, children, footer, variant = "split", aside, legal, help, className }: AuthLayoutProps) {
  const look: AuthLayoutVariant =
    panelVariants.includes(variant) && (!aside || (variant === "photo" && !aside.image) || (variant === "showcase" && !aside.media))
      ? aside
        ? "split"
        : "centered"
      : variant;
  const brandRow = "flex items-center gap-2.5 font-display text-title font-semibold text-ink";
  const centred = look === "compact";
  const heading = (
    <div className={cn("flex flex-col gap-2", centred && "items-center text-center")}>
      <h1 className={cn("m-0 font-display font-semibold tracking-[-0.025em] text-ink", centred || look === "card" || look === "card-brand" || look === "banner" || look === "frame" ? "text-heading" : "text-display")}>{title}</h1>
      {description ? <p className="m-0 text-body text-ink-3">{description}</p> : null}
    </div>
  );
  const form = <div className="flex flex-col gap-4">{children}</div>;
  const foot = footer ? <div className={cn("text-label text-ink-3", centred && "text-center")}>{footer}</div> : null;
  const small = legal ? <p className="m-0 text-caption text-ink-4 text-pretty">{legal}</p> : null;
  const helpLink = help ? <div className="text-label text-ink-3">{help}</div> : null;

  // The form on a card: card, card-brand, compact, banner.
  if (look === "card" || look === "card-brand" || look === "compact" || look === "banner") {
    const onChrome = look === "card-brand";
    // chrome-scope paints its own background; these only want its text colours.
    const clear = onChrome ? { backgroundColor: "transparent" } : undefined;
    const card = (
      <div className={cn("w-full rounded-xl border border-line bg-surface shadow-2", look === "compact" ? "max-w-[360px] p-6 @xl:p-7" : "max-w-[440px] p-6 @xl:p-9")}>
        <div className="flex flex-col gap-6">
          {look === "compact" ? <div className={cn(brandRow, "justify-center")}>{brand}</div> : null}
          {heading}
          {form}
          {look === "compact" ? foot : null}
        </div>
      </div>
    );
    if (look === "banner" && aside) {
      return (
        <div className={cn("@container min-h-dvh bg-ground text-ink", className)}>
          <div className="chrome-scope bg-surface px-5 pt-6 pb-32 text-ink @xl:px-10 @xl:pt-8">
            <div className="mx-auto flex w-full max-w-[1080px] items-center justify-between gap-4">
              <div className={brandRow}>{brand}</div>
              {helpLink}
            </div>
            <div className="mx-auto mt-10 flex w-full max-w-[560px] flex-col items-center gap-3 text-center @xl:mt-14">
              <h2 className="m-0 font-display text-heading font-semibold tracking-[-0.02em] text-balance text-ink @xl:text-display">{aside.headline}</h2>
              {aside.body ? <p className="m-0 text-body-lg text-ink-2 text-pretty">{aside.body}</p> : null}
            </div>
          </div>
          <div className="-mt-20 flex flex-col items-center gap-5 px-5 pb-10">
            {card}
            {foot}
            {small ? <div className="max-w-[440px] text-center">{small}</div> : null}
          </div>
        </div>
      );
    }
    return (
      <div className={cn("@container flex min-h-dvh flex-col text-ink", onChrome ? "bg-chrome" : "bg-surface-2", className)}>
        {helpLink ? <div className={cn("flex justify-end px-5 pt-6 @xl:px-10", onChrome && "chrome-scope")} style={clear}>{helpLink}</div> : null}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-10">
          {look === "compact" ? null : <div className={cn(brandRow, onChrome && "text-chrome-ink")}>{brand}</div>}
          {card}
          {look === "compact" ? null : <div className={onChrome ? "chrome-scope" : undefined} style={clear}>{foot}</div>}
          {small ? <div className={cn("max-w-[440px] text-center", onChrome && "chrome-scope")} style={clear}>{small}</div> : null}
        </div>
      </div>
    );
  }

  // A bordered sheet: the brand in its head, the small print in its foot.
  if (look === "frame") {
    return (
      <div className={cn("@container flex min-h-dvh flex-col items-center justify-center gap-6 bg-ground px-5 py-10 text-ink", className)}>
        <div className="w-full max-w-[460px] overflow-hidden rounded-xl border border-line-strong bg-surface">
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 @xl:px-8">
            <div className={cn(brandRow, "text-subtitle")}>{brand}</div>
            {helpLink}
          </div>
          <div className="flex flex-col gap-6 px-6 py-7 @xl:px-8 @xl:py-9">
            {heading}
            {form}
          </div>
          {foot || small ? (
            <div className="flex flex-col gap-2 border-t border-line bg-surface-2 px-6 py-4 @xl:px-8">
              {foot}
              {small}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // The form alone: centered, or under a bar that holds the brand and the way to the other page.
  if (look === "centered" || look === "topbar") {
    const bar = look === "topbar";
    return (
      <div className={cn("@container flex min-h-dvh flex-col bg-ground text-ink", className)}>
        <header className={cn("flex items-center justify-between gap-4 px-5 @xl:px-10", bar ? "h-16 border-b border-line bg-surface" : "pt-8")}>
          <div className={brandRow}>{brand}</div>
          <div className="flex items-center gap-5">
            {bar ? foot : null}
            {helpLink}
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center gap-7 px-5 py-10 @xl:px-0">
          {heading}
          {form}
          {bar ? null : foot}
        </main>
        {small ? <footer className="px-5 pb-8 text-center @xl:px-10">{small}</footer> : null}
      </div>
    );
  }

  // Beside a panel: split, split-reverse, inset, photo, showcase.
  const panel = aside as AuthAside;
  const reverse = look === "split-reverse" || look === "showcase";
  const inset = look === "inset";
  return (
    <div className={cn("@container min-h-dvh bg-ground text-ink", className)}>
      <div className={cn("grid min-h-[inherit]", reverse ? "@4xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]" : "@4xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]", inset && "@4xl:p-3")}>
        <aside
          className={cn(
            "relative hidden flex-col justify-between gap-10 overflow-hidden p-10 @4xl:flex @6xl:p-14",
            look === "photo" ? "bg-black text-white" : look === "showcase" ? "border-l border-line bg-surface-2 pr-0 pb-0 text-ink @6xl:pr-0 @6xl:pb-0" : "chrome-scope bg-surface text-ink",
            inset && "rounded-xl",
            reverse && "order-2",
          )}
        >
          {look === "photo" ? (
            <>
              <img src={panel.image} alt="" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
            </>
          ) : null}
          <div className={cn("relative flex items-center gap-2.5 font-display text-title font-semibold", reverse && "invisible")}>{brand}</div>
          {look === "showcase" ? (
            <>
              <div className="flex max-w-[460px] flex-col gap-4 pr-10 @6xl:pr-14">
                <h2 className="m-0 font-display text-heading font-semibold tracking-[-0.02em] text-balance text-ink @6xl:text-display">{panel.headline}</h2>
                {panel.body ? <p className="m-0 text-body-lg text-ink-2 text-pretty">{panel.body}</p> : null}
              </div>
              <div className="overflow-hidden rounded-tl-xl border-t border-l border-line-strong bg-surface shadow-3">{panel.media}</div>
            </>
          ) : (
            <div className="relative flex flex-1 flex-col justify-between gap-10">
              <span />
              <AuthPromise aside={panel} onPhoto={look === "photo"} />
            </div>
          )}
        </aside>
        <main className={cn("flex flex-col px-5 py-8 @xl:px-10", reverse && "order-1")}>
          <div className="flex items-center justify-between gap-4">
            <div className={cn(brandRow, !reverse && "@4xl:invisible")}>{brand}</div>
            {helpLink}
          </div>
          <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center gap-7 py-10">
            {heading}
            {form}
            {foot}
          </div>
          {small ? <div className="mx-auto w-full max-w-[380px]">{small}</div> : null}
        </main>
      </div>
    </div>
  );
}

export interface MobileBarProps {
  /** The one action that should never be out of reach on a phone: Add to cart and the price, Book a table, Start free. */
  children: React.ReactNode;
  /** A line beside or over the action: the price, "Free delivery over $50". */
  note?: React.ReactNode;
  className?: string;
}

/**
 * A bar fixed to the bottom of the screen on phones only, for the one action a
 * visitor should always reach (Add to cart, Book). On wider screens it isn't
 * there at all, so the action must also be on the page. It leaves room for
 * itself, so it never covers the page's end.
 */
export function MobileBar({ children, note, className }: MobileBarProps) {
  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-surface px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] shadow-3 md:hidden",
          className,
        )}
      >
        {note ? <div className="min-w-0 flex-1 text-small text-ink-2">{note}</div> : null}
        <div className={cn("flex gap-2", note ? "flex-none" : "flex-1 [&>*]:flex-1")}>{children}</div>
      </div>
    </>
  );
}

/** "or" between the OAuth buttons and the email form. */
export function AuthDivider({ children = "or" }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-caption uppercase tracking-[0.08em] text-ink-4" role="separator">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
