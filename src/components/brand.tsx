"use client";

import { FloatingSymbol } from "@/components/motion/floating-symbol";

export function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <FloatingSymbol
        idle={false}
        className="flex size-8 items-center justify-center rounded-none border-2 border-foreground bg-bauhaus-deep shadow-hard-sm"
      >
        <span className="font-mono text-sm font-black leading-none text-white">
          {"{ }"}
        </span>
      </FloatingSymbol>
      <span className="font-heading text-base font-black tracking-tight uppercase text-foreground">
        Dev<span className="text-bauhaus-deep">Story</span>
      </span>
    </span>
  );
}