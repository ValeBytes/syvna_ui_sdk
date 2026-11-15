"use client";

// SiteHeader: a website's top bar, in 25 looks. Every variant takes the same
// brand, links and actions; on a phone the links fold into a menu.

import { useEffect, useRef, useState } from "react";

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
  "track",
  "spotlight",
  "editorial",
  "progress",
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
   * track: links in a track where a highlight slides to the one pointed at. spotlight: the other
   * links dim while one is pointed at. editorial: numbered small capitals. progress: a line in the
   * brand colour along the bottom fills as the page is read.
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
  /** Classes for its parts: inner (the row: its width and padding), brand, link (each main link), actions. className is the bar itself. */
  classNames?: { inner?: string; brand?: string; link?: string; actions?: string };
}

type On = "default" | "inverse" | "brand";

const tone: Record<On, { link: string; active: string; muted: string; fix: string }> = {
  default: { link: "text-ink-2 hover:text-ink", active: "text-ink", muted: "text-ink-3", fix: "" },
  inverse: {
    link: "text-ground/70 hover:text-ground",
    active: "text-ground",
    muted: "text-ground/60",
    fix: "[&_.bg-brand]:bg-ground [&_.bg-brand]:text-ink [&_.text-ink-2]:text-ground/80 [&_.text-ink-2:hover]:bg-ground/10 [&_.text-ink-2:hover]:text-ground",
  },
  brand: {
    link: "text-brand-ink/80 hover:text-brand-ink",
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

// What the page scrolls in: the window, or a scrolling box around the bar (a
// preview frame, a page inside a panel).
type Scroller = HTMLElement | Window;
function scrollerOf(el: HTMLElement | null): Scroller {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return window;
}
const isWin = (s: Scroller): s is Window => s === window;
const scrolledBy = (s: Scroller) => (isWin(s) ? window.scrollY : s.scrollTop);
const viewOf = (s: Scroller) => (isWin(s) ? { top: 0, height: window.innerHeight, full: document.documentElement.scrollHeight } : { top: s.getBoundingClientRect().top, height: s.clientHeight, full: s.scrollHeight });

// The section in view, for links to sections of the same page (#pricing): a
// landing page's links then say where the reader is without a current.
function useSectionInView(hrefs: string[], on: boolean, head: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState<string>();
  const key = hrefs.join("|");
  useEffect(() => {
    if (!on) return;
    const sections = hrefs
      .filter((h) => h.startsWith("#") && h.length > 1)
      .map((h) => document.getElementById(decodeURIComponent(h.slice(1))))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    const box = scrollerOf(head.current);
    const read = () => {
      const view = viewOf(box);
      const line = view.top + view.height * 0.35;
      let at: string | undefined;
      for (const el of sections) if (el.getBoundingClientRect().top <= line) at = "#" + el.id;
      if (view.height + scrolledBy(box) >= view.full - 4) at = "#" + sections[sections.length - 1]!.id;
      setInView(at);
    };
    read();
    box.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      box.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, on]);
  return inView;
}

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
  classNames,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLElement>(null);
  const v = variant;
  const inView = useSectionInView(links.map((l) => l.href), current === undefined, head);
  const now = current ?? inView;
  // Scrolled: a sticky bar takes a shadow once the page moves under it; the progress line fills.
  useEffect(() => {
    if (!sticky && v !== "progress") return;
    const box = scrollerOf(head.current);
    const read = () => {
      const y = scrolledBy(box);
      setScrolled(y > 8);
      if (bar.current) {
        const view = viewOf(box);
        const max = view.full - view.height;
        bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };
    read();
    box.addEventListener("scroll", read, { passive: true });
    return () => box.removeEventListener("scroll", read);
  }, [sticky, v]);
  // track: where the sliding highlight sits.
  const navRef = useRef<HTMLElement>(null);
  const [mark, setMark] = useState<{ left: number; width: number } | null>(null);
  const markAt = (el: HTMLElement | null) => setMark(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  useEffect(() => {
    if (v !== "track" || !navRef.current) return;
    markAt(navRef.current.querySelector<HTMLElement>("[aria-current]"));
  }, [v, now]);
  const on: On = v === "inverted" ? "inverse" : v === "brand" ? "brand" : "default";
  const t = tone[on];
  const menuOnly = v === "minimal" || v === "fullscreen";
  const height = v === "tall" ? "h-20" : v === "compact" ? "h-11" : "h-14";
  const floating = v === "floating" || v === "floating-card";

  const Brand = (
    <A href={brandHref} className={cn("flex flex-none items-center gap-2 rounded-sm font-display font-semibold tracking-[-0.01em] no-underline", v === "tall" ? "text-title" : v === "compact" ? "text-body" : "text-subtitle", on === "default" ? "text-ink" : t.active, focusRing, classNames?.brand)}>
      {brand}
    </A>
  );

  // The default link: its colour deepens and a line grows in under it, from the middle.
  const grow = (active: boolean) =>
    cn(
      "relative after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-center after:bg-current after:transition-transform after:duration-300 after:ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:after:transition-none",
      active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
    );
  const linkClass = (active: boolean) =>
    cn(
      "whitespace-nowrap no-underline transition-[color,opacity,background-color] duration-200",
      v === "tall" ? "text-body-lg" : v === "compact" ? "text-small" : "text-body",
      v === "underline"
        ? cn("relative flex h-full items-center px-1 pt-0.5 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-current after:transition-transform after:duration-300 after:ease-[cubic-bezier(.16,1,.3,1)]", active ? "font-medium text-ink after:scale-x-100" : "text-ink-2 after:scale-x-0 hover:text-ink hover:after:scale-x-100")
        : v === "track"
          ? cn("relative z-10 rounded-full px-3.5 py-1.5", active ? "font-medium text-ink" : "text-ink-2 hover:text-ink")
          : v === "editorial"
            ? cn("group/l inline-flex items-baseline gap-1.5 px-2.5 py-1.5 text-label uppercase tracking-[0.12em]", grow(active), active ? "text-ink" : "text-ink-3 hover:text-ink")
        : v === "pills"
          ? cn("rounded-full px-3 py-1", active ? "bg-surface font-medium text-ink shadow-1" : "text-ink-2 hover:text-ink")
          : v === "boxed"
            ? cn("flex h-full items-center border-l border-line px-5", active ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink")
            : cn("rounded-md px-3 py-1.5", grow(active), t.link, active && cn("font-medium", t.active), v === "spotlight" && "group-hover/nav:opacity-40 hover:opacity-100!"),
      focusRing,
      classNames?.link,
    );

  const Links = (
    <nav
      ref={navRef}
      aria-label="Main"
      onMouseLeave={v === "track" ? () => markAt(navRef.current?.querySelector<HTMLElement>("[aria-current]") ?? null) : undefined}
      className={cn(
        "hidden items-center @3xl:flex",
        v === "spotlight" && "group/nav",
        v === "track" && "relative rounded-full bg-surface-2 p-1",
        v === "underline" || v === "boxed" ? "h-full gap-5 self-stretch" : "gap-1",
        v === "underline" && "gap-6",
        v === "boxed" && "gap-0",
        v === "pills" && "rounded-full bg-surface-2 p-1",
        v === "search" && "@3xl:hidden @5xl:flex",
      )}
    >
      {v === "track" && mark ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1 rounded-full bg-surface shadow-1 transition-[left,width] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
          style={{ left: mark.left, width: mark.width }}
        />
      ) : null}
      {links.map((l, i) => (
        <A
          key={i}
          href={l.href}
          aria-current={now === l.href ? (current ? "page" : "location") : undefined}
          onMouseEnter={v === "track" ? (e: React.MouseEvent<HTMLElement>) => markAt(e.currentTarget) : undefined}
          className={linkClass(now === l.href)}
        >
          {v === "editorial" ? <span className="font-mono text-caption tracking-normal text-ink-4 transition-colors group-hover/l:text-brand">{String(i + 1).padStart(2, "0")}</span> : null}
          {l.label}
        </A>
      ))}
    </nav>
  );

  const Actions = actions ? <div className={cn("hidden flex-none items-center gap-2 @3xl:flex", t.fix, v === "boxed" && "h-full border-l border-line pl-4", classNames?.actions)}>{actions}</div> : null;

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
  if (v === "centered" || v === "pills" || v === "track") {
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
    // Solid, never frosted (only glass is): text under a blurred bar reads as smudge.
    !["inverted", "brand", "transparent", "glass", "fullscreen"].includes(v) && !floating && "border-b border-line bg-ground",
    v === "progress" && !sticky && "relative",
    sticky && scrolled && !floating && !["transparent"].includes(v) && "shadow-1",
    "transition-shadow duration-300",
    className,
  );
  const inner = cn(
    "mx-auto max-w-[1200px]",
    v === "boxed" ? "border-x border-line pl-4 @3xl:pl-6" : "px-4 @3xl:px-6",
    v === "floating" && "max-w-[1080px] rounded-full border border-line bg-surface pl-5 pr-2 shadow-2 @3xl:pl-6 @3xl:pr-2",
    v === "floating-card" && "max-w-[1140px] rounded-xl border border-line bg-surface shadow-2",
    classNames?.inner,
  );

  const panelLink = cn("rounded-md px-2 py-2.5 text-body-lg no-underline", on === "default" ? "text-ink hover:bg-surface-2" : t.link, focusRing);

  return (
    <header ref={head} className={shell}>
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
      {v === "progress" ? <div ref={bar} aria-hidden="true" className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-brand" style={{ transform: "scaleX(0)" }} /> : null}
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
