"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";
import { REMIX_VOICES, type RemixVoice } from "@/lib/devstory/ai";
import type { DevStory } from "@/lib/devstory/story";
import { Loader2, Sparkles, Square, Volume2, Wand2 } from "lucide-react";

export function StoryRetell({
  remix,
  onRemix,
  story,
  fingerprint,
}: {
  remix: { voice: RemixVoice; story: DevStory } | null;
  onRemix: (voice: RemixVoice) => Promise<void>;
  story: DevStory;
  fingerprint: string;
}) {
  const { t, locale } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    pointerId: 0,
    startX: 0,
    startScroll: 0,
    dragging: false,
    moved: false,
  });
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [remixing, setRemixing] = useState<RemixVoice | null>(null);
  const [remixError, setRemixError] = useState<string | null>(null);

  const audioCache = useRef(new Map<string, string>());
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

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

  const activeVoice = remix?.voice ?? REMIX_VOICES[0];
  const audioKey = `${fingerprint}|${activeVoice}|${locale}`;

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
        body: JSON.stringify({ story, voice: activeVoice, locale }),
      });
      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({}))).error ?? "audio");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioCache.current.set(audioKey, url);
      setAudioUrl(url);
      if (audioEl.current) {
        audioEl.current.src = url;
        void audioEl.current.play();
      }
    } catch (e) {
      setAudioError(
        e instanceof Error && e.message.includes("503")
          ? t.play.noAI
          : t.play.audioFailed,
      );
    } finally {
      setGeneratingAudio(false);
    }
  }

  function onDragStart(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      dragging: true,
      moved: false,
    };
    setDragging(true);
  }

  function onDragMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragState.current;
    const el = trackRef.current;
    if (!s.dragging || !el) return;
    const dx = e.clientX - s.startX;
    if (Math.abs(dx) > 6) s.moved = true;
    el.scrollLeft = s.startScroll - dx;
  }

  function onDragEnd(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragState.current;
    const el = trackRef.current;
    if (!s.dragging || !el) return;
    s.dragging = false;
    setDragging(false);
    if (s.moved) suppressClick.current = true;
  }

  function centerVoice(btn: HTMLButtonElement) {
    const el = trackRef.current;
    if (!el) return;
    const target =
      btn.offsetLeft - el.offsetLeft - el.clientWidth / 2 + btn.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }

  async function handleRemix(voice: RemixVoice) {
    if (remix?.voice === voice) return;
    setRemixing(voice);
    setRemixError(null);
    try {
      await onRemix(voice);
    } catch (e) {
      setRemixError(
        e instanceof Error && e.message.includes("503")
          ? t.play.noAI
          : t.play.remixFailed,
      );
    } finally {
      setRemixing(null);
    }
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
          <h4 className="font-heading text-lg font-black tracking-normal text-balance uppercase">
            {t.play.title}
          </h4>
        </div>
        <p className="mt-1 max-w-md text-sm text-pretty text-muted-foreground">
          {t.play.subtitle}
        </p>

        <div className="mt-6">
          <div
            ref={trackRef}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            className={cn(
              "no-scrollbar cursor-grab touch-pan-y overflow-x-auto select-none active:cursor-grabbing",
              dragging ? "snap-none" : "snap-x snap-mandatory",
            )}
          >
            <div className="flex w-max gap-2.5 snap-x snap-mandatory">
              {REMIX_VOICES.map((voice) => (
                <Button
                  key={voice}
                  variant={remix?.voice === voice ? "default" : "outline"}
                  size="sm"
                  disabled={remixing !== null}
                  data-voice={voice}
                  className="shrink-0 snap-start"
                  onClick={(e) => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    centerVoice(e.currentTarget);
                    void handleRemix(voice);
                  }}
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
          </div>
          {remixError && (
            <p className="mt-2 font-mono text-xs font-bold text-destructive uppercase">
              {remixError}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={generatingAudio}
            onClick={() => void handleListen()}
            className="border-dashed border-foreground/60 hover:border-foreground"
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
                : t.play.listen}
          </Button>
          {audioError && (
            <p className="font-mono text-xs font-bold text-destructive uppercase">
              {audioError}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}