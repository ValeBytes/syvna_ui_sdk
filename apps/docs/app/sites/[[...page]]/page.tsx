import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { products } from "@/components/sites/catalogue";
import { Landing, Pricing } from "@/components/sites/northwind";
import { CartPage, Checkout, ProductPage, Store } from "@/components/sites/shop";

export const metadata: Metadata = { title: "Website templates" };

/** /sites/<page>: Northwind's landing and pricing pages, and Casa Verde's shop. */
export default async function SitePage({ params, searchParams }: { params: Promise<{ page?: string[] }>; searchParams: Promise<{ c?: string }> }) {
  const { page = [] } = await params;
  const { c } = await searchParams;
  const [first = "landing", second, third] = page;
  if (first === "landing" && !second) return <Landing />;
  if (first === "pricing" && !second) return <Pricing />;
  if (first === "shop") {
    if (!second) return <Store key={c ?? "All"} category={c} />;
    if (second === "cart") return <CartPage />;
    if (second === "checkout") return <Checkout />;
    if (second === "product" && third && products.some((p) => p.slug === third)) return <ProductPage key={third} slug={third} />;
  }
  notFound();
}
