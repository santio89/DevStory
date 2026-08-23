import { cookies } from "next/headers";
import type { Metadata } from "next";
import { HeroStageBackground } from "@/components/hero-stage";
import { HomeExperience } from "@/components/home-experience";
import { HomeFeatures } from "@/components/home-features";
import { LocaleToggle } from "@/components/locale-toggle";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";
import { dictionary } from "@/lib/i18n/dictionary";
import { resolveAppLocale } from "@/lib/locale/resolve";
import { siteName } from "@/lib/site";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; lang?: string }>;
}): Promise<Metadata> {
  const { u, lang } = await searchParams;
  if (!u) return {};

  const normalized = normalizeGitHubUsername(u).toLowerCase();
  if (!isValidGitHubUsername(normalized)) return {};

  const cookieStore = await cookies();
  const locale = resolveAppLocale(lang, cookieStore.get("devstory-locale")?.value);
  const t = dictionary[locale];

  const title = t.generator.titleFor(normalized);
  const description = t.share.blurbFor(`@${normalized}`);

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; lang?: string }>;
}) {
  const { u: initialUsername } = await searchParams;

  return (
    <>
      <SiteHeader>
        <LocaleToggle />
      </SiteHeader>

      <main className="flex-1">
        <HomeExperience
          initialUsername={initialUsername}
          heroBackground={<HeroStageBackground />}
        />

        <HomeFeatures />
      </main>

      <SiteFooter />
    </>
  );
}
