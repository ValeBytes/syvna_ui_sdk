"use client";

// Running a business account: notifications, the audit log, roles and
// permissions, inviting people, usage and the plan, getting set up, saving
// changes, deleting with care, and approvals.

import { useEffect, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { RelativeTime } from "./basics";
import { Button } from "./button";
import { Avatar } from "./display";
import { TagInput } from "./fields-more";
import { CheckGlyph, ChevronRightGlyph, CircleCheckGlyph, CircleGlyph, CircleXGlyph, CloseGlyph } from "./icons";
import { Input } from "./inputs";
import { Dialog } from "./overlays";
import { floatingPanel, useDismiss } from "./popover";

/* ---------- NotificationCenter ---------- */

export interface AppNotification {
  id: string;
  /** Who or what it's about: a person's name for their avatar. */
  actor?: string;
  /** "Amara approved your expense report." */
  title: React.ReactNode;
  /** A line more: the report's name, the amount. */
  body?: React.ReactNode;
  date: Date | string;
  read?: boolean;
  /** Opens what it's about. */
  href?: string;
  /** An icon in place of the avatar: for system notices. */
  icon?: React.ReactNode;
}

export interface NotificationCenterProps {
  notifications: AppNotification[];
  onRead?: (id: string) => void;
  onReadAll?: () => void;
  /** Opens the full list or the settings. */
  footer?: React.ReactNode;
  /** Filters at the top: All and Unread by default. */
  tabs?: boolean;
  className?: string;
}

/** The bell: how many are unread, and a list of what happened, grouped by Today and Earlier, with Mark all as read. */
export function NotificationCenter({ notifications, onRead, onReadAll, footer, tabs = true, className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  const unread = notifications.filter((n) => !n.read).length;
  const list = unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  const today = new Date().toDateString();
  const groups = [
    { label: "Today", items: list.filter((n) => new Date(n.date).toDateString() === today) },
    { label: "Earlier", items: list.filter((n) => new Date(n.date).toDateString() !== today) },
  ].filter((g) => g.items.length);
  return (
    <div ref={box} className={cn("relative", className)}>
      <Button
        variant="ghost"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="relative"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        }
      />
      {unread ? <span className="pointer-events-none absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold tabular-nums text-danger-ink ring-2 ring-surface">{unread > 99 ? "99+" : unread}</span> : null}
      {open ? (
        <div role="dialog" aria-label="Notifications" className={cn("absolute right-0 top-full mt-1.5 flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden", floatingPanel)}>
          <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
            <span className="text-label font-semibold text-ink">Notifications</span>
            {unread && onReadAll ? (
              <button type="button" onClick={onReadAll} className={cn("cursor-pointer rounded-sm text-small text-ink-3 hover:text-ink", focusRing)}>
                Mark all as read
              </button>
            ) : null}
          </div>
          {tabs ? (
            <div role="tablist" className="flex gap-1 border-b border-line px-2 py-1.5">
              {[false, true].map((u) => (
                <button key={String(u)} type="button" role="tab" aria-selected={unreadOnly === u} onClick={() => setUnreadOnly(u)} className={cn("cursor-pointer rounded-md px-2.5 py-1 text-small", unreadOnly === u ? "bg-surface-2 font-medium text-ink" : "text-ink-3 hover:text-ink", focusRing)}>
                  {u ? `Unread${unread ? ` (${unread})` : ""}` : "All"}
                </button>
              ))}
            </div>
          ) : null}
          <div className="max-h-[420px] overflow-y-auto">
            {groups.length ? (
              groups.map((g) => (
                <div key={g.label}>
                  <p className="m-0 px-3.5 pb-1 pt-3 text-caption font-medium text-ink-3">{g.label}</p>
                  <ul className="m-0 list-none p-1 pt-0">
                    {g.items.map((n) => {
                      const Row = n.href ? "a" : "button";
                      return (
                        <li key={n.id}>
                          <Row
                            {...(n.href ? { href: n.href } : { type: "button" as const })}
                            onClick={() => !n.read && onRead?.(n.id)}
                            className={cn("flex w-full cursor-pointer items-start gap-3 rounded-md px-2.5 py-2.5 text-left no-underline hover:bg-surface-2", focusRing)}
                          >
                            {n.icon ? <span className="grid size-8 flex-none place-items-center rounded-full bg-surface-2 text-ink-3 [&>svg]:size-4">{n.icon}</span> : n.actor ? <Avatar name={n.actor} size="md" /> : null}
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className={cn("text-body", n.read ? "text-ink-2" : "text-ink")}>{n.title}</span>
                              {n.body ? <span className="truncate text-small text-ink-3">{n.body}</span> : null}
                              <RelativeTime date={n.date} className="text-caption text-ink-4" />
                            </span>
                            {!n.read ? <span aria-label="Unread" className="mt-2 size-2 flex-none rounded-full bg-brand" /> : null}
                          </Row>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <p className="m-0 px-4 py-10 text-center text-body text-ink-3">{unreadOnly ? "You're all caught up." : "Nothing yet."}</p>
            )}
          </div>
          {footer ? <div className="border-t border-line px-3.5 py-2 text-small">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- AuditLog ---------- */

export interface AuditEvent {
  id: string;
  /** Who did it. */
  actor: string;
  /** What, as a verb phrase: "changed the role of", "deleted". */
  action: string;
  /** To what: "Kenji Watanabe", "Invoice INV-2041". */
  target?: React.ReactNode;
  date: Date | string;
  /** Where from: "Lisbon, PT · 81.2.69.160". */
  context?: React.ReactNode;
  /** What changed: field, before, after. */
  changes?: { field: string; from?: React.ReactNode; to?: React.ReactNode }[];
  /** danger for deletions and security changes. */
  tone?: "default" | "danger";
}

export interface AuditLogProps {
  events: AuditEvent[];
  /** Shown above the list: a FilterBar and an Export button. */
  toolbar?: React.ReactNode;
  className?: string;
}

/** Who did what, to what, and when, with what changed opening under each line: for admins and auditors. */
export function AuditLog({ events, toolbar, className }: AuditLogProps) {
  const [open, setOpen] = useState<string[]>([]);
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {toolbar}
      <ol className="m-0 flex list-none flex-col divide-y divide-line rounded-lg border border-line bg-surface p-0">
        {events.map((e) => {
          const isOpen = open.includes(e.id);
          const has = !!e.changes?.length;
          return (
            <li key={e.id} className="flex flex-col">
              <button
                type="button"
                disabled={!has}
                aria-expanded={has ? isOpen : undefined}
                onClick={() => setOpen((o) => (o.includes(e.id) ? o.filter((x) => x !== e.id) : [...o, e.id]))}
                className={cn("flex items-start gap-3 px-3.5 py-3 text-left enabled:cursor-pointer enabled:hover:bg-surface-2", focusRing)}
              >
                <Avatar name={e.actor} size="sm" className="mt-0.5" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-body text-ink-2">
                    <span className="font-medium text-ink">{e.actor}</span> <span className={e.tone === "danger" ? "text-danger" : undefined}>{e.action}</span> {e.target ? <span className="font-medium text-ink">{e.target}</span> : null}
                  </span>
                  <span className="flex flex-wrap gap-x-2 text-caption text-ink-3">
                    <RelativeTime date={e.date} />
                    {e.context ? <span>· {e.context}</span> : null}
                  </span>
                </span>
                {has ? <ChevronRightGlyph size={13} className={cn("mt-1.5 flex-none text-ink-4 transition-transform", isOpen && "rotate-90")} /> : null}
              </button>
              {has && isOpen ? (
                <div className="px-3.5 pb-3 pl-[52px]">
                  <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-md border border-line text-small">
                    <thead>
                      <tr className="bg-surface-2 text-left text-caption text-ink-3">
                        <th className="px-2.5 py-1.5 font-medium">Field</th>
                        <th className="px-2.5 py-1.5 font-medium">Before</th>
                        <th className="px-2.5 py-1.5 font-medium">After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.changes!.map((c, i) => (
                        <tr key={i}>
                          <td className="border-t border-line px-2.5 py-1.5 font-medium text-ink">{c.field}</td>
                          <td className="border-t border-line px-2.5 py-1.5 text-danger line-through decoration-danger/40">{c.from ?? "–"}</td>
                          <td className="border-t border-line px-2.5 py-1.5 text-success">{c.to ?? "–"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- PermissionMatrix ---------- */

export interface PermissionGroup {
  name: string;
  permissions: { id: string; label: string; description?: string }[];
}

export interface PermissionMatrixProps {
  /** The roles, as columns. Locked roles (Owner) can't be changed. */
  roles: { id: string; name: string; locked?: boolean }[];
  groups: PermissionGroup[];
  /** Which permissions each role has: { admin: ["orders.view", …] }. */
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
  className?: string;
}

function TriBox({ state, onClick, disabled, label }: { state: boolean | "mixed"; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("grid size-[18px] cursor-pointer place-items-center rounded-[4px] border transition-colors disabled:cursor-not-allowed disabled:opacity-50", state ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-surface hover:border-ink-4", focusRing)}
    >
      {state === true ? <CheckGlyph size={12} /> : state === "mixed" ? <span className="h-0.5 w-2 rounded-full bg-current" /> : null}
    </button>
  );
}

/** What each role can do: roles across, permissions down in groups, with a group's box ticking all of it. */
export function PermissionMatrix({ roles, groups, value, onChange, className }: PermissionMatrixProps) {
  const has = (r: string, p: string) => value[r]?.includes(p) ?? false;
  const setMany = (r: string, ids: string[], on: boolean) => onChange({ ...value, [r]: on ? [...new Set([...(value[r] ?? []), ...ids])] : (value[r] ?? []).filter((x) => !ids.includes(x)) });
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-line bg-surface", className)}>
      <table className="w-full min-w-[560px] border-separate border-spacing-0 text-body">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 border-b border-line bg-surface px-4 py-3 text-left text-label font-medium text-ink-3">Permission</th>
            {roles.map((r) => (
              <th key={r.id} className="w-28 border-b border-line px-3 py-3 text-center text-label font-semibold text-ink">
                {r.name}
                {r.locked ? <span className="block text-caption font-normal text-ink-4">Can do everything</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const ids = g.permissions.map((p) => p.id);
            return [
              <tr key={g.name} className="bg-surface-2">
                <th scope="rowgroup" className="sticky left-0 z-10 border-b border-line bg-surface-2 px-4 py-2 text-left text-label font-semibold text-ink">
                  {g.name}
                </th>
                {roles.map((r) => {
                  const n = ids.filter((id) => r.locked || has(r.id, id)).length;
                  const st = n === 0 ? false : n === ids.length ? true : "mixed";
                  return (
                    <td key={r.id} className="border-b border-line px-3 py-2 text-center">
                      <span className="inline-flex">
                        <TriBox state={st} disabled={r.locked} label={`${r.name}: all of ${g.name}`} onClick={() => setMany(r.id, ids, st !== true)} />
                      </span>
                    </td>
                  );
                })}
              </tr>,
              ...g.permissions.map((p) => (
                <tr key={p.id} className="hover:bg-surface-2/50">
                  <th scope="row" className="sticky left-0 z-10 border-b border-line bg-surface px-4 py-2 pl-8 text-left font-normal">
                    <span className="block text-body text-ink">{p.label}</span>
                    {p.description ? <span className="block text-caption text-ink-3">{p.description}</span> : null}
                  </th>
                  {roles.map((r) => (
                    <td key={r.id} className="border-b border-line px-3 py-2 text-center">
                      <span className="inline-flex">
                        <TriBox state={r.locked || has(r.id, p.id)} disabled={r.locked} label={`${r.name}: ${p.label}`} onClick={() => setMany(r.id, [p.id], !has(r.id, p.id))} />
                      </span>
                    </td>
                  ))}
                </tr>
              )),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- InviteMembers ---------- */

export interface PendingInvite {
  email: string;
  role: string;
  sentAt: Date | string;
}

export interface InviteMembersProps {
  /** The roles to invite as. */
  roles: { value: string; label: string; description?: string }[];
  /** Sends the invites: emails and the role. Return a promise to show sending. */
  onInvite: (emails: string[], role: string) => void | Promise<void>;
  /** Invites sent but not accepted. */
  pending?: PendingInvite[];
  onResend?: (email: string) => void;
  onRevoke?: (email: string) => void;
  /** Seats left on the plan: warns before going over. */
  seatsLeft?: number;
  className?: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Invite people by email with a role, and see who hasn't joined yet, with Resend and Revoke. */
export function InviteMembers({ roles, onInvite, pending = [], onResend, onRevoke, seatsLeft, className }: InviteMembersProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState(roles[0]?.value ?? "");
  const [sending, setSending] = useState(false);
  const over = seatsLeft !== undefined && emails.length > seatsLeft;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <TagInput label="Email addresses" placeholder="name@company.com, …" value={emails} onChange={setEmails} validate={(v) => (emailRe.test(v) ? undefined : `"${v}" isn't an email address.`)} className="flex-1" />
        <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)} className="h-8 cursor-pointer rounded-md border border-line-strong bg-surface px-2.5 text-body text-ink shadow-1 outline-none focus:border-focus sm:w-36">
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          loading={sending}
          disabled={!emails.length || over}
          onClick={async () => {
            setSending(true);
            try {
              await onInvite(emails, role);
              setEmails([]);
            } finally {
              setSending(false);
            }
          }}
        >
          {emails.length > 1 ? `Invite ${emails.length}` : "Invite"}
        </Button>
      </div>
      {roles.find((r) => r.value === role)?.description ? <p className="-mt-2 m-0 text-small text-ink-3">{roles.find((r) => r.value === role)!.description}</p> : null}
      {over ? <p className="m-0 text-small text-warning">Your plan has {seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left. Remove some addresses or add seats.</p> : null}
      {pending.length ? (
        <div className="flex flex-col gap-1">
          <span className="text-caption font-medium text-ink-3">Waiting to join · {pending.length}</span>
          <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-lg border border-line p-0">
            {pending.map((p) => (
              <li key={p.email} className="flex items-center gap-3 px-3 py-2">
                <Avatar name={p.email} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body text-ink">{p.email}</span>
                  <span className="text-caption text-ink-3">
                    {roles.find((r) => r.value === p.role)?.label ?? p.role} · sent <RelativeTime date={p.sentAt} />
                  </span>
                </span>
                {onResend ? (
                  <Button size="sm" variant="ghost" onClick={() => onResend(p.email)}>
                    Resend
                  </Button>
                ) : null}
                {onRevoke ? <Button size="sm" variant="ghost" aria-label={`Revoke invite for ${p.email}`} icon={<CloseGlyph size={13} />} onClick={() => onRevoke(p.email)} /> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- UsageMeter ---------- */

export interface UsageMeterProps {
  /** What's counted: "API calls", "Seats", "Storage". */
  label: string;
  used: number;
  limit: number;
  /** Formats the numbers: bytes as GB, and so on. */
  format?: (n: number) => string;
  /** When it resets: "Resets 1 Dec". */
  resets?: React.ReactNode;
  /** Shown near the limit: an Upgrade button. */
  action?: React.ReactNode;
  className?: string;
}

/** How much of a limit is used: amber from 80%, red at 100%, and an Upgrade action when it's close. */
export function UsageMeter({ label, used, limit, format = (n) => n.toLocaleString(), resets, action, className }: UsageMeterProps) {
  const pct = Math.min(100, (used / limit) * 100);
  const level = pct >= 100 ? "danger" : pct >= 80 ? "warning" : "brand";
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-label font-medium text-ink">{label}</span>
        <span className="text-small tabular-nums text-ink-3">
          <span className={cn("font-medium", level === "danger" ? "text-danger" : level === "warning" ? "text-warning" : "text-ink")}>{format(used)}</span> of {format(limit)}
        </span>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used} className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full transition-[width] duration-500", level === "danger" ? "bg-danger" : level === "warning" ? "bg-warning" : "bg-brand")} style={{ width: `${pct}%` }} />
      </div>
      {resets || (action && pct >= 80) ? (
        <div className="flex items-center justify-between gap-3 text-caption text-ink-3">
          <span>{pct >= 100 ? "Limit reached. New requests are paused until it resets." : resets}</span>
          {pct >= 80 ? action : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- PlanSummary ---------- */

export interface PlanSummaryProps {
  /** "Growth". */
  plan: string;
  /** "$29 per seat / month". */
  price: React.ReactNode;
  /** Seats used and paid for. */
  seats?: { used: number; total: number };
  /** "$232 on 1 Dec 2026". */
  nextInvoice?: React.ReactNode;
  /** "Visa ending 4242 · expires 08/28". */
  paymentMethod?: React.ReactNode;
  /** trialing, active, past_due (payment failed), canceled. */
  status?: "trialing" | "active" | "past_due" | "canceled";
  /** Buttons: Change plan, Manage billing. */
  actions?: React.ReactNode;
  className?: string;
}

const planStatus = {
  trialing: ["Trial", "bg-info-soft text-info"],
  active: ["Active", "bg-success-soft text-success"],
  past_due: ["Payment failed", "bg-danger-soft text-danger"],
  canceled: ["Canceled", "bg-surface-2 text-ink-3"],
} as const;

/** The account's plan at a glance: price, seats, the next invoice and how it's paid. */
export function PlanSummary({ plan, price, seats, nextInvoice, paymentMethod, status = "active", actions, className }: PlanSummaryProps) {
  return (
    <div className={cn("flex flex-col gap-5 rounded-lg border border-line bg-surface p-5 shadow-1", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-caption font-medium uppercase tracking-[0.04em] text-ink-3">Current plan</span>
          <span className="flex items-center gap-2">
            <span className="font-display text-heading font-semibold text-ink">{plan}</span>
            <span className={cn("rounded-sm px-1.5 py-0.5 text-caption font-medium", planStatus[status][1])}>{planStatus[status][0]}</span>
          </span>
          <span className="text-body text-ink-2">{price}</span>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <dl className="m-0 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
        {seats ? (
          <div className="flex flex-col gap-1.5">
            <dt className="text-caption text-ink-3">Seats</dt>
            <dd className="m-0 text-body font-medium tabular-nums text-ink">
              {seats.used} of {seats.total} used
            </dd>
            <span className="h-1 overflow-hidden rounded-full bg-surface-2">
              <span className="block h-full bg-brand" style={{ width: `${Math.min(100, (seats.used / seats.total) * 100)}%` }} />
            </span>
          </div>
        ) : null}
        {nextInvoice ? (
          <div className="flex flex-col gap-1.5">
            <dt className="text-caption text-ink-3">Next invoice</dt>
            <dd className="m-0 text-body font-medium text-ink">{nextInvoice}</dd>
          </div>
        ) : null}
        {paymentMethod ? (
          <div className="flex flex-col gap-1.5">
            <dt className="text-caption text-ink-3">Payment method</dt>
            <dd className={cn("m-0 text-body font-medium", status === "past_due" ? "text-danger" : "text-ink")}>{paymentMethod}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

/* ---------- SetupChecklist ---------- */

export interface SetupTask {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  done?: boolean;
  /** The button to do it: "Connect", "Invite". */
  action?: React.ReactNode;
}

export interface SetupChecklistProps {
  title?: React.ReactNode;
  tasks: SetupTask[];
  /** Shows a close button; hide it for good once they're done or not interested. */
  onDismiss?: () => void;
  className?: string;
}

/** Getting a new account going: the steps, how many are done, and the next one open with its button. */
export function SetupChecklist({ title = "Get set up", tasks, onDismiss, className }: SetupChecklistProps) {
  const done = tasks.filter((t) => t.done).length;
  const next = tasks.find((t) => !t.done)?.id;
  const [open, setOpen] = useState<string | undefined>(next);
  useEffect(() => setOpen(next), [next]);
  return (
    <div className={cn("flex flex-col rounded-lg border border-line bg-surface shadow-1", className)}>
      <div className="flex items-start gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-subtitle font-semibold text-ink">{title}</span>
          <span className="flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <span className="block h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${(done / tasks.length) * 100}%` }} />
            </span>
            <span className="text-small tabular-nums text-ink-3">
              {done} of {tasks.length}
            </span>
          </span>
        </div>
        {onDismiss ? <Button size="sm" variant="ghost" aria-label="Hide checklist" icon={<CloseGlyph size={13} />} onClick={onDismiss} /> : null}
      </div>
      <ul className="m-0 flex list-none flex-col border-t border-line p-1.5">
        {tasks.map((t) => {
          const isOpen = open === t.id && !t.done;
          return (
            <li key={t.id} className={cn("rounded-md", isOpen && "bg-surface-2")}>
              <button type="button" onClick={() => setOpen(isOpen ? undefined : t.id)} aria-expanded={isOpen} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-left", focusRing)}>
                {t.done ? <CircleCheckGlyph size={18} className="flex-none text-success" /> : <CircleGlyph size={18} className="flex-none text-ink-4" />}
                <span className={cn("text-body", t.done ? "text-ink-3 line-through decoration-ink-4" : "font-medium text-ink")}>{t.title}</span>
              </button>
              {isOpen && (t.description || t.action) ? (
                <div className="flex flex-col items-start gap-3 px-2.5 pb-3 pl-[42px]">
                  {t.description ? <p className="m-0 text-small text-ink-2">{t.description}</p> : null}
                  {t.action}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- SaveBar ---------- */

export interface SaveBarProps {
  /** There are unsaved changes: the bar shows, and leaving the page asks first. */
  dirty: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  /** "3 unsaved changes". */
  message?: React.ReactNode;
  saving?: boolean;
  /** bottom: floats at the bottom of the screen. inline: sits where it's put, for forms in panels. */
  position?: "bottom" | "inline";
  className?: string;
}

/** Unsaved changes: Save and Discard where they can't be missed, and a warning before leaving the page. */
export function SaveBar({ dirty, onSave, onDiscard, message = "Unsaved changes", saving, position = "bottom", className }: SaveBarProps) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  if (!dirty) return null;
  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className={cn(
        "flex animate-rise items-center gap-3 rounded-xl border border-line bg-surface py-2 pl-4 pr-2 shadow-3",
        position === "bottom" && "fixed bottom-5 left-1/2 z-40 w-[min(560px,calc(100%-2rem))] -translate-x-1/2",
        className,
      )}
    >
      <span className="size-2 flex-none rounded-full bg-warning" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-body font-medium text-ink">{message}</span>
      <Button size="sm" variant="ghost" disabled={saving} onClick={onDiscard}>
        Discard
      </Button>
      <Button size="sm" variant="primary" loading={saving} onClick={() => void onSave()}>
        Save changes
      </Button>
    </div>
  );
}

/* ---------- ConfirmByTyping ---------- */

export interface ConfirmByTypingProps {
  open: boolean;
  onClose: () => void;
  /** "Delete the Casa Verde workspace?". */
  title: React.ReactNode;
  /** What goes with it, as a list: "214 orders", "12 people lose access". */
  consequences?: React.ReactNode[];
  /** What they must type: the workspace's name. */
  confirmText: string;
  /** The button: "Delete workspace". */
  actionLabel: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
}

/** For what can't be undone (a workspace, a project, all data): what will go, and their typing its name to go ahead. */
export function ConfirmByTyping({ open, onClose, title, consequences, confirmText, actionLabel, onConfirm, className }: ConfirmByTypingProps) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);
  const match = typed.trim() === confirmText;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={busy}
      size="sm"
      className={className}
      title={title}
      description="This can't be undone."
      footer={
        <>
          <Button disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!match}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {actionLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {consequences?.length ? (
          <ul className="m-0 flex flex-col gap-1.5 rounded-md bg-danger-soft p-3 pl-7 text-small text-ink">
            {consequences.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : null}
        <label className="flex flex-col gap-1.5">
          <span className="text-small text-ink-2">
            Type <strong className="select-all font-mono text-ink">{confirmText}</strong> to confirm
          </span>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} invalid={!!typed && !match && typed.length >= confirmText.length} />
        </label>
      </div>
    </Dialog>
  );
}

/* ---------- ApprovalCard ---------- */

export interface Approver {
  name: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  at?: Date | string;
}

export interface ApprovalCardProps {
  /** What's asked for: "Refund of $1,240 to Amara Okafor". */
  title: React.ReactNode;
  /** Who asked, and when. */
  requester: string;
  requestedAt: Date | string;
  /** Details: the reason, the amount, a link. */
  children?: React.ReactNode;
  approvers: Approver[];
  /** The viewer can decide: shows Approve and Reject with a comment. */
  onDecide?: (approve: boolean, comment: string) => void | Promise<void>;
  className?: string;
}

/** A request that needs sign-off: what it is, who asked, each approver's answer, and Approve or Reject with a comment. */
export function ApprovalCard({ title, requester, requestedAt, children, approvers, onDecide, className }: ApprovalCardProps) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<null | boolean>(null);
  const rejected = approvers.some((a) => a.status === "rejected");
  const approved = approvers.every((a) => a.status === "approved");
  const state = rejected ? ["Rejected", "bg-danger-soft text-danger"] : approved ? ["Approved", "bg-success-soft text-success"] : ["Waiting", "bg-warning-soft text-warning"];
  const decide = async (yes: boolean) => {
    setBusy(yes);
    try {
      await onDecide?.(yes, comment);
      setComment("");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 shadow-1", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-body font-semibold text-ink">{title}</span>
          <span className="text-small text-ink-3">
            {requester} asked <RelativeTime date={requestedAt} />
          </span>
        </div>
        <span className={cn("flex-none rounded-sm px-1.5 py-0.5 text-caption font-medium", state[1])}>{state[0]}</span>
      </div>
      {children ? <div className="text-body text-ink-2">{children}</div> : null}
      <ol className="m-0 flex list-none flex-col gap-2.5 border-t border-line p-0 pt-4">
        {approvers.map((a) => (
          <li key={a.name} className="flex items-start gap-2.5">
            <span className="relative flex-none">
              <Avatar name={a.name} size="sm" />
              <span className={cn("absolute -bottom-1 -right-1 grid size-3.5 place-items-center rounded-full ring-2 ring-surface", a.status === "approved" ? "bg-success text-white" : a.status === "rejected" ? "bg-danger text-white" : "bg-surface-2 text-ink-4")}>
                {a.status === "approved" ? <CheckGlyph size={9} /> : a.status === "rejected" ? <CloseGlyph size={8} /> : <span className="size-1 rounded-full bg-current" />}
              </span>
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-small text-ink">
                <span className="font-medium">{a.name}</span> <span className="text-ink-3">{a.status === "pending" ? "hasn't answered" : a.status}</span>
                {a.at ? (
                  <span className="text-ink-4">
                    {" "}
                    · <RelativeTime date={a.at} />
                  </span>
                ) : null}
              </span>
              {a.comment ? <span className="mt-0.5 rounded-md bg-surface-2 px-2 py-1 text-small text-ink-2">{a.comment}</span> : null}
            </span>
          </li>
        ))}
      </ol>
      {onDecide && !rejected && !approved ? (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <Input placeholder="Add a comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Comment" />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="danger-soft" loading={busy === false} disabled={busy !== null} icon={<CircleXGlyph size={14} />} onClick={() => void decide(false)}>
              Reject
            </Button>
            <Button size="sm" variant="success" loading={busy === true} disabled={busy !== null} icon={<CheckGlyph size={14} />} onClick={() => void decide(true)}>
              Approve
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
