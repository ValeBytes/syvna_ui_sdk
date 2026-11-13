import { readFile } from "node:fs/promises";
import { join } from "node:path";

import catalogue from "@syvna/ui/catalogue.json";

export type Prop = {
  name: string;
  type: string;
  values?: string[];
  required: boolean;
  default?: string;
  description: string;
};
export type Entry = { name: string; summary: string; file: string; props: Prop[] };

export const components = catalogue.components as Entry[];

export function entry(name: string): Entry | undefined {
  return components.find((c) => c.name === name);
}

/** The library's folder: the docs run from apps/docs in the workspace. */
export const ui = join(process.cwd(), "..", "..", "packages", "ui");

/** A component's guide, packages/ui/docs/<Name>.md. */
export async function guide(name: string): Promise<string> {
  try {
    return await readFile(join(ui, "docs", `${name}.md`), "utf8");
  } catch {
    return "";
  }
}
