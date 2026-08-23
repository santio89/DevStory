"use client";

import { useEffect, useState } from "react";
import { StoryView } from "@/components/story/story-view";
import { StoryChat } from "@/components/story/story-chat";
import { StoryTranslating } from "@/components/story/story-translating";
import { BrainProvider, useBrain } from "@/components/story/brain-provider";
import { useLocale } from "@/components/locale/locale-provider";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { DevStory } from "@/lib/devstory/story";
import type { Locale } from "@/lib/i18n/dictionary";

function StorySavedContent({
  storyId,
  githubLogin,
  username,
  story: initialStory,
  mode,
  authoredLocale,
  savedTranslations,
}: {
  storyId: string;
  githubLogin: string;
  username: string;
  story: DevStory;
  mode: "ai" | "mock";
  authoredLocale: Locale;
  savedTranslations: Partial<Record<Locale, DevStory>>;
}) {
  const { brain } = useBrain();
  const { t, locale } = useLocale();
  const [translations, setTranslations] = useState<
    Partial<Record<Locale, DevStory>>
  >(() => savedTranslations);
  const [failedLocales, setFailedLocales] = useState<Locale[]>([]);

  const translationFailed = failedLocales.includes(locale);
  const hasTranslation = locale === authoredLocale || Boolean(translations[locale]);
  const translating = Boolean(
    locale !== authoredLocale && !hasTranslation && !translationFailed,
  );
  const activeStory =
    locale === authoredLocale ? initialStory : (translations[locale] ?? initialStory);

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
            storyId,
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
  }, [initialStory, locale, authoredLocale, translations, storyId]);

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
        <StoryView
          story={activeStory}
          mode={mode}
          username={githubLogin}
          displayName={username}
          brain={brain}
          storyId={storyId}
        />
      )}

      <StoryChat
        story={activeStory}
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
  mode,
  authoredLocale,
  savedTranslations = {},
}: {
  storyId: string;
  githubLogin: string;
  username: string;
  story: DevStory;
  data: StoryDataSnapshot | null;
  mode: "ai" | "mock";
  authoredLocale: Locale;
  savedTranslations?: Partial<Record<Locale, DevStory>>;
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
        mode={mode}
        authoredLocale={authoredLocale}
        savedTranslations={savedTranslations}
      />
    </BrainProvider>
  );
}
