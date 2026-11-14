"use client";

// PricingTable: plans and prices, in 21 looks. Every variant takes the same
// plans; a few use one more prop (intro, unit, comparison) and say so.

import { useId, useState } from "react";

import { cn, focusRing } from "../cx";
import { CheckGlyph, CloseGlyph } from "./icons";
import { SegmentedControl } from "./selection";
import { siteAction } from "./site";

export const pricingVariants = [
  "cards",
  "compact",
  "minimal",
  "joined",
  "outline",
  "dark-featured",
  "brand-featured",
  "gradient-featured",
  "tinted",
  "price-first",
  "badges",
  "icons",
  "excluded",
  "rows",
  "table",
  "single",
  "split",
  "radio",
  "calculator",
  "tabs",
  "carousel",
] as const;

export type PricingVariant = (typeof pricingVariants)[number];

export interface PricingPlan {
  name: string;
  /** Price a month, billed monthly; a string for "Custom". */
  monthly: number | string;
  /** Price a month, billed yearly. Leave off when there's no yearly price. */
  yearly?: number | string;
  /** Who it's for, in one line. */
  description?: React.ReactNode;
  /** What's in it, shortest first. */
  features: React.ReactNode[];
  /** For excluded: what isn't in it, shown crossed out under the features. */
  excluded?: React.ReactNode[];
  /** For icons: an icon for the plan. */
  icon?: React.ReactNode;
  /** The button's words: "Start free", "Talk to us". */
  cta: React.ReactNode;
  /** Where the button goes. */
  href?: string;
  /** The plan most people should pick: raised and marked. */
  featured?: boolean;
}

export interface PricingTableProps {
  plans: PricingPlan[];
  /**
   * cards: a card each, the featured one raised. compact: smaller cards, no descriptions. minimal: no
   * boxes, fine rules between. joined: one box split in columns. outline: flat, the featured one
   * outlined thick. dark-featured / brand-featured / gradient-featured: the featured plan on ink, on
   * brand, or with a gradient edge. tinted: each plan its own soft colour. price-first: the price leads.
   * badges: names as pills. icons: an icon per plan (plan.icon). excluded: what's left out, crossed
   * (plan.excluded). rows: one plan per row. table: a comparison table (comparison). single: one plan,
   * wide. split: a heading beside the plans (intro). radio: pick a plan, then one button. calculator:
   * a slider for how many (unit) times the price. tabs: one plan at a time, picked by name. carousel:
   * plans scroll sideways, snapping.
   */
  variant?: PricingVariant;
  /** The currency sign before numeric prices. */
  currency?: string;
  /** Shows a monthly/yearly switch when any plan has a yearly price. */
  billing?: "monthly" | "yearly";
  /** What the yearly switch says it saves: "Save 20%". */
  yearlyNote?: React.ReactNode;
  /** For split: the heading and words beside the plans. */
  intro?: React.ReactNode;
  /** For calculator: what's counted and its range: { name: "seat", min: 1, max: 50, default: 5 }. */
  unit?: { name: string; min?: number; max?: number; default?: number };
  /** For table: rows of the comparison, a value per plan (true, false, or words). Built from the features when left off. */
  comparison?: { label: React.ReactNode; values: (boolean | React.ReactNode)[] }[];
  /** Called with the plan's name when its button is clicked. */
  onSelect?: (plan: string) => void;
  className?: string;
}

const tints = ["bg-info-soft", "bg-brand-soft", "bg-success-soft", "bg-warning-soft"];

/** Two to four plans, the recommended one marked, with a monthly/yearly switch; 21 looks. */
export function PricingTable({
  plans,
  variant = "cards",
  currency = "$",
  billing: initial = "monthly",
  yearlyNote,
  intro,
  unit,
  comparison,
  onSelect,
  className,
}: PricingTableProps) {
  const v = variant;
  const [billing, setBilling] = useState(initial);
  const [chosen, setChosen] = useState(plans.find((p) => p.featured)?.name ?? plans[0]?.name ?? "");
  const [count, setCount] = useState(unit?.default ?? unit?.min ?? 1);
  const radioName = useId();
  const hasYearly = plans.some((p) => p.yearly !== undefined);

  const priceOf = (p: PricingPlan) => (billing === "yearly" && p.yearly !== undefined ? p.yearly : p.monthly);
  const money = (n: number) => `${currency}${Number.isInteger(n) ? n : n.toFixed(2)}`;

  const Price = ({ p, size = "lg", tone = "text-ink" }: { p: PricingPlan; size?: "md" | "lg" | "xl"; tone?: string }) => {
    const price = priceOf(p);
    const n = typeof price === "number";
    return (
      <p className="m-0 flex flex-wrap items-baseline gap-x-1">
        <span className={cn("font-display font-semibold tracking-[-0.03em] tabular-nums", size === "xl" ? "text-display-xl" : size === "lg" ? "text-display" : "text-heading", tone)}>
          {n ? money(v === "calculator" ? (price as number) * count : (price as number)) : price}
        </span>
        {n ? <span className={cn("text-body opacity-70", tone)}>{v === "calculator" ? `/ month for ${count} ${unit?.name ?? "seat"}${count === 1 ? "" : "s"}` : "/ month"}</span> : null}
      </p>
    );
  };

  const Cta = ({ p, kind, className: c }: { p: PricingPlan; kind?: "primary" | "secondary" | "ghost"; className?: string }) => {
    const Tag = p.href ? "a" : "button";
    return (
      <Tag {...(p.href ? { href: p.href } : { type: "button" as const })} onClick={() => onSelect?.(p.name)} className={cn(siteAction(kind ?? (p.featured ? "primary" : "secondary")), "w-full", c)}>
        {p.cta}
      </Tag>
    );
  };

  const Features = ({ p, tone = "text-ink-2", check = "text-success", cols }: { p: PricingPlan; tone?: string; check?: string; cols?: boolean }) => (
    <ul className={cn("m-0 grid list-none gap-2.5 p-0", cols && "@2xl:grid-cols-2 @2xl:gap-x-8")}>
      {p.features.map((f, i) => (
        <li key={i} className={cn("flex items-start gap-2.5 text-body", tone)}>
          <CheckGlyph size={16} className={cn("mt-px flex-none", check)} />
          {f}
        </li>
      ))}
      {v === "excluded"
        ? p.excluded?.map((f, i) => (
            <li key={`x${i}`} className="flex items-start gap-2.5 text-body text-ink-4 line-through decoration-ink-4/50">
              <CloseGlyph size={16} className="mt-px flex-none" />
              {f}
            </li>
          ))
        : null}
    </ul>
  );

  const Popular = ({ className: c }: { className?: string }) => <span className={cn("rounded-full bg-brand px-2.5 py-0.5 text-caption font-semibold text-brand-ink", c)}>Most popular</span>;

  const Switch = hasYearly ? (
    <div className="flex items-center justify-center gap-3">
      <SegmentedControl
        label="Billing"
        value={billing}
        onValueChange={(x) => setBilling(x as "monthly" | "yearly")}
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
      />
      {yearlyNote ? <span className="text-label font-medium text-success">{yearlyNote}</span> : null}
    </div>
  ) : null;

  const cols = plans.length >= 4 ? "@3xl:grid-cols-2 @5xl:grid-cols-4" : plans.length === 3 ? "@3xl:grid-cols-3" : "@2xl:grid-cols-2";

  /** One plan as a card, styled by variant. */
  const card = (p: PricingPlan, i: number) => {
    const dark = v === "dark-featured" && p.featured;
    const brand = v === "brand-featured" && p.featured;
    const loud = dark || brand;
    const text = dark ? "text-ground" : brand ? "text-brand-ink" : "text-ink";
    const sub = dark ? "text-ground/70" : brand ? "text-brand-ink/75" : "text-ink-3";
    const body = (
      <>
        {v === "icons" && p.icon ? <span className="grid size-10 place-items-center rounded-lg bg-brand-soft text-brand [&>svg]:size-5">{p.icon}</span> : null}
        {v === "price-first" ? (
          <>
            <Price p={p} size="xl" tone={text} />
            <div className="flex flex-col gap-1">
              <h3 className={cn("m-0 text-subtitle font-semibold", text)}>{p.name}</h3>
              {p.description ? <p className={cn("m-0 text-body", sub)}>{p.description}</p> : null}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              {v === "badges" ? (
                <span className={cn("w-fit rounded-full px-2.5 py-0.5 text-label font-semibold", p.featured ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-2")}>{p.name}</span>
              ) : (
                <h3 className={cn("m-0 font-display font-semibold", v === "compact" ? "text-subtitle" : "text-title", text)}>{p.name}</h3>
              )}
              {p.description && v !== "compact" ? <p className={cn("m-0 text-body", sub)}>{p.description}</p> : null}
            </div>
            <Price p={p} size={v === "compact" ? "md" : "lg"} tone={text} />
          </>
        )}
        <Cta
          p={p}
          kind={v === "outline" ? (p.featured ? "primary" : "ghost") : undefined}
          className={cn(
            brand && "bg-brand-ink text-brand hover:bg-brand-ink hover:opacity-90",
            dark && "bg-ground text-ink hover:bg-ground hover:opacity-90",
            v === "outline" && !p.featured && "border border-line-strong",
          )}
        />
        <div className={cn("border-t pt-5", loud ? (dark ? "border-ground/15" : "border-brand-ink/20") : "border-line", v === "compact" && "pt-4")}>
          <Features p={p} tone={loud ? sub : "text-ink-2"} check={loud ? text : "text-success"} />
        </div>
      </>
    );
    const base = "relative flex h-full flex-col gap-5";
    if (v === "gradient-featured" && p.featured) {
      return (
        <li key={p.name} className="relative rounded-[13px] bg-gradient-to-br from-brand via-info to-success p-px shadow-3">
          <Popular className="absolute -top-2.5 left-6 z-10" />
          <div className={cn(base, "rounded-xl bg-surface p-6")}>{body}</div>
        </li>
      );
    }
    return (
      <li
        key={p.name}
        className={cn(
          base,
          v === "compact" ? "gap-4 p-5" : "p-6",
          v === "minimal" || v === "joined"
            ? cn("rounded-none", i > 0 && "@3xl:border-l border-line", v === "joined" && i > 0 && "border-t @3xl:border-t-0", p.featured && v === "joined" && "bg-brand-soft/60")
            : v === "outline"
              ? cn("rounded-lg border", p.featured ? "border-2 border-ink" : "border-line")
              : v === "tinted"
                ? cn("rounded-xl", tints[i % tints.length])
                : cn(
                    "rounded-lg border shadow-1",
                    dark ? "border-ink bg-ink shadow-3" : brand ? "border-brand bg-brand shadow-3" : "bg-surface",
                    !loud && (p.featured && ["cards", "compact", "price-first", "badges", "icons", "excluded", "gradient-featured"].includes(v) ? "border-brand shadow-2 ring-1 ring-brand" : "border-line"),
                  ),
        )}
      >
        {p.featured && !["minimal", "joined", "badges", "outline"].includes(v) ? <Popular className={cn("absolute -top-2.5 left-6", loud && "bg-ground text-ink")} /> : null}
        {p.featured && (v === "minimal" || v === "outline") ? <Popular className="w-fit" /> : null}
        {body}
      </li>
    );
  };

  let content: React.ReactNode;
  switch (v) {
    case "rows":
      content = (
        <ul className="m-0 flex w-full list-none flex-col gap-3 p-0">
          {plans.map((p) => (
            <li key={p.name} className={cn("grid items-center gap-5 rounded-lg border bg-surface p-5 shadow-1 @3xl:grid-cols-[1.1fr_1.6fr_auto] @3xl:gap-8", p.featured ? "border-brand ring-1 ring-brand" : "border-line")}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="m-0 font-display text-title font-semibold text-ink">{p.name}</h3>
                  {p.featured ? <Popular /> : null}
                </div>
                <Price p={p} size="md" />
              </div>
              <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1.5 p-0">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-body text-ink-2">
                    <CheckGlyph size={14} className="text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Cta p={p} className="@3xl:w-40" />
            </li>
          ))}
        </ul>
      );
      break;
    case "table": {
      const rows =
        comparison ??
        Array.from(new Set(plans.flatMap((p) => p.features.filter((f): f is string => typeof f === "string" && !/,? plus:?$/i.test(f))))).map((label) => ({
          label,
          values: plans.map((p) => p.features.includes(label)),
        }));
      content = (
        <div className="w-full overflow-x-auto rounded-lg border border-line bg-surface shadow-1">
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-body">
            <thead>
              <tr>
                <th className="w-[34%] border-b border-line p-5 text-left align-bottom text-label font-medium text-ink-3">Compare plans</th>
                {plans.map((p) => (
                  <th key={p.name} className={cn("border-b border-line p-5 text-left align-top font-normal", p.featured && "bg-brand-soft/60")}>
                    <div className="flex flex-col gap-3">
                      <span className="flex items-center gap-2 text-subtitle font-semibold text-ink">
                        {p.name}
                        {p.featured ? <Popular /> : null}
                      </span>
                      <Price p={p} size="md" />
                      <Cta p={p} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row" className="border-b border-line px-5 py-3 text-left font-normal text-ink-2">
                    {r.label}
                  </th>
                  {r.values.map((val, j) => (
                    <td key={j} className={cn("border-b border-line px-5 py-3 text-ink", plans[j]?.featured && "bg-brand-soft/60")}>
                      {val === true ? <CheckGlyph size={16} className="text-success" aria-label="Included" /> : val === false ? <span className="text-ink-4" aria-label="Not included">–</span> : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      break;
    }
    case "single": {
      const p = plans.find((x) => x.featured) ?? plans[0];
      content = p ? (
        <div className="grid w-full max-w-[920px] overflow-hidden rounded-xl border border-line bg-surface shadow-2 @3xl:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5 p-8">
            <h3 className="m-0 font-display text-heading font-semibold text-ink">{p.name}</h3>
            {p.description ? <p className="m-0 text-body-lg text-ink-2">{p.description}</p> : null}
            <span className="text-label font-semibold text-ink">What&apos;s included</span>
            <Features p={p} cols />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 border-t border-line bg-surface-2 p-8 text-center @3xl:border-l @3xl:border-t-0">
            <Price p={p} size="xl" />
            <Cta p={p} kind="primary" />
            <span className="text-small text-ink-3">Cancel any time.</span>
          </div>
        </div>
      ) : null;
      break;
    }
    case "split":
      content = (
        <div className="grid w-full gap-10 @5xl:grid-cols-[1fr_2.2fr] @5xl:items-start">
          <div className="flex flex-col gap-5">{intro}{Switch}</div>
          <ul className={cn("m-0 grid list-none items-stretch gap-4 p-0", plans.length >= 3 ? "@3xl:grid-cols-3" : "@2xl:grid-cols-2")}>{plans.slice(0, 3).map(card)}</ul>
        </div>
      );
      break;
    case "radio": {
      const p = plans.find((x) => x.name === chosen) ?? plans[0];
      content = (
        <div className="grid w-full max-w-[880px] gap-6 @3xl:grid-cols-[1.2fr_1fr]">
          <div role="radiogroup" aria-label="Plan" className="flex flex-col gap-2">
            {plans.map((x) => {
              const on = x.name === chosen;
              return (
                <label key={x.name} className={cn("flex cursor-pointer items-center gap-4 rounded-lg border bg-surface p-4 shadow-1 transition-colors", on ? "border-brand ring-1 ring-brand" : "border-line hover:border-ink-4")}>
                  <input type="radio" name={radioName} value={x.name} checked={on} onChange={() => setChosen(x.name)} className="size-4 accent-[var(--color-brand)]" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2 text-subtitle font-semibold text-ink">
                      {x.name}
                      {x.featured ? <Popular /> : null}
                    </span>
                    {x.description ? <span className="text-small text-ink-3">{x.description}</span> : null}
                  </span>
                  <span className="text-title font-semibold tabular-nums text-ink">{typeof priceOf(x) === "number" ? money(priceOf(x) as number) : priceOf(x)}</span>
                </label>
              );
            })}
          </div>
          {p ? (
            <div className="flex flex-col gap-5 rounded-lg border border-line bg-surface-2 p-6">
              <h3 className="m-0 text-subtitle font-semibold text-ink">{p.name} includes</h3>
              <Features p={p} />
              <Cta p={p} kind="primary" className="mt-auto" />
            </div>
          ) : null}
        </div>
      );
      break;
    }
    case "calculator": {
      const min = unit?.min ?? 1;
      const max = unit?.max ?? 50;
      content = (
        <div className="flex w-full flex-col items-center gap-8">
          <label className="flex w-full max-w-[520px] flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-1">
            <span className="flex items-baseline justify-between text-body text-ink-2">
              How many {unit?.name ?? "seat"}s?
              <span className="font-display text-heading font-semibold tabular-nums text-ink">{count}</span>
            </span>
            <input type="range" min={min} max={max} value={count} onChange={(e) => setCount(Number(e.target.value))} className={cn("w-full accent-[var(--color-brand)]", focusRing)} />
            <span className="flex justify-between text-caption text-ink-3">
              <span>{min}</span>
              <span>{max}</span>
            </span>
          </label>
          <ul className={cn("m-0 grid w-full list-none items-stretch gap-4 p-0", cols)}>{plans.map(card)}</ul>
        </div>
      );
      break;
    }
    case "tabs": {
      const p = plans.find((x) => x.name === chosen) ?? plans[0];
      content = (
        <div className="flex w-full max-w-[640px] flex-col items-center gap-5">
          <SegmentedControl block label="Plan" value={chosen} onValueChange={setChosen} options={plans.map((x) => ({ value: x.name, label: x.name }))} />
          {p ? (
            <div key={p.name} className="flex w-full animate-tab-in flex-col gap-5 rounded-xl border border-line bg-surface p-8 shadow-2">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="m-0 font-display text-title font-semibold text-ink">{p.name}</h3>
                  {p.description ? <p className="m-0 text-body text-ink-3">{p.description}</p> : null}
                </div>
                <Price p={p} />
              </div>
              <Features p={p} cols />
              <Cta p={p} kind="primary" />
            </div>
          ) : null}
        </div>
      );
      break;
    }
    case "carousel":
      content = (
        <ul className="m-0 flex w-full snap-x snap-mandatory list-none gap-4 overflow-x-auto p-0 pb-4 pt-3 [scrollbar-width:thin] [&>li]:h-auto [&>li]:w-[min(320px,82%)] [&>li]:flex-none [&>li]:snap-start">
          {plans.map(card)}
        </ul>
      );
      break;
    default:
      content = (
        <ul
          className={cn(
            "m-0 grid w-full list-none items-stretch p-0",
            cols,
            v === "minimal" || v === "joined" ? "gap-0" : "gap-4",
            v === "joined" && "overflow-hidden rounded-xl border border-line bg-surface shadow-1",
            v === "compact" && "gap-3",
          )}
        >
          {plans.map(card)}
        </ul>
      );
  }

  return (
    <div className={cn("@container flex w-full flex-col items-center gap-8", className)}>
      {v !== "split" ? Switch : null}
      {content}
    </div>
  );
}
