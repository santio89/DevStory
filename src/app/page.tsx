import { cookies } from "next/headers";
import type { Metadata } from "next";
import { HeroField, HeroTilt } from "@/components/hero-field";
import { HomeExperience } from "@/components/home-experience";
import { LocaleToggle } from "@/components/locale-toggle";
import { FadeIn } from "@/components/motion/fade-in";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";
import { siteName } from "@/lib/site";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";
import { cn } from "@/lib/utils";
import { ArrowRight, GitCommit, Sparkles, TerminalSquare } from "lucide-react";

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}): Promise<Metadata> {
  const { u } = await searchParams;
  if (!u) return {};

  const normalized = normalizeGitHubUsername(u).toLowerCase();
  if (!isValidGitHubUsername(normalized)) return {};

  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("devstory-locale")?.value;
  const locale: Locale = isLocale(storedLocale) ? storedLocale : "en";
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
  searchParams: Promise<{ u?: string }>;
}) {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("devstory-locale")?.value;
  const locale: Locale = isLocale(storedLocale) ? storedLocale : "en";
  const t = dictionary[locale];
  const { u: initialUsername } = await searchParams;

  return (
    <>
      <SiteHeader>
        <LocaleToggle />
      </SiteHeader>

      <main className="flex-1">
        <HomeExperience
          initialUsername={initialUsername}
          hero={t.hero}
          heroBackground={
            <div
              data-hero-stage
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              <div className="bauhaus-grid absolute inset-0 hidden opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] motion-reduce:block" />
              <HeroTilt>
                <HeroField />
              </HeroTilt>
            </div>
          }
        />

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
              const feature =
                t.features[i === 0 ? "one" : i === 1 ? "two" : "three"];
              return (
                <FadeIn key={i} delay={0.1 * i}>
                  <Card className="relative h-full bg-card shadow-hard transition-transform duration-200 hover:-translate-y-1">
                    <span
                      className={`absolute top-3 right-3 size-3 rotate-45 ${FEATURE_CORNER[i]}`}
                    />
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
            {siteName} © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}
