"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/fade-in";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import { Loader2, Square, Volume2 } from "lucide-react";

function storyCacheKey(story: DevStory, locale: string): string {
  return `narrator-v5|${story.title}|${story.eras.map((e) => e.year).join(",")}|${locale}`;
}

export function StoryHear({ story }: { story: DevStory }) {
  const { t, locale } = useLocale();
  const audioCache = useRef(new Map<string, string>());
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioKey = storyCacheKey(story, locale);

  useEffect(() => {
    const cache = audioCache.current;
    const el = new Audio();
    audioEl.current = el;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.pause();
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.src = "";
      audioEl.current = null;
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  async function handleListen() {
    setAudioError(null);
    const cached = audioCache.current.get(audioKey);
    if (cached) {
      if (audioUrl !== cached) setAudioUrl(cached);
      if (audioEl.current && audioEl.current.src !== cached) {
        audioEl.current.src = cached;
      }
      if (audioEl.current) {
        if (audioEl.current.paused) void audioEl.current.play();
        else audioEl.current.pause();
      }
      return;
    }
    setGeneratingAudio(true);
    try {
      const res = await fetch("/api/story/retell/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, locale }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setAudioError(
          res.status === 503 ? t.play.noAI : (json.error ?? t.play.audioFailed),
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioCache.current.set(audioKey, url);
      setAudioUrl(url);
      if (audioEl.current) {
        audioEl.current.src = url;
        void audioEl.current.play();
      }
    } catch {
      setAudioError(t.play.audioFailed);
    } finally {
      setGeneratingAudio(false);
    }
  }

  return (
    <Reveal variant="subtle" className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={generatingAudio}
        onClick={() => void handleListen()}
      >
        {generatingAudio ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : playing ? (
          <Square className="size-3.5" />
        ) : (
          <Volume2 className="size-3.5" />
        )}
        {generatingAudio
          ? t.play.generating
          : playing
            ? t.play.stop
            : t.play.hearStory}
      </Button>
      <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
        {t.play.narrator}
      </p>
      {audioError && (
        <p className="font-mono text-xs font-bold text-destructive uppercase">
          {audioError}
        </p>
      )}
    </Reveal>
  );
}
