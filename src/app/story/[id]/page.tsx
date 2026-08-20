import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { StoryContent } from "@/components/story/story-content";
import { getDb, hasDatabase } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import type { Messages } from "@/lib/i18n/dictionary";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

async function getStory(id: string) {
  if (!hasDatabase()) return null;
  const db = getDb();
  const [row] = await db.select().from(stories).where(eq(stories.id, id));
  return row ?? null;
}

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

  if (!story) {
    return { title: "Story not found · DevStory" };
  }

  return {
    title: `${story.title} · DevStory`,
    description: story.summary,
    openGraph: {
      title: story.title,
      description: story.summary,
      type: "website",
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
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {t.common.shareTagline}
        </span>
      </SiteHeader>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-28 pb-10 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-fuchsia-500/12 blur-[140px]" />
            <div className="absolute -bottom-24 right-0 h-[320px] w-[320px] rounded-full bg-cyan-400/12 blur-[120px]" />
          </div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {t.sharePage.of(story.username)}
          </p>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          <StoryContent story={story.story} mode={mode} />
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-sky-400/[0.14] via-transparent to-blue-500/[0.1] p-8 text-center sm:p-12">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.sharePage.writeYours}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              {t.sharePage.ctaDesc}
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/">
                {t.sharePage.tellYours}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}