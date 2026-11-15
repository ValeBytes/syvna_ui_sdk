"use client";

// FormPage: a page whose job is a form (settings, a record's details, a long
// create form), in 20 proven layouts. The page uses the whole width; the fields
// never do. They sit in one column of at most 40rem, with titles, navigation,
// a preview or a record's details using the rest. One Save for the page (Primer,
// Carbon), 24px between fields and 40px between sections (Carbon), labels above
// their fields. Every section stays in the page on another tab or step, so all
// its fields go with the form when it's sent.

import { useEffect, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { Stepper } from "./basics";
import { Button } from "./button";
import { Tabs } from "./tabs";

export const formPageVariants = [
  "annotated",
  "annotated-plain",
  "sheet",
  "labels-left",
  "single",
  "focus",
  "create",
  "disclosure",
  "rows",
  "cards",
  "inline-edit",
  "savebar",
  "nav",
  "index",
  "tabs",
  "steps",
  "steps-side",
  "question",
  "preview",
  "record",
] as const;

export type FormPageVariant = (typeof formPageVariants)[number];

/** One setting as a row: its name and what it does at the left, its control at the right. */
export interface FormRow {
  /** The setting's name: "New orders". */
  label: React.ReactNode;
  /** One sentence on what it does. */
  description?: React.ReactNode;
  /** The control: a Switch, Select or Input (give it an aria-label). */
  control: React.ReactNode;
  /** For inline-edit: the current value as text, shown until Edit is pressed. */
  value?: React.ReactNode;
}

export interface FormSection {
  /** A short id, unique on the page: "profile". Links, tabs and steps use it. */
  id: string;
  /** What the section is about: "Profile", "Billing address". */
  title: React.ReactNode;
  /** One or two sentences on what these settings change. */
  description?: React.ReactNode;
  /** The fields, labels above: Field with Input, Select, Textarea. One column; only short related fields share a row. */
  children?: React.ReactNode;
  /** Settings as rows instead of (or after) fields: toggles and small selects. */
  rows?: FormRow[];
  /** The section's own action: for cards, its Save; elsewhere "Reset to defaults" and the like. */
  actions?: React.ReactNode;
  /** For cards: the hint in the card's footer, beside its action. */
  footer?: React.ReactNode;
  /** danger: destructive settings (delete, transfer), set apart in red. Never saved with the rest. */
  tone?: "default" | "danger";
  /** For disclosure: kept behind "Advanced settings" until opened. */
  advanced?: boolean;
}

export interface FormPageProps {
  /** The form's sections, in order. */
  sections: FormSection[];
  /**
   * How the page is laid out (all use the full width; fields stay in one column of at most 40rem).
   * Titles beside fields: annotated (title and description in a column at the left, fields in a card), annotated-plain
   * (the same, ruled, no cards), sheet (one card, ruled sections), labels-left (each field's label in a left column; long
   * desktop admin forms). One column: single (sections down the page), focus (a slim bar on top with the title and
   * actions, the form centred under it), create (long create forms: actions in a bar fixed to the bottom), disclosure
   * (the main settings, the rest behind "Advanced settings"). Settings: rows (each setting a row, its control at the
   * right; toggles that save themselves), cards (a card per independent setting with its own Save in a footer),
   * inline-edit (values as text; Edit turns a row into its control), savebar (a bar with Discard and Save appears once
   * something changes). Navigated: nav (categories at the left, one shown at a time), index (a long form with a sticky list
   * of its sections at the right), tabs (3 to 7 groups across the top). Sequences: steps and steps-side (one step at a
   * time, Back and Continue), question (one question a screen, its label the heading). With context: preview (a fixed
   * form column beside a live preview), record (fields in two thirds, the record's details in a third).
   */
  variant?: FormPageVariant;
  /** The form's buttons, the submit first ("Save changes"), then Cancel. One Save for the page. */
  actions?: React.ReactNode;
  /** A line beside the actions: "Last saved 2 minutes ago". */
  note?: React.ReactNode;
  /** For focus and question: what the form is ("New invoice"). */
  title?: React.ReactNode;
  /** For preview and record: what sits beside the form (a live preview; the record's status, owner, dates). */
  aside?: React.ReactNode;
  /** The aside's heading: "Preview", "Details". */
  asideTitle?: React.ReactNode;
  className?: string;
}

// Measures, from the research: the fields' column, the gaps.
const FIELDS = "max-w-[40rem]";
const card = "rounded-xl border border-line bg-surface";
const titleCol = "@4xl:grid-cols-[minmax(13rem,1fr)_minmax(0,2fr)]";

function Heading({ s, size = "md" }: { s: FormSection; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h3 className={cn("m-0 font-display font-semibold text-ink-heading", size === "lg" ? "text-heading tracking-[-0.01em]" : size === "sm" ? "text-body" : "text-title", s.tone === "danger" && "text-danger")}>
        {s.title}
      </h3>
      {s.description ? <p className="m-0 max-w-[36rem] text-label text-ink-3 text-pretty">{s.description}</p> : null}
    </div>
  );
}

function Rows({ rows }: { rows: FormRow[] }) {
  return (
    <div className="flex flex-col divide-y divide-line">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-body font-medium text-ink">{r.label}</span>
            {r.description ? <span className="text-label text-ink-3">{r.description}</span> : null}
          </div>
          <div className="flex-none">{r.control}</div>
        </div>
      ))}
    </div>
  );
}

// A section's body: its fields in one column, then its rows.
function Body({ s, cap = true }: { s: FormSection; cap?: boolean }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-6", cap && FIELDS)}>
      {s.children}
      {s.rows?.length ? <Rows rows={s.rows} /> : null}
    </div>
  );
}

function Actions({ actions, note, className, end }: { actions?: React.ReactNode; note?: React.ReactNode; className?: string; end?: boolean }) {
  if (!actions && !note) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", end && "justify-end", className)}>
      {actions ? <div className={cn("flex flex-wrap items-center gap-2", end && "order-2")}>{actions}</div> : null}
      {note ? <span className={cn("text-caption text-ink-3", end && "order-1 mr-auto")}>{note}</span> : null}
    </div>
  );
}

// Title and description in the left column, the fields at the right.
function Annotated({ s, plain }: { s: FormSection; plain?: boolean }) {
  const danger = s.tone === "danger";
  return (
    <section id={s.id} className={cn("grid scroll-mt-24 gap-x-10 gap-y-4", titleCol, plain && "border-t border-line pt-10 first:border-t-0 first:pt-0")}>
      <div className="flex flex-col gap-3">
        <Heading s={s} />
        {s.actions && !danger ? <div className="flex gap-2">{s.actions}</div> : null}
      </div>
      <div className={cn(!plain && cn(card, "p-6"), danger && !plain && "border-danger/40", "min-w-0")}>
        <Body s={s} />
        {danger && s.actions ? <div className="mt-6 flex gap-2">{s.actions}</div> : null}
      </div>
    </section>
  );
}

// What the page scrolls in: the window, or a scrolling box around the form.
function scrollerOf(el: HTMLElement | null): HTMLElement | Window {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return window;
}

function useInView(ids: string[], on: boolean, root: React.RefObject<HTMLElement | null>) {
  const [at, setAt] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    if (!on) return;
    const box = scrollerOf(root.current);
    const read = () => {
      const top = box === window ? 0 : (box as HTMLElement).getBoundingClientRect().top;
      const height = box === window ? window.innerHeight : (box as HTMLElement).clientHeight;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - top <= height * 0.3) cur = id;
      }
      setAt(cur);
    };
    read();
    box.addEventListener("scroll", read, { passive: true });
    return () => box.removeEventListener("scroll", read);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, on]);
  return [at, setAt] as const;
}

function NavLink({ on, onClick, href, children, rail }: { on: boolean; onClick?: () => void; href?: string; children: React.ReactNode; rail?: boolean }) {
  const cls = cn(
    "block w-full cursor-pointer text-left text-label no-underline transition-colors",
    rail ? cn("border-l-2 py-1.5 pl-3", on ? "border-ink font-medium text-ink" : "border-line text-ink-3 hover:border-line-strong hover:text-ink") : cn("rounded-md px-3 py-2", on ? "bg-surface-2 font-medium text-ink" : "text-ink-3 hover:bg-surface-2 hover:text-ink"),
    focusRing,
  );
  return href ? (
    <a href={href} onClick={onClick} aria-current={on ? "location" : undefined} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-current={on ? "page" : undefined} className={cls}>
      {children}
    </button>
  );
}

// inline-edit: a row shows its value; Edit swaps in the control, kept mounted so it's sent with the form.
function EditRow({ r }: { r: FormRow }) {
  const [editing, setEditing] = useState(false);
  const [n, setN] = useState(0);
  return (
    <div className="grid gap-x-8 gap-y-2 py-4 first:pt-0 last:pb-0 @3xl:grid-cols-[12rem_minmax(0,1fr)_auto] @3xl:items-start">
      <div className="flex flex-col gap-0.5 @3xl:pt-1.5">
        <span className="text-label font-medium text-ink">{r.label}</span>
        {r.description ? <span className="text-caption text-ink-3">{r.description}</span> : null}
      </div>
      <div className={cn("min-w-0", FIELDS)}>
        {editing ? null : <span className="block py-1.5 text-body text-ink-2">{r.value ?? "—"}</span>}
        <div key={n} hidden={!editing}>
          {r.control}
        </div>
      </div>
      <div className="flex gap-2 @3xl:justify-end">
        {editing ? (
          <>
            <Button type="submit" variant="primary" size="sm">
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setN(n + 1);
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

/** A page whose job is a form: sections of fields in one of 20 proven layouts, using the page's whole width without stretching the fields. */
export function FormPage({ sections, variant = "annotated", actions, note, title, aside, asideTitle, className }: FormPageProps) {
  const v = variant;
  const root = useRef<HTMLDivElement>(null);
  const ids = sections.map((s) => s.id);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState(ids[0] ?? "");
  const [dirty, setDirty] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [inView, setInView] = useInView(ids, v === "index", root);
  const shell = cn("@container w-full min-w-0", className);
  const danger = sections.filter((s) => s.tone === "danger");
  const main = sections.filter((s) => s.tone !== "danger");

  // Danger sections close every layout that doesn't place them itself.
  const dangerZone = danger.length ? (
    <div className="flex flex-col gap-10 border-t border-line pt-10">
      {danger.map((s) => (
        <Annotated key={s.id} s={s} />
      ))}
    </div>
  ) : null;

  // ---- titles beside fields ----
  if (v === "annotated" || v === "annotated-plain") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-10")}>
        {main.map((s) => (
          <Annotated key={s.id} s={s} plain={v === "annotated-plain"} />
        ))}
        <div className={cn("grid gap-x-10 border-t border-line pt-6", titleCol)}>
          <span className="hidden @4xl:block" />
          <Actions actions={actions} note={note} />
        </div>
        {dangerZone}
      </div>
    );
  }
  if (v === "sheet") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-10")}>
        <div className={card}>
          {main.map((s) => (
            <section key={s.id} id={s.id} className={cn("grid scroll-mt-24 gap-x-10 gap-y-4 border-b border-line p-6 last:border-b-0 @4xl:p-8", titleCol)}>
              <Heading s={s} />
              <Body s={s} />
            </section>
          ))}
          <div className={cn("grid gap-x-10 rounded-b-xl border-t border-line bg-surface-2 px-6 py-4 @4xl:px-8", titleCol)}>
            <span className="hidden @4xl:block" />
            <Actions actions={actions} note={note} />
          </div>
        </div>
        {dangerZone}
      </div>
    );
  }
  if (v === "labels-left") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-10")}>
        {main.map((s) => (
          <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-6">
            <div className="border-b border-line pb-3">
              <Heading s={s} />
            </div>
            {/* The kit's Field puts its label above; here each label moves into a left column. */}
            <div className="flex flex-col gap-6 @3xl:[&>div]:grid @3xl:[&>div]:grid-cols-[13rem_minmax(0,40rem)] @3xl:[&>div]:gap-x-8 @3xl:[&>div>:first-child]:row-span-3 @3xl:[&>div>:first-child]:pt-2">{s.children}</div>
            {s.rows?.length ? <Rows rows={s.rows} /> : null}
          </section>
        ))}
        <Actions actions={actions} note={note} className="border-t border-line pt-6 @3xl:pl-[15rem]" />
        {dangerZone}
      </div>
    );
  }

  // ---- one column ----
  if (v === "single" || v === "create" || v === "disclosure") {
    const anyAdvanced = main.some((x) => x.advanced);
    const shown = v === "disclosure" ? main.filter((s, i) => (anyAdvanced ? !s.advanced : i < 2)) : main;
    const later = v === "disclosure" ? main.filter((s) => !shown.includes(s)) : [];
    const block = (s: FormSection) => (
      <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-6 border-t border-line pt-10 first:border-t-0 first:pt-0">
        <Heading s={s} />
        <Body s={s} />
      </section>
    );
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-10")}>
        {shown.map(block)}
        {later.length ? (
          <div className="flex flex-col gap-10 border-t border-line pt-6">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              aria-expanded={advancedOpen}
              className={cn("flex w-fit cursor-pointer items-center gap-2 rounded-md text-label font-medium text-ink-2 hover:text-ink", focusRing)}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("transition-transform duration-200", advancedOpen && "rotate-90")}>
                <path d="m9 6 6 6-6 6" />
              </svg>
              {advancedOpen ? "Hide advanced settings" : `Advanced settings (${later.length})`}
            </button>
            <div hidden={!advancedOpen} className="flex flex-col gap-10">
              {later.map(block)}
            </div>
          </div>
        ) : null}
        {v === "create" ? (
          <div className="sticky bottom-0 z-10 -mx-(--page-x) -mb-(--page-y) border-t border-line bg-surface px-(--page-x) py-3 shadow-3">
            <Actions actions={actions} note={note} end />
          </div>
        ) : (
          <Actions actions={actions} note={note} className="border-t border-line pt-6" />
        )}
        {dangerZone}
      </div>
    );
  }
  if (v === "focus") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col")}>
        <div className="sticky top-0 z-10 -mx-(--page-x) -mt-(--page-y) mb-10 flex items-center gap-4 border-b border-line bg-ground px-(--page-x) py-3">
          <span className="min-w-0 flex-1 truncate font-display text-subtitle font-semibold text-ink">{title}</span>
          <Actions actions={actions} note={note} end />
        </div>
        <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-10">
          {main.map((s) => (
            <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-6 border-t border-line pt-10 first:border-t-0 first:pt-0">
              <Heading s={s} />
              <Body s={s} cap={false} />
            </section>
          ))}
          {dangerZone}
        </div>
      </div>
    );
  }

  // ---- settings ----
  if (v === "rows") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-10")}>
        {main.map((s) => (
          <section key={s.id} id={s.id} className={cn("grid scroll-mt-24 gap-x-10 gap-y-4", titleCol)}>
            <Heading s={s} />
            <div className={cn(card, "px-6 py-5")}>
              {s.children ? <div className={cn("flex flex-col gap-6", s.rows?.length && "mb-5 border-b border-line pb-5", FIELDS)}>{s.children}</div> : null}
              {s.rows?.length ? <Rows rows={s.rows} /> : null}
            </div>
          </section>
        ))}
        {actions || note ? (
          <div className={cn("grid gap-x-10 border-t border-line pt-6", titleCol)}>
            <span className="hidden @4xl:block" />
            <Actions actions={actions} note={note} />
          </div>
        ) : null}
        {dangerZone}
      </div>
    );
  }
  if (v === "cards") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-6")}>
        {sections.map((s) => (
          <section key={s.id} id={s.id} className={cn(card, "scroll-mt-24 overflow-hidden", s.tone === "danger" && "border-danger/40")}>
            <div className="flex flex-col gap-5 p-6">
              <Heading s={s} />
              <Body s={s} />
            </div>
            {s.footer || s.actions ? (
              <div className={cn("flex items-center justify-between gap-4 border-t px-6 py-3", s.tone === "danger" ? "border-danger/30 bg-danger-soft" : "border-line bg-surface-2")}>
                <span className="text-caption text-ink-3">{s.footer}</span>
                <div className="flex gap-2">{s.actions}</div>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    );
  }
  if (v === "inline-edit") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-10")}>
        {main.map((s) => (
          <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-4">
            <Heading s={s} />
            <div className={cn(card, "flex flex-col divide-y divide-line px-6 py-5")}>
              {(s.rows ?? []).map((r, i) => (
                <EditRow key={i} r={r} />
              ))}
            </div>
            {s.children ? <Body s={s} /> : null}
          </section>
        ))}
        {main.some((s) => s.children) ? <Actions actions={actions} note={note} className="border-t border-line pt-6" /> : null}
        {dangerZone}
      </div>
    );
  }
  if (v === "savebar") {
    return (
      <div
        ref={root}
        onInput={() => setDirty(true)}
        onChange={() => setDirty(true)}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('[role="switch"], [role="radio"], [role="checkbox"]')) setDirty(true);
        }}
        className={cn(shell, "flex flex-col gap-10 pb-24")}
      >
        {main.map((s) => (
          <Annotated key={s.id} s={s} />
        ))}
        {dangerZone}
        <div
          aria-hidden={!dirty}
          className={cn(
            "sticky bottom-4 z-20 mx-auto flex w-full max-w-[44rem] items-center gap-4 rounded-xl border border-line bg-surface px-5 py-3 shadow-3 transition-[opacity,transform] duration-200",
            dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
          )}
        >
          <span className="flex-1 text-label font-medium text-ink">Unsaved changes</span>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              root.current?.closest("form")?.reset();
              setDirty(false);
            }}
          >
            Discard
          </Button>
          {actions}
        </div>
      </div>
    );
  }

  // ---- navigated ----
  if (v === "nav") {
    return (
      <div ref={root} className={cn(shell, "grid items-start gap-10 @4xl:grid-cols-[15rem_minmax(0,1fr)]")}>
        <nav aria-label="Settings" className="flex flex-col gap-0.5 @4xl:sticky @4xl:top-4">
          {sections.map((s) => (
            <NavLink key={s.id} on={tab === s.id} onClick={() => setTab(s.id)}>
              <span className={s.tone === "danger" ? "text-danger" : undefined}>{s.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-6">
          {sections.map((s) => (
            <section key={s.id} id={s.id} hidden={tab !== s.id} className="flex flex-col gap-6">
              <div className="border-b border-line pb-5">
                <Heading s={s} size="lg" />
              </div>
              <Body s={s} />
              {s.actions ? <div className="flex gap-2">{s.actions}</div> : null}
            </section>
          ))}
          <Actions actions={actions} note={note} className="border-t border-line pt-6" />
        </div>
      </div>
    );
  }
  if (v === "index") {
    return (
      <div ref={root} className={cn(shell, "grid items-start gap-10 @5xl:grid-cols-[minmax(0,1fr)_13rem]")}>
        <div className="flex min-w-0 flex-col gap-10">
          {main.map((s) => (
            <Annotated key={s.id} s={s} plain />
          ))}
          <Actions actions={actions} note={note} className="border-t border-line pt-6" />
          {dangerZone}
        </div>
        <nav aria-label="On this page" className="hidden flex-col gap-1 @5xl:sticky @5xl:top-4 @5xl:flex">
          <span className="mb-2 text-caption font-semibold uppercase tracking-[0.08em] text-ink-4">On this page</span>
          {sections.map((s) => (
            <NavLink key={s.id} rail href={`#${s.id}`} on={inView === s.id} onClick={() => setInView(s.id)}>
              {s.title}
            </NavLink>
          ))}
        </nav>
      </div>
    );
  }
  if (v === "tabs") {
    return (
      <div ref={root} className={cn(shell, "flex flex-col gap-8")}>
        <Tabs variant="line" label="Sections" value={tab} onValueChange={setTab} items={sections.map((s) => ({ value: s.id, label: s.title }))} />
        {sections.map((s) => (
          <div key={s.id} hidden={s.id !== tab}>
            <Annotated s={s} plain />
          </div>
        ))}
        <div className={cn("grid gap-x-10 border-t border-line pt-6", titleCol)}>
          <span className="hidden @4xl:block" />
          <Actions actions={actions} note={note} />
        </div>
      </div>
    );
  }

  // ---- sequences ----
  if (v === "steps" || v === "steps-side" || v === "question") {
    const last = step >= main.length - 1;
    const next = main[step + 1];
    const side = v === "steps-side";
    const q = v === "question";
    const buttons = (
      <div className={cn("flex flex-wrap items-center gap-3 border-t border-line pt-6", q ? "justify-start" : "justify-end")}>
        {!q && step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => setStep(step - 1)} className="mr-auto">
            Back
          </Button>
        ) : null}
        {last ? (
          actions
        ) : (
          <Button type="button" variant="primary" onClick={() => setStep(step + 1)}>
            {q ? "Continue" : <>Continue to {next?.title}</>}
          </Button>
        )}
      </div>
    );
    if (q) {
      return (
        <div ref={root} className={cn(shell, "flex flex-col gap-8")}>
          <div className="flex items-center gap-4">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className={cn("cursor-pointer rounded-sm text-label text-ink-2 underline underline-offset-4 hover:text-ink", focusRing)}>
                Back
              </button>
            ) : null}
            <span className="text-caption text-ink-3">
              {title ? <>{title} · </> : null}Question {step + 1} of {main.length}
            </span>
          </div>
          <div className="flex max-w-[40rem] flex-col gap-8">
            {main.map((s, i) => (
              <section key={s.id} id={s.id} hidden={i !== step} className="flex flex-col gap-6">
                <Heading s={s} size="lg" />
                <Body s={s} />
              </section>
            ))}
            {buttons}
          </div>
        </div>
      );
    }
    return (
      <div ref={root} className={cn(shell, side ? "grid items-start gap-10 @4xl:grid-cols-[15rem_minmax(0,1fr)]" : "flex flex-col gap-8")}>
        <div className={cn(side && "@4xl:sticky @4xl:top-4", !side && "max-w-[56rem]")}>
          <Stepper orientation={side ? "vertical" : "horizontal"} current={step} onStep={(i) => i <= step && setStep(i)} steps={main.map((s) => ({ title: s.title }))} />
        </div>
        <div className={cn(card, "flex min-w-0 flex-col gap-8 p-6 @4xl:p-8")}>
          {main.map((s, i) => (
            <section key={s.id} id={s.id} hidden={i !== step} className="flex flex-col gap-6">
              <Heading s={s} />
              <Body s={s} />
            </section>
          ))}
          {buttons}
          {note ? <p className="m-0 -mt-4 text-caption text-ink-3">{note}</p> : null}
        </div>
      </div>
    );
  }

  // ---- with context ----
  if (v === "preview") {
    return (
      <div ref={root} className={cn(shell, "grid items-start gap-8 @5xl:grid-cols-[minmax(22rem,26rem)_minmax(0,1fr)]")}>
        <div className="flex min-w-0 flex-col gap-10">
          {main.map((s) => (
            <section key={s.id} id={s.id} className="flex flex-col gap-6 border-t border-line pt-8 first:border-t-0 first:pt-0">
              <Heading s={s} size="sm" />
              <Body s={s} cap={false} />
            </section>
          ))}
          <Actions actions={actions} note={note} className="border-t border-line pt-6" />
        </div>
        <aside className="flex min-h-[28rem] flex-col gap-4 rounded-xl border border-line bg-surface-2 p-6 @5xl:sticky @5xl:top-4 @5xl:p-10">
          {asideTitle ? <span className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-4">{asideTitle}</span> : null}
          <div className="flex flex-1 items-start justify-center">{aside}</div>
        </aside>
      </div>
    );
  }
  // record
  return (
    <div ref={root} className={cn(shell, "grid items-start gap-6 @5xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]")}>
      <div className="flex min-w-0 flex-col gap-6">
        {main.map((s) => (
          <section key={s.id} id={s.id} className={cn(card, "flex scroll-mt-24 flex-col gap-6 p-6")}>
            <div className="flex items-start justify-between gap-4">
              <Heading s={s} />
              {s.actions ? <div className="flex flex-none gap-2">{s.actions}</div> : null}
            </div>
            <Body s={s} />
          </section>
        ))}
        <Actions actions={actions} note={note} />
        {dangerZone}
      </div>
      <aside className="flex flex-col gap-4 @5xl:sticky @5xl:top-4">
        <div className={cn(card, "flex flex-col gap-4 p-5")}>
          {asideTitle ? <span className="text-caption font-semibold uppercase tracking-[0.08em] text-ink-4">{asideTitle}</span> : null}
          {aside}
        </div>
      </aside>
    </div>
  );
}
