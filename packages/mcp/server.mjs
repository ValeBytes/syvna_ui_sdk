#!/usr/bin/env node
// The Syvna UI MCP server: lets an AI find and use the library without
// reading all of it. Instead of the whole catalogue (~30k tokens) it asks for
// what it needs: the list (~2k), one component (~1k), a check of its code.
//
// Speaks MCP over stdio (JSON-RPC, one message per line); no dependencies.
// Reads packages/ui/catalogue.json, docs/*.md, tokens.json and registry/index.json,
// so rebuild those (npm run build -w @syvna/ui) after changing components.
//
//   claude mcp add syvna-ui -- node packages/mcp/server.mjs

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

const ui = join(dirname(fileURLToPath(import.meta.url)), "..", "ui");
const load = (p) => JSON.parse(readFileSync(join(ui, p), "utf8"));

let data;
function refresh() {
  const catalogue = load("catalogue.json");
  const registry = existsSync(join(ui, "registry/index.json")) ? load("registry/index.json") : { items: [] };
  const tokens = load("tokens.json");
  const itemOf = new Map();
  for (const i of registry.items) for (const c of i.components) itemOf.set(c, i.name);
  const components = catalogue.components
    .filter((c) => c.file.startsWith("src/components/") && !/Glyph$/.test(c.name))
    .map((c) => {
      c = { ...c, summary: c.summary.replace(/\s+/g, " ") };
      const file = c.file.replace(/^src\/components\//, "").replace(/\.tsx?$/, "");
      const guidePath = join(ui, "docs", `${c.name}.md`);
      return { ...c, fileName: file, kit: kitOf(file), item: itemOf.get(c.name) ?? file, guide: existsSync(guidePath) ? readFileSync(guidePath, "utf8") : "" };
    });
  data = { components, registry, tokens, byName: new Map(components.map((c) => [c.name.toLowerCase(), c])) };
}

function kitOf(file) {
  if (["site", "hero", "site-header", "pricing", "shop"].includes(file)) return "website";
  if (["trace", "chat", "dev"].includes(file)) return "agent";
  return "dashboard";
}

const words = (s) => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];

function find(name) {
  const c = data.byName.get(String(name).toLowerCase().replace(/[\s_-]/g, ""));
  if (c) return c;
  const want = String(name).toLowerCase().replace(/[\s_-]/g, "");
  return data.components.find((x) => x.name.toLowerCase() === want);
}

function variantsOf(c) {
  return c.props.filter((p) => p.values?.length).map((p) => ({ prop: p.name, values: p.values, default: p.default, doc: p.description }));
}

// The palette generator is the library's own (src/palette.ts), run as is: Node strips its types.
let paletteLib;
const palettes = async () => (paletteLib ??= await import(pathToFileURL(join(ui, "src", "palette.ts")).href));

// ---------- tools ----------

const tools = {
  list_components: {
    description:
      "List Syvna UI components, one line each: name, what it's for, and its variant values. Start here when building a screen. Filter by kit (dashboard: app screens; website: landing pages and shops; agent: chat with AI agents) or by words.",
    inputSchema: {
      type: "object",
      properties: {
        kit: { type: "string", enum: ["dashboard", "website", "agent"], description: "Only this kit." },
        query: { type: "string", description: "Only components whose name or summary has these words." },
      },
    },
    run({ kit, query }) {
      const q = words(query ?? "");
      const rows = data.components.filter((c) => (!kit || c.kit === kit) && (!q.length || q.every((w) => `${c.name} ${c.summary}`.toLowerCase().includes(w))));
      return rows
        .map((c) => {
          const v = variantsOf(c).find((x) => x.prop === "variant");
          return `${c.name} [${c.kit}] ${c.summary.split(/(?<=\.)\s/)[0]}${v ? ` variants: ${v.values.length > 8 ? `${v.values.slice(0, 8).join("|")}|… (${v.values.length})` : v.values.join("|")}` : ""}`;
        })
        .join("\n") || "Nothing matches.";
    },
  },
  get_component: {
    description: "Everything needed to use one component: what it's for, its props (types, defaults, what each does), its guide (when to use which variant), how to import it and how to copy it into an app.",
    inputSchema: { type: "object", properties: { name: { type: "string", description: "The component, e.g. DateRangePicker." } }, required: ["name"] },
    run({ name }) {
      const c = find(name);
      if (!c) return { error: `No component called ${name}. Use search_components.` };
      const props = c.props
        .map((p) => `- ${p.name}${p.required ? "" : "?"}: ${p.values ? p.values.map((v) => `"${v}"`).join(" | ") : p.type}${p.default ? ` = ${p.default}` : ""}${p.description ? ` — ${p.description.replace(/\s+/g, " ")}` : ""}`)
        .join("\n");
      return [
        `# ${c.name} (${c.kit})`,
        c.summary,
        "",
        `Import: import { ${c.name} } from "@syvna/ui";`,
        `Copy into an app instead: npx syvna-ui add ${c.name}`,
        "",
        "## Props",
        props || "(none)",
        c.guide ? `\n## Guide\n${c.guide.replace(/^# .*\n+/, "")}` : "",
      ].join("\n");
    },
  },
  search_components: {
    description: "Find the component for a need, in plain words: 'pick a period for a report', 'show the agent's plan', 'pricing with a seat slider'. Returns the best matches and, when a variant fits, which one.",
    inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number", description: "Default 6." } }, required: ["query"] },
    run({ query, limit = 6 }) {
      const q = new Set(words(query).filter((w) => w.length > 2));
      const scored = data.components
        .map((c) => {
          const name = words(c.name.replace(/([a-z])([A-Z])/g, "$1 $2"));
          const summary = words(c.summary);
          const guide = words(c.guide);
          let s = 0;
          for (const w of q) {
            if (name.includes(w)) s += 6;
            if (summary.includes(w)) s += 3;
            if (guide.includes(w)) s += 1;
          }
          const variant = variantsOf(c)
            .flatMap((v) => v.values.map((val) => ({ prop: v.prop, val })))
            .find((x) => q.has(x.val) || [...q].some((w) => x.val.includes(w) && w.length > 3));
          return { c, s: s + (variant ? 4 : 0), variant };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit);
      if (!scored.length) return "Nothing matches; try list_components.";
      return scored.map(({ c, variant }) => `${c.name} [${c.kit}]${variant ? ` (${variant.prop}="${variant.val}")` : ""}: ${c.summary.split(/(?<=\.)\s/)[0]}`).join("\n");
    },
  },
  get_variants: {
    description: "The looks a component comes in (variant, size, tone and other choices), with what each is for. Use it to offer the user alternatives, e.g. in a VariantChooser.",
    inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    run({ name }) {
      const c = find(name);
      if (!c) return { error: `No component called ${name}.` };
      const v = variantsOf(c);
      if (!v.length) return `${c.name} has no set variants; its look comes from the tokens.`;
      return v.map((x) => `${x.prop}: ${x.values.join(", ")}${x.default ? ` (default ${x.default})` : ""}\n  ${x.doc.replace(/\s+/g, " ")}`).join("\n\n");
    },
  },
  add_command: {
    description: "The command that copies components into an app (only what they need), and the files it will write. For apps that own their component code.",
    inputSchema: { type: "object", properties: { names: { type: "array", items: { type: "string" } } }, required: ["names"] },
    run({ names }) {
      const items = data.registry.items;
      const byItem = new Map(items.map((i) => [i.name, i]));
      const start = names.map((n) => find(n)?.item ?? n);
      const seen = new Set();
      const walk = (n) => {
        if (seen.has(n) || !byItem.has(n)) return;
        seen.add(n);
        byItem.get(n).registryDependencies.forEach(walk);
      };
      ["core", ...start].forEach(walk);
      const deps = new Set([...seen].flatMap((n) => byItem.get(n).dependencies));
      return [`npx syvna-ui add ${names.join(" ")}`, `Writes: ${[...seen].map((n) => (n === "core" ? "cx.ts, theme.css, tokens.css" : `components/${n}.tsx`)).join(", ")}`, deps.size ? `npm packages: ${[...deps].join(" ")}` : "", 'Then import from "@/components/syvna".'].filter(Boolean).join("\n");
    },
  },
  get_tokens: {
    description: "The design tokens: colour names (use as bg-surface, text-ink-2, border-line…), the type scale (text-body, text-title…), radii and shadows, each with what it's for. Use these classes, never raw colours or Tailwind's text-sm.",
    inputSchema: { type: "object", properties: {} },
    run() {
      const t = data.tokens;
      const colors = t.color.tokens.map((x) => `${x.name}: ${x.usage}`).join("\n");
      const type = t.type.groups.flatMap((g) => g.styles.map((x) => `text-${x.name} (${g.family}): ${x.fontSize}/${x.lineHeight}${x.usage ? ` — ${x.usage}` : ""}`)).join("\n");
      const radius = t.radius.tokens.map((x) => `rounded-${x.name.replace("radius-", "")}: ${x.value} — ${x.usage}`).join("\n");
      const shadow = t.shadow.tokens.map((x) => `${x.name}: ${x.usage}`).join("\n");
      return [`## Colours (bg-*, text-*, border-*)`, colors, "", "## Type (text-*; headings add font-display)", type, "", "## Radius", radius, "", "## Shadows", shadow, "", "Dark mode comes from the tokens: never write dark: classes."].join("\n");
    },
  },
  list_palettes: {
    description:
      "The ready-made colour palettes (beyond plain light and dark): each one's name, mood and where it suits, with its key colours. Pick one for an app, or start make_palette from one.",
    inputSchema: { type: "object", properties: {} },
    async run() {
      const { palettePresets, createPalette } = await palettes();
      return Object.entries(palettePresets)
        .map(([id, p]) => {
          const t = createPalette(p.seed).light;
          return `${id}: ${p.name}. ${p.note}\n  brand ${t.brand} · accent ${t.accent} · sidebar ${t.chrome} · page ${t.ground}\n  seed ${JSON.stringify(p.seed)}`;
        })
        .join("\n");
    },
  },
  make_palette: {
    description:
      "Make a full palette (every colour token, light and dark, contrast-checked) from a few seed colours: a brand, an accent, how the sidebar looks (surface, brand, dark, tinted) and how the greys lean (brand, cool, warm, none). Returns how to apply it, the key colours and a contrast report. Use it when an app needs its own colours; use list_palettes for ready-made ones.",
    inputSchema: {
      type: "object",
      properties: {
        preset: { type: "string", description: "Start from a ready-made palette (list_palettes); seeds given override it." },
        brand: { type: "string", description: "Hex: buttons, headings, the identity." },
        accent: { type: "string", description: "Hex: what's selected or in progress. Derived when left out." },
        chrome: { type: "string", description: "The sidebar: surface, brand, dark, tinted, or a hex colour." },
        neutral: { type: "string", description: "The greys: brand, cool, warm or none." },
      },
    },
    async run({ preset, brand, accent, chrome, neutral }) {
      const { palettePresets, createPalette, contrast } = await palettes();
      const base = preset ? palettePresets[preset]?.seed : undefined;
      if (preset && !base) return { error: `No palette called ${preset}; list_palettes has them.` };
      const seed = { ...(base ?? {}), ...(brand ? { brand } : {}), ...(accent ? { accent } : {}), ...(chrome ? { chrome } : {}), ...(neutral ? { neutral } : {}) };
      if (!seed.brand) return { error: "Give a brand colour (hex) or a preset." };
      const p = createPalette(seed);
      const pairs = [["ink", "ground", 7], ["ink-3", "surface", 4.5], ["brand-ink", "brand", 4.5], ["accent-ink", "accent", 4.5], ["chrome-ink", "chrome", 7], ["chrome-ink-2", "chrome", 4.5], ["accent", "surface", 3]];
      const report = ["light", "dark"].map((m) => `${m}: ` + pairs.map(([a, b, min]) => `${a} on ${b} ${contrast(p[m][a], p[m][b]).toFixed(1)}${contrast(p[m][a], p[m][b]) < min ? " (LOW)" : ""}`).join(", ")).join("\n");
      const keys = ["brand", "accent", "ink-heading", "chrome", "chrome-ink", "ground", "surface", "bar", "chart-1", "chart-2", "chart-3"];
      return [
        `Seed: ${JSON.stringify(seed)}`,
        "",
        "Apply it in the root layout (light and dark both follow):",
        `  import { PaletteStyle } from "@syvna/ui";`,
        `  <PaletteStyle seed={${JSON.stringify(seed)}} />` + (preset && !brand && !accent && !chrome && !neutral ? `   (or <PaletteStyle preset="${preset}" />)` : ""),
        "Copied components: the same, from the app's own components/syvna.",
        "",
        "Key colours (light | dark):",
        ...keys.map((k) => `  ${k.padEnd(12)} ${p.light[k]} | ${p.dark[k]}`),
        "",
        "Contrast:",
        report,
        "",
        "Use the roles, not the hexes: bg-brand for the main action, bg-accent/text-accent for what's selected, text-ink-heading for titles and big numbers, bg-chart-1…6 for data; the sidebar takes the chrome by itself.",
      ].join("\n");
    },
  },
  check_code: {
    description:
      "Check JSX that uses Syvna UI before showing it: components that don't exist, props a component doesn't take, variant values that don't exist, and styling that breaks the design (raw colours, text-sm/text-lg, dark: classes, hex colours, page title headers). Returns problems with fixes, or OK.",
    inputSchema: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
    run({ code }) {
      const problems = [];
      const imported = new Set();
      for (const m of code.matchAll(/import\s*{([^}]*)}\s*from\s*["'](@syvna\/ui|@\/components\/syvna)["']/g)) for (const n of m[1].split(",")) imported.add(n.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, ""));
      for (const n of imported) if (/^[A-Z]/.test(n) && !find(n) && !/Props$|Variant$|Option$|Item$/.test(n) && !data.components.some((c) => c.name === n)) problems.push(`${n} isn't in the library. ${tools.search_components.run({ query: n.replace(/([a-z])([A-Z])/g, "$1 $2"), limit: 3 }).split("\n")[0]}`);
      for (const m of code.matchAll(/<([A-Z][A-Za-z]+)\b([^<>]*?(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^<>]*?)*)\/?>/g)) {
        const c = find(m[1]);
        if (!c || !imported.has(c.name)) continue;
        const attrs = [...m[2].matchAll(/(?:^|\s)([a-zA-Z][\w-]*)(?:=(?:"([^"]*)"|{))?/g)];
        const known = new Set(c.props.map((p) => p.name));
        const open = c.props.some((p) => p.name === "...rest");
        for (const a of attrs) {
          const prop = a[1];
          if (["key", "ref", "className", "children", "id", "style"].includes(prop) || prop.startsWith("aria-") || prop.startsWith("data-") || prop.startsWith("on")) continue;
          if (!known.has(prop) && !open) problems.push(`<${c.name}> has no prop "${prop}". It takes: ${[...known].filter((k) => k !== "...rest").join(", ")}.`);
          const def = c.props.find((p) => p.name === prop);
          if (def?.values && a[2] !== undefined && !def.values.includes(a[2])) problems.push(`<${c.name} ${prop}="${a[2]}">: no such value. Use one of ${def.values.join(", ")}.`);
        }
      }
      const rules = [
        [/\b(?:text|bg|border|ring|fill|stroke|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g, "uses a Tailwind palette colour; use the tokens (text-ink-2, bg-surface, text-danger…) so themes and dark mode work."],
        [/\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/g, "uses Tailwind's type sizes; use the type tokens (text-small, text-body, text-title, text-heading…)."],
        [/\bdark:/g, "uses dark:; the tokens switch themselves, so leave it out."],
        [/#[0-9a-fA-F]{3,8}\b(?![^<]*<\/(?:code|pre)>)/g, "has a hex colour; use a token."],
        [/<h1[^>]*>[^<]*<\/h1>\s*<p/g, "starts the screen with a title and a description; app screens don't have page titles (breadcrumbs say where you are)."],
        [/<div className="[^"]*justify-end[^"]*">\s*(?:<Button\b[\s\S]*?<\/Button>\s*)+<\/div>/g, "is a row with only buttons in it; put a screen's actions on an existing line: Tabs actions, FilterBar actions, Card actions, or Topbar actions."],
      ];
      for (const [re, msg] of rules) {
        const hits = [...new Set(code.match(re) ?? [])];
        if (hits.length) problems.push(`${hits.slice(0, 4).join(", ")}: ${msg}`);
      }
      return problems.length ? problems.map((p) => `- ${p}`).join("\n") : "OK: nothing found.";
    },
  },
};

// ---------- MCP over stdio ----------

const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");

async function handle(msg) {
  const { id, method, params } = msg;
  const reply = (result) => id !== undefined && send({ jsonrpc: "2.0", id, result });
  const error = (code, message) => id !== undefined && send({ jsonrpc: "2.0", id, error: { code, message } });
  switch (method) {
    case "initialize":
      refresh();
      return reply({
        protocolVersion: params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "syvna-ui", version: JSON.parse(readFileSync(join(ui, "..", "..", "package.json"), "utf8")).version },
        instructions:
          "Syvna UI is the component library for Syvna apps (dashboard, website and agent kits). Before writing UI: list_components or search_components, then get_component for each one you use. Style only with the tokens (get_tokens). Run check_code on what you write before showing it. Colour: never hard-code hexes; pick a palette with list_palettes or make one with make_palette from the brand the user gives, and apply it with PaletteStyle. When the user dislikes a part, get_variants and offer them in a VariantChooser.",
      });
    case "notifications/initialized":
    case "notifications/cancelled":
      return;
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: Object.entries(tools).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema })) });
    case "tools/call": {
      const t = tools[params?.name];
      if (!t) return error(-32602, `Unknown tool: ${params?.name}`);
      try {
        if (!data) refresh();
        const out = await t.run(params.arguments ?? {});
        if (out && typeof out === "object" && out.error) return reply({ content: [{ type: "text", text: out.error }], isError: true });
        return reply({ content: [{ type: "text", text: String(out) }] });
      } catch (e) {
        return reply({ content: [{ type: "text", text: `Failed: ${e.message}` }], isError: true });
      }
    }
    default:
      if (id !== undefined) error(-32601, `Method not found: ${method}`);
  }
}

// Run a tool from the command line, for testing: node server.mjs call search_components '{"query":"…"}'
if (process.argv[2] === "call") {
  refresh();
  const out = await tools[process.argv[3]].run(JSON.parse(process.argv[4] ?? "{}"));
  console.log(typeof out === "object" ? out.error : out);
} else {
  const rl = createInterface({ input: process.stdin });
  rl.on("line", (line) => {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    }
    void handle(msg);
  });
}
