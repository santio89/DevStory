import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { HeroField, HeroTilt } from "@/components/hero-field";
import { SiteHeader } from "@/components/site-header";
import { LocaleToggle } from "@/components/locale-toggle";
import { StorySavedView } from "@/components/story/story-saved-view";
import {
  StoryPageCta,
  StoryPageFooter,
  StoryPageHero,
} from "@/components/story/story-page-sections";
import { getStory } from "@/lib/stories";
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import { siteName, siteDescription, publicUrl } from "@/lib/site";
import type { Messages } from "@/lib/i18n/dictionary";

async function getLocale(): Promise<Messages> {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("devstory-locale")?.value;
  return dictionary[isLocale(storedLocale) ? storedLocale : "en"];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const story = await getStory(id);
  const url = publicUrl(`/story/${id}`);

  if (!story) {
    return {
      title: "Story not found",
      description: siteDescription,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: story.title,
    description: story.summary,
    alternates: { canonical: url },
    openGraph: {
      title: story.title,
      description: story.summary,
      type: "website",
      url,
      siteName,
      locale: "en_US",
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
      title: story.title,
      description: story.summary,
      images: ["/opengraph-image"],
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getStory(id);

  if (!story) {
    notFound();
  }

  const t = await getLocale();
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
          <StorySavedView
            key={story.id}
            storyId={story.id}
            githubLogin={story.githubLogin}
            username={story.username}
            story={story.story}
            data={story.data}
            mode={mode}
            authoredLocale={story.authoredLocale}
          />
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
