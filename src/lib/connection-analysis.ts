import type { SupabaseClient } from "@supabase/supabase-js";
import { getAnthropic, OPUS_MODEL } from "@/lib/anthropic";
import type { ResearchProfile, DocumentRow } from "@/lib/types";
import type Anthropic from "@anthropic-ai/sdk";

const MAX_CANDIDATES = 15;
const YEAR_WINDOW = 5;
const SUMMARY_CHARS = 500;

export type AnalysisEntity = {
  id: string;
  name: string;
  entity_type: string;
};

export type Candidate = {
  id: string;
  title: string;
  publication_name: string | null;
  publication_date: string | null;
  language: string | null;
  summary: string;
  entities: AnalysisEntity[];
  shared_entity_count: number;
  year_distance: number | null;
};

export type StandingNote = {
  id: string;
  document_id: string;
  document_title: string;
  note_text: string;
};

export type AnalysisInput = {
  doc: DocumentRow;
  docEntities: AnalysisEntity[];
  docResearchNote: string | null;
  candidates: Candidate[];
  standingNotes: StandingNote[];
  profile: ResearchProfile | null;
};

export type RawConnection = {
  target_document_id: string;
  connection_type: "direct" | "thematic" | "argumentative";
  strength: "strong" | "medium";
  description: string;
  linked_entities: string[];
  matched_note_id: string | null;
};

export type RawMatchedNote = {
  note_id: string;
  note_text: string;
  relevance: string;
};

export type AnalysisResult = {
  connections: RawConnection[];
  matched_notes: RawMatchedNote[];
  fits_research_profile: boolean;
  outside_research_explanation: string | null;
};

const SYSTEM_PROMPT = `You are a research assistant for an academic historian. You have deep knowledge of Latin American history, US-Puerto Rico relations, political movements, and archival research methodology.

You are analyzing a newly ingested document against the historian's existing archive. You have three tasks:

TASK 1 — CROSS-DOCUMENT CONNECTIONS
Compare the new document against the candidate documents provided. Identify meaningful connections at three levels:

- DIRECT: Same people, places, organizations, or events appear in both documents. This is the baseline.
- THEMATIC: Same political movements, ideological currents, institutional dynamics, or historical patterns — even if no named entities overlap. Example: a Bolivian editorial about pan-Americanism and a Puerto Rican nationalist article about the Kellogg Pact share no names but argue the same point from different national perspectives.
- ARGUMENTATIVE: The new document supports, contradicts, complicates, or extends an argument found in another document, relative to the historian's research goals. Example: "This CIA memo contradicts the timeline established by the Nacionalista articles — the arrest date differs by two weeks."

A connection is meaningful when it would change how the historian thinks about their research — when it would make them say "I need to look at this again." Do NOT flag connections that are trivially obvious (two articles from the same newspaper in the same week are not a meaningful connection just because they share a masthead).

TASK 2 — STANDING QUERY MATCHING
The historian records research notes — plain-language hunches — when uploading documents. Each note captures a suspected connection or lead. Compare the new document against every research note provided. A match means the new document provides evidence for, against, or adjacent to the historian's intuition — not just that they share a keyword.

TASK 3 — OUTSIDE-RESEARCH DETECTION
Given the research profile, does this document belong in the historian's current research scope? Only flag it as outside-scope if it is genuinely unrelated — different era, different geography, unrelated topic. Be conservative: historians often grab documents that seem tangential but turn out to be crucial.

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "connections": [
    {
      "target_document_id": "uuid",
      "connection_type": "direct" | "thematic" | "argumentative",
      "strength": "strong" | "medium",
      "description": "2-3 sentence explanation of why this connection matters to the research",
      "linked_entities": ["entity names involved"],
      "matched_note_id": "uuid or null — if this connection was triggered by a standing research note"
    }
  ],
  "matched_notes": [
    {
      "note_id": "uuid of the note that matched",
      "note_text": "the original note text",
      "relevance": "1-2 sentence explanation of how the new document relates to this hunch"
    }
  ],
  "fits_research_profile": true | false,
  "outside_research_explanation": "only if fits_research_profile is false — brief explanation of why this doesn't fit"
}`;

// =====================================================================
// Phase 1 — candidate retrieval
// =====================================================================
export async function buildAnalysisInput(
  supabase: SupabaseClient,
  documentId: string,
): Promise<AnalysisInput | null> {
  const { data: docData, error: docErr } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();
  if (docErr) throw docErr;
  if (!docData) return null;
  const doc = docData as DocumentRow;

  const docEntities = await fetchEntitiesFor(supabase, documentId);
  const docResearchNote = await fetchNoteForDocument(supabase, documentId);
  const profile = await fetchProfile(supabase, doc.research_profile_id);

  const candidates = await fetchCandidates(supabase, doc, docEntities);
  const standingNotes = await fetchStandingNotes(supabase, documentId);

  return {
    doc,
    docEntities,
    docResearchNote,
    candidates,
    standingNotes,
    profile,
  };
}

async function fetchProfile(
  supabase: SupabaseClient,
  profileId: string | null,
): Promise<ResearchProfile | null> {
  // Prefer the doc's linked profile; fall back to the most recent.
  if (profileId) {
    const { data } = await supabase
      .from("research_profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();
    if (data) return data as ResearchProfile;
  }
  const { data } = await supabase
    .from("research_profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ResearchProfile | null) ?? null;
}

async function fetchEntitiesFor(
  supabase: SupabaseClient,
  documentId: string,
): Promise<AnalysisEntity[]> {
  const { data, error } = await supabase
    .from("document_entities")
    .select("entities(id, name, entity_type)")
    .eq("document_id", documentId);
  if (error || !data) return [];
  const out: AnalysisEntity[] = [];
  for (const row of data) {
    const r = row as unknown as {
      entities?:
        | { id: string; name: string; entity_type: string }
        | Array<{ id: string; name: string; entity_type: string }>
        | null;
    };
    const raw = r.entities;
    const ent = Array.isArray(raw) ? raw[0] : raw;
    if (ent) out.push({ id: ent.id, name: ent.name, entity_type: ent.entity_type });
  }
  return out;
}

async function fetchNoteForDocument(
  supabase: SupabaseClient,
  documentId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("research_notes")
    .select("note_text")
    .eq("document_id", documentId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data?.note_text as string | undefined) ?? null;
}

async function fetchCandidates(
  supabase: SupabaseClient,
  doc: DocumentRow,
  docEntities: AnalysisEntity[],
): Promise<Candidate[]> {
  const sharedByEntity: Map<string, number> = new Map();
  if (docEntities.length > 0) {
    const entityIds = docEntities.map((e) => e.id);
    const { data: sharedRows } = await supabase
      .from("document_entities")
      .select("document_id, entity_id")
      .in("entity_id", entityIds)
      .neq("document_id", doc.id);
    for (const row of sharedRows ?? []) {
      const id = (row as { document_id: string }).document_id;
      sharedByEntity.set(id, (sharedByEntity.get(id) ?? 0) + 1);
    }
  }

  const sourceYear = extractYear(doc.publication_date);
  const dateMatches: Map<string, number> = new Map();
  if (sourceYear !== null) {
    // publication_date is free-form text; pull all docs with a parseable
    // year and filter in JS. Fine at hackathon scale.
    const { data: allDocs } = await supabase
      .from("documents")
      .select("id, publication_date")
      .neq("id", doc.id);
    for (const row of allDocs ?? []) {
      const r = row as { id: string; publication_date: string | null };
      const y = extractYear(r.publication_date);
      if (y === null) continue;
      const diff = Math.abs(y - sourceYear);
      if (diff <= YEAR_WINDOW) dateMatches.set(r.id, diff);
    }
  }

  // Union candidate ids.
  const candidateIds = new Set<string>([
    ...sharedByEntity.keys(),
    ...dateMatches.keys(),
  ]);
  if (candidateIds.size === 0) return [];

  // Rank: shared entity count desc, then year distance asc.
  const ranked = Array.from(candidateIds)
    .map((id) => ({
      id,
      shared: sharedByEntity.get(id) ?? 0,
      distance: dateMatches.get(id) ?? null,
    }))
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      const da = a.distance ?? 9999;
      const db = b.distance ?? 9999;
      return da - db;
    })
    .slice(0, MAX_CANDIDATES);

  const ids = ranked.map((r) => r.id);
  const { data: docs } = await supabase
    .from("documents")
    .select(
      "id, title_subject, publication_name, publication_date, language, extracted_text, original_filename",
    )
    .in("id", ids);
  const byId = new Map<string, Record<string, unknown>>();
  for (const row of docs ?? []) {
    byId.set((row as { id: string }).id, row as Record<string, unknown>);
  }

  // Entity lists, one query.
  const { data: entRows } = await supabase
    .from("document_entities")
    .select("document_id, entities(id, name, entity_type)")
    .in("document_id", ids);
  const entsById = new Map<string, AnalysisEntity[]>();
  for (const row of entRows ?? []) {
    const r = row as unknown as {
      document_id: string;
      entities?:
        | { id: string; name: string; entity_type: string }
        | Array<{ id: string; name: string; entity_type: string }>
        | null;
    };
    const raw = r.entities;
    const ent = Array.isArray(raw) ? raw[0] : raw;
    if (!ent) continue;
    const arr = entsById.get(r.document_id) ?? [];
    arr.push({ id: ent.id, name: ent.name, entity_type: ent.entity_type });
    entsById.set(r.document_id, arr);
  }

  const out: Candidate[] = [];
  for (const r of ranked) {
    const d = byId.get(r.id);
    if (!d) continue;
    const title =
      (d.title_subject as string | null) ??
      (d.publication_name as string | null) ??
      (d.original_filename as string | null) ??
      "Untitled document";
    const text = (d.extracted_text as string | null) ?? "";
    out.push({
      id: r.id,
      title,
      publication_name: (d.publication_name as string | null) ?? null,
      publication_date: (d.publication_date as string | null) ?? null,
      language: (d.language as string | null) ?? null,
      summary: text.slice(0, SUMMARY_CHARS),
      entities: entsById.get(r.id) ?? [],
      shared_entity_count: r.shared,
      year_distance: r.distance,
    });
  }
  return out;
}

async function fetchStandingNotes(
  supabase: SupabaseClient,
  excludeDocId: string,
): Promise<StandingNote[]> {
  const { data } = await supabase
    .from("research_notes")
    .select(
      "id, note_text, document_id, documents:document_id(id, title_subject, publication_name, original_filename)",
    )
    .eq("is_standing_query", true);
  if (!data) return [];
  const out: StandingNote[] = [];
  for (const row of data) {
    const r = row as unknown as {
      id: string;
      note_text: string;
      document_id: string | null;
      documents?:
        | {
            title_subject?: string | null;
            publication_name?: string | null;
            original_filename?: string | null;
          }
        | Array<{
            title_subject?: string | null;
            publication_name?: string | null;
            original_filename?: string | null;
          }>
        | null;
    };
    if (!r.document_id || r.document_id === excludeDocId) continue;
    const dRaw = r.documents;
    const d = Array.isArray(dRaw) ? dRaw[0] : dRaw;
    const title =
      d?.title_subject ?? d?.publication_name ?? d?.original_filename ?? "Untitled document";
    out.push({
      id: r.id,
      document_id: r.document_id,
      document_title: title,
      note_text: r.note_text,
    });
  }
  return out;
}

function extractYear(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/\b(1[5-9]\d{2}|20\d{2}|21\d{2})\b/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

// =====================================================================
// Phase 2 — Opus call
// =====================================================================
export async function runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
  const user = buildUserMessage(input);
  const client = getAnthropic();
  const response = await client.messages.create({
    model: OPUS_MODEL,
    max_tokens: 4096,
    // Opus 4.7 rejects the `temperature` parameter (deprecated for this
    // model). The deterministic output we need comes from the strict
    // JSON-only system prompt.
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: user }],
      },
    ],
  });
  const text = response.content
    .filter(
      (b: Anthropic.Messages.ContentBlock): b is Anthropic.Messages.TextBlock =>
        b.type === "text",
    )
    .map((b) => b.text)
    .join("\n")
    .trim();

  const json = extractJsonObject(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    console.error("[connection-analysis] JSON parse failed. Full response:\n", text);
    throw new Error("Failed to parse analysis JSON from Opus 4.7");
  }
  return normalizeResult(parsed);
}

function buildUserMessage(input: AnalysisInput): string {
  const { doc, docEntities, docResearchNote, candidates, standingNotes, profile } = input;

  const profileBlock = profile
    ? [
        `Description: ${profile.research_description}`,
        `Topic: ${profile.topic ?? "(unspecified)"}`,
        `Time period: ${profile.time_period ?? "(unspecified)"}`,
        `Countries: ${(profile.countries ?? []).join(", ") || "(unspecified)"}`,
        `Goal: ${profile.goal_type ?? "(unspecified)"}`,
        `Audience: ${profile.audience ?? "(unspecified)"}`,
        profile.ai_summary ? `AI summary: ${profile.ai_summary}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "(No research profile recorded — treat the document as in-scope unless it is plainly unrelated.)";

  const entityLine = docEntities.length
    ? docEntities.map((e) => `${e.name} (${e.entity_type})`).join("; ")
    : "(none detected)";

  const candidateBlocks = candidates.length
    ? candidates
        .map((c) => {
          const ents = c.entities.length
            ? c.entities.map((e) => `${e.name} (${e.entity_type})`).join("; ")
            : "(none)";
          return [
            `### Document: ${c.title} (ID: ${c.id})`,
            `Publication: ${c.publication_name ?? "(unknown)"}`,
            `Date: ${c.publication_date ?? "(unknown)"}`,
            `Language: ${c.language ?? "(unknown)"}`,
            `Entities: ${ents}`,
            `Summary: ${c.summary || "(no extracted text)"}`,
          ].join("\n");
        })
        .join("\n\n")
    : "(No candidate documents in the archive share entities or fall within the date window.)";

  const notesBlock = standingNotes.length
    ? standingNotes
        .map(
          (n) =>
            `- Note ID ${n.id} — on document "${n.document_title}" (document ID ${n.document_id}): "${n.note_text}"`,
        )
        .join("\n")
    : "(No standing research notes to match against.)";

  const fullText = doc.extracted_text ?? "";

  return [
    "## RESEARCH PROFILE",
    profileBlock,
    "",
    "## NEW DOCUMENT",
    `ID: ${doc.id}`,
    `Title: ${doc.title_subject ?? "(untitled)"}`,
    `Publication: ${doc.publication_name ?? "(unknown)"}`,
    `Date: ${doc.publication_date ?? "(unknown)"}`,
    `Language: ${doc.language ?? "(unknown)"}`,
    `Entities: ${entityLine}`,
    "Full extracted text:",
    fullText || "(no extracted text)",
    "",
    `Research note on this document: ${docResearchNote ?? "None"}`,
    "",
    "## CANDIDATE DOCUMENTS FROM ARCHIVE",
    candidateBlocks,
    "",
    "## STANDING RESEARCH NOTES",
    notesBlock,
  ].join("\n");
}

function normalizeResult(raw: unknown): AnalysisResult {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const connections = Array.isArray(obj.connections) ? obj.connections : [];
  const matchedNotes = Array.isArray(obj.matched_notes) ? obj.matched_notes : [];
  const fits = typeof obj.fits_research_profile === "boolean"
    ? (obj.fits_research_profile as boolean)
    : true;
  const explanation =
    typeof obj.outside_research_explanation === "string"
      ? (obj.outside_research_explanation as string)
      : null;

  const cleanConnections: RawConnection[] = [];
  for (const c of connections) {
    const r = (c ?? {}) as Record<string, unknown>;
    const type = r.connection_type as string;
    const strength = r.strength as string;
    if (
      typeof r.target_document_id !== "string" ||
      (type !== "direct" && type !== "thematic" && type !== "argumentative") ||
      (strength !== "strong" && strength !== "medium") ||
      typeof r.description !== "string"
    ) {
      continue;
    }
    cleanConnections.push({
      target_document_id: r.target_document_id,
      connection_type: type,
      strength,
      description: r.description,
      linked_entities: Array.isArray(r.linked_entities)
        ? (r.linked_entities as unknown[]).filter((v): v is string => typeof v === "string")
        : [],
      matched_note_id:
        typeof r.matched_note_id === "string" && r.matched_note_id ? r.matched_note_id : null,
    });
  }

  const cleanNotes: RawMatchedNote[] = [];
  for (const n of matchedNotes) {
    const r = (n ?? {}) as Record<string, unknown>;
    if (typeof r.note_id !== "string" || typeof r.relevance !== "string") continue;
    cleanNotes.push({
      note_id: r.note_id,
      note_text: typeof r.note_text === "string" ? r.note_text : "",
      relevance: r.relevance,
    });
  }

  return {
    connections: cleanConnections,
    matched_notes: cleanNotes,
    fits_research_profile: fits,
    outside_research_explanation: fits ? null : explanation,
  };
}

function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}
