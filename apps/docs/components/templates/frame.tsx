"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Inbox as InboxIcon, LayoutGrid, LogOut, Package, Plus, Search, Settings, ShoppingBag, User, Users } from "lucide-react";
import { AppShell, Avatar, Breadcrumbs, Button, CommandPalette, Menu, NotificationCenter, SideNav, Toaster, Topbar, toast, useCommandKey, type SideNavVariant } from "@syvna/ui";

import { LookControls, LookProvider, Stage, useLook } from "../look";
import { SidebarPicker } from "./sidebar-picker";
import { base, customerSlug, customers, nav } from "./data";

const Mark = ({ size = "size-8" }: { size?: string }) => (
  <span className={`grid ${size} flex-none place-items-center rounded-md bg-brand font-display text-caption font-bold text-brand-ink`}>CV</span>
);

function Notifications() {
  const ago = (min: number) => new Date(Date.now() - min * 60_000);
  const [list, setList] = useState([
    { id: "1", actor: "Amara Okafor", title: "Amara approved the refund for order #1041.", body: "$304.00 to Liam O'Connor", date: ago(4), read: false, href: `${base}/approvals` },
    { id: "2", actor: "Kenji Watanabe", title: "Kenji asked for a 20% wholesale discount.", body: "Hinoki Goods · waiting for you", date: ago(52), read: false, href: `${base}/approvals` },
    { id: "3", actor: "Priya Raman", title: "Priya replied to Ana Souza.", date: ago(60 * 26), read: true, href: `${base}/inbox` },
  ]);
  return (
    <NotificationCenter
      notifications={list}
      onRead={(id) => setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
      onReadAll={() => setList((l) => l.map((n) => ({ ...n, read: true })))}
    />
  );
}

function Account({ compact }: { compact: boolean }) {
  return (
    <Menu
      side="above"
      align="start"
      label="Account"
      className={compact ? undefined : "w-full"}
      items={[
        { label: "Your profile", icon: <User size={16} /> },
        { label: "Settings", icon: <Settings size={16} />, href: `${base}/settings` },
        { label: "Sign out", icon: <LogOut size={16} />, href: `${base}/sign-in`, separated: true },
      ]}
      trigger={
        compact ? (
          <button type="button" aria-label="Account" className="cursor-pointer rounded-full">
            <Avatar name="Lucía Fernández" size="sm" />
          </button>
        ) : (
          <button type="button" className="flex w-full cursor-pointer items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-surface-2">
            <Avatar name="Lucía Fernández" size="sm" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-label font-medium text-ink">Lucía Fernández</span>
              <span className="truncate text-caption text-ink-3">Owner</span>
            </span>
          </button>
        )
      }
    />
  );
}

/** The page's place in the template app, for the breadcrumbs. */
function crumbs(path: string) {
  const person = customers.find((c) => path === `${base}/customers/${customerSlug(c.name)}`);
  if (person) return [{ label: "Customers", href: `${base}/customers` }, { label: person.name }];
  for (const g of nav) {
    for (const item of g.items) {
      const child = item.children?.find((c) => c.href === path);
      if (child) return [{ label: item.label, href: item.href }, { label: child.label }];
      if (item.href === path) return [{ label: g.label ?? "Shop", href: `${base}/dashboard` }, { label: item.label }];
    }
  }
  return [{ label: "Shop" }];
}


function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [look, setLook] = useLook();
  const [variant, setVariant] = useState<SideNavVariant>("classic");
  const bare = path.startsWith(`${base}/sign-in`);
  const router = useRouter();
  const [palette, setPalette] = useState(false);
  useCommandKey(() => setPalette(true));
  const go = (to: string) => () => router.push(`${base}/${to}`);
  const narrow = variant === "rail" || variant === "rail-panel";

  return (
    <div className="flex flex-col gap-4">
      {/* Sticks under the top bar while the screen below scrolls. */}
      <div className="sticky top-12 z-20 -mx-(--page-x) border-y border-line bg-ground/90 backdrop-blur-md">
      <LookControls look={look} setLook={setLook} both={false} flat>
        <SidebarPicker value={variant} onChange={setVariant} />
      </LookControls>
      </div>
      <Stage look={look} wide className="block h-[calc(100dvh-5rem)] min-h-[520px] p-0 lg:h-[760px]">
        {() => (
          <>
          {bare ? (
            <div className="h-full overflow-y-auto">{children}</div>
          ) : (
            <AppShell
              className="h-full"
              sidebar={
                <SideNav
                  key={variant}
                  variant={variant}
                  groups={nav}
                  current={path}
                  as={Link}
                  brand={
                    <>
                      <Mark />
                      Casa Verde
                    </>
                  }
                  mark={<Mark />}
                  primary={{ label: "New order", href: `${base}/orders`, icon: <Plus size={16} /> }}
                  tools={<Button variant="ghost" size="sm" aria-label="Notifications" icon={<Bell size={15} />} className="size-7" />}
                  footer={<Account compact={narrow || variant === "collapsible"} />}
                  workspace={{
                    name: "Casa Verde",
                    detail: "Lisbon · 3 people",
                    menu: [
                      { label: "Casa Verde", icon: <Mark size="size-5" /> },
                      { label: "Lumen Studio", icon: <Avatar name="Lumen Studio" size="sm" /> },
                      { label: "New workspace", icon: <Plus size={16} />, separated: true },
                    ],
                  }}
                />
              }
              topbar={
                <Topbar
                  actions={
                    <>
                      <Button size="sm" icon={<Search size={14} />} onClick={() => setPalette(true)} className="text-ink-3">
                        Search <kbd className="ml-1 hidden rounded-sm border border-line px-1 text-caption @3xl:inline">⌘K</kbd>
                      </Button>
                      <Notifications />
                      <Button variant="primary" size="sm" icon={<Plus size={14} />}>
                        New order
                      </Button>
                    </>
                  }
                >
                  <Breadcrumbs as={Link} items={crumbs(path)} />
                </Topbar>
              }
            >
              {children}
            </AppShell>
          )}
        <Toaster />
        <CommandPalette
          open={palette}
          onClose={() => setPalette(false)}
          groups={[
            {
              label: "Go to",
              items: [
                { label: "Dashboard", icon: <LayoutGrid size={16} />, onSelect: go("dashboard") },
                { label: "Orders", icon: <ShoppingBag size={16} />, keywords: ["sales"], onSelect: go("orders") },
                { label: "Order board", icon: <LayoutGrid size={16} />, keywords: ["kanban"], onSelect: go("orders/board") },
                { label: "Customers", icon: <Users size={16} />, onSelect: go("customers") },
                { label: "Inbox", icon: <InboxIcon size={16} />, keywords: ["messages"], onSelect: go("inbox") },
                { label: "Products", icon: <Package size={16} />, onSelect: go("products") },
                { label: "Settings", icon: <Settings size={16} />, keywords: ["preferences"], onSelect: go("settings") },
              ],
            },
            { label: "Create", items: [{ label: "New order", icon: <Plus size={16} />, shortcut: "N", onSelect: () => toast({ title: "New order started", tone: "success" }) }] },
            { label: "Customers", items: customers.map((c) => ({ label: c.name, hint: c.city, icon: <Avatar name={c.name} size="sm" className="size-5 text-[9px]" />, onSelect: go(`customers/${customerSlug(c.name)}`) })) },
          ]}
        />
          </>
        )}
      </Stage>
    </div>
  );
}

/** The templates' frame: the look and sidebar pickers, and the app around each screen. */
export function TemplateFrame({ children }: { children: React.ReactNode }) {
  return (
    <LookProvider>
      <Frame>{children}</Frame>
    </LookProvider>
  );
}
