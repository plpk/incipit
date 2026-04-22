import { NextResponse } from "next/server";
import { z } from "zod";
import { extractFromImage, type MediaInput } from "@/lib/vision-extraction";
import { getCurrentProfile } from "@/lib/queries";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Accepted upload MIME types — mirrors /api/upload-url.
const ACCEPTED: Record<string, MediaInput["mediaType"]> = {
  "image/png": "image/png",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
  "application/pdf": "application/pdf",
};

const BodySchema = z.object({
  file_path: z.string().min(1),
  file_type: z.string().min(1),
  original_filename: z.string().min(1),
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

    const mediaType = ACCEPTED[body.file_type];
    if (!mediaType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${body.file_type}` },
        { status: 400 },
      );
    }

    // Pull the bytes from Supabase storage. The client uploaded them
    // there directly via a signed URL — they never pass through this
    // function as a request body (so Vercel's 4.5MB edge cap does not
    // apply regardless of the PDF size).
    const supabase = getServerSupabase();
    const { data: blob, error: dlErr } = await supabase.storage
      .from(env.supabaseBucket)
      .download(body.file_path);
    if (dlErr || !blob) {
      console.error("[extract] storage download failed", dlErr);
      return NextResponse.json(
        { error: `Storage download failed: ${dlErr?.message ?? "no blob"}` },
        { status: 500 },
      );
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const { data: publicUrlData } = supabase.storage
      .from(env.supabaseBucket)
      .getPublicUrl(body.file_path);

    const profile = await getCurrentProfile();
    const extraction = await extractFromImage({ mediaType, base64 }, profile);

    return NextResponse.json({
      extraction,
      profileId: profile?.id ?? null,
      upload: {
        file_path: body.file_path,
        file_url: publicUrlData.publicUrl,
        file_type: body.file_type,
        file_size_bytes: buffer.byteLength,
        original_filename: body.original_filename,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[extract] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
