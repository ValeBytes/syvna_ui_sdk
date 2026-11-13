"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Input, Select, Switch, Tabs, cn } from "@syvna/ui";

import { registry } from "@/registry";
import type { Control, Values } from "@/registry/types";

import { CodeBlock } from "./code-block";
import { LookControls, Stage, useLook } from "./look";

function defaults(controls: Record<string, Control> = {}): Values {
  return Object.fromEntries(Object.entries(controls).map(([k, c]) => [k, c.default]));
}

function ControlInput({ name, control, value, onChange }: { name: string; control: Control; value: Values[string]; onChange: (v: Values[string]) => void }) {
  const label = control.label ?? name;
  if (control.type === "boolean") {
    return <Switch label={<span className="font-mono text-small font-normal text-ink-2">{label}</span>} checked={value === true} onCheckedChange={onChange} />;
  }
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-caption text-ink-3">{label}</span>
      {control.type === "select" && control.options.length <= 3 ? (
        <Tabs variant="pills" label={label} value={String(value)} onValueChange={onChange} items={control.options.map((o) => ({ value: o, label: o }))} />
      ) : control.type === "select" ? (
        <Select aria-label={label} size="sm" className="min-w-36" value={String(value)} onChange={(e) => onChange(e.target.value)} options={control.options.map((o) => ({ value: o, label: o }))} />
      ) : control.type === "number" ? (
        <Input aria-label={label} size="sm" className="w-24" type="number" min={control.min} max={control.max} step={control.step ?? 1} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} />
      ) : (
        <Input aria-label={label} size="sm" className="w-52" value={String(value)} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/**
 * A component's playground: a bar that stays at the top while the page
 * scrolls (the look, then the component's own controls), the component as
 * they set it, and the code for exactly what's shown.
 */
/** `children` (the guide, the props) go inside, so the bar stays up over the whole page. */
export function Playground({ name, children }: { name: string; children?: React.ReactNode }) {
  const doc = registry[name];
  const [values, setValues] = useState<Values>(() => defaults(doc?.controls));
  const [look, setLook] = useLook();
  const [showControls, setShowControls] = useState(true);
  if (!doc) return null;
  const wide = doc.stage?.includes("block");
  const controls = doc.controls ? Object.entries(doc.controls) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Sticks under the top bar, so the controls are in reach anywhere on the page. */}
      <div className="sticky top-12 z-20 -mx-(--page-x) -mt-(--page-y) flex flex-col border-b border-line bg-ground/90 backdrop-blur-md">
        <LookControls look={look} setLook={setLook} flat>
          {controls.length ? (
            <button
              type="button"
              aria-expanded={showControls}
              onClick={() => setShowControls(!showControls)}
              className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-surface-2 px-2.5 text-label font-medium text-ink hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-focus"
            >
              <SlidersHorizontal size={14} />
              {name}
              <ChevronDown size={14} className={cn("text-ink-3 transition-transform", showControls && "rotate-180")} />
            </button>
          ) : (
            <span className="text-label font-medium text-ink">{name}</span>
          )}
        </LookControls>
        {controls.length && showControls ? (
          <div className="flex max-h-[40vh] flex-wrap items-end gap-x-5 gap-y-3 overflow-y-auto border-t border-line px-(--page-x) py-2.5">
            {controls.map(([k, c]) => (
              <ControlInput key={k} name={k} control={c} value={values[k]!} onChange={(v) => setValues((s) => ({ ...s, [k]: v }))} />
            ))}
          </div>
        ) : null}
      </div>
      <Stage look={look} wide={wide} className={doc.stage}>
        {() => doc.preview(values)}
      </Stage>
      <CodeBlock code={doc.code(values)} />
      {children ? <div className="mt-6 flex flex-col gap-10">{children}</div> : null}
    </div>
  );
}
