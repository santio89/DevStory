"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale/locale-provider";
import { writeLocaleCookie } from "@/lib/locale/cookie";
import { isLocale } from "@/lib/i18n/dictionary";

function LocaleUrlSyncInner() {
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const langParam = searchParams.get("lang");
  const onSharePage = pathname.startsWith("/story/");
  const cookieWritten = useRef<string | null>(null);

  // Sync URL -> locale only when the URL changes (navigation), not when the user
  // toggles language — otherwise stale searchParams fight replaceState updates.
  useEffect(() => {
    if (isLocale(langParam)) {
      setLocale(langParam);
      return;
    }

    if (onSharePage) {
      setLocale("en");
    }
  }, [langParam, onSharePage, setLocale]);

  useEffect(() => {
    if (cookieWritten.current === locale) return;
    cookieWritten.current = locale;
    writeLocaleCookie(locale);
  }, [locale]);

  useEffect(() => {
    const params = new URLSearchParams(query);
    let nextUrl: string;

    if (locale === "en") {
      if (!params.has("lang")) return;
      params.delete("lang");
      const nextQuery = params.toString();
      nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    } else {
      if (params.get("lang") === locale) return;
      params.set("lang", locale);
      nextUrl = `${pathname}?${params.toString()}`;
    }

    const currentUrl = `${pathname}${window.location.search}`;
    if (currentUrl === nextUrl) return;

    const scrollY = window.scrollY;
    window.history.replaceState(null, "", nextUrl);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }, [locale, pathname, query]);

  return null;
}

export function LocaleUrlSync() {
  return (
    <Suspense fallback={null}>
      <LocaleUrlSyncInner />
    </Suspense>
  );
}
