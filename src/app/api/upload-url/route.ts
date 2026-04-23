import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Accepted upload MIME types — kept in sync with react-dropzone's accept
// config and /api/extract's ACCEPTED map.
const ACCEPTED: Record<string, true> = {
  "image/png": true,
  "image/jpeg": true,
  "image/jpg": true,
  "image/webp": true,
  "image/gif": true,
  "application/pdf": true,
};

const BodySchema = z.object({
  filename: z.string().min(1),
  file_type: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    assertServerEnv();
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }
    const body = parsed.data;
    if (!ACCEPTED[body.file_type]) {
      return NextResponse.json(
        { error: `Unsupported file type: ${body.file_type}` },
        { status: 400 },
      );
    }

    const ext = extensionFor(body.file_type, body.filename);
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ext}`;

    const supabase = getServerSupabase();
    const { data, error } = await supabase.storage
      .from(env.supabaseBucket)
      .createSignedUploadUrl(path);
    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(env.supabaseBucket)
      .getPublicUrl(path);

    return NextResponse.json({
      path,
      token: data.token,
      signed_url: data.signedUrl,
      public_url: publicUrlData.publicUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[upload-url] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extensionFor(mimeType: string, filename: string): string {
  const m = filename.match(/\.([a-z0-9]{1,6})$/i);
  if (m) return `.${m[1].toLowerCase()}`;
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
  };
  return map[mimeType] ?? "";
}
