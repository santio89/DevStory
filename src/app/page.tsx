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

const LANGUAGES = [
  { name: "JavaScript", color: "#f7df1e" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Python", color: "#3776ab" },
  { name: "Rust", color: "#dea584" },
  { name: "Go", color: "#00add8" },
];

const FEATURE_ICONS = [GitCommit, Sparkles, TerminalSquare];
const FEATURE_ICON_COLORS = [
  "text-sky-400",
  "text-cyan-400",
  "text-blue-400",
];

async function HeroCta({ t }: { t: Messages }) {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-3">
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
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pb-24 sm:px-6"
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

  return (
    <>
      <SiteHeader>
        <UserMenu />
      </SiteHeader>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-64 left-1/2 h-[560px] w-[960px] -translate-x-1/2 rounded-full bg-sky-500/25 blur-[140px]" />
            <div className="absolute top-24 -right-24 h-[420px] w-[420px] rounded-full bg-fuchsia-500/15 blur-[120px]" />
            <div className="absolute bottom-0 -left-32 h-[380px] w-[380px] rounded-full bg-violet-500/12 blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, color-mix(in srgb, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 7%, transparent) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-36">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1 font-mono text-xs text-muted-foreground">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-cyan-400" />
                </span>
                {t.hero.badge}
              </span>
            </FadeIn>

            <HeroTitle first={t.hero.titleFirst} second={t.hero.titleSecond} />

            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
                {t.hero.subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-10 flex flex-col items-center gap-6">
              <HeroCta t={t} />
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
              {t.features.title}
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {FEATURE_ICONS.map((Icon, i) => {
              const feature = t.features[i === 0 ? "one" : i === 1 ? "two" : "three"];
              return (
                <FadeIn key={i} delay={0.1 * i}>
                  <Card className="h-full bg-muted/40 ring-1 ring-border/50 transition-colors hover:ring-cyan-400/40">
                    <CardHeader>
                      <Icon className={cn("size-5", FEATURE_ICON_COLORS[i])} />
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

      <footer className="border-t border-border/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-8 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ArrowRight className="size-3 text-cyan-400" />
            {t.footer.tagline}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            DevStory © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}
