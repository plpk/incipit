import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, OPUS_MODEL } from "@/lib/anthropic";
import type { ResearchProfile, VisionExtraction } from "@/lib/types";

const EXTRACTION_SYSTEM = `You are an archival metadata extractor helping a historian build a searchable archive of primary sources.

You receive an image of a scanned primary source (newspaper page, letter, government record, photograph of an archival page). You read the image directly — never trust any OCR text layer in a PDF.

For every field you return a confidence level:
- "high"    — unambiguous, visible in the image
- "medium"  — strongly suggested by visual cues but not 100% certain
- "low"     — a best guess
- "unable"  — cannot determine from the image

Never silently guess. If you cannot read a field, use "unable" and set value to null.

Respond ONLY with JSON that matches this schema exactly:
{
  "publication_name":   { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
  "publication_date":   { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
  "title_subject":      { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
  "author":             { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
  "language":           { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
  "extracted_text":     { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
  "entities": [
    { "name": string, "entity_type": "person"|"place"|"organization"|"other", "confidence": "high"|"medium"|"low", "context_snippet": string }
  ],
  "is_outside_research": boolean,
  "outside_research_reason": string,
  "summary": string
}

Notes:
- extracted_text.value should contain the full readable text of the image, preserving line breaks where sensible. Spanish is common.
- entities should list the distinct people, places, and organizations mentioned, not every repetition.
- is_outside_research = true only if the document clearly does NOT fit the historian's stated research context.
- Keep summary under 60 words.
- Return JSON only. No prose, no markdown fences.`;

export type MediaInput = {
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif" | "application/pdf";
  base64: string;
};

export async function extractFromImage(
  media: MediaInput,
  profile: ResearchProfile | null,
): Promise<VisionExtraction> {
  const client = getAnthropic();

  const contextBlock = profile
    ? `The historian's research context:
- Description: ${profile.research_description}
- Topic: ${profile.topic ?? "(unspecified)"}
- Time period: ${profile.time_period ?? "(unspecified)"}
- Countries: ${(profile.countries ?? []).join(", ") || "(unspecified)"}
- Goal: ${profile.goal_type ?? "(unspecified)"}
- Audience: ${profile.audience ?? "(unspecified)"}
${profile.ai_summary ? `- AI summary: ${profile.ai_summary}` : ""}

Use this context to judge is_outside_research. Never let it force a reading that the image does not support.`
    : "(No research profile yet — do not classify anything as outside research.)";

  const sourceBlock =
    media.mediaType === "application/pdf"
      ? ({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: media.base64,
          },
        } as const)
      : ({
          type: "image",
          source: {
            type: "base64",
            media_type: media.mediaType,
            data: media.base64,
          },
        } as const);

  const response = await client.messages.create({
    model: OPUS_MODEL,
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sourceBlock as any,
          {
            type: "text",
            text: `${contextBlock}\n\nExtract the archival metadata from this image. Return JSON only.`,
          },
        ],
      },
    ],
  });

  const text = response.content
    .filter((b: Anthropic.Messages.ContentBlock): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const json = extractJsonObject(text);
  try {
    return JSON.parse(json) as VisionExtraction;
  } catch {
    // Log the full response server-side so we can diagnose without
    // relying on the truncated client-visible error.
    console.error("[vision-extraction] JSON parse failed. Full response:\n", text);
    throw new Error(
      `Failed to parse extraction JSON. Raw response: ${text.slice(0, 1000)}`,
    );
  }
}

// Returns the first complete top-level JSON object inside `text`, ignoring
// any preamble, trailing commentary, or markdown fences Opus may add.
//
// Strategy:
//   1. If a ```json … ``` fence is present, use that.
//   2. Otherwise, find the first "{", then walk forward tracking string
//      escapes and brace depth until the matching "}".
function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const start = text.indexOf("{");
  if (start === -1) return text;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  // Unbalanced braces — return from the first { onward so the caller's
  // JSON.parse produces a useful error referencing the real content.
  return text.slice(start);
}
