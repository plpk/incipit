import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";
import { generateFilename } from "@/lib/filename";
import type { ConfidenceLevel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const ConfidenceEnum = z.enum(["high", "medium", "low", "unable"]);

const FieldSchema = z.object({
  value: z.string().nullable(),
  confidence: ConfidenceEnum,
});

const EntitySchema = z.object({
  name: z.string().min(1),
  entity_type: z.enum(["person", "place", "organization", "other"]),
  confidence: z.enum(["high", "medium", "low"]).default("medium"),
  context_snippet: z.string().optional(),
});

const ProvenanceSchema = z.object({
  archive_name: z.string().nullable().optional(),
  archive_location: z.string().nullable().optional(),
  acquisition_method: z.string().nullable().optional(),
  discovery_date: z.string().nullable().optional(),
  catalog_reference: z.string().nullable().optional(),
});

const BodySchema = z.object({
  research_profile_id: z.string().uuid().nullable().optional(),
  original_filename: z.string().min(1),
  file_base64: z.string().min(1),
  file_type: z.string().min(1),
  fields: z.object({
    publication_name: FieldSchema,
    publication_date: FieldSchema,
    title_subject: FieldSchema,
    author: FieldSchema,
    language: FieldSchema,
    extracted_text: FieldSchema,
  }),
  entities: z.array(EntitySchema).default([]),
  research_note: z.string().optional(),
  research_note_is_standing: z.boolean().default(true),
  provenance: ProvenanceSchema,
  is_outside_research: z.boolean().default(false),
  outside_research_reason: z.string().optional(),
  side_collection_name: z.string().optional(),
  // Which fields the historian edited vs left as-AI. Governs trust tier and
  // the initial changelog entries.
  edited_fields: z.array(z.string()).default([]),
  ai_originals: z
    .record(z.string(), z.string().nullable())
    .default({}),
});

export async function POST(req: Request) {
  try {
    assertServerEnv();
    const json = await req.json();
    const body = BodySchema.parse(json);
    const supabase = getServerSupabase();

    // 1. Upload the file to storage.
    const buffer = Buffer.from(body.file_base64, "base64");
    const ext = extensionFor(body.file_type, body.original_filename);
    const storagePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(env.supabaseBucket)
      .upload(storagePath, buffer, {
        contentType: body.file_type,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(env.supabaseBucket)
      .getPublicUrl(storagePath);
    const fileUrl = publicUrlData.publicUrl;

    // 2. Build confidence map. Anything the historian edited becomes T1-ish
    // per field; the doc-level trust tier is T1 if they looked at every field.
    const confidenceScores: Record<string, ConfidenceLevel> = {
      publication_name: body.fields.publication_name.confidence,
      publication_date: body.fields.publication_date.confidence,
      title_subject: body.fields.title_subject.confidence,
      author: body.fields.author.confidence,
      language: body.fields.language.confidence,
      extracted_text: body.fields.extracted_text.confidence,
    };

    // If the historian confirmed without edits we still promote to T1 — they
    // explicitly accepted the AI output. Edited fields are obviously T1.
    const trustTier = "T1";

    const extractedFilename = generateFilename({
      publication_date: body.fields.publication_date.value,
      publication_name: body.fields.publication_name.value,
      author: body.fields.author.value,
      title_subject: body.fields.title_subject.value,
      original_filename: body.original_filename,
    });

    // 3. Insert document row.
    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert({
        research_profile_id: body.research_profile_id ?? null,
        original_filename: body.original_filename,
        generated_filename: extractedFilename,
        file_url: fileUrl,
        file_path: storagePath,
        file_type: body.file_type,
        file_size_bytes: buffer.byteLength,
        extracted_text: body.fields.extracted_text.value,
        publication_name: body.fields.publication_name.value,
        publication_date: body.fields.publication_date.value,
        title_subject: body.fields.title_subject.value,
        author: body.fields.author.value,
        language: body.fields.language.value,
        confidence_scores: confidenceScores,
        trust_tier: trustTier,
        archive_name: body.provenance.archive_name ?? null,
        archive_location: body.provenance.archive_location ?? null,
        acquisition_method: body.provenance.acquisition_method ?? null,
        discovery_date: body.provenance.discovery_date || null,
        catalog_reference: body.provenance.catalog_reference ?? null,
        is_outside_research: body.is_outside_research,
        side_collection_name: body.is_outside_research
          ? body.side_collection_name ?? "Outside current research"
          : null,
        outside_research_reason: body.is_outside_research
          ? body.outside_research_reason ?? null
          : null,
      })
      .select()
      .single();
    if (insertError) throw insertError;

    // 4. Changelog: record AI→historian transitions and the initial rename.
    const changelog: Array<{
      document_id: string;
      field_changed: string;
      old_value: string | null;
      new_value: string | null;
      change_source: string;
    }> = [];

    for (const field of body.edited_fields) {
      changelog.push({
        document_id: doc.id,
        field_changed: field,
        old_value: body.ai_originals[field] ?? null,
        new_value:
          (body.fields as unknown as Record<string, { value: string | null }>)[field]
            ?.value ?? null,
        change_source: "historian_edit",
      });
    }

    if (extractedFilename !== body.original_filename) {
      changelog.push({
        document_id: doc.id,
        field_changed: "filename",
        old_value: body.original_filename,
        new_value: extractedFilename,
        change_source: "ai_rename",
      });
    }

    if (changelog.length > 0) {
      const { error: clError } = await supabase
        .from("document_changelog")
        .insert(changelog);
      if (clError) throw clError;
    }

    // 5. Entities + junction.
    if (body.entities.length > 0) {
      for (const ent of body.entities) {
        const { data: entRow, error: entErr } = await supabase
          .from("entities")
          .upsert(
            { name: ent.name, entity_type: ent.entity_type },
            { onConflict: "name,entity_type" },
          )
          .select()
          .single();
        if (entErr) throw entErr;
        const { error: linkErr } = await supabase
          .from("document_entities")
          .upsert(
            {
              document_id: doc.id,
              entity_id: entRow.id,
              confidence: ent.confidence,
              context_snippet: ent.context_snippet ?? null,
            },
            { onConflict: "document_id,entity_id" },
          );
        if (linkErr) throw linkErr;
      }
    }

    // 6. Research note.
    if (body.research_note && body.research_note.trim()) {
      const { error: noteErr } = await supabase.from("research_notes").insert({
        document_id: doc.id,
        research_profile_id: body.research_profile_id ?? null,
        note_text: body.research_note.trim(),
        is_standing_query: body.research_note_is_standing,
      });
      if (noteErr) throw noteErr;
    }

    return NextResponse.json({ document: doc });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
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
