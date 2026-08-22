import { FloatingSymbol } from "@/components/motion/floating-symbol";
import { cn } from "@/lib/utils";

const symbolBase =
  "pointer-events-auto absolute rounded-none border-2 border-foreground shadow-hard-sm";

/** Keep symbols outside the centered hero column on mid-width viewports. */
const leftFlank =
  "left-[max(0.5rem,calc(50%-22rem))] lg:left-[max(0.75rem,calc(50%-20rem))] xl:left-[30%]";
const rightFlank =
  "right-[max(0.5rem,calc(50%-22rem))] lg:right-[max(0.75rem,calc(50%-20rem))] xl:right-[32%]";

export function HeroFloatingSymbols() {
  return (
    <>
      <FloatingSymbol
        className={cn(
          symbolBase,
          leftFlank,
          "top-[170px] sm:top-[210px] lg:top-[240px]",
          "bg-bauhaus-yellow px-2 py-0.5 font-mono text-xs font-black text-bauhaus-ink sm:px-2.5 sm:py-1 sm:text-sm",
        )}
        drift={2}
        idleRotate={3}
      >
        {"< />"}
      </FloatingSymbol>
      <FloatingSymbol
        className={cn(
          symbolBase,
          rightFlank,
          "top-[170px] sm:top-[210px] lg:top-[240px]",
          "bg-bauhaus-deep px-2 py-0.5 font-mono text-sm font-black text-white sm:px-2.5 sm:py-1 sm:text-lg",
        )}
        idleRotate={-3}
      >
        {"{ }"}
      </FloatingSymbol>
      <FloatingSymbol
        className={cn(
          symbolBase,
          leftFlank,
          "top-[250px] sm:top-[290px] lg:top-[330px]",
          "bg-bauhaus-sky px-2 py-0.5 font-mono text-sm font-black text-bauhaus-deep sm:px-2.5 sm:py-1 sm:text-lg",
        )}
        drift={1}
        idleRotate={6}
      >
        {"&&"}
      </FloatingSymbol>
      <FloatingSymbol
        className={cn(
          symbolBase,
          rightFlank,
          "top-[250px] sm:top-[290px] lg:top-[330px]",
          "bg-bauhaus-pink px-1.5 py-0.5 font-mono text-xs font-black text-bauhaus-deep sm:px-2 sm:text-base",
        )}
        drift={3}
        idleRotate={-6}
      >
        {"||"}
      </FloatingSymbol>
      <FloatingSymbol
        className={cn(
          symbolBase,
          leftFlank,
          "top-[330px] max-md:top-[300px] sm:top-[380px] lg:top-[430px] md:hidden xl:block",
          "bg-bauhaus-cyan px-1.5 py-0.5 font-mono text-xs font-black text-bauhaus-ink sm:px-2 sm:text-base",
        )}
        drift={2.5}
        idleRotate={4}
      >
        ;
      </FloatingSymbol>
      <FloatingSymbol
        className={cn(
          symbolBase,
          rightFlank,
          "top-[330px] max-md:top-[300px] sm:top-[380px] lg:top-[430px] md:hidden xl:block",
          "bg-background px-1.5 py-0.5 font-mono text-xs font-black text-foreground sm:px-2 sm:text-sm",
        )}
        drift={4}
        idleRotate={-4}
      >
        {"=>"}
      </FloatingSymbol>
    </>
  );
}
