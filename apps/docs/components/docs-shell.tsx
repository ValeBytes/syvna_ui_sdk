"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Bot, LayoutTemplate, Palette } from "lucide-react";
import { AppShell, Breadcrumbs, NavItem, NavSection, SegmentedControl, Sidebar, Topbar } from "@syvna/ui";

import { all, groups, kits, type Kit } from "@/registry/meta";

import { ThemeToggle } from "./theme-toggle";

/** The docs site's frame, built from the library itself. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const current = all.find((c) => path === `/components/${c.slug}`);
  // Two kits: the dashboard's components and the website's. A component's page opens its own kit.
  const onSites = path.startsWith("/sites");
  const [kit, setKit] = useState<Kit>(current?.kit ?? (onSites ? "website" : "dashboard"));
  useEffect(() => {
    if (current) setKit(current.kit);
    else if (onSites) setKit("website");
    else if (path.startsWith("/templates")) setKit("dashboard");
  }, [current, onSites, path]);
  const page = current ? current.name : path === "/tokens" ? "Tokens" : path === "/agents" ? "For agents" : path.startsWith("/templates") || onSites ? "Templates" : "Overview";
  return (
    <AppShell
      width="full"
      sidebar={
        <Sidebar
          brand={
            <>
              <span className="grid size-7 place-items-center rounded-md bg-brand font-display text-xs font-bold text-brand-ink">S</span>
              Syvna UI
            </>
          }
        >
          <NavSection>
            <NavItem as={Link} href="/" icon={<BookOpen size={16} />} label="Overview" active={path === "/"} />
            <NavItem as={Link} href="/tokens" icon={<Palette size={16} />} label="Tokens" active={path === "/tokens"} />
            <NavItem as={Link} href="/agents" icon={<Bot size={16} />} label="For agents" active={path === "/agents"} />
            <NavItem as={Link} href={kit === "website" ? "/sites/landing" : "/templates/dashboard"} icon={<LayoutTemplate size={16} />} label="Templates" active={kit === "website" ? onSites : path.startsWith("/templates")} />
          </NavSection>
          <SegmentedControl block size="sm" label="Kit" value={kit} onValueChange={(v) => setKit(v as Kit)} options={kits.map((k) => ({ value: k.value, label: k.label }))} />
          {groups.filter((g) => g.kit === kit).map((g) => (
            <NavSection key={g.name} label={g.name}>
              {g.items.map((name) => {
                const href = `/components/${all.find((c) => c.name === name)!.slug}`;
                return <NavItem key={name} as={Link} href={href} label={name} active={path === href} className="h-8" />;
              })}
            </NavSection>
          ))}
        </Sidebar>
      }
      topbar={
        <Topbar actions={<ThemeToggle />}>
          <Breadcrumbs as={Link} items={current ? [{ label: current.group, href: "/" }, { label: current.name }] : [{ label: page }]} />
        </Topbar>
      }
    >
      {children}
    </AppShell>
  );
}
