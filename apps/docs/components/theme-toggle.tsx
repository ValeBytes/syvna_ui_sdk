"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Tabs } from "@syvna/ui";

type Mode = "system" | "light" | "dark";

/** Light, dark, or the system's: kept in this browser, set on <html data-theme>. */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        setMode(saved);
        // Again here: React can redraw <html> without what the early script set.
        document.documentElement.dataset.theme = saved;
      }
    } catch {}
  }, []);
  const pick = (m: string) => {
    const next = m as Mode;
    setMode(next);
    if (next === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <Tabs
      variant="pills"
      label="Theme"
      value={mode}
      onValueChange={pick}
      items={[
        { value: "light", label: <><Sun size={15} /><span className="sr-only">Light</span></> },
        { value: "dark", label: <><Moon size={15} /><span className="sr-only">Dark</span></> },
        { value: "system", label: <><Monitor size={15} /><span className="sr-only">System</span></> },
      ]}
    />
  );
}
