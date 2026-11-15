"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero, Reveal, Section, SiteFooter, SiteHeader, siteAction } from "@syvna/ui";

import { base } from "./catalogue";

// Editorial: a landing page for a practice whose work is the proof (architects,
// designers, a consultancy, a publication). Words lead and there are few cards:
// a statement, one large photograph of the work, an index of projects (the one
// section no other kind of business has), how they work in plain paragraphs,
// and how to get in touch, in lines rather than a form.

const page = `${base}/studio`;
const photo = (id: string, w = 1600, h = 1000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

const Brand = () => <span className="font-display text-subtitle font-semibold tracking-[-0.02em]">Okon Arkitekter</span>;

const projects = [
  { no: "01", name: "Grünerløkka school", place: "Oslo", year: "2025", kind: "School, 640 pupils" },
  { no: "02", name: "Bjølsen library", place: "Oslo", year: "2024", kind: "Public library" },
  { no: "03", name: "Fjellhus", place: "Hemsedal", year: "2023", kind: "House" },
  { no: "04", name: "Kulturhuset Lillestrøm", place: "Lillestrøm", year: "2022", kind: "Arts centre" },
  { no: "05", name: "Tøyen health centre", place: "Oslo", year: "2021", kind: "Clinic" },
];

const approach = [
  { no: "01", title: "We start with the people in it", body: "Before drawing, we spend a week with the teachers, librarians or doctors who will use the building, and write down how a day goes." },
  { no: "02", title: "Timber where it can be", body: "Every project since 2019 has a timber structure, from the frame to the stair, and its carbon counted before it's built." },
  { no: "03", title: "We stay after it opens", body: "A year after handover we come back for a day, and fix what the people using it found." },
];

/**
 * Editorial: a statement, the work in one photograph, an index of projects,
 * the approach in numbered paragraphs, and contact in plain lines.
 */
export function Studio() {
  return (
    <>
      <SiteHeader
        sticky
        variant="editorial"
        as={Link}
        brand={<Brand />}
        brandHref={page}
        links={[
          { label: "Work", href: "#work" },
          { label: "Approach", href: "#approach" },
          { label: "Contact", href: "#contact" },
        ]}
        actions={
          <Link className={siteAction("secondary")} href="#contact">
            Start a project
          </Link>
        }
      />
      <Reveal when="load" effect="up">
        <Hero
          variant="editorial"
          eyebrow="Architects · Oslo, since 2009"
          title="Schools, libraries and houses, built in timber for the people who use them"
          description="Okon Arkitekter is a practice of fourteen. Most of our work is public: places to learn, read and be looked after."
          media={<img src={photo("1615406020658-6c4b805f1f30")} alt="Bjølsen library seen from the street" className="aspect-[16/9] w-full object-cover" />}
        />
      </Reveal>
      <Section id="work" animate eyebrow="Selected work" title="Five buildings, 2021 to 2025">
        <ol className="m-0 list-none border-t border-line p-0">
          {projects.map((p) => (
            <li key={p.no}>
              <a href="#work" className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-line py-5 no-underline transition-colors hover:bg-surface-2 @3xl:grid-cols-[3rem_1.4fr_1fr_1fr_5rem]">
                <span className="font-mono text-caption text-ink-4">{p.no}</span>
                <span className="font-display text-title text-ink transition-transform duration-300 group-hover:translate-x-1">{p.name}</span>
                <span className="hidden text-body text-ink-2 @3xl:block">{p.kind}</span>
                <span className="hidden text-body text-ink-3 @3xl:block">{p.place}</span>
                <span className="flex items-center justify-end gap-1 text-label tabular-nums text-ink-3">
                  {p.year} <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </Section>
      <Section id="approach" tone="surface" animate eyebrow="Approach" title="How we work">
        <div className="grid gap-10 @3xl:grid-cols-3">
          {approach.map((a) => (
            <div key={a.no} className="flex flex-col gap-3 border-t border-ink pt-4">
              <span className="font-mono text-caption text-ink-3">{a.no}</span>
              <h3 className="m-0 font-display text-title font-medium text-ink">{a.title}</h3>
              <p className="m-0 text-body text-ink-2">{a.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section animate>
        <figure className="m-0 flex flex-col gap-3">
          <img src={photo("1758448756207-54505680d130", 1600, 900)} alt="Fjellhus, a timber house in Hemsedal" className="aspect-[16/9] w-full object-cover" />
          <figcaption className="text-caption text-ink-3">Fjellhus, Hemsedal, 2023. A house of cross-laminated timber for a family of five.</figcaption>
        </figure>
      </Section>
      <Section id="contact" animate eyebrow="Contact" title="Tell us about the building">
        <div className="grid gap-8 @3xl:grid-cols-[1.4fr_1fr]">
          <p className="m-0 text-body-lg text-ink-2">We take on four or five projects a year. Write with what it is, where, and when it should open; one of the partners answers within the week.</p>
          <dl className="m-0 flex flex-col gap-3 text-body">
            {[
              ["Write", "studio@okon.example"],
              ["Call", "+47 22 41 80 15"],
              ["Visit", "Thorvald Meyers gate 32, 0555 Oslo"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[5rem_1fr] border-b border-line pb-3">
                <dt className="text-ink-3">{k}</dt>
                <dd className="m-0 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
      <SiteFooter as={Link} brand={<Brand />} tagline="Architects in Oslo since 2009." columns={[{ title: "Practice", links: [{ label: "Work", href: "#work" }, { label: "Approach", href: "#approach" }, { label: "Contact", href: "#contact" }] }]} legal="© 2026 Okon Arkitekter AS" />
    </>
  );
}
