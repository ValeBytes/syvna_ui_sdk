// Writes JSX for the playground's code panel, leaving out props at their
// default so the code shows only what was changed.

/** Code put in as is, in braces: raw("() => setOpen(false)"). */
export type Raw = { raw: string };
export const raw = (code: string): Raw => ({ raw: code });

type Prop = string | number | boolean | Raw | undefined | null;

export function jsx(tag: string, props: Record<string, Prop>, children?: string, defaults: Record<string, Prop> = {}): string {
  const attrs: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false || v === "" || defaults[k] === v) continue;
    if (v === true) attrs.push(k);
    else if (typeof v === "string") attrs.push(`${k}="${v.replace(/"/g, "&quot;")}"`);
    else if (typeof v === "number") attrs.push(`${k}={${v}}`);
    else attrs.push(`${k}={${v.raw}}`);
  }
  const open = `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}`;
  if (children === undefined) return `${open} />`;
  if (!children.includes("\n")) return `${open}>${children}</${tag}>`;
  return `${open}>\n${indent(children)}\n</${tag}>`;
}

export function indent(code: string, by = "  "): string {
  return code
    .split("\n")
    .map((l) => (l ? by + l : l))
    .join("\n");
}

/** Values as the types a component wants. */
export const str = (v: unknown) => String(v ?? "");
export const bool = (v: unknown) => v === true;
export const num = (v: unknown) => Number(v ?? 0);
