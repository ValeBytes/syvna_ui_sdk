// Cuts a release of the SDK: one version for the library, the CLI and the MCP
// server.
//
//   npm run release -- minor          0.1.0 → 0.2.0 (new components, props, variants)
//   npm run release -- patch          0.1.0 → 0.1.1 (fixes, nothing to change in apps)
//   npm run release -- major          0.1.0 → 1.0.0 (something apps must change)
//   npm run release -- 0.1.0          that version exactly (the first release)
//   add --dry-run to see what it would do
//
// It checks the tree is clean and on main, sets the version everywhere,
// rebuilds the catalogue and registry (stamped with the version), turns the
// CHANGELOG's "Unreleased" section into this release's, commits "Release
// vX.Y.Z" and tags vX.Y.Z. It doesn't push: run the command it prints. The
// tag reaching GitHub publishes the Release (.github/workflows/release.yml),
// and apps can then take components from it.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const bump = args.find((a) => !a.startsWith("--"));
const sh = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
const fail = (m) => {
  console.error(`release: ${m}`);
  process.exit(1);
};

if (!bump) fail("say how: npm run release -- patch | minor | major | 1.2.3");

// ---- the tree ----
const branch = sh("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") fail(`on ${branch}; releases are cut from main.`);
const dirty = sh("git status --porcelain");
if (dirty && !dry) fail(`commit or stash these first:\n${dirty}`);

// ---- the version ----
const rootPkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const current = rootPkg.version;
const [ma, mi, pa] = current.split(".").map(Number);
const next =
  bump === "major" ? `${ma + 1}.0.0` : bump === "minor" ? `${ma}.${mi + 1}.0` : bump === "patch" ? `${ma}.${mi}.${pa + 1}` : /^\d+\.\d+\.\d+$/.test(bump) ? bump : fail(`"${bump}" isn't patch, minor, major or x.y.z`);
const tags = sh("git tag --list v*").split("\n").filter(Boolean);
if (tags.includes(`v${next}`)) fail(`v${next} is already released.`);

// ---- the changelog ----
const logPath = join(root, "CHANGELOG.md");
const log = readFileSync(logPath, "utf8");
const m = log.match(/## Unreleased\n([\s\S]*?)(?=\n## |$)/);
const notes = m?.[1].trim();
if (!notes) fail('write what changed under "## Unreleased" in CHANGELOG.md first: apps read it before upgrading.');
const today = new Date().toISOString().slice(0, 10);
const nextLog = log.replace(/## Unreleased\n[\s\S]*?(?=\n## |$)/, `## Unreleased\n\n## v${next} (${today})\n\n${notes}\n`);

console.log(`Syvna UI v${current} → v${next}${dry ? " (dry run)" : ""}\n\n${notes}\n`);
if (dry) process.exit(0);

// ---- write it ----
for (const p of ["package.json", "packages/ui/package.json", "packages/cli/package.json", "packages/mcp/package.json"]) {
  const file = join(root, p);
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  pkg.version = next;
  writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
}
writeFileSync(logPath, nextLog);
execSync("node packages/ui/scripts/catalogue.mjs && node packages/ui/scripts/registry.mjs", { cwd: root, stdio: "inherit" });
sh("git add -A");
sh(`git commit -m "Release v${next}"`);
sh(`git tag -a v${next} -m "Syvna UI v${next}"`);
console.log(`\nCommitted and tagged v${next}. Publish it with:\n\n  git push origin main --follow-tags\n`);
