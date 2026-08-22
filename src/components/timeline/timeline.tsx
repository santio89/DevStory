"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { langColor } from "@/components/story/languages";
import { resolveToken, Sigil } from "@/components/story/sigil";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";
import type { Era } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { BookOpen, Loader2 } from "lucide-react";

type Dive = { narrative: string; highlights: string[] };

function TimelineItem({
  era,
  index,
  data,
}: {
  era: Era;
  index: number;
  data: StoryDataSnapshot | null;
}) {
  const { t, locale } = useLocale();
  const isLeft = index % 2 === 0;
  const token = resolveToken(era);
  const [diving, setDiving] = useState(false);
  const [dive, setDive] = useState<Dive | null>(null);
  const [diveError, setDiveError] = useState<string | null>(null);

  async function handleDeepDive() {
    if (dive) {
      setDive(null);
      return;
    }
    setDiving(true);
    setDiveError(null);
    try {
      const res = await fetch("/api/story/deepdive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ era, data, locale }),
      });
      const json = (await res.json()) as { error?: string } & Dive;
      if (!res.ok) {
        setDiveError(res.status === 503 ? t.play.noAI : t.play.deepDiveFailed);
        return;
      }
      setDive({ narrative: json.narrative, highlights: json.highlights });
    } catch {
      setDiveError(t.play.deepDiveFailed);
    } finally {
      setDiving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <span className="absolute top-2.5 left-4 z-10 -translate-x-1/2 sm:left-1/2">
        <span className="grid size-12 place-items-center rounded-full border-2 border-foreground bg-background shadow-hard-sm">
          <Sigil token={token} className="size-7" />
        </span>
      </span>

      <div
        className={cn(
          "pl-12 sm:pl-0",
          isLeft ? "sm:col-start-1 sm:pr-14" : "sm:col-start-2 sm:pl-14",
        )}
      >
        <article className="group relative overflow-hidden rounded-none border-2 border-foreground bg-card p-6 shadow-hard transition-transform duration-200 hover:-translate-y-1 sm:p-7">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <Sigil
              token={token}
              className={cn(
                "absolute size-44 text-bauhaus-sky opacity-[0.08] blur-[0.3px]",
                isLeft ? "-right-10 -bottom-8" : "-left-10 -bottom-8",
              )}
            />
          </div>
          <span className="pointer-events-none absolute top-4 right-4 z-[1] size-3 rotate-45 bg-bauhaus-pink" />
          <div className="relative z-[1]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">
              {t.story.era(index + 1)}
            </span>
            <span className="h-[2px] flex-1 bg-foreground/70" />
            <span className="bg-bauhaus-yellow px-2 py-0.5 font-mono text-sm font-bold text-bauhaus-ink shadow-hard-sm">
              {era.year}
            </span>
          </div>
          <h4 className="mt-3 font-heading text-xl font-bold tracking-normal text-balance uppercase">
            {era.name}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
            {era.description}
          </p>
          {era.keyLanguages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {era.keyLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 rounded-none border-2 border-foreground bg-background px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider"
                >
                  <span
                    className="inline-block size-2 rounded-none"
                    style={{ backgroundColor: langColor(lang) }}
                  />
                  {lang}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => void handleDeepDive()}
            aria-expanded={Boolean(dive)}
            className="mt-5 inline-flex items-center gap-2.5 text-left font-mono text-xs font-bold tracking-[0.2em] text-bauhaus-deep uppercase transition-colors hover:text-foreground"
          >
            {diving ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin" />
            ) : (
              <BookOpen className="size-3.5 shrink-0" />
            )}
            <span className="text-balance">
              {diving
                ? t.play.deepDiveLoading
                : dive
                  ? t.play.collapseDeepDive
                  : t.play.deepDive}
            </span>
          </button>

          {diveError && (
            <p className="mt-2 font-mono text-xs font-bold text-destructive uppercase">
              {diveError}
            </p>
          )}

          {dive && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 rounded-none border-2 border-foreground bg-background p-4 shadow-hard-sm"
            >
              <p className="text-sm leading-relaxed whitespace-pre-line text-pretty">
                {dive.narrative}
              </p>
              <p className="mt-4 font-mono text-[10px] font-bold tracking-[0.25em] text-muted-foreground uppercase">
                {t.play.deepDiveHighlights}
              </p>
              <ul className="mt-2 space-y-1.5">
                {dive.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 font-mono text-xs font-bold text-bauhaus-deep"
                  >
                    <span className="mt-1 inline-block size-1.5 shrink-0 rotate-45 bg-bauhaus-yellow" />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          </div>
        </article>
      </div>
    </motion.div>
  );
}

export function Timeline({
  eras,
  data,
}: {
  eras: Era[];
  data?: StoryDataSnapshot | null;
}) {
  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-4 h-full w-[3px] -translate-x-1/2 bg-foreground sm:left-1/2" />
      <div className="space-y-12 sm:space-y-16">
        {eras.map((era, index) => (
          <TimelineItem
            key={`${era.year}-${era.name}`}
            era={era}
            index={index}
            data={data ?? null}
          />
        ))}
      </div>
    </div>
  );
}