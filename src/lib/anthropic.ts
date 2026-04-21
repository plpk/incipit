import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

// Opus 4.7 is the current max-capability Claude model as of 2026-04-21.
// Use it for vision extraction, entity analysis, and connection surfacing.
export const OPUS_MODEL = "claude-opus-4-7";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  if (!env.anthropicKey) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }
  cached = new Anthropic({ apiKey: env.anthropicKey });
  return cached;
}
