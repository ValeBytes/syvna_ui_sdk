"use client";

import { Plus, Search } from "lucide-react";
import { Button, ButtonGroup, Checkbox, CopyButton, Field, Input, Select, SplitButton, Spinner, Switch, Textarea, ToggleButton, buttonVariants, fieldVariants, type FieldVariant, type InputProps } from "@syvna/ui";


import { bool, jsx, num, raw, str } from "./code";
import type { Doc } from "./types";

const countries = [
  { value: "br", label: "Brazil" },
  { value: "de", label: "Germany" },
  { value: "in", label: "India" },
  { value: "ng", label: "Nigeria" },
  { value: "jp", label: "Japan" },
  { value: "us", label: "United States" },
];

/** The Input playground's "extra": one of the field's extras, as props. */
function extras(e: string): Partial<InputProps> {
  switch (e) {
    case "clearable":
      return { clearable: true, defaultValue: "amara@okafor.ng" };
    case "counter":
      return { counter: true, maxLength: 40, defaultValue: "amara@okafor.ng" };
    case "loading":
      return { loading: true, defaultValue: "amara" };
    case "valid":
      return { valid: true, defaultValue: "amara@okafor.ng" };
    case "copyable":
      return { copyable: true, readOnly: true, defaultValue: "ord_8f3a91c2" };
    case "shortcut":
      return { shortcut: "⌘K" };
    case "addons":
      return { addonBefore: "https://", addonAfter: ".com", placeholder: "your-shop" };
    case "action":
      return {
        action: (
          <Button size="xs" variant="soft">
            Verify
          </Button>
        ),
      };
    default:
      return {};
  }
}

function extraCode(e: string): Record<string, ReturnType<typeof raw> | string | number | boolean> {
  switch (e) {
    case "clearable":
      return { clearable: true };
    case "counter":
      return { counter: true, maxLength: 40 };
    case "loading":
      return { loading: true };
    case "valid":
      return { valid: true };
    case "copyable":
      return { copyable: true, readOnly: true };
    case "shortcut":
      return { shortcut: "⌘K" };
    case "addons":
      return { addonBefore: "https://", addonAfter: ".com" };
    case "action":
      return { action: raw('<Button size="xs" variant="soft">Verify</Button>') };
    default:
      return {};
  }
}

export const actionsForms: Doc[] = [
  {
    name: "Button",
    controls: {
      label: { type: "text", default: "Add customer" },
      variant: { type: "select", options: buttonVariants, default: "primary" },
      size: { type: "select", options: ["xs", "sm", "md", "lg", "xl"], default: "md" },
      shape: { type: "select", options: ["default", "pill", "square"], default: "default" },
      icon: { type: "boolean", default: true, label: "Icon" },
      iconOnly: { type: "boolean", default: false, label: "Icon only" },
      badge: { type: "boolean", default: false, label: "Count badge" },
      shortcut: { type: "boolean", default: false, label: "Shortcut hint" },
      loading: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false },
      all: { type: "boolean", default: false, label: `Show all ${buttonVariants.length}` },
    },
    stage: "items-start",
    preview: (v) => {
      const one = (variant: string) => (
        <Button
          key={variant}
          variant={variant as "primary"}
          size={str(v.size) as "md"}
          shape={str(v.shape) as "default"}
          loading={bool(v.loading)}
          disabled={bool(v.disabled)}
          badge={bool(v.badge) ? 3 : undefined}
          shortcut={bool(v.shortcut) ? "N" : undefined}
          icon={bool(v.icon) || bool(v.iconOnly) ? <Plus size={16} /> : undefined}
          aria-label={bool(v.iconOnly) ? str(v.label) : undefined}
        >
          {bool(v.iconOnly) ? undefined : variant === "dashed" ? "Add another" : str(v.label)}
        </Button>
      );
      return bool(v.all) ? (
        <div className="grid w-full gap-x-4 gap-y-4 sm:grid-cols-3">
          {buttonVariants.map((b) => (
            <div key={b} className="flex flex-col items-start gap-1.5">
              <span className="font-mono text-caption text-ink-3">{b}</span>
              {one(b)}
            </div>
          ))}
          <div className="flex flex-col items-start gap-1.5">
            <span className="font-mono text-caption text-ink-3">ButtonGroup</span>
            <ButtonGroup label="View">
              <Button size="sm">Day</Button>
              <Button size="sm">Week</Button>
              <Button size="sm">Month</Button>
            </ButtonGroup>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <span className="font-mono text-caption text-ink-3">SplitButton</span>
            <SplitButton menuLabel="More ways to save" items={[{ label: "Save as draft" }, { label: "Save and send" }]}>
              Save
            </SplitButton>
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <span className="font-mono text-caption text-ink-3">ToggleButton · CopyButton</span>
            <span className="flex gap-1.5">
              <ToggleButton size="sm" defaultPressed icon={<Plus size={14} />}>
                Follow
              </ToggleButton>
              <CopyButton value="ord_8f3a91c2" variant="secondary">
                Copy ID
              </CopyButton>
            </span>
          </div>
        </div>
      ) : (
        <div className="flex w-full justify-center">{one(str(v.variant))}</div>
      );
    },
    code: (v) =>
      jsx(
        "Button",
        {
          variant: str(v.variant),
          size: str(v.size),
          shape: str(v.shape),
          icon: bool(v.icon) || bool(v.iconOnly) ? raw("<Plus size={16} />") : undefined,
          badge: bool(v.badge) ? 3 : undefined,
          shortcut: bool(v.shortcut) ? "N" : undefined,
          loading: bool(v.loading),
          disabled: bool(v.disabled),
          "aria-label": bool(v.iconOnly) ? str(v.label) : undefined,
        },
        bool(v.iconOnly) ? undefined : str(v.label),
        { variant: "secondary", size: "md", shape: "default" },
      ),
  },
  {
    name: "Spinner",
    controls: { size: { type: "number", default: 20, min: 12, max: 48 }, label: { type: "text", default: "Loading" } },
    preview: (v) => (
      <span className="text-ink-2">
        <Spinner size={num(v.size)} label={str(v.label)} />
      </span>
    ),
    code: (v) => jsx("Spinner", { size: num(v.size), label: str(v.label) }, undefined, { size: 16, label: "Loading" }),
  },
  {
    name: "Field",
    controls: {
      label: { type: "text", default: "Email address" },
      hint: { type: "text", default: "We'll send the receipt here." },
      error: { type: "text", default: "" },
      required: { type: "boolean", default: true },
      aside: { type: "text", default: "" },
    },
    stage: "items-start",
    preview: (v) => (
      <Field
        className="w-full max-w-[360px]"
        label={str(v.label)}
        hint={str(v.hint) || undefined}
        error={str(v.error) || undefined}
        required={bool(v.required)}
        aside={str(v.aside) || undefined}
      >
        <Input type="email" placeholder="amara@example.com" required={bool(v.required)} />
      </Field>
    ),
    code: (v) =>
      jsx(
        "Field",
        { label: str(v.label), hint: str(v.hint), error: str(v.error), required: bool(v.required), aside: str(v.aside) },
        jsx("Input", { type: "email", placeholder: "amara@example.com", required: bool(v.required) }),
      ),
  },
  {
    name: "Input",
    controls: {
      variant: { type: "select", options: fieldVariants, default: "outline" },
      size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
      type: { type: "select", options: ["text", "email", "password"], default: "text" },
      label: { type: "text", default: "Email address", label: "label (floating, notched)" },
      placeholder: { type: "text", default: "amara@example.com" },
      leading: { type: "select", options: ["none", "icon", "$"], default: "none" },
      trailing: { type: "select", options: ["none", "kg", "USD"], default: "none" },
      extra: { type: "select", options: ["none", "clearable", "counter", "loading", "valid", "copyable", "shortcut", "addons", "action"], default: "none", label: "extra" },
      invalid: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false },
      gallery: { type: "boolean", default: true, label: `Show all ${fieldVariants.length}` },
    },
    stage: "items-start",
    preview: (v) =>
      bool(v.gallery) ? (
        <div className="grid w-full gap-x-6 gap-y-5 @container sm:grid-cols-2">
          {fieldVariants.map((fv) => (
            <div key={fv} className="flex flex-col gap-1.5">
              <span className="font-mono text-caption text-ink-3">{fv}</span>
              <Input
                variant={fv as FieldVariant}
                size={str(v.size) as "md"}
                type={str(v.type)}
                label={fv === "floating" || fv === "notched" || fv === "inline" ? (fv === "inline" ? "Email" : str(v.label)) : undefined}
                aria-label={str(v.label)}
                placeholder={fv === "floating" || fv === "notched" ? undefined : str(v.placeholder)}
                {...extras(str(v.extra))}
                defaultValue={str(v.type) === "password" ? "hunter22" : undefined}
                leading={v.leading === "icon" ? <Search size={15} /> : v.leading === "$" ? "$" : undefined}
                trailing={v.trailing === "none" ? undefined : str(v.trailing)}
                invalid={bool(v.invalid)}
                disabled={bool(v.disabled)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Input
          key={str(v.variant)}
          className="max-w-[360px]"
          variant={str(v.variant) as FieldVariant}
          size={str(v.size) as "md"}
          type={str(v.type)}
          label={str(v.variant) === "inline" ? "Email" : str(v.label)}
          aria-label={str(v.label)}
          placeholder={str(v.placeholder)}
          {...extras(str(v.extra))}
          leading={v.leading === "icon" ? <Search size={15} /> : v.leading === "$" ? "$" : undefined}
          trailing={v.trailing === "none" ? undefined : str(v.trailing)}
          invalid={bool(v.invalid)}
          disabled={bool(v.disabled)}
        />
      ),
    code: (v) =>
      jsx(
        "Input",
        {
          variant: str(v.variant),
          size: str(v.size),
          type: str(v.type),
          label: str(v.variant) === "floating" || str(v.variant) === "notched" ? str(v.label) : str(v.variant) === "inline" ? "Email" : undefined,
          "aria-label": str(v.variant) === "floating" || str(v.variant) === "notched" ? undefined : str(v.label),
          placeholder: str(v.placeholder),
          leading: v.leading === "icon" ? raw("<Search size={15} />") : v.leading === "$" ? "$" : undefined,
          trailing: v.trailing === "none" ? undefined : str(v.trailing),
          invalid: bool(v.invalid),
          disabled: bool(v.disabled),
          ...extraCode(str(v.extra)),
        },
        undefined,
        { variant: "outline", size: "md", type: "text" },
      ),
  },
  {
    name: "Textarea",
    controls: {
      variant: { type: "select", options: fieldVariants.filter((f) => f !== "floating" && f !== "notched"), default: "outline" },
      placeholder: { type: "text", default: "No nuts, please. We'll arrive around 7:30." },
      rows: { type: "number", default: 3, min: 2, max: 10 },
      invalid: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false },
    },
    preview: (v) => (
      <Textarea
        className="max-w-[420px]"
        variant={str(v.variant) as FieldVariant}
        aria-label="Note"
        placeholder={str(v.placeholder)}
        rows={num(v.rows)}
        invalid={bool(v.invalid)}
        disabled={bool(v.disabled)}
      />
    ),
    code: (v) =>
      jsx(
        "Textarea",
        { variant: str(v.variant), "aria-label": "Note", placeholder: str(v.placeholder), rows: num(v.rows), invalid: bool(v.invalid), disabled: bool(v.disabled) },
        undefined,
        { rows: 4, variant: "outline" },
      ),
  },
  {
    name: "Select",
    controls: {
      variant: { type: "select", options: fieldVariants.filter((f) => f !== "floating" && f !== "notched"), default: "outline" },
      size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
      placeholder: { type: "text", default: "Choose a country" },
      invalid: { type: "boolean", default: false },
      disabled: { type: "boolean", default: false },
    },
    preview: (v) => (
      <Select
        key={str(v.placeholder)}
        className="max-w-[320px]"
        aria-label="Country"
        variant={str(v.variant) as FieldVariant}
        size={str(v.size) as "md"}
        options={countries}
        placeholder={str(v.placeholder) || undefined}
        invalid={bool(v.invalid)}
        disabled={bool(v.disabled)}
      />
    ),
    code: (v) =>
      jsx("Select", {
        variant: str(v.variant) === "outline" ? undefined : str(v.variant),
        size: str(v.size) === "md" ? undefined : str(v.size),
        "aria-label": "Country",
        options: raw('[{ value: "br", label: "Brazil" }, { value: "de", label: "Germany" }, …]'),
        placeholder: str(v.placeholder),
        invalid: bool(v.invalid),
        disabled: bool(v.disabled),
      }),
  },
  {
    name: "Checkbox",
    controls: {
      label: { type: "text", default: "Share stock with the online shop" },
      description: { type: "text", default: "Items sold in store come off the website's count too." },
      defaultChecked: { type: "boolean", default: true, label: "Checked" },
      disabled: { type: "boolean", default: false },
    },
    preview: (v) => (
      <Checkbox
        key={String(v.defaultChecked)}
        label={str(v.label)}
        description={str(v.description) || undefined}
        defaultChecked={bool(v.defaultChecked)}
        disabled={bool(v.disabled)}
      />
    ),
    code: (v) =>
      jsx("Checkbox", { label: str(v.label), description: str(v.description), defaultChecked: bool(v.defaultChecked), disabled: bool(v.disabled) }),
  },
  {
    name: "Switch",
    controls: {
      label: { type: "text", default: "Online bookings" },
      description: { type: "text", default: "Customers can book from your website." },
      defaultChecked: { type: "boolean", default: true, label: "On" },
      disabled: { type: "boolean", default: false },
    },
    preview: (v) => (
      <Switch
        key={String(v.defaultChecked)}
        label={str(v.label)}
        description={str(v.description) || undefined}
        defaultChecked={bool(v.defaultChecked)}
        disabled={bool(v.disabled)}
      />
    ),
    code: (v) =>
      jsx("Switch", { label: str(v.label), description: str(v.description), defaultChecked: bool(v.defaultChecked), disabled: bool(v.disabled) }),
  },
];
