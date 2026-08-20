"use client";

import { useLocale } from "@/components/locale/locale-provider";

export function Marquee() {
  const { t } = useLocale();
  const row = t.marquee.join("  ·  ");

  return (
    <div className="relative overflow-hidden border-y border-border/60 py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] whitespace-nowrap">
        <span className="px-4 font-mono text-sm tracking-wide text-muted-foreground">
          {row}
        </span>
        <span
          aria-hidden="true"
          className="px-4 font-mono text-sm tracking-wide text-muted-foreground"
        >
          {row}
        </span>
      </div>
    </div>
  );
}