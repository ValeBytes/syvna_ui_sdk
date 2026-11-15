"use client";

import { useState } from "react";
import Link from "next/link";
import { CallToAction, Faq, Hero, Reveal, Section, SiteFooter, SiteHeader, Tabs, siteAction } from "@syvna/ui";

import { base } from "./catalogue";

// A place: a landing page for somewhere people go (a restaurant, a clinic, a
// studio with a door). The first screen is the place itself, in one photograph
// no taller than it is wide. Its one section nobody else has is what it offers
// this week, with prices, read like the real menu. Then the room, the hours and
// the address, and one way to book.

const page = `${base}/venue`;
const photo = (id: string, w = 1400, h = 1050) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

const Brand = () => <span className="font-display text-[1.375rem] font-medium tracking-[-0.01em]">Saltbush</span>;

const menu: Record<string, { name: string; note: string; price: string; mark?: string }[]> = {
  start: [
    { name: "Sourdough, cultured butter", note: "Rottnest sea salt", price: "$9" },
    { name: "Warrigal greens fritters", note: "Lemon myrtle, smoked aioli", price: "$14", mark: "V" },
    { name: "Shark Bay scallop", note: "Finger lime, brown butter", price: "$8 each" },
  ],
  mains: [
    { name: "Dhufish, mussels and fennel", note: "Line caught off Rottnest", price: "$46" },
    { name: "Lamb shoulder for two", note: "White beans, salsa verde", price: "$92" },
    { name: "Roast pumpkin, saltbush, ricotta", note: "From the Margaret River grower", price: "$34", mark: "V" },
  ],
  desserts: [
    { name: "Quandong tart", note: "Crème fraîche", price: "$17" },
    { name: "Burnt honey ice cream", note: "Macadamia crumb", price: "$14" },
  ],
};

const hours = [
  ["Wednesday to Saturday", "Dinner 5:30 to 10 pm"],
  ["Friday to Sunday", "Lunch 12 to 3 pm"],
  ["Monday, Tuesday", "Closed"],
];

/**
 * A place: one honest photograph, what's on this week with its prices, the
 * room, the hours and the address, and one way to book.
 */
export function Venue() {
  const [course, setCourse] = useState("start");
  return (
    <>
      <SiteHeader
        sticky
        variant="classic"
        as={Link}
        brand={<Brand />}
        brandHref={page}
        links={[
          { label: "This week", href: "#menu" },
          { label: "The room", href: "#room" },
          { label: "Visit", href: "#visit" },
        ]}
        actions={
          <Link className={siteAction("primary")} href="#book">
            Book a table
          </Link>
        }
      />
      <Reveal when="load" effect="up">
        <Hero
          variant="split"
          eyebrow="South Terrace, Fremantle"
          title="Cooking what the coast and the growers bring in this week"
          description="A dining room of forty seats. The menu is written on Tuesday from what came in; the private room seats twelve."
          actions={
            <>
              <Link className={siteAction("primary", "lg")} href="#book">
                Book a table
              </Link>
              <Link className={siteAction("ghost", "lg")} href="#menu">
                This week's menu
              </Link>
            </>
          }
          note="Dinner Wednesday to Saturday, lunch Friday to Sunday."
          media={<img src={photo("1414235077428-338989a2e8c0")} alt="A plated dish on the pass" className="aspect-[4/3] max-h-[70vh] w-full rounded-xl object-cover" />}
        />
      </Reveal>
      <Section id="menu" tone="surface" animate eyebrow="Week of 16 November" title="This week's menu" description="It changes as the season does, so a dish you loved may have moved on.">
        <div className="grid gap-10 @3xl:grid-cols-[1.6fr_1fr]">
          <div className="flex flex-col gap-4">
            <Tabs
              aria-label="Courses"
              value={course}
              onValueChange={setCourse}
              items={[
                { value: "start", label: "To start" },
                { value: "mains", label: "Mains" },
                { value: "desserts", label: "Desserts" },
              ]}
            />
            <ul className="m-0 list-none divide-y divide-line p-0">
              {menu[course]!.map((d) => (
                <li key={d.name} className="flex items-baseline gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-subtitle text-ink">
                      {d.name} {d.mark ? <span className="text-caption text-ink-3">{d.mark}</span> : null}
                    </div>
                    <div className="text-label text-ink-3">{d.note}</div>
                  </div>
                  <span className="font-display text-subtitle tabular-nums text-ink">{d.price}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="flex flex-col gap-3 self-start rounded-xl border border-line bg-ground p-6">
            <div className="font-display text-title text-ink">The tasting menu</div>
            <p className="m-0 text-body text-ink-2">Six courses from this week's menu, for the whole table.</p>
            <dl className="m-0 grid grid-cols-[1fr_auto] gap-y-2 text-label">
              <dt className="text-ink-3">Six courses</dt>
              <dd className="m-0 text-ink">$125 a person</dd>
              <dt className="text-ink-3">Matched wines</dt>
              <dd className="m-0 text-ink">$85</dd>
              <dt className="text-ink-3">Without alcohol</dt>
              <dd className="m-0 text-ink">$55</dd>
            </dl>
            <Link className={siteAction("secondary")} href="#book">
              Book the tasting menu
            </Link>
          </aside>
        </div>
      </Section>
      <Section id="room" animate eyebrow="Private dining" title="A room of its own for twelve">
        <div className="grid items-center gap-10 @3xl:grid-cols-2">
          <img src={photo("1763376385238-ba0211a17505", 1200, 900)} alt="Small plates shared on the long table" className="aspect-[4/3] w-full rounded-xl object-cover" />
          <div className="flex flex-col gap-4">
            <p className="m-0 text-body-lg text-ink-2">The back room has one long table, its own door to the lane, and the kitchen's shared menu, set with you a week before.</p>
            <dl className="m-0 grid grid-cols-2 gap-4 border-t border-line pt-4">
              {[
                ["Seats", "8 to 12"],
                ["From", "$95 a person"],
                ["Lunch or dinner", "Any day but Monday"],
                ["Book", "Two weeks ahead"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-caption text-ink-3">{k}</dt>
                  <dd className="m-0 text-body text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>
      <Section id="visit" tone="surface" animate eyebrow="Visit" title="Find us on South Terrace">
        <div className="grid gap-10 @3xl:grid-cols-2">
          <dl className="m-0 divide-y divide-line">
            {hours.map(([days, when]) => (
              <div key={days} className="flex justify-between gap-4 py-3">
                <dt className="text-body text-ink">{days}</dt>
                <dd className="m-0 text-body text-ink-2">{when}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-2 text-body text-ink-2">
            <span className="text-ink">48 South Terrace, Fremantle WA 6160</span>
            <span>Five minutes' walk from Fremantle station; parking on Parry Street.</span>
            <span>(08) 9335 2140 · hello@saltbush.example</span>
          </div>
        </div>
      </Section>
      <Section id="questions" animate title="Before you come">
        <Faq
          className="max-w-[760px]"
          items={[
            { question: "Can you cook for allergies?", answer: "Yes, for most. Tell us when you book and the kitchen will plan your courses." },
            { question: "Do you take walk-ins?", answer: "Four seats at the bar are kept for them every night." },
          ]}
        />
      </Section>
      <Section id="book">
        <CallToAction
          title="Book a table"
          description="Tables open four weeks ahead, on the first of the month."
          actions={
            <Link className={siteAction("primary", "lg")} href="#book">
              Book a table
            </Link>
          }
        />
      </Section>
      <SiteFooter as={Link} brand={<Brand />} tagline="48 South Terrace, Fremantle" columns={[{ title: "Visit", links: [{ label: "This week", href: "#menu" }, { label: "Private dining", href: "#room" }, { label: "Hours", href: "#visit" }] }]} legal="© 2026 Saltbush" />
    </>
  );
}
