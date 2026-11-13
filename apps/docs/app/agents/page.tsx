import type { Metadata } from "next";

import { CodeBlock } from "@/components/code-block";
import { components } from "@/lib/catalogue";

export const metadata: Metadata = { title: "For agents" };

const rules = [
  "Build screens from these components before writing your own markup. A signed-in screen is an AppShell whose Topbar breadcrumbs say where you are; the screen starts with its content and a toolbar row of actions, never a big title and description.",
  "Style with the tokens only: bg-surface, text-ink-3, border-line, rounded-lg, shadow-1. Never raw hex, never Tailwind's default palette (bg-gray-100).",
  "Adjust a component with className; a class you pass wins over its own of the same kind. Don't copy a component to change it.",
  "One primary Button per view. Status is a Badge whose tone means the same on every screen.",
  "Format dates, numbers and money with Intl for the reader's locale; prices default to USD.",
  "Light and dark come free from the tokens. Don't add dark: classes; a raw colour is the only thing that breaks dark mode.",
];

export default function Agents() {
  const example = JSON.stringify(components.find((c) => c.name === "Badge"), null, 2);
  return (
    <div className="flex max-w-[800px] flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="m-0 font-display text-[34px]/[40px] font-semibold tracking-[-0.025em]">For agents</h1>
        <p className="m-0 text-[17px]/[28px] text-pretty text-ink-2">
          Everything on this site comes from three files an agent can read directly, so what it builds matches what people see here.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-display text-xl font-semibold">What to read</h2>
        <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-[15px]/[24px] text-ink-2 marker:text-ink-4">
          <li>
            <code className="font-mono text-[0.9em] text-ink">@syvna/ui/catalogue.json</code>: every component, what it&apos;s for, and its props
            with their types, allowed values and defaults.
          </li>
          <li>
            <code className="font-mono text-[0.9em] text-ink">@syvna/ui/docs/&lt;Name&gt;.md</code>: how to use each one, and when not to.
          </li>
          <li>
            <code className="font-mono text-[0.9em] text-ink">@syvna/ui/tokens.json</code>: every token and its job.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-display text-xl font-semibold">Rules</h2>
        <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-[15px]/[24px] text-ink-2 marker:text-ink-3">
          {rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-display text-xl font-semibold">A catalogue entry</h2>
        <CodeBlock code={example} />
      </section>
    </div>
  );
}
