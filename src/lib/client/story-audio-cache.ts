import { narrationText } from "@/lib/devstory/tts-narration";
import type { DevStory } from "@/lib/devstory/story";
import type { Locale } from "@/lib/i18n/dictionary";

function hashString(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Cache key from the exact narration script + locale (invalidates when story text changes). */
export function storyAudioCacheKey(story: DevStory, locale: Locale): string {
  return `narrator-v6|${hashString(narrationText(story, locale))}`;
}

const memoryUrls = new Map<string, string>();

export function getMemoryAudioUrl(key: string): string | undefined {
  return memoryUrls.get(key);
}

export function setMemoryAudioUrl(key: string, url: string): void {
  const prev = memoryUrls.get(key);
  if (prev && prev !== url) URL.revokeObjectURL(prev);
  memoryUrls.set(key, url);
}

export function clearMemoryAudioUrls(): void {
  for (const url of memoryUrls.values()) URL.revokeObjectURL(url);
  memoryUrls.clear();
}
