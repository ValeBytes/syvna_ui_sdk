// The template app: a shop called Casa Verde, selling homeware worldwide.
// Its screens are in screens.tsx; frame.tsx puts them in an AppShell.

import {
  Bot,
  Boxes,
  Building2,
  CircleCheck,
  CreditCard,
  Home,
  Inbox,
  KeyRound,
  LayoutGrid,
  LineChart,
  LogIn,
  Package,
  Rocket,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Undo2,
  Users,
  UsersRound,
} from "lucide-react";
import type { NavGroup } from "@syvna/ui";

export const base = "/templates";

export const nav: NavGroup[] = [
  {
    label: "Shop",
    icon: <Store size={18} />,
    items: [
      { label: "Dashboard", href: `${base}/dashboard`, icon: <Home size={16} />, description: "What needs doing today" },
      {
        label: "Orders",
        href: `${base}/orders`,
        icon: <ShoppingBag size={16} />,
        count: 4,
        description: "New, packing and shipped",
        children: [
          { label: "All orders", href: `${base}/orders/all` },
          { label: "Board", href: `${base}/orders/board` },
          { label: "Returns", href: `${base}/orders/returns` },
        ],
      },
      { label: "Customers", href: `${base}/customers`, icon: <Users size={16} />, description: "Who buys, and from where" },
      { label: "Inbox", href: `${base}/inbox`, icon: <Inbox size={16} />, count: 3, description: "Customers' messages" },
      {
        label: "Products",
        href: `${base}/products`,
        icon: <Package size={16} />,
        description: "The catalogue and its stock",
        children: [
          { label: "Catalogue", href: `${base}/products/catalogue` },
          { label: "Stock", href: `${base}/products/stock` },
        ],
      },
    ],
  },
  {
    label: "Workspace",
    icon: <Building2 size={18} />,
    items: [
      { label: "Reports", href: `${base}/reports`, icon: <LineChart size={16} />, description: "Revenue and orders over any period" },
      { label: "Approvals", href: `${base}/approvals`, icon: <CircleCheck size={16} />, count: 2, description: "Refunds and discounts to sign off" },
      { label: "Assistant", href: `${base}/assistant`, icon: <Bot size={16} />, description: "Ask the agent to do the work" },
      {
        label: "Team",
        href: `${base}/team`,
        icon: <UsersRound size={16} />,
        description: "Members, roles, activity",
        children: [
          { label: "Members", href: `${base}/team/members` },
          { label: "Roles", href: `${base}/team/roles` },
          { label: "Activity", href: `${base}/team/activity` },
        ],
      },
      { label: "Billing", href: `${base}/billing`, icon: <CreditCard size={16} />, description: "Plan, usage, invoices" },
      { label: "Developers", href: `${base}/developers`, icon: <KeyRound size={16} />, description: "API keys, webhooks" },
    ],
  },
  {
    label: "Get started",
    icon: <Rocket size={18} />,
    items: [
      { label: "Setup", href: `${base}/onboarding`, icon: <Rocket size={16} />, description: "Add a product, take a payment" },
      { label: "Empty shop", href: `${base}/welcome`, icon: <Sparkles size={16} />, description: "What a new shop sees first" },
      { label: "Sign in page", href: `${base}/sign-in`, icon: <LogIn size={16} />, description: "What customers see first" },
    ],
  },
  {
    label: "Settings",
    icon: <Settings size={18} />,
    items: [
      {
        label: "Settings",
        href: `${base}/settings`,
        icon: <Settings size={16} />,
        description: "Shop, payments, team",
        children: [
          { label: "General", href: `${base}/settings/general` },
          { label: "Payments", href: `${base}/settings/payments` },
          { label: "Team", href: `${base}/settings/team` },
        ],
      },
    ],
  },
];

/** Icons the screens use, kept here so the screens stay about layout. */
export const icons = { Boxes, LayoutGrid, Undo2 };

export const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export type Order = { id: string; who: string; city: string; country: string; items: number; total: number; status: "new" | "packing" | "shipped" | "delivered" | "returned"; placed: string };

export const orders: Order[] = [
  { id: "1048", who: "Amara Okafor", city: "Lagos", country: "Nigeria", items: 3, total: 128, status: "new", placed: "09:24" },
  { id: "1047", who: "Kenji Watanabe", city: "Osaka", country: "Japan", items: 1, total: 46, status: "new", placed: "08:51" },
  { id: "1046", who: "Priya Raman", city: "Bengaluru", country: "India", items: 5, total: 212.5, status: "packing", placed: "Yesterday" },
  { id: "1045", who: "Jonas Becker", city: "Hamburg", country: "Germany", items: 2, total: 74, status: "packing", placed: "Yesterday" },
  { id: "1044", who: "Ana Souza", city: "São Paulo", country: "Brazil", items: 4, total: 159, status: "shipped", placed: "Mon" },
  { id: "1043", who: "Lucas Moreau", city: "Lyon", country: "France", items: 1, total: 38, status: "shipped", placed: "Mon" },
  { id: "1042", who: "Fatima Zahra", city: "Casablanca", country: "Morocco", items: 2, total: 96, status: "delivered", placed: "Sun" },
  { id: "1041", who: "Liam O'Connor", city: "Dublin", country: "Ireland", items: 6, total: 304, status: "delivered", placed: "Sat" },
  { id: "1040", who: "Mei Lin", city: "Taipei", country: "Taiwan", items: 1, total: 52, status: "returned", placed: "Fri" },
];

export const statusTone = { new: "info", packing: "warning", shipped: "brand", delivered: "success", returned: "danger" } as const;
export const statusWord = { new: "New", packing: "Packing", shipped: "Shipped", delivered: "Delivered", returned: "Returned" };

export type Customer = { name: string; email: string; city: string; country: string; orders: number; spent: number; since: string; status: "active" | "new" | "quiet" };

export const customers: Customer[] = [
  { name: "Amara Okafor", email: "amara@example.com", city: "Lagos", country: "Nigeria", orders: 14, spent: 1912.4, since: "2023", status: "active" },
  { name: "Kenji Watanabe", email: "kenji@example.com", city: "Osaka", country: "Japan", orders: 6, spent: 612, since: "2024", status: "active" },
  { name: "Priya Raman", email: "priya@example.com", city: "Bengaluru", country: "India", orders: 9, spent: 1240.5, since: "2023", status: "active" },
  { name: "Jonas Becker", email: "jonas@example.com", city: "Hamburg", country: "Germany", orders: 2, spent: 148, since: "2026", status: "new" },
  { name: "Ana Souza", email: "ana@example.com", city: "São Paulo", country: "Brazil", orders: 11, spent: 1580, since: "2022", status: "active" },
  { name: "Lucas Moreau", email: "lucas@example.com", city: "Lyon", country: "France", orders: 1, spent: 38, since: "2026", status: "new" },
  { name: "Mei Lin", email: "mei@example.com", city: "Taipei", country: "Taiwan", orders: 3, spent: 210, since: "2024", status: "quiet" },
  { name: "Fatima Zahra", email: "fatima@example.com", city: "Casablanca", country: "Morocco", orders: 4, spent: 380, since: "2025", status: "active" },
  { name: "Liam O'Connor", email: "liam@example.com", city: "Dublin", country: "Ireland", orders: 7, spent: 966, since: "2023", status: "active" },
  { name: "Sofía Herrera", email: "sofia@example.com", city: "Bogotá", country: "Colombia", orders: 1, spent: 64, since: "2026", status: "new" },
  { name: "Arjun Mehta", email: "arjun@example.com", city: "Mumbai", country: "India", orders: 5, spent: 702, since: "2024", status: "quiet" },
  { name: "Hana Kim", email: "hana@example.com", city: "Seoul", country: "South Korea", orders: 8, spent: 1120, since: "2023", status: "active" },
];

/** Amara Okafor → amara-okafor. */
export const customerSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export type Product = { name: string; sku: string; price: number; stock: number; sold: number };

export const products: Product[] = [
  { name: "Ceramic mug", sku: "CV-MUG-01", price: 24, stock: 86, sold: 128 },
  { name: "Linen apron", sku: "CV-APR-02", price: 38, stock: 12, sold: 74 },
  { name: "Olive wood board", sku: "CV-BRD-03", price: 56, stock: 4, sold: 51 },
  { name: "Woven basket", sku: "CV-BSK-04", price: 42, stock: 0, sold: 33 },
  { name: "Glass carafe", sku: "CV-CRF-05", price: 31, stock: 40, sold: 29 },
  { name: "Cotton napkins (set of 4)", sku: "CV-NAP-06", price: 22, stock: 120, sold: 66 },
];
