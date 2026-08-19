"use client";

import { motion } from "framer-motion";
import { langColor } from "@/components/story/languages";
import { cn } from "@/lib/utils";
import type { Era } from "@/lib/devstory/story";

function TimelineItem({ era, index }: { era: Era; index: number }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <span className="absolute top-5 left-4 z-10 -translate-x-1/2 sm:left-1/2">
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-40" />
          <span className="relative inline-flex size-3 rounded-full bg-amber-400 shadow-[0_0_16px_4px_rgba(251,191,36,0.45)]" />
        </span>
      </span>

      <div
        className={cn(
          "pl-12 sm:pl-0",
          isLeft ? "sm:col-start-1 sm:pr-14" : "sm:col-start-2 sm:pl-14",
        )}
      >
        <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-colors duration-300 hover:border-amber-400/30 hover:bg-white/[0.05] sm:p-7">
          <div
            className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-amber-400/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
              era {String(index + 1).padStart(2, "0")}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="font-mono text-sm text-amber-400">{era.year}</span>
          </div>
          <h4 className="mt-3 font-heading text-xl font-semibold tracking-tight">
            {era.name}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {era.description}
          </p>
          {era.keyLanguages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {era.keyLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/60 px-2.5 py-1 font-mono text-xs text-zinc-300"
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
      <div className="absolute top-0 bottom-0 left-4 h-full w-px -translate-x-1/2 bg-gradient-to-b from-amber-400/70 via-violet-500/40 to-blue-500/70 sm:left-1/2" />
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