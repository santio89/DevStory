import { isLocale, type Locale } from "@/lib/i18n/dictionary";

/** Resolve UI locale from URL param, with optional share-page default. */
export function resolveAppLocale(
  lang: string | undefined,
  cookieLocale: string | undefined,
  options?: { sharePage?: boolean },
): Locale {
  if (isLocale(lang)) return lang;
  if (options?.sharePage) return "en";
  return isLocale(cookieLocale) ? cookieLocale : "en";
}
