"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/fade-in";
import { Timeline } from "@/components/timeline/timeline";
import { StoryMoment } from "@/components/story/story-moment";
import { StoryPreview } from "@/components/story/story-preview";
import { StorySharePanel } from "@/components/story/story-share-panel";
import { StoryChat } from "@/components/story/story-chat";
import { StoryTranslating } from "@/components/story/story-translating";
import { BrainProvider, useBrain } from "@/components/story/brain-provider";
import { resolveToken, Sigil } from "@/components/story/sigil";
import { useLocale } from "@/components/locale/locale-provider";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { DevStory } from "@/lib/devstory/story";
import type { TokenId } from "@/lib/devstory/tokens";
import type { Locale } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";

function StorySavedContent({
  storyId,
  githubLogin,
  username,
  story: initialStory,
  authoredLocale,
}: {
  storyId: string;
  githubLogin: string;
  username: string;
  story: DevStory;
  authoredLocale: Locale;
}) {
  const { brain } = useBrain();
  const { t, locale } = useLocale();
  const [translations, setTranslations] = useState<
    Partial<Record<Locale, DevStory>>
  >({});
  const [failedLocales, setFailedLocales] = useState<Locale[]>([]);

  const translationFailed = failedLocales.includes(locale);
  const translating = Boolean(
    locale !== authoredLocale &&
      !translations[locale] &&
      !translationFailed,
  );
  const activeStory = translations[locale] ?? initialStory;

  useEffect(() => {
    if (locale === authoredLocale || translations[locale]) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/story/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story: initialStory,
            sourceLocale: authoredLocale,
            targetLocale: locale,
          }),
        });
        if (!res.ok) {
          if (active) {
            setFailedLocales((prev) =>
              prev.includes(locale) ? prev : [...prev, locale],
            );
          }
          return;
        }
        const json = (await res.json()) as { story: DevStory };
        if (active) {
          setTranslations((prev) => ({ ...prev, [locale]: json.story }));
        }
      } catch {
        if (active) {
          setFailedLocales((prev) =>
            prev.includes(locale) ? prev : [...prev, locale],
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [initialStory, locale, authoredLocale, translations]);

  const displayStory = activeStory;
  const fingerprint = displayStory.eras
    .map((era) => `${era.year}|${era.name}`)
    .join("§");
  const lastEra = displayStory.eras[displayStory.eras.length - 1] ?? displayStory.eras[0];
  const heroToken: TokenId = lastEra ? resolveToken(lastEra) : "sprout";
  const words = displayStory.title.split(/\s+/);
  const pivot = Math.floor(words.length / 2);

  return (
    <div className="space-y-10">
      {translationFailed && locale !== authoredLocale && (
        <p className="font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
          {t.generator.translationFailed}
        </p>
      )}

      {translating ? (
        <StoryTranslating />
      ) : (
        <>
          <Reveal variant="subtle">
        <div className="relative rounded-none border-2 border-foreground bg-card px-6 py-8 shadow-hard sm:px-10 sm:py-10">
        <span className="pointer-events-none absolute top-5 right-5 size-6 rounded-full border-2 border-foreground bg-bauhaus-sky/30" />
        <div className="pointer-events-none absolute -top-8 -right-8 opacity-[0.08]">
          <Sigil token={heroToken} className="size-56" />
        </div>
        <div className="relative">
          {displayStory.archetype && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-none border-2 border-foreground bg-bauhaus-pink/20 px-2.5 py-1 font-mono text-xs font-bold tracking-[0.2em] text-foreground uppercase shadow-hard-sm">
              <Award className="size-3 text-bauhaus-deep" />
              {t.story.archetype} · {displayStory.archetype}
            </span>
          )}
          <h1 className="mt-4 max-w-3xl font-heading text-3xl leading-[1.1] font-black tracking-normal text-balance uppercase sm:text-4xl">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={cn(i > 0 && i >= pivot && "text-bauhaus-deep")}
              >
                {word}{" "}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">
            {displayStory.summary}
          </p>
          <p className="mt-3 font-mono text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">
            @{githubLogin}
          </p>
        </div>
        </div>
      </Reveal>

      <Timeline eras={displayStory.eras} data={brain} />

      {displayStory.closing ? (
        <Reveal variant="subtle">
          <div className="relative rounded-none border-2 border-foreground bg-bauhaus-yellow p-6 text-bauhaus-ink shadow-hard sm:p-8">
          <span className="pointer-events-none absolute top-4 right-4 size-4 rotate-45 rounded-none bg-bauhaus-deep" />
          <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase">
            {t.story.closingLabel}
          </p>
          <p className="mt-3 font-heading text-lg leading-relaxed font-bold text-balance sm:text-xl">
            {displayStory.closing}
          </p>
        </div>
        </Reveal>
      ) : null}

      <StoryMoment
        key={fingerprint}
        story={displayStory}
        data={brain}
        fingerprint={fingerprint}
      />
        </>
      )}

      <StoryPreview username={githubLogin} />

      <StorySharePanel
        story={displayStory}
        storyId={storyId}
        username={githubLogin}
        displayName={username}
      />

      <StoryChat
        story={displayStory}
        brain={brain}
        username={githubLogin}
        storageScope={storyId}
      />
    </div>
  );
}

export function StorySavedView({
  storyId,
  githubLogin,
  username,
  story,
  data,
  authoredLocale,
}: {
  storyId: string;
  githubLogin: string;
  username: string;
  story: DevStory;
  data: StoryDataSnapshot | null;
  mode: "ai" | "mock";
  authoredLocale: Locale;
}) {
  return (
    <BrainProvider
      username={githubLogin}
      initialBrain={data}
      autoFetch={false}
    >
      <StorySavedContent
        storyId={storyId}
        githubLogin={githubLogin}
        username={username}
        story={story}
        authoredLocale={authoredLocale}
      />
    </BrainProvider>
  );
}
