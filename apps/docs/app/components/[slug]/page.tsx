import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Playground } from "@/components/playground";
import { entry, guide, type Prop } from "@/lib/catalogue";
import { Markdown } from "@/lib/markdown";
import { all } from "@/registry/meta";

export function generateStaticParams() {
  return all.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = all.find((x) => x.slug === slug);
  return c ? { title: c.name, description: entry(c.name)?.summary } : {};
}

function PropType({ p }: { p: Prop }) {
  if (p.values) {
    return (
      <span className="flex flex-wrap gap-1">
        {p.values.map((v) => (
          <code key={v} className="rounded bg-surface-2 px-1.5 py-px font-mono text-[12px] text-ink">
            &quot;{v}&quot;
          </code>
        ))}
      </span>
    );
  }
  return <code className="font-mono text-[12px] text-ink-2 break-words">{p.type}</code>;
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = all.find((x) => x.slug === slug);
  if (!c) notFound();
  const info = entry(c.name);
  const text = await guide(c.name);

  return (
    <article className="flex flex-col gap-10">
      {/* No title or description: the breadcrumbs say which component this is, and the playground comes first. */}
      <Playground name={c.name}>
      {text ? (
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.01em]">How to use it</h2>
          <Markdown source={text} />
        </section>
      ) : null}

      {info?.props.length ? (
        <section className="flex flex-col gap-4">
          <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.01em]">Props</h2>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-1">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-3">
                  <th className="border-b border-line bg-surface-2 px-4 py-2.5 font-medium">Prop</th>
                  <th className="border-b border-line bg-surface-2 px-4 py-2.5 font-medium">Type</th>
                  <th className="border-b border-line bg-surface-2 px-4 py-2.5 font-medium">Default</th>
                  <th className="border-b border-line bg-surface-2 px-4 py-2.5 font-medium">What it does</th>
                </tr>
              </thead>
              <tbody>
                {info.props.map((p) => (
                  <tr key={p.name} className="align-top [&:last-child>td]:border-b-0">
                    <td className="border-b border-line px-4 py-3 whitespace-nowrap">
                      <code className="font-mono text-[13px] font-medium text-ink">{p.name}</code>
                      {p.required ? <span className="ml-1 text-danger" title="Required">*</span> : null}
                    </td>
                    <td className="max-w-[260px] border-b border-line px-4 py-3">
                      <PropType p={p} />
                    </td>
                    <td className="border-b border-line px-4 py-3 whitespace-nowrap">
                      {p.default ? <code className="font-mono text-[12px] text-ink-2">{p.default}</code> : <span className="text-ink-4">–</span>}
                    </td>
                    <td className="border-b border-line px-4 py-3 text-ink-2">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      </Playground>
    </article>
  );
}
