// Wix Madefor: the default faces (tokens.json). Geist Mono for code.
import "@fontsource-variable/wix-madefor-text";
import "@fontsource-variable/wix-madefor-display";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
// For the look controls' font choice.
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/fraunces";
import "./globals.css";

import type { Metadata } from "next";
import Script from "next/script";

import { DocsShell } from "@/components/docs-shell";
import { themeScript } from "@/lib/theme-script";

export const metadata: Metadata = {
  title: { default: "Syvna UI", template: "%s · Syvna UI" },
  description: "The components every Syvna app is built from.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="system" suppressHydrationWarning>
      <body>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <DocsShell>{children}</DocsShell>
      </body>
    </html>
  );
}
