"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import { REMIX_VOICES, type RemixVoice } from "@/lib/devstory/ai";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { BookOpen, Clock3, Image as ImageIcon, Loader2, Sparkles, Wand2 } from "lucide-react";

type Moment = { title: string; text: string; year: string };

export function StoryPlay({
  story,
  data,
  storyId,
  remix,
  onRemix,
}: {
  story: DevStory;
  data: StoryDataSnapshot | null;
  storyId: string | null;
  remix: { voice: RemixVoice; story: DevStory } | null;
  onRemix: (voice: RemixVoice) => Promise<void>;
}) {
  const { t, locale } = useLocale();
  const [remixing, setRemixing] = useState<RemixVoice | null>(null);
  const [remixError, setRemixError] = useState<string | null>(null);
  const [moment, setMoment] = useState<Moment | null>(null);
  const [momentLoading, setMomentLoading] = useState(false);
  const [momentError, setMomentError] = useState<string | null>(null);

  async function handleRemix(voice: RemixVoice) {
    if (remix?.voice === voice) return;
    setRemixing(voice);
    setRemixError(null);
    try {
      await onRemix(voice);
    } catch (e) {
      setRemixError(
        e instanceof Error && e.message.includes("503") ? t.play.noAI : t.play.remixFailed,
      );
    } finally {
      setRemixing(null);
    }
  }

  async function handleMoment() {
    setMomentLoading(true);
    setMomentError(null);
    setMoment(null);
    try {
      const res = await fetch("/api/story/moment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, data, locale }),
      });
      const json = (await res.json()) as { error?: string } & Moment;
      if (!res.ok) {
        throw new Error(json.error ?? t.play.todayFailed);
      }
      setMoment({ title: json.title, text: json.text, year: json.year });
    } catch (e) {
      setMomentError(
        e instanceof Error && e.message.includes("503") ? t.play.noAI : t.play.todayFailed,
      );
    } finally {
      setMomentLoading(false);
    }
  }

  function handlePoster() {
    if (!storyId) return;
    window.open(`/story/${storyId}/opengraph-image`, "_blank", "noopener");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-none border-2 border-foreground bg-bauhaus-pink/10 p-6 shadow-hard sm:p-8"
    >
      <span className="pointer-events-none absolute top-5 left-5 size-4 rounded-full border-2 border-foreground" />
      <span className="pointer-events-none absolute right-6 bottom-6 size-3 rotate-45 rounded-none bg-bauhaus-cyan" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-bauhaus-deep" />
          <h4 className="font-heading text-lg font-black tracking-normal uppercase">
            {t.play.title}
          </h4>
        </div>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {t.play.subtitle}
        </p>

        <div className="mt-6">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            {t.play.remixTitle}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {REMIX_VOICES.map((voice) => (
              <Button
                key={voice}
                variant={remix?.voice === voice ? "default" : "outline"}
                size="sm"
                disabled={remixing !== null}
                onClick={() => void handleRemix(voice)}
              >
                {remixing === voice ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Wand2 className="size-3.5" />
                )}
                {t.play.voice[voice]}
              </Button>
            ))}
          </div>
          {remixError && (
            <p className="mt-2 font-mono text-xs font-bold text-destructive uppercase">
              {remixError}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled={momentLoading}
            onClick={() => void handleMoment()}
          >
            {momentLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Clock3 className="size-3.5" />
            )}
            {momentLoading ? t.play.todayLoading : t.play.today}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!storyId}
            onClick={handlePoster}
            title={t.play.posterHint}
          >
            <ImageIcon className="size-3.5" />
            {t.play.poster}
          </Button>
        </div>

        {moment && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 rounded-none border-2 border-foreground bg-background p-5 shadow-hard-sm"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5 text-bauhaus-deep" />
              <span className="bg-bauhaus-yellow px-2 py-0.5 font-mono text-xs font-bold text-bauhaus-ink uppercase">
                {t.play.todayOf(moment.year)}
              </span>
            </div>
            <p className="mt-3 font-heading text-lg leading-snug font-black tracking-normal uppercase">
              {moment.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {moment.text}
            </p>
          </motion.div>
        )}
        {momentError && (
          <p className="mt-2 font-mono text-xs font-bold text-destructive uppercase">
            {momentError}
          </p>
        )}
        {!storyId && (
          <p className="mt-3 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            {t.play.noStoryId}
          </p>
        )}
      </div>
    </motion.div>
  );
}