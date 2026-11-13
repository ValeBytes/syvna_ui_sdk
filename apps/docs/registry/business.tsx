"use client";

import { useState } from "react";
import { Archive, Building2, Download, FileText, Folder, Mail, Plus, Trash2, Users } from "lucide-react";
import {
  Accordion,
  ApiKeyField,
  ApprovalCard,
  AuditLog,
  AvatarGroup,
  Banner,
  BulkActionBar,
  Button,
  ButtonGroup,
  ColumnSettings,
  ConfirmByTyping,
  CopyButton,
  CurrencyInput,
  DateRangePicker,
  InlineEdit,
  InviteMembers,
  Kbd,
  KeyValueEditor,
  NotificationCenter,
  NumberInput,
  PermissionMatrix,
  PlanSummary,
  RangeCalendar,
  RelativeTime,
  SaveBar,
  SavedViews,
  SetupChecklist,
  Slider,
  SplitButton,
  Stepper,
  TagInput,
  ToggleButton,
  TransferList,
  TreeView,
  UsageMeter,
  rangePresets,
  type ColumnSetting,
  type DateRange,
  type SavedView,
  type Tone,
} from "@syvna/ui";

import { bool, jsx, num, raw, str } from "./code";
import type { Doc } from "./types";

const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const ago = (min: number) => new Date(Date.now() - min * 60_000);

/* ---------- stateful demos ---------- */

function RangeDemo({ compare, instant, presets }: { compare: boolean; instant: boolean; presets: boolean }) {
  const [r, setR] = useState<DateRange | null>(() => rangePresets()[3]!.range());
  const [vs, setVs] = useState<DateRange | null>(null);
  return (
    <div className="flex w-full max-w-[340px] flex-col gap-2">
      <DateRangePicker locale="en-US" value={r} compare={compare} instant={instant} presets={presets ? undefined : []} onChange={(x, c) => (setR(x), setVs(c))} />
      <p className="m-0 text-small text-ink-3">{r ? `${fmt.format(r.from)} – ${fmt.format(r.to)}${vs ? ` vs ${fmt.format(vs.from)} – ${fmt.format(vs.to)}` : ""}` : "No dates"}</p>
    </div>
  );
}

function RangeCalendarDemo() {
  const [r, setR] = useState<DateRange | null>(null);
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <RangeCalendar locale="en-US" value={r} onChange={setR} />
      <p className="m-0 text-small text-ink-3">{r ? `${fmt.format(r.from)} – ${fmt.format(r.to)}` : "Click a first day, then a last."}</p>
    </div>
  );
}

function BulkDemo({ variant }: { variant: "bar" | "floating" }) {
  const [n, setN] = useState(3);
  return (
    <div className="flex w-full max-w-[640px] flex-col gap-3">
      {n ? null : (
        <Button size="sm" onClick={() => setN(3)}>
          Select 3 rows
        </Button>
      )}
      <BulkActionBar variant={variant} count={n} total={1240} noun={["order", "orders"]} onSelectAll={() => setN(1240)} onClear={() => setN(0)}>
        <Button size="sm" icon={<Download size={14} />}>
          Export
        </Button>
        <Button size="sm" icon={<Archive size={14} />}>
          Archive
        </Button>
        <Button size="sm" variant="danger-soft" icon={<Trash2 size={14} />}>
          Delete
        </Button>
      </BulkActionBar>
    </div>
  );
}

function ColumnsDemo() {
  const start: ColumnSetting[] = [
    { id: "customer", label: "Customer", visible: true, locked: true },
    { id: "id", label: "Order", visible: true },
    { id: "country", label: "Country", visible: true },
    { id: "status", label: "Status", visible: true },
    { id: "channel", label: "Channel", visible: false },
    { id: "total", label: "Total", visible: true },
  ];
  const [cols, setCols] = useState(start);
  const [density, setDensity] = useState<"compact" | "default" | "comfortable">("default");
  return (
    <div className="flex w-full max-w-[560px] flex-col items-end gap-3 pb-72">
      <ColumnSettings columns={cols} onChange={setCols} density={density} onDensityChange={setDensity} onReset={() => setCols(start)} />
      <p className="m-0 self-start text-small text-ink-3">
        Showing: {cols.filter((c) => c.visible).map((c) => c.label).join(" · ")} ({density})
      </p>
    </div>
  );
}

function ViewsDemo() {
  const [views, setViews] = useState<SavedView[]>([
    { id: "all", name: "All orders", system: true },
    { id: "open", name: "Open", isDefault: true },
    { id: "late", name: "Overdue", shared: true },
    { id: "mine", name: "My accounts" },
  ]);
  const [cur, setCur] = useState("open");
  const [dirty, setDirty] = useState(true);
  return (
    <div className="flex w-full max-w-[640px] flex-col gap-3 pb-48">
      <SavedViews
        views={views}
        current={cur}
        onSelect={(id) => (setCur(id), setDirty(false))}
        dirty={dirty}
        onSave={() => setDirty(false)}
        onSaveAs={(name) => {
          const id = name.toLowerCase().replace(/\s+/g, "-");
          setViews((v) => [...v, { id, name }]);
          setCur(id);
          setDirty(false);
        }}
        onRename={(id, name) => setViews((v) => v.map((x) => (x.id === id ? { ...x, name } : x)))}
        onDelete={(id) => (setViews((v) => v.filter((x) => x.id !== id)), setCur("all"))}
        onSetDefault={(id) => setViews((v) => v.map((x) => ({ ...x, isDefault: x.id === id })))}
      />
      <Button size="sm" className="self-start" onClick={() => setDirty(true)}>
        Change a filter
      </Button>
    </div>
  );
}

const perms = [
  { id: "orders.view", label: "orders.view" },
  { id: "orders.edit", label: "orders.edit" },
  { id: "orders.refund", label: "orders.refund" },
  { id: "customers.view", label: "customers.view" },
  { id: "customers.export", label: "customers.export" },
  { id: "billing.manage", label: "billing.manage" },
  { id: "members.invite", label: "members.invite" },
  { id: "settings.manage", label: "settings.manage" },
];

function TransferDemo() {
  const [v, setV] = useState(["orders.view", "customers.view"]);
  return <TransferList className="max-w-[640px]" titles={["Available permissions", "Support role has"]} items={perms.map((p) => ({ ...p, label: p.label }))} value={v} onChange={setV} />;
}

function TreeDemo({ checkable }: { checkable: boolean }) {
  const [sel, setSel] = useState("emea");
  const [checked, setChecked] = useState<string[]>(["lisbon"]);
  return (
    <TreeView
      className="w-full max-w-[340px] rounded-lg border border-line bg-surface p-1.5"
      label="Teams"
      selected={sel}
      onSelect={setSel}
      checkable={checkable}
      checked={checked}
      onCheckedChange={setChecked}
      nodes={[
        {
          id: "co",
          label: "Casa Verde",
          icon: <Building2 />,
          children: [
            { id: "emea", label: "Europe and Africa", icon: <Folder />, meta: "24", children: [{ id: "lisbon", label: "Lisbon", meta: "12" }, { id: "lagos", label: "Lagos", meta: "8" }, { id: "hamburg", label: "Hamburg", meta: "4" }] },
            { id: "apac", label: "Asia Pacific", icon: <Folder />, meta: "9", children: [{ id: "osaka", label: "Osaka", meta: "6" }, { id: "sydney", label: "Sydney", meta: "3" }] },
            { id: "amer", label: "Americas", icon: <Folder />, meta: "5", children: [{ id: "sao", label: "São Paulo", meta: "5" }] },
          ],
        },
      ]}
    />
  );
}

function NotifDemo() {
  const [list, setList] = useState([
    { id: "1", actor: "Amara Okafor", title: "Amara approved the refund for INV-2041.", body: "$1,240.00 to Lumen Studio", date: ago(4), read: false },
    { id: "2", actor: "Kenji Watanabe", title: "Kenji mentioned you on Order #8812.", body: "“Can we ship this before Friday?”", date: ago(52), read: false },
    { id: "3", title: "Your payout of $8,420.18 is on its way.", date: ago(60 * 26), read: true, icon: <FileText /> },
    { id: "4", actor: "Lucía Fernández", title: "Lucía joined Casa Verde.", date: ago(60 * 50), read: true },
  ]);
  return (
    <div className="flex w-full justify-end pb-[420px]">
      <NotificationCenter
        notifications={list}
        onRead={(id) => setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
        onReadAll={() => setList((l) => l.map((n) => ({ ...n, read: true })))}
        footer={<a href="#all" className="text-ink-2 no-underline hover:text-ink">See all notifications</a>}
      />
    </div>
  );
}

function MatrixDemo() {
  const [v, setV] = useState<Record<string, string[]>>({ admin: perms.map((p) => p.id).filter((p) => p !== "billing.manage"), support: ["orders.view", "orders.edit", "customers.view"], viewer: ["orders.view", "customers.view"] });
  const [saved, setSaved] = useState(v);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  return (
    <div className="flex w-full flex-col gap-3">
      <PermissionMatrix
        roles={[{ id: "owner", name: "Owner", locked: true }, { id: "admin", name: "Admin" }, { id: "support", name: "Support" }, { id: "viewer", name: "Viewer" }]}
        groups={[
          { name: "Orders", permissions: [{ id: "orders.view", label: "See orders" }, { id: "orders.edit", label: "Edit orders" }, { id: "orders.refund", label: "Refund orders", description: "Money leaves the account" }] },
          { name: "Customers", permissions: [{ id: "customers.view", label: "See customers" }, { id: "customers.export", label: "Export customers", description: "Includes emails and addresses" }] },
          { name: "Workspace", permissions: [{ id: "billing.manage", label: "Manage billing" }, { id: "members.invite", label: "Invite people" }, { id: "settings.manage", label: "Change settings" }] },
        ]}
        value={v}
        onChange={setV}
      />
      <SaveBar position="inline" dirty={dirty} message="Permissions changed" onSave={() => setSaved(v)} onDiscard={() => setV(saved)} />
    </div>
  );
}

function InviteDemo() {
  const [pending, setPending] = useState([
    { email: "kenji@hinoki.jp", role: "support", sentAt: ago(60 * 30) },
    { email: "priya@raman.in", role: "viewer", sentAt: ago(60 * 75) },
  ]);
  return (
    <InviteMembers
      className="w-full max-w-[600px]"
      seatsLeft={3}
      roles={[
        { value: "admin", label: "Admin", description: "Everything but billing." },
        { value: "support", label: "Support", description: "Orders and customers; no refunds or exports." },
        { value: "viewer", label: "Viewer", description: "Can see, can't change." },
      ]}
      pending={pending}
      onInvite={(emails, role) => new Promise<void>((done) => setTimeout(() => (setPending((p) => [...emails.map((email) => ({ email, role, sentAt: new Date() })), ...p]), done()), 700))}
      onResend={() => {}}
      onRevoke={(email) => setPending((p) => p.filter((x) => x.email !== email))}
    />
  );
}

function SetupDemo() {
  const [done, setDone] = useState(["shop", "products"]);
  const task = (id: string, title: string, description: string, action: string) => ({
    id,
    title,
    description,
    done: done.includes(id),
    action: (
      <Button size="sm" variant="primary" onClick={() => setDone((d) => [...d, id])}>
        {action}
      </Button>
    ),
  });
  return (
    <SetupChecklist
      className="w-full max-w-[460px]"
      tasks={[
        task("shop", "Name your shop", "", "Done"),
        task("products", "Add your first products", "", "Done"),
        task("pay", "Connect payments", "Get paid in 30 currencies; it takes about five minutes.", "Connect payments"),
        task("team", "Invite your team", "Give people only what they need with roles.", "Invite people"),
        task("domain", "Use your own domain", "Your shop at shop.yourname.com.", "Add a domain"),
      ]}
      onDismiss={() => setDone([])}
    />
  );
}

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete workspace
      </Button>
      <ConfirmByTyping
        open={open}
        onClose={() => setOpen(false)}
        title="Delete the Casa Verde workspace?"
        consequences={["1,240 orders and 214 invoices", "38 customers' details", "12 people lose access straight away"]}
        confirmText="casa-verde"
        actionLabel="Delete workspace"
        onConfirm={() => new Promise((r) => setTimeout(r, 1200))}
      />
    </>
  );
}

function ApprovalDemo() {
  const [approvers, setApprovers] = useState([
    { name: "Amara Okafor", status: "approved" as const, at: ago(90), comment: "Fine, they've been with us five years." },
    { name: "Lucía Fernández", status: "pending" as const },
  ]);
  return (
    <ApprovalCard
      className="w-full max-w-[520px]"
      title="Refund $1,240.00 to Lumen Studio"
      requester="Kenji Watanabe"
      requestedAt={ago(180)}
      approvers={approvers}
      onDecide={(yes, comment) => new Promise<void>((r) => setTimeout(() => (setApprovers((a) => a.map((x) => (x.name === "Lucía Fernández" ? { ...x, status: yes ? "approved" : "rejected", comment: comment || undefined, at: new Date() } : x)) as typeof a), r()), 600))}
    >
      Order #8812 arrived broken. Photos attached to the ticket.
    </ApprovalCard>
  );
}

function SaveBarDemo() {
  const [dirty, setDirty] = useState(true);
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex w-full max-w-[560px] flex-col items-start gap-3">
      <Button size="sm" onClick={() => setDirty(true)}>
        Change something
      </Button>
      <SaveBar
        position="inline"
        className="w-full"
        dirty={dirty}
        saving={saving}
        message="3 unsaved changes"
        onDiscard={() => setDirty(false)}
        onSave={() => {
          setSaving(true);
          setTimeout(() => (setSaving(false), setDirty(false)), 900);
        }}
      />
    </div>
  );
}

function KvDemo() {
  const [rows, setRows] = useState([
    { key: "PAYMENTS_KEY", value: "pk_live_51Hc…", secret: true },
    { key: "WEBHOOK_URL", value: "https://casaverde.pt/hooks/orders" },
    { key: "", value: "" },
  ]);
  return <KeyValueEditor className="w-full max-w-[600px]" value={rows} onChange={setRows} keyLabel="Name" keyPattern={/^[A-Z_][A-Z0-9_]*$/} addLabel="Add variable" />;
}

function InlineDemo() {
  const [name, setName] = useState("Lumen Studio");
  const [about, setAbout] = useState("");
  return (
    <div className="flex w-full max-w-[460px] flex-col gap-3">
      <InlineEdit label="Customer name" size="title" value={name} onSave={(v) => new Promise<void>((ok, no) => setTimeout(() => (v.trim() ? (setName(v), ok()) : no(new Error("A name is needed."))), 600))} />
      <InlineEdit label="Notes" multiline value={about} placeholder="Add notes about this customer" onSave={(v) => setAbout(v)} />
    </div>
  );
}

function CurrencyDemo({ pick }: { pick: boolean }) {
  const [cur, setCur] = useState("EUR");
  const [n, setN] = useState<number | null>(1299.5);
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-2">
      <CurrencyInput locale="en-US" aria-label="Amount" currency={cur} onCurrencyChange={pick ? setCur : undefined} value={n} onChange={setN} />
      <p className="m-0 text-small text-ink-3">Value: {String(n)} {cur}</p>
    </div>
  );
}

function SliderDemo({ range }: { range: boolean }) {
  const [v, setV] = useState<number | [number, number]>(range ? [40, 180] : 80);
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2">
      <Slider label={range ? ["Lowest price", "Highest price"] : "Discount"} min={0} max={range ? 300 : 100} step={range ? 10 : 5} value={v} onChange={setV} format={(n) => (range ? `$${n}` : `${n}%`)} marks={range ? [0, 100, 200, 300] : [0, 50, 100]} />
      <p className="m-0 text-small text-ink-3">{Array.isArray(v) ? `$${v[0]} – $${v[1]}` : `${v}%`}</p>
    </div>
  );
}

function StepperDemo({ vertical }: { vertical: boolean }) {
  const [at, setAt] = useState(2);
  const steps = [{ title: "Upload", description: "CSV or Excel" }, { title: "Match columns" }, { title: "Check", description: "3 rows need fixing", error: false }, { title: "Import" }];
  return (
    <div className={vertical ? "flex w-full max-w-[320px] flex-col gap-4" : "flex w-full max-w-[640px] flex-col gap-5"}>
      <Stepper steps={steps} current={at} onStep={setAt} orientation={vertical ? "vertical" : "horizontal"} />
      <div className="flex gap-2">
        <Button size="sm" disabled={at === 0} onClick={() => setAt(at - 1)}>
          Back
        </Button>
        <Button size="sm" variant="primary" disabled={at >= steps.length} onClick={() => setAt(at + 1)}>
          {at >= steps.length - 1 ? "Import" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function TagDemo({ strict }: { strict: boolean }) {
  const [v, setV] = useState(["Wholesale", "EU"]);
  return (
    <TagInput
      className="max-w-[420px]"
      label="Customer tags"
      value={v}
      onChange={setV}
      strict={strict}
      visible={4}
      suggestions={["Wholesale", "Retail", "EU", "APAC", "VIP", "Late payer", "Net 30", "Net 60", "Tax exempt"]}
      placeholder="Add a tag…"
    />
  );
}

export const business: Doc[] = [
  {
    name: "DateRangePicker",
    controls: { compare: { type: "boolean", default: true, label: "Compare to previous" }, instant: { type: "boolean", default: false, label: "Apply at once" }, presets: { type: "boolean", default: true } },
    preview: (v) => <RangeDemo key={`${v.compare}${v.instant}${v.presets}`} compare={bool(v.compare)} instant={bool(v.instant)} presets={bool(v.presets)} />,
    code: (v) => jsx("DateRangePicker", { value: raw("range"), onChange: raw("(range, previous) => load(range, previous)"), compare: bool(v.compare), instant: bool(v.instant), presets: bool(v.presets) ? undefined : raw("[]") }),
    stage: "min-h-[520px] items-start",
  },
  {
    name: "RangeCalendar",
    preview: () => <RangeCalendarDemo />,
    code: () => jsx("RangeCalendar", { value: raw("range"), onChange: raw("setRange") }),
  },
  {
    name: "TagInput",
    controls: { strict: { type: "boolean", default: false, label: "Only suggestions" } },
    preview: (v) => <TagDemo key={String(v.strict)} strict={bool(v.strict)} />,
    code: (v) => jsx("TagInput", { label: "Customer tags", value: raw("tags"), onChange: raw("setTags"), suggestions: raw("allTags"), strict: bool(v.strict), visible: 4 }),
    stage: "min-h-[340px] items-start",
  },
  {
    name: "NumberInput",
    controls: { controls: { type: "select", options: ["stepper", "arrows", "none"], default: "stepper" }, format: { type: "select", options: ["decimal", "percent"], default: "decimal" } },
    preview: (v) => <NumberInput locale="en-US" className="w-48" aria-label="Seats" defaultValue={v.format === "percent" ? 15 : 12} min={1} max={v.format === "percent" ? 100 : 500} controls={str(v.controls) as "stepper"} format={str(v.format) as "decimal"} suffix={v.format === "percent" ? undefined : "seats"} />,
    code: (v) => jsx("NumberInput", { value: raw("seats"), onChange: raw("setSeats"), min: 1, max: 500, controls: str(v.controls), format: str(v.format), suffix: v.format === "percent" ? undefined : "seats" }, undefined, { controls: "stepper", format: "decimal" }),
  },
  {
    name: "CurrencyInput",
    controls: { pick: { type: "boolean", default: true, label: "Pick the currency" } },
    preview: (v) => <CurrencyDemo key={String(v.pick)} pick={bool(v.pick)} />,
    code: (v) => jsx("CurrencyInput", { value: raw("amount"), onChange: raw("setAmount"), currency: raw("currency"), onCurrencyChange: bool(v.pick) ? raw("setCurrency") : undefined }),
  },
  {
    name: "InlineEdit",
    preview: () => <InlineDemo />,
    code: () => jsx("InlineEdit", { label: "Customer name", size: "title", value: raw("customer.name"), onSave: raw("(name) => rename(customer.id, name)") }),
  },
  {
    name: "KeyValueEditor",
    preview: () => <KvDemo />,
    code: () => jsx("KeyValueEditor", { value: raw("env"), onChange: raw("setEnv"), keyLabel: "Name", keyPattern: raw("/^[A-Z_][A-Z0-9_]*$/"), addLabel: "Add variable" }),
  },
  {
    name: "ApiKeyField",
    controls: { fresh: { type: "boolean", default: false, label: "Just created" } },
    preview: (v) => (
      <ApiKeyField
        key={String(v.fresh)}
        className="w-full max-w-[560px]"
        name="Production server"
        meta={bool(v.fresh) ? "Created just now" : "Created 3 Mar 2026 · Last used 2 hours ago"}
        value={bool(v.fresh) ? "sk_live_51HcVt2Lq9xR7mPa3f9a" : undefined}
        masked="sk_live_…3f9a"
        fresh={bool(v.fresh)}
        onRevoke={() => {}}
      />
    ),
    code: (v) => jsx("ApiKeyField", { name: "Production server", value: bool(v.fresh) ? raw("created.secret") : undefined, masked: raw("key.masked"), fresh: bool(v.fresh), meta: raw("`Created ${created} · Last used ${used}`"), onRevoke: raw("() => revoke(key.id)") }),
  },
  {
    name: "Slider",
    controls: { range: { type: "boolean", default: true, label: "Range (two thumbs)" } },
    preview: (v) => <SliderDemo key={String(v.range)} range={bool(v.range)} />,
    code: (v) => jsx("Slider", { label: bool(v.range) ? raw('["Lowest price", "Highest price"]') : "Discount", value: raw("value"), onChange: raw("setValue"), min: 0, max: bool(v.range) ? 300 : 100, format: raw(bool(v.range) ? "(n) => `$${n}`" : "(n) => `${n}%`") }),
  },
  {
    name: "Stepper",
    controls: { vertical: { type: "boolean", default: false } },
    preview: (v) => <StepperDemo key={String(v.vertical)} vertical={bool(v.vertical)} />,
    code: (v) => jsx("Stepper", { steps: raw('[{ title: "Upload" }, { title: "Match columns" }, …]'), current: raw("step"), onStep: raw("setStep"), orientation: bool(v.vertical) ? "vertical" : undefined }),
  },
  {
    name: "Accordion",
    controls: { variant: { type: "select", options: ["lines", "cards", "plain"], default: "lines" }, single: { type: "boolean", default: false } },
    preview: (v) => (
      <Accordion
        key={`${v.variant}${v.single}`}
        className="w-full max-w-[560px]"
        variant={str(v.variant) as "lines"}
        single={bool(v.single)}
        defaultOpen={["ship"]}
        items={[
          { id: "ship", title: "Shipping", meta: "3 zones", content: "Europe in 2–4 days, the Americas in 5–8, Asia Pacific in 6–10. Free over $100." },
          { id: "tax", title: "Taxes", meta: "VAT on", content: "Prices include VAT for EU customers; others pay import duties on delivery." },
          { id: "returns", title: "Returns", content: "30 days to return unused items. We pay return shipping in the EU." },
        ]}
      />
    ),
    code: (v) => jsx("Accordion", { variant: str(v.variant), single: bool(v.single), items: raw('[{ id: "ship", title: "Shipping", content: … }, …]') }, undefined, { variant: "lines" }),
  },
  {
    name: "Banner",
    controls: { tone: { type: "select", options: ["info", "warning", "danger", "success", "brand"], default: "warning" } },
    preview: (v) => (
      <Banner className="rounded-lg border" tone={str(v.tone) as Tone} onDismiss={() => {}} action={<Button size="sm" variant="secondary">{v.tone === "danger" ? "Update card" : "Add a payment method"}</Button>}>
        {v.tone === "danger" ? "Your last payment failed. Update your card to keep your shop open." : "Your trial ends in 3 days. Add a payment method to keep selling."}
      </Banner>
    ),
    code: (v) => jsx("Banner", { tone: str(v.tone), action: raw('<Button size="sm">Add a payment method</Button>'), onDismiss: raw("dismiss") }, "Your trial ends in 3 days."),
    stage: "block p-6",
  },
  {
    name: "Kbd",
    controls: { keys: { type: "text", default: "mod+k" } },
    preview: (v) => (
      <p className="m-0 flex items-center gap-2 text-body text-ink-2">
        Search anything with <Kbd keys={str(v.keys)} />
      </p>
    ),
    code: (v) => jsx("Kbd", { keys: str(v.keys) }),
  },
  {
    name: "AvatarGroup",
    controls: { max: { type: "number", default: 4, min: 1, max: 8 }, size: { type: "select", options: ["sm", "md", "lg"], default: "md" } },
    preview: (v) => <AvatarGroup max={num(v.max)} size={str(v.size) as "sm"} people={["Amara Okafor", "Kenji Watanabe", "Lucía Fernández", "Priya Raman", "Jonas Weber", "Ana Costa", "Tomás Silva"].map((name) => ({ name }))} />,
    code: (v) => jsx("AvatarGroup", { people: raw("members"), max: num(v.max), size: str(v.size) }, undefined, { max: 4, size: "sm" }),
  },
  {
    name: "RelativeTime",
    controls: { minutes: { type: "number", default: 3, min: 0, max: 100000, label: "minutes ago" }, style: { type: "select", options: ["long", "short"], default: "long" } },
    preview: (v) => <RelativeTime locale="en-US" className="text-body text-ink" date={ago(num(v.minutes))} style={str(v.style) as "long"} />,
    code: (v) => jsx("RelativeTime", { date: raw("event.createdAt"), style: str(v.style) }, undefined, { style: "long" }),
  },
  {
    name: "BulkActionBar",
    controls: { variant: { type: "select", options: ["bar", "floating"], default: "bar" } },
    preview: (v) => <BulkDemo key={str(v.variant)} variant={str(v.variant) as "bar"} />,
    code: (v) => jsx("BulkActionBar", { variant: str(v.variant), count: raw("selected.length"), total: raw("total"), noun: raw('["order", "orders"]'), onSelectAll: raw("selectAll"), onClear: raw("clear") }, '<Button size="sm">Export</Button>\n<Button size="sm" variant="danger-soft">Delete</Button>', { variant: "bar" }),
    stage: "min-h-[260px]",
  },
  {
    name: "ColumnSettings",
    preview: () => <ColumnsDemo />,
    code: () => jsx("ColumnSettings", { columns: raw("columns"), onChange: raw("setColumns"), density: raw("density"), onDensityChange: raw("setDensity"), onReset: raw("reset") }),
  },
  {
    name: "SavedViews",
    preview: () => <ViewsDemo />,
    code: () => jsx("SavedViews", { views: raw("views"), current: raw("view"), onSelect: raw("open"), dirty: raw("changed"), onSave: raw("save"), onSaveAs: raw("saveAs"), onRename: raw("rename"), onDelete: raw("remove"), onSetDefault: raw("makeDefault") }),
  },
  {
    name: "TransferList",
    preview: () => <TransferDemo />,
    code: () => jsx("TransferList", { items: raw("permissions"), value: raw("granted"), onChange: raw("setGranted"), titles: raw('["Available permissions", "Support role has"]') }),
  },
  {
    name: "TreeView",
    controls: { checkable: { type: "boolean", default: false } },
    preview: (v) => <TreeDemo key={String(v.checkable)} checkable={bool(v.checkable)} />,
    code: (v) => jsx("TreeView", { nodes: raw("teams"), selected: raw("team"), onSelect: raw("setTeam"), checkable: bool(v.checkable), checked: bool(v.checkable) ? raw("picked") : undefined, onCheckedChange: bool(v.checkable) ? raw("setPicked") : undefined }),
  },
  {
    name: "NotificationCenter",
    preview: () => <NotifDemo />,
    code: () => jsx("NotificationCenter", { notifications: raw("notifications"), onRead: raw("markRead"), onReadAll: raw("markAllRead"), footer: raw('<a href="/notifications">See all</a>') }),
  },
  {
    name: "AuditLog",
    preview: () => (
      <AuditLog
        className="w-full max-w-[680px]"
        toolbar={
          <div className="flex justify-end">
            <Button size="sm" icon={<Download size={14} />}>
              Export CSV
            </Button>
          </div>
        }
        events={[
          { id: "1", actor: "Amara Okafor", action: "changed the role of", target: "Kenji Watanabe", date: ago(12), context: "Lisbon, PT", changes: [{ field: "Role", from: "Viewer", to: "Support" }] },
          { id: "2", actor: "Lucía Fernández", action: "refunded", target: "Order #8812", date: ago(95), changes: [{ field: "Status", from: "Paid", to: "Refunded" }, { field: "Amount", from: "$1,240.00", to: "$0.00" }] },
          { id: "3", actor: "Priya Raman", action: "deleted the API key", target: "Staging server", date: ago(60 * 20), tone: "danger", context: "Bengaluru, IN" },
          { id: "4", actor: "Amara Okafor", action: "signed in", date: ago(60 * 28), context: "Lisbon, PT · new device" },
        ]}
      />
    ),
    code: () => jsx("AuditLog", { events: raw("events"), toolbar: raw("<FilterBar … />") }),
  },
  {
    name: "PermissionMatrix",
    preview: () => <MatrixDemo />,
    code: () => jsx("PermissionMatrix", { roles: raw("roles"), groups: raw("permissionGroups"), value: raw("grants"), onChange: raw("setGrants") }),
    stage: "block p-6",
  },
  {
    name: "InviteMembers",
    preview: () => <InviteDemo />,
    code: () => jsx("InviteMembers", { roles: raw("roles"), onInvite: raw("invite"), pending: raw("invites"), onResend: raw("resend"), onRevoke: raw("revoke"), seatsLeft: raw("plan.seatsLeft") }),
    stage: "items-start min-h-[360px]",
  },
  {
    name: "UsageMeter",
    controls: { used: { type: "number", default: 84200, min: 0, max: 100000, step: 1000 } },
    preview: (v) => (
      <UsageMeter
        className="w-full max-w-[420px]"
        label="API calls this month"
        used={num(v.used)}
        limit={100000}
        resets="Resets 1 Dec"
        action={
          <Button size="xs" variant="soft">
            Upgrade
          </Button>
        }
      />
    ),
    code: (v) => jsx("UsageMeter", { label: "API calls this month", used: num(v.used), limit: 100000, resets: "Resets 1 Dec", action: raw('<Button size="xs" variant="soft">Upgrade</Button>') }),
  },
  {
    name: "PlanSummary",
    controls: { status: { type: "select", options: ["active", "trialing", "past_due", "canceled"], default: "active" } },
    preview: (v) => (
      <PlanSummary
        className="w-full max-w-[640px]"
        plan="Growth"
        price="$29 per seat a month, billed yearly"
        status={str(v.status) as "active"}
        seats={{ used: 8, total: 10 }}
        nextInvoice="$232.00 on 1 Dec 2026"
        paymentMethod="Visa ending 4242 · expires 08/28"
        actions={
          <>
            <Button size="sm">Manage billing</Button>
            <Button size="sm" variant="primary">
              Change plan
            </Button>
          </>
        }
      />
    ),
    code: (v) => jsx("PlanSummary", { plan: "Growth", price: "$29 per seat a month", status: str(v.status), seats: raw("{ used: 8, total: 10 }"), nextInvoice: raw("next"), paymentMethod: raw("card"), actions: raw("<Button>Change plan</Button>") }, undefined, { status: "active" }),
  },
  {
    name: "SetupChecklist",
    preview: () => <SetupDemo />,
    code: () => jsx("SetupChecklist", { tasks: raw("tasks"), onDismiss: raw("hide") }),
  },
  {
    name: "SaveBar",
    preview: () => <SaveBarDemo />,
    code: () => jsx("SaveBar", { dirty: raw("changed"), onSave: raw("save"), onDiscard: raw("reset"), message: "3 unsaved changes" }),
  },
  {
    name: "ConfirmByTyping",
    preview: () => <ConfirmDemo />,
    code: () => jsx("ConfirmByTyping", { open: raw("open"), onClose: raw("close"), title: "Delete the Casa Verde workspace?", consequences: raw("['1,240 orders', …]"), confirmText: "casa-verde", actionLabel: "Delete workspace", onConfirm: raw("remove") }),
  },
  {
    name: "ApprovalCard",
    preview: () => <ApprovalDemo />,
    code: () => jsx("ApprovalCard", { title: "Refund $1,240.00 to Lumen Studio", requester: raw("request.by"), requestedAt: raw("request.at"), approvers: raw("request.approvers"), onDecide: raw("decide") }, "{request.reason}"),
  },
  {
    name: "ButtonGroup",
    controls: { attached: { type: "boolean", default: true } },
    preview: (v) => (
      <ButtonGroup label="Period" attached={bool(v.attached)}>
        <Button size="sm">Day</Button>
        <Button size="sm">Week</Button>
        <Button size="sm">Month</Button>
      </ButtonGroup>
    ),
    code: (v) => jsx("ButtonGroup", { label: "Period", attached: bool(v.attached) ? undefined : false }, "<Button>Day</Button>\n<Button>Week</Button>\n<Button>Month</Button>"),
  },
  {
    name: "SplitButton",
    controls: { variant: { type: "select", options: ["primary", "secondary", "soft"], default: "primary" } },
    preview: (v) => (
      <div className="pb-24">
        <SplitButton variant={str(v.variant) as "primary"} icon={<Mail size={15} />} menuLabel="More ways to send" items={[{ label: "Send later" }, { label: "Save as draft" }, { label: "Send test to me", separated: true }]}>
          Send invoice
        </SplitButton>
      </div>
    ),
    code: (v) => jsx("SplitButton", { variant: str(v.variant), onClick: raw("send"), items: raw('[{ label: "Send later", onSelect: schedule }, { label: "Save as draft", onSelect: save }]') }, "Send invoice", { variant: "primary" }),
  },
  {
    name: "ToggleButton",
    preview: () => (
      <span className="flex gap-1.5">
        <ToggleButton size="sm" icon={<Users size={14} />}>
          Assigned to me
        </ToggleButton>
        <ToggleButton size="sm" defaultPressed icon={<Plus size={14} />}>
          Follow
        </ToggleButton>
      </span>
    ),
    code: () => jsx("ToggleButton", { pressed: raw("following"), onPressedChange: raw("setFollowing") }, "Follow"),
  },
  {
    name: "CopyButton",
    preview: () => (
      <span className="flex items-center gap-2 font-mono text-small text-ink-2">
        ord_8f3a91c2 <CopyButton value="ord_8f3a91c2" />
        <CopyButton value="ord_8f3a91c2" variant="secondary">
          Copy ID
        </CopyButton>
      </span>
    ),
    code: () => jsx("CopyButton", { value: raw("order.id") }),
  },
];
