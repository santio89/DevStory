import { NextResponse } from "next/server";
import {
  chatStream,
  chatSystemPromptFromData,
  isOffTopic,
  NoAIError,
  type ChatRole,
} from "@/lib/devstory/ai";
import { parseBrainSnapshot } from "@/lib/devstory/brain";
import type { ChatExtras } from "@/lib/devstory/chat-context";
import { validateStory } from "@/lib/devstory/translate";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    messages?: unknown;
    story?: unknown;
    data?: unknown;
    brain?: unknown;
    locale?: unknown;
    extras?: unknown;
  };

  const story = validateStory(body.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const brain =
    parseBrainSnapshot(body.brain) ?? parseBrainSnapshot(body.data);

  const extras =
    body.extras &&
    typeof body.extras === "object" &&
    body.extras !== null &&
    typeof (body.extras as ChatExtras).moment?.title === "string" &&
    typeof (body.extras as ChatExtras).moment?.text === "string"
      ? (body.extras as ChatExtras)
      : undefined;

  const locale: Locale = body.locale === "es" ? "es" : "en";

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter(
      (m): m is { role: ChatRole; content: string } =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-12);

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "At least one message is required." },
      { status: 400 },
    );
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage && isOffTopic(lastUserMessage.content)) {
    return NextResponse.json({ message: dictionary[locale].chat.offTopic });
  }

  try {
    const system = chatSystemPromptFromData(story, brain, locale, extras);
    const result = chatStream(system, messages);
    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof NoAIError) {
      return NextResponse.json(
        { error: "AI provider not configured." },
        { status: 503 },
      );
    }
    console.error("Chat route failed:", error);
    return NextResponse.json({ error: "Chat failed." }, { status: 502 });
  }
}
