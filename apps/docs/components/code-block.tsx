"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, cn } from "@syvna/ui";

/** Code with a copy button. */
export function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // The clipboard can be refused; the code is still there to select.
    }
  };
  return (
    <div className={cn("group relative rounded-lg border border-line bg-surface-2", className)}>
      <pre className="m-0 overflow-x-auto p-4 pr-14 font-mono text-[13px]/[20px] text-ink">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2"
        aria-label={copied ? "Copied" : "Copy code"}
        icon={copied ? <Check size={14} /> : <Copy size={14} />}
        onClick={copy}
      />
    </div>
  );
}
