"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { cn, focusRing } from "../cx";
import { ChevronRightGlyph, CloseGlyph, MenuGlyph } from "./icons";

type ShellState = { navOpen: boolean; setNavOpen: (open: boolean) => void };
const ShellContext = createContext<ShellState>({ navOpen: false, setNavOpen: () => {} });

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
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);
  return (
    <ShellContext.Provider value={{ navOpen, setNavOpen }}>
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
  /** The link component: Next.js's Link. Defaults to a plain <a>. */
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
        "flex h-8 items-center gap-2 rounded-md px-2.5 text-label font-medium no-underline transition-colors",
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
  /** Usually Breadcrumbs, or a search Input. */
  children?: React.ReactNode;
  /** On the right: notifications, help, a primary action. */
  actions?: React.ReactNode;
  className?: string;
}

/** The bar over a screen, inside an AppShell. On phones it holds the button that opens the Sidebar. */
export function Topbar({ children, actions, className }: TopbarProps) {
  const { setNavOpen } = useContext(ShellContext);
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
        className={cn("-ml-1.5 inline-flex rounded-sm p-1.5 text-ink-2 hover:text-ink @3xl:hidden", focusRing)}
      >
        <MenuGlyph size={20} />
      </button>
      <div className="flex min-w-0 flex-1 items-center">{children}</div>
      {actions ? <div className="flex flex-none items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export interface Crumb {
  label: React.ReactNode;
  /** Leave off for the current screen, the last one. */
  href?: string;
}

export interface BreadcrumbsProps {
  /** From the top down: { label, href? }; the last is the current screen. */
  items: Crumb[];
  /** The link component: Next.js's Link. */
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
