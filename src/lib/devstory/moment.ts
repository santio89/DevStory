import type { Era } from "./story";
import type { StoryDataSnapshot } from "./minify";
import type { Locale } from "@/lib/i18n/dictionary";

export type MomentAnchor =
  | { kind: "memory"; year: string; dateLabel: string; event: string }
  | { kind: "era"; era: Era };

type Candidate = { date: string; event: string };

function toDate(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(dateStr: string, locale: Locale): string {
  const date = toDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function pickMomentAnchor(
  data: StoryDataSnapshot | null,
  era: Era,
  locale: Locale,
): MomentAnchor {
  const candidates: Candidate[] = [];
  for (const m of data?.milestones ?? []) {
    if (toDate(m.date)) {
      candidates.push({ date: m.date, event: `${m.repo}: "${m.msg}"` });
    }
  }
  for (const r of data?.repos ?? []) {
    if (toDate(r.created)) {
      candidates.push({ date: r.created, event: `created the repo ${r.name}` });
    }
  }

  if (candidates.length > 0) {
    const c = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      kind: "memory",
      year: c.date.slice(0, 4),
      dateLabel: dateLabel(c.date, locale),
      event: c.event,
    };
  }

  return { kind: "era", era };
}