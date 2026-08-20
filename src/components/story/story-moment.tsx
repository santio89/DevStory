"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale/locale-provider";
import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { BookOpen, Clock3, Loader2, RefreshCw } from "lucide-react";

type Moment = { title: string; text: string; year: string };

const STORAGE_KEY = "devstory-moment";

type StoredMoment = { fingerprint: string; moment: Moment };

function readStored(fingerprint: string): Moment | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMoment;
    if (
      parsed?.fingerprint === fingerprint &&
      parsed?.moment &&
      typeof parsed.moment.title === "string"
    ) {
      return parsed.moment;
    }
  } catch {}
  return null;
}

function writeStored(fingerprint: string, moment: Moment) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fingerprint, moment }),
    );
  } catch {}
}

export function StoryMoment({
  story,
  data,
  fingerprint,
}: {
  story: DevStory;
  data: StoryDataSnapshot | null;
  fingerprint: string;
}) {
  const { t, locale } = useLocale();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMoment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/story/moment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, data, locale }),
      });
      const json = (await res.json()) as { error?: string } & Moment;
      if (!res.ok) {
        throw new Error(json.error ?? t.moment.failed);
      }
      const next = { title: json.title, text: json.text, year: json.year };
      setMoment(next);
      writeStored(fingerprint, next);
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("503")
          ? t.moment.noAI
          : t.moment.failed,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const stored = readStored(fingerprint);
      if (stored) {
        setMoment(stored);
        return;
      }
      void handleMoment();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-none border-2 border-foreground bg-bauhaus-yellow/10 p-6 shadow-hard sm:p-8"
    >
      <span className="pointer-events-none absolute top-5 right-5 size-4 rounded-full border-2 border-foreground" />
      <span className="pointer-events-none absolute bottom-6 left-6 size-3 rotate-45 rounded-none bg-bauhaus-pink" />

      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-bauhaus-deep" />
              <h4 className="font-heading text-lg font-black tracking-normal uppercase">
                {t.moment.title}
              </h4>
            </div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t.moment.subtitle}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void handleMoment()}
            className="border-dashed border-foreground/60 hover:border-foreground"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            {loading
              ? t.moment.loading
              : moment
                ? t.moment.summonAnother
                : t.moment.summon}
          </Button>
        </div>

        {moment && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 rounded-none border-2 border-foreground bg-background p-5 shadow-hard-sm"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5 text-bauhaus-deep" />
              <span className="bg-bauhaus-yellow px-2 py-0.5 font-mono text-xs font-bold text-bauhaus-ink uppercase">
                {t.moment.of(moment.year)}
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
        {error && (
          <p className="mt-2 font-mono text-xs font-bold text-destructive uppercase">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}