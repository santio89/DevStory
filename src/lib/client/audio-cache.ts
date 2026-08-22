const CACHE_NAME = "devstory-tts-v1";

function cachePath(key: string): string {
  return `/tts/${encodeURIComponent(key)}`;
}

export async function readCachedAudio(key: string): Promise<Blob | null> {
  if (typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(cachePath(key));
    return res ? res.blob() : null;
  } catch {
    return null;
  }
}

export async function writeCachedAudio(key: string, blob: Blob): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(cachePath(key), new Response(blob));
  } catch {}
}
