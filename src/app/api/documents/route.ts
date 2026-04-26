import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
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
  // File is uploaded by /api/extract — this route receives the storage
  // reference only, keeping the POST body under Vercel's 4.5MB limit.
  file_path: z.string().min(1),
  file_url: z.string().min(1),
  file_type: z.string().min(1),
  file_size_bytes: z.number().int().nonnegative(),
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

const FIELD_LABELS: Record<string, string> = {
  "provenance.archive_name": "Archive name",
  "provenance.archive_location": "Location",
  "provenance.acquisition_method": "How obtained",
  "provenance.discovery_date": "Date found",
  "provenance.catalog_reference": "Catalog reference",
  "fields.publication_name.value": "Publication name",
  "fields.publication_date.value": "Date",
  "fields.title_subject.value": "Title / subject",
  "fields.author.value": "Author",
  "fields.language.value": "Language",
  "fields.extracted_text.value": "Extracted text",
  "research_note": "Research note",
  "original_filename": "Original filename",
  "file_path": "Storage path",
  "file_url": "File URL",
  "file_type": "File type",
  "file_size_bytes": "File size",
};

export async function POST(req: Request) {
  try {
    assertServerEnv();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const json = await req.json();
    const jsonForLog = json as Record<string, unknown>;
    console.log("[documents.POST] received", {
      user_id: user.id,
      original_filename: jsonForLog?.original_filename,
      file_type: jsonForLog?.file_type,
      file_path: jsonForLog?.file_path,
      file_size_bytes: jsonForLog?.file_size_bytes,
      provenance: jsonForLog?.provenance,
      research_profile_id: jsonForLog?.research_profile_id,
      is_outside_research: jsonForLog?.is_outside_research,
      side_collection_name: jsonForLog?.side_collection_name,
      edited_fields: jsonForLog?.edited_fields,
    });
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => {
        const path = i.path.join(".");
        const label = FIELD_LABELS[path] ?? path;
        return { field: path, label, message: i.message };
      });
      console.error("[documents.POST] zod validation failed", issues);
      const first = issues[0];
      return NextResponse.json(
        {
          error: `${first.label}: ${first.message}`,
          field: first.field,
          issues,
        },
        { status: 400 },
      );
    }
    const body = parsed.data;
    const supabase = getServerSupabase();

    // Defense-in-depth: the submitted file_path must belong to this user.
    if (!body.file_path.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: "Forbidden: file_path does not belong to the signed-in user" },
        { status: 403 },
      );
    }

    // If a research_profile_id is given, make sure it belongs to this user —
    // can't cross-link to someone else's profile.
    if (body.research_profile_id) {
      const { data: profile, error: rpErr } = await supabase
        .from("research_profiles")
        .select("id")
        .eq("id", body.research_profile_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (rpErr) throw rpErr;
      if (!profile) {
        return NextResponse.json(
          { error: "Forbidden: research profile does not belong to you" },
          { status: 403 },
        );
      }
    }

    // Enforce document cap.
    const { data: userProfile, error: profileErr } = await supabase
      .from("profiles")
      .select("document_count, document_limit")
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr) throw profileErr;
    const currentCount = userProfile?.document_count ?? 0;
    const limit = userProfile?.document_limit ?? 10;
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: `You've reached your early access limit of ${limit} documents. We'll expand this as Incipit grows.`,
          code: "DOCUMENT_LIMIT_REACHED",
        },
        { status: 403 },
      );
    }

    const storagePath = body.file_path;
    const fileUrl = body.file_url;

    const confidenceScores: Record<string, ConfidenceLevel> = {
      publication_name: body.fields.publication_name.confidence,
      publication_date: body.fields.publication_date.confidence,
      title_subject: body.fields.title_subject.confidence,
      author: body.fields.author.confidence,
      language: body.fields.language.confidence,
      extracted_text: body.fields.extracted_text.confidence,
    };

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
        user_id: user.id,
        research_profile_id: body.research_profile_id ?? null,
        original_filename: body.original_filename,
        generated_filename: extractedFilename,
        file_url: fileUrl,
        file_path: storagePath,
        file_type: body.file_type,
        file_size_bytes: body.file_size_bytes,
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

    // 4. Changelog.
    const changelog: Array<{
      user_id: string;
      document_id: string;
      field_changed: string;
      old_value: string | null;
      new_value: string | null;
      change_source: string;
    }> = [];

    for (const field of body.edited_fields) {
      changelog.push({
        user_id: user.id,
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
        user_id: user.id,
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

    // 5. Entities + junction. Entities are per-user now — uniqueness index
    // is (user_id, name, entity_type), matching the migration.
    if (body.entities.length > 0) {
      for (const ent of body.entities) {
        const { data: entRow, error: entErr } = await supabase
          .from("entities")
          .upsert(
            { user_id: user.id, name: ent.name, entity_type: ent.entity_type },
            { onConflict: "user_id,name,entity_type" },
          )
          .select()
          .single();
        if (entErr) throw entErr;
        const { error: linkErr } = await supabase
          .from("document_entities")
          .upsert(
            {
              user_id: user.id,
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
        user_id: user.id,
        document_id: doc.id,
        research_profile_id: body.research_profile_id ?? null,
        note_text: body.research_note.trim(),
        is_standing_query: body.research_note_is_standing,
      });
      if (noteErr) throw noteErr;
    }

    // 7. Increment the user's document counter.
    const { error: counterErr } = await supabase
      .from("profiles")
      .update({ document_count: currentCount + 1 })
      .eq("id", user.id);
    if (counterErr) {
      console.error("[documents.POST] counter increment failed", counterErr);
      // Don't fail the whole request — the doc is saved. Log and continue.
    }

    return NextResponse.json({ document: doc });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Unknown error";
    let field: string | undefined;
    const dateMatch = raw.match(/type date: "([^"]*)"/);
    if (dateMatch) field = "provenance.discovery_date";
    const message = field
      ? `${FIELD_LABELS[field] ?? field}: ${raw}`
      : raw;
    console.error("[documents.POST] failed", err);
    return NextResponse.json({ error: message, field }, { status: 500 });
  }
}

export async function DELETE() {
  // Wipes the caller's archive — docs, entities, connections, notes, and
  // their stored files. Only the signed-in user's data; never cross-user.
  try {
    assertServerEnv();

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const supabase = getServerSupabase();

    const { data: docs, error: listErr } = await supabase
      .from("documents")
      .select("file_path")
      .eq("user_id", user.id);
    if (listErr) throw listErr;

    const paths = (docs ?? [])
      .map((d) => d.file_path as string | null)
      .filter((p): p is string => !!p);
    if (paths.length > 0) {
      const CHUNK = 100;
      for (let i = 0; i < paths.length; i += CHUNK) {
        const slice = paths.slice(i, i + CHUNK);
        const { error: rmErr } = await supabase.storage
          .from(env.supabaseBucket)
          .remove(slice);
        if (rmErr) {
          console.error("[documents.deleteAll] storage remove failed", rmErr);
        }
      }
    }

    // Delete documents — cascades hit changelog, document_entities, connections.
    const { error: docErr } = await supabase
      .from("documents")
      .delete()
      .eq("user_id", user.id);
    if (docErr) throw docErr;

    const { error: entErr } = await supabase
      .from("entities")
      .delete()
      .eq("user_id", user.id);
    if (entErr) throw entErr;

    const { error: noteErr } = await supabase
      .from("research_notes")
      .delete()
      .eq("user_id", user.id);
    if (noteErr) throw noteErr;

    // Reset the counter.
    const { error: counterErr } = await supabase
      .from("profiles")
      .update({ document_count: 0 })
      .eq("id", user.id);
    if (counterErr) {
      console.error("[documents.deleteAll] counter reset failed", counterErr);
    }

    return NextResponse.json({ ok: true, removed_files: paths.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[documents.deleteAll] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
