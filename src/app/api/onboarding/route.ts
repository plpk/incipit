import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { nextOnboardingStep, type OnboardingTurn } from "@/lib/onboarding";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  research_description: z.string().min(10),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    assertServerEnv();
    const json = await req.json();
    const body = BodySchema.parse(json);

    const turns: OnboardingTurn[] = [
      {
        role: "user",
        content: `My research description: ${body.research_description}`,
      },
      ...body.history,
    ];

    const result = await nextOnboardingStep(turns);

    if (result.mode === "summary") {
      const supabase = getServerSupabase();
      const qaPairs: Array<{ question: string; answer: string }> = [];
      for (let i = 0; i < body.history.length - 1; i++) {
        if (
          body.history[i].role === "assistant" &&
          body.history[i + 1]?.role === "user"
        ) {
          qaPairs.push({
            question: body.history[i].content,
            answer: body.history[i + 1].content,
          });
        }
      }

      const { data, error } = await supabase
        .from("research_profiles")
        .insert({
          research_description: body.research_description,
          topic: result.topic,
          time_period: result.time_period,
          countries: result.countries,
          goal_type: result.goal_type,
          audience: result.audience,
          ai_questions: qaPairs,
          ai_summary: result.ai_summary,
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate any cached server renders so that the next navigation
      // (client router.push to /upload) actually re-reads the profile.
      revalidatePath("/", "layout");

      return NextResponse.json({ mode: "summary", profile: data, summary: result });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
