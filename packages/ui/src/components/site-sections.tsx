"use client";

// The middle of a landing page: the sections between the hero and the call to
// action that show the product instead of listing it. Each sizes itself by
// its own width (@container) and can ease in as it's scrolled to (animate).

import { cn } from "../cx";
import { Reveal, Stagger } from "./motion";

export interface BentoItem {
  /** What this cell shows, in a few words. */
  title: React.ReactNode;
  /** A sentence under the title. */
  description?: React.ReactNode;
  /** The cell's picture: a piece of the product, a chart, a photograph, a small live component. It fills the space under the text. */
  media?: React.ReactNode;
  /** A small icon over the title, for cells without media. */
  icon?: React.ReactNode;
  /** How much room it takes on a wide screen. wide: two columns. tall: two rows. big: both. One or two cells should be larger than the rest. */
  span?: "normal" | "wide" | "tall" | "big";
  /** surface: a raised card (the default). brand: on the brand colour, for the one cell that matters most. ink: dark. soft: a brand tint. */
  tone?: "surface" | "brand" | "ink" | "soft";
  /** Classes for this cell alone. */
  className?: string;
}

export interface BentoProps {
  /** Four to six cells of different sizes, each showing a different thing the product does. */
  items: BentoItem[];
  /** Columns on a wide screen. */
  columns?: 3 | 4;
  /** Cells ease in one after another as the grid is scrolled to. */
  animate?: boolean;
  className?: string;
  /** Classes for its parts: grid, cell (every cell), title, description, media. */
  classNames?: { grid?: string; cell?: string; title?: string; description?: string; media?: string };
}

const bentoSpan = { normal: "", wide: "@3xl:col-span-2", tall: "@3xl:row-span-2", big: "@3xl:col-span-2 @3xl:row-span-2" };
const bentoTone = {
  surface: "border border-line bg-surface text-ink",
  brand: "bg-brand text-brand-ink",
  ink: "bg-ink text-ground",
  soft: "bg-brand-soft text-ink",
};

/** What the product does as a grid of unequal cells, each with its own picture: richer than a row of icons. */
export function Bento({ items, columns = 3, animate, className, classNames }: BentoProps) {
  const cells = items.map((it, i) => {
    const tone = it.tone ?? "surface";
    const quiet = tone === "brand" ? "text-brand-ink/80" : tone === "ink" ? "text-ground/70" : "text-ink-2";
    return (
      <article key={i} className={cn("flex h-full min-h-[220px] flex-col overflow-hidden rounded-xl", bentoTone[tone], classNames?.cell, it.className)}>
        {/* Without a picture, the icon sits at the top and the words at the foot, so a cell taller than its words reads as designed, not empty. */}
        <div className={cn("flex flex-col gap-2 p-6", !it.media && "h-full justify-between gap-8")}>
          {it.icon ? <span className={cn("mb-1 grid size-9 place-items-center rounded-md [&>svg]:size-[18px]", tone === "surface" ? "bg-brand-soft text-brand" : "bg-current/10")}>{it.icon}</span> : null}
          <div className="flex flex-col gap-2">
            <h3 className={cn("m-0 font-display text-title font-semibold tracking-[-0.01em] text-balance", classNames?.title)}>{it.title}</h3>
            {it.description ? <p className={cn("m-0 text-body text-pretty", quiet, classNames?.description)}>{it.description}</p> : null}
          </div>
        </div>
        {it.media ? <div className={cn("mt-auto flex min-h-0 flex-1 items-end overflow-hidden px-6", classNames?.media)}>{it.media}</div> : null}
      </article>
    );
  });
  const grid = cn("grid auto-rows-fr gap-4", columns === 4 ? "@3xl:grid-cols-4" : "@3xl:grid-cols-3", classNames?.grid);
  const item = (i: number) => cn("h-full", bentoSpan[items[i]?.span ?? "normal"]);
  return (
    <div className={cn("@container w-full", className)}>
      {animate ? (
        <div className={grid}>
          {cells.map((c, i) => (
            <Reveal key={i} delay={i * 70} effect="up" className={item(i)}>
              {c}
            </Reveal>
          ))}
        </div>
      ) : (
        <div className={grid}>
          {cells.map((c, i) => (
            <div key={i} className={item(i)}>
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface FeatureRow {
  /** A word or two over the title: the part of the product ("Approvals"). */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** Two or three sentences: what it does for the person. */
  description?: React.ReactNode;
  /** Short reasons with a tick each. */
  points?: React.ReactNode[];
  /** A link or button under the text: "See how approvals work". */
  action?: React.ReactNode;
  /** The picture beside the text: a real screen of the product, large. */
  media: React.ReactNode;
}

export interface FeatureRowsProps {
  /** Two to four rows; the picture swaps sides from one to the next. */
  rows: FeatureRow[];
  /** Which side the first row's picture is on. */
  start?: "media-right" | "media-left";
  /** Text and picture ease in from their own sides as each row is scrolled to. */
  animate?: boolean;
  className?: string;
  /** Classes for its parts: row, text (the words' column), title, description, media (the picture's frame). */
  classNames?: { row?: string; text?: string; title?: string; description?: string; media?: string };
}

/** The product shown a part at a time: words on one side, a large real screen on the other, swapping sides down the page. */
export function FeatureRows({ rows, start = "media-right", animate, className, classNames }: FeatureRowsProps) {
  return (
    <div className={cn("@container flex w-full flex-col gap-16 @3xl:gap-24", className)}>
      {rows.map((r, i) => {
        const mediaLeft = (i % 2 === 0) === (start === "media-left");
        const text = (
          <div className={cn("flex max-w-[520px] flex-col gap-4", classNames?.text)}>
            {r.eyebrow ? <span className="text-label font-semibold text-brand">{r.eyebrow}</span> : null}
            <h3 className={cn("m-0 font-display text-heading font-semibold tracking-[-0.02em] text-balance text-ink", classNames?.title)}>{r.title}</h3>
            {r.description ? <p className={cn("m-0 text-body-lg text-ink-2 text-pretty", classNames?.description)}>{r.description}</p> : null}
            {r.points?.length ? (
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {r.points.map((p, j) => (
                  <li key={j} className="flex gap-2.5 text-body text-ink-2">
                    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-[3px] size-4 shrink-0 text-brand">
                      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {r.action ? <div className="mt-1">{r.action}</div> : null}
          </div>
        );
        const media = <div className={cn("overflow-hidden rounded-xl border border-line bg-surface shadow-2", classNames?.media)}>{r.media}</div>;
        return (
          <div key={i} className={cn("grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-14", classNames?.row)}>
            <div className={cn(mediaLeft && "@3xl:order-2")}>{animate ? <Reveal effect={mediaLeft ? "left" : "right"}>{text}</Reveal> : text}</div>
            <div className={cn(mediaLeft && "@3xl:order-1")}>{animate ? <Reveal effect={mediaLeft ? "right" : "left"} delay={100}>{media}</Reveal> : media}</div>
          </div>
        );
      })}
    </div>
  );
}

export interface Stat {
  /** The number, formatted: "1,240", "4 h", "99.9%". Real, never made up. */
  value: React.ReactNode;
  /** What it counts: "requests a month". */
  label: React.ReactNode;
  /** A few words of context: "across 14 sites". */
  note?: React.ReactNode;
}

export interface StatsProps {
  /** Three or four real numbers. */
  stats: Stat[];
  /** plain: on the ground, divided by lines. cards: each in a card. band: on the brand colour, the page's loud moment. */
  variant?: "plain" | "cards" | "band";
  /** The numbers ease in one after another. */
  animate?: boolean;
  className?: string;
  /** Classes for its parts: item, value, label. */
  classNames?: { item?: string; value?: string; label?: string };
}

/** A few numbers the product can stand behind, set large. */
export function Stats({ stats, variant = "plain", animate, className, classNames }: StatsProps) {
  const band = variant === "band";
  const items = stats.map((s, i) => (
    <div
      key={i}
      className={cn(
        "flex h-full flex-col gap-1",
        variant === "cards" && "rounded-xl border border-line bg-surface p-6 shadow-1",
        variant === "plain" && "border-l border-line pl-6",
        classNames?.item,
      )}
    >
      <dd className={cn("m-0 font-display text-display font-semibold tracking-[-0.03em] tabular-nums", band ? "text-brand-ink" : "text-ink-heading", classNames?.value)}>{s.value}</dd>
      <dt className={cn("text-body font-medium", band ? "text-brand-ink/85" : "text-ink-2", classNames?.label)}>{s.label}</dt>
      {s.note ? <span className={cn("text-small", band ? "text-brand-ink/70" : "text-ink-3")}>{s.note}</span> : null}
    </div>
  ));
  const grid = cn("m-0 grid gap-6 @xl:grid-cols-2", stats.length >= 4 ? "@4xl:grid-cols-4" : "@4xl:grid-cols-3");
  return (
    <div className={cn("@container w-full", band && "rounded-xl bg-brand p-8 @3xl:p-12", className)}>
      {animate ? (
        <Stagger as="dl" className={grid} itemClassName="h-full">
          {items}
        </Stagger>
      ) : (
        <dl className={grid}>{items}</dl>
      )}
    </div>
  );
}

export interface Step {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A small picture of this step: the screen where it happens. */
  media?: React.ReactNode;
}

export interface StepsProps {
  /** Three or four steps, in the order they happen. Only for a real sequence. */
  steps: Step[];
  /** row: side by side, joined by a line. list: down the page, each with its picture beside it. */
  variant?: "row" | "list";
  /** The steps ease in one after another. */
  animate?: boolean;
  className?: string;
  /** Classes for its parts: step, number (the numbered circle), title, description, media. */
  classNames?: { step?: string; number?: string; title?: string; description?: string; media?: string };
}

/** How it works, as numbered steps in order: sign up, bring your data, get to work. */
export function Steps({ steps, variant = "row", animate, className, classNames }: StepsProps) {
  const row = variant === "row";
  const items = steps.map((s, i) => (
    <div key={i} className={cn("relative flex h-full gap-4", row ? "flex-col" : "flex-col @3xl:flex-row @3xl:items-center @3xl:gap-10", classNames?.step)}>
      <div className={cn("flex gap-4", row ? "flex-col" : "flex-1")}>
        <div className="flex items-center gap-3">
          <span className={cn("grid size-9 flex-none place-items-center rounded-full bg-brand font-display text-label font-semibold tabular-nums text-brand-ink", classNames?.number)}>{i + 1}</span>
          {row && i < steps.length - 1 ? <span aria-hidden="true" className="hidden h-px flex-1 bg-line-strong @3xl:block" /> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className={cn("m-0 font-display text-subtitle font-semibold text-ink", classNames?.title)}>{s.title}</h3>
          {s.description ? <p className={cn("m-0 text-body text-ink-2 text-pretty", classNames?.description)}>{s.description}</p> : null}
        </div>
      </div>
      {s.media ? <div className={cn("overflow-hidden rounded-lg border border-line bg-surface shadow-1", row ? "mt-2" : "flex-1", classNames?.media)}>{s.media}</div> : null}
    </div>
  ));
  const grid = row ? cn("grid gap-8", steps.length >= 4 ? "@3xl:grid-cols-4" : "@3xl:grid-cols-3") : "flex flex-col gap-10";
  return (
    <div className={cn("@container w-full", className)}>
      {animate ? (
        <Stagger className={grid} itemClassName="h-full" gap={110}>
          {items}
        </Stagger>
      ) : (
        <div className={grid}>{items}</div>
      )}
    </div>
  );
}
