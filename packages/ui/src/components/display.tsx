import { cn, toneFill, toneSoft, toneText, type Tone } from "../cx";
import { ArrowDownGlyph, ArrowUpGlyph } from "./icons";

/** The raised surface cards, stats and tables share. */
export const surface = "rounded-lg border border-line bg-surface shadow-1";

export interface BadgeProps {
  /** What the status means: success (paid, live), warning (due), danger (failed), info (new), brand, neutral. */
  tone?: Tone;
  /** A dot before the text, for statuses in a table. */
  dot?: boolean;
  /** One or two words: "Paid", "Low stock". */
  children: React.ReactNode;
  className?: string;
}

/** One or two words of status. The same status gets the same tone on every screen. */
export function Badge({ tone = "neutral", dot, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-sm px-1.5 text-caption font-medium",
        toneSoft[tone],
        toneText[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export interface AvatarProps {
  /** The person's or business's name: the initials and the image's alt text. */
  name: string;
  /** A photo; the initials show without one. */
  src?: string;
  /** sm in dense rows, md by default, lg and xl in profile headers. */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = { sm: "size-6 text-[10px]", md: "size-8 text-caption", lg: "size-10 text-label", xl: "size-14 text-title" };

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** A person or business: their photo, or their initials when there isn't one. */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center justify-center overflow-hidden rounded-full bg-brand-soft font-semibold tracking-[0.01em] text-ink-2 ring-1 ring-inset ring-line",
        avatarSizes[size],
        className,
      )}
      title={name}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : <span aria-label={name}>{initials(name)}</span>}
    </span>
  );
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** What the group is: "Recent payments". */
  title?: React.ReactNode;
  /** A line under the title, when the title isn't enough. */
  description?: React.ReactNode;
  /** Buttons or a menu on the header's right. */
  actions?: React.ReactNode;
  /** A row under a line at the bottom: totals, a "View all" link. */
  footer?: React.ReactNode;
  /** false for content that runs to the edges: a flush Table, an image. */
  padded?: boolean;
}

/** A surface for one group of things on a screen. Use them for groups, not for every item: a list of items is a Table. */
export function Card({ title, description, actions, footer, padded = true, className, children, ...rest }: CardProps) {
  const head = Boolean(title || description || actions);
  return (
    <section className={cn("flex min-w-0 flex-col text-ink", surface, className)} {...rest}>
      {head ? (
        <header className="flex items-start justify-between gap-3 px-4 pt-3.5">
          <div className="min-w-0">
            {title ? <h3 className="m-0 font-display text-subtitle font-semibold text-ink-heading">{title}</h3> : null}
            {description ? <p className="m-0 mt-0.5 text-label text-ink-3">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-none gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("min-w-0", padded ? (head ? "px-4 pb-4 pt-3" : "p-4") : head && "pt-3")}>{children}</div>
      {footer ? (
        <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-label text-ink-3">{footer}</footer>
      ) : null}
    </section>
  );
}

export interface StatCardProps {
  /** What's counted: "Bookings today". */
  label: React.ReactNode;
  /** The number, formatted for the reader: "$18,240". */
  value: React.ReactNode;
  /** The comparison that makes the number useful: "+12%" against last week. upIsGood false when down is good (refunds, costs). */
  change?: { value: React.ReactNode; trend: "up" | "down" | "flat"; upIsGood?: boolean };
  /** What it's compared with, or what to do: "vs last week". */
  hint?: React.ReactNode;
  className?: string;
}

/** One number that matters today, with what it's compared against. */
export function StatCard({ label, value, change, hint, className }: StatCardProps) {
  let tone: Tone = "neutral";
  if (change && change.trend !== "flat") {
    tone = (change.trend === "up") === (change.upIsGood ?? true) ? "success" : "danger";
  }
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 p-4", surface, className)}>
      <p className="m-0 text-small font-medium text-ink-3">{label}</p>
      <p className="m-0 font-display text-stat font-semibold text-ink-heading tabular-nums">{value}</p>
      {change || hint ? (
        <p className="m-0 flex flex-wrap items-center gap-2 text-small">
          {change ? (
            <span className={cn("inline-flex items-center gap-0.5 font-semibold tabular-nums", toneText[tone])}>
              {change.trend === "up" ? <ArrowUpGlyph size={13} /> : change.trend === "down" ? <ArrowDownGlyph size={13} /> : null}
              {change.value}
            </span>
          ) : null}
          {hint ? <span className="text-ink-3">{hint}</span> : null}
        </p>
      ) : null}
    </div>
  );
}

export interface EmptyStateProps {
  /** An icon (lucide-react, 24px) or a small drawing. */
  icon?: React.ReactNode;
  /** What's missing: "No customers yet". */
  title: React.ReactNode;
  /** Why it's empty and what happens once there's something. */
  description?: React.ReactNode;
  /** Usually one primary Button that makes the first one. */
  action?: React.ReactNode;
  className?: string;
}

/** What a list shows before it has anything in it: what goes here, and the button that adds the first. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      {icon ? (
        <div className="mb-3 grid size-10 place-items-center rounded-lg bg-surface-2 text-ink-2 ring-1 ring-inset ring-line">{icon}</div>
      ) : null}
      <p className="m-0 font-display text-subtitle font-semibold text-ink">{title}</p>
      {description ? <p className="m-0 mt-1 max-w-[380px] text-label text-pretty text-ink-3">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export interface SkeletonProps {
  /** A CSS width: 120 or "40%". Defaults to the container's. */
  width?: number | string;
  /** A CSS height; each shape has its own default. */
  height?: number | string;
  /** "text" for a line, "circle" for an avatar, "block" for a card or image. */
  shape?: "text" | "circle" | "block";
  className?: string;
}

const skeletonShapes = { text: "h-3.5 rounded", circle: "size-8 rounded-full", block: "h-24 rounded-lg" };

/** Where something is loading, in its shape, so the page doesn't jump when it arrives. */
export function Skeleton({ width, height, shape = "text", className }: SkeletonProps) {
  return (
    <span
      className={cn(
        "block animate-shimmer bg-[linear-gradient(90deg,var(--color-surface-2)_0%,var(--color-line)_50%,var(--color-surface-2)_100%)] bg-size-[200%_100%] motion-reduce:animate-none",
        skeletonShapes[shape],
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export interface ProgressProps {
  /** 0 to 100. */
  value: number;
  /** brand for progress; warning or danger as a quota runs out. */
  tone?: Tone;
  /** Read by screen readers: "Upload", "Profile complete". */
  label: string;
  /** Shows "62%" beside the bar. */
  showValue?: boolean;
  className?: string;
}

/** How far along something is: an upload, a goal, a quota. */
export function Progress({ value, tone = "brand", label, showValue, className }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v)}
      >
        <span
          className={cn("block h-full rounded-full transition-[width] duration-400 ease-[cubic-bezier(.16,1,.3,1)]", toneFill[tone])}
          style={{ width: `${v}%` }}
        />
      </div>
      {showValue ? <span className="min-w-9 text-right text-small font-medium tabular-nums text-ink-2">{Math.round(v)}%</span> : null}
    </div>
  );
}
