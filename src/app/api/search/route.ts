import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    assertServerEnv();
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    if (!q) return NextResponse.json({ results: [] });

    const supabase = getServerSupabase();
    const pattern = `%${q}%`;

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .or(
        [
          `extracted_text.ilike.${pattern}`,
          `publication_name.ilike.${pattern}`,
          `title_subject.ilike.${pattern}`,
          `author.ilike.${pattern}`,
          `archive_name.ilike.${pattern}`,
          `catalog_reference.ilike.${pattern}`,
        ].join(","),
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ results: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
