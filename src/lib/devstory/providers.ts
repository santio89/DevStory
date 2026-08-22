import { createOpenAI } from "@ai-sdk/openai";
import { createGateway } from "ai";

export type ModelProvider = "openrouter" | "gateway";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const APP_NAME = "Your Dev Story";
const DEFAULT_MODEL = "openai/gpt-4.1-mini";

export function hasOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function hasAIGatewayConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

export function hasAIProviderConfigured(): boolean {
  return hasOpenRouterConfigured() || hasAIGatewayConfigured();
}

export function getModelProviders(): ModelProvider[] {
  const providers: ModelProvider[] = [];
  if (hasOpenRouterConfigured()) providers.push("openrouter");
  if (hasAIGatewayConfigured()) providers.push("gateway");
  return providers;
}

function languageModelId(): string {
  return process.env.AI_GATEWAY_MODEL ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
}

export function createLanguageModel(provider: ModelProvider) {
  if (provider === "openrouter") {
    const openai = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
      headers: {
        "HTTP-Referer": "https://yourdevstory.vercel.app",
        "X-Title": APP_NAME,
      },
    });
    return openai(process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL);
  }

  const gateway = createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });
  return gateway(languageModelId());
}

export function createModel() {
  const [primary] = getModelProviders();
  if (!primary) throw new Error("No AI provider configured");
  return createLanguageModel(primary);
}

export async function runWithModelFallback<T>(
  run: (model: ReturnType<typeof createLanguageModel>) => Promise<T>,
): Promise<T> {
  const providers = getModelProviders();
  if (providers.length === 0) {
    throw new Error("No AI provider configured");
  }

  let lastError: unknown;
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]!;
    try {
      return await run(createLanguageModel(provider));
    } catch (error) {
      lastError = error;
      if (i < providers.length - 1) {
        console.warn(`AI provider "${provider}" failed, trying fallback:`, error);
      }
    }
  }
  throw lastError;
}

export function runWithModelFallbackSync<T>(
  run: (model: ReturnType<typeof createLanguageModel>) => T,
): T {
  const providers = getModelProviders();
  if (providers.length === 0) {
    throw new Error("No AI provider configured");
  }

  let lastError: unknown;
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]!;
    try {
      return run(createLanguageModel(provider));
    } catch (error) {
      lastError = error;
      if (i < providers.length - 1) {
        console.warn(`AI provider "${provider}" failed, trying fallback:`, error);
      }
    }
  }
  throw lastError;
}

export function createGatewayProvider() {
  return createGateway({
    apiKey: process.env.AI_GATEWAY_API_KEY,
  });
}
