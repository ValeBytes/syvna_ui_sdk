"use client";

// What agents that build things show: code, a terminal, an error's stack, a
// test run, and the files they touched.

import { useState } from "react";

import { cn, focusRing } from "../cx";
import { CopyButton } from "./button";
import { ChevronRightGlyph, CircleCheckGlyph, CircleGlyph, CircleXGlyph, FileGlyphSmall, FolderGlyph } from "./icons";
import { shimmerText } from "./trace";

export interface CodeBlockProps {
  code: string;
  /** Shown in the header: "tsx", "bash", "json". */
  language?: string;
  /** Shown in the header in place of the language: "app/page.tsx". */
  filename?: string;
  /** Line numbers down the left. */
  lineNumbers?: boolean;
  /** Lines to mark, from 1: added or important ones. */
  highlight?: number[];
  /** Taller than this scrolls; "Show all" opens it. */
  maxHeight?: number;
  /** Long lines wrap instead of scrolling sideways. */
  wrap?: boolean;
  className?: string;
}

/** Code to read and copy, with its file name or language and a Copy button. */
export function CodeBlock({ code, language, filename, lineNumbers, highlight = [], maxHeight = 360, wrap, className }: CodeBlockProps) {
  const [all, setAll] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  const long = lines.length * 20 > maxHeight;
  return (
    <figure className={cn("m-0 flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface-2", className)}>
      {language || filename ? (
        <figcaption className="flex h-9 items-center justify-between gap-2 border-b border-line pl-3 pr-1.5">
          <span className="truncate font-mono text-caption text-ink-3">{filename ?? language}</span>
          <CopyButton value={code} size="xs" />
        </figcaption>
      ) : null}
      <div className="relative">
        <pre className={cn("m-0 overflow-auto py-2.5 font-mono text-[12.5px] leading-5 text-ink", wrap && "whitespace-pre-wrap break-words")} style={{ maxHeight: all ? undefined : maxHeight }}>
          <code className="block min-w-fit">
            {lines.map((l, i) => (
              <span key={i} className={cn("flex px-3", highlight.includes(i + 1) && "bg-brand-soft shadow-[inset_2px_0_0_var(--color-brand)]")}>
                {lineNumbers ? <span className="mr-4 inline-block w-6 flex-none select-none text-right text-ink-4">{i + 1}</span> : null}
                <span>{l || " "}</span>
              </span>
            ))}
          </code>
        </pre>
        {!language && !filename ? <CopyButton value={code} size="xs" className="absolute right-1.5 top-1.5 bg-surface-2" /> : null}
        {long && !all ? (
          <button type="button" onClick={() => setAll(true)} className={cn("absolute inset-x-0 bottom-0 flex h-12 cursor-pointer items-end justify-center bg-gradient-to-t from-surface-2 to-transparent pb-2 text-small font-medium text-ink-2 hover:text-ink", focusRing)}>
            Show all {lines.length} lines
          </button>
        ) : null}
      </div>
    </figure>
  );
}

export interface TerminalProps {
  /** The command that was run. */
  command?: string;
  /** What it printed, line by line; lines starting "error" or "warn" are coloured. */
  output: string;
  /** Still running: a shimmering "Running…" at the end. */
  running?: boolean;
  /** The exit code, once done; non-zero shows as failed. */
  exitCode?: number;
  /** Shown in the header: the folder or the machine. */
  title?: string;
  className?: string;
}

/** A command and what it printed, dark like a terminal, in either theme. */
export function Terminal({ command, output, running, exitCode, title = "Terminal", className }: TerminalProps) {
  const lines = output.replace(/\n$/, "").split("\n");
  return (
    <figure className={cn("m-0 flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#141414] text-[#e5e5e5]", className)}>
      <figcaption className="flex h-8 items-center gap-2 border-b border-[#2a2a2a] px-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#3a3a3a]" />
          <span className="size-2.5 rounded-full bg-[#3a3a3a]" />
          <span className="size-2.5 rounded-full bg-[#3a3a3a]" />
        </span>
        <span className="flex-1 truncate text-center font-mono text-caption text-[#8a8a8a]">{title}</span>
        {exitCode !== undefined && !running ? <span className={cn("font-mono text-caption", exitCode === 0 ? "text-[#4ade80]" : "text-[#f87171]")}>exit {exitCode}</span> : null}
        <CopyButton value={`${command ? `$ ${command}\n` : ""}${output}`} size="xs" className="text-[#8a8a8a] hover:enabled:bg-white/10 hover:enabled:text-white" />
      </figcaption>
      <pre className="m-0 max-h-80 overflow-auto p-3 font-mono text-[12.5px] leading-5">
        {command ? (
          <span className="block">
            <span className="select-none text-[#4ade80]">$ </span>
            {command}
          </span>
        ) : null}
        {lines.map((l, i) => (
          <span key={i} className={cn("block", /^\s*(error|err!|fail)/i.test(l) ? "text-[#f87171]" : /^\s*warn/i.test(l) ? "text-[#fbbf24]" : "text-[#d4d4d4]")}>
            {l || " "}
          </span>
        ))}
        {running ? <span className="mt-1 block animate-pulse text-[#8a8a8a]">Running…</span> : null}
      </pre>
    </figure>
  );
}

export interface StackFrame {
  fn?: string;
  file: string;
  line?: number;
  column?: number;
  /** Library code (node_modules), shown greyed and folded. */
  external?: boolean;
}

export interface StackTraceProps {
  /** The error's type: "TypeError". */
  name: string;
  message: string;
  frames: StackFrame[];
  /** Called with a frame to open it in an editor. */
  onOpenFrame?: (frame: StackFrame) => void;
  className?: string;
}

/** An error and where it came from: its message, then the call stack, with library frames folded away. */
export function StackTrace({ name, message, frames, onOpenFrame, className }: StackTraceProps) {
  const [showAll, setShowAll] = useState(false);
  const own = frames.filter((f) => !f.external);
  const shown = showAll ? frames : own;
  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg border border-danger/40 bg-surface", className)}>
      <div className="flex flex-col gap-1 border-b border-line bg-danger-soft px-3.5 py-2.5">
        <span className="font-mono text-label font-semibold text-danger">{name}</span>
        <span className="font-mono text-small text-ink">{message}</span>
      </div>
      <ol className="m-0 flex list-none flex-col p-1.5">
        {shown.map((f, i) => (
          <li key={i}>
            <button
              type="button"
              disabled={!onOpenFrame}
              onClick={() => onOpenFrame?.(f)}
              className={cn("flex w-full items-baseline gap-2 rounded-md px-2 py-1 text-left font-mono text-[12px] leading-5 enabled:cursor-pointer enabled:hover:bg-surface-2", f.external ? "text-ink-4" : "text-ink-2", focusRing)}
            >
              <span className={cn("flex-none", f.external ? "" : "font-medium text-ink")}>{f.fn ?? "<anonymous>"}</span>
              <span className="min-w-0 truncate">
                {f.file}
                {f.line ? `:${f.line}` : ""}
                {f.column ? `:${f.column}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ol>
      {frames.length > own.length ? (
        <button type="button" onClick={() => setShowAll(!showAll)} className={cn("cursor-pointer border-t border-line px-3.5 py-2 text-left text-small text-ink-3 hover:text-ink", focusRing)}>
          {showAll ? "Hide library frames" : `Show ${frames.length - own.length} library frames`}
        </button>
      ) : null}
    </div>
  );
}

export interface TestCase {
  name: string;
  status: "passed" | "failed" | "skipped" | "running";
  /** Milliseconds. */
  duration?: number;
  /** What failed: the assertion, the diff. */
  error?: string;
}

export interface TestResultsProps {
  tests: TestCase[];
  /** The suite or file: "invoices.test.ts". */
  title?: string;
  className?: string;
}

/** A test run: a bar of passed and failed, then each test, failures first and open. */
export function TestResults({ tests, title, className }: TestResultsProps) {
  const count = (s: TestCase["status"]) => tests.filter((t) => t.status === s).length;
  const passed = count("passed");
  const failed = count("failed");
  const skipped = count("skipped");
  const running = count("running");
  const order = { failed: 0, running: 1, passed: 2, skipped: 3 };
  const sorted = [...tests].sort((a, b) => order[a.status] - order[b.status]);
  const [open, setOpen] = useState<string[]>(tests.filter((t) => t.status === "failed").map((t) => t.name));
  return (
    <div className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface", className)}>
      <div className="flex flex-col gap-2 border-b border-line px-3.5 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-label font-semibold text-ink">{title ?? "Tests"}</span>
          <span className="flex gap-3 text-small tabular-nums">
            <span className="text-success">{passed} passed</span>
            {failed ? <span className="text-danger">{failed} failed</span> : null}
            {skipped ? <span className="text-ink-3">{skipped} skipped</span> : null}
            {running ? <span className={shimmerText}>{running} running</span> : null}
          </span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <span className="bg-success" style={{ width: `${(passed / tests.length) * 100}%` }} />
          <span className="bg-danger" style={{ width: `${(failed / tests.length) * 100}%` }} />
          <span className="bg-line-strong" style={{ width: `${(skipped / tests.length) * 100}%` }} />
        </div>
      </div>
      <ul className="m-0 flex max-h-80 list-none flex-col overflow-y-auto p-1.5">
        {sorted.map((t) => {
          const isOpen = open.includes(t.name);
          return (
            <li key={t.name} className="flex flex-col">
              <button
                type="button"
                disabled={!t.error}
                aria-expanded={t.error ? isOpen : undefined}
                onClick={() => setOpen((o) => (o.includes(t.name) ? o.filter((x) => x !== t.name) : [...o, t.name]))}
                className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-left enabled:cursor-pointer enabled:hover:bg-surface-2", focusRing)}
              >
                {t.status === "passed" ? <CircleCheckGlyph size={15} className="flex-none text-success" /> : t.status === "failed" ? <CircleXGlyph size={15} className="flex-none text-danger" /> : <CircleGlyph size={15} className="flex-none text-ink-4" />}
                <span className={cn("min-w-0 flex-1 truncate text-label", t.status === "skipped" ? "text-ink-4" : t.status === "running" ? shimmerText : "text-ink")}>{t.name}</span>
                {t.duration !== undefined ? <span className="text-caption tabular-nums text-ink-4">{t.duration}ms</span> : null}
              </button>
              {t.error && isOpen ? <pre className="m-0 mb-1 ml-8 mr-2 overflow-x-auto rounded-md bg-danger-soft p-2.5 font-mono text-[12px] leading-[18px] text-danger">{t.error}</pre> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export interface FileNode {
  name: string;
  /** A folder's contents. */
  children?: FileNode[];
  /** What happened to it: added (A), modified (M), deleted (D). */
  change?: "added" | "modified" | "deleted";
}

export interface FileTreeProps {
  files: FileNode[];
  /** The path selected: "app/page.tsx". */
  selected?: string;
  /** Called with a file's path when it's clicked. */
  onSelect?: (path: string) => void;
  /** Folders open at first: all of them unless given. */
  defaultOpen?: string[];
  className?: string;
}

const changeMark = { added: ["A", "text-success"], modified: ["M", "text-warning"], deleted: ["D", "text-danger"] } as const;

/** Files and folders, as the agent sees them: what it added, changed or removed is marked. */
export function FileTree({ files, selected, onSelect, defaultOpen, className }: FileTreeProps) {
  const allFolders = (nodes: FileNode[], base = ""): string[] => nodes.flatMap((n) => (n.children ? [base + n.name, ...allFolders(n.children, `${base}${n.name}/`)] : []));
  const [open, setOpen] = useState<string[]>(defaultOpen ?? allFolders(files));
  const render = (nodes: FileNode[], base: string, depth: number): React.ReactNode =>
    [...nodes]
      .sort((a, b) => Number(!!b.children) - Number(!!a.children) || a.name.localeCompare(b.name))
      .map((n) => {
        const path = base + n.name;
        const folder = !!n.children;
        const isOpen = open.includes(path);
        return (
          <li key={path} role="treeitem" aria-expanded={folder ? isOpen : undefined} aria-selected={selected === path}>
            <button
              type="button"
              onClick={() => (folder ? setOpen((o) => (o.includes(path) ? o.filter((x) => x !== path) : [...o, path])) : onSelect?.(path))}
              style={{ paddingLeft: 8 + depth * 14 }}
              className={cn("flex h-7 w-full cursor-pointer items-center gap-1.5 rounded-md pr-2 text-left text-label", selected === path ? "bg-brand-soft text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink", n.change === "deleted" && "line-through opacity-60", focusRing)}
            >
              {folder ? <ChevronRightGlyph size={12} className={cn("flex-none text-ink-4 transition-transform", isOpen && "rotate-90")} /> : <span className="w-3 flex-none" />}
              {folder ? <FolderGlyph size={14} className="flex-none text-ink-3" /> : <FileGlyphSmall size={14} className="flex-none text-ink-3" />}
              <span className="min-w-0 flex-1 truncate">{n.name}</span>
              {n.change ? <span className={cn("font-mono text-caption font-semibold", changeMark[n.change][1])}>{changeMark[n.change][0]}</span> : null}
            </button>
            {folder && isOpen ? (
              <ul role="group" className="m-0 list-none p-0">
                {render(n.children!, `${path}/`, depth + 1)}
              </ul>
            ) : null}
          </li>
        );
      });
  return (
    <ul role="tree" className={cn("m-0 flex list-none flex-col p-1", className)}>
      {render(files, "", 0)}
    </ul>
  );
}
