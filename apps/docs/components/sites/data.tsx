"use client";

// The shop's cart, kept above the pages (in frame.tsx) so it survives moving between them.

import { createContext, useContext, useState } from "react";
import type { CartLine } from "@syvna/ui";

import { products, type Product } from "./catalogue";

type Cart = {
  lines: CartLine[];
  add: (p: Product, colour?: string, quantity?: number) => void;
  setQuantity: (id: string, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const mug = products[0]!;
  const [lines, setLines] = useState<CartLine[]>([{ id: `${mug.slug}:Sage`, name: mug.name, variant: "Sage", image: mug.photos[0], price: mug.price, quantity: 2, max: mug.stock }]);
  const cart: Cart = {
    lines,
    add: (p, colour = p.colours[0], quantity = 1) =>
      setLines((l) => {
        const id = `${p.slug}:${colour}`;
        const has = l.find((x) => x.id === id);
        if (has) return l.map((x) => (x.id === id ? { ...x, quantity: Math.min(p.stock, x.quantity + quantity) } : x));
        return [...l, { id, name: p.name, variant: colour, image: p.photos[0], price: p.price, quantity, max: p.stock }];
      }),
    setQuantity: (id, q) => setLines((l) => l.map((x) => (x.id === id ? { ...x, quantity: q } : x))),
    remove: (id) => setLines((l) => l.filter((x) => x.id !== id)),
    clear: () => setLines([]),
  };
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart(): Cart {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
