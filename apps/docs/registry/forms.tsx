"use client";

import { Button, Field, FormPage, formPageVariants, Input, Select, Switch, Textarea, type FormPageVariant } from "@syvna/ui";

import { jsx, raw, str } from "./code";
import type { Doc } from "./types";

// A shop's settings: what a real form page holds, in four sections.
function settings() {
  return [
    {
      id: "store",
      title: "Store details",
      description: "Shown on receipts, invoices and the shop's own pages.",
      children: (
        <>
          <Field label="Store name">
            <Input name="name" defaultValue="Casa Verde Ceramics" />
          </Field>
          <Field label="Web address" hint="Changing it breaks old links to the shop.">
            <Input name="slug" defaultValue="casa-verde" addonBefore="syvna.shop/" />
          </Field>
          <Field label="About the shop" hint="One or two sentences for the shop's front page.">
            <Textarea name="about" rows={3} defaultValue="Stoneware made in small batches in our studio in Lisbon." />
          </Field>
        </>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      description: "Where customers and couriers reach you.",
      children: (
        <>
          <Field label="Email for customers">
            <Input name="email" type="email" defaultValue="hello@casaverde.example" />
          </Field>
          <Field label="Phone" hint="With the country code.">
            <Input name="phone" defaultValue="+351 21 123 4567" />
          </Field>
          <Field label="Return address">
            <Textarea name="address" rows={3} defaultValue={"Rua da Madalena 120\n1100-340 Lisboa\nPortugal"} />
          </Field>
        </>
      ),
    },
    {
      id: "money",
      title: "Payments and tax",
      description: "How prices are shown and what each sale is taxed.",
      children: (
        <>
          <Field label="Currency">
            <Select name="currency" defaultValue="EUR" options={[{ value: "EUR", label: "Euro (€)" }, { value: "USD", label: "US dollar ($)" }, { value: "GBP", label: "Pound sterling (£)" }]} />
          </Field>
          <Field label="VAT number" hint="Printed on every invoice.">
            <Input name="vat" defaultValue="PT 515 288 104" />
          </Field>
          <Switch name="vatIncluded" defaultChecked label="Prices include VAT" description="Customers see the price they pay." />
        </>
      ),
    },
    {
      id: "notices",
      title: "Notifications",
      description: "What you hear about, by email.",
      advanced: true,
      rows: [
        { label: "New orders", description: "An email for each order, with what to pack.", control: <Switch name="orders" defaultChecked aria-label="New orders" />, value: "On" },
        { label: "Running low", description: "When a product has five or fewer left.", control: <Switch name="stock" defaultChecked aria-label="Running low" />, value: "On" },
        { label: "New reviews", description: "A daily summary of what customers wrote.", control: <Switch name="reviews" aria-label="New reviews" />, value: "Off" },
      ],
    },
    {
      id: "danger",
      title: "Close the shop",
      description: "Takes the shop offline and cancels open orders. Customers keep their receipts.",
      tone: "danger" as const,
      actions: (
        <Button type="button" variant="danger-soft">
          Close the shop…
        </Button>
      ),
    },
  ];
}

const preview = (
  <div className="flex flex-col gap-3 text-label">
    <div className="rounded-md border border-line bg-ground p-4">
      <div className="font-display text-subtitle font-semibold text-ink">Casa Verde Ceramics</div>
      <div className="text-ink-3">syvna.shop/casa-verde</div>
      <p className="m-0 mt-2 text-ink-2">Stoneware made in small batches in our studio in Lisbon.</p>
    </div>
    <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-label">
      <dt className="text-ink-3">Currency</dt>
      <dd className="m-0 text-ink">Euro, VAT included</dd>
      <dt className="text-ink-3">Emails</dt>
      <dd className="m-0 text-ink">Orders, running low</dd>
    </dl>
  </div>
);

export const forms: Doc[] = [
  {
    name: "FormPage",
    controls: { variant: { type: "select", options: formPageVariants, default: "annotated" } },
    stage: "block p-6",
    preview: (v) => (
      <form onSubmit={(e) => e.preventDefault()} className="w-full">
        <FormPage
          key={str(v.variant)}
          variant={str(v.variant) as FormPageVariant}
          sections={settings()}
          note="Last saved 12 minutes ago"
          title="Shop settings"
          aside={preview}
          asideTitle="Preview"
          actions={
            <>
              <Button type="submit" variant="primary">
                Save changes
              </Button>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </>
          }
        />
      </form>
    ),
    code: (v) =>
      jsx("FormPage", {
        variant: str(v.variant),
        sections: raw('[{ id: "store", title: "Store details", description: "Shown on receipts…", children: <>…fields…</> }]'),
        actions: raw('<><Button type="submit" variant="primary">Save changes</Button><Button variant="ghost">Cancel</Button></>'),
        note: "Last saved 12 minutes ago",
      }, undefined, { variant: "annotated" }),
  },
];
