"use client";

import { createContext, useContext, useState } from "react";
import { dictionary, isLocale, type Locale, type Messages } from "@/lib/i18n/dictionary";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: dictionary.en,
});

function resolveInitialLocale(initialLocale: Locale): Locale {
  if (typeof window === "undefined") return initialLocale;

  const lang = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(lang)) return lang;

  if (window.location.pathname.startsWith("/story/")) return "en";

  return initialLocale;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(() =>
    resolveInitialLocale(initialLocale),
  );
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: dictionary[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}