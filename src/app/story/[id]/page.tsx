import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { HeroStageBackground } from "@/components/hero-stage";
import { SiteHeader } from "@/components/site-header";
import { LocaleToggle } from "@/components/locale-toggle";
import { SiteFooter } from "@/components/site-footer";
import { StorySavedView } from "@/components/story/story-saved-view";
import {
  StoryPageCta,
  StoryPageHero,
} from "@/components/story/story-page-sections";
import { getStory, storyForLocale } from "@/lib/stories";
import { resolveAppLocale } from "@/lib/locale/resolve";
import { siteName, siteDescription, publicUrl, shareStoryPath } from "@/lib/site";

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
  const cookieStore = await cookies();
  const locale = resolveAppLocale(lang, cookieStore.get("devstory-locale")?.value, {
    sharePage: true,
  });
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
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const story = await getStory(id);

  if (!story) {
    notFound();
  }

  const mode = story.mode === "mock" ? "mock" : "ai";

  return (
    <>
      <SiteHeader>
        <LocaleToggle />
      </SiteHeader>

      <main className="flex-1">
        <div className="relative min-h-[clamp(17rem,38vh,26rem)] overflow-hidden">
          <HeroStageBackground variant="share" />
          <StoryPageHero username={story.username} githubLogin={story.githubLogin} />
        </div>

        <section className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pt-8 pb-24 sm:px-6">
          <StorySavedView
            storyId={story.id}
            githubLogin={story.githubLogin}
            username={story.username}
            story={story.story}
            data={story.data}
            mode={mode}
            authoredLocale={story.authoredLocale}
            savedTranslations={story.translations}
          />
        </section>

        <StoryPageCta />
      </main>

      <SiteFooter />
    </>
  );
}
