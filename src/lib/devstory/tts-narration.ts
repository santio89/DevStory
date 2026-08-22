import type { DevStory } from "./story";
import type { Locale } from "@/lib/i18n/dictionary";

/** Short narrator script — title, summary, era names, closing. Not full era prose. */
export function narrationText(story: DevStory, locale: Locale): string {
  const eraLine =
    story.eras.length > 0
      ? story.eras.map((era) => era.name).join(", ")
      : locale === "es"
        ? "sus primeros commits"
        : "their first commits";

  const parts = [
    story.title,
    story.summary,
    locale === "es"
      ? `El viaje atraviesa ${eraLine}.`
      : `The journey moves through ${eraLine}.`,
    story.closing,
  ].filter((part): part is string => Boolean(part?.trim()));

  return parts.join("\n\n");
}
