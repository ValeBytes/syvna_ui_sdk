// Builds the copy-in registry: one item per source file, so an app can take
// only the components it uses (npx syvna-ui add DateRangePicker) instead of
// the whole library.
//
//   registry/index.json       every item: name, the components it holds, what it needs
//   registry/r/<item>.json    one item, with its files' source
//
// The docs site serves these at /r/ (copied to apps/docs/public/r). Items keep
// the library's layout (cx.ts, components/<file>.tsx), so imports between
// them work unchanged once copied.
//
// node scripts/registry.mjs

import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const out = join(root, "registry");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const catalogue = JSON.parse(readFileSync(join(root, "catalogue.json"), "utf8"));
const versions = { ...pkg.dependencies, ...pkg.peerDependencies };
// The SDK's one version (the root package.json): every item says which release it came from.
const release = JSON.parse(readFileSync(join(root, "..", "..", "package.json"), "utf8")).version;

const read = (p) => readFileSync(join(src, p), "utf8").replace(/\r\n/g, "\n");

/** npm packages and other items a file imports. */
function needs(code, from) {
  const deps = new Set();
  const items = new Set();
  for (const m of code.matchAll(/(?:import|export)[^"']*?from\s+["']([^"']+)["']/g)) {
    const spec = m[1];
    if (spec.startsWith(".")) {
      const target = join(from, spec).replace(/\\/g, "/").replace(/^\.?\/?/, "");
      if (target === "cx" || target.endsWith("/cx")) continue; // in core
      items.add(target.split("/").pop());
    } else if (spec !== "react" && !spec.startsWith("react/")) {
      const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      deps.add(versions[name] ? `${name}@${versions[name]}` : name);
    }
  }
  return { deps: [...deps], items: [...items] };
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "r"), { recursive: true });

const index = [];

// core: cn and the tones, the theme (Tailwind's @theme and the components' classes) and the tokens' values.
const coreCode = read("cx.ts");
const core = {
  name: "core",
  version: release,
  type: "registry:lib",
  title: "Core",
  description: "cn(), the tone classes, theme.css (Tailwind theme) and tokens.css (the design's values). Every item needs it.",
  dependencies: needs(coreCode, "").deps,
  registryDependencies: [],
  components: [],
  files: [
    { path: "cx.ts", type: "registry:lib", content: coreCode },
    { path: "theme.css", type: "registry:style", content: read("theme.css") },
    { path: "tokens.css", type: "registry:style", content: read("tokens.css") },
  ],
};
writeFileSync(join(out, "r", "core.json"), JSON.stringify(core, null, 2) + "\n");
index.push({ name: "core", title: core.title, description: core.description, components: [], dependencies: core.dependencies, registryDependencies: [] });

const byFile = new Map();
for (const c of catalogue.components) {
  const file = c.file.replace(/^src\/components\//, "").replace(/\.tsx?$/, "");
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push({ name: c.name, summary: c.summary });
}

for (const f of readdirSync(join(src, "components")).sort()) {
  if (!/\.(tsx|ts)$/.test(f)) continue;
  const name = f.replace(/\.tsx?$/, "");
  const code = read(`components/${f}`);
  const { deps, items } = needs(code, "components");
  const comps = byFile.get(name) ?? [];
  const item = {
    name,
    version: release,
    type: comps.length ? "registry:ui" : "registry:lib",
    title: comps.length ? comps.map((c) => c.name).join(", ") : name,
    description: comps[0]?.summary ?? `Shared code the components use (${f}).`,
    dependencies: deps,
    registryDependencies: ["core", ...items.filter((i) => i !== name)],
    components: comps.map((c) => c.name),
    files: [{ path: `components/${f}`, type: comps.length ? "registry:ui" : "registry:lib", content: code }],
  };
  writeFileSync(join(out, "r", `${name}.json`), JSON.stringify(item, null, 2) + "\n");
  index.push({ name, title: item.title, description: item.description, components: item.components, dependencies: deps, registryDependencies: item.registryDependencies });
}

writeFileSync(join(out, "index.json"), JSON.stringify({ name: "syvna", version: release, homepage: "https://github.com/ValeBytes/syvna_ui_sdk", items: index }, null, 2) + "\n");

// Served by the docs site.
const docsPublic = join(root, "..", "..", "apps", "docs", "public", "r");
rmSync(docsPublic, { recursive: true, force: true });
mkdirSync(docsPublic, { recursive: true });
cpSync(join(out, "r"), docsPublic, { recursive: true });
cpSync(join(out, "index.json"), join(docsPublic, "index.json"));

console.log(`registry v${release}: ${index.length} items, ${index.reduce((n, i) => n + i.components.length, 0)} components`);
