"use client";

// SiteHeader: a website's top bar, in 21 looks. Every variant takes the same
// brand, links and actions; on a phone the links fold into a menu.

import { useState } from "react";

import { cn, focusRing } from "../cx";
import { CloseGlyph, MenuGlyph } from "./icons";

export const siteHeaderVariants = [
  "classic",
  "centered",
  "brand-center",
  "stacked",
  "floating",
  "floating-card",
  "transparent",
  "glass",
  "inverted",
  "brand",
  "minimal",
  "fullscreen",
  "split",
  "underline",
  "pills",
  "boxed",
  "announcement",
  "utility",
  "search",
  "tall",
  "compact",
] as const;

export type SiteHeaderVariant = (typeof siteHeaderVariants)[number];

export interface SiteLink {
  label: React.ReactNode;
  href: string;
}

export interface SiteHeaderProps {
  /** The logo, or the name: what links home. */
  brand: React.ReactNode;
  /** Where brand links to. */
  brandHref?: string;
  /** Four to six links: Product, Pricing, Customers, Blog. */
  links?: SiteLink[];
  /** At the right: "Sign in" and the one main action ("Start free"). */
  actions?: React.ReactNode;
  /**
   * classic: brand, links, actions. centered: links in the middle. brand-center: brand in the middle.
   * stacked: brand on top, links under. floating / floating-card: a pill or card floating off the
   * edges. transparent: no background, over a hero. glass: frosted. inverted: on the ink colour.
   * brand: on the brand colour. minimal: brand and a menu button only. fullscreen: the menu opens
   * over the whole page. split: links pushed right beside the actions. underline: the current link
   * underlined. pills: links in a track, the current one raised. boxed: every part in a ruled cell.
   * announcement: a strip of news above (announcement). utility: a thin row of small links above
   * (utility). search: a search field in the middle (search). tall and compact: more or less height.
   */
  variant?: SiteHeaderVariant;
  /** The href of the page they're on; its link is marked. */
  current?: string;
  /** For announcement: one line of news over the bar. */
  announcement?: React.ReactNode;
  /** For utility: small links over the bar (Help, Contact, a language). */
  utility?: SiteLink[];
  /** For search: the field's placeholder and what happens on Enter. */
  search?: { placeholder?: string; onSearch?: (query: string) => void };
  /** Stays at the top as the page scrolls. */
  sticky?: boolean;
  /** What renders links, from a client component only: Next's Link, say, so moving between pages keeps state. A server page can't pass a component here (Next refuses it), so leave it out there: plain <a> links work. An <a> by default. */
  as?: React.ElementType;
  className?: string;
}

type On = "default" | "inverse" | "brand";

const tone: Record<On, { link: string; active: string; muted: string; fix: string }> = {
  default: { link: "text-ink-2 hover:bg-surface-2 hover:text-ink", active: "text-ink", muted: "text-ink-3", fix: "" },
  inverse: {
    link: "text-ground/70 hover:bg-ground/10 hover:text-ground",
    active: "text-ground",
    muted: "text-ground/60",
    fix: "[&_.bg-brand]:bg-ground [&_.bg-brand]:text-ink [&_.text-ink-2]:text-ground/80 [&_.text-ink-2:hover]:bg-ground/10 [&_.text-ink-2:hover]:text-ground",
  },
  brand: {
    link: "text-brand-ink/80 hover:bg-brand-ink/10 hover:text-brand-ink",
    active: "text-brand-ink",
    muted: "text-brand-ink/70",
    fix: "[&_.bg-brand]:bg-brand-ink [&_.bg-brand]:text-brand [&_.text-ink-2]:text-brand-ink/85 [&_.text-ink-2:hover]:bg-brand-ink/10",
  },
};

const SearchGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** A website's top bar: the brand, the main links and one call to action. On a phone, the links fold into a menu. */
export function SiteHeader({
  brand,
  brandHref = "/",
  links = [],
  actions,
  variant = "classic",
  current,
  announcement,
  utility,
  search,
  sticky,
  as: A = "a",
  className,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const v = variant;
  const on: On = v === "inverted" ? "inverse" : v === "brand" ? "brand" : "default";
  const t = tone[on];
  const menuOnly = v === "minimal" || v === "fullscreen";
  const height = v === "tall" ? "h-20" : v === "compact" ? "h-11" : "h-14";
  const floating = v === "floating" || v === "floating-card";

  const Brand = (
    <A href={brandHref} className={cn("flex flex-none items-center gap-2 rounded-sm font-display font-semibold tracking-[-0.01em] no-underline", v === "tall" ? "text-title" : v === "compact" ? "text-body" : "text-subtitle", on === "default" ? "text-ink" : t.active, focusRing)}>
      {brand}
    </A>
  );

  const linkClass = (active: boolean) =>
    cn(
      "whitespace-nowrap no-underline transition-colors",
      v === "tall" ? "text-body-lg" : v === "compact" ? "text-small" : "text-body",
      v === "underline"
        ? cn("flex h-full items-center border-b-2 px-1 pt-0.5", active ? "border-current font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink")
        : v === "pills"
          ? cn("rounded-full px-3 py-1", active ? "bg-surface font-medium text-ink shadow-1" : "text-ink-2 hover:text-ink")
          : v === "boxed"
            ? cn("flex h-full items-center border-l border-line px-5", active ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink")
            : cn("rounded-md px-3 py-1.5", t.link, active && cn("font-medium", t.active)),
      focusRing,
    );

  const Links = (
    <nav
      aria-label="Main"
      className={cn(
        "hidden items-center @3xl:flex",
        v === "underline" || v === "boxed" ? "h-full gap-5 self-stretch" : "gap-1",
        v === "underline" && "gap-6",
        v === "boxed" && "gap-0",
        v === "pills" && "rounded-full bg-surface-2 p-1",
        v === "search" && "@3xl:hidden @5xl:flex",
      )}
    >
      {links.map((l, i) => (
        <A key={i} href={l.href} aria-current={current === l.href ? "page" : undefined} className={linkClass(current === l.href)}>
          {l.label}
        </A>
      ))}
    </nav>
  );

  const Actions = actions ? <div className={cn("hidden flex-none items-center gap-2 @3xl:flex", t.fix, v === "boxed" && "h-full border-l border-line pl-4")}>{actions}</div> : null;

  const MenuButton =
    links.length || actions ? (
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        className={cn(
          "relative z-10 inline-flex size-9 flex-none cursor-pointer items-center justify-center rounded-md",
          on === "default" ? "text-ink-2 hover:bg-surface-2" : t.link,
          !menuOnly && "@3xl:hidden",
          focusRing,
        )}
      >
        {open ? <CloseGlyph size={18} /> : <MenuGlyph size={18} />}
      </button>
    ) : null;

  const Search = search ? (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        search.onSearch?.(query);
      }}
      className="hidden min-w-0 max-w-[420px] flex-1 @3xl:flex"
    >
      <label className="flex h-9 w-full items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 text-ink-3 focus-within:border-focus focus-within:outline-1 focus-within:outline-offset-[-1px] focus-within:outline-focus">
        <SearchGlyph />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={search.placeholder ?? "Search"}
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none! placeholder:text-ink-4"
        />
      </label>
    </form>
  ) : null;

  // The bar's row, by variant.
  let row: React.ReactNode;
  if (v === "centered" || v === "pills") {
    row = (
      <div className={cn("grid items-center gap-4", height, "grid-cols-[1fr_auto] @3xl:grid-cols-[1fr_auto_1fr]")}>
        {Brand}
        {Links}
        <div className="flex justify-end gap-2">
          {Actions}
          {MenuButton}
        </div>
      </div>
    );
  } else if (v === "brand-center") {
    row = (
      <div className={cn("grid items-center gap-4", height, "grid-cols-[1fr_auto_1fr]")}>
        <div className="flex items-center">
          {Links}
          {MenuButton}
        </div>
        {Brand}
        <div className="flex justify-end">{Actions}</div>
      </div>
    );
  } else if (v === "stacked") {
    row = (
      <>
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <span />
          {Brand}
          <div className="flex justify-end gap-2">
            {Actions}
            {MenuButton}
          </div>
        </div>
        <div className="hidden h-11 items-center justify-center border-t border-line @3xl:flex">{Links}</div>
      </>
    );
  } else if (v === "boxed") {
    row = (
      <div className={cn("flex items-stretch", height)}>
        <div className="flex items-center pr-5">{Brand}</div>
        {Links}
        <div className="hidden flex-1 border-l border-line @3xl:block" />
        {Actions}
        <div className="ml-auto flex items-center">{MenuButton}</div>
      </div>
    );
  } else if (menuOnly) {
    row = (
      <div className={cn("flex items-center gap-4", height)}>
        {Brand}
        <div className="ml-auto flex items-center gap-2">
          {v === "minimal" ? Actions : null}
          {MenuButton}
        </div>
      </div>
    );
  } else {
    // classic, split, underline, search, tall, compact, floating, transparent, glass, inverted, brand, announcement, utility
    row = (
      <div className={cn("flex items-center gap-6", height, v === "underline" && "items-stretch [&>a]:self-center")}>
        {Brand}
        {v === "search" ? Search : null}
        {v === "split" || v === "search" ? <span className="flex-1" /> : null}
        <div className={cn("flex min-w-0 items-center", v === "split" || v === "search" ? "" : "flex-1", v === "underline" && "self-stretch")}>{Links}</div>
        {v === "split" && actions ? <span aria-hidden="true" className="hidden h-5 w-px bg-line @3xl:block" /> : null}
        <div className={cn("ml-auto flex items-center gap-2", v === "underline" && "self-center")}>
          {Actions}
          {MenuButton}
        </div>
      </div>
    );
  }

  const shell = cn(
    "@container z-30 w-full",
    sticky && "sticky top-0",
    v === "inverted" && "bg-ink",
    v === "brand" && "bg-brand",
    v === "transparent" && "bg-transparent",
    v === "glass" && "bg-surface/60 shadow-1 backdrop-blur-xl backdrop-saturate-150",
    floating && "bg-transparent px-3 pt-3",
    // The fullscreen menu is fixed to the page, so this bar can't blur (a blur would hold it inside).
    v === "fullscreen" && "border-b border-line bg-ground",
    !["inverted", "brand", "transparent", "glass", "fullscreen"].includes(v) && !floating && "border-b border-line bg-ground/85 backdrop-blur-md",
    className,
  );
  const inner = cn(
    "mx-auto max-w-[1200px]",
    v === "boxed" ? "border-x border-line pl-4 @3xl:pl-6" : "px-4 @3xl:px-6",
    v === "floating" && "max-w-[1080px] rounded-full border border-line bg-surface/85 pl-5 pr-2 shadow-2 backdrop-blur-md @3xl:pl-6 @3xl:pr-2",
    v === "floating-card" && "max-w-[1140px] rounded-xl border border-line bg-surface/90 shadow-2 backdrop-blur-md",
  );

  const panelLink = cn("rounded-md px-2 py-2.5 text-body-lg no-underline", on === "default" ? "text-ink hover:bg-surface-2" : t.link, focusRing);

  return (
    <header className={shell}>
      {v === "announcement" && announcement ? <div className="flex min-h-9 items-center justify-center bg-ink px-4 py-1.5 text-center text-small text-ground">{announcement}</div> : null}
      {v === "utility" && utility?.length ? (
        <div className="hidden border-b border-line @3xl:block">
          <div className="mx-auto flex h-8 max-w-[1200px] items-center justify-end gap-5 px-6">
            {utility.map((l, i) => (
              <A key={i} href={l.href} className={cn("text-caption text-ink-3 no-underline hover:text-ink", focusRing)}>
                {l.label}
              </A>
            ))}
          </div>
        </div>
      ) : null}
      <div className={inner}>{row}</div>
      {open && v === "fullscreen" ? (
        <div className="fixed inset-0 z-40 flex animate-fade-in flex-col bg-ground">
          <div className="flex h-14 flex-none items-center justify-between px-4 @3xl:px-6">
            {Brand}
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className={cn("inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-ink-2 hover:bg-surface-2", focusRing)}>
              <CloseGlyph size={20} />
            </button>
          </div>
          <nav aria-label="Main" className="flex flex-1 flex-col justify-center gap-1 px-6 @3xl:px-16">
            {links.map((l, i) => (
              <A
                key={i}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 50}ms` }}
                className={cn("animate-rise font-display text-display font-semibold tracking-[-0.03em] text-ink no-underline [animation-fill-mode:both] hover:text-brand @3xl:text-display-xl", focusRing)}
              >
                {l.label}
              </A>
            ))}
          </nav>
          {actions ? <div className="flex flex-none flex-wrap gap-2 border-t border-line p-6">{actions}</div> : null}
        </div>
      ) : open ? (
        <div className={cn("flex animate-rise flex-col gap-1 px-4 pb-4 pt-2", v !== "minimal" && "@3xl:hidden", floating ? "mx-auto mt-2 max-w-[1080px] rounded-xl border border-line bg-surface shadow-2" : "border-t border-line", on !== "default" && "border-transparent")}>
          {search && v === "search" ? (
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                search.onSearch?.(query);
              }}
              className="mb-2"
            >
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={search.placeholder ?? "Search"} aria-label="Search" className="h-10 w-full rounded-md border border-line bg-surface-2 px-3 text-body text-ink outline-none focus:border-focus" />
            </form>
          ) : null}
          {links.map((l, i) => (
            <A key={i} href={l.href} onClick={() => setOpen(false)} aria-current={current === l.href ? "page" : undefined} className={cn(panelLink, current === l.href && "font-medium")}>
              {l.label}
            </A>
          ))}
          {actions ? <div className={cn("mt-2 flex flex-col gap-2 [&>*]:w-full", t.fix)}>{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
