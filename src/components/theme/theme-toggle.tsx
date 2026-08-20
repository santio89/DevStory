"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";
import { useLocale } from "@/components/locale/locale-provider";

export function ThemeToggle() {
  const { t } = useLocale();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t.common.toggleTheme}
      title={t.common.toggleTheme}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-muted-foreground transition-colors hover:text-foreground [.glass-header_&]:border-border/60 [.glass-header_&]:bg-muted/40 [.glass-header_&]:hover:border-foreground/20"
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="block size-4 dark:hidden" />
    </button>
  );
}