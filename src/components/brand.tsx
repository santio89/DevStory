"use client";

export function Brand() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-none border-2 border-foreground bg-bauhaus-deep shadow-hard-sm">
        <span className="font-mono text-sm font-black leading-none text-white">
          {"{ }"}
        </span>
      </span>
      <span className="font-heading text-base font-black tracking-tight uppercase">
        Dev<span className="text-bauhaus-deep">Story</span>
      </span>
    </span>
  );
}