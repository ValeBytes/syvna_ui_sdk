"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Progress,
  Skeleton,
  StatCard,
  Table,
  Tabs,
  type Tone,
} from "@syvna/ui";

import { bool, indent, jsx, num, raw, str } from "./code";
import type { Doc } from "./types";

const tones = ["neutral", "brand", "success", "warning", "danger", "info"] as const;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type Invoice = { id: string; customer: string; country: string; total: number; status: "paid" | "due" | "overdue" | "draft" };
const invoices: Invoice[] = [
  { id: "INV-2041", customer: "Amara Okafor", country: "Nigeria", total: 1240, status: "paid" },
  { id: "INV-2040", customer: "Lumen Studio", country: "Germany", total: 860.5, status: "due" },
  { id: "INV-2039", customer: "Kenji Watanabe", country: "Japan", total: 3200, status: "overdue" },
  { id: "INV-2038", customer: "Casa Verde", country: "Brazil", total: 415, status: "paid" },
  { id: "INV-2037", customer: "Priya Raman", country: "India", total: 98.2, status: "draft" },
];
const statusTone = { paid: "success", due: "warning", overdue: "danger", draft: "neutral" } as const;
const statusWord = { paid: "Paid", due: "Due", overdue: "Overdue", draft: "Draft" };

function InvoiceTable({ dense, clickable, empty }: { dense: boolean; clickable: boolean; empty: boolean }) {
  const [open, setOpen] = useState<string>();
  return (
    <Table
      className="w-full"
      caption="Invoices"
      rows={empty ? [] : invoices}
      rowKey={(r) => r.id}
      dense={dense}
      selected={open ? [open] : []}
      onRowClick={clickable ? (r) => setOpen(r.id) : undefined}
      empty={<EmptyState icon={<Users size={22} />} title="No invoices yet" description="Invoices appear here once you send one." action={<Button variant="primary">New invoice</Button>} />}
      columns={[
        { key: "customer", header: "Customer", sort: (a, b) => a.customer.localeCompare(b.customer) },
        { key: "id", header: "Invoice", render: (r) => <span className="font-mono text-[13px]">{r.id}</span> },
        { key: "country", header: "Country" },
        { key: "status", header: "Status", render: (r) => <Badge tone={statusTone[r.status]} dot>{statusWord[r.status]}</Badge> },
        { key: "total", header: "Total", align: "end", sort: (a, b) => a.total - b.total, render: (r) => money.format(r.total) },
      ]}
    />
  );
}

function DialogDemo({ size, busyFor }: { size: "sm" | "md" | "lg"; busyFor: boolean }) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const remove = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setOpen(false);
    }, 1400);
  };
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete order
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        busy={busy || busyFor}
        size={size}
        title="Delete order INV-2039?"
        description="Kenji Watanabe's order for $3,200.00 goes for good. This can't be undone."
        footer={
          <>
            <Button onClick={() => setOpen(false)} disabled={busy || busyFor}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy || busyFor} onClick={remove}>
              {busy || busyFor ? "Deleting" : "Delete order"}
            </Button>
          </>
        }
      />
    </>
  );
}

export const dataLayout: Doc[] = [
  {
    name: "Table",
    controls: {
      dense: { type: "boolean", default: false },
      clickable: { type: "boolean", default: true, label: "Rows open (onRowClick)" },
      empty: { type: "boolean", default: false, label: "No rows" },
    },
    stage: "items-start",
    preview: (v) => <InvoiceTable dense={bool(v.dense)} clickable={bool(v.clickable)} empty={bool(v.empty)} />,
    code: (v) =>
      jsx("Table", {
        caption: "Invoices",
        rows: raw("invoices"),
        rowKey: raw("(r) => r.id"),
        dense: bool(v.dense),
        onRowClick: bool(v.clickable) ? raw("(r) => setOpen(r.id)") : undefined,
        empty: raw('<EmptyState title="No invoices yet" />'),
        columns: raw(
          "[\n" +
            indent(
              [
                '{ key: "customer", header: "Customer", sort: (a, b) => a.customer.localeCompare(b.customer) },',
                '{ key: "status", header: "Status", render: (r) => <Badge tone="success" dot>Paid</Badge> },',
                '{ key: "total", header: "Total", align: "end", render: (r) => money.format(r.total) },',
              ].join("\n"),
            ) +
            "\n]",
        ),
      }),
  },
  {
    name: "StatCard",
    controls: {
      label: { type: "text", default: "Revenue this week" },
      value: { type: "text", default: "$18,240" },
      change: { type: "text", default: "12.4%" },
      trend: { type: "select", options: ["up", "down", "flat"], default: "up" },
      upIsGood: { type: "boolean", default: true, label: "Up is good" },
      hint: { type: "text", default: "vs last week" },
    },
    preview: (v) => (
      <StatCard
        className="w-[280px]"
        label={str(v.label)}
        value={str(v.value)}
        change={str(v.change) ? { value: str(v.change), trend: str(v.trend) as "up", upIsGood: bool(v.upIsGood) } : undefined}
        hint={str(v.hint) || undefined}
      />
    ),
    code: (v) =>
      jsx("StatCard", {
        label: str(v.label),
        value: str(v.value),
        change: str(v.change)
          ? raw(`{ value: "${str(v.change)}", trend: "${str(v.trend)}"${bool(v.upIsGood) ? "" : ", upIsGood: false"} }`)
          : undefined,
        hint: str(v.hint),
      }),
  },
  {
    name: "Badge",
    controls: {
      label: { type: "text", default: "Paid" },
      tone: { type: "select", options: tones, default: "success" },
      dot: { type: "boolean", default: false },
    },
    preview: (v) => (
      <Badge tone={str(v.tone) as Tone} dot={bool(v.dot)}>
        {str(v.label)}
      </Badge>
    ),
    code: (v) => jsx("Badge", { tone: str(v.tone), dot: bool(v.dot) }, str(v.label), { tone: "neutral" }),
  },
  {
    name: "Avatar",
    controls: {
      name: { type: "text", default: "Amara Okafor" },
      size: { type: "select", options: ["sm", "md", "lg", "xl"], default: "lg" },
      photo: { type: "boolean", default: false },
    },
    preview: (v) => (
      <Avatar
        name={str(v.name)}
        size={str(v.size) as "md"}
        src={
          bool(v.photo)
            ? "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&h=160&q=80"
            : undefined
        }
      />
    ),
    code: (v) => jsx("Avatar", { name: str(v.name), size: str(v.size), src: bool(v.photo) ? "/photos/amara.jpg" : undefined }, undefined, { size: "md" }),
  },
  {
    name: "Progress",
    controls: {
      label: { type: "text", default: "Monthly sales goal" },
      value: { type: "number", default: 62, min: 0, max: 100 },
      tone: { type: "select", options: tones, default: "brand" },
      showValue: { type: "boolean", default: true, label: "Show value" },
    },
    preview: (v) => (
      <Progress className="w-full max-w-[420px]" label={str(v.label)} value={num(v.value)} tone={str(v.tone) as Tone} showValue={bool(v.showValue)} />
    ),
    code: (v) => jsx("Progress", { label: str(v.label), value: num(v.value), tone: str(v.tone), showValue: bool(v.showValue) }, undefined, { tone: "brand" }),
  },
  {
    name: "Card",
    controls: {
      title: { type: "text", default: "Payout" },
      description: { type: "text", default: "Sent to your bank every Friday." },
      actions: { type: "boolean", default: true },
      footer: { type: "boolean", default: true },
      padded: { type: "boolean", default: true },
    },
    preview: (v) => (
      <Card
        className="w-full max-w-[380px]"
        title={str(v.title) || undefined}
        description={str(v.description) || undefined}
        padded={bool(v.padded)}
        actions={bool(v.actions) ? <Button size="sm" variant="ghost">Details</Button> : undefined}
        footer={
          bool(v.footer) ? (
            <>
              <span>Next payout</span>
              <span className="font-medium text-ink">Friday</span>
            </>
          ) : undefined
        }
      >
        <p className="m-0 font-display text-[30px]/9 font-semibold tracking-tight text-ink tabular-nums">{money.format(4380.25)}</p>
        <p className="m-0 mt-1 text-sm text-ink-3">From 46 orders</p>
      </Card>
    ),
    code: (v) =>
      jsx(
        "Card",
        {
          title: str(v.title),
          description: str(v.description),
          padded: bool(v.padded) ? undefined : raw("false"),
          actions: bool(v.actions) ? raw('<Button size="sm" variant="ghost">Details</Button>') : undefined,
          footer: bool(v.footer) ? raw("<><span>Next payout</span><span>Friday</span></>") : undefined,
        },
        '<p className="text-[30px] font-semibold">$4,380.25</p>',
      ),
  },
  {
    name: "Tabs",
    controls: {
      variant: { type: "select", options: ["line", "pills", "cupertino", "soft", "solid", "enclosed", "vertical"], default: "line" },
      counts: { type: "boolean", default: true },
      gallery: { type: "boolean", default: true, label: "Show all seven" },
    },
    stage: "items-start",
    preview: (v) => {
      const items = [
        { value: "overview", label: "Overview" },
        { value: "orders", label: "Orders", count: bool(v.counts) ? 12 : undefined },
        { value: "notes", label: "Notes" },
        { value: "files", label: "Files" },
      ];
      const body = (t: string) => <p className="m-0 text-label text-ink-3">{t === "orders" ? "12 orders since March." : t === "notes" ? "No notes yet." : t === "files" ? "Two invoices and a photo." : "Last order 3 days ago."}</p>;
      return bool(v.gallery) ? (
        <div className="flex w-full flex-col gap-7">
          {(["line", "pills", "cupertino", "soft", "solid", "enclosed", "vertical"] as const).map((variant) => (
            <div key={variant} className="flex flex-col gap-2">
              <span className="font-mono text-caption text-ink-3">{variant}</span>
              <Tabs label={`Customer, ${variant}`} variant={variant} items={items}>
                {body}
              </Tabs>
            </div>
          ))}
        </div>
      ) : (
        <Tabs key={str(v.variant)} className="w-full" label="Customer" variant={str(v.variant) as "line"} items={items}>
          {body}
        </Tabs>
      );
    },
    code: (v) =>
      jsx(
        "Tabs",
        {
          label: "Customer",
          variant: str(v.variant),
          items: raw(`[{ value: "overview", label: "Overview" }, { value: "orders", label: "Orders"${bool(v.counts) ? ", count: 12" : ""} }]`),
        },
        "{(tab) => (tab === \"orders\" ? <OrdersList /> : <Overview />)}",
        { variant: "line" },
      ),
  },
  {
    name: "EmptyState",
    controls: {
      title: { type: "text", default: "No customers yet" },
      description: { type: "text", default: "Customers appear here after their first order. You can also add one yourself." },
      icon: { type: "boolean", default: true },
      action: { type: "boolean", default: true },
    },
    preview: (v) => (
      <Card padded={false} className="w-full max-w-[520px]">
        <EmptyState
          icon={bool(v.icon) ? <Users size={22} /> : undefined}
          title={str(v.title)}
          description={str(v.description) || undefined}
          action={bool(v.action) ? <Button variant="primary">Add customer</Button> : undefined}
        />
      </Card>
    ),
    code: (v) =>
      jsx("EmptyState", {
        icon: bool(v.icon) ? raw("<Users size={22} />") : undefined,
        title: str(v.title),
        description: str(v.description),
        action: bool(v.action) ? raw('<Button variant="primary">Add customer</Button>') : undefined,
      }),
  },
  {
    name: "Skeleton",
    controls: { shape: { type: "select", options: ["text", "circle", "block"], default: "text" }, width: { type: "text", default: "60%" } },
    preview: (v) => (
      <div className="flex w-full max-w-[420px] flex-col gap-3">
        <Skeleton shape={str(v.shape) as "text"} width={str(v.width) || undefined} />
        {v.shape === "text" ? <Skeleton width="85%" /> : null}
      </div>
    ),
    code: (v) => jsx("Skeleton", { shape: str(v.shape), width: str(v.width) }, undefined, { shape: "text" }),
  },
  {
    name: "Alert",
    controls: {
      tone: { type: "select", options: ["danger", "warning", "success", "info"], default: "danger" },
      title: { type: "text", default: "Payment failed" },
      body: { type: "text", default: "Your card was declined. Update it to keep your shop online.", label: "Text" },
      action: { type: "boolean", default: true },
      dismissible: { type: "boolean", default: false, label: "Dismissible" },
    },
    preview: (v) => (
      <Alert
        className="w-full max-w-[560px]"
        tone={str(v.tone) as "info"}
        title={str(v.title) || undefined}
        action={bool(v.action) ? <Button size="sm">Update card</Button> : undefined}
        onDismiss={bool(v.dismissible) ? () => {} : undefined}
      >
        {str(v.body) || undefined}
      </Alert>
    ),
    code: (v) =>
      jsx(
        "Alert",
        {
          tone: str(v.tone),
          title: str(v.title),
          action: bool(v.action) ? raw('<Button size="sm">Update card</Button>') : undefined,
          onDismiss: bool(v.dismissible) ? raw("() => setShown(false)") : undefined,
        },
        str(v.body) || undefined,
        { tone: "info" },
      ),
  },
  {
    name: "Dialog",
    controls: {
      size: { type: "select", options: ["sm", "md", "lg"], default: "sm" },
      busy: { type: "boolean", default: false },
    },
    stage: "min-h-[380px]",
    preview: (v) => <DialogDemo key={str(v.size)} size={str(v.size) as "sm"} busyFor={bool(v.busy)} />,
    code: (v) =>
      jsx(
        "Dialog",
        {
          open: raw("open"),
          onClose: raw("() => setOpen(false)"),
          busy: bool(v.busy) ? raw("deleting") : undefined,
          size: str(v.size),
          title: "Delete order INV-2039?",
          description: "Kenji Watanabe's order for $3,200.00 goes for good. This can't be undone.",
          footer: raw(
            '<>\n    <Button onClick={() => setOpen(false)}>Cancel</Button>\n    <Button variant="danger" loading={deleting} onClick={remove}>Delete order</Button>\n  </>',
          ),
        },
        undefined,
        { size: "md" },
      ),
  },
];
