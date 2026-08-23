import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroField, HeroTilt } from "@/components/hero-field";
import { SiteHeader } from "@/components/site-header";
import { LocaleToggle } from "@/components/locale-toggle";
import { LocaleProvider } from "@/components/locale/locale-provider";
import { StorySavedView } from "@/components/story/story-saved-view";
import { ShareLocaleSync } from "@/components/story/share-locale-sync";
import {
  StoryPageCta,
  StoryPageFooter,
  StoryPageHero,
} from "@/components/story/story-page-sections";
import { getStory, storyForLocale } from "@/lib/stories";
import { dictionary, isLocale, type Locale } from "@/lib/i18n/dictionary";
import { siteName, siteDescription, publicUrl, shareStoryPath } from "@/lib/site";

function resolveShareLocale(lang: string | undefined): Locale {
  return isLocale(lang) ? lang : "en";
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { lang } = await searchParams;
  const story = await getStory(id);
  const locale = resolveShareLocale(lang);
  const url = publicUrl(shareStoryPath(id, locale));

  if (!story) {
    return {
      title: "Story not found",
      description: siteDescription,
      robots: { index: false, follow: false },
    };
  }

  const displayStory = storyForLocale(story, locale);

  return {
    title: displayStory.title,
    description: displayStory.summary,
    alternates: { canonical: url },
    openGraph: {
      title: displayStory.title,
      description: displayStory.summary,
      type: "website",
      url,
      siteName,
      locale: locale === "es" ? "es_ES" : "en_US",
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
      title: displayStory.title,
      description: displayStory.summary,
      images: ["/opengraph-image"],
    },
  };
}

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const story = await getStory(id);

  if (!story) {
    notFound();
  }

  const shareLocale = resolveShareLocale(lang);
  const t = dictionary[shareLocale];
  const mode = story.mode === "mock" ? "mock" : "ai";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader>
        <LocaleToggle />
      </SiteHeader>

      <main className="flex-1">
        <div className="relative overflow-hidden">
          <div
            data-hero-stage
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div className="bauhaus-grid absolute inset-0 hidden opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] motion-reduce:block" />
            <HeroTilt>
              <HeroField />
            </HeroTilt>
          </div>

          <StoryPageHero
            title={t.sharePage.of(story.username)}
            handle={`@${story.githubLogin}`}
          />
        </div>

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          <LocaleProvider initialLocale={shareLocale}>
            <Suspense fallback={null}>
              <ShareLocaleSync />
            </Suspense>
            <StorySavedView
              key={`${story.id}-${shareLocale}`}
              storyId={story.id}
              githubLogin={story.githubLogin}
              username={story.username}
              story={story.story}
              data={story.data}
              mode={mode}
              authoredLocale={story.authoredLocale}
              savedTranslations={story.translations}
            />
          </LocaleProvider>
        </section>

        <StoryPageCta
          title={t.sharePage.writeYours}
          description={t.sharePage.ctaDesc}
          buttonLabel={t.sharePage.tellYours}
        />
      </main>

      <StoryPageFooter tagline={t.footer.tagline} />
    </div>
  );
}
