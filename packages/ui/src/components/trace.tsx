"use client";

// Trace: what an agent is doing, as lines with an icon, a title and a status
// (done, running, pending, error), any of which can open to show more. Plan,
// TaskList, ToolCall, Reasoning and Subagent are traces with a set shape.

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { ChevronRightGlyph, CircleCheckGlyph, CircleDotGlyph, CircleGlyph, CircleXGlyph, SparkGlyph } from "./icons";
import { Spinner } from "./spinner";

export type StepStatus = "done" | "running" | "pending" | "error";

/** The words of a running step shimmer; the class, for your own running text. */
export const shimmerText =
  "bg-[linear-gradient(90deg,var(--color-ink-3)_0%,var(--color-ink-3)_35%,var(--color-ink)_50%,var(--color-ink-3)_65%,var(--color-ink-3)_100%)] bg-[length:250%_100%] bg-clip-text text-transparent animate-text-shimmer motion-reduce:animate-none motion-reduce:text-ink-3";

const Depth = createContext(0);

export interface TraceProps {
  children: React.ReactNode;
  className?: string;
}

/** A list of steps, joined by a thin line down the icons. */
export function Trace({ children, className }: TraceProps) {
  const depth = useContext(Depth);
  return (
    <Depth.Provider value={depth + 1}>
      <ol className={cn("m-0 flex list-none flex-col p-0", depth > 0 && "mt-1 border-l border-line pl-3 [margin-left:9px]", className)}>{children}</ol>
    </Depth.Provider>
  );
}

const statusIcon: Record<StepStatus, React.ReactNode> = {
  done: <CircleCheckGlyph size={15} className="text-success" />,
  running: <Spinner size={13} className="text-brand" />,
  pending: <CircleGlyph size={15} className="text-ink-4" />,
  error: <CircleXGlyph size={15} className="text-danger" />,
};

export interface TraceStepProps {
  /** What the step is: "Read 3 files", "Searched the web". */
  title: React.ReactNode;
  /** A few words after the title: a count, a file, "2.4s". */
  description?: React.ReactNode;
  /** done, running (the title shimmers), pending (greyed), error. */
  status?: StepStatus;
  /** Its own icon in place of the status one; the status still colours the line. */
  icon?: React.ReactNode;
  /** More detail: the step opens to show it. */
  children?: React.ReactNode;
  /** Open at first. Running steps with detail open on their own. */
  defaultOpen?: boolean;
  className?: string;
}

/** One line of a Trace. With children, it opens and closes. */
export function TraceStep({ title, description, status = "done", icon, children, defaultOpen, className }: TraceStepProps) {
  const [open, setOpen] = useState(defaultOpen ?? status === "running");
  const id = useId();
  const wasRunning = useRef(status === "running");
  // A step that finishes closes, unless someone opened it.
  useEffect(() => {
    if (wasRunning.current && status !== "running" && defaultOpen === undefined) setOpen(false);
    if (status === "running" && children) setOpen(true);
    wasRunning.current = status === "running";
  }, [status, defaultOpen, children]);
  const head = (
    <>
      <span className="grid size-[19px] flex-none place-items-center [&>svg]:size-[15px]">{icon ? <span className={cn("grid place-items-center [&>svg]:size-[15px]", status === "pending" ? "text-ink-4" : status === "error" ? "text-danger" : "text-ink-3")}>{icon}</span> : statusIcon[status]}</span>
      <span className={cn("min-w-0 truncate text-label", status === "running" ? cn("font-medium", shimmerText) : status === "pending" ? "text-ink-4" : status === "error" ? "font-medium text-danger" : "font-medium text-ink-2")}>{title}</span>
      {description ? <span className="min-w-0 truncate text-small text-ink-3">{description}</span> : null}
      {children ? <ChevronRightGlyph size={13} className={cn("ml-auto flex-none text-ink-4 transition-transform duration-200", open && "rotate-90")} /> : null}
    </>
  );
  return (
    <li className={cn("flex flex-col", className)}>
      {children ? (
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className={cn("-mx-1 flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-left hover:bg-surface-2", focusRing)}>
          {head}
        </button>
      ) : (
        <div className="flex min-h-7 items-center gap-2 py-0.5">{head}</div>
      )}
      {children ? (
        <div id={id} className={cn("grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="min-w-0 overflow-hidden">
            <div className="pb-1 pl-[27px] pt-0.5 text-body text-ink-2">{children}</div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export interface PlanProps {
  /** "Plan: move invoices to the new tax rules". */
  title: React.ReactNode;
  /** The steps decided up front, each done, running or pending. */
  steps: { title: React.ReactNode; status: StepStatus; description?: React.ReactNode }[];
  defaultOpen?: boolean;
  className?: string;
}

/** The steps an agent decided on before starting, and how far it's got: "2 of 5 done". When steps aren't known up front, TaskList. */
export function Plan({ title, steps, defaultOpen = true, className }: PlanProps) {
  const done = steps.filter((s) => s.status === "done").length;
  const running = steps.some((s) => s.status === "running");
  const failed = steps.some((s) => s.status === "error");
  return (
    <Trace className={className}>
      <TraceStep
        title={title}
        description={`${done} of ${steps.length} done`}
        status={failed ? "error" : running ? "running" : done > 0 ? "done" : "pending"}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="6" cy="19" r="2" />
            <circle cx="18" cy="5" r="2" />
            <path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7" />
          </svg>
        }
        defaultOpen={defaultOpen}
      >
        <Trace>
          {steps.map((s, i) => (
            <TraceStep key={i} title={s.title} description={s.description} status={s.status} />
          ))}
        </Trace>
      </TraceStep>
    </Trace>
  );
}

export interface TaskListProps {
  /** The agent's to-dos, as it writes and ticks them. */
  tasks: { title: React.ReactNode; status: "pending" | "running" | "done" }[];
  className?: string;
}

/** An agent's running to-do list: what's left (the current one shimmering), then what's done, folded. */
export function TaskList({ tasks, className }: TaskListProps) {
  const left = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");
  const list = (ts: typeof tasks) => (
    <Trace>
      {ts.map((t, i) => (
        <TraceStep key={i} title={t.title} status={t.status} icon={t.status === "running" ? <CircleDotGlyph /> : undefined} />
      ))}
    </Trace>
  );
  const listIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18h.01" />
    </svg>
  );
  return (
    <Trace className={className}>
      {left.length ? (
        <TraceStep title={`${left.length} to do`} status={left.some((t) => t.status === "running") ? "running" : "pending"} icon={listIcon} defaultOpen>
          {list(left)}
        </TraceStep>
      ) : null}
      {done.length ? (
        <TraceStep title={`${done.length} done`} status="done" defaultOpen={!left.length}>
          {list(done)}
        </TraceStep>
      ) : null}
    </Trace>
  );
}

export interface ToolCallProps {
  /** The tool, as people say it: "Search orders", "Send email". */
  name: React.ReactNode;
  /** running while it works; done with its output; error with what went wrong. */
  status: StepStatus;
  /** What it was called with: an object, shown as JSON. */
  input?: unknown;
  /** What came back: an object (as JSON) or something to show. */
  output?: unknown;
  /** What went wrong, for status error. */
  error?: React.ReactNode;
  /** How long it took: "1.2s". */
  duration?: React.ReactNode;
  /** An icon for the tool. */
  icon?: React.ReactNode;
  className?: string;
}

function Json({ value, label }: { value: unknown; label: string }) {
  if (value === undefined) return null;
  const isNode = typeof value === "object" && value !== null && "$$typeof" in (value as object);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption font-medium uppercase tracking-[0.04em] text-ink-4">{label}</span>
      {isNode ? (
        (value as React.ReactNode)
      ) : (
        <pre className="m-0 max-h-56 overflow-auto rounded-md border border-line bg-surface-2 p-2.5 font-mono text-[12px] leading-[18px] text-ink-2">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>
      )}
    </div>
  );
}

/** One tool the agent used: its name and status, opening to what it was called with and what came back. */
export function ToolCall({ name, status, input, output, error, duration, icon, className }: ToolCallProps) {
  return (
    <Trace className={className}>
      <TraceStep
        title={name}
        description={status === "running" ? "Working…" : duration}
        status={status}
        icon={
          icon ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14.7 6.3a4 4 0 0 0 5 5l-8.4 8.4a2.1 2.1 0 0 1-3-3z" />
              <path d="M14.7 6.3 17 4l3 3-2.3 2.3" />
            </svg>
          )
        }
      >
        <div className="flex flex-col gap-3">
          <Json value={input} label="Input" />
          {error ? <p className="m-0 rounded-md bg-danger-soft px-2.5 py-2 text-small text-danger">{error}</p> : <Json value={output} label="Output" />}
        </div>
      </TraceStep>
    </Trace>
  );
}

export interface ReasoningProps {
  /** What the model thought, as it streams. */
  children: React.ReactNode;
  /** Still thinking: "Thinking…" shimmers and it stays open. */
  running?: boolean;
  /** Seconds it thought for: "Thought for 6s". */
  seconds?: number;
  className?: string;
}

/** The model's thinking: open while it thinks, then folded to "Thought for 6s". */
export function Reasoning({ children, running, seconds, className }: ReasoningProps) {
  return (
    <Trace className={className}>
      <TraceStep title={running ? "Thinking…" : seconds ? `Thought for ${seconds}s` : "Thought"} status={running ? "running" : "done"} icon={<SparkGlyph />}>
        <div className="whitespace-pre-wrap text-body text-ink-3">{children}</div>
      </TraceStep>
    </Trace>
  );
}

export interface SubagentProps {
  /** The helper's name or job: "Research agent". */
  name: React.ReactNode;
  /** What it was asked to do. */
  task?: React.ReactNode;
  status: StepStatus;
  /** Its picture or icon. */
  avatar?: React.ReactNode;
  /** Its own steps: TraceSteps, ToolCalls. */
  children?: React.ReactNode;
  className?: string;
}

/** Work handed to another agent: its name, its task, and its own steps nested under it. */
export function Subagent({ name, task, status, avatar, children, className }: SubagentProps) {
  return (
    <Trace className={className}>
      <TraceStep
        title={name}
        description={task}
        status={status}
        icon={
          avatar ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="8" width="16" height="12" rx="3" />
              <path d="M12 8V4M9 13h.01M15 13h.01M10 17h4" />
            </svg>
          )
        }
      >
        {children ? <Trace>{children}</Trace> : null}
      </TraceStep>
    </Trace>
  );
}

export interface Source {
  title?: string;
  url: string;
  /** A line from the page. */
  snippet?: string;
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export interface SourcesProps {
  sources: Source[];
  className?: string;
}

/** The pages an answer used, folded into "Used 4 sources" under the reply. */
export function Sources({ sources, className }: SourcesProps) {
  return (
    <Trace className={className}>
      <TraceStep
        title={`Used ${sources.length} source${sources.length === 1 ? "" : "s"}`}
        status="done"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
            <path d="M4 19V5M8 7h6" />
          </svg>
        }
      >
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {sources.map((s, i) => (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noreferrer" className={cn("-mx-1.5 flex flex-col rounded-md px-1.5 py-1 no-underline hover:bg-surface-2", focusRing)}>
                <span className="flex items-center gap-2 text-label font-medium text-ink">
                  <span aria-hidden="true" className="grid size-3.5 flex-none place-items-center rounded-sm bg-surface-2 text-[9px] font-semibold uppercase text-ink-3">
                    {host(s.url)[0]}
                  </span>
                  <span className="truncate">{s.title ?? host(s.url)}</span>
                </span>
                <span className="truncate pl-[22px] text-small text-ink-3">
                  {host(s.url)}
                  {s.snippet ? ` · ${s.snippet}` : ""}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </TraceStep>
    </Trace>
  );
}

export interface InlineCitationProps {
  source: Source;
  /** A number in place of the site's name: [2]. */
  index?: number;
  className?: string;
}

/** A source inside the sentence it supports: the site's name as a small chip; hover or focus it for the page. */
export function InlineCitation({ source, index, className }: InlineCitationProps) {
  const id = useId();
  return (
    <span className={cn("group/cite relative inline-flex align-baseline", className)}>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        aria-describedby={id}
        className={cn("mx-0.5 inline-flex h-[18px] items-center rounded-sm bg-surface-2 px-1.5 text-caption font-medium text-ink-2 no-underline hover:bg-brand-soft hover:text-ink", focusRing)}
      >
        {index !== undefined ? index : host(source.url)}
      </a>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-0 z-40 mb-1.5 flex w-64 flex-col gap-1 rounded-lg border border-line bg-surface p-3 text-left opacity-0 shadow-2 transition-opacity delay-75 group-focus-within/cite:visible group-focus-within/cite:opacity-100 group-hover/cite:visible group-hover/cite:opacity-100"
      >
        <span className="text-label font-medium text-ink">{source.title ?? host(source.url)}</span>
        {source.snippet ? <span className="text-small text-ink-2">{source.snippet}</span> : null}
        <span className="text-caption text-ink-3">{host(source.url)}</span>
      </span>
    </span>
  );
}

export interface CheckpointProps {
  /** What the point is: "Before the tax changes", or a time. */
  label?: React.ReactNode;
  /** Goes back to how things were here. */
  onRestore?: () => void;
  className?: string;
}

/** A point in the conversation to go back to, as a line across with Restore. */
export function Checkpoint({ label = "Checkpoint", onRestore, className }: CheckpointProps) {
  return (
    <div role="separator" className={cn("flex items-center gap-3 py-1 text-small text-ink-3", className)}>
      <span className="h-px flex-1 bg-line" />
      <span className="inline-flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
        </svg>
        {label}
      </span>
      {onRestore ? (
        <button type="button" onClick={onRestore} className={cn("cursor-pointer rounded-sm font-medium text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink", focusRing)}>
          Restore
        </button>
      ) : null}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
