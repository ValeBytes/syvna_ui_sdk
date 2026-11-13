"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Download, LayoutGrid, List, MoreHorizontal, Package, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import {
  Alert,
  Avatar,
  AvatarUpload,
  Badge,
  BarChart,
  Button,
  Card,
  Checkbox,
  DetailList,
  Dialog,
  EmptyState,
  Field,
  FilterBar,
  ImageUpload,
  Input,
  Menu,
  Pagination,
  Progress,
  SegmentedControl,
  Select,
  SidePanel,
  StatCard,
  Switch,
  Table,
  Tabs,
  Textarea,
  toast,
} from "@syvna/ui";

import { base, customerSlug, customers, money, orders, products, statusTone, statusWord, type Order } from "./data";
import { OrderBoard } from "./screens-more";

// ---------- Dashboard ----------

const week = [
  { label: "Mon", value: 1840 },
  { label: "Tue", value: 2310 },
  { label: "Wed", value: 1620 },
  { label: "Thu", value: 2980 },
  { label: "Fri", value: 3420 },
  { label: "Sat", value: 4180 },
  { label: "Sun", value: 2890 },
];

function SalesChart() {
  return <BarChart data={week} highlight="Sat" height={168} format={(v) => money.format(v)} label="Sales by day this week; Saturday was highest at $4,180" />;
}

export function Dashboard() {
  const [done, setDone] = useState<Record<string, boolean>>({ restock: true });
  const todo = [
    { id: "pack", label: "Pack 6 orders", detail: "2 are due by noon" },
    { id: "reply", label: "Answer Priya Raman", detail: "Asked about shipping to Chennai" },
    { id: "restock", label: "Reorder olive wood boards", detail: "4 left" },
    { id: "photos", label: "Add photos to the woven basket", detail: "It has none yet" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <Alert tone="warning" title="Olive wood boards are almost gone" action={<Button size="sm">Reorder</Button>}>
        4 left, and you sell about 7 a week.
      </Alert>
      <div className="grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-4">
        <StatCard label="To pack today" value="6" hint="2 due by noon" />
        <StatCard label="Sales this week" value="$19,240" change={{ value: "12%", trend: "up" }} hint="vs last week" />
        <StatCard label="New customers" value="23" change={{ value: "5", trend: "up" }} hint="vs last week" />
        <StatCard label="Returns" value="1" change={{ value: "2", trend: "down", upIsGood: false }} hint="vs last week" />
      </div>
      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title="Sales this week" description="Saturday was the best day since March." actions={<Button size="sm" variant="ghost" icon={<Download size={14} />}>Export</Button>}>
          <SalesChart />
        </Card>
        <Card title="To do today" footer={<span>{Object.values(done).filter(Boolean).length} of {todo.length} done</span>}>
          <div className="flex flex-col gap-4">
            {todo.map((t) => (
              <Checkbox key={t.id} label={t.label} description={t.detail} checked={!!done[t.id]} onChange={(e) => setDone((s) => ({ ...s, [t.id]: e.target.checked }))} />
            ))}
          </div>
        </Card>
      </div>
      <Card title="Latest orders" actions={<Link href={`${base}/orders`} className="text-label font-medium text-ink-2 no-underline hover:text-ink">View all</Link>} padded={false}>
        <Table
          flush
          caption="Latest orders"
          rows={orders.slice(0, 5)}
          rowKey={(o) => o.id}
          columns={[
            { key: "who", header: "Customer", render: (o) => <span className="inline-flex items-center gap-2.5"><Avatar name={o.who} size="sm" />{o.who}</span> },
            { key: "city", header: "City" },
            { key: "status", header: "Status", render: (o) => <Badge tone={statusTone[o.status]} dot>{statusWord[o.status]}</Badge> },
            { key: "total", header: "Total", align: "end", render: (o) => money.format(o.total) },
          ]}
        />
      </Card>
    </div>
  );
}

// ---------- Orders ----------

const orderActions = [
  { label: "Edit", icon: <Pencil size={16} /> },
  { label: "Duplicate", icon: <Copy size={16} /> },
  { label: "Cancel order", icon: <Trash2 size={16} />, danger: true, separated: true },
];

export function Orders({ view }: { view?: string }) {
  const [mode, setMode] = useState(view === "board" ? "board" : "list");
  const [filter, setFilter] = useState(view === "returns" ? "returned" : "all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Order | null>(null);
  const counts = useMemo(() => Object.fromEntries(["new", "packing", "shipped", "returned"].map((s) => [s, orders.filter((o) => o.status === s).length])), []);
  const rows = orders.filter((o) => (filter === "all" || o.status === filter) && (!query || `${o.who} ${o.city} ${o.id}`.toLowerCase().includes(query.toLowerCase())));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          variant="pills"
          label="Filter orders"
          value={filter}
          onValueChange={setFilter}
          items={[
            { value: "all", label: "All" },
            { value: "new", label: "New", count: counts.new },
            { value: "packing", label: "Packing", count: counts.packing },
            { value: "shipped", label: "Shipped" },
            { value: "returned", label: "Returned", count: counts.returned },
          ]}
        />
        <div className="flex w-full flex-wrap items-center gap-2 @3xl:w-auto">
          <SegmentedControl
            label="View"
            value={mode}
            onValueChange={setMode}
            options={[
              { value: "list", label: <><List />List</> },
              { value: "board", label: <><LayoutGrid />Board</> },
            ]}
          />
          <Input aria-label="Search orders" placeholder="Search by name, city or number" leading={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full flex-1 @3xl:w-[240px]" />
          <Button variant="primary" icon={<Plus size={16} />}>
            New order
          </Button>
        </div>
      </div>
      {mode === "board" ? <OrderBoard orders={rows} onOpen={setOpen} /> : (
      <Table
        caption="Orders"
        rows={rows}
        rowKey={(o) => o.id}
        selected={open ? [open.id] : []}
        onRowClick={setOpen}
        empty={<EmptyState icon={<Search size={22} />} title="No orders match" description="Try another name, or clear the filter." action={<Button onClick={() => { setQuery(""); setFilter("all"); }}>Clear</Button>} />}
        columns={[
          { key: "who", header: "Customer", sort: (a, b) => a.who.localeCompare(b.who), render: (o) => <span className="inline-flex items-center gap-2.5"><Avatar name={o.who} size="sm" />{o.who}</span> },
          { key: "id", header: "Order", render: (o) => <span className="font-mono text-small">#{o.id}</span> },
          { key: "city", header: "Ships to", render: (o) => `${o.city}, ${o.country}` },
          { key: "placed", header: "Placed" },
          { key: "status", header: "Status", render: (o) => <Badge tone={statusTone[o.status]} dot>{statusWord[o.status]}</Badge> },
          { key: "total", header: "Total", align: "end", sort: (a, b) => a.total - b.total, render: (o) => money.format(o.total) },
          {
            key: "more",
            header: <span className="sr-only">Actions</span>,
            width: "56px",
            render: () => (
              <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <Menu label="Order actions" trigger={<Button variant="ghost" size="sm" aria-label="Order actions" icon={<MoreHorizontal size={16} />} />} items={orderActions} />
              </span>
            ),
          },
        ]}
      />
      )}
      <SidePanel
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `Order #${open.id}` : ""}
        description={open ? <><Badge tone={statusTone[open.status]}>{statusWord[open.status]}</Badge>Placed {open.placed}</> : null}
        footer={
          <>
            <Button onClick={() => setOpen(null)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => {
                const id = open?.id;
                setOpen(null);
                toast({ title: `Order #${id} marked as packed`, description: "The customer gets a shipping email.", tone: "success", action: { label: "Undo", onClick: () => toast(`Order #${id} is back to packing`) } });
              }}
            >
              Mark as packed
            </Button>
          </>
        }
      >
        {open ? (
          <div className="flex flex-col gap-6">
            <DetailList items={[{ label: "Customer", value: open.who }, { label: "Ships to", value: `${open.city}, ${open.country}` }, { label: "Items", value: open.items }, { label: "Total", value: money.format(open.total) }, { label: "Payment", value: "Card ending 4242" }]} />
            <Field label="Note for the packer" hint="Printed on the packing slip.">
              <Textarea rows={3} placeholder="Gift wrap, please." />
            </Field>
          </div>
        ) : null}
      </SidePanel>
    </div>
  );
}

// ---------- Customers ----------

export const customerTone = { active: "success", new: "info", quiet: "neutral" } as const;
const PAGE = 5;

export function Customers() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [page, setPage] = useState(1);
  const rows = customers.filter(
    (c) =>
      (!query || `${c.name} ${c.email} ${c.city}`.toLowerCase().includes(query.toLowerCase())) &&
      (!values.status?.length || values.status.includes(c.status)) &&
      (!values.country?.length || values.country.includes(c.country)),
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice((Math.min(page, pageCount) - 1) * PAGE, Math.min(page, pageCount) * PAGE);
  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        query={query}
        onQueryChange={(q) => {
          setQuery(q);
          setPage(1);
        }}
        placeholder="Search customers"
        values={values}
        onValuesChange={(v) => {
          setValues(v);
          setPage(1);
        }}
        filters={[
          { key: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "new", label: "New" }, { value: "quiet", label: "Quiet" }] },
          { key: "country", label: "Country", options: [...new Set(customers.map((c) => c.country))].sort().map((c) => ({ value: c, label: c })) },
        ]}
        actions={
          <>
            <Button icon={<Upload size={16} />}>Import</Button>
            <Button variant="primary" icon={<Plus size={16} />}>Add customer</Button>
          </>
        }
      />
      <Table
        caption="Customers"
        rows={shown}
        rowKey={(c) => c.email}
        onRowClick={(c) => router.push(`${base}/customers/${customerSlug(c.name)}`)}
        empty={<EmptyState icon={<Search size={22} />} title="No customers match" description="Try another name, or clear the filters." />}
        columns={[
          { key: "name", header: "Name", sort: (a, b) => a.name.localeCompare(b.name), render: (c) => <span className="inline-flex items-center gap-2.5"><Avatar name={c.name} size="sm" /><span className="flex flex-col"><span>{c.name}</span><span className="text-small font-normal text-ink-3">{c.email}</span></span></span> },
          { key: "where", header: "Lives in", render: (c) => `${c.city}, ${c.country}` },
          { key: "status", header: "Status", render: (c) => <Badge tone={customerTone[c.status]}>{c.status === "active" ? "Active" : c.status === "new" ? "New" : "Quiet"}</Badge> },
          { key: "orders", header: "Orders", align: "end", sort: (a, b) => a.orders - b.orders },
          { key: "spent", header: "Spent", align: "end", sort: (a, b) => a.spent - b.spent, render: (c) => money.format(c.spent) },
        ]}
      />
      <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onPageChange={setPage} total={rows.length} pageSize={PAGE} noun="customers" />
    </div>
  );
}

// ---------- Products ----------

export function Products({ view }: { view?: string }) {
  const [tab, setTab] = useState(view === "stock" ? "stock" : "catalogue");
  const [adding, setAdding] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <SidePanel
        open={adding}
        onClose={() => setAdding(false)}
        title="New product"
        description="Photos first: the first one is what customers see in the shop."
        footer={
          <>
            <Button onClick={() => setAdding(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setAdding(false);
                toast({ title: "Product saved as a draft", description: "Publish it when it's ready.", tone: "success" });
              }}
            >
              Save draft
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <ImageUpload max={6} maxSize={5 * 1024 * 1024} />
          <Field label="Name" required><Input placeholder="Hand-thrown ceramic mug" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price"><Input leading="$" inputMode="decimal" placeholder="24.00" /></Field>
            <Field label="In stock"><Input inputMode="numeric" placeholder="40" /></Field>
          </div>
          <Field label="Description" aside="Optional"><Textarea rows={3} placeholder="Glazed by hand in Lisbon; holds 350 ml." /></Field>
        </div>
      </SidePanel>
      <Tabs
        label="Products"
        value={tab}
        onValueChange={setTab}
        items={[{ value: "catalogue", label: "Catalogue" }, { value: "stock", label: "Stock", count: 2 }, { value: "archived", label: "Archived" }]}
        actions={<Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setAdding(true)}>Add product</Button>}
      >
        {(t) =>
          t === "catalogue" ? (
            <div className="grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
              {products.map((p) => (
                <Card key={p.sku} padded={false} className="overflow-hidden">
                  <div className="grid aspect-[16/9] place-items-center bg-surface-2 text-ink-4"><Package size={32} /></div>
                  <div className="flex flex-col gap-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-subtitle font-semibold text-ink">{p.name}</span>
                      <span className="text-label font-medium tabular-nums text-ink">{money.format(p.price)}</span>
                    </div>
                    <span className="flex items-center gap-2 text-small text-ink-3">
                      {p.stock === 0 ? <Badge tone="danger">Sold out</Badge> : p.stock < 15 ? <Badge tone="warning">{p.stock} left</Badge> : <Badge tone="success">In stock</Badge>}
                      {p.sold} sold
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : t === "stock" ? (
            <Table
              caption="Stock"
              rows={products}
              rowKey={(p) => p.sku}
              columns={[
                { key: "name", header: "Product" },
                { key: "sku", header: "SKU", render: (p) => <span className="font-mono text-small">{p.sku}</span> },
                { key: "level", header: "Stock level", width: "34%", render: (p) => <Progress label={`${p.name} stock`} value={Math.min(100, p.stock)} tone={p.stock === 0 ? "danger" : p.stock < 15 ? "warning" : "success"} showValue /> },
                { key: "stock", header: "On hand", align: "end", sort: (a, b) => a.stock - b.stock },
              ]}
            />
          ) : (
            <Card padded={false}>
              <EmptyState icon={<Package size={22} />} title="Nothing archived" description="Products you stop selling go here, with their sales history." />
            </Card>
          )
        }
      </Tabs>
    </div>
  );
}

// ---------- Settings ----------

export function SettingsScreen({ view }: { view?: string }) {
  const [tab, setTab] = useState(view === "payments" || view === "team" ? view : "general");
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <Tabs label="Settings" value={tab} onValueChange={setTab} items={[{ value: "general", label: "General" }, { value: "payments", label: "Payments" }, { value: "team", label: "Team", count: 3 }]}>
        {(t) =>
          t === "general" ? (
            <div className="flex max-w-[720px] flex-col gap-6">
              {saved ? <Alert tone="success" onDismiss={() => setSaved(false)}>Your changes are saved.</Alert> : null}
              <Card title="Shop details" description="Shown on your website and receipts." footer={<><span>Last changed 3 days ago</span><Button variant="primary" onClick={() => setSaved(true)}>Save changes</Button></>}>
                <div className="grid gap-5 @xl:grid-cols-2">
                  <AvatarUpload className="@xl:col-span-2" name="Casa Verde" shape="rounded" hint="Your logo, square, at least 200 px." maxSize={2 * 1024 * 1024} onFile={() => toast({ title: "Logo updated", tone: "success" })} />
                  <Field label="Shop name" required><Input defaultValue="Casa Verde" /></Field>
                  <Field label="Support email" hint="Customers reply to this."><Input type="email" defaultValue="hello@casaverde.shop" /></Field>
                  <Field label="Country" ><Select defaultValue="pt" options={[{ value: "pt", label: "Portugal" }, { value: "es", label: "Spain" }, { value: "br", label: "Brazil" }, { value: "us", label: "United States" }]} /></Field>
                  <Field label="Currency" hint="Prices show in the customer's own too."><Select defaultValue="usd" options={[{ value: "usd", label: "US dollar (USD)" }, { value: "eur", label: "Euro (EUR)" }]} /></Field>
                  <Field label="About the shop" className="@xl:col-span-2" aside="Optional"><Textarea rows={3} defaultValue="Homeware made by hand in small workshops, shipped worldwide." /></Field>
                </div>
              </Card>
              <Card title="Notifications">
                <div className="flex flex-col gap-4">
                  <Switch label="New orders" description="An email for each order, as it comes in." defaultChecked />
                  <Switch label="Low stock" description="When a product drops below 10." defaultChecked />
                  <Switch label="Weekly summary" description="Sales and visitors, every Monday." />
                </div>
              </Card>
              <Card title="Close the shop" description="Takes the website offline and stops new orders. Your data stays.">
                <Button variant="danger" onClick={() => setConfirm(true)}>Close the shop</Button>
              </Card>
              <Dialog open={confirm} onClose={() => setConfirm(false)} size="sm" title="Close Casa Verde?" description="Your website goes offline and no new orders come in. You can open it again any time." footer={<><Button onClick={() => setConfirm(false)}>Cancel</Button><Button variant="danger" onClick={() => setConfirm(false)}>Close the shop</Button></>} />
            </div>
          ) : t === "payments" ? (
            <div className="flex max-w-[720px] flex-col gap-6">
              <Card title="Payouts" description="Sent to your bank every Friday.">
                <DetailList items={[{ label: "Bank", value: "Account ending 0921" }, { label: "Next payout", value: "Friday, $4,380.25" }, { label: "Fees", value: "2.9% + 30¢ a card payment" }]} />
              </Card>
              <Card title="Ways to pay" description="What customers can use at checkout.">
                <div className="flex flex-col gap-4">
                  <Checkbox label="Cards" description="Visa, Mastercard, American Express." defaultChecked />
                  <Checkbox label="Wallets" description="Apple Pay and Google Pay." defaultChecked />
                  <Checkbox label="Bank transfer" description="Slower; the order waits until it arrives." />
                </div>
              </Card>
            </div>
          ) : (
            <Card title="Team" description="People who can work on the shop." actions={<Button size="sm" icon={<Plus size={14} />}>Invite</Button>} padded={false}>
              <Table
                flush
                caption="Team"
                rows={[{ n: "Lucía Fernández", e: "lucia@casaverde.shop", r: "Owner" }, { n: "Tomás Ruiz", e: "tomas@casaverde.shop", r: "Admin" }, { n: "Nadia Haddad", e: "nadia@casaverde.shop", r: "Packing" }]}
                rowKey={(p) => p.e}
                columns={[
                  { key: "n", header: "Name", render: (p) => <span className="inline-flex items-center gap-2.5"><Avatar name={p.n} size="sm" />{p.n}</span> },
                  { key: "e", header: "Email" },
                  { key: "r", header: "Role", render: (p) => <Badge tone={p.r === "Owner" ? "brand" : "neutral"}>{p.r}</Badge> },
                ]}
              />
            </Card>
          )
        }
      </Tabs>
    </div>
  );
}

// ---------- Onboarding ----------

export function Onboarding() {
  const steps = [
    { label: "Name your shop", done: true },
    { label: "Add your first product", done: false, now: true },
    { label: "Set up payments", done: false },
    { label: "Open the shop", done: false },
  ];
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <Progress label="Setup" value={25} showValue />
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {steps.map((s, i) => (
          <li key={s.label}>
            <Card className={s.now ? "ring-2 ring-brand" : undefined} padded>
              <div className="flex items-center gap-4">
                <span className={`grid size-8 flex-none place-items-center rounded-full text-label font-semibold ${s.done ? "bg-success text-ground" : s.now ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-3"}`}>{s.done ? "✓" : i + 1}</span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-display text-subtitle font-semibold text-ink">{s.label}</span>
                  <span className="text-small text-ink-3">{s.done ? "Done" : s.now ? "Next up" : "After that"}</span>
                </div>
                {s.now ? <Button variant="primary">Add a product</Button> : s.done ? <Badge tone="success">Done</Badge> : null}
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- Sign in ----------

export function SignIn() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="grid min-h-full w-full place-items-center bg-ground px-4 py-12">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-11 place-items-center rounded-lg bg-brand font-display text-subtitle font-bold text-brand-ink">CV</span>
          <h1 className="m-0 font-display text-heading font-semibold text-ink">Sign in to Casa Verde</h1>
          <p className="m-0 text-body text-ink-3">Welcome back. Your orders are waiting.</p>
        </div>
        <Card>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              setTimeout(() => {
                setBusy(false);
                setError("That password doesn't match this email. Try again, or reset it.");
              }, 1200);
            }}
          >
            {error ? <Alert tone="danger">{error}</Alert> : null}
            <Field label="Email"><Input type="email" defaultValue="lucia@casaverde.shop" autoComplete="email" /></Field>
            <Field label="Password" aside={<a href="#" className="text-ink-2 no-underline hover:text-ink">Forgot it?</a>}><Input type="password" defaultValue="hunter22" autoComplete="current-password" /></Field>
            <Checkbox label="Keep me signed in" defaultChecked />
            <Button type="submit" variant="primary" size="lg" block loading={busy}>{busy ? "Signing in" : "Sign in"}</Button>
          </form>
        </Card>
        <p className="m-0 text-center text-label text-ink-3">New here? <a href="#" className="font-medium text-ink no-underline hover:underline">Open a shop</a></p>
      </div>
    </div>
  );
}
