"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { writeLocaleCookie } from "@/lib/locale/cookie";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionary";

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();

  function switchLocale(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    writeLocaleCookie(next);
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">{t.common.toggleLocale}</span>
      {(
        [
          { code: "en", label: "EN" },
          { code: "es", label: "ES" },
        ] as const
      ).map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLocale(code)}
          className={cn(
            "rounded-none border-2 px-2 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-200",
            locale === code
              ? "border-foreground bg-bauhaus-deep text-white shadow-hard-sm"
              : "border-foreground bg-card text-foreground hover:bg-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
