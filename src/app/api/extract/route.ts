import { NextResponse } from "next/server";
import { extractFromImage, type MediaInput } from "@/lib/vision-extraction";
import { getCurrentProfile } from "@/lib/queries";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const ACCEPTED: Record<string, MediaInput["mediaType"]> = {
  "image/png": "image/png",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
  "application/pdf": "application/pdf",
};

export async function POST(req: Request) {
  try {
    assertServerEnv();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const mediaType = ACCEPTED[file.type];
    if (!mediaType) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Upload to Supabase storage now so the save step only has to write
    // the DB row. Keeps /api/documents's request body small (was sending
    // the whole base64 blob → 413 on PDFs above ~3MB).
    const supabase = getServerSupabase();
    const ext = extensionFor(file.type, file.name);
    const storagePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(env.supabaseBucket)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    if (uploadErr) {
      console.error("[extract] storage upload failed", uploadErr);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadErr.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(env.supabaseBucket)
      .getPublicUrl(storagePath);

    const profile = await getCurrentProfile();
    const extraction = await extractFromImage({ mediaType, base64 }, profile);

    return NextResponse.json({
      extraction,
      profileId: profile?.id ?? null,
      upload: {
        file_path: storagePath,
        file_url: publicUrlData.publicUrl,
        file_type: file.type,
        file_size_bytes: buffer.byteLength,
        original_filename: file.name,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[extract] failed", err);
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
