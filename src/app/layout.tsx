import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/motion-provider";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { isLocale, type Locale } from "@/lib/i18n/dictionary";
import { THEME_SCRIPT } from "@/lib/theme";
import { siteName, siteDescription, siteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("devstory-locale")?.value;
  const locale: Locale = isLocale(storedLocale) ? storedLocale : "en";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s · ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      siteName,
      locale: locale === "es" ? "es_ES" : "en_US",
      url: siteUrl,
      title: siteName,
      description: siteDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("devstory-locale")?.value;
  const locale: Locale = isLocale(storedLocale) ? storedLocale : "en";

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`dark ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <LocaleProvider initialLocale={locale}>
          <MotionProvider>{children}</MotionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}