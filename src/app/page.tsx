import { auth } from "@/auth";
import { GithubSignIn } from "@/components/auth/github-sign-in";
import { UserMenu } from "@/components/auth/user-menu";
import { HeroTitle } from "@/components/hero-title";
import { FadeIn } from "@/components/motion/fade-in";
import { Marquee } from "@/components/story/marquee";
import { StoryGenerator } from "@/components/story/story-generator";
import { StoryPreview } from "@/components/story/story-preview";
import {
  buildDevStoryData,
  toPreviewData,
  type StoryPreviewData,
} from "@/lib/devstory/aggregate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, GitCommit, Sparkles, TerminalSquare } from "lucide-react";

const LANGUAGES = [
  { name: "JavaScript", color: "#f7df1e" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Python", color: "#3776ab" },
  { name: "Rust", color: "#dea584" },
  { name: "Go", color: "#00add8" },
];

const FEATURES = [
  {
    icon: GitCommit,
    title: "Every commit is a chapter",
    description:
      "We read your repository history, from the first hello world to your latest refactor, and find the moments that mattered.",
  },
  {
    icon: Sparkles,
    title: "AI-written narrative",
    description:
      "A language model trained as your biographer turns raw git data into eras: The Hello World Era, The Framework Awakening.",
  },
  {
    icon: TerminalSquare,
    title: "A timeline that moves you",
    description:
      "Scroll through a beautifully animated vertical timeline that builds your story in front of your eyes.",
  },
];

async function HeroCta() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-mono text-foreground">
            {session.user.username ?? session.user.name}
          </span>
        </p>
        <Button asChild size="lg" variant="outline">
          <Link href="#story">
            See your harvested GitHub data
            <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <GithubSignIn
      label="Connect GitHub to see your invisible hours"
      size="lg"
    />
  );
}

async function StorySection() {
  const session = await auth();
  if (!session?.user || !session.accessToken) return null;

  let preview: StoryPreviewData | null = null;
  let error: string | null = null;

  try {
    const data = await buildDevStoryData(session.accessToken);
    preview = toPreviewData(data);
  } catch (fetchError) {
    console.error("Failed to build DevStory data:", fetchError);
    error = "Couldn't reach GitHub with your token. Try signing in again.";
  }

  return (
    <section
      id="story"
      className="mx-auto w-full max-w-5xl scroll-mt-16 px-4 pb-24 sm:px-6"
    >
      <StoryPreview initialData={preview} initialError={error} />
      <div className="mt-20 mb-16">
        <Marquee />
      </div>
      <StoryGenerator />
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="inline-block size-2 rounded-full bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.6)]" />
            DevStory
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-48 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[140px]" />
            <div className="absolute top-24 -right-24 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-[120px]" />
            <div className="absolute bottom-0 -left-32 h-[380px] w-[380px] rounded-full bg-violet-500/10 blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(255 255 255 / 60%) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 60%) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-36">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-muted-foreground">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                </span>
                Your invisible hours, validated
              </span>
            </FadeIn>

            <HeroTitle />

            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
                Every late-night debug. Every green build. Every repo you
                abandoned at 3am. DevStory reads your GitHub history and turns
                it into a narrative timeline of your growth as a developer.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-10 flex flex-col items-center gap-6">
              <HeroCta />
              <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                {LANGUAGES.map((lang) => (
                  <span key={lang.name} className="flex items-center gap-1.5">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ backgroundColor: lang.color, boxShadow: `0 0 8px 1px ${lang.color}66` }}
                    />
                    {lang.name}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <StorySection />

        <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
          <FadeIn>
            <h2 className="text-center font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              How it works
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={0.1 * i}>
                <Card className="h-full bg-zinc-900/40 ring-1 ring-border/50 transition-colors hover:ring-foreground/20">
                  <CardHeader>
                    <feature.icon className="size-5 text-amber-400" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-8 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ArrowRight className="size-3 text-amber-400" />
            commits are letters, repos are chapters
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            DevStory © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}
