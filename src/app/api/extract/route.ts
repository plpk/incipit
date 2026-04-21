import { NextResponse } from "next/server";
import { extractFromImage, type MediaInput } from "@/lib/vision-extraction";
import { getCurrentProfile } from "@/lib/queries";
import { assertServerEnv } from "@/lib/env";

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
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const profile = await getCurrentProfile();

    const extraction = await extractFromImage({ mediaType, base64 }, profile);

    return NextResponse.json({ extraction, profileId: profile?.id ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
