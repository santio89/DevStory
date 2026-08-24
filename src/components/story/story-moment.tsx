"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MomentSparkIcon } from "@/components/story/story-decorations";
import { Reveal } from "@/components/motion/fade-in";
import { fluidSpring } from "@/lib/motion/reveal";
import {
  fetchStoryMoment,
  readStoredMoments,
  writeStoredMoment,
  type Moment,
} from "@/lib/client/story-moment-client";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { BookOpen, Clock3, Loader2, RefreshCw } from "lucide-react";

export function StoryMoment({
  story,
  data,
  fingerprint,
  autoSummon = false,
}: {
  story: DevStory;
  data: StoryDataSnapshot | null;
  fingerprint: string;
  autoSummon?: boolean;
}) {
  const { t, locale } = useLocale();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const autoSummonedRef = useRef(false);

  async function handleTranslate(current: Moment) {
    setTranslating(true);
    setError(null);
    try {
      const res = await fetch("/api/story/moment/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moment: current, locale }),
      });
      const json = (await res.json()) as { error?: string } & Moment;
      if (!res.ok) {
        setError(res.status === 503 ? t.moment.noAI : t.moment.failed);
        return;
      }
      const next = { ...current, title: json.title, text: json.text };
      setMoment(next);
      writeStoredMoment(fingerprint, locale, next);
    } catch {
      setError(t.moment.failed);
    } finally {
      setTranslating(false);
    }
  }

  async function handleMoment(refresh = false) {
    setLoading(true);
    setError(null);
    const result = await fetchStoryMoment({
      story,
      data,
      locale,
      fingerprint,
      refresh,
    });
    if (result) {
      setMoment(result);
    } else {
      setError(t.moment.failed);
    }
    setLoading(false);
  }

  useEffect(() => {
    autoSummonedRef.current = false;
  }, [locale]);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      const byLocale = readStoredMoments(fingerprint);
      if (byLocale) {
        const cached = byLocale[locale];
        if (cached) {
          setMoment(cached);
          return;
        }
        const anyMoment = Object.values(byLocale)[0];
        if (anyMoment) {
          setMoment(anyMoment);
          void handleTranslate(anyMoment);
          return;
        }
      }

      if (autoSummon && !autoSummonedRef.current) {
        autoSummonedRef.current = true;
        void handleMoment(false);
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, locale, autoSummon]);

  return (
    <Reveal variant="subtle" className="relative overflow-hidden rounded-none border-2 border-foreground bg-bauhaus-moment p-6 text-foreground shadow-hard sm:p-8">
      <span className="pointer-events-none absolute top-5 right-5 size-4 rounded-full border-2 border-bauhaus-deep bg-bauhaus-sky/40 dark:border-bauhaus-sky dark:bg-bauhaus-deep/50" />
      <MomentSparkIcon className="pointer-events-none absolute -bottom-6 -left-6 size-32 text-bauhaus-deep/15 dark:text-bauhaus-sky/20" />
      <span className="pointer-events-none absolute bottom-6 left-6 size-3 rotate-45 rounded-none bg-bauhaus-pink" />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-bauhaus-deep dark:text-bauhaus-sky" />
              <h4 className="font-heading text-lg font-black tracking-normal text-balance uppercase">
                {t.moment.title}
              </h4>
            </div>
            <p className="mt-1 max-w-md text-sm text-pretty text-bauhaus-moment-muted">
              {t.moment.subtitle}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || translating}
            onClick={() => void handleMoment(Boolean(moment))}
          >
            {loading || translating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            {loading
              ? t.moment.loading
              : translating
                ? t.moment.translating
                : moment
                  ? t.moment.summonAnother
                  : t.moment.summon}
          </Button>
        </div>

        {!moment && (loading || translating) && (
          <div
            className="mt-6 border-t-2 border-foreground/20 pt-6"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-3 font-mono text-sm font-bold tracking-wider text-bauhaus-moment-muted uppercase">
              <Loader2 className="size-4 shrink-0 animate-spin text-bauhaus-deep dark:text-bauhaus-sky" />
              {loading ? t.moment.loading : t.moment.translating}
            </div>
          </div>
        )}

        {moment && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fluidSpring}
            className="mt-6 border-t-2 border-foreground/20 pt-6"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5 text-bauhaus-deep dark:text-bauhaus-sky" />
              <span className="bg-bauhaus-yellow px-2 py-0.5 font-mono text-xs font-bold text-bauhaus-ink uppercase">
                {t.moment.of(moment.dateLabel ?? moment.year)}
              </span>
            </div>
            <p className="mt-3 font-heading text-lg leading-snug font-black tracking-normal text-balance uppercase">
              {moment.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-bauhaus-moment-muted">
              {moment.text}
            </p>
          </motion.div>
        )}
        {error && (
          <p className="mt-2 font-mono text-xs font-bold text-destructive uppercase">
            {error}
          </p>
        )}
      </div>
    </Reveal>
  );
}
