// Renders the component guides (packages/ui/docs/<Name>.md). They use a
// small part of Markdown: paragraphs, "- " lists, **bold** and `code`; the
// first "# Name" heading is the page's own title and is left out.

function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    const t = m[0];
    out.push(
      t.startsWith("`") ? (
        <code key={`${key}-${i++}`} className="rounded bg-surface-2 px-1 py-px font-mono text-[0.9em] text-ink">
          {t.slice(1, -1)}
        </code>
      ) : (
        <strong key={`${key}-${i++}`} className="font-semibold text-ink">
          {t.slice(2, -2)}
        </strong>
      ),
    );
    last = m.index! + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/^# .*\n+/, "").trim().split(/\n\s*\n/);
  return (
    <div className="flex max-w-[720px] flex-col gap-4 text-[15px]/[24px] text-ink-2">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="m-0 flex list-disc flex-col gap-1.5 pl-5 marker:text-ink-4">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2), `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (b.startsWith("## ")) {
          return (
            <h3 key={i} className="m-0 mt-2 font-display text-base font-semibold text-ink">
              {b.slice(3)}
            </h3>
          );
        }
        return (
          <p key={i} className="m-0 text-pretty">
            {inline(lines.join(" "), String(i))}
          </p>
        );
      })}
    </div>
  );
}
