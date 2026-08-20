import { NextResponse } from "next/server";
import { chatStream, chatSystemPrompt, NoAIError, type ChatRole } from "@/lib/devstory/ai";
import { validateStory } from "@/lib/devstory/translate";
import type { StoryDataSnapshot } from "@/lib/devstory/minify";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    messages?: unknown;
    story?: unknown;
    data?: unknown;
  };

  const story = validateStory(body.story);
  if (!story) {
    return NextResponse.json({ error: "Invalid story payload." }, { status: 400 });
  }

  const data =
    body.data && typeof body.data === "object"
      ? (body.data as StoryDataSnapshot)
      : null;

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

  try {
    const result = chatStream(chatSystemPrompt(story, data), messages);
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