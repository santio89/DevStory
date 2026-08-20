"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";
import { REMIX_VOICES, type RemixVoice } from "@/lib/devstory/ai";
import type { DevStory } from "@/lib/devstory/story";
import {
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";

export function StoryPlay({
  storyId,
  remix,
  onRemix,
}: {
  storyId: string | null;
  remix: { voice: RemixVoice; story: DevStory } | null;
  onRemix: (voice: RemixVoice) => Promise<void>;
}) {
  const { t } = useLocale();
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
    el.setPointerCapture(e.pointerId);
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
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
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
        e instanceof Error && e.message.includes("503") ? t.play.noAI : t.play.remixFailed,
      );
    } finally {
      setRemixing(null);
    }
  }

  async function handlePoster() {
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
          <div className="mt-2.5">
            <div
              ref={trackRef}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
              className={cn(
                "no-scrollbar flex-1 cursor-grab touch-pan-y overflow-x-auto select-none active:cursor-grabbing",
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
          </div>
          {remixError && (
            <p className="mt-2 font-mono text-xs font-bold text-destructive uppercase">
              {remixError}
            </p>
          )}
        </div>

        <div className="mt-6 border-t-2 border-dashed border-foreground/25 pt-5">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
            {t.play.revisitTitle}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={!storyId}
              onClick={handlePoster}
              title={t.play.posterHint}
              className="border-dashed border-foreground/60 hover:border-foreground"
            >
              <ImageIcon className="size-3.5" />
              {t.play.poster}
            </Button>
          </div>
          {!storyId && (
            <p className="mt-3 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              {t.play.noStoryId}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}