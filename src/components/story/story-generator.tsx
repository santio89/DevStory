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
import { BookOpen, Sparkles, Loader2, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "devstory-story";

type PersistedStory = {
  username: string;
  story: DevStory;
  mode: "ai" | "mock";
  authoredLocale: Locale;
  translations: Partial<Record<Locale, DevStory>>;
  data: StoryDataSnapshot | null;
};

export function StoryGenerator({
  username,
  brainLoading = false,
}: {
  username: string;
  brainLoading?: boolean;
}) {
  const { t, locale } = useLocale();
  const [story, setStory] = useState<DevStory | null>(null);
  const [displayName, setDisplayName] = useState(username);
  const [authoredLocale, setAuthoredLocale] = useState<Locale>("en");
  const [translations, setTranslations] = useState<
    Partial<Record<Locale, DevStory>>
  >({});
  const [mode, setMode] = useState<"ai" | "mock" | null>(null);
  const [data, setData] = useState<StoryDataSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedLocales, setFailedLocales] = useState<Locale[]>([]);

  useEffect(() => {
    setStory(null);
    setMode(null);
    setData(null);
    setTranslations({});
    setError(null);
    setFailedLocales([]);
    setDisplayName(username);
    setLoading(false);

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedStory;
      if (!parsed?.story || parsed.username !== username) return;
      setStory(parsed.story);
      setMode(parsed.mode ?? "mock");
      setAuthoredLocale(parsed.authoredLocale ?? "en");
      setTranslations(parsed.translations ?? {});
      setData(parsed.data ?? null);
      setDisplayName(parsed.data?.name ?? username);
    } catch {}
  }, [username]);

  useEffect(() => {
    if (!story) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          username,
          story,
          mode: mode ?? "mock",
          authoredLocale,
          translations,
          data,
        } satisfies PersistedStory),
      );
    } catch {}
  }, [story, mode, authoredLocale, translations, data, username]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, locale }),
        cache: "no-store",
      });
      const json = (await res.json()) as {
        story?: DevStory;
        mode?: "ai" | "mock";
        data?: StoryDataSnapshot | null;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? t.generator.failed);
      }
      if (!json.story) throw new Error(t.generator.failed);
      setStory(json.story);
      setMode(json.mode ?? "mock");
      setAuthoredLocale(json.mode === "ai" ? locale : "en");
      setTranslations({});
      setFailedLocales([]);
      setData(json.data ?? null);
      setDisplayName(json.data?.name ?? username);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.generator.failed);
    } finally {
      setLoading(false);
    }
  }

  const translationFailed = failedLocales.includes(locale);
  const translating = Boolean(
    story &&
      locale !== authoredLocale &&
      !translations[locale] &&
      !translationFailed,
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
  }, [story, locale, authoredLocale, translations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            {t.generator.phase}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-black tracking-normal text-balance uppercase">
            {t.generator.titleFor(username)}
          </h2>
        </div>
        <Button
          onClick={() => void handleGenerate()}
          disabled={loading || translating || brainLoading}
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
            {t.generator.readingFor(username)}
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

      {!story && !loading && brainLoading && (
        <Card className="border-2 border-dashed border-foreground/40 bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:py-12">
            <span className="flex size-12 items-center justify-center rounded-none border-2 border-foreground bg-bauhaus-deep shadow-hard-sm">
              <Loader2 className="size-5 animate-spin text-bauhaus-yellow" />
            </span>
            <div className="max-w-md space-y-2">
              <h3 className="font-heading text-lg font-black tracking-normal uppercase">
                {t.generator.waitingTitle}
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {t.generator.waitingBody(username)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!story && !loading && !brainLoading && (
        <Card className="border-2 border-dashed border-foreground/40 bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:py-12">
            <span className="flex size-12 items-center justify-center rounded-none border-2 border-foreground bg-bauhaus-deep shadow-hard-sm">
              <BookOpen className="size-5 text-bauhaus-yellow" />
            </span>
            <div className="max-w-md space-y-2">
              <h3 className="font-heading text-lg font-black tracking-normal uppercase">
                {t.generator.emptyTitle}
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {t.generator.emptyBody(username)}
              </p>
            </div>
            <Button onClick={() => void handleGenerate()} size="lg">
              <Sparkles className="text-bauhaus-yellow" />
              {t.generator.emptyCta}
            </Button>
          </CardContent>
        </Card>
      )}

      {story && !loading && (
        <FadeIn>
          {translating ? (
            <StoryTranslating />
          ) : (
            <>
              {translationFailed && locale !== authoredLocale && (
                <p className="mb-4 font-mono text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {t.generator.translationFailed}
                </p>
              )}
              <StoryView
                story={activeStory ?? story}
                mode={mode ?? "mock"}
                username={username}
                displayName={displayName}
                data={data}
              />
            </>
          )}
        </FadeIn>
      )}

      {story && (
        <StoryChat story={activeStory ?? story} data={data} username={username} />
      )}
    </div>
  );
}
