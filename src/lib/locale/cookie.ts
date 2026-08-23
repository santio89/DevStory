const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function writeLocaleCookie(locale: string) {
  document.cookie = `devstory-locale=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}
