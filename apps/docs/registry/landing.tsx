"use client";

import { Bell, Check, Clock, ShieldCheck } from "lucide-react";
import { Badge, Bento, Button, FeatureRows, MobileBar, PriceTag, Reveal, Stagger, Stats, Steps, revealEffects, type RevealEffect } from "@syvna/ui";

import { bool, jsx, num, raw, str } from "./code";
import type { Doc } from "./types";

/** A small piece of a product, for pictures in landing sections. */
export function RequestsShot({ rows = 4 }: { rows?: number }) {
  const data = [
    ["PO-2291", "Forklift service", "Hamburg", "Approved", "success"],
    ["PO-2290", "Packing film, 40 rolls", "Osaka", "Waiting", "warning"],
    ["PO-2289", "Safety boots", "Lagos", "Approved", "success"],
    ["PO-2288", "Dock scanner", "São Paulo", "Waiting", "warning"],
    ["PO-2287", "Pallet racking", "Hamburg", "Ordered", "info"],
  ].slice(0, rows);
  return (
    <div className="w-full overflow-hidden rounded-t-lg border border-b-0 border-line bg-surface text-left">
      {data.map((r) => (
        <div key={r[0]} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-label last:border-0">
          <span className="font-mono text-caption text-ink-3">{r[0]}</span>
          <span className="min-w-0 flex-1 truncate text-ink">{r[1]}</span>
          <span className="hidden text-ink-3 @sm:block">{r[2]}</span>
          <Badge tone={r[4] as "success"}>{r[3]}</Badge>
        </div>
      ))}
    </div>
  );
}

export function BarsShot() {
  const bars = [38, 52, 46, 64, 58, 76, 88];
  return (
    <div className="flex h-28 w-full items-end gap-2 pb-6">
      {bars.map((h, i) => (
        <span key={i} className={i === bars.length - 1 ? "flex-1 rounded-t-sm bg-current" : "flex-1 rounded-t-sm bg-current/35"} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

const bento = [
  { title: "Every request in one queue", description: "Raised from a phone, approved from anywhere.", media: <RequestsShot />, span: "wide" as const },
  { title: "Spend, month by month", description: "Against budget, by site.", media: <BarsShot />, tone: "brand" as const },
  { title: "Nothing ordered twice", description: "Duplicates are caught before they're approved.", icon: <ShieldCheck /> },
  { title: "Reminders that chase for you", description: "Approvers hear about what's waiting on them.", icon: <Bell /> },
  { title: "Approved in four hours", description: "On average, down from three days.", icon: <Clock /> },
];

const rows = [
  { eyebrow: "Requests", title: "Raise it where the work is", description: "Site staff ask for what they need from a phone, with a photo and a price.", points: ["Takes under a minute", "Works with patchy signal"], media: <div className="p-5 pb-0"><RequestsShot rows={5} /></div> },
  { eyebrow: "Approvals", title: "Approve between meetings", description: "Managers see what's waiting, what it costs and what's left in the budget.", points: ["One tap to approve or send back", "Limits by role"], media: <div className="p-5 pb-0"><RequestsShot rows={3} /></div> },
];

const stats = [
  { value: "1,240", label: "requests a month", note: "across 14 sites" },
  { value: "4 h", label: "to approve, on average" },
  { value: "31%", label: "fewer duplicate orders" },
];

const steps = [
  { title: "Bring your suppliers", description: "Import them from a spreadsheet." },
  { title: "Set who approves what", description: "By site, amount and category." },
  { title: "Invite your sites", description: "They raise their first request the same day." },
];

export const landing: Doc[] = [
  {
    name: "MobileBar",
    controls: { note: { type: "boolean", default: true, label: "Price beside the button" } },
    stage: "items-start",
    preview: (v) => (
      <div className="flex w-full max-w-[420px] flex-col gap-3">
        <p className="m-0 text-small text-ink-3">On a phone it's fixed to the bottom of the screen; here it's shown in place. Wider than a phone, it isn't drawn at all.</p>
        <div className="overflow-hidden rounded-xl border border-line [&>div:last-child]:static [&>div:last-child]:flex">
          <MobileBar note={bool(v.note) ? <PriceTag amount={38} /> : undefined}>
            <Button variant="raised" size="lg">Add to cart</Button>
          </MobileBar>
        </div>
      </div>
    ),
    code: (v) => jsx("MobileBar", { note: bool(v.note) ? raw("<PriceTag amount={38} />") : undefined }, '<Button variant="raised" size="lg" onClick={add}>Add to cart</Button>'),
  },
  {
    name: "Bento",
    controls: { columns: { type: "select", options: ["3", "4"], default: "3" }, animate: { type: "boolean", default: false } },
    stage: "items-start",
    preview: (v) => <Bento className="max-w-[1100px]" columns={num(v.columns) as 3} animate={bool(v.animate)} items={bento} />,
    code: (v) =>
      jsx("Bento", {
        columns: num(v.columns) === 3 ? undefined : num(v.columns),
        animate: bool(v.animate) || undefined,
        items: raw('[\n  { title: "Every request in one queue", description: "…", media: <RequestsPreview />, span: "wide" },\n  { title: "Spend, month by month", media: <SpendChart />, tone: "brand" },\n  { title: "Nothing ordered twice", description: "…", icon: <ShieldCheck /> },\n  …\n]'),
      }),
  },
  {
    name: "FeatureRows",
    controls: { start: { type: "select", options: ["media-right", "media-left"], default: "media-right" }, animate: { type: "boolean", default: false } },
    stage: "items-start",
    preview: (v) => <FeatureRows className="max-w-[1100px]" start={str(v.start) as "media-right"} animate={bool(v.animate)} rows={rows} />,
    code: (v) =>
      jsx("FeatureRows", {
        start: str(v.start) === "media-right" ? undefined : str(v.start),
        animate: bool(v.animate) || undefined,
        rows: raw('[\n  { eyebrow: "Requests", title: "Raise it where the work is", description: "…", points: ["Takes under a minute"], media: <RequestsScreen /> },\n  …\n]'),
      }),
  },
  {
    name: "Stats",
    controls: { variant: { type: "select", options: ["plain", "cards", "band"], default: "plain" }, animate: { type: "boolean", default: false } },
    stage: "items-start",
    preview: (v) => <Stats className="max-w-[1000px]" variant={str(v.variant) as "plain"} animate={bool(v.animate)} stats={stats} />,
    code: (v) => jsx("Stats", { variant: str(v.variant) === "plain" ? undefined : str(v.variant), animate: bool(v.animate) || undefined, stats: raw('[{ value: "1,240", label: "requests a month", note: "across 14 sites" }, …]') }),
  },
  {
    name: "Steps",
    controls: { variant: { type: "select", options: ["row", "list"], default: "row" }, animate: { type: "boolean", default: false } },
    stage: "items-start",
    preview: (v) => <Steps className="max-w-[1000px]" variant={str(v.variant) as "row"} animate={bool(v.animate)} steps={steps} />,
    code: (v) => jsx("Steps", { variant: str(v.variant) === "row" ? undefined : str(v.variant), animate: bool(v.animate) || undefined, steps: raw('[{ title: "Bring your suppliers", description: "Import them from a spreadsheet." }, …]') }),
  },
  {
    name: "Reveal",
    controls: {
      effect: { type: "select", options: revealEffects, default: "up" },
      duration: { type: "number", default: 600, min: 200, max: 1200, step: 100 },
      delay: { type: "number", default: 0, min: 0, max: 600, step: 50 },
      distance: { type: "number", default: 16, min: 4, max: 48, step: 4 },
    },
    preview: (v) => (
      // The key replays it whenever a control changes.
      <Reveal key={JSON.stringify(v)} when="load" effect={str(v.effect) as RevealEffect} duration={num(v.duration)} delay={num(v.delay)} distance={num(v.distance)} className="w-full max-w-[420px]">
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-6 shadow-2">
          <span className="grid size-9 place-items-center rounded-md bg-brand-soft text-brand"><Check size={18} /></span>
          <h3 className="m-0 font-display text-title font-semibold text-ink">Approved in four hours</h3>
          <p className="m-0 text-body text-ink-2">Change a control to play it again.</p>
        </div>
      </Reveal>
    ),
    code: (v) => jsx("Reveal", { effect: str(v.effect) === "up" ? undefined : str(v.effect), duration: num(v.duration) === 600 ? undefined : num(v.duration), delay: num(v.delay) || undefined, distance: num(v.distance) === 16 ? undefined : num(v.distance) }, "<Card>…</Card>"),
  },
  {
    name: "Stagger",
    controls: { effect: { type: "select", options: revealEffects, default: "up" }, gap: { type: "number", default: 80, min: 20, max: 200, step: 20 } },
    preview: (v) => (
      <Stagger key={JSON.stringify(v)} when="load" effect={str(v.effect) as RevealEffect} gap={num(v.gap)} className="grid w-full max-w-[760px] grid-cols-2 gap-4 sm:grid-cols-4">
        {["Requests", "Approvals", "Orders", "Budgets", "Suppliers", "Sites", "Reports", "Audit"].map((n) => (
          <div key={n} className="rounded-lg border border-line bg-surface p-4 text-label font-medium text-ink shadow-1">{n}</div>
        ))}
      </Stagger>
    ),
    code: (v) => jsx("Stagger", { effect: str(v.effect) === "up" ? undefined : str(v.effect), gap: num(v.gap) === 80 ? undefined : num(v.gap), className: "grid grid-cols-4 gap-4" }, "{cards}"),
  },
];



