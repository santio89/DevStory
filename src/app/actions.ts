"use server";

import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";

export async function setLocaleCookie(locale: string) {
  const value: Locale = isLocale(locale) ? locale : "en";
  (await cookies()).set("devstory-locale", value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}