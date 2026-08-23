import { HeroField, HeroTilt } from "@/components/hero-field";

export function HeroStageBackground() {
  return (
    <div
      data-hero-stage
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="bauhaus-grid absolute inset-0 hidden opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_90%)] motion-reduce:block" />
      <HeroTilt>
        <HeroField />
      </HeroTilt>
    </div>
  );
}
