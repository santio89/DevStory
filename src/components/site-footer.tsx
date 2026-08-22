"use client";

import { Reveal } from "@/components/motion/fade-in";
import { siteName } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export function SiteFooter({ tagline }: { tagline: string }) {
  return (
    <footer className="border-t-4 border-foreground bg-foreground text-background">
      <Reveal
        variant="footer"
        className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-8 sm:flex-row sm:px-6"
      >
        <span className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
          <ArrowRight className="size-3 shrink-0 text-bauhaus-yellow dark:text-bauhaus-deep" />
          {tagline}
        </span>
        <span className="font-mono text-xs font-bold tracking-widest uppercase">
          {siteName}
        </span>
      </Reveal>
    </footer>
  );
}
