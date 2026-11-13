// Writes .canvas/test.html: every canvas preview in a frame, loaded the way
// the canvas loads it (tokens, bundle.css, React 18, bundle.js), so they can
// be checked locally before publishing. Serve packages/ui (the ui-kit launch
// config, :4400) and open /.canvas/test.html; window.errs lists any errors.
//
// node scripts/check.mjs

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, ".canvas/project/components");
const head =
  '<base href="/.canvas/"><link rel="stylesheet" href="../src/tokens.css"><link rel="stylesheet" href="project/components/bundle.css">' +
  '<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>' +
  '<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>' +
  '<script src="project/components/bundle.js"></script>';
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const theme = process.argv.includes("--dark") ? "dark" : "light";

let html =
  '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:sans-serif;background:#ccc}h2{font:600 13px sans-serif;margin:16px 16px 4px}iframe{display:block;border:0;margin:0 16px;background:#fff}</style></head><body>';
for (const c of readdirSync(dir).sort()) {
  const file = join(dir, c, "preview.html");
  if (!existsSync(file)) continue;
  let p = readFileSync(file, "utf8");
  const height = Number(/height=(\d+)/.exec(p)?.[1] ?? 200);
  const width = Number(/width=(\d+)/.exec(p)?.[1] ?? 960);
  p = p
    .replace("<head>", "<head>" + head)
    .replace("<html", `<html data-theme="${theme}"`)
    .replace("<body>", `<body><script>window.onerror=function(m){parent.postMessage(${JSON.stringify(c)}+": "+m,"*")}</script>`);
  html += `<h2>${c}</h2><iframe data-name="${c}" width="${width}" height="${Math.max(height, 80)}" srcdoc="${esc(p)}"></iframe>`;
}
html += '<script>window.errs=[];addEventListener("message",function(e){errs.push(e.data)})</script></body></html>';
writeFileSync(join(root, ".canvas/test.html"), html);
console.log("wrote .canvas/test.html");
