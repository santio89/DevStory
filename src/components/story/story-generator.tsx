"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StoryView } from "@/components/story/story-view";
import { StoryTranslating } from "@/components/story/story-translating";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { Locale } from "@/lib/i18n/dictionary";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";

export function StoryGenerator() {
  const { t, locale } = useLocale();
  const [story, setStory] = useState<DevStory | null>(null);
  const [authoredLocale, setAuthoredLocale] = useState<Locale>("en");
  const [translations, setTranslations] = useState<
    Partial<Record<Locale, DevStory>>
  >({});
  const [mode, setMode] = useState<"ai" | "mock" | null>(null);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      };
      setStory(json.story);
      setMode(json.mode);
      setStoryId(json.storyId);
      setAuthoredLocale(json.mode === "ai" ? locale : "en");
      setTranslations({});
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
          <p className="font-mono text-xs text-muted-foreground">
            {t.generator.phase}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
            {t.generator.title}
          </h2>
        </div>
        <Button
          onClick={() => void handleGenerate()}
          disabled={loading || translating}
          size="sm"
        >
          <Sparkles className="text-cyan-400" />
          {loading
            ? t.generator.writing
            : story
              ? t.generator.rewrite
              : t.generator.generate}
        </Button>
      </div>

      {loading && (
        <Card className="bg-muted/40">
          <CardContent className="flex items-center gap-3 py-8 font-mono text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-cyan-400" />
            {t.generator.reading}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="flex items-center gap-2 py-4 font-mono text-sm text-destructive">
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
            />
          )}
        </FadeIn>
      )}
    </div>
  );
}