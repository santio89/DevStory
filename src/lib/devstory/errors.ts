export function openRouterErrorMessage(error: unknown): string | null {
  return aiProviderErrorMessage(error);
}

export function aiProviderErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const statusCode =
    "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : null;
  const responseBody =
    "responseBody" in error && typeof error.responseBody === "string"
      ? error.responseBody
      : "";

  if (
    statusCode === 402 ||
    responseBody.includes("requires more credits") ||
    responseBody.includes("Insufficient credits")
  ) {
    return "AI credits are required for this feature. Add OpenRouter credits or configure Vercel AI Gateway.";
  }

  if (statusCode === 400 && responseBody.includes("invalid_json_schema")) {
    return "The AI provider rejected the request format. Try again.";
  }

  if (statusCode === 429 || responseBody.includes("rate limit")) {
    return "The AI is rate-limited right now. Try again in a moment.";
  }

  if (statusCode === 401 || statusCode === 403) {
    return "AI provider authentication failed. Check your API keys.";
  }

  return null;
}

export function ttsErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes("402") ||
      error.message.includes("Insufficient credits")
    ) {
      return "AI credits are required for narration. Add OpenRouter credits or configure Vercel AI Gateway.";
    }
  }
  return "Couldn't synthesize audio. Try again.";
}
