import { auth } from "@/auth";
import { cookies } from "next/headers";
import { GithubSignIn } from "@/components/auth/github-sign-in";
import { UserMenu } from "@/components/auth/user-menu";
import { HeroTitle } from "@/components/hero-title";
import { FadeIn } from "@/components/motion/fade-in";
import { SiteHeader } from "@/components/site-header";
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
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import type { Locale, Messages } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, GitCommit, Sparkles, TerminalSquare } from "lucide-react";

import { HeroScrollCue } from "@/components/hero-scroll-cue";
import { HeroField, HeroTilt } from "@/components/hero-field";

const FEATURE_ICONS = [GitCommit, Sparkles, TerminalSquare];
const FEATURE_ICON_COLORS = [
  "text-bauhaus-deep",
  "text-bauhaus-cyan",
  "text-bauhaus-sky",
];
const FEATURE_CORNER = [
  "bg-bauhaus-deep",
  "bg-bauhaus-yellow",
  "bg-bauhaus-pink",
];

async function HeroCta({ t }: { t: Messages }) {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="pointer-events-auto flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {t.hero.signedInAs}{" "}
          <span className="font-mono text-foreground">
            {session.user.username ?? session.user.name}
          </span>
        </p>
        <Button asChild size="lg" variant="outline">
          <Link href="#story">
            {t.hero.seeData}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }

  return <GithubSignIn label={t.hero.cta} size="lg" />;
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
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pt-10 pb-24 sm:px-6 sm:pt-12"
    >
      <StoryPreview initialData={preview} initialError={error} />
      <div className="mt-20 mb-16">
        <Marquee />
      </div>
      <StoryGenerator />
    </section>
  );
}

export default async function Home() {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("devstory-locale")?.value;
  const locale: Locale = isLocale(storedLocale) ? storedLocale : "en";
  const t = dictionary[locale];
  const session = await auth();
  const scrollTarget = session?.user ? "#story" : "#features";

  return (
    <>
      <SiteHeader>
        <UserMenu />
      </SiteHeader>

      <main className="flex-1">
        <section className="relative flex h-svh w-full flex-col overflow-hidden">
          <div
            data-hero-stage
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div className="bauhaus-grid absolute inset-0 hidden opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] motion-reduce:block" />
            <HeroTilt>
              <HeroField />
            </HeroTilt>
          </div>

          <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
            <div className="pointer-events-none flex min-h-0 flex-1 flex-col items-center justify-center pt-14 text-center sm:pt-16">
              <FadeIn>
                <span className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-white px-3 py-1 font-mono text-xs font-bold tracking-[0.2em] text-black uppercase shadow-hard-sm dark:bg-black dark:text-white">
                  <span className="inline-block size-2 animate-[blink-dot_1.6s_ease-in-out_infinite] rounded-none bg-bauhaus-cyan" />
                  {t.hero.badge}
                </span>
              </FadeIn>

              <HeroTitle first={t.hero.titleFirst} second={t.hero.titleSecond} />

              <FadeIn delay={0.2}>
                <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
                  {t.hero.subtitle}
                </p>
              </FadeIn>

              <FadeIn delay={0.3} className="mt-8 sm:mt-10">
                <HeroCta t={t} />
              </FadeIn>
            </div>

            <div className="flex shrink-0 justify-center pb-8 sm:pb-10">
              <HeroScrollCue href={scrollTarget} label={t.hero.scrollDown} />
            </div>
          </div>
        </section>

        <StorySection />

        <section
          id="features"
          className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6"
        >
          <FadeIn>
            <h2 className="text-center font-heading text-2xl font-black tracking-normal text-balance uppercase sm:text-3xl">
              {t.features.title}
              <span className="ml-2 inline-block size-3 rounded-full border-2 border-foreground bg-bauhaus-yellow" />
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {FEATURE_ICONS.map((Icon, i) => {
              const feature = t.features[i === 0 ? "one" : i === 1 ? "two" : "three"];
              return (
                <FadeIn key={i} delay={0.1 * i}>
                  <Card className="relative h-full bg-card shadow-hard transition-transform duration-200 hover:-translate-y-1">
                    <span className={`absolute top-3 right-3 size-3 rotate-45 ${FEATURE_CORNER[i]}`} />
                    <CardHeader>
                      <span className="mb-1 flex size-9 items-center justify-center rounded-none border-2 border-foreground bg-bauhaus-sky/20 shadow-hard-sm">
                        <Icon className={cn("size-5", FEATURE_ICON_COLORS[i])} />
                      </span>
                      <CardTitle>{feature.t}</CardTitle>
                      <CardDescription>{feature.d}</CardDescription>
                    </CardHeader>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-foreground bg-foreground text-background">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-8 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
            <ArrowRight className="size-3 text-bauhaus-yellow" />
            {t.footer.tagline}
          </span>
          <span className="font-mono text-xs font-bold tracking-widest uppercase">
            Your Dev Story © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}
