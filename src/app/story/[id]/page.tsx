import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { StoryContent } from "@/components/story/story-content";
import { getDb, hasDatabase } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

async function getStory(id: string) {
  if (!hasDatabase()) return null;
  const db = getDb();
  const [row] = await db.select().from(stories).where(eq(stories.id, id));
  return row ?? null;
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

  const mode = story.mode === "mock" ? "mock" : "ai";

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
          >
            <span className="inline-block size-2 rounded-full bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.6)]" />
            DevStory
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            a story from the invisible hours
          </span>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden pt-14 pb-10 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[140px]" />
            <div className="absolute -bottom-24 right-0 h-[320px] w-[320px] rounded-full bg-blue-500/10 blur-[120px]" />
          </div>
          <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
            {story.username}&apos;s DevStory
          </p>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          <StoryContent story={story.story} mode={mode} />
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-400/[0.08] via-transparent to-blue-500/[0.08] p-8 text-center sm:p-12">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Write your own story.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
              Every commit is a chapter. Connect GitHub and let DevStory turn
              your invisible hours into a narrative timeline.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/">
                Tell your story
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}