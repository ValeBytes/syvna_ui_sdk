// Builds @syvna/ui's generated files from tokens.json, the one source of
// the look:
//
//   src/theme.css   the Tailwind theme apps import: every token as a Tailwind
//                   value (bg-surface, text-ink, rounded-lg, shadow-2,
//                   font-display), plus the components' own animations.
//   src/tokens.css  the tokens' values, light and dark. A room's design is
//                   another set of these values; nothing else changes.
//   catalogue.json  every component with its props (scripts/catalogue.mjs).
//   dist/canvas/    what the design-system canvas runs: the components as one
//                   script (window.Syvna, React from the page), their compiled
//                   Tailwind CSS, and their types.
//
// node scripts/build.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(join(root, "tokens.json"), "utf8"));
const [first, ...others] = tokens.color.themes.map((t) => t.id);
const NOTICE = "/* Generated from tokens.json by scripts/build.mjs; don't edit. */\n";

const valueIn = (t, theme) => (typeof t.value === "string" ? t.value : (t.value[theme] ?? t.value[first]));
const alias = (v) => v.replace(/^\{(.+)\}$/, "var(--$1)");
const colors = tokens.color.tokens;
const shadows = tokens.shadow?.tokens ?? [];
const plain = [...(tokens.spacing?.tokens ?? []), ...(tokens.radius?.tokens ?? []), ...(tokens.fontWeight?.tokens ?? []), ...(tokens.fontAdjust?.tokens ?? [])];
const families = Object.entries(tokens.type.families);

// ---- src/tokens.css: the values, per theme ----
const themed = (theme) => [
  ...colors.map((t) => `  --${t.name}: ${alias(valueIn(t, theme))};`),
  ...shadows.map((t) => `  --${t.name}: ${valueIn(t, theme)};`),
];
let css = NOTICE;
css += `:root {\n  color-scheme: ${first};\n${themed(first).join("\n")}\n`;
css += plain.map((t) => `  --${t.name}: ${t.value};`).join("\n") + "\n";
css += families.map(([k, v]) => `  --font-${k}: ${v};`).join("\n") + "\n}\n";
for (const theme of others) {
  const block = `  color-scheme: ${theme};\n${themed(theme).join("\n")}\n`;
  // A page (or part of one) that names the theme, and the system's choice only
  // where it says data-theme="system". Never by default: an app's own light
  // colours would otherwise get the kit's dark ones mixed in on a dark-mode
  // device (light text on a light ground).
  css += `@media (prefers-color-scheme: ${theme}) {\n  [data-theme="system"] {\n${block.replace(/^/gm, "  ")}  }\n}\n`;
  css += `[data-theme="${theme}"] {\n${block}}\n`;
}
css += `[data-theme="${first}"] {\n  color-scheme: ${first};\n${themed(first).join("\n")}\n}\n`;
writeFileSync(join(root, "src/tokens.css"), css);
execFileSync(process.execPath, [join(root, "scripts/catalogue.mjs")], { stdio: "inherit" });

// ---- src/theme.css: the tokens as Tailwind's theme ----
// Colours are read through their variables (inline), so a theme switched on
// any element applies inside it. Radii, shadows and faces share Tailwind's own
// names (--radius-lg, --shadow-2, --font-display): their values here are the
// defaults, and tokens.css, unlayered, overrides them per theme.
let theme = NOTICE;
theme += `/* The components' classes: an app that imports this file gets them generated. */\n@source "./components";\n\n`;
theme += `@theme inline {\n${colors.map((t) => `  --color-${t.name}: var(--${t.name});`).join("\n")}\n}\n\n`;
theme += "@theme {\n";
theme += (tokens.radius?.tokens ?? []).map((t) => `  --${t.name}: ${t.value};`).join("\n") + "\n";
theme += shadows.map((t) => `  --${t.name}: ${valueIn(t, first)};`).join("\n") + "\n";
theme += families.map(([k, v]) => `  --font-${k}: ${v};`).join("\n") + "\n";
// Every type style as a text size: text-body, text-label, text-heading… with its
// line height and tracking. Weights stay in the components (font-medium).
for (const s of tokens.type.groups.flatMap((g) => g.styles)) {
  theme += `  --text-${s.name}: ${s.fontSize};\n  --text-${s.name}--line-height: ${s.lineHeight};\n`;
  if (s.letterSpacing) theme += `  --text-${s.name}--letter-spacing: ${s.letterSpacing};\n`;
}
theme += `
  --animate-fade-in: sy-fade 160ms ease-out;
  --animate-rise: sy-rise 260ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-shimmer: sy-shimmer 1.4s ease-in-out infinite;
  --animate-slide-in: sy-slide 320ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-tab-in: sy-tab 240ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-toast-in: sy-toast 320ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-grow: sy-grow 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-draw: sy-draw 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-reveal: sy-reveal 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-text-shimmer: sy-shimmer 2s linear infinite;
  --animate-blink: sy-blink 1.1s steps(2, start) infinite;
  --animate-pulse-dot: sy-pulse-dot 1.2s ease-in-out infinite;
  /* Headings' variation settings: a display face can need its own weight ("wght" 480). */
  --font-display--font-variation-settings: normal;
  @keyframes sy-fade { from { opacity: 0; } }
  @keyframes sy-rise { from { opacity: 0; transform: translateY(8px) scale(0.98); } }
  @keyframes sy-slide { from { transform: translateX(24px); opacity: 0; } }
  @keyframes sy-tab { from { opacity: 0; transform: translateY(4px); } }
  @keyframes sy-toast { from { opacity: 0; transform: translateY(12px) scale(0.97); } }
  @keyframes sy-grow { from { transform: scaleY(0); } }
  @keyframes sy-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes sy-reveal { from { clip-path: inset(-10% 100% -10% 0); } to { clip-path: inset(-10% -1% -10% 0); } }
  @keyframes sy-blink { to { visibility: hidden; } }
  @keyframes sy-pulse-dot { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
  @keyframes sy-indeterminate { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
  @keyframes sy-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
}
`;
// The page's base type: the body face at its weight and size adjustment, so an
// app gets them by importing the theme.
theme += `
@layer base {
  html {
    font-family: var(--font-body);
    font-weight: var(--font-weight-normal);
    font-size-adjust: var(--font-size-adjust);
    -webkit-font-smoothing: antialiased;
  }
}

/*
 * chrome-scope: inside it, the page's colours become the sidebar's (chrome-*),
 * so a sidebar built from ordinary token classes (bg-surface, text-ink-2,
 * bg-brand-soft) takes a navy, near-black or tinted chrome with no change to
 * its classes. Its badges and primary buttons take the accent.
 */
@utility chrome-scope {
  --surface: var(--chrome);
  --surface-2: var(--chrome-2);
  --line: var(--chrome-line);
  --line-strong: var(--chrome-line);
  --ink: var(--chrome-ink);
  --ink-2: var(--chrome-ink-2);
  --ink-3: var(--chrome-ink-3);
  --ink-4: var(--chrome-ink-3);
  --brand-soft: var(--chrome-active);
  --brand: var(--accent);
  --brand-hover: var(--accent);
  --brand-ink: var(--accent-ink);
  --ink-heading: var(--chrome-ink);
  background-color: var(--chrome);
  color: var(--chrome-ink);
}
`;
writeFileSync(join(root, "src/theme.css"), theme);

// src/cx.ts: the token class names class merging knows (see there).
const cxFile = join(root, "src/cx.ts");
const cx = readFileSync(cxFile, "utf8")
  .replace(/(\/\/ tokens:colors\n\s*color: ).*,/, `$1${JSON.stringify(colors.map((t) => t.name))},`)
  .replace(/(\/\/ tokens:text\n\s*text: ).*,/, `$1${JSON.stringify(tokens.type.groups.flatMap((g) => g.styles.map((s) => s.name)))},`);
writeFileSync(cxFile, cx);

// The package itself stops here; the rest is the design-system canvas.
if (process.argv.includes("--tokens-only")) process.exit(0);

// ---- dist/canvas: the bundle the canvas runs ----
const out = join(root, "dist/canvas");
// Emptied, not removed: Windows refuses to remove a folder a shell is in.
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) rmSync(join(out, f), { recursive: true, force: true });

// React comes from the page (window.React), as the canvas loads it.
const fromWindow = {
  name: "react-from-window",
  setup(b) {
    b.onResolve({ filter: /^react(\/jsx-runtime)?$/ }, (a) => ({ path: a.path, namespace: "window-react" }));
    b.onLoad({ filter: /.*/, namespace: "window-react" }, (a) => ({
      loader: "js",
      contents:
        a.path === "react"
          ? "module.exports = window.React;"
          : `var R = window.React;
             function jsx(t, p, k) { return R.createElement(t, k === undefined ? p : Object.assign({}, p, { key: k })); }
             module.exports = { Fragment: R.Fragment, jsx: jsx, jsxs: jsx };`,
    }));
  },
};
const exported = readFileSync(join(root, "src/index.ts"), "utf8")
  .match(/export \{([^}]+)\}/g)
  .flatMap((m) => m.slice(8, -1).split(","))
  .map((s) => s.trim())
  .filter((s) => /^[A-Z]/.test(s) && !s.startsWith("type "));

const result = await build({
  entryPoints: [join(root, "src/index.ts")],
  bundle: true,
  format: "iife",
  globalName: "__syvna",
  minify: true,
  target: "es2020",
  jsx: "automatic",
  plugins: [fromWindow],
  write: false,
  legalComments: "none",
});
let js = result.outputFiles[0].text;
js = js.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "\\x3C!--");
const header = { format: 4, namespace: "Syvna", components: exported.map((name) => ({ name })) };
writeFileSync(
  join(out, "bundle.js"),
  `/* @ds-bundle: ${JSON.stringify(header)} */\n${js}window.Syvna = Object.assign(window.Syvna || {}, __syvna);\n`,
);

// The components' CSS, compiled by Tailwind from their classes and the
// previews' (canvas/components), over the canvas's own tokens.css.
const entry = join(out, "entry.css");
writeFileSync(
  entry,
  `@import "tailwindcss";\n@import "../../src/theme.css";\n@source "../../canvas/components";\n` +
    `body { margin: 0; background: var(--color-ground); color: var(--color-ink); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }\n`,
);
execFileSync(process.execPath, [join(root, "node_modules/@tailwindcss/cli/dist/index.mjs"), "-i", entry, "-o", join(out, "bundle.css"), "--minify"], {
  cwd: root,
  stdio: ["ignore", "ignore", "inherit"],
});
rmSync(entry);

// Types: the components' declarations, as one file the canvas reads props from.
const types = join(out, "types");
execFileSync(
  process.execPath,
  [join(root, "node_modules/typescript/bin/tsc"), "-p", root, "--noEmit", "false", "--emitDeclarationOnly", "--outDir", types],
  { cwd: root, stdio: "inherit" },
);
const dts = [];
const walk = (dir) => {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith(".d.ts") && f.name !== "index.d.ts") dts.push(readFileSync(p, "utf8"));
  }
};
walk(types);
const body = dts
  .join("\n")
  .split("\n")
  .filter((l) => !/^import /.test(l) && !/^export \{\};?$/.test(l))
  .join("\n");
writeFileSync(
  join(out, "index.d.ts"),
  `import type * as React from "react";\n${body}\ndeclare global { interface Window { Syvna: typeof import("./index") } }\n`,
);
rmSync(types, { recursive: true, force: true });

const size = (f) => (readFileSync(join(out, f)).length / 1024).toFixed(1) + " KB";
console.log(`tokens.css, theme.css; canvas: bundle.js ${size("bundle.js")}, bundle.css ${size("bundle.css")}, ${exported.length} exports`);
