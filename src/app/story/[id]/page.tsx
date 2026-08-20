import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { StoryContent } from "@/components/story/story-content";
import { FloatingSymbol } from "@/components/motion/floating-symbol";
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
    return { title: "Story not found · Your Dev Story" };
  }

  return {
    title: `${story.title} · Your Dev Story`,
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
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="bauhaus-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
            <FloatingSymbol
              className="pointer-events-auto absolute right-[10%] bottom-2 rounded-none border-2 border-foreground bg-bauhaus-deep px-2.5 py-1 font-mono text-base font-black text-white shadow-hard-sm"
              idleRotate={6}
            >
              {"&&"}
            </FloatingSymbol>
            <FloatingSymbol
              className="pointer-events-auto absolute bottom-8 left-[8%] rounded-none border-2 border-foreground bg-bauhaus-yellow px-2.5 py-1 font-mono text-sm font-black text-bauhaus-ink shadow-hard-sm"
              drift={2}
              idleRotate={-3}
            >
              {"{ }"}
            </FloatingSymbol>
          </div>
          <p className="font-mono text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase">
            {t.sharePage.of(story.username)}
          </p>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          <StoryContent story={story.story} mode={mode} />
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
          <div className="relative rounded-none border-2 border-foreground bg-bauhaus-deep p-8 text-center text-white shadow-hard-lg sm:p-12">
            <span className="pointer-events-none absolute top-6 left-6 size-4 rotate-45 rounded-none bg-bauhaus-yellow" />
            <span className="pointer-events-none absolute right-8 bottom-8 size-10 rounded-full border-2 border-white/40" />
            <h2 className="font-heading text-2xl font-black tracking-tight uppercase sm:text-3xl">
              {t.sharePage.writeYours}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              {t.sharePage.ctaDesc}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 bg-white text-bauhaus-deep hover:bg-bauhaus-paper"
            >
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