"use client";

// Chat with an agent: the conversation, each message, the box to write in,
// and what the agent asks back (approval, a question, a choice of designs).

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn, focusRing } from "../cx";
import { Button } from "./button";
import { ArrowDownGlyph, ArrowRightGlyph, CheckGlyph, ChevronDownGlyph, CloseGlyph, CopyGlyph, FileGlyphSmall, RefreshGlyph, StopGlyph, ThumbGlyph } from "./icons";
import { Dialog } from "./overlays";
import { floatingPanel, useDismiss } from "./popover";
import { shimmerText } from "./trace";

/* ---------- Conversation ---------- */

export interface ConversationProps {
  /** The messages. */
  children: React.ReactNode;
  /** Shown when there are no messages yet: a greeting and Suggestions. */
  empty?: React.ReactNode;
  /** Change it (the message count, the streamed length) to keep the view at the bottom as content arrives. */
  follow?: unknown;
  className?: string;
}

/**
 * The scrolling list of messages. It stays at the bottom while replies stream
 * in, unless they've scrolled up to read; then a "Latest" button takes them back.
 */
export function Conversation({ children, empty, follow, className }: ConversationProps) {
  const box = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const stuck = useRef(true);
  const toBottom = useCallback((smooth = false) => box.current?.scrollTo({ top: box.current.scrollHeight, behavior: smooth ? "smooth" : "auto" }), []);
  useLayoutEffect(() => {
    if (stuck.current) toBottom();
  }, [follow, toBottom]);
  const hasContent = Array.isArray(children) ? children.some(Boolean) : !!children;
  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={box}
        role="log"
        aria-live="polite"
        onScroll={(e) => {
          const el = e.currentTarget;
          const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          stuck.current = bottom;
          setAtBottom(bottom);
        }}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:thin]"
      >
        {hasContent ? <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-6">{children}</div> : <div className="m-auto w-full max-w-[640px] px-4 py-10">{empty}</div>}
      </div>
      {!atBottom ? (
        <button
          type="button"
          onClick={() => toBottom(true)}
          className={cn("absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 animate-rise cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-small font-medium text-ink-2 shadow-2 hover:text-ink", focusRing)}
        >
          <ArrowDownGlyph size={13} /> Latest
        </button>
      ) : null}
    </div>
  );
}

/* ---------- Message ---------- */

export interface MessageProps {
  /** user: their words, in a bubble on the right. assistant: the agent's reply, on the page. system: a quiet centred note. */
  role: "user" | "assistant" | "system";
  /** The reply: text, Traces, ToolCalls, Sources. */
  children: React.ReactNode;
  /** The agent's (or person's) picture or mark. */
  avatar?: React.ReactNode;
  /** Who: the agent's name, in teams with several agents. */
  name?: React.ReactNode;
  /** When: "2:14 PM". */
  time?: React.ReactNode;
  /** Under the message: MessageActions. */
  actions?: React.ReactNode;
  /** Files sent with it: Attachments. */
  attachments?: React.ReactNode;
  className?: string;
}

/** One message in a Conversation. */
export function Message({ role, children, avatar, name, time, actions, attachments, className }: MessageProps) {
  if (role === "system") return <p className={cn("m-0 self-center text-center text-small text-ink-3", className)}>{children}</p>;
  if (role === "user") {
    return (
      <div className={cn("group/msg flex flex-col items-end gap-1.5", className)}>
        {attachments ? <div className="flex flex-wrap justify-end gap-1.5">{attachments}</div> : null}
        <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-sm bg-surface-2 px-3.5 py-2 text-body text-ink">{children}</div>
        {time || actions ? (
          <div className="flex items-center gap-2 text-caption text-ink-4 opacity-0 transition-opacity group-hover/msg:opacity-100 group-focus-within/msg:opacity-100">
            {time}
            {actions}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className={cn("group/msg flex gap-3", className)}>
      {avatar ? <div className="mt-0.5 flex-none">{avatar}</div> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {name || time ? (
          <div className="flex items-baseline gap-2">
            {name ? <span className="text-label font-semibold text-ink">{name}</span> : null}
            {time ? <span className="text-caption text-ink-4">{time}</span> : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-3 text-body leading-[22px] text-ink [&_p]:m-0">{children}</div>
        {attachments ? <div className="flex flex-wrap gap-1.5">{attachments}</div> : null}
        {actions}
      </div>
    </div>
  );
}

/* ---------- Pieces of messages ---------- */

export interface ThinkingProps {
  /** What it's doing, shimmering: "Thinking…", "Reading 3 files…". */
  label?: React.ReactNode;
  /** dots: three pulsing dots. text: the label shimmering. */
  variant?: "dots" | "text";
  className?: string;
}

/** The agent is working and nothing's on screen yet. */
export function Thinking({ label = "Thinking…", variant = "text", className }: ThinkingProps) {
  if (variant === "dots") {
    return (
      <span role="status" aria-label={typeof label === "string" ? label : "Thinking"} className={cn("inline-flex items-center gap-1 py-2", className)}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 animate-pulse-dot rounded-full bg-ink-3" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </span>
    );
  }
  return (
    <span role="status" className={cn("text-body font-medium", shimmerText, className)}>
      {label}
    </span>
  );
}

/** A blinking caret at the end of text that's still streaming. */
export function StreamCaret({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-blink bg-ink", className)} />;
}

export interface MessageActionsProps {
  /** The reply's text, for Copy. */
  text?: string;
  /** Asks for the reply again. */
  onRegenerate?: () => void;
  /** Called with true (helpful) or false (not). */
  onFeedback?: (good: boolean) => void;
  /** More buttons. */
  children?: React.ReactNode;
  className?: string;
}

/** Copy, try again, and good or bad, under a reply. */
export function MessageActions({ text, onRegenerate, onFeedback, children, className }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<boolean | null>(null);
  return (
    <div className={cn("-ml-1.5 flex items-center gap-0.5", className)}>
      {text !== undefined ? (
        <Button
          variant="ghost"
          size="xs"
          aria-label={copied ? "Copied" : "Copy"}
          icon={copied ? <CheckGlyph size={14} className="text-success" /> : <CopyGlyph size={14} />}
          onClick={() => {
            void navigator.clipboard?.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        />
      ) : null}
      {onRegenerate ? <Button variant="ghost" size="xs" aria-label="Try again" icon={<RefreshGlyph size={14} />} onClick={onRegenerate} /> : null}
      {onFeedback ? (
        <>
          <Button variant="ghost" size="xs" aria-label="Good reply" aria-pressed={vote === true} className={cn(vote === true && "text-ink")} icon={<ThumbGlyph size={14} />} onClick={() => { setVote(true); onFeedback(true); }} />
          <Button variant="ghost" size="xs" aria-label="Bad reply" aria-pressed={vote === false} className={cn(vote === false && "text-ink")} icon={<ThumbGlyph size={14} className="rotate-180" />} onClick={() => { setVote(false); onFeedback(false); }} />
        </>
      ) : null}
      {children}
    </div>
  );
}

export interface AttachmentProps {
  name: string;
  /** Bytes; shown as "1.2 MB". */
  size?: number;
  /** A preview for pictures. */
  image?: string;
  /** Shows a remove button: in the prompt before sending. */
  onRemove?: () => void;
  className?: string;
}

const bytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);

/** A file sent with a message, as a chip with its name and size. */
export function Attachment({ name, size, image, onRemove, className }: AttachmentProps) {
  return (
    <span className={cn("group/att relative inline-flex h-10 max-w-[220px] items-center gap-2 rounded-lg border border-line bg-surface py-1 pl-1 pr-3 shadow-1", className)}>
      {image ? <img src={image} alt="" className="size-8 flex-none rounded-md object-cover" /> : <span className="grid size-8 flex-none place-items-center rounded-md bg-surface-2 text-ink-3"><FileGlyphSmall size={15} /></span>}
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-small font-medium text-ink">{name}</span>
        {size !== undefined ? <span className="text-caption text-ink-3">{bytes(size)}</span> : null}
      </span>
      {onRemove ? (
        <button type="button" aria-label={`Remove ${name}`} onClick={onRemove} className={cn("absolute -right-1.5 -top-1.5 grid size-5 cursor-pointer place-items-center rounded-full border border-line bg-surface text-ink-3 shadow-1 hover:text-ink", focusRing)}>
          <CloseGlyph size={10} />
        </button>
      ) : null}
    </span>
  );
}

export interface SuggestionsProps {
  /** Things to ask, as people would say them. */
  items: string[];
  onPick: (text: string) => void;
  /** chips: in a row that wraps. list: one per line, with an arrow. */
  variant?: "chips" | "list";
  className?: string;
}

/** Ready-made prompts to start from, or follow-ups after a reply. */
export function Suggestions({ items, onPick, variant = "chips", className }: SuggestionsProps) {
  if (variant === "list") {
    return (
      <ul className={cn("m-0 flex list-none flex-col divide-y divide-line rounded-lg border border-line bg-surface p-0", className)}>
        {items.map((s) => (
          <li key={s}>
            <button type="button" onClick={() => onPick(s)} className={cn("group flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left text-body text-ink-2 hover:bg-surface-2 hover:text-ink", focusRing)}>
              {s}
              <ArrowRightGlyph size={14} className="flex-none text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </button>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((s) => (
        <button key={s} type="button" onClick={() => onPick(s)} className={cn("cursor-pointer rounded-full border border-line bg-surface px-3 py-1.5 text-label text-ink-2 shadow-1 transition-colors hover:border-ink-4 hover:text-ink", focusRing)}>
          {s}
        </button>
      ))}
    </div>
  );
}

/* ---------- PromptInput ---------- */

export interface PromptInputProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Called with the text when Enter (or the send button) is pressed. Shift+Enter makes a new line. */
  onSubmit: (text: string) => void;
  /** streaming: the send button becomes Stop. */
  status?: "ready" | "submitted" | "streaming";
  /** Stops the reply. */
  onStop?: () => void;
  placeholder?: string;
  /** Files waiting to be sent: Attachments with onRemove. */
  attachments?: React.ReactNode;
  /** Called with files picked or dropped; shows the attach button. */
  onFiles?: (files: File[]) => void;
  /** Left of the send button: a ModelSelector, a ContextMeter, toggles. */
  tools?: React.ReactNode;
  /** A line under the box: "The agent can make mistakes. Check important details." */
  footer?: React.ReactNode;
  /** box: a bordered card (the default). flat: no border, for the bottom of a panel. */
  variant?: "box" | "flat";
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/** The box to write to the agent: grows with the text, takes files, Enter sends, Stop while it replies. */
export function PromptInput({
  value,
  onChange,
  onSubmit,
  status = "ready",
  onStop,
  placeholder = "Ask anything…",
  attachments,
  onFiles,
  tools,
  footer,
  variant = "box",
  disabled,
  autoFocus,
  className,
}: PromptInputProps) {
  const [own, setOwn] = useState("");
  const text = value ?? own;
  const set = (v: string) => {
    if (value === undefined) setOwn(v);
    onChange?.(v);
  };
  const area = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const busy = status !== "ready";
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);
  const send = () => {
    if (!text.trim() || busy || disabled) return;
    onSubmit(text.trim());
    set("");
  };
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        onDragOver={(e) => {
          if (!onFiles) return;
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (!onFiles) return;
          e.preventDefault();
          setDrag(false);
          onFiles([...e.dataTransfer.files]);
        }}
        onClick={() => area.current?.focus()}
        className={cn(
          "flex cursor-text flex-col gap-2 p-2.5 transition-[border-color,box-shadow]",
          variant === "box" && "rounded-xl border border-line-strong bg-surface shadow-2 focus-within:border-focus focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-focus)_18%,transparent)]",
          drag && "border-brand bg-brand-soft",
        )}
      >
        {attachments ? <div className="flex flex-wrap gap-2 px-1 pt-1">{attachments}</div> : null}
        <textarea
          ref={area}
          rows={1}
          value={text}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          className="max-h-[220px] min-h-[24px] w-full resize-none bg-transparent px-1.5 py-1 text-body text-ink outline-none! placeholder:text-ink-4"
        />
        <div className="flex items-center gap-1.5">
          {onFiles ? (
            <>
              <input ref={file} type="file" multiple hidden onChange={(e) => { onFiles([...(e.target.files ?? [])]); e.target.value = ""; }} />
              <Button
                variant="ghost"
                size="sm"
                aria-label="Attach files"
                onClick={(e) => { e.stopPropagation(); file.current?.click(); }}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m21 11-8.6 8.6a5.7 5.7 0 0 1-8-8l9.2-9.2a3.8 3.8 0 0 1 5.3 5.3l-9.2 9.2a1.9 1.9 0 0 1-2.7-2.7l8.5-8.5" />
                  </svg>
                }
              />
            </>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-1.5">{tools}</div>
          {status === "streaming" && onStop ? (
            <Button variant="inverse" size="sm" shape="pill" aria-label="Stop" icon={<StopGlyph size={14} />} onClick={(e) => { e.stopPropagation(); onStop(); }} />
          ) : (
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              aria-label="Send"
              loading={status === "submitted"}
              disabled={!text.trim() || disabled}
              icon={<ArrowRightGlyph size={14} className="-rotate-90" />}
              onClick={(e) => { e.stopPropagation(); send(); }}
            />
          )}
        </div>
      </div>
      {footer ? <p className="m-0 text-center text-caption text-ink-4">{footer}</p> : null}
    </div>
  );
}

/* ---------- What the agent asks back ---------- */

export interface ConfirmationProps {
  /** The action, as a question: "Send 214 invoices?". */
  title: React.ReactNode;
  /** What it does and what it touches: "Emails every customer with an open invoice." */
  description?: React.ReactNode;
  /** The exact details: recipients, the command, the amount. */
  details?: React.ReactNode;
  /** An icon for the action. */
  icon?: React.ReactNode;
  /** pending until answered; then approved or rejected, and it says so. */
  state?: "pending" | "approved" | "rejected";
  onApprove?: () => void;
  onReject?: () => void;
  /** The words on the buttons. */
  approveLabel?: string;
  rejectLabel?: string;
  /** danger: the action can't be undone; the approve button is red. */
  tone?: "default" | "danger";
  className?: string;
}

/** The agent asks before doing something that matters: send, pay, delete, publish. */
export function Confirmation({ title, description, details, icon, state = "pending", onApprove, onReject, approveLabel = "Approve", rejectLabel = "Not now", tone = "default", className }: ConfirmationProps) {
  return (
    <div role="group" aria-label="Approval needed" className={cn("flex flex-col gap-3 rounded-lg border bg-surface p-3.5 shadow-1", state === "pending" ? (tone === "danger" ? "border-danger/40" : "border-line-strong") : "border-line", className)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-8 flex-none place-items-center rounded-md [&>svg]:size-4", tone === "danger" ? "bg-danger-soft text-danger" : "bg-brand-soft text-ink")}>
          {icon ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-body font-semibold text-ink">{title}</span>
          {description ? <span className="text-small text-ink-2">{description}</span> : null}
        </div>
      </div>
      {details ? <div className="rounded-md border border-line bg-surface-2 px-3 py-2 text-small text-ink-2 [&_code]:font-mono">{details}</div> : null}
      {state === "pending" ? (
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={onReject}>
            {rejectLabel}
          </Button>
          <Button size="sm" variant={tone === "danger" ? "danger" : "primary"} onClick={onApprove}>
            {approveLabel}
          </Button>
        </div>
      ) : (
        <p className={cn("m-0 inline-flex items-center gap-1.5 text-small font-medium", state === "approved" ? "text-success" : "text-ink-3")}>
          {state === "approved" ? <CheckGlyph size={14} /> : <CloseGlyph size={13} />}
          {state === "approved" ? "Approved" : "Declined"}
        </p>
      )}
    </div>
  );
}

export interface QuestionnaireProps {
  /** What the agent needs to know. */
  question: React.ReactNode;
  /** A line under it: why it's asking. */
  description?: React.ReactNode;
  /** The answers to pick from. */
  options: { value: string; label: React.ReactNode; description?: React.ReactNode }[];
  /** More than one answer. */
  multiple?: boolean;
  /** Adds "Something else" with a text field. */
  allowOther?: boolean;
  /** Called with the values picked (and the typed answer, if any). */
  onSubmit: (values: string[], other?: string) => void;
  /** Once answered, it shows the answer and can't change. */
  answered?: string[];
  className?: string;
}

/** The agent asks a question with set answers before going on: which account, what tone, which of these. */
export function Questionnaire({ question, description, options, multiple, allowOther, onSubmit, answered, className }: QuestionnaireProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const done = !!answered;
  const toggle = (v: string) => setPicked((p) => (multiple ? (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]) : [v]));
  const chosen = answered ?? picked;
  return (
    <fieldset disabled={done} className={cn("m-0 flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-1", className)}>
      <legend className="sr-only">{question}</legend>
      <div className="flex flex-col gap-0.5">
        <span className="text-body font-semibold text-ink">{question}</span>
        {description ? <span className="text-small text-ink-3">{description}</span> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        {options.map((o, i) => {
          const on = chosen.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role={multiple ? "checkbox" : "radio"}
              aria-checked={on}
              onClick={() => toggle(o.value)}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors disabled:cursor-default",
                on ? "border-brand bg-brand-soft" : "border-line hover:border-ink-4",
                done && !on && "opacity-50",
                focusRing,
              )}
            >
              <span className={cn("mt-px grid size-5 flex-none place-items-center rounded-sm border text-caption font-semibold", on ? "border-brand bg-brand text-brand-ink" : "border-line-strong text-ink-3")}>{on ? <CheckGlyph size={12} /> : i + 1}</span>
              <span className="flex flex-col">
                <span className="text-body text-ink">{o.label}</span>
                {o.description ? <span className="text-small text-ink-3">{o.description}</span> : null}
              </span>
            </button>
          );
        })}
        {allowOther && !done ? (
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Something else…"
            aria-label="Something else"
            className="h-9 rounded-md border border-dashed border-line-strong bg-transparent px-3 text-body text-ink outline-none placeholder:text-ink-4 focus:border-solid focus:border-focus"
          />
        ) : null}
      </div>
      {!done ? (
        <div className="flex justify-end">
          <Button size="sm" variant="primary" disabled={!picked.length && !other.trim()} onClick={() => onSubmit(picked, other.trim() || undefined)}>
            Continue
          </Button>
        </div>
      ) : null}
    </fieldset>
  );
}

export interface VariantOption {
  /** Its id: the variant name, "notched". */
  id: string;
  /** What to call it: "Notched label". */
  label: React.ReactNode;
  /** The thing itself, rendered: shown small in the chat and large in the dialog. */
  preview: React.ReactNode;
  /** A line on when to use it, shown in the dialog. */
  note?: React.ReactNode;
}

export interface VariantChooserProps {
  /** What's being chosen: "Pick a look for the email field". */
  title: React.ReactNode;
  options: VariantOption[];
  /** The one in use now, marked "Current". */
  current?: string;
  /** Called with the id picked. */
  onChoose: (id: string) => void;
  /** How many show in the chat before "+N more". */
  visible?: number;
  className?: string;
}

/**
 * When someone isn't happy with a part of their screen, the agent offers other
 * looks for it: small live previews in the chat; Compare opens them large in a
 * dialog to pick from.
 */
export function VariantChooser({ title, options, current, onChoose, visible = 3, className }: VariantChooserProps) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(current ?? options[0]?.id);
  const [chosen, setChosen] = useState<string | null>(null);
  const choose = (id: string) => {
    setChosen(id);
    setOpen(false);
    onChoose(id);
  };
  const shown = options.slice(0, visible);
  const more = options.length - shown.length;
  const tile = (o: VariantOption, big: boolean) => (
    <div className={cn("pointer-events-none grid place-items-center overflow-hidden bg-ground", big ? "min-h-[140px] p-6" : "h-[84px] p-3")} aria-hidden="true" inert>
      <div className={cn("w-full origin-center", big ? "max-w-[360px]" : "max-w-[260px] scale-[0.82]")}>{o.preview}</div>
    </div>
  );
  return (
    <div className={cn("flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-3 shadow-1", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label font-semibold text-ink">{title}</span>
        <Button size="xs" variant="ghost" onClick={() => setOpen(true)} iconRight={<ArrowRightGlyph size={12} />}>
          Compare all {options.length}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 @container sm:grid-cols-3">
        {shown.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => choose(o.id)}
            aria-pressed={chosen === o.id}
            className={cn("group flex cursor-pointer flex-col overflow-hidden rounded-md border text-left transition-colors", chosen === o.id ? "border-brand ring-1 ring-brand" : "border-line hover:border-ink-4", focusRing)}
          >
            {tile(o, false)}
            <span className="flex items-center justify-between gap-2 border-t border-line px-2 py-1.5 text-caption">
              <span className="truncate font-medium text-ink">{o.label}</span>
              {o.id === current ? <span className="text-ink-4">Current</span> : chosen === o.id ? <CheckGlyph size={12} className="text-brand" /> : null}
            </span>
          </button>
        ))}
        {more > 0 ? (
          <button type="button" onClick={() => setOpen(true)} className={cn("grid min-h-[110px] cursor-pointer place-items-center rounded-md border border-dashed border-line-strong text-label font-medium text-ink-2 hover:border-ink-4 hover:text-ink", focusRing)}>
            +{more} more
          </button>
        ) : null}
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={title}
        description="Each one is live: try it, then pick the one you want."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={!focus} onClick={() => focus && choose(focus)}>
              Use this one
            </Button>
          </>
        }
      >
        <div role="radiogroup" aria-label="Looks" className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {options.map((o) => (
            <div
              key={o.id}
              role="radio"
              aria-checked={focus === o.id}
              tabIndex={0}
              onClick={() => setFocus(o.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setFocus(o.id))}
              className={cn("flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-colors", focus === o.id ? "border-brand ring-1 ring-brand" : "border-line hover:border-ink-4", focusRing)}
            >
              <div className="grid min-h-[130px] place-items-center bg-ground p-5" onClick={(e) => e.stopPropagation()}>
                <div className="w-full max-w-[320px]">{o.preview}</div>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-line px-3 py-2.5">
                <span className="flex flex-col">
                  <span className="text-label font-medium text-ink">{o.label}</span>
                  {o.note ? <span className="text-small text-ink-3">{o.note}</span> : null}
                </span>
                {o.id === current ? <span className="flex-none rounded-sm bg-surface-2 px-1.5 py-0.5 text-caption text-ink-3">Current</span> : null}
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}

/* ---------- Model and context ---------- */

export interface ModelOption {
  id: string;
  name: string;
  /** A few words: "Best for long reports". */
  description?: string;
  /** A tag: "Fast", "New". */
  badge?: string;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Which model answers: a small button in the prompt's tools that opens the list. */
export function ModelSelector({ models, value, onChange, className }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  const current = models.find((m) => m.id === value);
  return (
    <div ref={box} className={cn("relative", className)}>
      <Button variant="ghost" size="sm" aria-haspopup="listbox" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }} iconRight={<ChevronDownGlyph size={13} />}>
        {current?.name ?? "Model"}
      </Button>
      {open ? (
        <ul role="listbox" aria-label="Model" className={cn("absolute bottom-full left-0 m-0 mb-1.5 flex w-64 list-none flex-col p-1", floatingPanel)}>
          {models.map((m) => (
            <li key={m.id} role="option" aria-selected={m.id === value}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(m.id);
                  setOpen(false);
                }}
                className={cn("flex w-full cursor-pointer items-start gap-2 rounded-md px-2.5 py-2 text-left hover:bg-surface-2", focusRing)}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-label font-medium text-ink">
                    {m.name}
                    {m.badge ? <span className="rounded-sm bg-brand-soft px-1 text-[10px] font-semibold text-ink-2">{m.badge}</span> : null}
                  </span>
                  {m.description ? <span className="text-caption text-ink-3">{m.description}</span> : null}
                </span>
                {m.id === value ? <CheckGlyph size={14} className="mt-0.5 flex-none text-brand" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export interface ContextMeterProps {
  /** Tokens used so far. */
  used: number;
  /** The model's window. */
  limit: number;
  /** Where they went: { Input: 8420, Output: 1260 }. */
  breakdown?: Record<string, number>;
  className?: string;
}

const k = (n: number) => (n < 1000 ? String(n) : `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`);

/** How full the conversation's context is: a small ring, opening to the numbers. Warns at 80%. */
export function ContextMeter({ used, limit, breakdown, className }: ContextMeterProps) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const tone = pct >= 95 ? "text-danger" : pct >= 80 ? "text-warning" : "text-ink-3";
  const r = 6;
  const c = 2 * Math.PI * r;
  return (
    <span className={cn("group/ctx relative inline-flex", className)}>
      <button type="button" aria-label={`${pct}% of context used`} onClick={(e) => e.stopPropagation()} className={cn("inline-flex h-7 cursor-default items-center gap-1.5 rounded-md px-2 text-caption tabular-nums hover:bg-surface-2", tone, focusRing)}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="-rotate-90">
          <circle cx="8" cy="8" r={r} fill="none" stroke="var(--color-line)" strokeWidth="2.25" />
          <circle cx="8" cy="8" r={r} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
        </svg>
        {pct}%
      </button>
      <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-0 z-40 mb-1.5 flex w-56 flex-col gap-2 rounded-lg border border-line bg-surface p-3 opacity-0 shadow-2 transition-opacity group-focus-within/ctx:visible group-focus-within/ctx:opacity-100 group-hover/ctx:visible group-hover/ctx:opacity-100">
        <span className="flex justify-between text-label">
          <span className="font-medium text-ink">Context</span>
          <span className="text-ink-3 tabular-nums">
            {k(used)} / {k(limit)}
          </span>
        </span>
        <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <span className={cn("block h-full rounded-full", pct >= 95 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-brand")} style={{ width: `${pct}%` }} />
        </span>
        {breakdown
          ? Object.entries(breakdown).map(([label, n]) => (
              <span key={label} className="flex justify-between text-small">
                <span className="text-ink-3">{label}</span>
                <span className="tabular-nums text-ink-2">{k(n)}</span>
              </span>
            ))
          : null}
        {pct >= 80 ? <span className="text-caption text-ink-3">Long conversations get summarised; start a new one for a fresh topic.</span> : null}
      </span>
    </span>
  );
}

/** Seconds since `running` turned true: for "Thought for 6s". */
export function useElapsed(running: boolean) {
  const [s, setS] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    if (!running) return;
    start.current = Date.now();
    const t = setInterval(() => setS(Math.round((Date.now() - (start.current ?? Date.now())) / 1000)), 250);
    return () => clearInterval(t);
  }, [running]);
  return s;
}
