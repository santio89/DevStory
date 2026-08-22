"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { setLocaleCookie } from "@/app/actions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionary";

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();

  async function switchLocale(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    try {
      await setLocaleCookie(next);
    } catch {}
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
          onClick={() => void switchLocale(code)}
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
