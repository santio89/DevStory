"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { HeroLookup } from "@/components/hero-lookup";
import { HeroTitle } from "@/components/hero-title";
import { HeroScrollCue } from "@/components/hero-scroll-cue";
import { FadeIn } from "@/components/motion/fade-in";
import { BrainProvider, useBrain } from "@/components/story/brain-provider";
import { StoryGenerator } from "@/components/story/story-generator";
import { StoryPreview } from "@/components/story/story-preview";
import { Marquee } from "@/components/story/marquee";
import type { Messages } from "@/lib/i18n/dictionary";
import {
  isValidGitHubUsername,
  normalizeGitHubUsername,
} from "@/lib/github/username";

function HomeWithUsername({
  username,
  hero,
  heroBackground,
  onUsernameChange,
}: {
  username: string;
  hero: Messages["hero"];
  heroBackground: ReactNode;
  onUsernameChange: (username: string) => void;
}) {
  const { brain, brainLoading } = useBrain();
  const [storyLoading, setStoryLoading] = useState(false);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    requestAnimationFrame(() => {
      document
        .getElementById("story")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [username]);

  const handleLookup = useCallback(
    (next: string) => {
      if (next === username) return;
      shouldScrollRef.current = true;
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("u", next);
        window.history.replaceState(null, "", url);
      } catch {}
      onUsernameChange(next);
    },
    [username, onUsernameChange],
  );

  const heroBusy = (brainLoading && !brain) || storyLoading;

  return (
    <>
      <section className="relative flex h-svh w-full flex-col overflow-hidden">
        {heroBackground}

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
          <div className="pointer-events-none flex min-h-0 flex-1 flex-col items-center justify-center pt-14 text-center sm:pt-16">
            <FadeIn variant="hero">
              <span className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-white px-3 py-1 font-mono text-xs font-bold tracking-[0.2em] text-black uppercase shadow-hard-sm dark:bg-black dark:text-white">
                <span className="inline-block size-2 animate-[blink-dot_1.6s_ease-in-out_infinite] rounded-none bg-bauhaus-cyan" />
                {hero.badge}
              </span>
            </FadeIn>

            <HeroTitle first={hero.titleFirst} second={hero.titleSecond} />

            <FadeIn variant="hero" delay={0.12}>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
                {hero.subtitle}
              </p>
            </FadeIn>

            <FadeIn variant="strike" delay={0.22} className="mt-8 flex w-full justify-center sm:mt-10">
              <HeroLookup
                username={username}
                loading={heroBusy}
                onLookup={handleLookup}
              />
            </FadeIn>
          </div>

          <div className="flex shrink-0 justify-center pb-8 sm:pb-10">
            <FadeIn variant="hero" delay={0.34}>
              <HeroScrollCue href="#story" label={hero.scrollDown} />
            </FadeIn>
          </div>
        </div>
      </section>

      <section
        id="story"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pt-10 pb-24 sm:px-6 sm:pt-12"
      >
        <StoryPreview username={username} />
        <div className="mt-20 mb-16">
          <Marquee />
        </div>
        <StoryGenerator username={username} onLoadingChange={setStoryLoading} />
      </section>
    </>
  );
}

export function HomeExperience({
  initialUsername,
  hero,
  heroBackground,
}: {
  initialUsername?: string;
  hero: Messages["hero"];
  heroBackground: ReactNode;
}) {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const fromUrl = initialUsername
        ? normalizeGitHubUsername(initialUsername).toLowerCase()
        : null;
      if (fromUrl && isValidGitHubUsername(fromUrl)) {
        setUsername(fromUrl);
        setReady(true);
        return;
      }
      if (initialUsername) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("u");
          window.history.replaceState(null, "", url);
        } catch {}
      }
      setUsername(null);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [initialUsername]);

  const handleLookup = useCallback((next: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("u", next);
      window.history.replaceState(null, "", url);
    } catch {}
    setUsername(next);
    requestAnimationFrame(() => {
      document
        .getElementById("story")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  if (ready && username) {
    return (
      <BrainProvider key={username} username={username} autoFetch>
        <HomeWithUsername
          username={username}
          hero={hero}
          heroBackground={heroBackground}
          onUsernameChange={setUsername}
        />
      </BrainProvider>
    );
  }

  return (
    <section className="relative flex h-svh w-full flex-col overflow-hidden">
      {heroBackground}

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
        <div className="pointer-events-none flex min-h-0 flex-1 flex-col items-center justify-center pt-14 text-center sm:pt-16">
          <FadeIn variant="hero">
            <span className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-white px-3 py-1 font-mono text-xs font-bold tracking-[0.2em] text-black uppercase shadow-hard-sm dark:bg-black dark:text-white">
              <span className="inline-block size-2 animate-[blink-dot_1.6s_ease-in-out_infinite] rounded-none bg-bauhaus-cyan" />
              {hero.badge}
            </span>
          </FadeIn>

          <HeroTitle first={hero.titleFirst} second={hero.titleSecond} />

          <FadeIn variant="hero" delay={0.12}>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-balance">
              {hero.subtitle}
            </p>
          </FadeIn>

          <FadeIn variant="strike" delay={0.22} className="mt-8 flex w-full justify-center sm:mt-10">
            {ready && (
              <HeroLookup username={null} loading={false} onLookup={handleLookup} />
            )}
          </FadeIn>
        </div>

        <div className="flex shrink-0 justify-center pb-8 sm:pb-10">
          <FadeIn variant="hero" delay={0.34}>
            <HeroScrollCue href="#features" label={hero.scrollDown} />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
