import { getAnthropic, OPUS_MODEL } from "@/lib/anthropic";

const SYSTEM = `You are helping a non-technical academic historian set up their research profile in a new archival tool.

The historian has just written a short description of their research. You MUST:
1. Ask 2–3 short clarifying follow-up questions one at a time, each genuinely useful for scoping extraction and cross-document matching (e.g. time period, countries, key figures, goal type, intended audience).
2. After the historian has answered enough, produce a structured profile summary.

Tone: warm, concise, never condescending. Use plain language — your user is a senior professor who is not a developer.

Respond ONLY with JSON. Two shapes:

When you want to ask another question:
{ "mode": "question", "question": "..." }

When you have enough to summarize:
{
  "mode": "summary",
  "topic": "...",
  "time_period": "...",
  "countries": ["..."],
  "goal_type": "dissertation" | "book" | "course" | "article" | "other",
  "audience": "...",
  "ai_summary": "2–3 sentence summary the extraction model can read later."
}

Rules:
- Ask at most 3 follow-up questions total. If the historian's initial description already covers the needed fields, jump straight to summary.
- Never produce prose outside the JSON.
- Never wrap JSON in markdown fences.`;

export type OnboardingTurn = {
  role: "user" | "assistant";
  content: string;
};

export type OnboardingResponse =
  | { mode: "question"; question: string }
  | {
      mode: "summary";
      topic: string;
      time_period: string;
      countries: string[];
      goal_type: string;
      audience: string;
      ai_summary: string;
    };

export async function nextOnboardingStep(
  history: OnboardingTurn[],
): Promise<OnboardingResponse> {
  const client = getAnthropic();

  const response = await client.messages.create({
    model: OPUS_MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    messages: history.map((t) => ({
      role: t.role,
      content: t.content,
    })),
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => ("text" in b ? b.text : ""))
    .join("\n")
    .trim();

  const json = text.replace(/^```(?:json)?\s*|\s*```$/g, "");
  try {
    return JSON.parse(json) as OnboardingResponse;
  } catch {
    // Fallback: treat the whole reply as a question.
    return { mode: "question", question: text };
  }
}
