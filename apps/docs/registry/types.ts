// What a component's docs page is made of. One entry per component, in
// registry/<group>.tsx; meta.ts lists them in order. The page adds the props
// table (from @syvna/ui/catalogue.json) and the guide (packages/ui/docs/<Name>.md).

export type Control =
  | { type: "select"; options: readonly string[]; default: string; label?: string }
  | { type: "boolean"; default: boolean; label?: string }
  | { type: "text"; default: string; label?: string }
  | { type: "number"; default: number; min: number; max: number; step?: number; label?: string };

/** The playground's current values, one per control. */
export type Values = Record<string, string | boolean | number>;

export interface Doc {
  name: string;
  /** The playground's controls, by prop name. */
  controls?: Record<string, Control>;
  /** The component as the controls set it. */
  preview: (v: Values) => React.ReactNode;
  /** The code for exactly what preview shows. */
  code: (v: Values) => string;
  /** Classes for the preview area: its height, its alignment. */
  stage?: string;
}
