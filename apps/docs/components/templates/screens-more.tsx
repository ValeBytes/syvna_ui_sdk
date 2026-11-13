"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, CreditCard, Mail, MapPin, MessageSquare, Package, Pencil, Phone, Plus, Send, ShoppingBag, Truck, Upload, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DetailList,
  EmptyState,
  FileUpload,
  LineChart,
  Progress,
  SegmentedControl,
  StatCard,
  Table,
  Tabs,
  Textarea,
  Timeline,
  Tooltip,
  cn,
  toast,
} from "@syvna/ui";

import { base, customerSlug, customers, money, orders as allOrders, statusTone, statusWord, type Order } from "./data";

// ---------- Order board ----------

const columns: Order["status"][] = ["new", "packing", "shipped", "delivered"];

/** Orders as cards in a column per status; drag a card to move it on. */
export function OrderBoard({ orders, onOpen }: { orders: Order[]; onOpen: (o: Order) => void }) {
  const [where, setWhere] = useState<Record<string, Order["status"]>>({});
  const [over, setOver] = useState<string | null>(null);
  const status = (o: Order) => where[o.id] ?? o.status;
  const move = (id: string, to: Order["status"]) => {
    const from = status(allOrders.find((o) => o.id === id)!);
    if (from === to) return;
    setWhere((w) => ({ ...w, [id]: to }));
    toast({
      title: `Order #${id} moved to ${statusWord[to]}`,
      tone: "success",
      action: { label: "Undo", onClick: () => setWhere((w) => ({ ...w, [id]: from })) },
    });
  };
  return (
    <div className="grid gap-3 @3xl:grid-cols-4">
      {columns.map((col) => {
        const cards = orders.filter((o) => status(o) === col);
        return (
          <section
            key={col}
            aria-label={statusWord[col]}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              move(e.dataTransfer.getData("text/plain"), col);
            }}
            className={cn("flex min-h-40 flex-col gap-2 rounded-lg bg-surface-2/60 p-2 transition-colors", over === col && "bg-brand-soft ring-1 ring-brand")}
          >
            <header className="flex items-center justify-between px-1.5 py-1">
              <span className="inline-flex items-center gap-2 text-label font-medium text-ink">
                <Badge tone={statusTone[col]} dot>
                  {statusWord[col]}
                </Badge>
              </span>
              <span className="text-small tabular-nums text-ink-3">{cards.length}</span>
            </header>
            {cards.map((o) => (
              <button
                key={o.id}
                type="button"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", o.id)}
                onClick={() => onOpen(o)}
                className="flex cursor-grab flex-col gap-2 rounded-md border border-line bg-surface p-3 text-left shadow-1 transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-2 focus-visible:outline-2 focus-visible:outline-focus active:cursor-grabbing"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-small text-ink-3">#{o.id}</span>
                  <span className="text-label font-medium tabular-nums text-ink">{money.format(o.total)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Avatar name={o.who} size="sm" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-label font-medium text-ink">{o.who}</span>
                    <span className="truncate text-small text-ink-3">
                      {o.city} · {o.items} {o.items === 1 ? "item" : "items"}
                    </span>
                  </span>
                </span>
              </button>
            ))}
            {cards.length === 0 ? <p className="m-0 px-2 py-6 text-center text-small text-ink-4">Drop an order here</p> : null}
          </section>
        );
      })}
    </div>
  );
}

// ---------- Customer detail ----------

const spend = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((label, i) => ({ label, value: [120, 180, 90, 260, 310, 420][i]! }));

export function CustomerDetail({ slug }: { slug: string }) {
  const c = customers.find((x) => customerSlug(x.name) === slug) ?? customers[0]!;
  const theirs = allOrders.filter((o) => o.who === c.name);
  return (
    <div className="grid gap-4 @3xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-col items-start gap-3">
            <Avatar name={c.name} size="xl" />
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-title font-semibold text-ink">{c.name}</span>
              <span className="text-small text-ink-3">
                Customer since {c.since} · {c.city}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" icon={<Plus size={14} />}>
                New order
              </Button>
              <Tooltip content="Send an email">
                <Button size="sm" aria-label="Send an email" icon={<Mail size={14} />} />
              </Tooltip>
              <Tooltip content="Edit details">
                <Button size="sm" aria-label="Edit details" icon={<Pencil size={14} />} />
              </Tooltip>
            </div>
          </div>
        </Card>
        <Card title="Contact">
          <DetailList
            items={[
              { label: <span className="inline-flex items-center gap-1.5"><Mail size={13} />Email</span>, value: c.email },
              { label: <span className="inline-flex items-center gap-1.5"><Phone size={13} />Phone</span>, value: "+234 801 234 5678" },
              { label: <span className="inline-flex items-center gap-1.5"><MapPin size={13} />Ships to</span>, value: `${c.city}, ${c.country}` },
            ]}
          />
        </Card>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid gap-3 @lg:grid-cols-3">
          <StatCard label="Spent" value={money.format(c.spent)} change={{ value: "18%", trend: "up" }} hint="vs last 6 months" />
          <StatCard label="Orders" value={String(c.orders)} hint={`Last on ${theirs[0]?.placed ?? "Mar 3"}`} />
          <Card padded={false} className="justify-center p-4">
            <span className="text-small font-medium text-ink-3">Spend, last 6 months</span>
            <LineChart bare data={spend} height={44} label="Spend rising over the last six months" className="mt-1" />
          </Card>
        </div>
        <Card padded>
          <Tabs label={`${c.name}'s history`} items={[{ value: "activity", label: "Activity" }, { value: "orders", label: "Orders", count: c.orders }, { value: "notes", label: "Notes" }]}>
            {(t) =>
              t === "activity" ? (
                <Timeline
                  items={[
                    { id: "a", title: "Order #1048 placed", description: "3 items · $128.00", time: "Today, 09:24", icon: <ShoppingBag />, tone: "info" },
                    { id: "b", title: "Asked about shipping to Abuja", description: "Answered by Tomás in 4 minutes", time: "Yesterday", icon: <MessageSquare /> },
                    { id: "c", title: "Payment received", description: "$212.50 by card ending 4242", time: "Oct 28", icon: <CreditCard />, tone: "success" },
                    { id: "d", title: "Delivered", description: "DHL · signed by A. Okafor", time: "Oct 22", icon: <Truck />, tone: "success" },
                  ]}
                />
              ) : t === "orders" ? (
                <Table
                  dense
                  caption="Orders"
                  rows={theirs.length ? theirs : allOrders.slice(2, 5)}
                  rowKey={(o) => o.id}
                  columns={[
                    { key: "id", header: "Order", render: (o) => <span className="font-mono text-small">#{o.id}</span> },
                    { key: "placed", header: "Placed" },
                    { key: "status", header: "Status", render: (o) => <Badge tone={statusTone[o.status]} dot>{statusWord[o.status]}</Badge> },
                    { key: "total", header: "Total", align: "end", render: (o) => money.format(o.total) },
                  ]}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <Textarea rows={4} aria-label="New note" placeholder="Prefers deliveries after 5pm." />
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" onClick={() => toast({ title: "Note saved", tone: "success" })}>
                      Save note
                    </Button>
                  </div>
                </div>
              )
            }
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// ---------- Inbox ----------

const messages = [
  { id: "m1", from: "Priya Raman", subject: "Shipping to Chennai?", preview: "Hi! Do you ship to Chennai, and how long does it usually take?", time: "09:41", unread: true, order: "1046" },
  { id: "m2", from: "Kenji Watanabe", subject: "Gift wrap for order #1047", preview: "Could you gift wrap the mug? It's a birthday present for my sister.", time: "08:55", unread: true, order: "1047" },
  { id: "m3", from: "Ana Souza", subject: "The basket arrived broken", preview: "One of the handles came off in the box. Photos attached.", time: "Yesterday", unread: true, order: "1044" },
  { id: "m4", from: "Liam O'Connor", subject: "Thank you!", preview: "Everything arrived perfectly, the carafe is beautiful.", time: "Mon", unread: false, order: "1041" },
  { id: "m5", from: "Fatima Zahra", subject: "Bulk order for a café", preview: "We're opening a café in Casablanca and would like 40 mugs.", time: "Sun", unread: false, order: undefined },
];

export function Inbox() {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState("m1");
  const [read, setRead] = useState<Record<string, boolean>>({});
  const list = messages.filter((m) => filter === "all" || (m.unread && !read[m.id]));
  const open = messages.find((m) => m.id === openId) ?? messages[0]!;
  return (
    <div className="grid h-full min-h-[560px] overflow-hidden rounded-lg border border-line bg-surface shadow-1 @3xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex min-h-0 flex-col border-line @3xl:border-r">
        <div className="flex items-center justify-between gap-2 border-b border-line p-2.5">
          <SegmentedControl size="sm" label="Show" value={filter} onValueChange={setFilter} options={[{ value: "all", label: "All" }, { value: "unread", label: "Unread" }]} />
          <Tooltip content="Archive read">
            <Button size="sm" variant="ghost" aria-label="Archive read" icon={<Archive size={14} />} />
          </Tooltip>
        </div>
        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-1">
          {list.map((m) => {
            const unread = m.unread && !read[m.id];
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(m.id);
                    setRead((r) => ({ ...r, [m.id]: true }));
                  }}
                  className={cn(
                    "flex w-full cursor-pointer gap-2.5 rounded-md p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                    m.id === open.id ? "bg-brand-soft" : "hover:bg-surface-2",
                  )}
                >
                  <Avatar name={m.from} size="sm" className="mt-0.5" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className={cn("min-w-0 flex-1 truncate text-label", unread ? "font-semibold text-ink" : "text-ink-2")}>{m.from}</span>
                      <span className="text-caption tabular-nums text-ink-3">{m.time}</span>
                    </span>
                    <span className={cn("truncate text-small", unread ? "font-medium text-ink" : "text-ink-2")}>{m.subject}</span>
                    <span className="truncate text-small text-ink-3">{m.preview}</span>
                  </span>
                  {unread ? <span className="mt-1.5 size-2 flex-none rounded-full bg-info" aria-label="Unread" /> : null}
                </button>
              </li>
            );
          })}
          {list.length === 0 ? <EmptyState icon={<Mail size={20} />} title="All caught up" description="New messages from customers land here." /> : null}
        </ul>
      </div>
      <div key={open.id} className="flex min-h-0 flex-col animate-tab-in motion-reduce:animate-none">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <Avatar name={open.from} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label font-semibold text-ink">{open.subject}</span>
            <span className="text-small text-ink-3">
              {open.from} · {open.time}
            </span>
          </div>
          {open.order ? (
            <Link href={`${base}/orders`} className="no-underline">
              <Badge tone="info">Order #{open.order}</Badge>
            </Link>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-body text-ink-2">
          <p className="m-0 max-w-[620px]">{open.preview}</p>
          <p className="m-0 mt-3 max-w-[620px]">Thanks so much,<br />{open.from.split(" ")[0]}</p>
        </div>
        <div className="flex flex-col gap-2 border-t border-line p-3">
          <Textarea rows={3} aria-label={`Reply to ${open.from}`} placeholder={`Reply to ${open.from.split(" ")[0]}…`} />
          <div className="flex items-start justify-between gap-3">
            <FileUpload key={open.id} variant="button" multiple maxSize={10 * 1024 * 1024} className="min-w-0 flex-1" />
            <Button size="sm" variant="primary" icon={<Send size={14} />} onClick={() => toast({ title: `Reply sent to ${open.from}`, tone: "success" })}>
              Send reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Empty shop ----------

export function Welcome() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-display text-title font-semibold text-ink">Casa Verde is ready to set up</span>
            <span className="text-body text-ink-3">Three steps to your first sale. About ten minutes.</span>
          </div>
          <Progress label="Setup" value={0} showValue className="w-full @lg:w-56" />
        </div>
      </Card>
      <div className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-4">
        {["Sales this week", "Orders", "Customers", "Visitors"].map((l) => (
          <StatCard key={l} label={l} value="—" hint="Shows once you start selling" />
        ))}
      </div>
      <div className="grid gap-4 @3xl:grid-cols-2">
        <Card title="Your first product" description="Add photos and a price; you can change everything later.">
          <FileUpload label="Drop product photos" accept="image/*" multiple maxSize={5 * 1024 * 1024} hint="PNG or JPG, up to 5 MB" onFiles={(f) => toast({ title: `${f.length} ${f.length === 1 ? "photo" : "photos"} added`, tone: "success" })} />
        </Card>
        <Card padded={false}>
          <EmptyState
            icon={<ShoppingBag size={20} />}
            title="No orders yet"
            description="Orders appear here as soon as someone buys. Share your shop to get the first one."
            action={
              <Button variant="primary" icon={<Send size={14} />} onClick={() => toast({ title: "Link copied", description: "casaverde.shop", tone: "success" })}>
                Share your shop
              </Button>
            }
          />
        </Card>
        <Card padded={false}>
          <EmptyState icon={<Users size={20} />} title="No customers yet" description="Everyone who buys is added here. Already have a list? Bring it in." action={<Button icon={<Upload size={14} />}>Import a CSV</Button>} />
        </Card>
        <Card padded={false}>
          <EmptyState icon={<Package size={20} />} title="Nothing to ship" description="Paid orders wait here until they're packed." />
        </Card>
      </div>
    </div>
  );
}
