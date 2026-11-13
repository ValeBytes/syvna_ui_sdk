"use client";

// Hero: the top of a landing page, in 21 looks. Every variant takes the same
// content (eyebrow, title, description, actions, note, media); a few use one
// more prop (image, stats, signup, gallery) and say so.

import { useState } from "react";

import { cn } from "../cx";
import { Input } from "./inputs";
import { siteAction } from "./site";

export const heroVariants = [
  "center",
  "split",
  "split-reverse",
  "left",
  "minimal",
  "editorial",
  "photo",
  "photo-bottom",
  "gradient",
  "glow",
  "grid",
  "inverted",
  "brand",
  "card",
  "browser",
  "tilted",
  "collage",
  "stats",
  "signup",
  "announcement",
  "bordered",
] as const;

export type HeroVariant = (typeof heroVariants)[number];

export interface HeroProps {
  /** A few words over the title: "New: invoices in 30 currencies". */
  eyebrow?: React.ReactNode;
  /** What it is, in one line a visitor understands at a glance. */
  title: React.ReactNode;
  /** One or two sentences: who it's for and what changes for them. */
  description?: React.ReactNode;
  /** One main action and at most one more. */
  actions?: React.ReactNode;
  /** A line under the actions: "Free for 14 days. No card needed." */
  note?: React.ReactNode;
  /** A screenshot, product photo or illustration. */
  media?: React.ReactNode;
  /**
   * center: centred, media under. split / split-reverse: text beside media. left: left-aligned, media under.
   * minimal: the title alone, large. editorial: title left, words and actions right.
   * photo / photo-bottom: over a full-bleed photo (image). gradient, glow, grid: centred over a soft
   * background. inverted: on the ink colour. brand: on the brand colour. card: inside a raised card.
   * browser: media in a browser window. tilted: media tilted back in perspective. collage: a staggered
   * grid of photos (gallery). stats: split, with numbers under (stats). signup: an email field as the
   * action (signup). announcement: a "New" pill that links to the news. bordered: framed in fine lines.
   */
  variant?: HeroVariant;
  /** The photo behind photo and photo-bottom. */
  image?: string;
  /** For stats: three or four numbers that prove it, { value, label }. */
  stats?: { value: React.ReactNode; label: React.ReactNode }[];
  /** For signup: an email field and button in place of actions. */
  signup?: { placeholder?: string; cta: React.ReactNode; onSubmit?: (email: string) => void; done?: React.ReactNode };
  /** For collage: four to six photos. */
  gallery?: string[];
  className?: string;
}

type On = "default" | "inverse" | "photo" | "brand";

const ink: Record<On, { title: string; body: string; muted: string; pill: string }> = {
  default: { title: "text-ink", body: "text-ink-2", muted: "text-ink-3", pill: "border-line bg-surface text-ink-2 shadow-1" },
  inverse: { title: "text-ground", body: "text-ground/75", muted: "text-ground/60", pill: "border-ground/20 bg-ground/10 text-ground" },
  photo: { title: "text-white", body: "text-white/85", muted: "text-white/65", pill: "border-white/25 bg-white/10 text-white backdrop-blur-sm" },
  brand: { title: "text-brand-ink", body: "text-brand-ink/80", muted: "text-brand-ink/65", pill: "border-brand-ink/20 bg-brand-ink/10 text-brand-ink" },
};

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Signup({ s, center }: { s: NonNullable<HeroProps["signup"]>; center: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <p className="m-0 rounded-md bg-success-soft px-3 py-2 text-body text-success">{s.done ?? "Thanks. Check your inbox to finish signing up."}</p>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        s.onSubmit?.(email);
        setSent(true);
      }}
      className={cn("flex w-full max-w-[460px] flex-col gap-2 @xl:flex-row", center && "mx-auto")}
    >
      <div className="min-w-0 flex-1">
        <Input type="email" required size="lg" aria-label="Email address" autoComplete="email" placeholder={s.placeholder ?? "you@company.com"} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button type="submit" className={cn(siteAction("primary"), "h-10")}>
        {s.cta}
      </button>
    </form>
  );
}

/** The words: eyebrow, title, description, actions, note. */
function Copy({ h, on = "default", center, big, className }: { h: HeroProps; on?: On; center?: boolean; big?: boolean; className?: string }) {
  const c = ink[on];
  const v = h.variant;
  return (
    <div className={cn("relative flex flex-col gap-5", center ? "items-center text-center" : "items-start text-left", className)}>
      {h.eyebrow ? (
        v === "announcement" ? (
          <span className={cn("inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-label font-medium", c.pill)}>
            <span className="rounded-full bg-brand px-2 py-0.5 text-caption font-semibold text-brand-ink">New</span>
            {h.eyebrow}
            <Arrow />
          </span>
        ) : v === "minimal" || v === "editorial" ? (
          <span className={cn("text-label font-semibold uppercase tracking-[0.08em]", c.muted)}>{h.eyebrow}</span>
        ) : (
          <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-label font-medium", c.pill)}>{h.eyebrow}</span>
        )
      ) : null}
      <h1 className={cn("m-0 text-balance font-display font-semibold tracking-[-0.03em]", big ? "text-display-xl" : "text-display @2xl:text-display-xl", c.title)}>{h.title}</h1>
      {h.description && v !== "editorial" ? <p className={cn("m-0 max-w-[600px] text-pretty text-body-lg", c.body)}>{h.description}</p> : null}
      {v !== "editorial" ? <Act h={h} on={on} center={center} /> : null}
    </div>
  );
}

function Act({ h, on, center }: { h: HeroProps; on: On; center?: boolean }) {
  const c = ink[on];
  return (
    <>
      {h.signup ? (
        <div className="mt-2 w-full">
          <Signup s={h.signup} center={!!center} />
        </div>
      ) : h.actions ? (
        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-3",
            center && "justify-center",
            // On the brand colour the primary action inverts, so it still stands out.
            on === "brand" && "[&_.bg-brand]:bg-brand-ink [&_.bg-brand]:text-brand",
          )}
        >
          {h.actions}
        </div>
      ) : null}
      {h.note ? <p className={cn("m-0 text-small", c.muted)}>{h.note}</p> : null}
    </>
  );
}

const wrap = "relative mx-auto w-full max-w-[1200px] px-4 @3xl:px-6";
const pad = "py-14 @3xl:py-24";

function Browser({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-3">
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-surface-2 px-3.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="mx-auto h-5 w-[40%] max-w-[280px] rounded-sm bg-ground" />
      </div>
      <div className="[&_img]:block [&_img]:rounded-none [&_img]:border-0 [&_img]:shadow-none">{children}</div>
    </div>
  );
}

/** The top of a landing page: what it is, why it matters, and the one thing to do next. */
export function Hero(props: HeroProps) {
  const { variant = "center", media, image, stats, gallery, className } = props;
  const h = { ...props, variant };
  const section = (cls: string, children: React.ReactNode) => <section className={cn("@container relative isolate w-full overflow-hidden", cls, className)}>{children}</section>;
  const Media = media ? <div className="w-full">{media}</div> : null;

  switch (variant) {
    case "split":
    case "split-reverse":
    case "stats":
      return section(
        "",
        <div className={cn(wrap, pad, "grid items-center gap-10 @4xl:grid-cols-2 @4xl:gap-14")}>
          <div className={cn("flex flex-col gap-8", variant === "split-reverse" && "@4xl:order-2")}>
            <Copy h={h} />
            {variant === "stats" && stats?.length ? (
              <dl className="m-0 grid w-full grid-cols-2 gap-6 border-t border-line pt-6 @xl:grid-cols-4 @4xl:grid-cols-2 @6xl:grid-cols-4">
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <dt className="order-2 text-small text-ink-3">{s.label}</dt>
                    <dd className="order-1 m-0 font-display text-heading font-semibold tracking-[-0.02em] text-ink tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          {Media}
        </div>,
      );
    case "left":
      return section("", <div className={cn(wrap, pad, "flex flex-col gap-12")}><Copy h={h} className="max-w-[760px]" />{Media}</div>);
    case "minimal":
      return section("", <div className={cn(wrap, "py-20 @3xl:py-32")}><Copy h={{ ...h, description: h.description }} center big className="mx-auto max-w-[900px]" /></div>);
    case "editorial":
      return section(
        "",
        <div className={cn(wrap, pad, "flex flex-col gap-12")}>
          <div className="grid gap-8 @4xl:grid-cols-[1.4fr_1fr] @4xl:items-end">
            <Copy h={h} big />
            <div className="flex flex-col items-start gap-5 @4xl:pb-2">
              {h.description ? <p className="m-0 text-pretty text-body-lg text-ink-2">{h.description}</p> : null}
              <Act h={h} on="default" />
            </div>
          </div>
          {Media}
        </div>,
      );
    case "photo":
    case "photo-bottom":
      return section(
        "flex min-h-[560px] bg-ink",
        <>
          {image ? <img src={image} alt="" className="absolute inset-0 -z-10 size-full object-cover" /> : null}
          <div className={cn("absolute inset-0 -z-10", variant === "photo" ? "bg-black/55" : "bg-gradient-to-t from-black/80 via-black/30 to-transparent")} />
          <div className={cn(wrap, "flex py-14", variant === "photo" ? "items-center justify-center" : "items-end")}>
            <Copy h={h} on="photo" center={variant === "photo"} className={variant === "photo" ? "max-w-[760px]" : "max-w-[640px]"} />
          </div>
        </>,
      );
    case "gradient":
    case "glow":
    case "grid":
    case "announcement":
    case "signup":
    case "center":
      return section(
        variant === "gradient" ? "bg-gradient-to-b from-brand-soft via-ground to-ground" : "",
        <>
          {variant === "glow" ? <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-140px] -z-10 h-[460px] w-[min(900px,100%)] -translate-x-1/2 rounded-full bg-brand opacity-25 blur-[110px]" /> : null}
          {variant === "grid" ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_30%,black_20%,transparent_70%)]"
            />
          ) : null}
          <div className={cn(wrap, pad, "flex flex-col items-center gap-12")}>
            <Copy h={h} center className="max-w-[760px]" />
            {media ? <div className="w-full max-w-[1040px]">{media}</div> : null}
          </div>
        </>,
      );
    case "inverted":
    case "brand":
      return section(
        variant === "inverted" ? "bg-ink" : "bg-brand",
        <div className={cn(wrap, pad, "grid items-center gap-10", media && "@4xl:grid-cols-2")}>
          <Copy h={h} on={variant === "inverted" ? "inverse" : "brand"} center={!media} className={media ? "" : "mx-auto max-w-[760px]"} />
          {Media}
        </div>,
      );
    case "card":
      return section(
        "",
        <div className={cn(wrap, "py-8 @3xl:py-12")}>
          <div className={cn("grid items-center gap-10 rounded-xl border border-line bg-surface p-6 shadow-2 @3xl:p-12", media && "@4xl:grid-cols-2")}>
            <Copy h={h} center={!media} className={media ? "" : "mx-auto max-w-[720px]"} />
            {Media}
          </div>
        </div>,
      );
    case "browser":
      return section(
        "",
        <div className={cn(wrap, pad, "flex flex-col items-center gap-12")}>
          <Copy h={h} center className="max-w-[760px]" />
          {media ? <div className="w-full max-w-[1040px]"><Browser>{media}</Browser></div> : null}
        </div>,
      );
    case "tilted":
      return section(
        "",
        <div className={cn(wrap, "flex flex-col items-center gap-14 pt-14 @3xl:pt-24")}>
          <Copy h={h} center className="max-w-[760px]" />
          {media ? (
            <div className="relative w-full max-w-[1080px] [perspective:2000px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
              <div className="origin-top [transform:rotateX(20deg)] overflow-hidden rounded-xl border border-line shadow-3 [&_img]:block [&_img]:rounded-none [&_img]:border-0">{media}</div>
            </div>
          ) : null}
        </div>,
      );
    case "collage":
      return section(
        "",
        <div className={cn(wrap, pad, "grid items-center gap-10 @4xl:grid-cols-2 @4xl:gap-14")}>
          <Copy h={h} />
          {gallery?.length ? (
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(0, 6).map((src, i) => (
                <img key={i} src={src} alt="" className={cn("aspect-[3/4] w-full rounded-lg border border-line object-cover shadow-1", i % 3 === 1 && "translate-y-6", i % 3 === 2 && "translate-y-12")} />
              ))}
            </div>
          ) : (
            Media
          )}
        </div>,
      );
    case "bordered":
      return section(
        "border-y border-line",
        <div className={cn(wrap, "px-0 @3xl:px-0")}>
          <div className="relative mx-4 border-x border-line @3xl:mx-6">
            {["-left-[5px] -top-[5px]", "-right-[5px] -top-[5px]", "-left-[5px] -bottom-[5px]", "-right-[5px] -bottom-[5px]"].map((pos) => (
              <span key={pos} aria-hidden="true" className={cn("absolute size-[9px] text-ink-3", pos)}>
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
              </span>
            ))}
            <div className="flex flex-col items-center gap-12 px-6 py-16 @3xl:py-24">
              <Copy h={h} center className="max-w-[760px]" />
            </div>
            {media ? <div className="border-t border-line p-4 @3xl:p-6">{media}</div> : null}
          </div>
        </div>,
      );
  }
}
