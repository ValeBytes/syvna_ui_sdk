"use client";

// The workspace screens of the template shop, built from the B2B and agent
// components: reports, approvals, the assistant, the team, billing and
// developer settings.

import { useMemo, useState } from "react";
import { Archive, Download, KeyRound, Plus, Trash2, Webhook } from "lucide-react";
import {
  ApiKeyField,
  ApprovalCard,
  AuditLog,
  Avatar,
  Badge,
  Banner,
  BulkActionBar,
  Button,
  Card,
  ColumnSettings,
  ConfirmByTyping,
  DateRangePicker,
  Dialog,
  Field,
  Input,
  InviteMembers,
  KeyValueEditor,
  LineChart,
  PermissionMatrix,
  PlanSummary,
  RelativeTime,
  SaveBar,
  SavedViews,
  SegmentedControl,
  StatCard,
  Switch,
  Table,
  TagInput,
  Tabs,
  UsageMeter,
  previousPeriod,
  rangePresets,
  toast,
  type ColumnSetting,
  type DateRange,
  type SavedView,
} from "@syvna/ui";

import { ChatDemo } from "@/registry/agent";

import { money, orders, statusTone, statusWord, type Order } from "./data";

const ago = (min: number) => new Date(Date.now() - min * 60_000);
const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/* ---------- Reports ---------- */

const days = (r: DateRange) => Math.round((r.to.getTime() - r.from.getTime()) / 86400000) + 1;

/** A made-up but steady daily revenue, so the same dates always give the same numbers. */
function revenue(r: DateRange) {
  const n = Math.min(days(r), 92);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(r.from.getFullYear(), r.from.getMonth(), r.from.getDate() + i);
    const seed = d.getDate() * 37 + d.getMonth() * 101;
    const trend = 2300 + i * 14;
    return { label: fmt.format(d), value: Math.round(trend + ((seed * 7) % 420) + (d.getDay() === 6 ? 520 : d.getDay() === 5 ? 300 : 0)) };
  });
}

const allColumns: ColumnSetting[] = [
  { id: "select", label: "Select", visible: true, locked: true },
  { id: "id", label: "Order", visible: true, locked: true },
  { id: "who", label: "Customer", visible: true },
  { id: "country", label: "Country", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "items", label: "Items", visible: false },
  { id: "total", label: "Total", visible: true },
];

export function Reports() {
  const [range, setRange] = useState<DateRange>(() => rangePresets()[3]!.range());
  const [compare, setCompare] = useState<DateRange | null>(() => previousPeriod(rangePresets()[3]!.range()));
  const [views, setViews] = useState<SavedView[]>([
    { id: "all", name: "All orders", system: true },
    { id: "open", name: "Still open", isDefault: true },
    { id: "abroad", name: "Shipped abroad", shared: true },
  ]);
  const [view, setView] = useState("open");
  const [dirty, setDirty] = useState(false);
  const [cols, setCols] = useState(allColumns);
  const [density, setDensity] = useState<"compact" | "default" | "comfortable">("default");
  const [picked, setPicked] = useState<string[]>([]);

  const points = useMemo(() => revenue(range), [range]);
  const before = useMemo(() => (compare ? revenue(compare) : []), [compare]);
  const total = points.reduce((s, p) => s + p.value, 0);
  const prev = before.reduce((s, p) => s + p.value, 0);
  const pct = prev ? Math.round(((total - prev) / prev) * 100) : 0;
  const ordersCount = Math.round(total / 64);
  const prevOrders = Math.round(prev / 66);

  const rows = view === "open" ? orders.filter((o) => o.status === "new" || o.status === "packing") : view === "abroad" ? orders.filter((o) => o.status === "shipped" || o.status === "delivered") : orders;
  const visible = (id: string) => cols.find((c) => c.id === id)?.visible;
  const allOn = rows.length > 0 && rows.every((r) => picked.includes(r.id));
  const columns = [
    {
      key: "select",
      header: <input type="checkbox" aria-label="Select all" checked={allOn} onChange={() => setPicked(allOn ? [] : rows.map((r) => r.id))} className="size-3.5 accent-[var(--color-brand)]" />,
      width: "40px",
      render: (o: Order) => <input type="checkbox" aria-label={`Select order ${o.id}`} checked={picked.includes(o.id)} onClick={(e) => e.stopPropagation()} onChange={() => setPicked((p) => (p.includes(o.id) ? p.filter((x) => x !== o.id) : [...p, o.id]))} className="size-3.5 accent-[var(--color-brand)]" />,
    },
    { key: "id", header: "Order", render: (o: Order) => <span className="font-mono text-[13px]">#{o.id}</span> },
    { key: "who", header: "Customer" },
    { key: "country", header: "Country" },
    { key: "status", header: "Status", render: (o: Order) => <Badge tone={statusTone[o.status]} dot>{statusWord[o.status]}</Badge> },
    { key: "items", header: "Items", align: "end" as const },
    { key: "total", header: "Total", align: "end" as const, render: (o: Order) => money.format(o.total), sort: (a: Order, b: Order) => a.total - b.total },
  ].filter((c) => visible(c.key));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRangePicker
          className="w-auto min-w-[300px]"
          locale="en-US"
          value={range}
          compare
          onChange={(r, c) => {
            setRange(r);
            setCompare(c);
          }}
        />
        <Button size="sm" icon={<Download size={14} />} onClick={() => toast({ title: "Report exported", description: `${fmt.format(range.from)} – ${fmt.format(range.to)} as CSV`, tone: "success" })}>
          Export
        </Button>
      </div>
      <div className="grid gap-4 @2xl:grid-cols-3">
        <StatCard label="Revenue" value={money.format(total)} change={compare ? { value: `${pct >= 0 ? "+" : ""}${pct}%`, trend: pct > 0 ? "up" : pct < 0 ? "down" : "flat" } : undefined} hint={compare ? `vs ${fmt.format(compare.from)} – ${fmt.format(compare.to)}` : `${days(range)} days`} />
        <StatCard label="Orders" value={ordersCount.toLocaleString("en-US")} change={compare ? { value: `${ordersCount - prevOrders >= 0 ? "+" : ""}${ordersCount - prevOrders}`, trend: ordersCount >= prevOrders ? "up" : "down" } : undefined} hint="Paid orders only" />
        <StatCard label="Average order" value={money.format(total / Math.max(1, ordersCount))} hint="Before shipping and tax" />
      </div>
      <Card title="Revenue by day" description={`${fmt.format(range.from)} – ${fmt.format(range.to)}`}>
        <LineChart data={points} height={180} format={(v) => money.format(v)} label={`Revenue by day, ${money.format(total)} in total`} />
      </Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          <SavedViews
            className="min-w-0 flex-1"
            views={views}
            current={view}
            onSelect={(id) => (setView(id), setDirty(false), setPicked([]))}
            dirty={dirty}
            onSave={() => (setDirty(false), toast({ title: "View saved", tone: "success" }))}
            onSaveAs={(name) => {
              const id = name.toLowerCase().replace(/\s+/g, "-");
              setViews((v) => [...v, { id, name }]);
              setView(id);
              setDirty(false);
            }}
            onRename={(id, name) => setViews((v) => v.map((x) => (x.id === id ? { ...x, name } : x)))}
            onDelete={(id) => (setViews((v) => v.filter((x) => x.id !== id)), setView("all"))}
            onSetDefault={(id) => setViews((v) => v.map((x) => ({ ...x, isDefault: x.id === id })))}
          />
          <div className="pb-1">
            <ColumnSettings columns={cols} onChange={(c) => (setCols(c), setDirty(true))} density={density} onDensityChange={(d) => (setDensity(d), setDirty(true))} onReset={() => setCols(allColumns)} />
          </div>
        </div>
        <BulkActionBar count={picked.length} total={1240} noun={["order", "orders"]} onSelectAll={() => toast({ title: "All 1,240 orders selected" })} onClear={() => setPicked([])}>
          <Button size="sm" icon={<Download size={14} />} onClick={() => toast({ title: `${picked.length} orders exported`, tone: "success" })}>
            Export
          </Button>
          <Button size="sm" icon={<Archive size={14} />} onClick={() => (toast({ title: `${picked.length} orders archived` }), setPicked([]))}>
            Archive
          </Button>
        </BulkActionBar>
        <Table className="w-full" caption="Orders in this view" rows={rows} rowKey={(o) => o.id} columns={columns} selected={picked} dense={density === "compact"} />
      </div>
    </div>
  );
}

/* ---------- Approvals ---------- */

type Request = { id: string; title: string; by: string; at: Date; reason: string; approvers: { name: string; status: "pending" | "approved" | "rejected"; comment?: string; at?: Date }[] };

export function Approvals() {
  const [filter, setFilter] = useState("waiting");
  const [requests, setRequests] = useState<Request[]>([
    { id: "r1", title: "Refund $1,240.00 to Lumen Studio", by: "Kenji Watanabe", at: ago(180), reason: "Order #1041 arrived broken; photos are on the ticket.", approvers: [{ name: "Amara Okafor", status: "approved", at: ago(90), comment: "Fine, they've been with us five years." }, { name: "Lucía Fernández", status: "pending" }] },
    { id: "r2", title: "20% wholesale discount for Hinoki Goods", by: "Priya Raman", at: ago(60 * 5), reason: "They're ordering 400 mugs a quarter from January.", approvers: [{ name: "Lucía Fernández", status: "pending" }] },
    { id: "r3", title: "Give Jonas Becker access to billing", by: "Jonas Becker", at: ago(60 * 30), reason: "To download invoices for the accountant.", approvers: [{ name: "Lucía Fernández", status: "rejected", at: ago(60 * 20), comment: "Use the monthly invoice email instead." }] },
  ]);
  const decided = (r: Request) => r.approvers.every((a) => a.status === "approved") || r.approvers.some((a) => a.status === "rejected");
  const shown = requests.filter((r) => (filter === "waiting" ? !decided(r) : decided(r)));
  return (
    <div className="flex max-w-[760px] flex-col gap-5">
      <SegmentedControl
        label="Requests"
        value={filter}
        onValueChange={setFilter}
        options={[
          { value: "waiting", label: `Waiting (${requests.filter((r) => !decided(r)).length})` },
          { value: "done", label: "Decided" },
        ]}
        className="self-start"
      />
      {shown.length ? (
        shown.map((r) => (
          <ApprovalCard
            key={r.id}
            title={r.title}
            requester={r.by}
            requestedAt={r.at}
            approvers={r.approvers}
            onDecide={(yes, comment) =>
              new Promise<void>((done) =>
                setTimeout(() => {
                  setRequests((all) => all.map((x) => (x.id !== r.id ? x : { ...x, approvers: x.approvers.map((a) => (a.name === "Lucía Fernández" ? { ...a, status: yes ? "approved" : "rejected", comment: comment || undefined, at: new Date() } : a)) })));
                  toast({ title: yes ? "Approved" : "Rejected", description: r.title, tone: yes ? "success" : undefined });
                  done();
                }, 500),
              )
            }
          >
            {r.reason}
          </ApprovalCard>
        ))
      ) : (
        <p className="m-0 py-10 text-center text-body text-ink-3">{filter === "waiting" ? "Nothing waiting for you." : "Nothing decided yet."}</p>
      )}
    </div>
  );
}

/* ---------- Assistant ---------- */

export function Assistant() {
  return <ChatDemo className="h-[calc(100%-0px)] min-h-[560px]" />;
}

/* ---------- Team ---------- */

const people = [
  { name: "Lucía Fernández", email: "lucia@casaverde.shop", role: "Owner", seen: ago(2) },
  { name: "Amara Okafor", email: "amara@casaverde.shop", role: "Admin", seen: ago(40) },
  { name: "Kenji Watanabe", email: "kenji@casaverde.shop", role: "Support", seen: ago(60 * 5) },
  { name: "Priya Raman", email: "priya@casaverde.shop", role: "Support", seen: ago(60 * 26) },
  { name: "Jonas Becker", email: "jonas@casaverde.shop", role: "Viewer", seen: ago(60 * 24 * 9) },
];

const perms = {
  orders: [{ id: "orders.view", label: "See orders" }, { id: "orders.edit", label: "Edit orders" }, { id: "orders.refund", label: "Refund orders", description: "Money leaves the account" }],
  customers: [{ id: "customers.view", label: "See customers" }, { id: "customers.export", label: "Export customers", description: "Includes emails and addresses" }],
  workspace: [{ id: "billing.manage", label: "Manage billing" }, { id: "members.invite", label: "Invite people" }, { id: "settings.manage", label: "Change settings" }],
};

export function Team({ view }: { view?: string }) {
  const [tab, setTab] = useState(view === "roles" || view === "activity" ? view : "members");
  const start = { admin: ["orders.view", "orders.edit", "orders.refund", "customers.view", "customers.export", "members.invite", "settings.manage"], support: ["orders.view", "orders.edit", "customers.view"], viewer: ["orders.view", "customers.view"] };
  const [grants, setGrants] = useState<Record<string, string[]>>(start);
  const [saved, setSaved] = useState<Record<string, string[]>>(start);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState([{ email: "ana@casaverde.shop", role: "support", sentAt: ago(60 * 20) }]);
  const dirty = JSON.stringify(grants) !== JSON.stringify(saved);
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <Tabs label="Team" value={tab} onValueChange={setTab} items={[{ value: "members", label: "Members", count: people.length }, { value: "roles", label: "Roles" }, { value: "activity", label: "Activity" }]}>
      {(t) =>
        t === "members" ? (
          <div className="flex max-w-[860px] flex-col gap-6">
            <Card title="Invite people" description="They get an email with a link to join Casa Verde.">
              <InviteMembers
                seatsLeft={5}
                roles={[
                  { value: "admin", label: "Admin", description: "Everything but billing." },
                  { value: "support", label: "Support", description: "Orders and customers; no refunds or exports." },
                  { value: "viewer", label: "Viewer", description: "Can see, can't change." },
                ]}
                pending={pending}
                onInvite={(emails, role) =>
                  new Promise<void>((done) =>
                    setTimeout(() => {
                      setPending((p) => [...emails.map((email) => ({ email, role, sentAt: new Date() })), ...p]);
                      toast({ title: `${emails.length} invite${emails.length === 1 ? "" : "s"} sent`, tone: "success" });
                      done();
                    }, 700),
                  )
                }
                onResend={(e) => toast({ title: "Invite sent again", description: e })}
                onRevoke={(e) => setPending((p) => p.filter((x) => x.email !== e))}
              />
            </Card>
            <Card title="Members" padded={false}>
              <Table
                flush
                caption="Members"
                rows={people}
                rowKey={(p) => p.email}
                columns={[
                  { key: "name", header: "Name", render: (p) => (<span className="flex items-center gap-2.5"><Avatar name={p.name} size="sm" /><span className="flex flex-col"><span className="text-ink">{p.name}</span><span className="text-caption text-ink-3">{p.email}</span></span></span>) },
                  { key: "role", header: "Role", render: (p) => <Badge tone={p.role === "Owner" ? "brand" : "neutral"}>{p.role}</Badge> },
                  { key: "seen", header: "Last active", render: (p) => <RelativeTime locale="en-US" date={p.seen} className="text-ink-2" /> },
                ]}
              />
            </Card>
          </div>
        ) : t === "roles" ? (
          <div className="flex flex-col gap-4 pb-20">
            <p className="m-0 max-w-[640px] text-body text-ink-2">What each role can do. The owner can always do everything; changes reach people the next time they open a page.</p>
            <PermissionMatrix
              roles={[{ id: "owner", name: "Owner", locked: true }, { id: "admin", name: "Admin" }, { id: "support", name: "Support" }, { id: "viewer", name: "Viewer" }]}
              groups={[
                { name: "Orders", permissions: perms.orders },
                { name: "Customers", permissions: perms.customers },
                { name: "Workspace", permissions: perms.workspace },
              ]}
              value={grants}
              onChange={setGrants}
            />
            <SaveBar
              dirty={dirty}
              saving={saving}
              message="Role changes not saved"
              onDiscard={() => setGrants(saved)}
              onSave={() => {
                setSaving(true);
                setTimeout(() => {
                  setSaved(grants);
                  setSaving(false);
                  toast({ title: "Roles saved", tone: "success" });
                }, 800);
              }}
            />
          </div>
        ) : (
          <AuditLog
            className="max-w-[860px]"
            toolbar={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <DateRangePicker className="w-auto min-w-[260px]" locale="en-US" size="sm" value={range} onChange={setRange} placeholder="Any time" instant />
                <Button size="sm" icon={<Download size={14} />}>
                  Export CSV
                </Button>
              </div>
            }
            events={[
              { id: "1", actor: "Amara Okafor", action: "changed the role of", target: "Kenji Watanabe", date: ago(12), context: "Lisbon, PT", changes: [{ field: "Role", from: "Viewer", to: "Support" }] },
              { id: "2", actor: "Lucía Fernández", action: "refunded", target: "Order #1041", date: ago(95), changes: [{ field: "Status", from: "Delivered", to: "Refunded" }, { field: "Refunded", from: "$0.00", to: "$304.00" }] },
              { id: "3", actor: "Priya Raman", action: "deleted the API key", target: "Staging server", date: ago(60 * 20), tone: "danger", context: "Bengaluru, IN" },
              { id: "4", actor: "Lucía Fernández", action: "invited", target: "ana@casaverde.shop", date: ago(60 * 22) },
              { id: "5", actor: "Amara Okafor", action: "signed in", date: ago(60 * 28), context: "Lisbon, PT · new device" },
            ]}
          />
        )
      }
    </Tabs>
  );
}

/* ---------- Billing ---------- */

const invoices = [
  { id: "INV-0012", date: "Nov 1, 2026", amount: 232, status: "paid" },
  { id: "INV-0011", date: "Oct 1, 2026", amount: 232, status: "paid" },
  { id: "INV-0010", date: "Sep 1, 2026", amount: 203, status: "paid" },
  { id: "INV-0009", date: "Aug 1, 2026", amount: 203, status: "refunded" },
] as const;

export function Billing() {
  const [banner, setBanner] = useState(true);
  const [closing, setClosing] = useState(false);
  return (
    <div className="flex max-w-[860px] flex-col gap-6">
      {banner ? (
        <Banner tone="warning" className="rounded-lg border" onDismiss={() => setBanner(false)} action={<Button size="sm">Update card</Button>}>
          Your card expires next month. Update it to keep paying without a gap.
        </Banner>
      ) : null}
      <PlanSummary
        plan="Growth"
        price="$29 per seat a month, billed monthly"
        seats={{ used: 8, total: 10 }}
        nextInvoice="$232.00 on Dec 1, 2026"
        paymentMethod="Visa ending 4242 · expires 12/26"
        actions={
          <>
            <Button size="sm">Manage seats</Button>
            <Button size="sm" variant="primary">
              Change plan
            </Button>
          </>
        }
      />
      <Card title="This month's usage" description="Resets on Dec 1.">
        <div className="grid gap-6 @2xl:grid-cols-3">
          <UsageMeter label="Orders" used={1240} limit={5000} />
          <UsageMeter
            label="Emails sent"
            used={8640}
            limit={10000}
            action={
              <Button size="xs" variant="soft">
                Add 10,000
              </Button>
            }
          />
          <UsageMeter label="Storage" used={3.1} limit={10} format={(n) => `${n} GB`} />
        </div>
      </Card>
      <Card title="Invoices" padded={false}>
        <Table
          flush
          caption="Invoices"
          rows={[...invoices]}
          rowKey={(i) => i.id}
          columns={[
            { key: "id", header: "Invoice", render: (i) => <span className="font-mono text-[13px]">{i.id}</span> },
            { key: "date", header: "Date" },
            { key: "status", header: "Status", render: (i) => <Badge tone={i.status === "paid" ? "success" : "neutral"} dot>{i.status === "paid" ? "Paid" : "Refunded"}</Badge> },
            { key: "amount", header: "Amount", align: "end", render: (i) => money.format(i.amount) },
            { key: "pdf", header: "", align: "end", width: "60px", render: (i) => <Button size="xs" variant="ghost" aria-label={`Download ${i.id}`} icon={<Download size={13} />} onClick={() => toast({ title: `${i.id}.pdf downloaded` })} /> },
          ]}
        />
      </Card>
      <Card title="Delete the workspace" description="Everything goes: orders, customers, products and invoices. Download what you need first.">
        <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => setClosing(true)}>
          Delete workspace
        </Button>
      </Card>
      <ConfirmByTyping
        open={closing}
        onClose={() => setClosing(false)}
        title="Delete the Casa Verde workspace?"
        consequences={["1,240 orders and 214 invoices", "12 customers and their history", "5 people lose access straight away"]}
        confirmText="casa-verde"
        actionLabel="Delete workspace"
        onConfirm={() => new Promise<void>((r) => setTimeout(() => (toast({ title: "Not really: this is a template." }), r()), 1000))}
      />
    </div>
  );
}

/* ---------- Developers ---------- */

export function Developers({ view }: { view?: string }) {
  const [tab, setTab] = useState(view === "webhooks" || view === "environment" ? view : "keys");
  const [keys, setKeys] = useState([
    { id: "k1", name: "Production server", masked: "sk_live_…3f9a", meta: "Created Mar 3, 2026 · Last used 2 hours ago" },
    { id: "k2", name: "Accounting sync", masked: "sk_live_…91c0", meta: "Created Jul 18, 2026 · Last used yesterday" },
  ]);
  const [fresh, setFresh] = useState<{ name: string; value: string } | null>(null);
  const [naming, setNaming] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [hooks, setHooks] = useState([{ url: "https://casaverde.shop/hooks/orders", events: ["order.created", "order.paid"], on: true }]);
  const [env, setEnv] = useState([
    { key: "PAYMENTS_KEY", value: "pk_live_51Hc…", secret: true },
    { key: "SHIPPING_ACCOUNT", value: "CV-PT-0921" },
    { key: "", value: "" },
  ]);
  return (
    <Tabs label="Developers" value={tab} onValueChange={setTab} items={[{ value: "keys", label: "API keys", count: keys.length }, { value: "webhooks", label: "Webhooks" }, { value: "environment", label: "Environment" }]}>
      {(t) =>
        t === "keys" ? (
          <div className="flex max-w-[760px] flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <p className="m-0 text-body text-ink-2">Keys let your own software read and change the shop. Keep them secret.</p>
              <Button variant="primary" size="sm" icon={<KeyRound size={14} />} onClick={() => setNaming(true)}>
                New key
              </Button>
            </div>
            {fresh ? <ApiKeyField name={fresh.name} meta="Created just now" value={fresh.value} fresh onRevoke={() => setFresh(null)} /> : null}
            {keys.map((k) => (
              <ApiKeyField
                key={k.id}
                name={k.name}
                masked={k.masked}
                meta={k.meta}
                onRevoke={() => {
                  setKeys((all) => all.filter((x) => x.id !== k.id));
                  toast({ title: "Key revoked", description: k.name });
                }}
              />
            ))}
            <Dialog
              open={naming}
              onClose={() => setNaming(false)}
              size="sm"
              title="New API key"
              description="Name it after what will use it, so you know which to revoke."
              footer={
                <>
                  <Button onClick={() => setNaming(false)}>Cancel</Button>
                  <Button
                    variant="primary"
                    disabled={!keyName.trim()}
                    onClick={() => {
                      const value = `sk_live_${Array.from({ length: 24 }, (_, i) => "abcdefghjkmnpqrstuvwxyz23456789"[(i * 7 + keyName.length * 13) % 31]).join("")}`;
                      setFresh({ name: keyName.trim(), value });
                      setKeys((all) => [{ id: `k${Date.now()}`, name: keyName.trim(), masked: `${value.slice(0, 8)}…${value.slice(-4)}`, meta: "Created just now · Never used" }, ...all]);
                      setKeyName("");
                      setNaming(false);
                    }}
                  >
                    Create key
                  </Button>
                </>
              }
            >
              <Field label="Name" required>
                <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Warehouse scanner" autoFocus />
              </Field>
            </Dialog>
          </div>
        ) : t === "webhooks" ? (
          <div className="flex max-w-[760px] flex-col gap-4">
            <p className="m-0 text-body text-ink-2">We send a POST to these addresses when something happens in the shop.</p>
            {hooks.map((h, i) => (
              <Card key={i}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Webhook size={16} className="flex-none text-ink-3" />
                    <Input className="flex-1" value={h.url} copyable readOnly aria-label="Webhook address" />
                    <Switch aria-label="On" checked={h.on} onCheckedChange={(on) => setHooks((all) => all.map((x, j) => (j === i ? { ...x, on } : x)))} />
                  </div>
                  <Field label="Events">
                    <TagInput
                      label="Events"
                      strict
                      value={h.events}
                      onChange={(events) => setHooks((all) => all.map((x, j) => (j === i ? { ...x, events } : x)))}
                      suggestions={["order.created", "order.paid", "order.shipped", "order.refunded", "customer.created", "product.low_stock"]}
                    />
                  </Field>
                </div>
              </Card>
            ))}
            <Button variant="dashed" icon={<Plus size={14} />} className="self-start" onClick={() => setHooks((all) => [...all, { url: "https://", events: [], on: false }])}>
              Add an address
            </Button>
          </div>
        ) : (
          <Card title="Environment variables" description="Read by your shop's code. Secret values are never shown again after saving." className="max-w-[760px]">
            <KeyValueEditor value={env} onChange={setEnv} keyLabel="Name" keyPattern={/^[A-Z_][A-Z0-9_]*$/} addLabel="Add variable" />
          </Card>
        )
      }
    </Tabs>
  );
}
