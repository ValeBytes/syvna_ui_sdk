"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Select, Toaster } from "@syvna/ui";

import { LookControls, LookProvider, Stage, useLook } from "../look";
import { base, pages } from "./catalogue";
import { CartProvider } from "./data";

function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [look, setLook] = useLook();
  const scroller = useRef<HTMLDivElement>(null);
  // A new page starts at its top, as it would in a browser.
  useEffect(() => {
    if (!location.hash) scroller.current?.scrollTo({ top: 0 });
  }, [path]);
  const current = path.startsWith(`${base}/shop/product`) ? "shop/product/hand-thrown-mug" : (pages.find((p) => path === `${base}/${p.value}`)?.value ?? "landing");

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-12 z-20 -mx-(--page-x) -mt-(--page-y) border-b border-line bg-ground/90 backdrop-blur-md">
        <LookControls look={look} setLook={setLook} both={false} flat>
          <Select aria-label="Page" className="w-[210px]" value={current} onChange={(e) => router.push(`${base}/${e.target.value}`)} options={pages.map((p) => ({ value: p.value, label: p.label }))} />
        </LookControls>
      </div>
      <Stage look={look} wide className="block h-[calc(100dvh-7rem)] min-h-[520px] p-0 lg:h-[800px]">
        {() => (
          <CartProvider>
            <div ref={scroller} className="h-full overflow-y-auto scroll-smooth">
              {children}
            </div>
            <Toaster />
          </CartProvider>
        )}
      </Stage>
    </div>
  );
}

/** The website templates' frame: the look, a page picker, and the site in a scrolling stage. */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <LookProvider>
      <Frame>{children}</Frame>
    </LookProvider>
  );
}
