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
  "provenance_hints": {
    "archive_name":       { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
    "archive_location":   { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
    "catalog_reference":  { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" },
    "acquisition_method": { "value": string|null, "confidence": "high"|"medium"|"low"|"unable" }
  },
  "is_outside_research": boolean,
  "outside_research_reason": string,
  "summary": string
}

Notes on fields:
- extracted_text.value should contain the full readable text of the image, preserving line breaks where sensible. Spanish is common. If the text is very long (e.g. a dense newspaper page), you may abbreviate sections that are clearly irrelevant advertisements or repeated content with "[...]", but keep the main editorial content intact.
- entities should list the distinct people, places, and organizations mentioned, not every repetition. Cap at the ~25 most significant if the page is dense.
- provenance_hints: try to infer these from visible clues on the document ONLY — archive stamps, accession numbers, catalog codes, file folder labels, microfilm reel identifiers, library ownership stamps, "Property of…" markings, handwritten archival annotations. If nothing is visible, set value to null with confidence "unable". Never guess based on content alone.
  - acquisition_method should reflect what the image shows (e.g. "microfilm scan", "physical scan", "photograph of original") if that can be inferred from visual quality, margins, or markings; otherwise null.
- is_outside_research = true only if the document clearly does NOT fit the historian's stated research context.
- Keep summary under 50 words.
- Return JSON only. No prose, no markdown fences. Do not wrap the JSON in any kind of envelope or preamble.`;

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
    // 4096 was truncating full-newspaper-page extractions mid-JSON. 16384
    // gives Opus enough runway for a dense Spanish broadsheet with 20+
    // entities + summary while leaving headroom for the response envelope.
    max_tokens: 16384,
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

  // If Opus hit the token cap the JSON is incomplete — don't try to parse
  // garbage, give a clear error instead.
  if (response.stop_reason === "max_tokens") {
    console.error(
      "[vision-extraction] Response truncated (stop_reason=max_tokens). Full response:\n",
      text,
    );
    throw new Error(
      "Extraction response was truncated before completing. The document may be too long for a single pass — try cropping to one page.",
    );
  }

  const json = extractJsonObject(text);
  try {
    return JSON.parse(json) as VisionExtraction;
  } catch {
    // Log the full response server-side so we can diagnose without
    // relying on the truncated client-visible error.
    console.error(
      "[vision-extraction] JSON parse failed. stop_reason=",
      response.stop_reason,
      "\nFull response:\n",
      text,
    );
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
