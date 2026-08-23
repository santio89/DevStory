"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/locale/locale-provider";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/fade-in";
import { LookupOrbitIcon } from "@/components/story/story-decorations";

export function StoryPageHero({
  username,
  githubLogin,
}: {
  username: string;
  githubLogin: string;
}) {
  const { t } = useLocale();

  return (
    <section className="relative z-10 flex min-h-[clamp(15rem,34vh,22rem)] flex-col items-center justify-center px-4 pb-10 pt-24 text-center sm:pt-28">
        <Reveal variant="hero">
          <h1 className="font-heading text-3xl font-black tracking-normal text-balance uppercase sm:text-4xl md:text-5xl">
            {t.sharePage.of(username)}
          </h1>
        </Reveal>
        <Reveal variant="hero" delay={0.08}>
          <p className="mt-3 font-mono text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase">
            @{githubLogin}
          </p>
        </Reveal>
    </section>
  );
}

export function StoryPageCta() {
  const { t } = useLocale();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">
      <Reveal variant="subtle">
        <div className="relative overflow-hidden rounded-none border-2 border-foreground bg-bauhaus-deep p-8 text-center text-white shadow-hard-lg sm:p-12">
          <span className="pointer-events-none absolute top-6 left-6 size-4 rotate-45 rounded-none bg-bauhaus-yellow" />
          <LookupOrbitIcon className="pointer-events-none absolute right-4 bottom-4 size-24 text-white/25 sm:size-28" />
          <h2 className="relative font-heading text-2xl font-black tracking-normal text-balance uppercase sm:text-3xl">
            {t.sharePage.writeYours}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/80 text-pretty sm:text-base">
            {t.sharePage.ctaDesc}
          </p>
          <Button
            asChild
            size="lg"
            className="relative mt-6 bg-white text-bauhaus-deep hover:bg-bauhaus-paper"
          >
            <Link href="/">
              {t.sharePage.tellYours}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
