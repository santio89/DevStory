import { REMIX_VOICES, NoAIError, type RemixVoice } from "@/lib/devstory/ai";
import type { DevStory } from "@/lib/devstory/story";
import type { Locale } from "@/lib/i18n/dictionary";

const TTS_ENDPOINT = "https://openrouter.ai/api/v1/audio/speech";

type TtsProvider = {
  model: string;
  enVoices: string[];
  esVoices: string[];
};

const AURA_ES = ["agustina", "alvaro", "antonia", "aquila"].map(
  (v) => `aura-2-${v}-es`,
);

const TTS_PROVIDERS: TtsProvider[] = [
  {
    model: "deepgram/aura-2",
    enVoices: [
      "aura-2-thalia-en",
      "aura-2-apollo-en",
      "aura-2-athena-en",
      "aura-2-aurora-en",
      "aura-2-andromeda-en",
      "aura-2-amalthea-en",
      "aura-2-asteria-en",
      "aura-2-atlas-en",
      "aura-2-arcas-en",
      "aura-2-aries-en",
      "aura-2-calliope-en",
      "aura-2-helena-en",
    ],
    esVoices: AURA_ES,
  },
  {
    model: "minimax/speech-2.8-hd",
    enVoices: ["male-qn-qingse", "female-shaonv"],
    esVoices: ["male-qn-qingse", "female-shaonv"],
  },
  {
    model: "deepgram/flux-tts:free",
    enVoices: [
      "flux-alexis-en",
      "flux-bree-en",
      "flux-brittany-en",
      "flux-brooke-en",
      "flux-bruce-en",
      "flux-cliff-en",
      "flux-cole-en",
      "flux-colin-en",
      "flux-conor-en",
      "flux-donovan-en",
      "flux-drew-en",
      "flux-elise-en",
    ],
    esVoices: [],
  },
];

function narrationText(story: DevStory, locale: Locale): string {
  const parts = [story.title, ""];
  for (const era of story.eras) {
    parts.push(`${era.year}. ${era.name}.`, era.description, "");
  }
  if (story.closing) parts.push(story.closing);
  parts.push(
    locale === "es"
      ? "Escrito por Your Dev Story."
      : "Written by Your Dev Story.",
  );
  return parts.join("\n").trim();
}

export async function synthesizeStorySpeech(
  story: DevStory,
  voice: RemixVoice,
  locale: Locale,
): Promise<Buffer> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new NoAIError();

  const index = Math.max(0, REMIX_VOICES.indexOf(voice));
  const text = narrationText(story, locale);

  for (const provider of TTS_PROVIDERS) {
    const pool =
      locale === "es" && provider.esVoices.length > 0
        ? provider.esVoices
        : provider.enVoices;
    if (pool.length === 0) continue;
    const name = pool[index % pool.length];
    try {
      const res = await fetch(TTS_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          input: text,
          voice: name,
          response_format: "mp3",
        }),
      });
      if (!res.ok) {
        console.warn(
          `TTS provider ${provider.model} failed (${res.status}): ${(await res.text()).slice(0, 200)}`,
        );
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 1024) continue;
      return buffer;
    } catch (error) {
      console.warn(`TTS provider ${provider.model} threw:`, error);
    }
  }
  throw new Error("All TTS providers failed.");
}