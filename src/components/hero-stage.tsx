import { HeroField, HeroTilt, type HeroFieldVariant } from "@/components/hero-field";

export function HeroStageBackground({
  variant = "home",
}: {
  variant?: HeroFieldVariant;
}) {
  return (
    <div
      data-hero-stage
      data-hero-variant={variant}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="bauhaus-grid absolute inset-0 hidden opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] motion-reduce:block" />
      <HeroTilt>
        <HeroField variant={variant} />
      </HeroTilt>
    </div>
  );
}
