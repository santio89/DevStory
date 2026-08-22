import { generateSpeech } from "ai";
import type { DevStory } from "./story";
import type { Locale } from "@/lib/i18n/dictionary";
import { NoAIError } from "./ai";
import {
  createGatewayProvider,
  hasAIGatewayConfigured,
  hasOpenRouterConfigured,
} from "./providers";

const OPENROUTER_TTS_ENDPOINT = "https://openrouter.ai/api/v1/audio/speech";

/** Deepgram baritone storyteller voices — most reliable for an older male narrator. */
const DEEPGRAM_TTS_MODEL = "deepgram/aura-2";
const DEEPGRAM_NARRATOR_VOICE: Record<Locale, string> = {
  en: "aura-2-pluto-en",
  es: "aura-2-sirio-es",
};
const DEEPGRAM_NARRATOR_SPEED = 0.82;

/** Steerable OpenAI model — use with explicit elderly-male instructions. */
const OPENAI_TTS_MODEL = "openai/gpt-4o-mini-tts";
const OPENAI_NARRATOR_VOICE = "onyx";
const OPENAI_NARRATOR_SPEED = 0.78;

const GATEWAY_HD_MODEL = "openai/tts-1-hd";
const GATEWAY_HD_VOICE = "onyx";
const GATEWAY_HD_SPEED = 0.8;

function narratorInstructions(locale: Locale): string {
  return locale === "es"
    ? "Voz masculina grave de un biógrafo mayor, de unos sesenta u ochenta años. Tono profundo, ronco, pausado y sabio. Ritmo lento y deliberado. Nunca suenes joven, femenina, alegre ni conversacional."
    : "Deep elderly male baritone voice — a biographer in his late sixties or seventies. Gravelly, slow, warm, and authoritative. Measured pacing with brief pauses. Never sound young, feminine, bright, breathy, or upbeat.";
}

/** Keep narration short; paragraph breaks become natural dramatic pauses. */
export function narrationText(story: DevStory, locale: Locale): string {
  const eraLine =
    story.eras.length > 0
      ? story.eras.map((era) => era.name).join(", ")
      : locale === "es"
        ? "tus primeros commits"
        : "your first commits";

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
          speed: DEEPGRAM_NARRATOR_SPEED,
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
    speed: OPENAI_NARRATOR_SPEED,
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
      speed: OPENAI_NARRATOR_SPEED,
      language: locale === "es" ? "es" : "en",
      instructions: narratorInstructions(locale),
      outputFormat: "mp3",
    });
    return assertAudioBuffer(Buffer.from(result.audio.uint8Array));
  } catch (error) {
    console.warn("Gateway steerable TTS failed, trying tts-1-hd onyx:", error);
  }

  const result = await generateSpeech({
    model: gateway.speechModel(GATEWAY_HD_MODEL),
    text,
    voice: GATEWAY_HD_VOICE,
    speed: GATEWAY_HD_SPEED,
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

  if (hasOpenRouterConfigured()) {
    try {
      return await synthesizeViaOpenRouter(story, locale);
    } catch (error) {
      if (!hasAIGatewayConfigured()) throw error;
      console.warn("OpenRouter TTS failed, trying Vercel AI Gateway:", error);
    }
  }

  return synthesizeViaGateway(story, locale);
}
