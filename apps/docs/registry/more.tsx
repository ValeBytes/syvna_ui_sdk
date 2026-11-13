"use client";

import { useEffect, useState } from "react";
import { Bell, CreditCard, Package, Plus, Search, Settings, ShoppingBag, Truck, Undo2, Users } from "lucide-react";
import {
  Avatar,
  BarChart,
  Button,
  Calendar,
  Combobox,
  CommandPalette,
  DatePicker,
  Field,
  AvatarUpload,
  FileUpload,
  ImageUpload,
  UploadItem,
  FilterBar,
  LineChart,
  Pagination,
  Popover,
  RadioGroup,
  SegmentedControl,
  Timeline,
  Toaster,
  Tooltip,
  toast,
  type Tone,
} from "@syvna/ui";

import { bool, jsx, num, raw, str } from "./code";
import type { Doc } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const people = [
  { value: "amara", label: "Amara Okafor", description: "Lagos, Nigeria" },
  { value: "kenji", label: "Kenji Watanabe", description: "Osaka, Japan" },
  { value: "priya", label: "Priya Raman", description: "Bengaluru, India" },
  { value: "jonas", label: "Jonas Becker", description: "Hamburg, Germany" },
  { value: "ana", label: "Ana Souza", description: "São Paulo, Brazil" },
  { value: "lucas", label: "Lucas Moreau", description: "Lyon, France" },
  { value: "fatima", label: "Fatima Zahra", description: "Casablanca, Morocco" },
  { value: "liam", label: "Liam O'Connor", description: "Dublin, Ireland" },
  { value: "mei", label: "Mei Lin", description: "Taipei, Taiwan" },
].map((p) => ({ ...p, icon: <Avatar name={p.label} size="sm" className="size-5 text-[9px]" /> }));

const week = [
  { label: "Mon", value: 1840 },
  { label: "Tue", value: 2310 },
  { label: "Wed", value: 1620 },
  { label: "Thu", value: 2980 },
  { label: "Fri", value: 3420 },
  { label: "Sat", value: 4180 },
  { label: "Sun", value: 2890 },
];
const month = Array.from({ length: 30 }, (_, i) => ({ label: `Nov ${i + 1}`, value: Math.round(900 + Math.sin(i / 3) * 260 + i * 38 + ((i * 37) % 11) * 30) }));

function ToastDemo({ tone, action }: { tone: string; action: boolean }) {
  return (
    <>
      <Button
        variant="primary"
        onClick={() =>
          toast({
            title: tone === "danger" ? "Couldn't send the invoice" : tone === "success" ? "Order #1048 marked as packed" : "Export started",
            description: tone === "danger" ? "The customer's email bounced. Check the address and try again." : tone === "success" ? "Amara Okafor gets a shipping email." : "We'll tell you when it's ready.",
            tone: tone as "success",
            action: action ? { label: "Undo", onClick: () => toast("Undone") } : undefined,
          })
        }
      >
        Show a toast
      </Button>
      <Toaster />
    </>
  );
}

function PaletteDemo() {
  const [open, setOpen] = useState(true);
  const go = (what: string) => () => toast(what);
  return (
    <>
      <Button icon={<Search size={15} />} onClick={() => setOpen(true)}>
        Search <kbd className="ml-2 rounded-sm border border-line px-1 text-caption text-ink-3">⌘K</kbd>
      </Button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        groups={[
          {
            label: "Go to",
            items: [
              { label: "Orders", icon: <ShoppingBag size={16} />, shortcut: "G O", onSelect: go("Orders") },
              { label: "Customers", icon: <Users size={16} />, shortcut: "G C", onSelect: go("Customers") },
              { label: "Settings", icon: <Settings size={16} />, keywords: ["preferences"], onSelect: go("Settings") },
            ],
          },
          {
            label: "Create",
            items: [
              { label: "New order", icon: <Plus size={16} />, shortcut: "N", onSelect: go("New order") },
              { label: "New product", icon: <Package size={16} />, onSelect: go("New product") },
            ],
          },
          { label: "Customers", items: people.slice(0, 4).map((p) => ({ label: p.label, hint: p.description, icon: p.icon, onSelect: go(p.label) })) },
        ]}
      />
      <Toaster />
    </>
  );
}

function FilterDemo({ search }: { search: boolean }) {
  const [values, setValues] = useState<Record<string, string[]>>({ status: ["paid"] });
  const [query, setQuery] = useState("");
  return (
    <FilterBar
      className="w-full"
      query={search ? query : undefined}
      onQueryChange={search ? setQuery : undefined}
      placeholder="Search orders"
      values={values}
      onValuesChange={setValues}
      filters={[
        { key: "status", label: "Status", options: [{ value: "new", label: "New" }, { value: "paid", label: "Paid" }, { value: "shipped", label: "Shipped" }, { value: "returned", label: "Returned" }] },
        { key: "country", label: "Country", options: [{ value: "ng", label: "Nigeria" }, { value: "jp", label: "Japan" }, { value: "br", label: "Brazil" }, { value: "de", label: "Germany" }] },
        { key: "channel", label: "Channel", options: [{ value: "web", label: "Website" }, { value: "shop", label: "In store" }] },
      ]}
      actions={<SegmentedControl size="sm" label="View" options={[{ value: "list", label: "List" }, { value: "board", label: "Board" }]} />}
    />
  );
}

function PaginationDemo({ pageCount }: { pageCount: number }) {
  const [page, setPage] = useState(2);
  return <Pagination className="w-full" page={Math.min(page, pageCount)} pageCount={pageCount} onPageChange={setPage} total={pageCount * 20 - 8} pageSize={20} noun="orders" />;
}

type Upload = { id: string; name: string; size: number; status: "uploading" | "done" | "error"; progress: number; error?: string };

/** Three files: one climbing, one done, one that failed until retried. */
function UploadsDemo({ step }: { step: number }) {
  const [list, setList] = useState<Upload[]>([
    { id: "a", name: "price-list-2026.xlsx", size: 284_000, status: "uploading", progress: 12 },
    { id: "b", name: "invoice-INV-2041.pdf", size: 1_240_000, status: "done", progress: 100 },
    { id: "c", name: "shop-front.jpg", size: 3_800_000, status: "error", progress: 40, error: "The connection dropped at 40%." },
  ]);
  useEffect(() => {
    const t = setInterval(() => {
      setList((l) => l.map((u) => (u.status !== "uploading" ? u : u.progress + step >= 100 ? { ...u, progress: 100, status: "done" } : { ...u, progress: u.progress + step })));
    }, 300);
    return () => clearInterval(t);
  }, [step]);
  const patch = (id: string, u: Partial<Upload>) => setList((l) => l.map((x) => (x.id === id ? { ...x, ...u } : x)));
  return (
    <div className="flex w-full max-w-[460px] flex-col gap-2">
      {list.map((u) => (
        <UploadItem
          key={u.id}
          name={u.name}
          size={u.size}
          status={u.status}
          progress={u.progress}
          error={u.error}
          onCancel={() => patch(u.id, { status: "error", error: "Cancelled." })}
          onRetry={() => patch(u.id, { status: "uploading", progress: 0, error: undefined })}
          onRemove={() => setList((l) => l.filter((x) => x.id !== u.id))}
        />
      ))}
      {list.length === 0 ? <p className="m-0 text-label text-ink-3">All removed. Change a control to start again.</p> : null}
    </div>
  );
}

const photos = [
  "photo-1514228742587-6b1558fcca3d",
  "photo-1610701596007-11502861dcfa",
  "photo-1578749556568-bc2c40e68b61",
].map((id, i) => ({ id, src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=300&h=300&q=70`, alt: ["Ceramic mug", "Stacked bowls", "Glazed vase"][i] }));

function ImagesDemo({ ratio, max, samples }: { ratio: "square" | "wide" | "tall"; max: number; samples: boolean }) {
  const [images, setImages] = useState(samples ? photos.slice(0, Math.min(max, 3)) : []);
  return (
    <ImageUpload
      className="w-full max-w-[520px]"
      ratio={ratio}
      max={max}
      maxSize={5 * 1024 * 1024}
      images={images}
      onRemove={(id) => setImages((l) => l.filter((x) => x.id !== id))}
      onFiles={(files) => setImages((l) => [...l, ...files.map((f) => ({ id: `${f.name}-${f.size}`, src: URL.createObjectURL(f), alt: f.name }))])}
    />
  );
}

export const more: Doc[] = [
  {
    name: "Toaster",
    controls: { tone: { type: "select", options: ["success", "neutral", "warning", "danger"], default: "success" }, action: { type: "boolean", default: true, label: "Undo action" } },
    stage: "min-h-[320px]",
    preview: (v) => <ToastDemo tone={str(v.tone)} action={bool(v.action)} />,
    code: (v) =>
      `// Once, in the root layout:\n<Toaster />\n\n// Anywhere:\ntoast({\n  title: "Order #1048 marked as packed",\n  tone: "${str(v.tone)}",${bool(v.action) ? '\n  action: { label: "Undo", onClick: undo },' : ""}\n});`,
  },
  {
    name: "Tooltip",
    controls: { content: { type: "text", default: "Notifications" }, side: { type: "select", options: ["top", "bottom"], default: "top" } },
    preview: (v) => (
      <div className="flex gap-3">
        <Tooltip content={str(v.content)} side={str(v.side) as "top"}>
          <Button aria-label={str(v.content)} icon={<Bell size={15} />} />
        </Tooltip>
        <Tooltip content="Ships with tracking, 2 to 4 days" side={str(v.side) as "top"}>
          <Button icon={<Truck size={15} />}>Standard</Button>
        </Tooltip>
      </div>
    ),
    code: (v) => jsx("Tooltip", { content: str(v.content), side: str(v.side) }, '<Button aria-label="Notifications" icon={<Bell size={15} />} />', { side: "top" }),
  },
  {
    name: "Popover",
    controls: { align: { type: "select", options: ["start", "end"], default: "start" } },
    stage: "min-h-[300px] items-start",
    preview: (v) => (
      <Popover
        key={str(v.align)}
        align={str(v.align) as "start"}
        label="Delivery note"
        panelClassName="w-72"
        trigger={<Button>Add a delivery note</Button>}
      >
        {(close) => (
          <div className="flex flex-col gap-3">
            <Field label="Note for the courier" hint="Printed on the label.">
              <textarea rows={3} className="w-full rounded-md border border-line-strong bg-surface px-3 py-1.5 text-body text-ink outline-none focus:border-focus" defaultValue="Leave with the neighbour at 12B." />
            </Field>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={close}>
                Save note
              </Button>
            </div>
          </div>
        )}
      </Popover>
    ),
    code: (v) => jsx("Popover", { align: str(v.align), label: "Delivery note", panelClassName: "w-72", trigger: raw("<Button>Add a delivery note</Button>") }, "{(close) => <NoteForm onDone={close} />}", { align: "start" }),
  },
  {
    name: "CommandPalette",
    stage: "min-h-[480px] items-start",
    preview: () => <PaletteDemo />,
    code: () =>
      `const [open, setOpen] = useState(false);\nuseCommandKey(() => setOpen(true));\n\n<CommandPalette\n  open={open}\n  onClose={() => setOpen(false)}\n  groups={[\n    { label: "Go to", items: [{ label: "Orders", icon: <ShoppingBag size={16} />, onSelect: () => router.push("/orders") }] },\n    { label: "Create", items: [{ label: "New order", shortcut: "N", onSelect: newOrder }] },\n  ]}\n/>`,
  },
  {
    name: "Combobox",
    controls: {
      variant: { type: "select", options: ["outline", "filled", "underline", "cupertino", "pill", "ghost"], default: "outline" },
      size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
      placeholder: { type: "text", default: "Choose a customer" },
      invalid: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false },
    },
    stage: "min-h-[360px] items-start",
    preview: (v) => (
      <Field label="Customer" className="w-full max-w-[320px]">
        <Combobox options={people} variant={str(v.variant) as "outline"} size={str(v.size) as "md"} placeholder={str(v.placeholder)} invalid={bool(v.invalid)} disabled={bool(v.disabled)} />
      </Field>
    ),
    code: (v) => jsx("Combobox", { variant: str(v.variant) === "outline" ? undefined : str(v.variant), size: str(v.size) === "md" ? undefined : str(v.size), options: raw("customers"), value: raw("customerId"), onValueChange: raw("setCustomerId"), placeholder: str(v.placeholder), invalid: bool(v.invalid), disabled: bool(v.disabled) }),
  },
  {
    name: "DatePicker",
    controls: {
      variant: { type: "select", options: ["outline", "filled", "underline", "cupertino", "pill", "ghost"], default: "outline" },
      size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
      weekStartsOn: { type: "select", options: ["1", "0"], default: "1", label: "Week starts (1 Monday, 0 Sunday)" },
      future: { type: "boolean", default: true, label: "Only future days (min)" },
    },
    stage: "min-h-[420px] items-start",
    preview: (v) => (
      <Field label="Delivery date" hint="We deliver Monday to Saturday." className="w-full max-w-[280px]">
        <DatePicker key={`${v.weekStartsOn}${v.future}`} variant={str(v.variant) as "outline"} size={str(v.size) as "md"} locale="en-US" weekStartsOn={num(v.weekStartsOn) as 0 | 1} min={bool(v.future) ? new Date() : undefined} />
      </Field>
    ),
    code: (v) => jsx("DatePicker", { variant: str(v.variant) === "outline" ? undefined : str(v.variant), size: str(v.size) === "md" ? undefined : str(v.size), value: raw("date"), onChange: raw("setDate"), min: bool(v.future) ? raw("new Date()") : undefined, weekStartsOn: str(v.weekStartsOn) === "0" ? raw("0") : undefined }),
  },
  {
    name: "Calendar",
    preview: () => {
      function C() {
        const [d, setD] = useState<Date | null>(new Date(2026, 11, 4));
        return <Calendar value={d} onChange={setD} locale="en-US" />;
      }
      return <C />;
    },
    code: () => jsx("Calendar", { value: raw("day"), onChange: raw("setDay"), min: raw("new Date()") }),
  },
  {
    name: "RadioGroup",
    controls: { variant: { type: "select", options: ["list", "cards"], default: "cards" }, inline: { type: "boolean", default: false } },
    preview: (v) => (
      <RadioGroup
        className="w-full max-w-[420px]"
        label="Delivery speed"
        variant={str(v.variant) as "list"}
        inline={bool(v.inline)}
        defaultValue="standard"
        options={[
          { value: "standard", label: "Standard · Free", description: "2 to 4 working days, tracked." },
          { value: "express", label: "Express · $12", description: "Next working day if ordered by 2pm." },
          { value: "pickup", label: "Pick up in store", description: "Ready in an hour at Rua do Carmo 21." },
        ]}
      />
    ),
    code: (v) => jsx("RadioGroup", { label: "Delivery speed", variant: str(v.variant), inline: bool(v.inline), value: raw("speed"), onValueChange: raw("setSpeed"), options: raw('[{ value: "standard", label: "Standard · Free", description: "2 to 4 working days" }, …]') }, undefined, { variant: "list" }),
  },
  {
    name: "SegmentedControl",
    controls: { size: { type: "select", options: ["sm", "md"], default: "md" }, block: { type: "boolean", default: false } },
    preview: (v) => (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-4">
        <SegmentedControl key={`${v.size}${v.block}`} label="Billing" size={str(v.size) as "md"} block={bool(v.block)} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly · save 20%" }]} />
        <SegmentedControl key={`b${v.size}${v.block}`} label="Range" size={str(v.size) as "md"} block={bool(v.block)} defaultValue="week" options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} />
      </div>
    ),
    code: (v) => jsx("SegmentedControl", { label: "Range", size: str(v.size), block: bool(v.block), value: raw("range"), onValueChange: raw("setRange"), options: raw('[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, …]') }, undefined, { size: "md" }),
  },
  {
    name: "FileUpload",
    controls: {
      variant: { type: "select", options: ["dropzone", "compact", "button"], default: "dropzone" },
      multiple: { type: "boolean", default: true },
      hint: { type: "text", default: "PDF or CSV, up to 5 MB" },
    },
    preview: (v) => (
      <FileUpload
        key={`${v.variant}${v.multiple}`}
        className="w-full max-w-[460px]"
        variant={str(v.variant) as "dropzone"}
        label={v.variant === "button" ? undefined : "Invoices and price lists"}
        accept=".pdf,.csv,.xlsx"
        multiple={bool(v.multiple)}
        maxSize={5 * 1024 * 1024}
        hint={str(v.hint) || undefined}
      />
    ),
    code: (v) => jsx("FileUpload", { variant: str(v.variant), label: v.variant === "button" ? undefined : "Invoices and price lists", accept: ".pdf,.csv,.xlsx", multiple: bool(v.multiple), maxSize: raw("5 * 1024 * 1024"), hint: str(v.hint), onFiles: raw("upload") }, undefined, { variant: "dropzone" }),
  },
  {
    name: "UploadItem",
    controls: { speed: { type: "select", options: ["slow", "fast"], default: "slow" } },
    preview: (v) => <UploadsDemo key={str(v.speed)} step={v.speed === "fast" ? 9 : 3} />,
    code: () =>
      `{uploads.map((u) => (\n  <UploadItem\n    key={u.id}\n    name={u.file.name}\n    size={u.file.size}\n    status={u.status}\n    progress={u.progress}\n    error={u.error}\n    onCancel={() => cancel(u.id)}\n    onRetry={() => retry(u.id)}\n    onRemove={() => remove(u.id)}\n  />\n))}`,
  },
  {
    name: "ImageUpload",
    controls: { ratio: { type: "select", options: ["square", "wide", "tall"], default: "square" }, max: { type: "number", default: 6, min: 1, max: 12 }, samples: { type: "boolean", default: true, label: "Start with pictures" } },
    preview: (v) => <ImagesDemo key={`${v.ratio}${v.max}${v.samples}`} ratio={str(v.ratio) as "square"} max={num(v.max)} samples={bool(v.samples)} />,
    code: (v) => jsx("ImageUpload", { images: raw("photos"), onFiles: raw("upload"), onRemove: raw("remove"), max: num(v.max), ratio: str(v.ratio), maxSize: raw("5 * 1024 * 1024") }, undefined, { ratio: "square", max: 8 }),
  },
  {
    name: "AvatarUpload",
    controls: { shape: { type: "select", options: ["circle", "rounded"], default: "circle" }, name: { type: "text", default: "Lucía Fernández" } },
    preview: (v) => <AvatarUpload key={str(v.shape)} name={str(v.name)} shape={str(v.shape) as "circle"} hint="Square, at least 200 px" maxSize={2 * 1024 * 1024} />,
    code: (v) => jsx("AvatarUpload", { name: str(v.name), src: raw("user.photo"), onFile: raw("uploadPhoto"), onRemove: raw("removePhoto"), shape: str(v.shape), hint: "Square, at least 200 px" }, undefined, { shape: "circle" }),
  },
  {
    name: "Pagination",
    controls: { pageCount: { type: "number", default: 16, min: 1, max: 40, label: "pageCount" } },
    preview: (v) => <PaginationDemo key={String(v.pageCount)} pageCount={Math.max(1, num(v.pageCount))} />,
    code: (v) => jsx("Pagination", { page: raw("page"), pageCount: num(v.pageCount), onPageChange: raw("setPage"), total: raw("312"), pageSize: 20, noun: "orders" }),
  },
  {
    name: "FilterBar",
    controls: { search: { type: "boolean", default: true, label: "Search box" } },
    stage: "min-h-[300px] items-start",
    preview: (v) => <FilterDemo key={String(v.search)} search={bool(v.search)} />,
    code: (v) =>
      jsx("FilterBar", {
        query: bool(v.search) ? raw("query") : undefined,
        onQueryChange: bool(v.search) ? raw("setQuery") : undefined,
        placeholder: bool(v.search) ? "Search orders" : undefined,
        filters: raw('[{ key: "status", label: "Status", options: [{ value: "paid", label: "Paid" }, …] }]'),
        values: raw("filters"),
        onValuesChange: raw("setFilters"),
      }),
  },
  {
    name: "Timeline",
    preview: () => (
      <Timeline
        className="w-full max-w-[460px]"
        items={[
          { id: "4", title: "Out for delivery", description: "DHL · tracking 4829 1103 772", time: "Today, 09:12", icon: <Truck />, tone: "info" },
          { id: "3", title: "Lucía added a note", description: "“Gift wrap, and leave with the neighbour.”", time: "Yesterday, 18:40" },
          { id: "2", title: "Payment received", description: "$128.00 by card ending 4242", time: "Yesterday, 09:25", icon: <CreditCard />, tone: "success" },
          { id: "1", title: "Order placed", description: "3 items from the website", time: "Yesterday, 09:24", icon: <ShoppingBag /> },
          { id: "0", title: "Refund of $12.00", description: "Shipping refunded after a late delivery", time: "Nov 2", icon: <Undo2 />, tone: "warning" },
        ]}
      />
    ),
    code: () => jsx("Timeline", { items: raw('[{ id: "2", title: "Payment received", time: "Yesterday, 09:25", icon: <CreditCard />, tone: "success" }, …]') }),
  },
  {
    name: "BarChart",
    controls: { highlight: { type: "select", options: ["none", "Sat", "Fri"], default: "Sat" }, height: { type: "number", default: 180, min: 80, max: 320, step: 20 } },
    preview: (v) => <BarChart key={`${v.highlight}`} className="w-full max-w-[520px]" data={week} height={num(v.height)} highlight={v.highlight === "none" ? undefined : str(v.highlight)} format={(n) => money.format(n)} label="Sales by day this week; Saturday was highest at $4,180" />,
    code: (v) => jsx("BarChart", { data: raw("salesByDay"), highlight: v.highlight === "none" ? undefined : str(v.highlight), height: num(v.height), format: raw("(v) => money.format(v)"), label: "Sales by day this week; Saturday was highest" }, undefined, { height: 160 }),
  },
  {
    name: "LineChart",
    controls: { bare: { type: "boolean", default: false, label: "Sparkline (bare)" }, tone: { type: "select", options: ["brand", "success", "info", "danger"], default: "brand" } },
    preview: (v) =>
      bool(v.bare) ? (
        <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 shadow-1">
          <div className="flex flex-col">
            <span className="text-small text-ink-3">Visitors</span>
            <span className="font-display text-stat font-semibold text-ink">38,240</span>
          </div>
          <LineChart key={str(v.tone)} bare data={month} height={40} tone={str(v.tone) as Tone} className="w-36" label="Visitors this month, rising" />
        </div>
      ) : (
        <LineChart key={str(v.tone)} className="w-full max-w-[560px]" data={month} height={180} tone={str(v.tone) as Tone} format={(n) => new Intl.NumberFormat("en-US").format(n)} label="Visitors a day in November, rising from about 900 to 2,100" />
      ),
    code: (v) => jsx("LineChart", { data: raw("visitorsByDay"), bare: bool(v.bare), height: bool(v.bare) ? 40 : undefined, tone: str(v.tone), label: "Visitors a day this month, rising" }, undefined, { tone: "brand" }),
  },
];
