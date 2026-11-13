import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { entry } from "@/lib/catalogue";
import { all, groups } from "@/registry/meta";

const setup = `/* app/globals.css */
@import "tailwindcss";
@import "@syvna/ui/theme.css";   /* the tokens as Tailwind values, and the components' classes */
@import "@syvna/ui/tokens.css";  /* the values, light and dark: a room's design replaces these */`;

const use = `import { Button, Card, Table, Badge } from "@syvna/ui";

<Card title="Recent orders" actions={<Button size="sm">View all</Button>}>
  <Table rows={orders} rowKey={(o) => o.id} columns={columns} />
</Card>`;

export default function Overview() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex max-w-[720px] flex-col gap-4 pt-4">
        <h1 className="m-0 font-display text-[44px]/[48px] font-semibold tracking-[-0.03em] text-balance">The components every Syvna app is built from.</h1>
        <p className="m-0 text-[17px]/[28px] text-pretty text-ink-2">
          Agents put screens together from these instead of styling each one from scratch, so apps look finished from the first build, cost
          fewer credits to make, and stay consistent as they grow. A room&apos;s design is a set of token values; change them and every
          component follows, in light and dark.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-lg font-semibold">1. Add the theme</h2>
          <CodeBlock code={setup} />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-lg font-semibold">2. Build with the components</h2>
          <CodeBlock code={use} />
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.name} className="flex flex-col gap-4">
          <h2 className="m-0 font-display text-xl font-semibold tracking-[-0.01em]">{g.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {g.items.map((name) => {
              const c = all.find((x) => x.name === name)!;
              return (
                <Link
                  key={name}
                  href={`/components/${c.slug}`}
                  className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4 no-underline shadow-1 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <span className="font-display text-[15px] font-semibold text-ink">{name}</span>
                  <span className="line-clamp-2 text-sm text-ink-3">{entry(name)?.summary}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
