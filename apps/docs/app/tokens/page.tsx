import type { Metadata } from "next";

import tokens from "@syvna/ui/tokens.json";

import { Faces } from "@/components/faces";

export const metadata: Metadata = { title: "Tokens" };

type Value = string | Record<string, string>;
const at = (v: Value, theme: string) => (typeof v === "string" ? v : (v[theme] ?? Object.values(v)[0]!));

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.01em]">{title}</h2>
        <p className="m-0 mt-1 max-w-[680px] text-sm text-ink-3">{note}</p>
      </div>
      {children}
    </section>
  );
}

export default function Tokens() {
  const themes = tokens.color.themes;
  return (
    <div className="flex flex-col gap-12">
      <header className="flex max-w-[720px] flex-col gap-3">
        <h1 className="m-0 font-display text-[34px]/[40px] font-semibold tracking-[-0.025em]">Tokens</h1>
        <p className="m-0 text-[17px]/[28px] text-pretty text-ink-2">
          Every colour, radius, shadow and face the components use. Each is a Tailwind value: <code className="font-mono text-[0.9em]">bg-surface</code>,{" "}
          <code className="font-mono text-[0.9em]">text-ink-3</code>, <code className="font-mono text-[0.9em]">rounded-lg</code>,{" "}
          <code className="font-mono text-[0.9em]">shadow-2</code>. Use them for an app&apos;s own layout too, never raw hex or Tailwind&apos;s
          default palette. They live in <code className="font-mono text-[0.9em]">packages/ui/tokens.json</code>.
        </p>
      </header>

      <Section title="Colour" note="Each with its job. Light and dark are the same names, so nothing in a component changes between them.">
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-1">
          <div className="grid grid-cols-[minmax(0,1fr)_repeat(2,96px)] gap-x-4 border-b border-line bg-surface-2 px-4 py-2.5 text-xs font-medium text-ink-3 sm:grid-cols-[180px_minmax(0,1fr)_repeat(2,96px)]">
            <span>Token</span>
            <span className="max-sm:hidden">Used for</span>
            {themes.map((t) => (
              <span key={t.id}>{t.name}</span>
            ))}
          </div>
          {tokens.color.tokens.map((t) => (
            <div
              key={t.name}
              className="grid grid-cols-[minmax(0,1fr)_repeat(2,96px)] items-center gap-x-4 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)_repeat(2,96px)]"
            >
              <code className="font-mono text-[13px] font-medium text-ink">{t.name}</code>
              <span className="text-sm text-ink-3 max-sm:hidden">{t.usage}</span>
              {themes.map((th) => (
                <span key={th.id} className="flex flex-col gap-1">
                  <span className="h-8 rounded-md ring-1 ring-inset ring-line" style={{ background: at(t.value as Value, th.id) }} />
                  <code className="truncate font-mono text-[11px] text-ink-3">{at(t.value as Value, th.id)}</code>
                </span>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type" note="Wix Madefor Text carries the interface and Wix Madefor Display the headings (font-display); a design can change either.">
        <div className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface shadow-1">
          {tokens.type.groups.flatMap((g) =>
            g.styles.map((s) => (
              <div key={s.name} className="flex flex-wrap items-baseline justify-between gap-4 px-5 py-4">
                <span
                  className="min-w-0 text-ink"
                  style={{
                    fontFamily: `var(--font-${g.family})`,
                    fontSize: s.fontSize,
                    lineHeight: String(s.lineHeight),
                    fontWeight: s.fontWeight,
                    letterSpacing: "letterSpacing" in s ? s.letterSpacing : undefined,
                  }}
                >
                  {s.sample}
                </span>
                <span className="flex flex-col items-end text-right">
                  <code className="font-mono text-[13px] text-ink">{s.name}</code>
                  <span className="text-xs text-ink-3">
                    {s.fontSize} / {String(s.lineHeight)} · {s.fontWeight}
                  </span>
                </span>
              </div>
            )),
          )}
        </div>
      </Section>

      <Section
        title="Faces"
        note="Every face in the font control, tuned to read like Wix Madefor: drawn at its x-height, with lines and weights matched from measurements of the font files (packages/ui/scripts/fonts)."
      >
        <Faces />
      </Section>

      <Section title="Radius" note="Corners follow size: small controls, larger panels.">
        <div className="grid gap-4 sm:grid-cols-5">
          {tokens.radius.tokens.map((r) => (
            <div key={r.name} className="flex flex-col gap-2">
              <div className="h-20 border border-line-strong bg-surface-2" style={{ borderRadius: `var(--${r.name})` }} />
              <code className="font-mono text-[13px] text-ink">rounded-{r.name.replace("radius-", "")}</code>
              <span className="text-xs text-ink-3">{r.usage}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shadow" note="Surfaces rest on shadow-1; what floats rises.">
        <div className="grid gap-6 sm:grid-cols-3">
          {tokens.shadow.tokens.map((s) => (
            <div key={s.name} className="flex flex-col gap-2">
              <div className="h-24 rounded-lg bg-surface" style={{ boxShadow: `var(--${s.name})` }} />
              <code className="font-mono text-[13px] text-ink">{s.name}</code>
              <span className="text-xs text-ink-3">{s.usage}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
