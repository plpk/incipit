import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  // Only allow the narrative + structured fields. ai_questions is sourced
  // from the onboarding chat and shouldn't be edited freeform here.
  research_description: z.string().min(10).optional(),
  topic: z.string().nullable().optional(),
  time_period: z.string().nullable().optional(),
  countries: z.array(z.string()).optional(),
  goal_type: z.string().nullable().optional(),
  audience: z.string().nullable().optional(),
  ai_summary: z.string().nullable().optional(),
});

export async function PUT(req: Request) {
  try {
    assertServerEnv();
    const json = await req.json();
    const body = UpdateSchema.parse(json);
    const supabase = getServerSupabase();

    // Single-profile v1: update the most recent row. If it's missing, 404
    // so the client can bounce the user to onboarding.
    const { data: existing, error: fetchErr } = await supabase
      .from("research_profiles")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) {
      return NextResponse.json(
        { error: "No research profile to update" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("research_profiles")
      .update(body)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ profile: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[research-profile.put] failed", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    assertServerEnv();
    const supabase = getServerSupabase();

    // documents.research_profile_id and research_notes.research_profile_id
    // are both ON DELETE SET NULL, so wiping the profile detaches but
    // doesn't remove those records. That's what we want — existing docs
    // stay in the archive, they just become unassociated.
    const SENTINEL = "00000000-0000-0000-0000-000000000000";
    const { error } = await supabase
      .from("research_profiles")
      .delete()
      .neq("id", SENTINEL);
    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[research-profile.delete] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
