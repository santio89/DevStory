"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/fade-in";
import { useLocale } from "@/components/locale/locale-provider";
import { readCachedAudio, writeCachedAudio } from "@/lib/client/audio-cache";
import {
  clearMemoryAudioUrls,
  getMemoryAudioUrl,
  setMemoryAudioUrl,
  storyAudioCacheKey,
} from "@/lib/client/story-audio-cache";
import type { DevStory } from "@/lib/devstory/story";
import type { Locale } from "@/lib/i18n/dictionary";
import { Loader2, Square, Volume2 } from "lucide-react";

const PREFETCH_DELAY_MS = 1200;

async function fetchStoryAudio(
  story: DevStory,
  locale: Locale,
  signal?: AbortSignal,
): Promise<Blob> {
  const res = await fetch("/api/story/retell/audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story, locale }),
    signal,
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? `Audio failed (${res.status})`);
  }
  return res.blob();
}

export function StoryHear({ story }: { story: DevStory }) {
  const { t, locale } = useLocale();
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const prefetchRef = useRef<AbortController | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const epochRef = useRef(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioKey = storyAudioCacheKey(story, locale);

  const persistBlob = useCallback((key: string, blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    setMemoryAudioUrl(key, url);
    void writeCachedAudio(key, blob);
    return url;
  }, []);

  useEffect(() => {
    const el = new Audio();
    audioEl.current = el;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      prefetchRef.current?.abort();
      fetchAbortRef.current?.abort();
      el.pause();
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.src = "";
      audioEl.current = null;
      clearMemoryAudioUrls();
    };
  }, []);

  useEffect(() => {
    epochRef.current += 1;
    const epoch = epochRef.current;

    prefetchRef.current?.abort();
    fetchAbortRef.current?.abort();

    const el = audioEl.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
    setGeneratingAudio(false);
    setAudioError(null);

    const mem = getMemoryAudioUrl(audioKey);
    if (mem) {
      setAudioUrl(mem);
      if (el) el.src = mem;
      return;
    }

    setAudioUrl(null);
    if (el) el.src = "";

    void readCachedAudio(audioKey).then((blob) => {
      if (epochRef.current !== epoch || !blob) return;
      const url = persistBlob(audioKey, blob);
      setAudioUrl(url);
      if (audioEl.current) audioEl.current.src = url;
    });
  }, [audioKey, persistBlob]);

  const prefetchAudio = useCallback(
    async (signal: AbortSignal, epoch: number) => {
      if (epochRef.current !== epoch) return;
      if (getMemoryAudioUrl(audioKey)) return;

      const cached = await readCachedAudio(audioKey);
      if (signal.aborted || epochRef.current !== epoch) return;
      if (cached) {
        const url = persistBlob(audioKey, cached);
        if (epochRef.current === epoch) {
          setAudioUrl(url);
          if (audioEl.current) audioEl.current.src = url;
        }
        return;
      }

      try {
        const blob = await fetchStoryAudio(story, locale, signal);
        if (signal.aborted || epochRef.current !== epoch) return;
        const url = persistBlob(audioKey, blob);
        if (epochRef.current === epoch) {
          setAudioUrl(url);
          if (audioEl.current) audioEl.current.src = url;
        }
      } catch {
        // Prefetch is best-effort; the user can still click to retry.
      }
    },
    [audioKey, story, locale, persistBlob],
  );

  useEffect(() => {
    prefetchRef.current?.abort();
    const ac = new AbortController();
    prefetchRef.current = ac;
    const epoch = epochRef.current;

    const timer = window.setTimeout(() => {
      if (ac.signal.aborted) return;
      const run = () => void prefetchAudio(ac.signal, epoch);
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(run, { timeout: 4000 });
      } else {
        run();
      }
    }, PREFETCH_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [audioKey, prefetchAudio]);

  async function handleListen() {
    const epoch = epochRef.current;
    setAudioError(null);

    const mem = getMemoryAudioUrl(audioKey);
    if (mem) {
      if (audioUrl !== mem) setAudioUrl(mem);
      if (audioEl.current && audioEl.current.src !== mem) {
        audioEl.current.src = mem;
      }
      if (audioEl.current) {
        if (audioEl.current.paused) void audioEl.current.play();
        else audioEl.current.pause();
      }
      return;
    }

    fetchAbortRef.current?.abort();
    const ac = new AbortController();
    fetchAbortRef.current = ac;
    setGeneratingAudio(true);

    try {
      let url = getMemoryAudioUrl(audioKey);

      if (!url) {
        const cached = await readCachedAudio(audioKey);
        if (epochRef.current !== epoch) return;
        if (cached) url = persistBlob(audioKey, cached);
      }

      if (!url) {
        const blob = await fetchStoryAudio(story, locale, ac.signal);
        if (epochRef.current !== epoch) return;
        url = persistBlob(audioKey, blob);
      }

      if (epochRef.current !== epoch) return;

      setAudioUrl(url);
      if (audioEl.current) {
        audioEl.current.src = url;
        void audioEl.current.play();
      }
    } catch (e) {
      if (ac.signal.aborted || epochRef.current !== epoch) return;
      setAudioError(
        e instanceof Error && e.message.includes("503")
          ? t.play.noAI
          : t.play.audioFailed,
      );
    } finally {
      if (epochRef.current === epoch) setGeneratingAudio(false);
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
