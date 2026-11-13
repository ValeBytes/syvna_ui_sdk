#!/usr/bin/env node
// syvna-ui: copies Syvna UI components into an app, so it ships only what it
// uses and can change them. Like shadcn's add, against our own registry.
//
//   npx syvna-ui init                    syvna.json, the core files, the CSS imports
//   npx syvna-ui add DateRangePicker     that component's file and everything it needs
//   npx syvna-ui add button chat         by file name works too
//   npx syvna-ui list [words]            what's in the registry
//   npx syvna-ui upgrade [0.3.0]         move the app's components to a release (the latest by default)
//   npx syvna-ui version                 this CLI's version and the one the app is on
//
// Run it from GitHub at a release: npx github:ValeBytes/syvna_ui_sdk#v0.1.0 init
//
// Every release is a git tag (v0.1.0); the app's syvna.json records which one
// its components came from, and the registry is read at that tag.
//
// Options: --overwrite (replace files that exist), --dry-run (say what would
// happen), --no-install (don't install npm packages), --cwd <dir>, --version
// <x.y.z> (init at a release), --yes (upgrade without asking), --force (upgrade
// files you've changed too). SYVNA_REGISTRY points at another registry;
// SYVNA_REGISTRY_TOKEN is sent as a Bearer token, for a private one.

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => {
  const i = args.indexOf(f);
  return i > -1 ? args[i + 1] : undefined;
};
const words = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && ["--cwd", "--dir", "--css", "--registry", "--version"].includes(args[i - 1])));
const [command, ...names] = words;
const cwd = resolve(opt("--cwd") ?? process.cwd());
const dry = flag("--dry-run");
const configPath = join(cwd, "syvna.json");

const REPO = "ValeBytes/syvna_ui_sdk";
/** This CLI's release: the SDK's one version, in the repo's root package.json. */
const VERSION = (() => {
  for (const up of ["../../../package.json", "../package.json"]) {
    try {
      const p = JSON.parse(readFileSync(new URL(up, import.meta.url), "utf8"));
      if (p.version && (p.name === "syvna-ui-sdk" || p.name === "syvna-ui")) return p.version;
    } catch {}
  }
  return "0.0.0";
})();
/** The registry as it was at a release. */
const registryAt = (v) => process.env.SYVNA_REGISTRY ?? `https://raw.githubusercontent.com/${REPO}/v${v}/packages/ui/registry`;

const say = (s) => process.stdout.write(s + "\n");
const fail = (s) => {
  process.stderr.write(`syvna-ui: ${s}\n`);
  process.exit(1);
};

function loadConfig() {
  if (!existsSync(configPath)) fail("no syvna.json here. Run: npx syvna-ui init");
  return JSON.parse(readFileSync(configPath, "utf8"));
}

async function fetchJson(registry, path) {
  if (!/^https?:/.test(registry)) {
    const file = join(resolve(cwd, registry), path);
    if (!existsSync(file)) throw new Error(`not found: ${path}`);
    return JSON.parse(readFileSync(file, "utf8"));
  }
  const url = `${registry.replace(/\/$/, "")}/${path}`;
  const headers = process.env.SYVNA_REGISTRY_TOKEN ? { Authorization: `Bearer ${process.env.SYVNA_REGISTRY_TOKEN}` } : {};
  const res = await fetch(url, { headers });
  if (res.status === 401) throw new Error("the registry wants a token: set SYVNA_REGISTRY_TOKEN.");
  if (res.status === 403) throw new Error("this token can't read the registry.");
  if (res.status === 404) throw new Error(`not found: ${path}`);
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  return res.json();
}

/** "DateRangePicker" or "date-range-picker" or "daterange" → the item that holds it. */
function findItem(index, name) {
  const want = name.toLowerCase().replace(/[-_\s]/g, "");
  return (
    index.items.find((i) => i.name.toLowerCase().replace(/[-_]/g, "") === want) ??
    index.items.find((i) => i.components.some((c) => c.toLowerCase() === want))
  );
}

/** Each item after the items it needs; cycles stopped. */
async function resolveAll(registry, start) {
  const order = [];
  const seen = new Set();
  const visit = async (name, path = []) => {
    if (seen.has(name)) return;
    if (path.includes(name)) return;
    const item = await fetchJson(registry, `r/${name}.json`);
    for (const d of item.registryDependencies ?? []) await visit(d, [...path, name]);
    seen.add(name);
    order.push(item);
  };
  for (const s of start) await visit(s);
  return order;
}

function packageManager() {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return ["pnpm", "add"];
  if (existsSync(join(cwd, "yarn.lock"))) return ["yarn", "add"];
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) return ["bun", "add"];
  return ["npm", "install"];
}

function writeIndex(config) {
  const dir = join(cwd, config.dir);
  const lines = ["// Written by syvna-ui: what's been added. Import from here.", 'export * from "./cx";'];
  for (const name of [...config.installed].sort()) {
    if (name === "core") continue;
    lines.push(`export * from "./components/${name}";`);
  }
  if (!dry) writeFileSync(join(dir, "index.ts"), lines.join("\n") + "\n");
}

async function add(config, requested) {
  const index = await fetchJson(config.registry, "index.json");
  const start = [];
  for (const n of requested) {
    const item = findItem(index, n);
    if (!item) fail(`nothing called "${n}". Try: npx syvna-ui list ${n}`);
    start.push(item.name);
  }
  const items = await resolveAll(config.registry, ["core", ...start]);
  const dir = join(cwd, config.dir);
  const deps = new Set();
  let wrote = 0;
  let kept = 0;
  for (const item of items) {
    for (const d of item.dependencies ?? []) deps.add(d);
    for (const f of item.files) {
      const target = join(dir, f.path);
      if (existsSync(target) && !flag("--overwrite")) {
        kept++;
        continue;
      }
      say(`${dry ? "would write" : "wrote"} ${relative(cwd, target)}`);
      if (!dry) {
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, f.content);
      }
      wrote++;
    }
    if (!config.installed.includes(item.name)) config.installed.push(item.name);
  }
  if (kept) say(`kept ${kept} file${kept === 1 ? "" : "s"} that already exist (--overwrite replaces them)`);

  const pkgPath = join(cwd, "package.json");
  const have = existsSync(pkgPath) ? (() => { const p = JSON.parse(readFileSync(pkgPath, "utf8")); return { ...p.dependencies, ...p.devDependencies }; })() : {};
  const missing = [...deps].filter((d) => !have[d.replace(/(.)@.*$/, "$1")]);
  if (missing.length) {
    const [pm, verb] = packageManager();
    const cmd = `${pm} ${verb} ${missing.join(" ")}`;
    if (flag("--no-install") || dry) say(`needs: ${cmd}`);
    else {
      say(`$ ${cmd}`);
      execSync(cmd, { cwd, stdio: "inherit" });
    }
  }
  if (!dry) writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  writeIndex(config);
  const comps = items.flatMap((i) => (start.includes(i.name) ? i.components : []));
  say(`${dry ? "Would add" : "Added"} ${comps.join(", ") || start.join(", ") || "the core files"} (${wrote} file${wrote === 1 ? "" : "s"}). Import from "${config.alias}".`);
}

/** The newest release, from GitHub. */
async function latest() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`couldn't find the latest release (${res.status}); name one: npx syvna-ui upgrade 0.2.0`);
  return (await res.json()).tag_name.replace(/^v/, "");
}

/**
 * Moves the app's components to another release. A file the app has changed
 * since it was copied (it differs from the release it came from) is kept,
 * unless --force; the rest are replaced. Items the new release needs that
 * the app doesn't have yet are added.
 */
async function upgrade(config, wanted) {
  const to = (wanted ?? (await latest())).replace(/^v/, "");
  if (to === config.version) return say(`Already on v${to}.`);
  const from = config.registry;
  const next = registryAt(to);
  say(`Syvna UI v${config.version ?? "?"} → v${to}`);
  const items = await resolveAll(next, config.installed);
  const dir = join(cwd, config.dir);
  const plan = { replace: [], add: [], keep: [], same: 0 };
  for (const item of items) {
    const old = await fetchJson(from, `r/${item.name}.json`).catch(() => null);
    for (const f of item.files) {
      const target = join(dir, f.path);
      if (!existsSync(target)) {
        plan.add.push({ target, content: f.content });
        continue;
      }
      const mine = readFileSync(target, "utf8").replace(/\r\n/g, "\n");
      if (mine === f.content) {
        plan.same++;
        continue;
      }
      const before = old?.files.find((x) => x.path === f.path)?.content;
      if (before !== undefined && mine !== before && !flag("--force")) plan.keep.push({ target });
      else plan.replace.push({ target, content: f.content });
    }
  }
  for (const f of plan.replace) say(`  update  ${relative(cwd, f.target)}`);
  for (const f of plan.add) say(`  add     ${relative(cwd, f.target)}`);
  for (const f of plan.keep) say(`  kept    ${relative(cwd, f.target)} (you changed it; --force replaces it)`);
  say(`${plan.replace.length} to update, ${plan.add.length} to add, ${plan.keep.length} kept, ${plan.same} unchanged.`);
  if (dry) return;
  if (!flag("--yes")) return say(`Run again with --yes to apply. What changed: https://github.com/${REPO}/blob/v${to}/CHANGELOG.md`);
  for (const f of [...plan.replace, ...plan.add]) {
    mkdirSync(dirname(f.target), { recursive: true });
    writeFileSync(f.target, f.content);
  }
  for (const item of items) if (!config.installed.includes(item.name)) config.installed.push(item.name);
  config.version = to;
  config.registry = next;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  writeIndex(config);
  say(`Now on v${to}.`);
}

async function main() {
  if (!command || command === "help" || flag("--help")) {
    say(readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 15).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
    return;
  }
  if (command === "init") {
    const srcDir = existsSync(join(cwd, "src")) ? "src/" : "";
    const config = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, "utf8"))
      : {
          version: opt("--version") ?? VERSION,
          registry: opt("--registry") ?? registryAt(opt("--version") ?? VERSION),
          dir: opt("--dir") ?? `${srcDir}components/syvna`,
          alias: `@/components/syvna`,
          css: opt("--css") ?? [`${srcDir}app/globals.css`, "app/globals.css", "src/index.css", "styles/globals.css"].find((p) => existsSync(join(cwd, p))) ?? `${srcDir}app/globals.css`,
          installed: [],
        };
    if (!dry) writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
    say(`${dry ? "would write" : "wrote"} syvna.json (Syvna UI v${config.version ?? VERSION}; components go to ${config.dir})`);
    await add(config, []);
    const cssFile = join(cwd, config.css);
    const rel = (f) => relative(dirname(cssFile), join(cwd, config.dir, f)).replace(/\\/g, "/");
    const imports = [`@import "./${rel("theme.css")}";`, `@import "./${rel("tokens.css")}";`].map((l) => l.replace('"./../', '"../'));
    if (existsSync(cssFile)) {
      const css = readFileSync(cssFile, "utf8");
      const missing = imports.filter((l) => !css.includes(l));
      if (missing.length) {
        const next = css.includes('@import "tailwindcss"') ? css.replace(/(@import "tailwindcss";?\n)/, `$1${missing.join("\n")}\n`) : `@import "tailwindcss";\n${missing.join("\n")}\n${css}`;
        if (!dry) writeFileSync(cssFile, next);
        say(`${dry ? "would add" : "added"} the theme to ${config.css}`);
      }
    } else say(`Add these to your CSS, after @import "tailwindcss":\n  ${imports.join("\n  ")}`);
    say('Then: npx syvna-ui add Button Input');
    return;
  }
  if (command === "add") {
    if (!names.length) fail("say what to add: npx syvna-ui add DateRangePicker");
    await add(loadConfig(), names);
    return;
  }
  if (command === "list") {
    const config = existsSync(configPath) ? loadConfig() : { registry: registryAt(VERSION), installed: [] };
    const index = await fetchJson(config.registry, "index.json");
    const q = names.join(" ").toLowerCase();
    for (const i of index.items) {
      if (!i.components.length) continue;
      const text = `${i.name} ${i.components.join(" ")} ${i.description}`.toLowerCase();
      if (q && !q.split(/\s+/).every((w) => text.includes(w))) continue;
      say(`${config.installed.includes(i.name) ? "✓" : " "} ${i.name.padEnd(12)} ${i.components.join(", ")}`);
    }
    return;
  }
  if (command === "version") {
    say(`syvna-ui ${VERSION}`);
    if (existsSync(configPath)) {
      const c = loadConfig();
      say(`this app: v${c.version ?? "?"} (${c.installed.length} items from ${c.registry})`);
    }
    return;
  }
  if (command === "upgrade") {
    await upgrade(loadConfig(), names[0]);
    return;
  }
  fail(`unknown command "${command}". Commands: init, add, list, upgrade, version`);
}

main().catch((e) => fail(e.message));
