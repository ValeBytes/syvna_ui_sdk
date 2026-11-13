// Assembles the design-system canvas in .canvas/project, ready to publish:
// tokens.json and the guide (README.md), the built bundle (dist/canvas), and
// each component's guidelines and live preview (canvas/components).
//
// The index (design-system.json) is kept from the live canvas when
// .canvas/live-index.json holds it (read it from the artifact first), so a
// republish keeps what the page added; only lastChange and the bundle's
// libraries are set here.
//
// node scripts/canvas.mjs [--note "what changed"]

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".canvas/project");
const note = process.argv.includes("--note") ? process.argv[process.argv.indexOf("--note") + 1] : "Components from @syvna/ui";

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "components"), { recursive: true });

cpSync(join(root, "tokens.json"), join(out, "tokens.json"));
cpSync(join(root, "canvas/README.md"), join(out, "README.md"));
for (const f of ["bundle.js", "bundle.css", "index.d.ts"]) cpSync(join(root, "dist/canvas", f), join(out, "components", f));
for (const c of readdirSync(join(root, "canvas/components"))) {
  cpSync(join(root, "canvas/components", c), join(out, "components", c), { recursive: true });
}

const live = join(root, ".canvas/live-index.json");
const index = existsSync(live)
  ? JSON.parse(readFileSync(live, "utf8"))
  : {
      v: 3,
      layout: "files",
      createdOnFiles: { v: 1, at: new Date().toISOString() },
      title: "Syvna UI",
      namespace: "Syvna",
      sections: {},
      groups: [],
      assetGroups: {},
      blobs: {},
      docs: { readme: "project/README.md", sections: [] },
    };
index.namespace = "Syvna";
index.libraries = [
  { name: "react", version: "18" },
  { name: "react-dom", version: "18" },
];
index.lastChange = { by: "Claude", at: new Date().toISOString(), via: "Claude Code", note };
writeFileSync(join(root, ".canvas/design-system.json"), JSON.stringify(index, null, 2) + "\n");

const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else files.push(p.slice(join(root, ".canvas").length + 1).replaceAll("\\", "/"));
  }
};
walk(out);
console.log(`${files.length} files in .canvas/project, index in .canvas/design-system.json`);
