import { NextResponse } from "next/server";
import { z } from "zod";
import { extractFromImage, type MediaInput } from "@/lib/vision-extraction";
import { getCurrentProfile } from "@/lib/queries";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";

export const runtime = "nodejs";
// Dense multi-page English government documents push Opus vision past
// 120s. 300s is the new Vercel default cap — gives Opus the runway and
// keeps the function from hitting the 504-HTML-error-page path. If the
// function does timeout, Vercel returns HTML (not JSON) and WebKit's
// res.json() throws DOMException "The string did not match the expected
// pattern." on the client — the symptom we were chasing.
export const maxDuration = 300;
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
  const t0 = Date.now();
  const elapsed = () => `${Date.now() - t0}ms`;
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
    console.log("[extract] start", {
      file_path: body.file_path,
      file_type: body.file_type,
      original_filename: body.original_filename,
    });

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
    console.log("[extract] downloaded from storage", {
      bytes: buffer.byteLength,
      at: elapsed(),
    });

    const { data: publicUrlData } = supabase.storage
      .from(env.supabaseBucket)
      .getPublicUrl(body.file_path);

    const profile = await getCurrentProfile();
    console.log("[extract] calling Opus vision", { at: elapsed() });
    const extraction = await extractFromImage({ mediaType, base64 }, profile);
    console.log("[extract] Opus returned", {
      at: elapsed(),
      extracted_text_len: extraction.extracted_text?.value?.length ?? 0,
      entity_count: extraction.entities?.length ?? 0,
    });

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
    // Guaranteed JSON on the error path — never let the client see a
    // plain HTML stack trace. (Vercel's 504 page is the one case we
    // cannot wrap; bumping maxDuration to 300 is the guard for that.)
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[extract] failed after", elapsed(), err);
    return NextResponse.json(
      { error: message, elapsed_ms: Date.now() - t0 },
      { status: 500 },
    );
  }
}
