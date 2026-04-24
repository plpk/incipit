import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
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
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const json = await req.json();
    const body = UpdateSchema.parse(json);
    const supabase = getServerSupabase();

    const { data: existing, error: fetchErr } = await supabase
      .from("research_profiles")
      .select("id")
      .eq("user_id", user.id)
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
      .eq("user_id", user.id)
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

