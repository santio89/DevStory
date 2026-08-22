import type { DevStory } from "@/lib/devstory/story";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";
import type { Locale } from "@/lib/i18n/dictionary";

export type Moment = {
  title: string;
  text: string;
  year: string;
  dateLabel?: string;
};

const STORAGE_KEY = "devstory-moment";

type StoredMoment = {
  fingerprint: string;
  byLocale: Record<string, Moment>;
};

const inflight = new Map<string, Promise<Moment | null>>();

export function storyFingerprint(story: DevStory): string {
  return story.eras.map((era) => `${era.year}|${era.name}`).join("§");
}

export function readStoredMoments(
  fingerprint: string,
): Record<string, Moment> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMoment & {
      moment?: Moment;
      locale?: string;
    };
    if (parsed?.fingerprint !== fingerprint) return null;
    if (
      parsed.byLocale &&
      typeof parsed.byLocale === "object" &&
      Object.keys(parsed.byLocale).length > 0
    ) {
      return parsed.byLocale;
    }
    if (parsed.moment && parsed.locale) {
      return { [parsed.locale]: parsed.moment };
    }
  } catch {}
  return null;
}

export function readStoredMoment(
  fingerprint: string,
  locale: Locale,
): Moment | null {
  return readStoredMoments(fingerprint)?.[locale] ?? null;
}

export function writeStoredMoment(
  fingerprint: string,
  locale: Locale,
  moment: Moment,
) {
  const existing = readStoredMoments(fingerprint) ?? {};
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fingerprint,
        byLocale: { ...existing, [locale]: moment },
      } satisfies StoredMoment),
    );
  } catch {}
}

function requestKey(fingerprint: string, locale: Locale, refresh: boolean) {
  return `${fingerprint}|${locale}|${refresh ? "refresh" : "auto"}`;
}

export async function fetchStoryMoment({
  story,
  data,
  locale,
  fingerprint,
  refresh = false,
  signal,
}: {
  story: DevStory;
  data: StoryDataSnapshot | null;
  locale: Locale;
  fingerprint: string;
  refresh?: boolean;
  signal?: AbortSignal;
}): Promise<Moment | null> {
  if (!refresh) {
    const cached = readStoredMoment(fingerprint, locale);
    if (cached) return cached;
  }

  const key = requestKey(fingerprint, locale, refresh);
  const pending = inflight.get(key);
  if (pending) return pending;

  const task = (async () => {
    const res = await fetch("/api/story/moment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story,
        data,
        locale,
        seed: fingerprint,
        refresh,
      }),
      signal,
    });
    const json = (await res.json()) as { error?: string } & Moment;
    if (!res.ok) return null;
    const moment: Moment = {
      title: json.title,
      text: json.text,
      year: json.year,
      dateLabel: json.dateLabel,
    };
    writeStoredMoment(fingerprint, locale, moment);
    return moment;
  })().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, task);
  return task;
}

export function prefetchStoryMoment(
  story: DevStory,
  data: StoryDataSnapshot | null,
  locale: Locale,
): void {
  const fingerprint = storyFingerprint(story);
  if (readStoredMoment(fingerprint, locale)) return;
  const key = requestKey(fingerprint, locale, false);
  if (inflight.has(key)) return;

  const run = () => {
    void fetchStoryMoment({ story, data, locale, fingerprint, refresh: false });
  };

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(run, { timeout: 1500 });
  } else {
    run();
  }
}
