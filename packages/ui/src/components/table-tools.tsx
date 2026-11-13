"use client";

// What sits around a table in a business app: acting on many rows, choosing
// columns, saved views, moving items between lists, and trees.

import { useEffect, useMemo, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { Button } from "./button";
import { ArrowDownGlyph, ArrowUpGlyph, CheckGlyph, ChevronRightGlyph, CloseGlyph, SearchGlyph } from "./icons";
import { Menu } from "./menu";
import { Popover } from "./popover";

/* ---------- BulkActionBar ---------- */

export interface BulkActionBarProps {
  /** Rows selected. Hidden at 0. */
  count: number;
  /** All rows across every page, for "Select all 1,240". */
  total?: number;
  /** Called to select every row across pages. */
  onSelectAll?: () => void;
  /** Clears the selection. */
  onClear: () => void;
  /** What can be done to them: Buttons (size sm). Put the destructive one last. */
  children: React.ReactNode;
  /** bar: replaces the table's toolbar. floating: a dark bar floating at the bottom of the screen. */
  variant?: "bar" | "floating";
  /** The thing's name, for "3 orders selected". */
  noun?: [string, string];
  className?: string;
}

/** When rows are selected, what can be done to all of them at once, with how many and a way out. */
export function BulkActionBar({ count, total, onSelectAll, onClear, children, variant = "bar", noun = ["item", "items"], className }: BulkActionBarProps) {
  if (!count) return null;
  const words = (
    <span className="flex items-center gap-2 text-label">
      <span className="font-semibold tabular-nums">
        {count.toLocaleString()} {count === 1 ? noun[0] : noun[1]} selected
      </span>
      {total && onSelectAll && count < total ? (
        <button type="button" onClick={onSelectAll} className={cn("cursor-pointer rounded-sm font-medium underline underline-offset-2 opacity-80 hover:opacity-100", focusRing)}>
          Select all {total.toLocaleString()}
        </button>
      ) : null}
    </span>
  );
  if (variant === "floating") {
    return (
      <div role="toolbar" aria-label="Selected rows" className={cn("fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 animate-rise items-center gap-3 rounded-xl bg-ink py-2 pl-4 pr-2 text-ground shadow-3", "[&_button]:text-ground [&_.bg-surface]:bg-transparent [&_.bg-surface]:border-ground/25 [&_.bg-surface:hover]:bg-ground/10", className)}>
        {words}
        <span className="h-5 w-px bg-ground/20" />
        <div className="flex items-center gap-1.5">{children}</div>
        <Button variant="ghost" size="sm" aria-label="Clear selection" icon={<CloseGlyph size={13} />} onClick={onClear} className="hover:enabled:bg-ground/10" />
      </div>
    );
  }
  return (
    <div role="toolbar" aria-label="Selected rows" className={cn("flex min-h-10 animate-fade-in flex-wrap items-center gap-3 rounded-lg border border-brand/40 bg-brand-soft px-3 py-1.5 text-ink", className)}>
      {words}
      <div className="flex flex-1 flex-wrap items-center gap-1.5">{children}</div>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}

/* ---------- ColumnSettings ---------- */

export interface ColumnSetting {
  id: string;
  label: string;
  visible: boolean;
  /** Can't be hidden: the row's name. */
  locked?: boolean;
}

export interface ColumnSettingsProps {
  columns: ColumnSetting[];
  /** Called with the columns in their new order and visibility. */
  onChange: (columns: ColumnSetting[]) => void;
  /** The row height, when the table offers it. */
  density?: "compact" | "default" | "comfortable";
  onDensityChange?: (density: "compact" | "default" | "comfortable") => void;
  /** Puts the columns back as they came. */
  onReset?: () => void;
  className?: string;
}

/** Which columns a table shows and in what order, and how tall its rows are; a button that opens the choices. */
export function ColumnSettings({ columns, onChange, density, onDensityChange, onReset, className }: ColumnSettingsProps) {
  const move = (i: number, d: -1 | 1) => {
    const next = [...columns];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  const shownCount = columns.filter((c) => c.visible).length;
  return (
    <Popover
      className={className}
      align="end"
      label="Columns"
      panelClassName="w-64 p-0"
      trigger={
        <Button
          size="sm"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16M15 4v16" />
            </svg>
          }
        >
          Columns
        </Button>
      }
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <span className="text-label font-semibold text-ink">
            Columns <span className="font-normal text-ink-3">{shownCount}/{columns.length}</span>
          </span>
          {onReset ? (
            <button type="button" onClick={onReset} className={cn("cursor-pointer rounded-sm text-small text-ink-3 hover:text-ink", focusRing)}>
              Reset
            </button>
          ) : null}
        </div>
        <ul className="m-0 flex max-h-72 list-none flex-col overflow-y-auto p-1">
          {columns.map((c, i) => (
            <li key={c.id} className="group flex items-center gap-1 rounded-md pr-1 hover:bg-surface-2">
              <label className={cn("flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5 text-label", c.locked ? "cursor-not-allowed text-ink-3" : "cursor-pointer text-ink")}>
                <input type="checkbox" checked={c.visible} disabled={c.locked} onChange={() => onChange(columns.map((x) => (x.id === c.id ? { ...x, visible: !x.visible } : x)))} className="size-3.5 accent-[var(--color-brand)]" />
                <span className="truncate">{c.label}</span>
              </label>
              <span className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <button type="button" aria-label={`Move ${c.label} up`} disabled={i === 0} onClick={() => move(i, -1)} className={cn("grid size-6 cursor-pointer place-items-center rounded-sm text-ink-3 hover:text-ink disabled:opacity-30", focusRing)}>
                  <ArrowUpGlyph size={12} />
                </button>
                <button type="button" aria-label={`Move ${c.label} down`} disabled={i === columns.length - 1} onClick={() => move(i, 1)} className={cn("grid size-6 cursor-pointer place-items-center rounded-sm text-ink-3 hover:text-ink disabled:opacity-30", focusRing)}>
                  <ArrowDownGlyph size={12} />
                </button>
              </span>
            </li>
          ))}
        </ul>
        {density && onDensityChange ? (
          <div className="flex flex-col gap-1.5 border-t border-line p-3">
            <span className="text-caption font-medium text-ink-3">Row height</span>
            <div role="radiogroup" aria-label="Row height" className="grid grid-cols-3 gap-1 rounded-md bg-surface-2 p-0.5">
              {(["compact", "default", "comfortable"] as const).map((d) => (
                <button key={d} type="button" role="radio" aria-checked={density === d} onClick={() => onDensityChange(d)} className={cn("cursor-pointer rounded-sm py-1 text-caption capitalize", density === d ? "bg-surface font-medium text-ink shadow-1" : "text-ink-3 hover:text-ink", focusRing)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Popover>
  );
}

/* ---------- SavedViews ---------- */

export interface SavedView {
  id: string;
  name: string;
  /** Shared with the team, not just theirs. */
  shared?: boolean;
  /** Opens first. */
  isDefault?: boolean;
  /** Built in, can't be renamed or deleted: "All orders". */
  system?: boolean;
}

export interface SavedViewsProps {
  views: SavedView[];
  current: string;
  onSelect: (id: string) => void;
  /** The current filters differ from the view: shows "Edited" and Save. */
  dirty?: boolean;
  /** Saves the changes into the current view. */
  onSave?: () => void;
  /** Saves them as a new view, with the name typed. */
  onSaveAs?: (name: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  className?: string;
}

/** Named sets of filters, sort and columns over a table, as tabs: "Open orders", "Overdue", "My accounts". */
export function SavedViews({ views, current, onSelect, dirty, onSave, onSaveAs, onRename, onDelete, onSetDefault, className }: SavedViewsProps) {
  const [naming, setNaming] = useState<null | { id?: string; name: string }>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), [naming?.id, naming === null]);
  const cur = views.find((v) => v.id === current);
  const finish = () => {
    if (!naming?.name.trim()) return setNaming(null);
    if (naming.id) onRename?.(naming.id, naming.name.trim());
    else onSaveAs?.(naming.name.trim());
    setNaming(null);
  };
  return (
    <div className={cn("flex items-center gap-1 border-b border-line", className)}>
      <div role="tablist" aria-label="Views" className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
        {views.map((v) => {
          const on = v.id === current;
          if (naming?.id === v.id)
            return <input key={v.id} ref={input} value={naming.name} onChange={(e) => setNaming({ ...naming, name: e.target.value })} onBlur={finish} onKeyDown={(e) => (e.key === "Enter" ? finish() : e.key === "Escape" && setNaming(null))} aria-label="View name" className="h-8 w-36 rounded-md border border-focus bg-surface px-2 text-label text-ink outline-none" />;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onSelect(v.id)}
              onDoubleClick={() => !v.system && onRename && setNaming({ id: v.id, name: v.name })}
              className={cn("relative flex h-9 flex-none cursor-pointer items-center gap-1.5 whitespace-nowrap px-2.5 text-label", on ? "font-medium text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-ink" : "text-ink-3 hover:text-ink", focusRing)}
            >
              {v.name}
              {v.shared ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-label="Shared" className="text-ink-4">
                  <circle cx="9" cy="8" r="3.5" />
                  <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
                </svg>
              ) : null}
              {v.isDefault ? <span className="rounded-sm bg-surface-2 px-1 text-[10px] font-medium text-ink-3">Default</span> : null}
            </button>
          );
        })}
        {naming && !naming.id ? <input ref={input} value={naming.name} placeholder="View name" onChange={(e) => setNaming({ name: e.target.value })} onBlur={finish} onKeyDown={(e) => (e.key === "Enter" ? finish() : e.key === "Escape" && setNaming(null))} aria-label="New view name" className="h-8 w-36 rounded-md border border-focus bg-surface px-2 text-label text-ink outline-none placeholder:text-ink-4" /> : null}
      </div>
      <div className="ml-auto flex flex-none items-center gap-1.5 pb-1">
        {dirty ? <span className="text-caption text-ink-3">Edited</span> : null}
        {dirty && onSave && !cur?.system ? (
          <Button size="sm" variant="primary" onClick={onSave}>
            Save view
          </Button>
        ) : null}
        <Menu
          label="View options"
          trigger={<Button size="sm" variant="ghost" aria-label="View options" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>} />}
          items={[
            ...(onSaveAs ? [{ label: "Save as new view", onSelect: () => setNaming({ name: "" }) }] : []),
            ...(onRename && cur && !cur.system ? [{ label: "Rename", onSelect: () => setNaming({ id: cur.id, name: cur.name }) }] : []),
            ...(onSetDefault && cur && !cur.isDefault ? [{ label: "Open this view first", onSelect: () => onSetDefault(cur.id) }] : []),
            ...(onDelete && cur && !cur.system ? [{ label: "Delete view", danger: true, separated: true, onSelect: () => onDelete(cur.id) }] : []),
          ]}
        />
      </div>
    </div>
  );
}

/* ---------- TransferList ---------- */

export interface TransferItem {
  id: string;
  label: string;
  description?: string;
}

export interface TransferListProps {
  items: TransferItem[];
  /** The ids on the right. */
  value: string[];
  onChange: (ids: string[]) => void;
  /** The two lists' names: ["Available", "Selected"]. */
  titles?: [string, string];
  className?: string;
}

/** Two lists with buttons between: move permissions, fields or people from what's available to what's chosen. */
export function TransferList({ items, value, onChange, titles = ["Available", "Selected"], className }: TransferListProps) {
  const [checked, setChecked] = useState<string[]>([]);
  const [q, setQ] = useState<[string, string]>(["", ""]);
  const left = items.filter((i) => !value.includes(i.id));
  const right = value.map((id) => items.find((i) => i.id === id)).filter(Boolean) as TransferItem[];
  const move = (ids: string[], to: "right" | "left") => {
    onChange(to === "right" ? [...value, ...ids.filter((id) => !value.includes(id))] : value.filter((id) => !ids.includes(id)));
    setChecked((c) => c.filter((id) => !ids.includes(id)));
  };
  const list = (side: 0 | 1, all: TransferItem[]) => {
    const shown = all.filter((i) => i.label.toLowerCase().includes(q[side].toLowerCase()));
    const picked = shown.filter((i) => checked.includes(i.id)).map((i) => i.id);
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-label font-semibold text-ink">
            <input
              type="checkbox"
              checked={shown.length > 0 && picked.length === shown.length}
              ref={(el) => {
                if (el) el.indeterminate = picked.length > 0 && picked.length < shown.length;
              }}
              onChange={(e) => setChecked((c) => (e.target.checked ? [...new Set([...c, ...shown.map((i) => i.id)])] : c.filter((id) => !shown.some((i) => i.id === id))))}
              className="size-3.5 accent-[var(--color-brand)]"
            />
            {titles[side]}
          </label>
          <span className="text-caption tabular-nums text-ink-3">
            {picked.length}/{all.length}
          </span>
        </div>
        <label className="flex items-center gap-2 border-b border-line px-3 text-ink-3">
          <SearchGlyph size={13} />
          <input value={q[side]} onChange={(e) => setQ((x) => (side === 0 ? [e.target.value, x[1]] : [x[0], e.target.value]))} placeholder="Search" aria-label={`Search ${titles[side]}`} className="h-8 min-w-0 flex-1 bg-transparent text-small text-ink outline-none placeholder:text-ink-4" />
        </label>
        <ul className="m-0 h-56 list-none overflow-y-auto p-1">
          {shown.map((i) => (
            <li key={i.id}>
              <label onDoubleClick={() => move([i.id], side === 0 ? "right" : "left")} className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface-2">
                <input type="checkbox" checked={checked.includes(i.id)} onChange={() => setChecked((c) => (c.includes(i.id) ? c.filter((x) => x !== i.id) : [...c, i.id]))} className="mt-0.5 size-3.5 accent-[var(--color-brand)]" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-label text-ink">{i.label}</span>
                  {i.description ? <span className="truncate text-caption text-ink-3">{i.description}</span> : null}
                </span>
              </label>
            </li>
          ))}
          {!shown.length ? <li className="px-2 py-6 text-center text-small text-ink-4">Nothing here</li> : null}
        </ul>
      </div>
    );
  };
  const pickedLeft = left.filter((i) => checked.includes(i.id)).map((i) => i.id);
  const pickedRight = right.filter((i) => checked.includes(i.id)).map((i) => i.id);
  return (
    <div className={cn("flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center", className)}>
      {list(0, left)}
      <div className="flex flex-row justify-center gap-1.5 sm:flex-col">
        <Button size="sm" aria-label="Move selected right" disabled={!pickedLeft.length} onClick={() => move(pickedLeft, "right")} icon={<ChevronRightGlyph size={14} className="max-sm:rotate-90" />} />
        <Button size="sm" aria-label="Move selected left" disabled={!pickedRight.length} onClick={() => move(pickedRight, "left")} icon={<ChevronRightGlyph size={14} className="rotate-180 max-sm:-rotate-90" />} />
      </div>
      {list(1, right)}
    </div>
  );
}

/* ---------- TreeView ---------- */

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** A count or status at the right. */
  meta?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  /** The highlighted node: a folder, a team, a category. */
  selected?: string;
  onSelect?: (id: string) => void;
  /** Checkboxes, with parents part-checked when some children are. */
  checkable?: boolean;
  checked?: string[];
  onCheckedChange?: (ids: string[]) => void;
  /** Open at first; the first level when not given. */
  defaultExpanded?: string[];
  /** Read by screen readers: "Departments". */
  label?: string;
  className?: string;
}

/** Nested things to browse or pick: departments, categories, folders, accounts. Arrow keys move and open. */
export function TreeView({ nodes, selected, onSelect, checkable, checked = [], onCheckedChange, defaultExpanded, label, className }: TreeViewProps) {
  const [open, setOpen] = useState<string[]>(defaultExpanded ?? nodes.filter((n) => n.children).map((n) => n.id));
  const [focus, setFocus] = useState<string | undefined>(selected ?? nodes[0]?.id);
  const leaves = (n: TreeNode): string[] => (n.children?.length ? n.children.flatMap(leaves) : [n.id]);
  const parents = useMemo(() => {
    const m = new Map<string, string>();
    const walk = (ns: TreeNode[], p?: string) => ns.forEach((n) => (p && m.set(n.id, p), n.children && walk(n.children, n.id)));
    walk(nodes);
    return m;
  }, [nodes]);
  const visible = useMemo(() => {
    const out: TreeNode[] = [];
    const walk = (ns: TreeNode[]) => ns.forEach((n) => (out.push(n), n.children && open.includes(n.id) && walk(n.children)));
    walk(nodes);
    return out;
  }, [nodes, open]);
  const state = (n: TreeNode) => {
    const l = leaves(n);
    const c = l.filter((id) => checked.includes(id)).length;
    return c === 0 ? false : c === l.length ? true : "mixed";
  };
  const toggleCheck = (n: TreeNode) => {
    const l = leaves(n);
    const on = state(n) !== true;
    onCheckedChange?.(on ? [...new Set([...checked, ...l])] : checked.filter((id) => !l.includes(id)));
  };
  const key = (e: React.KeyboardEvent, n: TreeNode) => {
    const i = visible.findIndex((v) => v.id === n.id);
    const go = (id?: string) => {
      if (!id) return;
      setFocus(id);
      (e.currentTarget.closest('[role="tree"]')?.querySelector(`[data-id="${CSS.escape(id)}"]`) as HTMLElement | null)?.focus();
    };
    if (e.key === "ArrowDown") (e.preventDefault(), go(visible[i + 1]?.id));
    else if (e.key === "ArrowUp") (e.preventDefault(), go(visible[i - 1]?.id));
    else if (e.key === "ArrowRight" && n.children) (e.preventDefault(), open.includes(n.id) ? go(n.children[0]?.id) : setOpen((o) => [...o, n.id]));
    else if (e.key === "ArrowLeft") (e.preventDefault(), n.children && open.includes(n.id) ? setOpen((o) => o.filter((x) => x !== n.id)) : go(parents.get(n.id)));
    else if (e.key === " " && checkable) (e.preventDefault(), toggleCheck(n));
    else if (e.key === "Enter") onSelect?.(n.id);
  };
  const render = (ns: TreeNode[], depth: number): React.ReactNode =>
    ns.map((n) => {
      const isOpen = open.includes(n.id);
      const st = checkable ? state(n) : false;
      return (
        <li key={n.id} role="treeitem" aria-expanded={n.children ? isOpen : undefined} aria-selected={selected === n.id} aria-checked={checkable ? st : undefined} aria-disabled={n.disabled || undefined}>
          <div
            data-id={n.id}
            tabIndex={focus === n.id ? 0 : -1}
            onKeyDown={(e) => key(e, n)}
            onFocus={() => setFocus(n.id)}
            onClick={() => !n.disabled && (onSelect?.(n.id), n.children && !onSelect && setOpen((o) => (o.includes(n.id) ? o.filter((x) => x !== n.id) : [...o, n.id])))}
            style={{ paddingLeft: 6 + depth * 18 }}
            className={cn("flex h-8 cursor-pointer items-center gap-1.5 rounded-md pr-2 text-label outline-none focus-visible:ring-2 focus-visible:ring-focus", selected === n.id ? "bg-brand-soft font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink", n.disabled && "cursor-not-allowed opacity-50")}
          >
            {n.children ? (
              <button type="button" tabIndex={-1} aria-label={isOpen ? "Close" : "Open"} onClick={(e) => (e.stopPropagation(), setOpen((o) => (o.includes(n.id) ? o.filter((x) => x !== n.id) : [...o, n.id])))} className="grid size-5 flex-none cursor-pointer place-items-center rounded-sm text-ink-4 hover:text-ink">
                <ChevronRightGlyph size={12} className={cn("transition-transform", isOpen && "rotate-90")} />
              </button>
            ) : (
              <span className="w-5 flex-none" />
            )}
            {checkable ? (
              <span
                role="presentation"
                onClick={(e) => (e.stopPropagation(), !n.disabled && toggleCheck(n))}
                className={cn("grid size-4 flex-none place-items-center rounded-[4px] border", st ? "border-brand bg-brand text-brand-ink" : "border-line-strong bg-surface")}
              >
                {st === true ? <CheckGlyph size={11} /> : st === "mixed" ? <span className="h-0.5 w-2 rounded-full bg-current" /> : null}
              </span>
            ) : null}
            {n.icon ? <span className="flex-none text-ink-3 [&>svg]:size-4">{n.icon}</span> : null}
            <span className="min-w-0 flex-1 truncate">{n.label}</span>
            {n.meta ? <span className="flex-none text-caption text-ink-3">{n.meta}</span> : null}
          </div>
          {n.children && isOpen ? (
            <ul role="group" className="m-0 list-none p-0">
              {render(n.children, depth + 1)}
            </ul>
          ) : null}
        </li>
      );
    });
  return (
    <ul role="tree" aria-label={label} aria-multiselectable={checkable || undefined} className={cn("m-0 flex list-none flex-col p-0", className)}>
      {render(nodes, 0)}
    </ul>
  );
}
