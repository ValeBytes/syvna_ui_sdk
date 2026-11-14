// Writes the guide an app's agents read about the Syvna UI copied into it:
// every component in one line, by kit, with its variants, and how colour
// works. Syvna's app template keeps it at docs/ui.md.
//
//   node scripts/app-guide.mjs <out-file>

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2];
if (!out) throw new Error("say where: node scripts/app-guide.mjs <out-file>");

const catalogue = JSON.parse(readFileSync(join(root, "catalogue.json"), "utf8"));
const release = JSON.parse(readFileSync(join(root, "..", "..", "package.json"), "utf8")).version;
const { palettePresets } = await import(pathToFileURL(join(root, "src", "palette.ts")).href);

const kitOf = (f) => (["site", "hero", "site-header", "pricing", "shop"].includes(f) ? "Website" : ["trace", "chat", "dev"].includes(f) ? "Agent chats" : "App screens");
const groups = { "App screens": [], Website: [], "Agent chats": [] };
for (const c of catalogue.components) {
  if (!c.file.startsWith("src/components/") || /Glyph$/.test(c.name)) continue;
  const file = c.file.replace(/^src\/components\//, "").replace(/\.tsx?$/, "");
  const variant = c.props.find((p) => p.name === "variant" && p.values);
  const summary = c.summary.replace(/\s+/g, " ").split(/(?<=\.)\s/)[0];
  groups[kitOf(file)].push(`- **${c.name}**: ${summary}${variant ? ` Variants: ${variant.values.join(", ")}.` : ""}`);
}

const lines = [
  "# Syvna UI in this app",
  "",
  `The components in \`components/syvna\` (Syvna UI v${release}, copied in so the app owns them). Import them from \`@/components/syvna\`. Each file documents its props: open it for the details.`,
  "",
  "## Colours",
  "",
  "Components use colour roles, so a palette restyles all of them at once. Set one in `app/layout.tsx`:",
  "",
  "```tsx",
  'import { PaletteStyle } from "@/components/syvna";',
  "",
  "// at the top of <body>:",
  '<PaletteStyle preset="navy" />',
  "// or from the room's design:",
  '<PaletteStyle seed={{ brand: "#0f766e", accent: "#f59e0b", chrome: "brand", neutral: "warm" }} />',
  "```",
  "",
  "The roles: `brand` (the main action), `accent` (what's selected or in progress), `ink-heading` (titles, big numbers), `chrome` (the sidebar; it takes it by itself), `bar` (the top bar), the greys (`ground`, `surface`, `surface-2`, `line`, `ink` to `ink-4`) and `chart-1` to `chart-6` (data). Use them as classes (`bg-accent`, `text-ink-heading`, `bg-chart-2`), never raw colours. One brand and one accent, far apart in hue; most of the screen in greys.",
  "",
  "Ready-made palettes:",
  "",
  ...Object.entries(palettePresets).map(([id, p]) => `- \`${id}\`: ${p.note}`),
  "",
  "Type sizes are tokens too: `text-caption`, `text-small`, `text-label`, `text-body`, `text-subtitle`, `text-title`, `text-heading`, `text-stat`, `text-display`. Not `text-sm`.",
  "",
  "Screens: no page titles (the breadcrumbs say where you are), and a screen's buttons go on a line that already exists (the tab row through `Tabs actions`, the filter row, a card's header, the top bar), never on a row of their own.",
];
for (const [kit, list] of Object.entries(groups)) lines.push("", `## ${kit}`, "", ...list);
writeFileSync(out, lines.join("\n") + "\n");
console.log(`${out}: ${Object.values(groups).flat().length} components`);
