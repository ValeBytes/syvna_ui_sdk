import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { customerSlug, customers } from "@/components/templates/data";
import { Customers, Dashboard, Onboarding, Orders, Products, SettingsScreen, SignIn } from "@/components/templates/screens";
import { CustomerDetail, Inbox, Welcome } from "@/components/templates/screens-more";
import { Approvals, Assistant, Billing, Developers, Reports, Team } from "@/components/templates/screens-workspace";

const screens = ["dashboard", "orders", "customers", "inbox", "products", "settings", "onboarding", "welcome", "sign-in", "reports", "approvals", "assistant", "team", "billing", "developers"] as const;

export function generateStaticParams() {
  return [{ page: [] }, ...screens.map((s) => ({ page: [s] })), ...customers.map((c) => ({ page: ["customers", customerSlug(c.name)] }))];
}

export const metadata: Metadata = { title: "Templates" };

/** /templates/<screen>/<view>: the screen, and the view inside it (a tab, a filter). */
export default async function TemplatePage({ params }: { params: Promise<{ page?: string[] }> }) {
  const { page = [] } = await params;
  const [screen = "dashboard", view] = page;
  switch (screen) {
    case "dashboard":
      return <Dashboard />;
    case "orders":
      return <Orders key={view} view={view} />;
    case "customers":
      return view ? <CustomerDetail slug={view} /> : <Customers />;
    case "inbox":
      return <Inbox />;
    case "welcome":
      return <Welcome />;
    case "products":
      return <Products key={view} view={view} />;
    case "settings":
      return <SettingsScreen key={view} view={view} />;
    case "onboarding":
      return <Onboarding />;
    case "reports":
      return <Reports />;
    case "approvals":
      return <Approvals />;
    case "assistant":
      return <Assistant />;
    case "team":
      return <Team key={view} view={view} />;
    case "billing":
      return <Billing />;
    case "developers":
      return <Developers key={view} view={view} />;
    case "sign-in":
      return <SignIn />;
    default:
      notFound();
  }
}
