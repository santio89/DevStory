import { generateSpeech } from "ai";
import type { DevStory } from "./story";
import type { Locale } from "@/lib/i18n/dictionary";
import { NoAIError } from "./ai";
import {
  createGatewayProvider,
  hasAIGatewayConfigured,
  hasOpenRouterConfigured,
} from "./providers";
import { narrationText } from "./tts-narration";
import { readTtsCache, ttsCacheKey, writeTtsCache } from "./tts-cache";

export { narrationText } from "./tts-narration";

const OPENROUTER_TTS_ENDPOINT = "https://openrouter.ai/api/v1/audio/speech";

/** 1.0 = provider default. Just under 1 keeps cinematic gravitas without dragging. */
const NARRATOR_SPEECH_SPEED = 0.95;

/** Deepgram baritone storyteller voices — most reliable for an older male narrator. */
const DEEPGRAM_TTS_MODEL = "deepgram/aura-2";
const DEEPGRAM_NARRATOR_VOICE: Record<Locale, string> = {
  en: "aura-2-pluto-en",
  es: "aura-2-sirio-es",
};

/** Steerable OpenAI model — use with explicit elderly-male instructions. */
const OPENAI_TTS_MODEL = "openai/gpt-4o-mini-tts";
const OPENAI_NARRATOR_VOICE = "onyx";

const GATEWAY_FAST_MODEL = "openai/tts-1";
const GATEWAY_FAST_VOICE = "onyx";

function narratorInstructions(locale: Locale): string {
  return locale === "es"
    ? "Narrador de cine clásico — un hombre mayor sabio, sesenta u ochenta años, como la voz de un documental épico o un monólogo de apertura. Barítono profundo, ronco, cálido, con peso dramático. Ritmo natural y fluido: pausado donde importa, pero nunca arrastrado, monótono ni aburrido. Nunca suenes joven, femenino, conversacional ni demasiado alegre."
    : "Classic movie narrator — a wise old man in his late sixties or seventies, like a prestige documentary or epic opening monologue. Deep baritone, gravelly, warm, cinematic, and authoritative. Natural pacing with weight: unhurried at the right moments, but never sluggish, flat, or boring. Brief pauses before key phrases. Never sound young, feminine, chatty, breathy, or perky.";
}

function assertAudioBuffer(buffer: Buffer): Buffer {
  if (buffer.length < 1024) {
    throw new Error("TTS returned an empty audio buffer.");
  }
  return buffer;
}

async function openRouterSpeech(body: Record<string, unknown>): Promise<Buffer> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new NoAIError();

  const res = await fetch(OPENROUTER_TTS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`TTS failed (${res.status}): ${detail}`);
  }

  return assertAudioBuffer(Buffer.from(await res.arrayBuffer()));
}

async function synthesizeDeepgramViaOpenRouter(
  story: DevStory,
  locale: Locale,
): Promise<Buffer> {
  const text = narrationText(story, locale);
  const voice = DEEPGRAM_NARRATOR_VOICE[locale];

  return openRouterSpeech({
    model: DEEPGRAM_TTS_MODEL,
    input: text,
    voice,
    response_format: "mp3",
    provider: {
      options: {
        deepgram: {
          speed: NARRATOR_SPEECH_SPEED,
        },
      },
    },
  });
}

async function synthesizeOpenAIViaOpenRouter(
  story: DevStory,
  locale: Locale,
): Promise<Buffer> {
  const text = narrationText(story, locale);

  return openRouterSpeech({
    model: OPENAI_TTS_MODEL,
    input: text,
    voice: OPENAI_NARRATOR_VOICE,
    response_format: "mp3",
    speed: NARRATOR_SPEECH_SPEED,
    provider: {
      options: {
        openai: {
          instructions: narratorInstructions(locale),
        },
      },
    },
  });
}

async function synthesizeViaOpenRouter(
  story: DevStory,
  locale: Locale,
): Promise<Buffer> {
  try {
    return await synthesizeDeepgramViaOpenRouter(story, locale);
  } catch (error) {
    console.warn(
      "OpenRouter Deepgram narrator failed, trying OpenAI steerable voice:",
      error,
    );
    return synthesizeOpenAIViaOpenRouter(story, locale);
  }
}

async function synthesizeViaGateway(
  story: DevStory,
  locale: Locale,
): Promise<Buffer> {
  if (!hasAIGatewayConfigured()) throw new NoAIError();

  const gateway = createGatewayProvider();
  const text = narrationText(story, locale);

  try {
    const result = await generateSpeech({
      model: gateway.speechModel(OPENAI_TTS_MODEL),
      text,
      voice: OPENAI_NARRATOR_VOICE,
      speed: NARRATOR_SPEECH_SPEED,
      language: locale === "es" ? "es" : "en",
      instructions: narratorInstructions(locale),
      outputFormat: "mp3",
    });
    return assertAudioBuffer(Buffer.from(result.audio.uint8Array));
  } catch (error) {
    console.warn("Gateway steerable TTS failed, trying tts-1 onyx:", error);
  }

  const result = await generateSpeech({
    model: gateway.speechModel(GATEWAY_FAST_MODEL),
    text,
    voice: GATEWAY_FAST_VOICE,
    speed: NARRATOR_SPEECH_SPEED,
    language: locale === "es" ? "es" : "en",
    outputFormat: "mp3",
  });

  return assertAudioBuffer(Buffer.from(result.audio.uint8Array));
}

export async function synthesizeStorySpeech(
  story: DevStory,
  locale: Locale,
): Promise<Buffer> {
  if (!hasOpenRouterConfigured() && !hasAIGatewayConfigured()) {
    throw new NoAIError();
  }

  const text = narrationText(story, locale);
  const cacheKey = ttsCacheKey(text, locale);
  const cached = readTtsCache(cacheKey);
  if (cached) return cached;

  let audio: Buffer;
  if (hasOpenRouterConfigured()) {
    try {
      audio = await synthesizeViaOpenRouter(story, locale);
    } catch (error) {
      if (!hasAIGatewayConfigured()) throw error;
      console.warn("OpenRouter TTS failed, trying Vercel AI Gateway:", error);
      audio = await synthesizeViaGateway(story, locale);
    }
  } else {
    audio = await synthesizeViaGateway(story, locale);
  }

  writeTtsCache(cacheKey, audio);
  return audio;
}
