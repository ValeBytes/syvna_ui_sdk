"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle, Clock } from "lucide-react";
import { Badge, CallToAction, Faq, FeatureRows, Hero, Reveal, Section, SiteFooter, SiteHeader, siteAction } from "@syvna/ui";

import { base } from "./catalogue";

// A product tour: a landing page for software that does one job end to end.
// The hero shows the product at the moment of a decision (a request open
// beside the list, its budget and who still has to sign), then each row walks
// one step of the work in the product's own screens. Its one section no other
// product has: who signs what, by value. No Bento, no stock photos.

const page = `${base}/tour`;

const Brand = () => (
  <>
    <span className="grid size-7 place-items-center rounded-md bg-brand font-display text-caption font-bold text-brand-ink">R</span>
    Requisite
  </>
);

const requests = [
  { id: "PR-2481", what: "Ready-mix concrete C32/40", who: "Harlow Concrete", amount: "£6,348", state: "Your approval", tone: "warning" },
  { id: "PR-2480", what: "Scaffold hire, east elevation", who: "Apex Access", amount: "£4,920", state: "Approved", tone: "success" },
  { id: "PR-2478", what: "Rebar B500B 12 mm", who: "Midland Steel", amount: "£2,976", state: "With QS", tone: "info" },
  { id: "PR-2476", what: "Plasterboard 12.5 mm", who: "Brookfield Merchants", amount: "£1,870", state: "Ordered", tone: "neutral" },
  { id: "PR-2474", what: "3 t dumper hire", who: "Kestrel Plant", amount: "£1,240", state: "Over budget", tone: "danger" },
] as const;

// The product at the moment of a decision: the list, one request open beside
// it, what it does to the budget, who has signed, and the one action.
function DecisionShot() {
  return (
    <div className="@container grid w-full overflow-hidden rounded-xl border border-line bg-surface text-left shadow-3 @2xl:grid-cols-[1.1fr_1fr]">
      <div className="border-line @2xl:border-r">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-caption text-ink-3">
          <span className="font-medium text-ink">Requests · Riverside Medical Centre</span>
          <Badge tone="warning">1 waiting on you</Badge>
        </div>
        {requests.map((r, i) => (
          <div key={r.id} className={i === 0 ? "flex items-center gap-3 border-b border-line border-l-2 border-l-brand bg-brand-soft/40 px-4 py-2.5" : "flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"}>
            <div className="min-w-0 flex-1">
              <div className="truncate text-label text-ink">{r.what}</div>
              <div className="text-caption text-ink-3">
                {r.id} · {r.who}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-label tabular-nums text-ink">{r.amount}</span>
              <Badge tone={r.tone}>{r.state}</Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden flex-col gap-4 p-4 @2xl:flex">
        <div>
          <div className="text-caption text-ink-3">PR-2481 · raised by Dan Okoro, site manager</div>
          <div className="text-subtitle font-medium text-ink">Ready-mix concrete C32/40, 40 m³</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-caption">
            <span className="text-ink-3">Concrete frame budget</span>
            <span className="tabular-nums text-ink">£41,200 of £58,000</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[71%] rounded-full bg-brand" />
          </div>
          <div className="text-caption text-ink-3">This leaves £10,452 on the cost code.</div>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-label">
          <li className="flex items-center gap-2 text-ink-2">
            <Check size={14} className="text-success" /> Dan Okoro, site manager <span className="ml-auto text-caption text-ink-3">08:12</span>
          </li>
          <li className="flex items-center gap-2 text-ink">
            <Clock size={14} className="text-warning" /> You, project manager <span className="ml-auto text-caption text-ink-3">waiting</span>
          </li>
          <li className="flex items-center gap-2 text-ink-3">
            <Circle size={14} /> Commercial director, over £10,000 <span className="ml-auto text-caption">not needed</span>
          </li>
        </ul>
        <div className="mt-auto flex gap-2">
          <span className={siteAction("primary")}>Approve £6,348</span>
          <span className={siteAction("secondary")}>Send back</span>
        </div>
      </div>
    </div>
  );
}

function RaiseShot() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-line bg-surface text-left shadow-2">
      <div className="flex justify-between border-b border-line px-4 py-2.5 text-caption">
        <span className="font-medium text-ink">New request</span>
        <span className="text-ink-3">Canal Street Apartments</span>
      </div>
      {[
        ["Timber 47×150 C24, 4.8 m", "60"],
        ["Ply sheets 18 mm, shuttering", "35"],
        ["Release agent, 25 L", "2"],
      ].map(([item, qty]) => (
        <div key={item} className="flex items-center justify-between border-b border-line px-4 py-2.5 text-label text-ink">
          {item}
          <span className="rounded-md border border-line px-2 py-0.5 tabular-nums text-ink-2">{qty}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-3 text-caption text-ink-3">
        Needed on site Mon 23 Nov, 08:00
        <span className={siteAction("primary")}>Send for approval</span>
      </div>
    </div>
  );
}

function MatchShot() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-line bg-surface p-4 text-left shadow-2">
      {[
        ["Purchase order PO-1187", "£6,348.00"],
        ["Delivery note, Gate A", "40 m³"],
        ["Invoice HC-20931", "£6,348.00"],
      ].map(([what, value]) => (
        <div key={what} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-label text-ink">
          {what}
          <span className="tabular-nums text-ink-2">{value}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 text-label text-success">
        <Check size={14} /> Matched: ready to pay on the 28th
      </div>
    </div>
  );
}

const limits = [
  ["Under £2,500", "Site manager", "Same day"],
  ["£2,500 to £10,000", "Project manager", "Within 4 hours"],
  ["Over £10,000", "Commercial director", "Within a day"],
  ["Over budget on its cost code", "Quantity surveyor first", "Before anyone else"],
];

/**
 * A product tour for software that does one job end to end: the hero shows the
 * product at a decision, rows walk each step in the product's own screens, and
 * the one section only this product has (who signs what) sits in the middle.
 */
export function Tour() {
  return (
    <>
      <SiteHeader
        sticky
        variant="track"
        as={Link}
        brand={<Brand />}
        brandHref={page}
        links={[
          { label: "How it works", href: "#how" },
          { label: "Approval limits", href: "#limits" },
          { label: "Questions", href: "#questions" },
        ]}
        actions={
          <Link className={siteAction("primary")} href="#start">
            Start free trial
          </Link>
        }
      />
      <Reveal when="load" effect="up">
        <Hero
          variant="center"
          title="Every site purchase approved by the right person, before it's ordered"
          description="Requisite takes the request from the slab, checks it against the cost code, gets it signed by whoever the amount needs, and sends the order."
          actions={
            <>
              <Link className={siteAction("primary", "lg")} href="#start">
                Start free trial
              </Link>
              <Link className={siteAction("secondary", "lg")} href="#how">
                See a request go through
              </Link>
            </>
          }
          note="Free for 30 days on one project."
          media={<DecisionShot />}
        />
      </Reveal>
      <Section id="how" animate eyebrow="How it works" title="One request, from the slab to the invoice">
        <FeatureRows
          animate
          rows={[
            { eyebrow: "1 · Raise", title: "Asked for in a minute, from a phone", description: "The site manager picks the items, the quantity and the day they're needed. The cost code comes from the project.", media: <RaiseShot /> },
            { eyebrow: "2 · Approve", title: "Signed by whoever the amount needs", description: "It goes to the right person with the budget beside it, and to the next one only if the value says so.", media: <DecisionShot /> },
            { eyebrow: "3 · Receive and pay", title: "Paid only when order, delivery and invoice agree", description: "The gate books the delivery in; the invoice is matched against both before it's paid.", media: <MatchShot /> },
          ]}
        />
      </Section>
      <Section id="limits" tone="surface" animate eyebrow="Approval limits" title="Who signs what, set once per project" description="The rules your commercial team already has, written down where every request reads them.">
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          {limits.map(([value, who, when], i) => (
            <div key={value} className="grid grid-cols-1 gap-1 border-b border-line px-5 py-4 last:border-b-0 @2xl:grid-cols-[1.2fr_1fr_auto] @2xl:items-center">
              <span className="font-display text-title text-ink">{value}</span>
              <span className="text-body text-ink-2">{who}</span>
              <span className="text-label text-ink-3">{i === 3 ? when : `Answered ${when.toLowerCase()}`}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section id="questions" animate eyebrow="Questions" title="What site teams ask first">
        <Faq
          className="max-w-[760px]"
          items={[
            { question: "Do our suppliers have to sign up?", answer: "No. Orders go to them by email as a PDF, the way they get them now." },
            { question: "Can a request skip a step in an emergency?", answer: "Yes. The project manager can approve on behalf of anyone below them, and the skip is written on the request." },
            { question: "Does it work without signal on site?", answer: "Requests are kept on the phone and sent when it's back online." },
          ]}
        />
      </Section>
      <Section id="start">
        <CallToAction
          title="Put your next project's purchases through it"
          description="30 days free on one project. Bring your cost codes from a spreadsheet."
          actions={
            <Link className={siteAction("primary", "lg")} href="#start">
              Start free trial <ArrowRight size={16} />
            </Link>
          }
        />
      </Section>
      <SiteFooter
        as={Link}
        brand={<Brand />}
        tagline="Purchasing for construction sites."
        columns={[
          { title: "Product", links: [{ label: "How it works", href: "#how" }, { label: "Approval limits", href: "#limits" }] },
          { title: "Company", links: [{ label: "Contact", href: "#start" }] },
        ]}
        legal="© 2026 Requisite Ltd."
      />
    </>
  );
}
