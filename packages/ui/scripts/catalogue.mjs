// Writes catalogue.json: every component @syvna/ui exports, what it's for
// (its doc comment), the file it's in, and its props with their types,
// defaults and doc comments, read from the source by TypeScript. The docs
// site's props tables and agents both read this one file, so a prop's
// documentation lives only in its comment in the component.
//
// node scripts/catalogue.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const program = ts.createProgram([join(root, "src/index.ts")], {
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  skipLibCheck: true,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022,
});
const checker = program.getTypeChecker();
const index = program.getSourceFile(join(root, "src/index.ts"));
const moduleSymbol = checker.getSymbolAtLocation(index);

const doc = (sym) => ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();

// Defaults, from the destructuring in the component's signature: { size = "md" }.
function defaults(decl) {
  const out = {};
  const fn = ts.isVariableDeclaration(decl)
    ? decl.initializer && ts.isCallExpression(decl.initializer)
      ? decl.initializer.arguments[0]
      : decl.initializer
    : decl;
  const param = fn && "parameters" in fn ? fn.parameters[0] : undefined;
  if (param && ts.isObjectBindingPattern(param.name)) {
    for (const el of param.name.elements) {
      if (el.initializer) out[(el.propertyName ?? el.name).getText()] = el.initializer.getText();
    }
  }
  return out;
}

const exports = checker.getExportsOfModule(moduleSymbol);
const byName = new Map(exports.map((e) => [e.getName(), e]));
const components = [];
for (const sym of exports) {
  const name = sym.getName();
  if (!/^[A-Z]/.test(name)) continue;
  const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
  const decl = target.valueDeclaration;
  if (!decl) continue; // a type
  const propsSym = byName.get(`${name}Props`);
  const props = [];
  if (propsSym) {
    const propsTarget = propsSym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(propsSym) : propsSym;
    const iface = propsTarget.declarations?.[0];
    const own = new Set(
      iface && ts.isInterfaceDeclaration(iface) ? iface.members.map((m) => m.name?.getText()).filter(Boolean) : [],
    );
    const type = checker.getDeclaredTypeOfSymbol(propsTarget);
    const dflt = defaults(decl);
    for (const p of checker.getPropertiesOfType(type)) {
      if (!own.has(p.getName())) continue; // inherited HTML attributes: not listed
      const pd = p.valueDeclaration;
      const t = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(p, pd));
      // A union of string literals ("primary" | "secondary"): its values, for controls and agents.
      const values = t.isUnion() && t.types.every((u) => u.isStringLiteral()) ? t.types.map((u) => u.value) : undefined;
      props.push({
        name: p.getName(),
        // As written in the source ("ButtonVariant", "React.ReactNode"), not resolved to file paths.
        type: pd.type ? pd.type.getText().replace(/\s+/g, " ") : checker.typeToString(t),
        ...(values ? { values } : {}),
        required: !(p.flags & ts.SymbolFlags.Optional),
        default: dflt[p.getName()],
        description: doc(p) || (p.getName() === "className" ? "More classes; one here wins over the component's own of the same kind." : ""),
      });
    }
    const heritage = iface && ts.isInterfaceDeclaration(iface) ? iface.heritageClauses?.map((h) => h.types.map((t) => t.getText()).join(", ")).join(", ") : undefined;
    if (heritage) props.push({ name: "...rest", type: heritage, required: false, description: "Every attribute of the element it renders." });
  }
  components.push({
    name,
    summary: doc(target),
    file: relative(root, decl.getSourceFile().fileName).replaceAll("\\", "/"),
    props,
  });
}

writeFileSync(join(root, "catalogue.json"), JSON.stringify({ package: "@syvna/ui", components }, null, 2) + "\n");
console.log(`catalogue.json: ${components.length} components`);
