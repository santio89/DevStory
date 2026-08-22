"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StoryView } from "@/components/story/story-view";
import { StoryChat } from "@/components/story/story-chat";
import { StoryTranslating } from "@/components/story/story-translating";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { Locale } from "@/lib/i18n/dictionary";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "devstory-story";

type PersistedStory = {
  story: DevStory;
  mode: "ai" | "mock";
  storyId: string | null;
  authoredLocale: Locale;
  translations: Partial<Record<Locale, DevStory>>;
  data: StoryDataSnapshot | null;
};

export function StoryGenerator() {
  const { t, locale } = useLocale();
  const [story, setStory] = useState<DevStory | null>(null);
  const [authoredLocale, setAuthoredLocale] = useState<Locale>("en");
  const [translations, setTranslations] = useState<
    Partial<Record<Locale, DevStory>>
  >({});
  const [mode, setMode] = useState<"ai" | "mock" | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [data, setData] = useState<StoryDataSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as PersistedStory;
        if (!parsed?.story) return;
        setStory(parsed.story);
        setMode(parsed.mode ?? "mock");
        setStoryId(parsed.storyId ?? null);
        setAuthoredLocale(parsed.authoredLocale ?? "en");
        setTranslations(parsed.translations ?? {});
        setData(parsed.data ?? null);
      } catch {}
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!story) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          story,
          mode: mode ?? "mock",
          storyId,
          authoredLocale,
          translations,
          data,
        } satisfies PersistedStory),
      );
    } catch {}
  }, [story, mode, storyId, authoredLocale, translations, data]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? t.generator.signInError
            : t.generator.failed,
        );
      }
      const json = (await res.json()) as {
        story: DevStory;
        mode: "ai" | "mock";
        storyId: string | null;
        data: StoryDataSnapshot | null;
      };
      setStory(json.story);
      setMode(json.mode);
      setStoryId(json.storyId);
      setAuthoredLocale(json.mode === "ai" ? locale : "en");
      setTranslations({});
      setData(json.data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.generator.failed);
    } finally {
      setLoading(false);
    }
  }

  const translating = Boolean(
    story && locale !== authoredLocale && !translations[locale],
  );
  const activeStory = translations[locale] ?? story;

  useEffect(() => {
    if (!story || locale === authoredLocale || translations[locale]) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/story/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story,
            sourceLocale: authoredLocale,
            targetLocale: locale,
          }),
        });
        if (!res.ok) return;
        const json = (await res.json()) as { story: DevStory };
        if (active) {
          setTranslations((prev) => ({ ...prev, [locale]: json.story }));
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [story, locale, authoredLocale, translations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            {t.generator.phase}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-black tracking-normal text-balance uppercase">
            {t.generator.title}
          </h2>
        </div>
        <Button
          onClick={() => void handleGenerate()}
          disabled={loading || translating}
          size="sm"
        >
          <Sparkles className="text-bauhaus-yellow" />
          {loading
            ? t.generator.writing
            : story
              ? t.generator.rewrite
              : t.generator.generate}
        </Button>
      </div>

      {loading && (
        <Card className="bg-card shadow-hard">
          <CardContent className="flex items-center gap-3 py-8 font-mono text-sm font-bold tracking-wider text-muted-foreground uppercase">
            <Loader2 className="size-4 animate-spin text-bauhaus-deep" />
            {t.generator.reading}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive bg-destructive/10 shadow-none">
          <CardContent className="flex items-center gap-2 py-4 font-mono text-sm font-bold text-destructive uppercase">
            <AlertTriangle className="size-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {story && !loading && (
        <FadeIn>
          {translating ? (
            <StoryTranslating />
          ) : (
            <StoryView
              story={activeStory ?? story}
              mode={mode ?? "mock"}
              storyId={storyId}
              data={data}
            />
          )}
        </FadeIn>
      )}

      {story && (
        <StoryChat story={activeStory ?? story} data={data} />
      )}
    </div>
  );
}