"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Mail } from "lucide-react";
import {
  Attachment,
  Checkpoint,
  CodeBlock,
  Confirmation,
  ContextMeter,
  Conversation,
  FileTree,
  InlineCitation,
  Input,
  Message,
  MessageActions,
  ModelSelector,
  Plan,
  PromptInput,
  Questionnaire,
  Reasoning,
  Sources,
  StackTrace,
  StreamCaret,
  Subagent,
  Suggestions,
  TaskList,
  Terminal,
  TestResults,
  Thinking,
  ToolCall,
  Trace,
  TraceStep,
  VariantChooser,
  cn,
  fieldVariants,
  type StepStatus,
} from "@syvna/ui";

import { bool, jsx, num, raw, str } from "./code";
import type { Doc } from "./types";

const steps = ["Read the 214 open invoices", "Group them by customer", "Draft a reminder for each", "Send after approval"];
const statusAt = (i: number, at: number): StepStatus => (i < at ? "done" : i === at ? "running" : "pending");

/** Runs a counter up to `to`, one step every `ms`, so demos move on their own. */
function useTicker(to: number, ms: number, run = true) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    setN(0);
    const t = setInterval(() => setN((x) => (x >= to ? x : x + 1)), ms);
    return () => clearInterval(t);
  }, [to, ms, run]);
  return n;
}

const AgentMark = () => (
  <span className="grid size-7 place-items-center rounded-full bg-ink text-ground">
    <Bot size={15} />
  </span>
);

const fieldNotes: Record<string, string> = {
  outline: "The default: clear on any background.",
  filled: "A grey fill; good in dense forms.",
  underline: "Only a line: quiet, for long forms.",
  cupertino: "iOS's rounded grey field.",
  pill: "Fully round: search and chat.",
  ghost: "No box until hovered: editing in place.",
  floating: "The label inside, rising as you type.",
  notched: "The label rises onto the border.",
  soft: "A brand tint.",
  inset: "Sunken into the page.",
  elevated: "A shadow instead of a border.",
  bold: "A 2px border that can't be missed.",
  dashed: "For optional or draft values.",
  minimal: "A line only on hover and focus.",
  inline: "The label inside on the left: settings rows.",
};

function fieldOptions() {
  return fieldVariants.map((v) => ({
    id: v,
    label: v[0]!.toUpperCase() + v.slice(1),
    note: fieldNotes[v],
    preview: <Input variant={v} label={v === "floating" || v === "notched" || v === "inline" ? "Email" : undefined} aria-label="Email" placeholder={v === "floating" || v === "notched" ? undefined : "amara@okafor.ng"} />,
  }));
}

/* ---------- The whole conversation, simulated ---------- */

type Turn =
  | { role: "user"; text: string }
  | { role: "agent"; kind: "work"; at: number; reply: string; shown: number; approval: "pending" | "approved" | "rejected" }
  | { role: "agent"; kind: "choose"; chosen?: string };

export function ChatDemo({ className }: { className?: string } = {}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<"ready" | "streaming">("ready");
  const [model, setModel] = useState("balanced");
  const [field, setField] = useState("outline");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    setStatus("ready");
  };
  useEffect(() => () => stop(), []);

  const run = (text: string) => {
    if (/field|input|look|ugly|don.?t like/i.test(text)) {
      setTurns((t) => [...t, { role: "user", text }, { role: "agent", kind: "choose" }]);
      return;
    }
    const reply = "I've drafted 38 reminders, one per customer, grouped from 214 open invoices. They're ready to send once you approve.";
    setTurns((t) => [...t, { role: "user", text }, { role: "agent", kind: "work", at: 0, reply, shown: 0, approval: "pending" }]);
    setStatus("streaming");
    let tick = 0;
    timer.current = setInterval(() => {
      tick++;
      setTurns((all) => {
        const t = [...all];
        const last = t[t.length - 1];
        if (!last || last.role !== "agent" || last.kind !== "work") return all;
        const at = Math.min(3, Math.floor(tick / 5));
        const shown = at >= 3 ? Math.min(reply.length, (tick - 15) * 6) : 0;
        t[t.length - 1] = { ...last, at, shown };
        if (shown >= reply.length) {
          if (timer.current) clearInterval(timer.current);
          setStatus("ready");
        }
        return t;
      });
    }, 160);
  };

  return (
    <div className={cn("flex h-[640px] w-full flex-col overflow-hidden rounded-lg border border-line bg-ground", className)}>
      <Conversation
        follow={JSON.stringify(turns).length}
        empty={
          <div className="flex flex-col items-center gap-5 text-center">
            <AgentMark />
            <div className="flex flex-col gap-1">
              <p className="m-0 font-display text-title font-semibold text-ink">What should we get done?</p>
              <p className="m-0 text-body text-ink-3">Ask about orders, invoices or customers, or ask to change how a screen looks.</p>
            </div>
            <Suggestions items={["Chase every overdue invoice", "I don't like the email field on sign-up", "Which customers ordered less this month?"]} onPick={run} />
          </div>
        }
      >
        {turns.map((t, i) =>
          t.role === "user" ? (
            <Message key={i} role="user">
              {t.text}
            </Message>
          ) : t.kind === "choose" ? (
            <Message key={i} role="assistant" avatar={<AgentMark />} name="Syvna agent">
              <p>Here are other looks for the email field. Each one is live; pick the one you like and I&apos;ll use it on every form.</p>
              <VariantChooser
                title="A look for the email field"
                options={fieldOptions()}
                current={field}
                onChoose={(id) => {
                  setField(id);
                  setTurns((all) => all.map((x, j) => (j === i ? { ...x, chosen: id } : x)));
                }}
              />
              {"chosen" in t && t.chosen ? <p>Done: every email field now uses the {t.chosen} look.</p> : null}
            </Message>
          ) : (
            <Message
              key={i}
              role="assistant"
              avatar={<AgentMark />}
              name="Syvna agent"
              actions={t.shown >= t.reply.length ? <MessageActions text={t.reply} onRegenerate={() => run("Chase every overdue invoice")} onFeedback={() => {}} /> : undefined}
            >
              {t.at === 0 && t.shown === 0 && status === "streaming" && i === turns.length - 1 ? <Thinking label="Reading your invoices…" /> : null}
              <Reasoning running={t.at === 0 && status === "streaming"} seconds={3}>
                214 invoices are open. Sending one email per invoice would spam customers with several, so I&apos;ll group them by customer and send one reminder each.
              </Reasoning>
              <Plan title="Plan: chase overdue invoices" steps={steps.map((s, k) => ({ title: s, status: k === 3 && t.at >= 3 ? (t.approval === "approved" ? "done" : "pending") : statusAt(k, t.at) }))} />
              {t.at >= 1 ? <ToolCall name="Search invoices" status={t.at === 1 ? "running" : "done"} duration="0.8s" input={{ status: "overdue", limit: 500 }} output={{ count: 214, customers: 38, total: "$48,920.00" }} /> : null}
              {t.at >= 2 ? (
                <Subagent name="Writing agent" task="Draft 38 reminders" status={t.at === 2 ? "running" : "done"}>
                  <TraceStep title="Read each customer's history" status="done" />
                  <TraceStep title="Matched tone to how late they are" status={t.at === 2 ? "running" : "done"} />
                </Subagent>
              ) : null}
              {t.shown > 0 ? (
                <p>
                  {t.reply.slice(0, t.shown)}
                  {t.shown < t.reply.length ? <StreamCaret /> : null}
                </p>
              ) : null}
              {t.shown >= t.reply.length ? (
                <Confirmation
                  icon={<Mail />}
                  title="Send 38 reminder emails?"
                  description="One to each customer with an overdue invoice. Customers see them right away."
                  details={
                    <>
                      To: billing contacts of 38 customers · From: <code>billing@casaverde.pt</code>
                    </>
                  }
                  state={t.approval}
                  approveLabel="Send 38 emails"
                  onApprove={() => setTurns((all) => all.map((x, j) => (j === i ? { ...x, approval: "approved" } : x)))}
                  onReject={() => setTurns((all) => all.map((x, j) => (j === i ? { ...x, approval: "rejected" } : x)))}
                />
              ) : null}
            </Message>
          ),
        )}
      </Conversation>
      <div className="mx-auto w-full max-w-[760px] px-4 pb-4">
        <PromptInput
          onSubmit={run}
          status={status}
          onStop={stop}
          onFiles={() => {}}
          tools={
            <>
              <ModelSelector value={model} onChange={setModel} models={models} />
              <ContextMeter used={14200 + JSON.stringify(turns).length * 4} limit={128000} breakdown={{ Messages: 9800, Tools: 3100, Files: 1300 }} />
            </>
          }
          footer="The agent can make mistakes. Check important details."
        />
      </div>
    </div>
  );
}

function PlanDemo({ speed }: { speed: number }) {
  const at = useTicker(steps.length, speed);
  return <Plan title="Plan: chase overdue invoices" steps={steps.map((s, i) => ({ title: s, status: statusAt(i, at) }))} />;
}

function TaskDemo() {
  const at = useTicker(4, 1300);
  return <TaskList tasks={["Add VAT number to the invoice", "Recalculate totals", "Email the corrected invoice", "Note it on the customer"].map((t, i) => ({ title: t, status: i < at ? "done" : i === at ? "running" : "pending" }))} />;
}

function PromptDemo({ files, streaming }: { files: boolean; streaming: boolean }) {
  const [list, setList] = useState(files ? [{ name: "q3-invoices.csv", size: 284_000 }, { name: "price-list.pdf", size: 1_240_000 }] : []);
  return (
    <PromptInput
      className="w-full max-w-[640px]"
      onSubmit={() => {}}
      status={streaming ? "streaming" : "ready"}
      onStop={() => {}}
      onFiles={(f) => setList((l) => [...l, ...f.map((x) => ({ name: x.name, size: x.size }))])}
      attachments={list.length ? list.map((f) => <Attachment key={f.name} name={f.name} size={f.size} onRemove={() => setList((l) => l.filter((x) => x.name !== f.name))} />) : undefined}
      tools={<ContextMeter used={84000} limit={128000} breakdown={{ Messages: 61000, Tools: 18000, Files: 5000 }} />}
      footer="The agent can make mistakes. Check important details."
    />
  );
}

const models = [
  { id: "fast", name: "Fast", description: "Quick answers and small edits", badge: "Fast" },
  { id: "balanced", name: "Balanced", description: "Most work: reports, emails, screens" },
  { id: "deep", name: "Deep", description: "Long reports and hard problems", badge: "New" },
];

function QuestionDemo({ multiple, other }: { multiple: boolean; other: boolean }) {
  const [answer, setAnswer] = useState<string[]>();
  return (
    <Questionnaire
      className="w-full max-w-[520px]"
      question="Which customers should get a reminder?"
      description="I found 38 with overdue invoices."
      multiple={multiple}
      allowOther={other}
      answered={answer}
      onSubmit={(vals) => setAnswer(vals)}
      options={[
        { value: "all", label: "All 38", description: "Everyone with an overdue invoice" },
        { value: "30", label: "Over 30 days late", description: "14 customers" },
        { value: "big", label: "Over $1,000 owed", description: "9 customers" },
      ]}
    />
  );
}

function ChooserDemo({ visible }: { visible: number }) {
  const [cur, setCur] = useState("outline");
  return <VariantChooser className="w-full max-w-[560px]" title="A look for the email field" options={fieldOptions()} current={cur} visible={visible} onChoose={setCur} />;
}

function ModelDemo() {
  const [m, setM] = useState("balanced");
  return (
    <div className="pt-40">
      <ModelSelector value={m} onChange={setM} models={models} />
    </div>
  );
}

function TreeDemo() {
  const [sel, setSel] = useState("lib/tax.ts");
  return (
    <FileTree
      className="w-full max-w-[320px] rounded-lg border border-line bg-surface"
      selected={sel}
      onSelect={setSel}
      files={[
        { name: "app", children: [{ name: "invoices", children: [{ name: "page.tsx", change: "modified" }] }, { name: "layout.tsx" }] },
        { name: "lib", children: [{ name: "tax.ts", change: "modified" }, { name: "rates.json", change: "added" }, { name: "old-rates.ts", change: "deleted" }] },
        { name: "package.json" },
      ]}
    />
  );
}

export const agent: Doc[] = [
  {
    name: "Conversation",
    preview: () => <ChatDemo />,
    code: () =>
      `<Conversation follow={messages.length} empty={<Suggestions items={starters} onPick={send} />}>\n  {messages.map((m) => (\n    <Message key={m.id} role={m.role} avatar={<AgentMark />}>\n      {m.parts.map(renderPart)}\n    </Message>\n  ))}\n</Conversation>\n<PromptInput onSubmit={send} status={status} onStop={stop} tools={<ModelSelector … />} />`,
    stage: "block p-4",
  },
  {
    name: "Message",
    controls: { role: { type: "select", options: ["assistant", "user", "system"], default: "assistant" }, actions: { type: "boolean", default: true } },
    preview: (v) => (
      <div className="w-full max-w-[640px]">
        <Message
          role={str(v.role) as "user"}
          avatar={<AgentMark />}
          name={v.role === "assistant" ? "Syvna agent" : undefined}
          time="2:14 PM"
          actions={bool(v.actions) && v.role === "assistant" ? <MessageActions text="Revenue is up 12%." onRegenerate={() => {}} onFeedback={() => {}} /> : undefined}
        >
          {v.role === "system" ? "Lucía joined the conversation" : v.role === "user" ? "How did we do last month?" : <p>Revenue was $48,920, up 12% on September, mostly from repeat customers in Germany and Japan.</p>}
        </Message>
      </div>
    ),
    code: (v) => jsx("Message", { role: str(v.role), avatar: v.role === "assistant" ? raw("<AgentMark />") : undefined, actions: bool(v.actions) && v.role === "assistant" ? raw("<MessageActions text={text} onRegenerate={retry} onFeedback={rate} />") : undefined }, "{content}"),
  },
  {
    name: "PromptInput",
    controls: { files: { type: "boolean", default: true, label: "With attachments" }, streaming: { type: "boolean", default: false, label: "While replying (Stop)" } },
    preview: (v) => <PromptDemo key={`${v.files}`} files={bool(v.files)} streaming={bool(v.streaming)} />,
    code: (v) => jsx("PromptInput", { onSubmit: raw("send"), status: bool(v.streaming) ? "streaming" : undefined, onStop: raw("stop"), onFiles: raw("attach"), attachments: bool(v.files) ? raw("files.map((f) => <Attachment key={f.name} name={f.name} size={f.size} onRemove={() => remove(f)} />)") : undefined, tools: raw("<ContextMeter used={used} limit={128000} />") }),
  },
  {
    name: "Suggestions",
    controls: { variant: { type: "select", options: ["chips", "list"], default: "chips" } },
    preview: (v) => <Suggestions className="max-w-[520px]" variant={str(v.variant) as "chips"} items={["Chase every overdue invoice", "Which customers ordered less this month?", "Draft a price increase email"]} onPick={() => {}} />,
    code: (v) => jsx("Suggestions", { variant: str(v.variant), items: raw("starters"), onPick: raw("send") }, undefined, { variant: "chips" }),
  },
  {
    name: "Thinking",
    controls: { variant: { type: "select", options: ["text", "dots"], default: "text" }, label: { type: "text", default: "Reading 3 files…" } },
    preview: (v) => <Thinking variant={str(v.variant) as "text"} label={str(v.label)} />,
    code: (v) => jsx("Thinking", { variant: str(v.variant), label: str(v.label) }, undefined, { variant: "text" }),
  },
  {
    name: "Plan",
    controls: { speed: { type: "select", options: ["900", "1600"], default: "1600", label: "ms per step" } },
    preview: (v) => (
      <div className="w-full max-w-[460px]">
        <PlanDemo key={str(v.speed)} speed={num(v.speed)} />
      </div>
    ),
    code: () => jsx("Plan", { title: "Plan: chase overdue invoices", steps: raw('[\n  { title: "Read the 214 open invoices", status: "done" },\n  { title: "Group them by customer", status: "running" },\n  { title: "Draft a reminder for each", status: "pending" },\n]') }),
  },
  {
    name: "TaskList",
    preview: () => (
      <div className="w-full max-w-[460px]">
        <TaskDemo />
      </div>
    ),
    code: () => jsx("TaskList", { tasks: raw('todos.map((t) => ({ title: t.content, status: t.status }))') }),
  },
  {
    name: "ToolCall",
    controls: { status: { type: "select", options: ["done", "running", "error"], default: "done" } },
    preview: (v) => (
      <div className="w-full max-w-[520px]">
        <ToolCall
          name="Search invoices"
          status={str(v.status) as StepStatus}
          duration="0.8s"
          input={{ status: "overdue", limit: 500 }}
          output={{ count: 214, customers: 38, total: "$48,920.00" }}
          error={v.status === "error" ? "The billing service didn't answer in 30 seconds." : undefined}
        />
      </div>
    ),
    code: (v) => jsx("ToolCall", { name: "Search invoices", status: str(v.status), duration: "0.8s", input: raw("call.input"), output: raw("call.output"), error: v.status === "error" ? raw("call.error") : undefined }),
  },
  {
    name: "Reasoning",
    controls: { running: { type: "boolean", default: false } },
    preview: (v) => (
      <div className="w-full max-w-[520px]">
        <Reasoning running={bool(v.running)} seconds={6}>
          214 invoices are open. Sending one email per invoice would spam customers with several, so I&apos;ll group them by customer and send one reminder each.
        </Reasoning>
      </div>
    ),
    code: (v) => jsx("Reasoning", { running: bool(v.running), seconds: raw("useElapsed(running)") }, "{part.text}"),
  },
  {
    name: "Subagent",
    controls: { status: { type: "select", options: ["running", "done", "error"], default: "running" } },
    preview: (v) => (
      <div className="w-full max-w-[520px]">
        <Subagent name="Research agent" task="Compare our prices with last quarter" status={str(v.status) as StepStatus}>
          <TraceStep title="Read 1,240 orders" status="done" />
          <TraceStep title="Grouped by product" status={v.status === "running" ? "running" : "done"} />
        </Subagent>
      </div>
    ),
    code: (v) => jsx("Subagent", { name: "Research agent", task: "Compare our prices with last quarter", status: str(v.status) }, "{steps}"),
  },
  {
    name: "Trace",
    preview: () => (
      <div className="w-full max-w-[520px]">
        <Trace>
          <TraceStep title="Read 3 files" description="invoices.ts, tax.ts, +1" status="done">
            invoices.ts · tax.ts · rates.json
          </TraceStep>
          <TraceStep title="Updated the VAT rule" status="running" />
          <TraceStep title="Run the tests" status="pending" />
        </Trace>
      </div>
    ),
    code: () => `<Trace>\n  <TraceStep title="Read 3 files" description="invoices.ts, tax.ts, +1" status="done">…</TraceStep>\n  <TraceStep title="Updated the VAT rule" status="running" />\n  <TraceStep title="Run the tests" status="pending" />\n</Trace>`,
  },
  {
    name: "TraceStep",
    controls: { status: { type: "select", options: ["done", "running", "pending", "error"], default: "running" } },
    preview: (v) => (
      <div className="w-full max-w-[520px]">
        <Trace>
          <TraceStep title="Updated the VAT rule" description="tax.ts" status={str(v.status) as StepStatus}>
            Germany&apos;s reduced rate now applies to food items.
          </TraceStep>
        </Trace>
      </div>
    ),
    code: (v) => jsx("TraceStep", { title: "Updated the VAT rule", description: "tax.ts", status: str(v.status) }, "…"),
  },
  {
    name: "Sources",
    preview: () => (
      <div className="w-full max-w-[520px]">
        <Sources
          sources={[
            { title: "VAT rates in the EU", url: "https://taxation-customs.ec.europa.eu/vat-rates", snippet: "Standard and reduced rates by country" },
            { title: "Invoicing rules", url: "https://www.gov.uk/invoicing-and-taking-payment-from-customers" },
            { title: "Late payment interest", url: "https://europa.eu/youreurope/business/finance-funding/getting-paid" },
          ]}
        />
      </div>
    ),
    code: () => jsx("Sources", { sources: raw('[{ title: "VAT rates in the EU", url: "https://…" }, …]') }),
  },
  {
    name: "InlineCitation",
    controls: { numbered: { type: "boolean", default: false } },
    preview: (v) => (
      <p className="m-0 max-w-[520px] text-body text-ink">
        Germany charges 7% on most food
        <InlineCitation index={bool(v.numbered) ? 1 : undefined} source={{ title: "VAT rates in the EU", url: "https://taxation-customs.ec.europa.eu/vat-rates", snippet: "Reduced rates apply to foodstuffs." }} /> and late payments can carry interest of 8 points over the base rate
        <InlineCitation index={bool(v.numbered) ? 2 : undefined} source={{ title: "Late payment interest", url: "https://europa.eu/youreurope/business/finance-funding/getting-paid" }} />.
      </p>
    ),
    code: (v) => jsx("InlineCitation", { source: raw("{ title, url, snippet }"), index: bool(v.numbered) ? 1 : undefined }),
  },
  {
    name: "Checkpoint",
    preview: () => (
      <div className="w-full max-w-[520px]">
        <Checkpoint label="Before the VAT changes" onRestore={() => {}} />
      </div>
    ),
    code: () => jsx("Checkpoint", { label: "Before the VAT changes", onRestore: raw("restore") }),
  },
  {
    name: "Confirmation",
    controls: { tone: { type: "select", options: ["default", "danger"], default: "default" }, state: { type: "select", options: ["pending", "approved", "rejected"], default: "pending" } },
    preview: (v) => (
      <div className="w-full max-w-[520px]">
        <Confirmation
          key={str(v.state)}
          tone={str(v.tone) as "default"}
          state={str(v.state) as "pending"}
          icon={v.tone === "danger" ? undefined : <Mail />}
          title={v.tone === "danger" ? "Delete 12 draft invoices?" : "Send 38 reminder emails?"}
          description={v.tone === "danger" ? "They're removed for good; nobody has seen them." : "One to each customer with an overdue invoice."}
          details={v.tone === "danger" ? <>INV-2101 to INV-2112</> : <>From <code>billing@casaverde.pt</code> to 38 billing contacts</>}
          approveLabel={v.tone === "danger" ? "Delete 12" : "Send 38 emails"}
        />
      </div>
    ),
    code: (v) => jsx("Confirmation", { tone: str(v.tone), title: "Send 38 reminder emails?", description: "One to each customer with an overdue invoice.", details: raw("<>From <code>billing@…</code></>"), approveLabel: "Send 38 emails", onApprove: raw("() => respond(true)"), onReject: raw("() => respond(false)") }, undefined, { tone: "default" }),
  },
  {
    name: "Questionnaire",
    controls: { multiple: { type: "boolean", default: false }, other: { type: "boolean", default: true, label: "Something else" } },
    preview: (v) => <QuestionDemo key={`${v.multiple}${v.other}`} multiple={bool(v.multiple)} other={bool(v.other)} />,
    code: (v) => jsx("Questionnaire", { question: "Which customers should get a reminder?", options: raw("options"), multiple: bool(v.multiple), allowOther: bool(v.other), onSubmit: raw("answer") }),
  },
  {
    name: "VariantChooser",
    controls: { visible: { type: "number", default: 3, min: 2, max: 6 } },
    preview: (v) => <ChooserDemo visible={num(v.visible)} />,
    code: (v) =>
      jsx("VariantChooser", {
        title: "A look for the email field",
        options: raw('fieldVariants.map((v) => ({ id: v, label: v, note: notes[v], preview: <Input variant={v} placeholder="amara@okafor.ng" /> }))'),
        current: raw("field.variant"),
        visible: num(v.visible),
        onChoose: raw("(id) => apply({ variant: id })"),
      }),
  },
  {
    name: "ModelSelector",
    preview: () => <ModelDemo />,
    code: () => jsx("ModelSelector", { value: raw("model"), onChange: raw("setModel"), models: raw("models") }),
  },
  {
    name: "ContextMeter",
    controls: { used: { type: "number", default: 84000, min: 0, max: 128000, step: 4000 } },
    preview: (v) => (
      <div className="pt-32">
        <ContextMeter used={num(v.used)} limit={128000} breakdown={{ Messages: Math.round(num(v.used) * 0.7), Tools: Math.round(num(v.used) * 0.25), Files: Math.round(num(v.used) * 0.05) }} />
      </div>
    ),
    code: (v) => jsx("ContextMeter", { used: num(v.used), limit: 128000, breakdown: raw("{ Messages, Tools, Files }") }),
  },
  {
    name: "MessageActions",
    preview: () => <MessageActions text="Revenue is up 12%." onRegenerate={() => {}} onFeedback={() => {}} />,
    code: () => jsx("MessageActions", { text: raw("message.text"), onRegenerate: raw("retry"), onFeedback: raw("(good) => rate(message.id, good)") }),
  },
  {
    name: "Attachment",
    controls: { removable: { type: "boolean", default: true }, image: { type: "boolean", default: false } },
    preview: (v) => (
      <Attachment
        name={bool(v.image) ? "shop-front.jpg" : "q3-invoices.csv"}
        size={bool(v.image) ? 3_800_000 : 284_000}
        image={bool(v.image) ? "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=120&h=120&q=60" : undefined}
        onRemove={bool(v.removable) ? () => {} : undefined}
      />
    ),
    code: (v) => jsx("Attachment", { name: raw("file.name"), size: raw("file.size"), image: bool(v.image) ? raw("preview") : undefined, onRemove: bool(v.removable) ? raw("() => remove(file)") : undefined }),
  },
  {
    name: "StreamCaret",
    preview: () => (
      <p className="m-0 text-body text-ink">
        Revenue was $48,920, up 12% on
        <StreamCaret />
      </p>
    ),
    code: () => "{text}{streaming ? <StreamCaret /> : null}",
  },
  {
    name: "CodeBlock",
    controls: { filename: { type: "boolean", default: true }, lineNumbers: { type: "boolean", default: true } },
    preview: (v) => (
      <CodeBlock
        className="w-full max-w-[600px]"
        filename={bool(v.filename) ? "lib/tax.ts" : undefined}
        lineNumbers={bool(v.lineNumbers)}
        highlight={[3]}
        code={`export function vat(country: string, food: boolean) {\n  const rates = { DE: [19, 7], PT: [23, 6], JP: [10, 8] };\n  const [standard, reduced] = rates[country] ?? [0, 0];\n  return food ? reduced : standard;\n}`}
      />
    ),
    code: (v) => jsx("CodeBlock", { code: raw("source"), filename: bool(v.filename) ? "lib/tax.ts" : undefined, lineNumbers: bool(v.lineNumbers), highlight: raw("[3]") }),
  },
  {
    name: "Terminal",
    controls: { running: { type: "boolean", default: false }, failed: { type: "boolean", default: false } },
    preview: (v) => (
      <Terminal
        className="w-full max-w-[600px]"
        title="~/casa-verde"
        command="npm test"
        running={bool(v.running)}
        exitCode={bool(v.failed) ? 1 : 0}
        output={`> vitest run\n\n✓ invoices.test.ts (12 tests) 84ms\n${bool(v.failed) ? "FAIL tax.test.ts > applies reduced VAT to food\nerror: expected 19 to be 7" : "✓ tax.test.ts (8 tests) 31ms"}\nwarn: 1 test was skipped`}
      />
    ),
    code: (v) => jsx("Terminal", { command: "npm test", output: raw("stdout"), running: bool(v.running), exitCode: raw("code") }),
  },
  {
    name: "StackTrace",
    preview: () => (
      <StackTrace
        className="w-full max-w-[600px]"
        name="TypeError"
        message="Cannot read properties of undefined (reading 'rate')"
        onOpenFrame={() => {}}
        frames={[
          { fn: "vat", file: "lib/tax.ts", line: 3, column: 41 },
          { fn: "totals", file: "lib/invoices.ts", line: 58, column: 12 },
          { fn: "renderWithHooks", file: "node_modules/react-dom/cjs/react-dom.development.js", line: 15486, external: true },
          { fn: "mountIndeterminateComponent", file: "node_modules/react-dom/cjs/react-dom.development.js", line: 20103, external: true },
        ]}
      />
    ),
    code: () => jsx("StackTrace", { name: raw("error.name"), message: raw("error.message"), frames: raw("parse(error.stack)"), onOpenFrame: raw("open") }),
  },
  {
    name: "TestResults",
    preview: () => (
      <TestResults
        className="w-full max-w-[600px]"
        title="tax.test.ts"
        tests={[
          { name: "applies the standard rate", status: "passed", duration: 4 },
          { name: "applies reduced VAT to food", status: "failed", duration: 6, error: "expected 19 to be 7\n  at tax.test.ts:14:22" },
          { name: "handles unknown countries", status: "passed", duration: 2 },
          { name: "rounds to the cent", status: "passed", duration: 3 },
          { name: "uses last year's rates for old invoices", status: "skipped" },
        ]}
      />
    ),
    code: () => jsx("TestResults", { title: "tax.test.ts", tests: raw("run.tests") }),
  },
  {
    name: "FileTree",
    preview: () => <TreeDemo />,
    code: () => jsx("FileTree", { files: raw("tree"), selected: raw("path"), onSelect: raw("open") }),
  },
];
