"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { cn, focusRing } from "../cx";
import { ChevronRightGlyph, CloseGlyph, MenuGlyph } from "./icons";

type PageTrail = { items: Crumb[]; as?: React.ElementType };
type ShellState = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  /** The screen's breadcrumbs, set by its PageCrumbs and drawn by the Topbar. */
  trail: PageTrail | null;
  setTrail: (trail: PageTrail | null) => void;
};
const ShellContext = createContext<ShellState>({ navOpen: false, setNavOpen: () => {}, trail: null, setTrail: () => {} });

/** The AppShell around this: whether its drawer is open (phones), and a way to close it. */
export function useShell(): ShellState {
  return useContext(ShellContext);
}

export interface AppShellProps {
  /** The Sidebar. */
  sidebar: React.ReactNode;
  /** The Topbar, over the content. */
  topbar?: React.ReactNode;
  /** The screen: a toolbar row of actions and filters, then its content. No big title: the Topbar says where you are. */
  children: React.ReactNode;
  /** Content width: "full" for tables that need the room, "default" caps it for reading. The content's padding is the CSS variables --page-x and --page-y, for bands that run to the edges. */
  width?: "default" | "full";
  className?: string;
}

/**
 * The frame of an app's signed-in screens: a sidebar on the left, a top bar,
 * and the screen. It fills the window (or its className's height) and the
 * screen scrolls inside it, so the sidebar always fits. From 768px wide the
 * sidebar stays on show; narrower, it slides in from the Topbar's menu button
 * and closes when a link is picked. Those widths are the shell's own (container
 * queries), so it fits a box as well as the window; its main area is a
 * container too, for screens laid out with @md:, @3xl: and the like.
 */
export function AppShell({ sidebar, topbar, children, width = "default", className }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [trail, setTrail] = useState<PageTrail | null>(null);
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);
  return (
    <ShellContext.Provider value={{ navOpen, setNavOpen, trail, setTrail }}>
      <div className={cn("@container relative flex h-dvh overflow-hidden bg-ground text-ink", className)}>
        {navOpen ? (
          <div
            className="absolute inset-0 z-40 bg-overlay animate-fade-in motion-reduce:animate-none @3xl:hidden"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
        ) : null}
        <div
          className={cn(
            "absolute inset-y-0 left-0 z-50 max-w-[85vw] transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",
            "@3xl:static @3xl:z-auto @3xl:h-full @3xl:flex-none @3xl:translate-x-0",
            navOpen ? "translate-x-0 shadow-3" : "-translate-x-full",
          )}
        >
          {sidebar}
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {topbar}
          {/* Its padding is --page-x and --page-y, so a band inside can reach the edges: -mx-(--page-x). */}
          <main
            className={cn(
              "@container w-full flex-1 [--page-x:1rem] [--page-y:1.25rem] @3xl:[--page-x:1.5rem] @3xl:[--page-y:1.5rem] px-(--page-x) py-(--page-y)",
              width === "default" && "mx-auto max-w-[1200px]",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export interface SidebarProps {
  /** The app's mark and name, at the top. */
  brand: React.ReactNode;
  /** NavSections and NavItems. */
  children: React.ReactNode;
  /** At the bottom: the signed-in person, usually a Menu. */
  footer?: React.ReactNode;
  className?: string;
}

/** The app's navigation, inside an AppShell. */
export function Sidebar({ brand, children, footer, className }: SidebarProps) {
  const { navOpen, setNavOpen } = useContext(ShellContext);
  return (
    <aside className={cn("chrome-scope flex h-full w-[240px] flex-col border-r border-line bg-surface", className)}>
      <div className="flex h-12 flex-none items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2.5 font-display text-body font-semibold tracking-[-0.01em]">{brand}</div>
        {navOpen ? (
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
            className={cn("-mr-1.5 inline-flex rounded-sm p-1.5 text-ink-3 hover:text-ink @3xl:hidden", focusRing)}
          >
            <CloseGlyph size={18} />
          </button>
        ) : null}
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2.5 pb-4 pt-1">{children}</nav>
      {footer ? <div className="flex-none border-t border-line p-3">{footer}</div> : null}
    </aside>
  );
}

export interface NavSectionProps {
  /** A short heading over a group of links; leave it off for the first group. */
  label?: React.ReactNode;
  /** Its NavItems. */
  children: React.ReactNode;
  className?: string;
}

/** A group of NavItems in the Sidebar. */
export function NavSection({ label, children, className }: NavSectionProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {label ? <p className="m-0 mb-1 px-2.5 text-caption font-medium text-ink-3">{label}</p> : null}
      {children}
    </div>
  );
}

export interface NavItemProps {
  /** The screen's address. */
  href: string;
  /** The screen's name: "Orders". */
  label: React.ReactNode;
  /** A lucide-react icon at 16px. */
  icon?: React.ReactNode;
  /** The screen being shown. */
  active?: boolean;
  /** What's waiting there: new orders, unread messages. */
  count?: number;
  /** What renders links, from a client component only: Next's Link, say, so moving between pages keeps state. A server page can't pass a component here (Next refuses it), so leave it out there: plain <a> links work. An <a> by default. */
  as?: React.ElementType;
  className?: string;
}

/** One screen in the Sidebar. Pass Next.js's Link as `as`, and `active` for the screen on show. */
export function NavItem({ href, label, icon, active, count, as: Link = "a", className }: NavItemProps) {
  const { setNavOpen } = useContext(ShellContext);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={() => setNavOpen(false)}
      className={cn(
        "flex h-8 items-center gap-2 rounded-md px-2.5 text-label font-medium no-underline transition-colors pointer-coarse:h-11",
        active ? "bg-brand-soft text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
        "[&>svg]:flex-none",
        active ? "[&>svg]:text-ink" : "[&>svg]:text-ink-3",
        focusRing,
        className,
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? (
        <span className="min-w-5 rounded-full bg-brand px-1.5 text-center text-caption leading-[18px] font-medium tabular-nums text-brand-ink">{count}</span>
      ) : null}
    </Link>
  );
}

export interface TopbarProps {
  /** Where this screen sits. Leave it off in the layout: each page sets its own with PageCrumbs, and the Topbar draws them here. Pass it only for a Topbar that is the same on every screen. */
  crumbs?: Crumb[];
  /** What renders the breadcrumb links, from a client component only (Next's Link). An <a> by default. */
  linkAs?: React.ElementType;
  /** Anything else on the left, after the breadcrumbs (rare: a search field). The breadcrumbs belong here, not in the page. */
  children?: React.ReactNode;
  /** On the right: the screen's main action, notifications, the account Menu. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * The bar over every signed-in screen. It says where you are (breadcrumbs, from
 * the page's PageCrumbs) and holds the actions that are always there. It stays
 * at the top while the screen scrolls. A page never draws its own title or
 * breadcrumbs above its content: they live here.
 */
export function Topbar({ crumbs, linkAs, children, actions, className }: TopbarProps) {
  const { setNavOpen, trail } = useContext(ShellContext);
  const items = trail?.items.length ? trail.items : crumbs;
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-12 flex-none items-center gap-3 border-b border-line bg-bar/90 px-4 backdrop-blur-md @3xl:px-6",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        aria-label="Open menu"
        className={cn("-ml-1.5 inline-flex rounded-sm p-1.5 text-ink-2 hover:text-ink pointer-coarse:p-3 @3xl:hidden", focusRing)}
      >
        <MenuGlyph size={20} />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {items?.length ? <Breadcrumbs items={items} as={trail?.as ?? linkAs} /> : null}
        {children}
      </div>
      {actions ? <div className="flex flex-none items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export interface PageCrumbsProps {
  /** From the top down: { label, href? }; the last is this screen. */
  items: Crumb[];
  /** What renders the links, from a client component only (Next's Link). Leave it out on a server page. */
  as?: React.ElementType;
}

/**
 * A screen's breadcrumbs. Put it anywhere in the page (a server page too): it
 * draws nothing where it is, and the AppShell's Topbar shows the trail. This is
 * how every screen says where it is; never a heading or Breadcrumbs in the page.
 */
export function PageCrumbs({ items, as }: PageCrumbsProps) {
  const { setTrail } = useContext(ShellContext);
  const key = JSON.stringify(items.map((c) => [typeof c.label === "string" ? c.label : "", c.href ?? ""]));
  useEffect(() => {
    setTrail({ items, as });
    return () => setTrail(null);
    // The trail changes when its labels or links do, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, as, setTrail]);
  return null;
}

export interface Crumb {
  label: React.ReactNode;
  /** Leave off for the current screen, the last one. */
  href?: string;
}

export interface BreadcrumbsProps {
  /** From the top down: { label, href? }; the last is the current screen. */
  items: Crumb[];
  /** What renders links, from a client component only: Next's Link, say, so moving between pages keeps state. A server page can't pass a component here (Next refuses it), so leave it out there: plain <a> links work. An <a> by default. */
  as?: React.ElementType;
  className?: string;
}

/** Where this screen sits: Customers › Amara Okafor › Orders. The last is the current screen. */
export function Breadcrumbs({ items, as: Link = "a", className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="m-0 flex min-w-0 list-none items-center gap-1.5 p-0 text-label">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={cn("flex min-w-0 items-center gap-1.5", !last && "flex-none @max-xl:hidden")}>
              {c.href && !last ? (
                <Link href={c.href} className={cn("truncate rounded-sm text-ink-3 no-underline hover:text-ink", focusRing)}>
                  {c.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-ink" aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
              {last ? null : <ChevronRightGlyph size={14} className="flex-none text-ink-4" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
