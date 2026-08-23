"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale/locale-provider";
import { setLocaleCookie } from "@/app/actions";

export function ShareLocaleSync() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    void setLocaleCookie(locale);
  }, [locale]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (locale === "en") {
      if (!params.has("lang")) return;
      params.delete("lang");
      const query = params.toString();
      const next = query ? `${pathname}?${query}` : pathname;
      window.history.replaceState(null, "", next);
      return;
    }

    if (params.get("lang") === locale) return;
    params.set("lang", locale);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  }, [locale, pathname, searchParams]);

  return null;
}
