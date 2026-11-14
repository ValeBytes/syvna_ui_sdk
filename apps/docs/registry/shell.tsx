"use client";

import { useState } from "react";
import {
  BarChart3,
  CircleDashed,
  Cloud,
  Compass,
  Folder,
  GitPullRequest,
  GripVertical,
  LayoutGrid,
  List,
  Lock,
  PanelLeft,
  Pin,
  Search,
  SquarePen,
  Workflow,
  Bell,
  CalendarDays,
  Copy,
  Home,
  LogOut,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
  User,
  Users,
} from "lucide-react";
import {
  Alert,
  AppShell,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  DetailList,
  Input,
  Menu,
  NavItem,
  NavSection,
  SideNav,
  SidePanel,
  Sidebar,
  sideNavVariants,
  type SideNavVariant,
  StatCard,
  Table,
  Topbar,
} from "@syvna/ui";

import { bool, jsx, raw, str } from "./code";
import type { Doc } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
type Order = { id: string; who: string; where: string; items: number; total: number; status: "new" | "packing" | "shipped" | "delivered" };
const orders: Order[] = [
  { id: "1042", who: "Amara Okafor", where: "Lagos", items: 3, total: 128, status: "new" },
  { id: "1041", who: "Kenji Watanabe", where: "Osaka", items: 1, total: 46, status: "packing" },
  { id: "1040", who: "Priya Raman", where: "Bengaluru", items: 5, total: 212.5, status: "shipped" },
  { id: "1039", who: "Jonas Becker", where: "Hamburg", items: 2, total: 74, status: "shipped" },
  { id: "1038", who: "Ana Souza", where: "São Paulo", items: 4, total: 159, status: "delivered" },
];
const tone = { new: "info", packing: "warning", shipped: "brand", delivered: "success" } as const;
const word = { new: "New", packing: "Packing", shipped: "Shipped", delivered: "Delivered" };

const Mark = () => (
  <span className="grid size-7 place-items-center rounded-md bg-brand font-display text-xs font-bold text-brand-ink">CV</span>
);

function Nav({ active, counts = true }: { active: string; counts?: boolean }) {
  return (
    <>
      <NavSection>
        <NavItem href="#" icon={<Home size={16} />} label="Home" active={active === "home"} />
        <NavItem href="#" icon={<ShoppingBag size={16} />} label="Orders" count={counts ? 4 : undefined} active={active === "orders"} />
        <NavItem href="#" icon={<Users size={16} />} label="Customers" active={active === "customers"} />
        <NavItem href="#" icon={<Package size={16} />} label="Products" active={active === "products"} />
      </NavSection>
      <NavSection label="Shop">
        <NavItem href="#" icon={<CalendarDays size={16} />} label="Bookings" />
        <NavItem href="#" icon={<BarChart3 size={16} />} label="Reports" />
        <NavItem href="#" icon={<Settings size={16} />} label="Settings" />
      </NavSection>
    </>
  );
}

function Account() {
  return (
    <Menu
      side="above"
      align="start"
      label="Account"
      className="w-full"
      trigger={
        <button type="button" className="flex w-full cursor-pointer items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-surface-2">
          <Avatar name="Lucía Fernández" size="sm" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-ink">Lucía Fernández</span>
            <span className="truncate text-xs text-ink-3">Owner</span>
          </span>
        </button>
      }
      items={[
        { label: "Your profile", icon: <User size={16} /> },
        { label: "Settings", icon: <Settings size={16} /> },
        { label: "Sign out", icon: <LogOut size={16} />, separated: true },
      ]}
    />
  );
}

const rowActions = [
  { label: "Edit", icon: <Pencil size={16} /> },
  { label: "Duplicate", icon: <Copy size={16} /> },
  { label: "Cancel order", icon: <Trash2 size={16} />, danger: true, separated: true },
];

function OrdersScreen({ width }: { width: "default" | "full" }) {
  const [open, setOpen] = useState<Order | null>(null);
  return (
    <AppShell
      className="h-[640px]"
      width={width}
      sidebar={
        <Sidebar
          brand={
            <>
              <Mark />
              Casa Verde
            </>
          }
          footer={<Account />}
        >
          <Nav active="orders" />
        </Sidebar>
      }
      topbar={
        <Topbar
          crumbs={[{ label: "Shop", href: "#" }, { label: "Orders" }]}
          actions={
            <>
              <Button variant="ghost" aria-label="Notifications" icon={<Bell size={16} />} />
              <Button variant="primary" size="sm">
                New order
              </Button>
            </>
          }
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 @xl:grid-cols-3">
          <StatCard label="To pack today" value="6" hint="2 due by noon" />
          <StatCard label="Sales this week" value="$4,380" change={{ value: "9%", trend: "up" }} hint="vs last week" />
          <StatCard label="Returns" value="1" change={{ value: "2", trend: "down", upIsGood: false }} hint="vs last week" />
        </div>
        <Table
          caption="Orders"
          rows={orders}
          rowKey={(r) => r.id}
          selected={open ? [open.id] : []}
          onRowClick={setOpen}
          columns={[
            {
              key: "who",
              header: "Customer",
              render: (r) => (
                <span className="inline-flex items-center gap-2.5">
                  <Avatar name={r.who} size="sm" />
                  {r.who}
                </span>
              ),
            },
            { key: "id", header: "Order", render: (r) => <span className="font-mono text-[13px]">#{r.id}</span> },
            { key: "where", header: "City" },
            { key: "status", header: "Status", render: (r) => <Badge tone={tone[r.status]} dot>{word[r.status]}</Badge> },
            { key: "total", header: "Total", align: "end", render: (r) => money.format(r.total) },
            {
              key: "more",
              header: <span className="sr-only">Actions</span>,
              width: "56px",
              render: () => (
                <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Menu label="Order actions" trigger={<Button variant="ghost" size="sm" aria-label="Order actions" icon={<MoreHorizontal size={16} />} />} items={rowActions} />
                </span>
              ),
            },
          ]}
        />
      </div>
      <SidePanel
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `Order #${open.id}` : ""}
        description={
          open ? (
            <>
              <Badge tone={tone[open.status]}>{word[open.status]}</Badge>
              Placed today at 09:24
            </>
          ) : null
        }
        footer={
          <>
            <Button onClick={() => setOpen(null)}>Close</Button>
            <Button variant="primary">Mark as packed</Button>
          </>
        }
      >
        {open ? (
          <div className="flex flex-col gap-6">
            <DetailList
              items={[
                { label: "Customer", value: open.who },
                { label: "City", value: open.where },
                { label: "Items", value: open.items },
                { label: "Total", value: money.format(open.total) },
                { label: "Payment", value: "Card ending 4242" },
              ]}
            />
            <Alert tone="info">Gift wrap requested.</Alert>
          </div>
        ) : null}
      </SidePanel>
    </AppShell>
  );
}

function PanelDemo({ width }: { width: number }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open customer</Button>
      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="Kenji Watanabe"
        width={width}
        description={
          <>
            <Badge tone="success">Active</Badge>
            Customer since 2022
          </>
        }
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Close</Button>
            <Button variant="primary">New order</Button>
          </>
        }
      >
        <DetailList
          items={[
            { label: "Email", value: "kenji@example.com" },
            { label: "City", value: "Osaka, Japan" },
            { label: "Orders", value: "14" },
            { label: "Spent", value: "$1,912.40" },
          ]}
        />
      </SidePanel>
    </>
  );
}

export const shell: Doc[] = [
  {
    name: "AppShell",
    controls: { width: { type: "select", options: ["default", "full"], default: "default" } },
    stage: "block p-0",
    preview: (v) => <OrdersScreen width={str(v.width) as "default"} />,
    code: (v) =>
      jsx(
        "AppShell",
        {
          width: str(v.width),
          sidebar: raw("<Sidebar brand={<><Mark /> Casa Verde</>} footer={<AccountMenu />}>…</Sidebar>"),
          topbar: raw('<Topbar actions={<Button variant="primary" size="sm">New order</Button>} />'),
        },
        '<PageCrumbs items={[{ label: "Shop", href: "/" }, { label: "Orders" }]} />\n<div className="grid gap-4 @xl:grid-cols-3">{stats}</div>\n<Table rows={orders} … />',
        { width: "default" },
      ),
  },
  {
    name: "Sidebar",
    controls: { footer: { type: "boolean", default: true, label: "Account footer" }, counts: { type: "boolean", default: true } },
    stage: "p-0 justify-start",
    preview: (v) => (
      <div className="h-[520px] w-[248px]">
        <Sidebar
          brand={
            <>
              <Mark />
              Casa Verde
            </>
          }
          footer={bool(v.footer) ? <Account /> : undefined}
        >
          <Nav active="home" counts={bool(v.counts)} />
        </Sidebar>
      </div>
    ),
    code: (v) =>
      jsx(
        "Sidebar",
        { brand: raw("<><Mark /> Casa Verde</>"), footer: bool(v.footer) ? raw("<AccountMenu />") : undefined },
        '<NavSection>\n  <NavItem as={Link} href="/" icon={<Home size={16} />} label="Home" active />\n  <NavItem as={Link} href="/orders" icon={<ShoppingBag size={16} />} label="Orders" count={4} />\n</NavSection>',
      ),
  },
  {
    name: "NavSection",
    controls: { label: { type: "text", default: "Shop" } },
    preview: (v) => (
      <div className="w-[232px]">
        <NavSection label={str(v.label) || undefined}>
          <NavItem href="#" icon={<CalendarDays size={16} />} label="Bookings" />
          <NavItem href="#" icon={<BarChart3 size={16} />} label="Reports" />
          <NavItem href="#" icon={<Settings size={16} />} label="Settings" />
        </NavSection>
      </div>
    ),
    code: (v) => jsx("NavSection", { label: str(v.label) }, '<NavItem as={Link} href="/bookings" icon={<CalendarDays size={16} />} label="Bookings" />'),
  },
  {
    name: "NavItem",
    controls: {
      label: { type: "text", default: "Orders" },
      active: { type: "boolean", default: true },
      count: { type: "number", default: 4, min: 0, max: 99 },
      icon: { type: "boolean", default: true },
    },
    preview: (v) => (
      <div className="w-[232px]">
        <NavItem href="#" label={str(v.label)} active={bool(v.active)} count={Number(v.count) || undefined} icon={bool(v.icon) ? <ShoppingBag size={16} /> : undefined} />
      </div>
    ),
    code: (v) =>
      jsx("NavItem", {
        as: raw("Link"),
        href: "/orders",
        icon: bool(v.icon) ? raw("<ShoppingBag size={16} />") : undefined,
        label: str(v.label),
        count: Number(v.count) || undefined,
        active: bool(v.active),
      }),
  },
  {
    name: "Topbar",
    controls: { content: { type: "select", options: ["breadcrumbs", "search"], default: "search" }, actions: { type: "boolean", default: true } },
    stage: "block p-0",
    preview: (v) => (
      <Topbar
        className="static"
        crumbs={v.content === "search" ? undefined : [{ label: "Shop", href: "#" }, { label: "Orders" }]}
        actions={
          bool(v.actions) ? (
            <>
              <Button variant="ghost" aria-label="Notifications" icon={<Bell size={16} />} />
              <Avatar name="Lucía Fernández" size="sm" />
            </>
          ) : undefined
        }
      >
        {v.content === "search" ? (
          <Input aria-label="Search" placeholder="Search orders, customers" className="max-w-[360px]" />
        ) : null}
      </Topbar>
    ),
    code: (v) =>
      jsx(
        "Topbar",
        {
          crumbs: v.content === "search" ? undefined : raw("crumbs"),
          actions: bool(v.actions) ? raw('<Button variant="ghost" aria-label="Notifications" icon={<Bell size={16} />} />') : undefined,
        },
        v.content === "search" ? '<Input aria-label="Search" placeholder="Search orders, customers" />' : undefined,
      ),
  },
  {
    name: "PageCrumbs",
    stage: "block p-0",
    preview: () => (
      <div className="flex flex-col">
        <Topbar className="static" crumbs={[{ label: "Admin", href: "#" }, { label: "Invites" }]} />
        <p className="m-0 p-4 text-body text-ink-3">The page set this trail with PageCrumbs; the Topbar drew it.</p>
      </div>
    ),
    code: () => jsx("PageCrumbs", { items: raw('[{ label: "Admin", href: "/admin" }, { label: "Invites" }]') }),
  },
  {
    name: "Breadcrumbs",
    controls: { depth: { type: "number", default: 3, min: 1, max: 4 } },
    preview: (v) => {
      const all = [{ label: "Customers", href: "#" }, { label: "Amara Okafor", href: "#" }, { label: "Orders", href: "#" }, { label: "#1042" }];
      const items = all.slice(0, Number(v.depth)).map((c, i, a) => (i === a.length - 1 ? { label: c.label } : c));
      return <Breadcrumbs items={items} />;
    },
    code: () => jsx("Breadcrumbs", { as: raw("Link"), items: raw('[{ label: "Customers", href: "/customers" }, { label: "Amara Okafor" }]') }),
  },
  {
    name: "Menu",
    controls: {
      align: { type: "select", options: ["start", "end"], default: "start" },
      side: { type: "select", options: ["below", "above"], default: "below" },
      danger: { type: "boolean", default: true, label: "Destructive item" },
    },
    stage: "min-h-[300px]",
    preview: (v) => (
      <Menu
        key={`${v.align}${v.side}`}
        defaultOpen
        align={str(v.align) as "start"}
        side={str(v.side) as "below"}
        label="Order actions"
        trigger={<Button iconRight={<MoreHorizontal size={16} />}>Order #1042</Button>}
        items={bool(v.danger) ? rowActions : rowActions.slice(0, 2)}
      />
    ),
    code: (v) =>
      jsx(
        "Menu",
        {
          align: str(v.align),
          side: str(v.side),
          label: "Order actions",
          trigger: raw('<Button variant="ghost" size="sm" aria-label="Order actions" icon={<MoreHorizontal size={16} />} />'),
          items: raw(
            `[{ label: "Edit", icon: <Pencil size={16} />, onSelect: edit }, { label: "Duplicate", icon: <Copy size={16} /> }${bool(v.danger) ? ', { label: "Cancel order", icon: <Trash2 size={16} />, danger: true, separated: true }' : ""}]`,
          ),
        },
        undefined,
        { align: "end", side: "below" },
      ),
  },
  {
    name: "SidePanel",
    controls: { width: { type: "number", default: 400, min: 320, max: 640, step: 20 } },
    stage: "min-h-[460px]",
    preview: (v) => <PanelDemo width={Number(v.width)} />,
    code: (v) =>
      jsx(
        "SidePanel",
        {
          open: raw("!!customer"),
          onClose: raw("() => setCustomer(null)"),
          title: "Kenji Watanabe",
          width: Number(v.width),
          description: raw('<Badge tone="success">Active</Badge>'),
          footer: raw('<Button variant="primary">New order</Button>'),
        },
        "<DetailList items={facts} />",
        { width: 440 },
      ),
  },
  {
    name: "DetailList",
    preview: () => (
      <DetailList
        className="w-full max-w-[420px]"
        items={[
          { label: "Guest", value: "Ana Souza" },
          { label: "Date", value: new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(new Date(2026, 11, 4)) },
          { label: "Party", value: "4 people" },
          { label: "Table", value: "Terrace, by the window" },
          { label: "Deposit", value: <Badge tone="success">Paid</Badge> },
        ]}
      />
    ),
    code: () => jsx("DetailList", { items: raw('[{ label: "Guest", value: "Ana Souza" }, { label: "Party", value: "4 people" }]') }),
  },
];

// ---------- SideNav ----------

const demoNav = [
  {
    label: "Shop",
    icon: <ShoppingBag size={18} />,
    items: [
      { label: "Home", href: "/home", icon: <Home size={16} /> },
      { label: "Orders", href: "/orders", icon: <ShoppingBag size={16} />, count: 4, children: [{ label: "All orders", href: "/orders/all" }, { label: "Returns", href: "/orders/returns" }] },
      { label: "Customers", href: "/customers", icon: <Users size={16} /> },
      { label: "Products", href: "/products", icon: <Package size={16} /> },
    ],
  },
  {
    label: "Manage",
    icon: <Settings size={18} />,
    items: [
      { label: "Bookings", href: "/bookings", icon: <CalendarDays size={16} /> },
      { label: "Reports", href: "/reports", icon: <BarChart3 size={16} /> },
      { label: "Settings", href: "/settings", icon: <Settings size={16} /> },
    ],
  },
];

// A dense feed, for the threads variant: conversations and the teams that own them.
const ava = (name: string) => <Avatar name={name} size="sm" className="size-5 rounded-sm text-[9px]" />;
const threadsNav = [
  {
    items: [
      { label: "Threads", href: "/threads", icon: <List size={16} /> },
      { label: "Issues", href: "/issues", icon: <CircleDashed size={16} />, count: 1 },
      { label: "Pull requests", href: "/pulls", icon: <GitPullRequest size={16} /> },
      { label: "Automations", href: "/automations", icon: <Workflow size={16} /> },
      { label: "Explore", href: "/explore", icon: <Compass size={16} /> },
      { label: "More", href: "/more", icon: <MoreHorizontal size={16} /> },
    ],
  },
  {
    label: "Captains",
    actions: (
      <>
        <Button variant="ghost" size="sm" aria-label="Add a captain" icon={<Plus size={14} />} className="size-6" />
        <Button variant="ghost" size="sm" aria-label="More" icon={<MoreHorizontal size={14} />} className="size-6" />
      </>
    ),
    items: [
      { label: "Customers", href: "/c/customers", icon: <Folder size={16} />, extra: <Lock />, meta: "2" },
      { label: "Release", href: "/c/release", avatar: ava("Release"), unread: true, extra: <GripVertical /> },
      { label: "Support", href: "/c/support", avatar: ava("Support"), unread: true, extra: <Lock />, meta: "5d" },
      { label: "Ops", href: "/c/ops", icon: <Folder size={16} />, extra: <Lock /> },
      { label: "Amara", href: "/c/amara", avatar: ava("Amara Okafor"), extra: <Lock />, meta: "2d" },
      {
        label: "Platform",
        href: "/c/platform",
        avatar: ava("Platform"),
        unread: true,
        count: 1,
        children: [{ label: "Toast stacking regression", href: "/c/platform/toast", count: 1, meta: "2d" }],
      },
      { label: "Kenji", href: "/c/kenji", avatar: ava("Kenji Watanabe"), meta: "1w" },
      { label: "Lucía", href: "/c/lucia", avatar: ava("Lucía Fernández"), extra: <Lock /> },
    ],
  },
  {
    label: "Threads",
    actions: (
      <>
        <Button variant="ghost" size="sm" aria-label="Search threads" icon={<Search size={14} />} className="size-6" />
        <Button variant="ghost" size="sm" aria-label="More" icon={<MoreHorizontal size={14} />} className="size-6" />
      </>
    ),
    items: [
      { label: "Pinned", href: "/t/pinned", icon: <Pin size={16} />, meta: "2" },
      { label: "Retry budget for machines", href: "/t/retry", icon: <Cloud size={16} />, secondary: "KAP-10 · Checks · 1 review", meta: "3d" },
      { label: "Sidebar resize keyboard", href: "/t/resize", icon: <Cloud size={16} />, secondary: "KAP-12 · Draft", meta: "4d" },
    ],
  },
];

function ThreadsAccount() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <Avatar name="Lucía Fernández" size="md" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1.5 truncate text-label font-medium text-ink">
          Lucía Fernández <Badge>Pro</Badge>
        </span>
        <span className="truncate text-small text-ink-3">Casa Verde</span>
      </span>
      <span className="size-2 rounded-full bg-warning" aria-label="Away" />
    </div>
  );
}

function SideNavDemo({ variant }: { variant: SideNavVariant }) {
  const threads = variant === "threads";
  const [current, setCurrent] = useState(threads ? "/c/platform/toast" : "/orders/all");
  // Links that switch the demo's page instead of leaving the docs.
  const [DemoLink] = useState(() =>
    function DemoLink({ href, onClick, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
      return (
        <a
          href={href}
          {...rest}
          onClick={(e) => {
            onClick?.(e);
            e.preventDefault();
            if (href) setCurrent(href);
          }}
        />
      );
    },
  );
  const nav = threads ? threadsNav : demoNav;
  const page = (nav as typeof demoNav).flatMap((g) => g.items.flatMap((i) => [i, ...(i.children ?? [])])).find((l) => l.href === current);
  return (
    <AppShell
      className="h-[560px]"
      sidebar={
        <SideNav
          key={variant}
          variant={variant}
          groups={nav}
          current={current}
          as={DemoLink}
          primary={{ label: "New thread", href: "/new", icon: <SquarePen size={16} /> }}
          tools={
            <>
              <Button variant="ghost" size="sm" aria-label="Layout" icon={<LayoutGrid size={15} />} className="size-7" />
              <Button variant="ghost" size="sm" aria-label="Search" icon={<Search size={15} />} className="size-7" />
              <Button variant="ghost" size="sm" aria-label="Fold the sidebar" icon={<PanelLeft size={15} />} className="size-7" />
            </>
          }
          brand={
            <>
              <Mark />
              Casa Verde
            </>
          }
          mark={<Mark />}
          footer={threads ? <ThreadsAccount /> : variant === "rail" || variant === "rail-panel" || variant === "collapsible" ? <Avatar name="Lucía Fernández" size="sm" /> : <Account />}
          workspace={{ name: "Casa Verde", detail: "Lisbon · 3 people", menu: [{ label: "Lumen Studio" }, { label: "New workspace", icon: <Plus size={16} />, separated: true }] }}
        />
      }
      topbar={
        <Topbar crumbs={[{ label: "Shop", href: "#" }, { label: page?.label ?? "" }]} />
      }
    >
      <p className="m-0 text-body text-ink-3">The {page?.label ?? ""} screen goes here. Pick another link in the sidebar.</p>
    </AppShell>
  );
}

shell.splice(1, 0, {
  name: "SideNav",
  controls: { variant: { type: "select", options: sideNavVariants, default: "classic" } },
  stage: "block p-0",
  // Its own state per data set: the threads variant has its own pages.
  preview: (v) => <SideNavDemo key={v.variant === "threads" ? "threads" : "shop"} variant={str(v.variant) as SideNavVariant} />,
  code: (v) =>
    jsx("SideNav", {
      variant: str(v.variant),
      groups: raw('[{ label: "Shop", icon: <ShoppingBag size={18} />, items: [{ label: "Orders", href: "/orders", icon: <ShoppingBag size={16} />, count: 4 }] }]'),
      current: raw("usePathname()"),
      as: raw("Link"),
      brand: raw("<><Mark /> Casa Verde</>"),
      mark: raw("<Mark />"),
      footer: raw("<AccountMenu />"),
    }, undefined, { variant: "classic" }),
});
