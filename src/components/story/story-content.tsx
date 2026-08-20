"use client";

import { motion } from "framer-motion";
import { Timeline } from "@/components/timeline/timeline";
import { resolveToken, Sigil } from "@/components/story/sigil";
import { useLocale } from "@/components/locale/locale-provider";
import { cn } from "@/lib/utils";
import type { DevStory } from "@/lib/devstory/story";
import type { TokenId } from "@/lib/devstory/tokens";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import { Award, Wand2 } from "lucide-react";

export function StoryContent({
  story,
  mode,
  data = null,
}: {
  story: DevStory;
  mode: "ai" | "mock";
  data?: StoryDataSnapshot | null;
}) {
  const { t } = useLocale();
  const lastEra = story.eras[story.eras.length - 1] ?? story.eras[0];
  const heroToken: TokenId = lastEra ? resolveToken(lastEra) : "sprout";
  const words = story.title.split(/\s+/);
  const pivot = Math.floor(words.length / 2);

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-none border-2 border-foreground bg-card px-6 py-10 shadow-hard sm:px-12 sm:py-14"
      >
        <span className="pointer-events-none absolute top-6 right-6 size-8 rounded-full border-2 border-foreground bg-bauhaus-sky/30" />
        <span className="pointer-events-none absolute bottom-6 left-6 size-4 rotate-45 rounded-none bg-bauhaus-yellow" />
        <div className="pointer-events-none absolute -top-10 -right-10 opacity-[0.1]">
          <Sigil token={heroToken} className="size-72" />
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-none border-2 border-foreground bg-background px-2.5 py-1 font-mono text-xs font-bold tracking-[0.2em] text-foreground uppercase shadow-hard-sm">
              <Wand2 className="size-3 text-bauhaus-deep" />
              {mode === "ai" ? t.story.crafted : t.story.previewSample}
            </span>
            {story.archetype && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-none border-2 border-foreground bg-bauhaus-pink/20 px-2.5 py-1 font-mono text-xs font-bold tracking-[0.2em] text-foreground uppercase shadow-hard-sm">
                <Award className="size-3 text-bauhaus-deep" />
                {t.story.archetype} · {story.archetype}
              </span>
            )}
          </div>

          <h3 className="mt-6 max-w-3xl font-heading text-4xl leading-[1.1] font-black tracking-normal text-balance uppercase sm:text-5xl">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={cn(i > 0 && i >= pivot && "text-bauhaus-deep")}
              >
                {word}{" "}
              </span>
            ))}
          </h3>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {story.summary}
          </p>
        </div>
      </motion.div>

      <Timeline eras={story.eras} data={data} />

      {story.closing ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-none border-2 border-foreground bg-bauhaus-yellow p-6 text-bauhaus-ink shadow-hard sm:p-8"
        >
          <span className="pointer-events-none absolute top-4 right-4 size-4 rotate-45 rounded-none bg-bauhaus-deep" />
          <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase">
            {t.story.closingLabel}
          </p>
          <p className="mt-3 font-heading text-lg leading-relaxed font-bold text-balance sm:text-xl">
            {story.closing}
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}