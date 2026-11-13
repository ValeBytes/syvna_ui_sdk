"use client";

import { actionsForms } from "./actions-forms";
import { agent } from "./agent";
import { business } from "./business";
import { dataLayout } from "./data-layout";
import { more } from "./more";
import { shell } from "./shell";
import { site } from "./site";
import type { Doc } from "./types";

/** Every component's playground, by name. */
export const registry: Record<string, Doc> = Object.fromEntries([...shell, ...actionsForms, ...dataLayout, ...more, ...site, ...agent, ...business].map((d) => [d.name, d]));
