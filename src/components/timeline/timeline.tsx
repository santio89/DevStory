"use client";

import { motion } from "framer-motion";
import { langColor } from "@/components/story/languages";
import { resolveToken, Sigil } from "@/components/story/sigil";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";
import type { Era } from "@/lib/devstory/story";

function TimelineItem({ era, index }: { era: Era; index: number }) {
  const { t } = useLocale();
  const isLeft = index % 2 === 0;
  const token = resolveToken(era);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <span className="absolute top-2.5 left-4 z-10 -translate-x-1/2 sm:left-1/2">
        <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/70 via-white/10 to-blue-500/60 p-px shadow-[0_0_20px_rgba(34,211,238,0.28)]">
          <span className="flex size-full items-center justify-center rounded-full bg-background/95">
            <Sigil token={token} className="size-7 drop-shadow-[0_0_6px_rgba(34,211,238,0.45)]" />
          </span>
        </span>
      </span>

      <div
        className={cn(
          "pl-12 sm:pl-0",
          isLeft ? "sm:col-start-1 sm:pr-14" : "sm:col-start-2 sm:pl-14",
        )}
      >
        <article className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-md transition-colors duration-300 hover:border-cyan-400/40 hover:bg-card/60 sm:p-7">
          <div
            className="pointer-events-none absolute -top-8 -right-8 opacity-[0.07]"
            aria-hidden="true"
          >
            <Sigil token={token} className="size-44" />
          </div>
          <div
            className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-fuchsia-500/12 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {t.story.era(index + 1)}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
            <span className="font-mono text-sm text-cyan-400">{era.year}</span>
          </div>
          <h4 className="mt-3 font-heading text-xl font-semibold tracking-tight">
            {era.name}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {era.description}
          </p>
          {era.keyLanguages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {era.keyLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 font-mono text-xs text-foreground/80"
                >
                  <span
                    className="inline-block size-1.5 rounded-full"
                    style={{
                      backgroundColor: langColor(lang),
                      boxShadow: `0 0 8px 1px ${langColor(lang)}66`,
                    }}
                  />
                  {lang}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </motion.div>
  );
}

export function Timeline({ eras }: { eras: Era[] }) {
  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-4 h-full w-px -translate-x-1/2 bg-gradient-to-b from-sky-400/80 via-indigo-400/40 to-cyan-400/80 sm:left-1/2" />
      <div className="space-y-12 sm:space-y-16">
        {eras.map((era, index) => (
          <TimelineItem
            key={`${era.year}-${era.name}`}
            era={era}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}