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
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <span className="absolute top-2.5 left-4 z-10 -translate-x-1/2 sm:left-1/2">
        <span className="flex size-12 items-center justify-center rounded-full border-2 border-foreground bg-background shadow-hard-sm">
          <Sigil token={token} className="size-6" />
        </span>
      </span>

      <div
        className={cn(
          "pl-12 sm:pl-0",
          isLeft ? "sm:col-start-1 sm:pr-14" : "sm:col-start-2 sm:pl-14",
        )}
      >
        <article className="group relative rounded-none border-2 border-foreground bg-card p-6 shadow-hard transition-transform duration-200 hover:-translate-y-1 sm:p-7">
          <span className="pointer-events-none absolute top-4 right-4 size-3 rotate-45 bg-bauhaus-pink" />
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase">
              {t.story.era(index + 1)}
            </span>
            <span className="h-[2px] flex-1 bg-foreground/70" />
            <span className="bg-bauhaus-yellow px-2 py-0.5 font-mono text-sm font-bold text-bauhaus-ink shadow-hard-sm">
              {era.year}
            </span>
          </div>
          <h4 className="mt-3 font-heading text-xl font-bold tracking-tight uppercase">
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
        </article>
      </div>
    </motion.div>
  );
}

export function Timeline({ eras }: { eras: Era[] }) {
  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-4 h-full w-[3px] -translate-x-1/2 bg-foreground sm:left-1/2" />
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