import { HeroField, HeroTilt, type HeroFieldVariant } from "@/components/hero-field";
import { cn } from "@/lib/utils";

const STAGE_MASK_HOME =
  "[mask-image:linear-gradient(to_bottom,black,transparent_92%)]";
const STAGE_MASK_SHARE =
  "[mask-image:linear-gradient(to_bottom,black_0%,black_62%,transparent_100%)]";

export function HeroStageBackground({
  variant = "home",
}: {
  variant?: HeroFieldVariant;
}) {
  const mask = variant === "share" ? STAGE_MASK_SHARE : STAGE_MASK_HOME;

  return (
    <div
      data-hero-stage
      data-hero-variant={variant}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className={cn(
          "bauhaus-grid absolute inset-0 hidden opacity-50 motion-reduce:block",
          mask,
        )}
      />
      <HeroTilt>
        <HeroField variant={variant} />
      </HeroTilt>
      {variant === "share" ? (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background sm:h-20"
        />
      ) : null}
    </div>
  );
}
