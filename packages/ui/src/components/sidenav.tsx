"use client";

import { useMemo, useState } from "react";

import { cn, focusRing } from "../cx";
import { Avatar } from "./display";
import { CheckGlyph, ChevronDownGlyph, ChevronRightGlyph, CloseGlyph } from "./icons";
import { Menu, type MenuItem } from "./menu";
import { useShell } from "./shell";

export interface NavLink {
  /** The screen's name: "Orders". */
  label: string;
  /** The screen's address; the link is active when it's `current`. */
  href: string;
  /** A lucide-react icon at 16px. Rails, tiles and the admin menu need one on every link. */
  icon?: React.ReactNode;
  /** What's waiting there: new orders, unread messages. */
  count?: number;
  /** A line under the label, for the steps variant: "Add your first product". */
  description?: string;
  /** A face or logo in place of the icon (a 20px Avatar or image): people, teams, projects. */
  avatar?: React.ReactNode;
  /** A second line under the label, small and muted: "KAP-10 · Checks running". */
  secondary?: React.ReactNode;
  /** A short note at the row's end: "2d", "5m", "Draft". */
  meta?: string;
  /** Small icons before the count: a lock for private, a pin. */
  extra?: React.ReactNode;
  /** Something new in it: the label is drawn strong. */
  unread?: boolean;
  /** Screens under this one; how they show depends on the variant (nested, flyout, accordion). */
  children?: NavLink[];
}

export interface NavGroup {
  /** A short heading over the group; leave it off for the first. */
  label?: string;
  /** The group's icon: what the rail-panel variant shows in its rail. */
  icon?: React.ReactNode;
  /** Small buttons beside the heading: add, search, more (ghost icon Buttons, size sm). */
  actions?: React.ReactNode;
  items: NavLink[];
}

export type SideNavVariant =
  | "classic"
  | "rail"
  | "rail-panel"
  | "admin"
  | "accordion"
  | "tree"
  | "floating"
  | "minimal"
  | "pills"
  | "bar"
  | "inverted"
  | "brand"
  | "compact"
  | "tiles"
  | "collapsible"
  | "search"
  | "workspace"
  | "steps"
  | "cards"
  | "colorful"
  | "threads";

/** Every variant, in order, for pickers and docs. */
export const sideNavVariants: SideNavVariant[] = [
  "classic",
  "rail",
  "rail-panel",
  "admin",
  "accordion",
  "tree",
  "floating",
  "minimal",
  "pills",
  "bar",
  "inverted",
  "brand",
  "compact",
  "tiles",
  "collapsible",
  "search",
  "workspace",
  "steps",
  "cards",
  "colorful",
  "threads",
];

export interface SideNavProps {
  /** The app's screens, in groups: [{ label?, icon?, items: [{ label, href, icon?, count?, children? }] }]. */
  groups: NavGroup[];
  /**
   * How it looks and behaves. classic: icons and labels. rail: icons only. rail-panel: an icon rail
   * and a panel of the open section. admin: a dark menu whose sections open beside it on hover.
   * accordion: groups that fold. tree: nested with guide lines. floating: a card off the edges.
   * minimal: words only. pills: rounded items. bar: a bar marks the open screen. inverted: dark in
   * any theme. brand: on the brand colour. compact: dense, for many screens. tiles: a grid of
   * icons. collapsible: folds to a rail. search: a filter on top. workspace: a switcher on top.
   * steps: numbered setup steps. cards: each group in a card. colorful: tinted icon chips.
   * threads: a dense feed of conversations or projects: avatars, second lines, times,
   * nested replies, and actions beside each heading.
   */
  variant?: SideNavVariant;
  /** The address on show (usePathname()): the link with this href, and its parents, are active. */
  current?: string;
  /** The app's mark and name, at the top. */
  brand?: React.ReactNode;
  /** The mark alone, for the narrow variants (rail, rail-panel, a folded collapsible). */
  mark?: React.ReactNode;
  /** At the bottom: the signed-in person, usually a Menu. */
  footer?: React.ReactNode;
  /** Small icon buttons beside the brand: search, a layout switch, fold the sidebar. */
  tools?: React.ReactNode;
  /** The one main action, drawn first and stronger: "New thread", "New order". */
  primary?: { label: string; href: string; icon?: React.ReactNode };
  /** For the workspace variant: the workspace on show, and what its switcher offers. */
  workspace?: { name: string; detail?: string; menu?: MenuItem[] };
  /** For collapsible: start folded. */
  defaultCollapsed?: boolean;
  /** The link component: Next.js's Link. Defaults to a plain <a>. */
  as?: React.ElementType;
  className?: string;
}

const has = (l: NavLink, current?: string): boolean => l.href === current || (l.children ?? []).some((c) => has(c, current));

/** Item classes per variant: base, active, inactive. */
const looks: Partial<Record<SideNavVariant, { item: string; on: string; off: string }>> = {
  classic: { item: "h-8 rounded-md px-2.5", on: "bg-brand-soft text-ink", off: "text-ink-2 hover:bg-surface-2 hover:text-ink" },
  minimal: { item: "h-7 px-2", on: "font-semibold text-ink", off: "font-normal text-ink-3 hover:text-ink" },
  pills: { item: "h-8 rounded-full px-3", on: "bg-brand text-brand-ink [&_svg]:!text-brand-ink", off: "text-ink-2 hover:bg-surface-2 hover:text-ink" },
  bar: {
    item: "h-8 rounded-r-md px-3 relative before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full",
    on: "bg-surface-2 text-ink before:bg-brand",
    off: "text-ink-2 hover:text-ink before:bg-transparent",
  },
  compact: { item: "h-[26px] rounded-sm px-2 text-small [&_svg]:size-3.5", on: "bg-brand-soft text-ink", off: "text-ink-2 hover:bg-surface-2 hover:text-ink" },
  brand: {
    item: "h-8 rounded-md px-2.5 text-brand-ink [&_svg]:!text-brand-ink",
    on: "bg-[color-mix(in_oklch,var(--brand-ink)_18%,transparent)]",
    off: "opacity-80 hover:opacity-100 hover:bg-[color-mix(in_oklch,var(--brand-ink)_10%,transparent)]",
  },
};

/** One link, drawn per variant. */
function Item({
  link,
  current,
  look,
  as: Link,
  showIcon = true,
  depth = 0,
  trailing,
}: {
  link: NavLink;
  current?: string;
  look: { item: string; on: string; off: string };
  as: React.ElementType;
  showIcon?: boolean;
  depth?: number;
  trailing?: React.ReactNode;
}) {
  const { setNavOpen } = useShell();
  const active = link.href === current;
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      onClick={() => setNavOpen(false)}
      style={depth ? { paddingLeft: `calc(${depth} * 1.25rem + 0.625rem)` } : undefined}
      className={cn(
        "flex items-center gap-2 text-label font-medium no-underline transition-colors [&_svg]:flex-none",
        active ? "[&_svg]:text-ink" : "[&_svg]:text-ink-3",
        look.item,
        active ? look.on : look.off,
        focusRing,
      )}
    >
      {showIcon ? (link.avatar ?? link.icon) : null}
      <span className={cn("min-w-0 flex-1 truncate", link.unread && "font-semibold text-ink")}>{link.label}</span>
      {link.extra ? <span className="flex flex-none items-center gap-1.5 text-ink-3 [&_svg]:size-3.5">{link.extra}</span> : null}
      {link.count ? (
        <span className="min-w-5 rounded-full bg-brand px-1.5 text-center text-caption leading-[18px] font-medium tabular-nums text-brand-ink">{link.count}</span>
      ) : null}
      {link.meta ? <span className="flex-none text-small font-normal tabular-nums text-ink-3">{link.meta}</span> : null}
      {trailing}
    </Link>
  );
}

function GroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("m-0 mb-1 px-2.5 text-caption font-medium text-ink-3", className)}>{children}</p>;
}

function Head({ brand, onClose }: { brand?: React.ReactNode; onClose?: boolean }) {
  const { navOpen, setNavOpen } = useShell();
  if (!brand) return null;
  return (
    <div className="flex h-12 flex-none items-center justify-between gap-2 px-4">
      <div className="flex min-w-0 items-center gap-2.5 font-display text-body font-semibold">{brand}</div>
      {navOpen && onClose !== false ? (
        <button type="button" onClick={() => setNavOpen(false)} aria-label="Close menu" className={cn("-mr-1.5 inline-flex rounded-sm p-1.5 text-ink-3 hover:text-ink @3xl:hidden", focusRing)}>
          <CloseGlyph size={18} />
        </button>
      ) : null}
    </div>
  );
}

/** Groups of plain Items, with nested children indented under the open one. */
function List({ groups, current, look, as, gap = "gap-4", showIcon = true, labels = true }: { groups: NavGroup[]; current?: string; look: { item: string; on: string; off: string }; as: React.ElementType; gap?: string; showIcon?: boolean; labels?: boolean }) {
  return (
    <div className={cn("flex flex-col", gap)}>
      {groups.map((g, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          {g.label && labels ? <GroupLabel>{g.label}</GroupLabel> : null}
          {g.items.map((l) => (
            <div key={l.href} className="flex flex-col gap-0.5">
              <Item link={l} current={current} look={look} as={as} showIcon={showIcon} />
              {l.children && has(l, current)
                ? l.children.map((c) => <Item key={c.href} link={c} current={current} look={look} as={as} showIcon={false} depth={1} />)
                : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A link in an icon rail: the icon, its name read out and shown on hover. */
function RailLink({ link, current, as: Link, onPick, active }: { link: NavLink; current?: string; as: React.ElementType; onPick?: () => void; active?: boolean }) {
  const { setNavOpen } = useShell();
  const on = active ?? has(link, current);
  return (
    <Link
      href={link.href}
      title={link.label}
      aria-current={link.href === current ? "page" : undefined}
      onClick={(e: React.MouseEvent) => {
        if (onPick) {
          e.preventDefault();
          onPick();
        } else setNavOpen(false);
      }}
      className={cn(
        "relative grid size-9 place-items-center rounded-md transition-colors",
        on ? "bg-brand-soft text-ink" : "text-ink-3 hover:bg-surface-2 hover:text-ink",
        focusRing,
      )}
    >
      {link.icon}
      <span className="sr-only">{link.label}</span>
      {link.count ? <span className="absolute right-1 top-1 size-2 rounded-full bg-brand ring-2 ring-surface" aria-hidden="true" /> : null}
    </Link>
  );
}

const shell = "flex h-full flex-col border-r border-line bg-surface text-ink";

/**
 * The app's navigation as data, drawn as one of 21 sidebars: pass the
 * screens once and pick a variant. Put it in AppShell's sidebar. For a
 * sidebar built by hand, use Sidebar, NavSection and NavItem instead.
 */
export function SideNav({
  groups,
  variant = "classic",
  current,
  brand,
  mark,
  footer,
  workspace,
  defaultCollapsed = false,
  tools,
  primary,
  as = "a",
  className,
}: SideNavProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(groups.map((g, i) => [i, i === 0 || g.items.some((l) => has(l, current))])),
  );
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const activeGroup = Math.max(0, groups.findIndex((g) => g.items.some((l) => has(l, current))));
  const [panel, setPanel] = useState(activeGroup);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    const match = (l: NavLink): NavLink | null => {
      const kids = (l.children ?? []).map(match).filter(Boolean) as NavLink[];
      return l.label.toLowerCase().includes(q) || kids.length ? { ...l, children: kids.length ? kids : l.children } : null;
    };
    return groups.map((g) => ({ ...g, items: g.items.map(match).filter(Boolean) as NavLink[] })).filter((g) => g.items.length);
  }, [groups, query]);

  const nav = (children: React.ReactNode, cls?: string) => <nav className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-2 [scrollbar-width:thin] [&>*]:shrink-0", cls)}>{children}</nav>;
  const foot = footer ? <div className="flex-none border-t border-line p-3">{footer}</div> : null;
  const classic = looks.classic!;

  switch (variant) {
    case "threads": {
      const Link = as;
      const row = (l: NavLink, child = false) => {
        const on = l.href === current;
        return (
          <ThreadRow key={l.href} link={l} on={on} child={child} as={Link} />
        );
      };
      return (
        <aside className={cn(shell, "w-[272px]", className)}>
          <div className="flex h-12 flex-none items-center justify-between gap-2 px-3">
            <div className="flex min-w-0 items-center gap-2.5 font-display text-body font-semibold">{mark ?? brand}</div>
            {tools ? <div className="flex items-center gap-0.5 text-ink-3">{tools}</div> : null}
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4 pt-1 [scrollbar-width:thin] [&>*]:shrink-0">
            {primary ? (
              <Link
                href={primary.href}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md bg-surface-2 px-2.5 text-label font-medium text-ink no-underline shadow-1 transition-colors hover:bg-brand-soft [&_svg]:flex-none",
                  focusRing,
                )}
              >
                {primary.icon}
                {primary.label}
              </Link>
            ) : null}
            {groups.map((g, i) => (
              <div key={i} className="flex flex-col gap-px">
                {g.label || g.actions ? (
                  <div className="flex h-7 items-center justify-between gap-2 pl-2.5 pr-0.5">
                    <span className="text-small text-ink-3">{g.label}</span>
                    {g.actions ? <div className="flex items-center gap-0.5 text-ink-3">{g.actions}</div> : null}
                  </div>
                ) : null}
                {g.items.map((l) => (
                  <div key={l.href} className="flex flex-col gap-px">
                    {row(l)}
                    {l.children?.map((c) => row(c, true))}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          {foot}
        </aside>
      );
    }

    case "rail":
      return (
        <aside className={cn(shell, "w-16 items-center", className)}>
          <div className="flex h-12 items-center">{mark}</div>
          <nav className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-2 [scrollbar-width:none] [&>*]:shrink-0">
            {groups.map((g, i) => (
              <div key={i} className={cn("flex flex-col items-center gap-1", i > 0 && "mt-2 border-t border-line pt-3")}>
                {g.items.map((l) => (
                  <RailLink key={l.href} link={l} current={current} as={as} />
                ))}
              </div>
            ))}
          </nav>
          {footer ? <div className="flex-none py-3">{footer}</div> : null}
        </aside>
      );

    case "rail-panel": {
      const g = groups[panel] ?? groups[0];
      return (
        <aside className={cn("flex h-full border-r border-line bg-surface text-ink", className)}>
          <div className="flex w-16 flex-none flex-col items-center border-r border-line bg-surface-2">
            <div className="flex h-12 items-center">{mark}</div>
            <nav className="flex flex-1 flex-col items-center gap-1 py-2" aria-label="Sections">
              {groups.map((grp, i) => (
                <RailLink
                  key={i}
                  link={{ label: grp.label ?? grp.items[0]?.label ?? "", href: grp.items[0]?.href ?? "#", icon: grp.icon ?? grp.items[0]?.icon }}
                  current={current}
                  as={as}
                  active={i === panel}
                  onPick={() => setPanel(i)}
                />
              ))}
            </nav>
            {footer ? <div className="flex-none py-3">{footer}</div> : null}
          </div>
          <div className="flex w-[224px] flex-col">
            <div className="flex h-12 flex-none items-center px-4 font-display text-subtitle font-semibold">{g?.label ?? brand}</div>
            {nav(<List groups={g ? [{ items: g.items }] : []} current={current} look={classic} as={as} />)}
          </div>
        </aside>
      );
    }

    case "admin":
      return (
        <aside data-theme="dark" className={cn(shell, "w-[224px] border-r-0 bg-surface-2", className)}>
          <Head brand={brand} />
          <nav className="flex flex-1 flex-col gap-0.5 py-2">
            {groups.flatMap((g, gi) => [
              gi > 0 ? <div key={`s${gi}`} className="mx-4 my-2 h-px bg-line" /> : null,
              ...g.items.map((l) => {
                const open = has(l, current);
                return (
                  <div key={l.href} className="group/item relative">
                    <Item
                      link={l}
                      current={open && l.children ? l.href : current}
                      as={as}
                      look={{ item: "h-9 rounded-none px-4", on: "bg-brand text-brand-ink [&_svg]:!text-brand-ink", off: "text-ink-2 hover:bg-surface hover:text-ink" }}
                    />
                    {l.children && open ? (
                      <div className="flex flex-col bg-ground py-1.5">
                        {l.children.map((c) => (
                          <Item key={c.href} link={c} current={current} as={as} showIcon={false} look={{ item: "h-8 pl-11 pr-4 text-small", on: "font-semibold text-ink", off: "font-normal text-ink-3 hover:text-ink" }} />
                        ))}
                      </div>
                    ) : null}
                    {l.children && !open ? (
                      <div className="invisible absolute left-full top-0 z-50 min-w-48 rounded-r-md bg-surface py-1.5 opacity-0 shadow-3 transition-opacity group-hover/item:visible group-hover/item:opacity-100 group-focus-within/item:visible group-focus-within/item:opacity-100">
                        {l.children.map((c) => (
                          <Item key={c.href} link={c} current={current} as={as} showIcon={false} look={{ item: "h-8 px-4 text-small", on: "text-ink", off: "font-normal text-ink-2 hover:bg-surface-2 hover:text-ink" }} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }),
            ])}
          </nav>
          {foot}
        </aside>
      );

    case "accordion":
      return (
        <aside className={cn(shell, "w-[240px]", className)}>
          <Head brand={brand} />
          {nav(
            <div className="flex flex-col gap-1">
              {groups.map((g, i) => {
                const open = openGroups[i] ?? false;
                return (
                  <div key={i} className="flex flex-col">
                    {g.label ? (
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenGroups((s) => ({ ...s, [i]: !open }))}
                        className={cn("flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 text-left text-label font-semibold text-ink hover:bg-surface-2", focusRing)}
                      >
                        <span className="flex-1">{g.label}</span>
                        <ChevronDownGlyph size={16} className={cn("text-ink-3 transition-transform", !open && "-rotate-90")} />
                      </button>
                    ) : null}
                    {open || !g.label ? (
                      <div className={cn("flex flex-col gap-0.5", g.label && "pb-2")}>
                        {g.items.map((l) => (
                          <Item key={l.href} link={l} current={current} look={classic} as={as} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>,
          )}
          {foot}
        </aside>
      );

    case "tree": {
      const branch = (l: NavLink, depth: number): React.ReactNode => {
        const open = openItems[l.href] ?? has(l, current);
        return (
          <li key={l.href} className="flex flex-col">
            <div className="flex items-center">
              {l.children ? (
                <button
                  type="button"
                  aria-label={open ? `Fold ${l.label}` : `Open ${l.label}`}
                  aria-expanded={open}
                  onClick={() => setOpenItems((s) => ({ ...s, [l.href]: !open }))}
                  className={cn("grid size-6 flex-none cursor-pointer place-items-center rounded-sm text-ink-3 hover:text-ink", focusRing)}
                >
                  <ChevronRightGlyph size={14} className={cn("transition-transform", open && "rotate-90")} />
                </button>
              ) : (
                <span className="size-6 flex-none" />
              )}
              <div className="min-w-0 flex-1">
                <Item link={l} current={current} as={as} showIcon={depth === 0} look={{ item: "h-7 rounded-md px-2", on: "bg-brand-soft text-ink", off: "font-normal text-ink-2 hover:bg-surface-2 hover:text-ink" }} />
              </div>
            </div>
            {l.children && open ? <ul className="m-0 ml-3 list-none border-l border-line p-0 pl-2">{l.children.map((c) => branch(c, depth + 1))}</ul> : null}
          </li>
        );
      };
      return (
        <aside className={cn(shell, "w-[260px]", className)}>
          <Head brand={brand} />
          {nav(
            <div className="flex flex-col gap-4">
              {groups.map((g, i) => (
                <div key={i}>
                  {g.label ? <GroupLabel className="px-1">{g.label}</GroupLabel> : null}
                  <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{g.items.map((l) => branch(l, 0))}</ul>
                </div>
              ))}
            </div>,
            "px-2",
          )}
          {foot}
        </aside>
      );
    }

    case "floating":
      return (
        <div className={cn("h-full w-[264px] p-3 pr-0", className)}>
          <aside className="flex h-full flex-col rounded-xl border border-line bg-surface text-ink shadow-2">
            <Head brand={brand} />
            {nav(<List groups={groups} current={current} look={classic} as={as} />)}
            {foot}
          </aside>
        </div>
      );

    case "inverted":
      return (
        <aside data-theme="dark" className={cn(shell, "w-[240px] border-r-0", className)}>
          <Head brand={brand} />
          {nav(<List groups={groups} current={current} look={{ item: classic.item, on: "bg-surface-2 text-ink", off: classic.off }} as={as} />)}
          {foot}
        </aside>
      );

    case "brand":
      return (
        <aside className={cn("flex h-full w-[240px] flex-col bg-brand text-brand-ink [&_.text-ink-3]:text-brand-ink/70 [&_.text-ink]:text-brand-ink", className)}>
          <Head brand={brand} />
          {nav(
            <div className="flex flex-col gap-4">
              {groups.map((g, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  {g.label ? <p className="m-0 mb-1 px-2.5 text-caption font-medium opacity-70">{g.label}</p> : null}
                  {g.items.map((l) => (
                    <Item key={l.href} link={l} current={current} look={looks.brand!} as={as} />
                  ))}
                </div>
              ))}
            </div>,
          )}
          {footer ? <div className="flex-none border-t border-[color-mix(in_oklch,var(--brand-ink)_18%,transparent)] p-3">{footer}</div> : null}
        </aside>
      );

    case "tiles":
      return (
        <aside className={cn(shell, "w-[264px]", className)}>
          <Head brand={brand} />
          {nav(
            <div className="flex flex-col gap-4">
              {groups.map((g, i) => (
                <div key={i} className="flex flex-col">
                  {g.label ? <GroupLabel>{g.label}</GroupLabel> : null}
                  <div className="grid grid-cols-2 gap-2">
                    {g.items.map((l) => {
                      const on = has(l, current);
                      return (
                        <TileLink key={l.href} link={l} on={on} as={as} />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>,
          )}
          {foot}
        </aside>
      );

    case "collapsible":
      return (
        <aside className={cn(shell, "transition-[width] duration-200", collapsed ? "w-16 items-center" : "w-[240px]", className)}>
          {collapsed ? <div className="flex h-12 items-center">{mark}</div> : <Head brand={brand} />}
          {collapsed ? (
            <nav className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-2 [scrollbar-width:none] [&>*]:shrink-0">
              {groups.flatMap((g) => g.items).map((l) => (
                <RailLink key={l.href} link={l} current={current} as={as} />
              ))}
            </nav>
          ) : (
            nav(<List groups={groups} current={current} look={classic} as={as} />)
          )}
          <div className={cn("flex-none border-t border-line p-3", collapsed && "w-full")}>
            {collapsed ? null : footer}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Open the sidebar" : "Fold the sidebar"}
              className={cn("mt-2 flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-md text-small text-ink-3 hover:bg-surface-2 hover:text-ink", focusRing)}
            >
              <ChevronRightGlyph size={16} className={cn("transition-transform", !collapsed && "rotate-180")} />
              {collapsed ? null : "Fold"}
            </button>
          </div>
        </aside>
      );

    case "search":
      return (
        <aside className={cn(shell, "w-[256px]", className)}>
          <Head brand={brand} />
          <div className="px-3 pb-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a page"
              aria-label="Find a page"
              className="h-9 w-full rounded-md border border-line-strong bg-ground px-3 text-label text-ink outline-none placeholder:text-ink-4 focus:border-focus"
            />
          </div>
          {nav(
            filtered.length ? (
              <List groups={filtered} current={query ? undefined : current} look={classic} as={as} />
            ) : (
              <p className="m-0 px-2.5 py-6 text-center text-small text-ink-3">Nothing called “{query}”.</p>
            ),
          )}
          {foot}
        </aside>
      );

    case "workspace":
      return (
        <aside className={cn(shell, "w-[256px]", className)}>
          <div className="p-3">
            <Menu
              align="start"
              label="Switch workspace"
              className="w-full"
              items={workspace?.menu ?? []}
              trigger={
                <button type="button" className={cn("flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-ground p-2 text-left hover:bg-surface-2", focusRing)}>
                  {mark ?? <Avatar name={workspace?.name ?? "Workspace"} size="sm" />}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-label font-semibold text-ink">{workspace?.name ?? "Workspace"}</span>
                    {workspace?.detail ? <span className="truncate text-caption text-ink-3">{workspace.detail}</span> : null}
                  </span>
                  <ChevronDownGlyph size={16} className="text-ink-3" />
                </button>
              }
            />
          </div>
          {nav(<List groups={groups} current={current} look={classic} as={as} />)}
          {foot}
        </aside>
      );

    case "steps": {
      // The top-level screens, in order: a sub-page is part of its step.
      const steps = groups.flatMap((g) => g.items);
      const at = Math.max(0, steps.findIndex((st) => has(st, current)));
      return (
        <aside className={cn(shell, "w-[280px]", className)}>
          <Head brand={brand} />
          <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
            <ol className="m-0 flex list-none flex-col p-0">
              {steps.map((s, i) => {
                const state = i < at ? "done" : i === at ? "now" : "next";
                const Link = as;
                return (
                  <li key={s.href} className="relative flex gap-3 pb-6 last:pb-0">
                    {i < steps.length - 1 ? (
                      <span className={cn("absolute left-[13px] top-7 bottom-0 w-px", state === "done" ? "bg-success" : "bg-line")} aria-hidden="true" />
                    ) : null}
                    <span
                      className={cn(
                        "relative grid size-7 flex-none place-items-center rounded-full text-caption font-semibold tabular-nums",
                        state === "done" && "bg-success text-ground",
                        state === "now" && "bg-brand text-brand-ink ring-4 ring-brand-soft",
                        state === "next" && "bg-surface text-ink-3 ring-1 ring-inset ring-line-strong",
                      )}
                    >
                      {state === "done" ? <CheckGlyph size={14} /> : i + 1}
                    </span>
                    <Link
                      href={s.href}
                      aria-current={state === "now" ? "step" : undefined}
                      className={cn("flex min-w-0 flex-col rounded-sm pt-0.5 no-underline", focusRing)}
                    >
                      <span className={cn("text-label font-medium", state === "next" ? "text-ink-3" : "text-ink")}>{s.label}</span>
                      {s.description ? <span className="text-small text-ink-3">{s.description}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
          {foot}
        </aside>
      );
    }

    case "cards":
      return (
        <aside className={cn(shell, "w-[256px] bg-surface-2", className)}>
          <Head brand={brand} />
          {nav(
            <div className="flex flex-col gap-3">
              {groups.map((g, i) => (
                <div key={i} className="flex flex-col gap-0.5 rounded-lg border border-line bg-surface p-1.5 shadow-1">
                  {g.label ? <GroupLabel className="mt-1">{g.label}</GroupLabel> : null}
                  {g.items.map((l) => (
                    <Item key={l.href} link={l} current={current} look={classic} as={as} />
                  ))}
                </div>
              ))}
            </div>,
          )}
          {foot}
        </aside>
      );

    case "colorful": {
      const chips = ["bg-info-soft text-info", "bg-success-soft text-success", "bg-warning-soft text-warning", "bg-danger-soft text-danger", "bg-brand-soft text-ink"];
      let n = 0;
      return (
        <aside className={cn(shell, "w-[256px]", className)}>
          <Head brand={brand} />
          {nav(
            <div className="flex flex-col gap-4">
              {groups.map((g, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  {g.label ? <GroupLabel>{g.label}</GroupLabel> : null}
                  {g.items.map((l) => {
                    const chip = chips[n++ % chips.length];
                    return (
                      <Item
                        key={l.href}
                        link={{ ...l, icon: <span className={cn("grid size-6 place-items-center rounded-md [&_svg]:!text-current [&_svg]:size-3.5", chip)}>{l.icon}</span> }}
                        current={current}
                        as={as}
                        look={{ item: "h-9 rounded-md px-1.5", on: "bg-surface-2 font-semibold text-ink", off: "text-ink-2 hover:bg-surface-2 hover:text-ink" }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>,
          )}
          {foot}
        </aside>
      );
    }

    default: {
      // classic, minimal, pills, bar, compact: the same list in different clothes.
      const look = looks[variant] ?? classic;
      return (
        <aside className={cn(shell, variant === "compact" ? "w-[220px]" : "w-[240px]", className)}>
          <Head brand={brand} />
          {nav(
            <List groups={groups} current={current} look={look} as={as} gap={variant === "compact" ? "gap-3" : "gap-5"} showIcon={variant !== "minimal"} />,
            variant === "bar" ? "pl-0" : undefined,
          )}
          {foot}
        </aside>
      );
    }
  }
}

function TileLink({ link, on, as: Link }: { link: NavLink; on: boolean; as: React.ElementType }) {
  const { setNavOpen } = useShell();
  return (
    <Link
      href={link.href}
      aria-current={on ? "page" : undefined}
      onClick={() => setNavOpen(false)}
      className={cn(
        "relative flex aspect-[5/4] flex-col items-start justify-between rounded-lg border p-3 no-underline transition-colors [&_svg]:size-5",
        on ? "border-brand bg-brand-soft text-ink" : "border-line text-ink-2 hover:border-line-strong hover:bg-surface-2 hover:text-ink",
        focusRing,
      )}
    >
      {link.icon}
      <span className="text-label font-medium">{link.label}</span>
      {link.count ? (
        <span className="absolute right-2 top-2 min-w-5 rounded-full bg-brand px-1.5 text-center text-caption leading-[18px] font-medium text-brand-ink">{link.count}</span>
      ) : null}
    </Link>
  );
}

/** A row of the threads variant: avatar or icon, a label and its second line, then details. */
function ThreadRow({ link, on, child, as: Link }: { link: NavLink; on: boolean; child: boolean; as: React.ElementType }) {
  const { setNavOpen } = useShell();
  return (
    <Link
      href={link.href}
      aria-current={on ? "page" : undefined}
      onClick={() => setNavOpen(false)}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-md px-2.5 no-underline transition-colors [&_svg]:flex-none",
        link.secondary ? "min-h-11 py-1.5" : "h-8",
        on ? "bg-brand-soft" : "hover:bg-surface-2",
        child && "ml-5 pl-4 before:absolute before:-left-1 before:top-0 before:h-1/2 before:w-3 before:rounded-bl-md before:border-b before:border-l before:border-line-strong",
        focusRing,
      )}
    >
      {child ? null : <span className={cn("grid size-5 flex-none place-items-center", on ? "text-ink" : "text-ink-3")}>{link.avatar ?? link.icon}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("truncate text-label", link.unread || on ? "font-semibold text-ink" : "font-normal text-ink-2 group-hover:text-ink")}>{link.label}</span>
        {link.secondary ? <span className="truncate text-small text-ink-3">{link.secondary}</span> : null}
      </span>
      {link.extra ? <span className="flex flex-none items-center gap-1.5 text-ink-3 [&_svg]:size-3.5">{link.extra}</span> : null}
      {link.count ? (
        <span className="min-w-5 flex-none rounded-full bg-brand px-1.5 text-center text-caption leading-[18px] font-medium tabular-nums text-brand-ink">{link.count}</span>
      ) : null}
      {link.meta ? <span className="flex-none text-small tabular-nums text-ink-3">{link.meta}</span> : null}
    </Link>
  );
}
