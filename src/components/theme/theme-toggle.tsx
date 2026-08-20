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
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-none border-2 border-foreground bg-background text-foreground shadow-hard-sm transition-all duration-200 hover:bg-muted active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="block size-4 dark:hidden" />
    </button>
  );
}