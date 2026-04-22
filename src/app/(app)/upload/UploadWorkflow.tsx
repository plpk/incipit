"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { entityClass, type EntityKind } from "@/lib/design";
import type { ConfidenceLevel, VisionExtraction } from "@/lib/types";

type Stage =
  | "idle"
  | "uploading"
  | "extracting"
  | "review"
  | "saving"
  | "analyzing"
  | "done"
  | "error";

type AnalysisSummary = {
  connectionCount: number;
  noteMatchCount: number;
  fitsResearchProfile: boolean;
  outsideExplanation: string | null;
};

type ProvenanceState = {
  archive_name: string;
  archive_location: string;
  acquisition_method: string;
  discovery_date: string;
  catalog_reference: string;
};

type ProvenanceConfidence = {
  archive_name: ConfidenceLevel | null;
  archive_location: ConfidenceLevel | null;
  acquisition_method: ConfidenceLevel | null;
  catalog_reference: ConfidenceLevel | null;
};

const EMPTY_PROVENANCE: ProvenanceState = {
  archive_name: "",
  archive_location: "",
  acquisition_method: "",
  discovery_date: "",
  catalog_reference: "",
};

const EMPTY_PROVENANCE_CONF: ProvenanceConfidence = {
  archive_name: null,
  archive_location: null,
  acquisition_method: null,
  catalog_reference: null,
};

type EditableFields = {
  publication_name: { value: string | null; confidence: ConfidenceLevel };
  publication_date: { value: string | null; confidence: ConfidenceLevel };
  title_subject: { value: string | null; confidence: ConfidenceLevel };
  author: { value: string | null; confidence: ConfidenceLevel };
  language: { value: string | null; confidence: ConfidenceLevel };
  extracted_text: { value: string | null; confidence: ConfidenceLevel };
};

const FIELD_LABELS: Record<keyof EditableFields, string> = {
  publication_name: "Publication / source",
  publication_date: "Date",
  title_subject: "Title or subject",
  author: "Author",
  language: "Language",
  extracted_text: "Extracted text",
};

export function UploadWorkflow({ profileId }: { profileId: string | null }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<VisionExtraction | null>(null);
  const [fields, setFields] = useState<EditableFields | null>(null);
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const [aiOriginals, setAiOriginals] = useState<Record<string, string | null>>({});

  const [provenance, setProvenance] = useState<ProvenanceState>(EMPTY_PROVENANCE);
  const [provenanceConf, setProvenanceConf] = useState<ProvenanceConfidence>(
    EMPTY_PROVENANCE_CONF,
  );
  const [batchMode, setBatchMode] = useState(false);
  const [researchNote, setResearchNote] = useState("");
  const [noteIsStanding, setNoteIsStanding] = useState(true);
  const [saveToSideCollection, setSaveToSideCollection] = useState(false);
  const [sideCollectionName, setSideCollectionName] = useState("");

  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const router = useRouter();

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      const picked = accepted[0];
      setError(null);
      setStage("uploading");
      setFile(picked);

      if (picked.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(picked));
      } else {
        setPreview(null);
      }

      try {
        const arrayBuffer = await picked.arrayBuffer();
        const base64 = bufferToBase64(arrayBuffer);
        setFileBase64(base64);

        setStage("extracting");
        const form = new FormData();
        form.append("file", picked);
        const res = await fetch("/api/extract", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Extraction failed");

        const ext: VisionExtraction = data.extraction;
        setExtraction(ext);
        setFields({
          publication_name: ext.publication_name,
          publication_date: ext.publication_date,
          title_subject: ext.title_subject,
          author: ext.author,
          language: ext.language,
          extracted_text: ext.extracted_text,
        });
        setAiOriginals({
          publication_name: ext.publication_name.value,
          publication_date: ext.publication_date.value,
          title_subject: ext.title_subject.value,
          author: ext.author.value,
          language: ext.language.value,
          extracted_text: ext.extracted_text.value,
        });
        setEditedFields(new Set());

        const hints = ext.provenance_hints ?? {};
        setProvenance((prev) => ({
          archive_name:
            prev.archive_name || hints.archive_name?.value || "",
          archive_location:
            prev.archive_location || hints.archive_location?.value || "",
          acquisition_method:
            prev.acquisition_method || hints.acquisition_method?.value || "",
          discovery_date: prev.discovery_date,
          catalog_reference:
            prev.catalog_reference || hints.catalog_reference?.value || "",
        }));
        setProvenanceConf({
          archive_name: hints.archive_name?.confidence ?? null,
          archive_location: hints.archive_location?.confidence ?? null,
          acquisition_method: hints.acquisition_method?.confidence ?? null,
          catalog_reference: hints.catalog_reference?.confidence ?? null,
        });

        if (ext.is_outside_research) {
          setSaveToSideCollection(true);
          setSideCollectionName(ext.outside_research_reason?.slice(0, 60) ?? "");
        }

        setStage("review");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setStage("error");
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/gif": [],
      "application/pdf": [],
    },
  });

  const canSave = useMemo(() => {
    if (!fields) return false;
    if (saveToSideCollection && !sideCollectionName.trim()) return false;
    return stage === "review";
  }, [fields, stage, saveToSideCollection, sideCollectionName]);

  function updateField<K extends keyof EditableFields>(key: K, value: string) {
    setFields((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: { ...prev[key], value: value.trim() ? value : null },
      };
    });
    setEditedFields((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  function updateProvenance<K extends keyof ProvenanceState>(key: K, value: string) {
    setProvenance((prev) => ({ ...prev, [key]: value }));
    if (key !== "discovery_date") {
      const confKey = key as keyof ProvenanceConfidence;
      setProvenanceConf((prev) => ({ ...prev, [confKey]: null }));
    }
  }

  function resetForNext(keepProvenance: boolean) {
    setFile(null);
    setFileBase64(null);
    setPreview(null);
    setExtraction(null);
    setFields(null);
    setEditedFields(new Set());
    setAiOriginals({});
    setResearchNote("");
    setSaveToSideCollection(false);
    setSideCollectionName("");
    if (!keepProvenance) setProvenance(EMPTY_PROVENANCE);
    setProvenanceConf(EMPTY_PROVENANCE_CONF);
    setStage("idle");
    setSavedDocId(null);
    setAnalysis(null);
  }

  async function handleSave() {
    if (!fields || !file || !fileBase64) return;
    setStage("saving");
    setError(null);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          research_profile_id: profileId,
          original_filename: file.name,
          file_base64: fileBase64,
          file_type: file.type,
          fields,
          entities: extraction?.entities ?? [],
          research_note: researchNote,
          research_note_is_standing: noteIsStanding,
          provenance,
          is_outside_research: saveToSideCollection,
          outside_research_reason: extraction?.outside_research_reason,
          side_collection_name: saveToSideCollection
            ? sideCollectionName || "Outside current research"
            : undefined,
          edited_fields: Array.from(editedFields),
          ai_originals: aiOriginals,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Server returns { error, field?, issues? } — the error string is
        // already prefixed with the human-readable field label when known.
        throw new Error(data.error ?? "Save failed");
      }
      const newId: string = data.document.id;
      setSavedDocId(newId);

      // Kick off cross-document analysis. Don't block the save on failures —
      // the document is already committed.
      setStage("analyzing");
      try {
        const aRes = await fetch(
          `/api/documents/${newId}/analyze-connections`,
          { method: "POST" },
        );
        const aData = await aRes.json();
        if (aRes.ok && aData?.analysis) {
          const a = aData.analysis as {
            connections: Array<{ matched_note_id: string | null }>;
            matched_notes: unknown[];
            fits_research_profile: boolean;
            outside_research_explanation: string | null;
          };
          setAnalysis({
            connectionCount: a.connections.length,
            noteMatchCount: a.connections.filter((c) => c.matched_note_id)
              .length,
            fitsResearchProfile: a.fits_research_profile,
            outsideExplanation: a.outside_research_explanation,
          });
        }
      } catch (aErr) {
        console.error("analyze-connections failed", aErr);
      }
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setStage("error");
    }
  }

  if (stage === "idle") {
    return (
      <div
        {...getRootProps()}
        className="card flex cursor-pointer flex-col items-center justify-center gap-3 text-center transition animate-fade-up"
        style={{
          padding: "72px 32px",
          border: `2px dashed ${isDragActive ? "#0d9488" : "rgba(0,0,0,0.08)"}`,
          background: isDragActive
            ? "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))"
            : "#ffffff",
        }}
      >
        <input {...getInputProps()} />
        <span
          className="mb-2 inline-flex items-center justify-center text-white"
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
            boxShadow: "0 4px 16px rgba(13,148,136,0.25)",
          }}
          aria-hidden
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </span>
        <p
          className="font-display font-bold text-ink-900"
          style={{ fontSize: 20, letterSpacing: "-0.02em" }}
        >
          {isDragActive ? "Drop the file here…" : "Drop a scan or click to pick a file"}
        </p>
        <p className="text-[14px] text-ink-500">
          PDF or image. We&apos;ll read the picture directly — OCR text layers are ignored.
        </p>
        <p className="mt-2 text-[12px] text-ink-400">
          You&apos;ll review everything Incipit finds — including any archive markings — before anything is saved.
        </p>
      </div>
    );
  }

  if (stage === "uploading" || stage === "extracting" || stage === "analyzing") {
    const title =
      stage === "uploading"
        ? "Reading your file…"
        : stage === "extracting"
          ? "Opus 4.7 is reading the image…"
          : "Analyzing connections across your archive…";
    const subtitle =
      stage === "analyzing"
        ? "Comparing this document against every earlier upload and every research note you've saved."
        : "This can take 20–60 seconds for a dense page. Keep this window open.";
    return (
      <div className="card flex flex-col items-center gap-5 text-center animate-fade-up" style={{ padding: "64px 32px" }}>
        <Spinner />
        <p
          className="font-display font-bold text-ink-900"
          style={{ fontSize: 18, letterSpacing: "-0.02em" }}
        >
          {title}
        </p>
        <p className="text-[14px] text-ink-500">{subtitle}</p>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="card animate-fade-up" style={{ padding: "32px" }}>
        <span className="pill-verified">✓ Saved</span>
        <h2
          className="mt-4 font-display font-extrabold text-ink-900"
          style={{ fontSize: 24, letterSpacing: "-0.03em" }}
        >
          Document added to your archive.
        </h2>
        <p className="mt-2 text-[14px] text-ink-500">
          All fields you touched are marked as verified (T1).
        </p>

        {analysis && (
          <div className="mt-6 flex flex-col gap-3">
            {analysis.connectionCount > 0 && (
              <div
                className="rounded-card-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(13,148,136,0.06), rgba(6,182,212,0.04))",
                  border: "1px solid rgba(13,148,136,0.15)",
                  padding: "16px 20px",
                }}
              >
                <p
                  className="font-display font-bold"
                  style={{
                    fontSize: 14,
                    color: "#0d9488",
                    letterSpacing: "-0.01em",
                  }}
                >
                  ✦ {analysis.connectionCount} connection
                  {analysis.connectionCount === 1 ? "" : "s"} surfaced
                </p>
                <p className="mt-1 text-[13px] text-ink-600">
                  Incipit found{" "}
                  {analysis.connectionCount === 1 ? "an overlap" : "overlaps"}{" "}
                  with documents already in your archive. Open the document to
                  review them.
                </p>
              </div>
            )}
            {analysis.noteMatchCount > 0 && (
              <div
                className="rounded-card-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(6,182,212,0.05))",
                  border: "1px solid rgba(13,148,136,0.25)",
                  padding: "16px 20px",
                }}
              >
                <p
                  className="font-display font-bold"
                  style={{ fontSize: 14, color: "#0d9488" }}
                >
                  A research hunch paid off
                </p>
                <p className="mt-1 text-[13px] text-ink-600">
                  This document matches {analysis.noteMatchCount} research note
                  {analysis.noteMatchCount === 1 ? "" : "s"} you left on an
                  earlier upload.
                </p>
              </div>
            )}
            {!analysis.fitsResearchProfile && analysis.outsideExplanation && (
              <div
                className="rounded-card-lg"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(217,119,6,0.06), rgba(217,119,6,0.03))",
                  border: "1px solid rgba(217,119,6,0.15)",
                  padding: "16px 20px",
                }}
              >
                <p
                  className="font-display font-bold"
                  style={{ fontSize: 14, color: "#92400e" }}
                >
                  Outside current research scope
                </p>
                <p className="mt-1 text-[13px] text-ink-600">
                  {analysis.outsideExplanation} Saved to a side collection for
                  later.
                </p>
              </div>
            )}
            {analysis.connectionCount === 0 &&
              analysis.noteMatchCount === 0 &&
              analysis.fitsResearchProfile && (
                <p className="text-[13px] text-ink-500">
                  No overlapping connections yet — as your archive grows, Incipit
                  will start surfacing them here.
                </p>
              )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => resetForNext(batchMode)}>
            Upload another
          </button>
          <button
            className="btn-secondary"
            onClick={() => router.push(`/archive`)}
          >
            Go to archive
          </button>
          {savedDocId && (
            <button
              className="btn-ghost"
              onClick={() => router.push(`/document/${savedDocId}`)}
            >
              View this document
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="card animate-fade-up" style={{ padding: "28px 32px" }}>
        <span
          className="pill-flagged"
          style={{ marginBottom: 12, display: "inline-flex" }}
        >
          Something went wrong
        </span>
        <p className="mt-3 text-[14px] text-ink-700">{error}</p>
        <button className="btn-secondary mt-6" onClick={() => resetForNext(batchMode)}>
          Start over
        </button>
      </div>
    );
  }

  // review stage — extraction + provenance together, nothing required
  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {extraction?.is_outside_research && (
        <div
          className="rounded-card-lg"
          style={{
            background: "linear-gradient(135deg, rgba(217,119,6,0.06), rgba(217,119,6,0.03))",
            border: "1px solid rgba(217,119,6,0.15)",
            padding: "20px 24px",
          }}
        >
          <p
            className="font-display font-bold"
            style={{ fontSize: 15, color: "#92400e", letterSpacing: "-0.02em" }}
          >
            This may not fit your current research.
          </p>
          <p className="mt-2 text-[14px] text-ink-600" style={{ lineHeight: 1.6 }}>
            {extraction.outside_research_reason ||
              "Incipit thinks this document is outside your stated research context."}{" "}
            You can still save it to a separate collection.
          </p>
        </div>
      )}

      {/* Preview + summary, AI-analysis style */}
      <div
        className="rounded-card-lg"
        style={{
          background:
            "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))",
          border: "1px solid rgba(13,148,136,0.08)",
          padding: "24px 28px",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center text-white"
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: "linear-gradient(135deg, #0d9488, #06b6d4)",
              fontSize: 12,
            }}
            aria-hidden
          >
            ✦
          </span>
          <span
            className="font-semibold"
            style={{ fontSize: 12, color: "#0d9488", letterSpacing: "0.02em" }}
          >
            AI Analysis
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-[160px_1fr]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Document preview"
              className="w-full rounded-lg object-cover"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-lg text-[12px] text-ink-400"
              style={{
                aspectRatio: "0.72",
                background: "linear-gradient(180deg, #f5f0e4, #ece3d0)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              {file?.name ?? "Preview unavailable"}
            </div>
          )}
          <div>
            <p
              style={{
                fontSize: 15.5,
                lineHeight: 1.8,
                color: "#3f3f46",
              }}
            >
              {extraction?.summary ?? "Review everything Opus 4.7 read below. Edit anything wrong — your edits become the verified version."}
            </p>
            {file?.name && (
              <p className="mt-3 font-mono text-[11px] text-ink-400" style={{ wordBreak: "break-all" }}>
                {file.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Editable extracted fields */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <span className="section-label">Extracted metadata</span>
            <p className="mt-1 text-[13px] text-ink-500">
              Opus 4.7 read this from the image. Edit anything that&apos;s wrong.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {fields &&
            (Object.keys(FIELD_LABELS) as Array<keyof EditableFields>).map((key) => (
              <FieldEditor
                key={key}
                label={FIELD_LABELS[key]}
                value={fields[key].value ?? ""}
                confidence={fields[key].confidence}
                multiline={key === "extracted_text"}
                mono={key === "publication_date" || key === "extracted_text"}
                edited={editedFields.has(key)}
                onChange={(v) => updateField(key, v)}
              />
            ))}
        </div>
      </section>

      {extraction && extraction.entities.length > 0 && (
        <div className="card" style={{ padding: "20px 24px" }}>
          <span className="section-label">Entities detected</span>
          <div className="mt-4 flex flex-wrap gap-2">
            {extraction.entities.map((e, i) => {
              const kind = (e.entity_type as EntityKind) ?? "other";
              return (
                <span
                  key={i}
                  className={entityClass(kind)}
                  title={e.context_snippet}
                >
                  {e.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <ProvenanceBlock
        provenance={provenance}
        confidence={provenanceConf}
        onChange={updateProvenance}
        batchMode={batchMode}
        onBatchChange={setBatchMode}
      />

      <div className="card" style={{ padding: "20px 24px" }}>
        <span className="section-label">Research note</span>
        <p className="mt-1 text-[12px] text-ink-500">
          Your hunches, context, suspected connections. Notes are checked against every future upload.
        </p>
        <textarea
          className="input-field mt-3"
          style={{ minHeight: 80 }}
          value={researchNote}
          onChange={(e) => setResearchNote(e.target.value)}
          placeholder="e.g. I think this connects to something at the UN archives about Tacna-Arica."
        />
        <label className="mt-3 flex items-center gap-2 text-[12px] text-ink-500">
          <input
            type="checkbox"
            checked={noteIsStanding}
            onChange={(e) => setNoteIsStanding(e.target.checked)}
          />
          Use this as a standing query against future uploads
        </label>
      </div>

      {saveToSideCollection && (
        <div className="card" style={{ padding: "20px 24px" }}>
          <span className="section-label">Side collection name</span>
          <input
            className="input-field mt-3"
            value={sideCollectionName}
            onChange={(e) => setSideCollectionName(e.target.value)}
            placeholder="e.g. Labour movements (future thread)"
          />
          <label className="mt-3 flex items-center gap-2 text-[12px] text-ink-500">
            <input
              type="checkbox"
              checked={!saveToSideCollection}
              onChange={() => setSaveToSideCollection(false)}
            />
            Actually, include this in my current research
          </label>
        </div>
      )}

      {!saveToSideCollection && extraction?.is_outside_research && (
        <button
          className="btn-ghost"
          onClick={() => setSaveToSideCollection(true)}
        >
          Move this to a side collection instead
        </button>
      )}

      {error && (
        <p className="text-[13px]" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      <div
        className="flex items-center justify-end gap-3 pt-6"
        style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
      >
        <button
          className="btn-secondary"
          onClick={() => resetForNext(batchMode)}
          disabled={stage === "saving"}
        >
          Discard
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!canSave || stage === "saving"}
        >
          {stage === "saving" ? "Saving…" : "Confirm and save"}
        </button>
      </div>
    </div>
  );
}

function FieldEditor({
  label,
  value,
  confidence,
  multiline,
  mono,
  edited,
  onChange,
}: {
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  multiline?: boolean;
  mono?: boolean;
  edited: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="card" style={{ padding: "16px 20px" }}>
      <div className="flex items-center justify-between gap-3">
        <label
          className="font-medium text-ink-700"
          style={{ fontSize: 13 }}
        >
          {label}
        </label>
        <div className="flex items-center gap-2">
          {edited && (
            <span
              className="confidence-badge"
              style={{ color: "#059669", background: "#ecfdf5" }}
            >
              Edited
            </span>
          )}
          <ConfidenceBadge level={confidence} />
        </div>
      </div>
      {multiline ? (
        <textarea
          className={`input-field mt-3 ${mono ? "font-mono" : ""}`}
          style={{ minHeight: 180, fontSize: mono ? 12.5 : 14 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={`input-field mt-3 ${mono ? "font-mono" : ""}`}
          style={{ fontSize: mono ? 13 : 14 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ProvenanceBlock({
  provenance,
  confidence,
  onChange,
  batchMode,
  onBatchChange,
}: {
  provenance: ProvenanceState;
  confidence: ProvenanceConfidence;
  onChange: <K extends keyof ProvenanceState>(key: K, value: string) => void;
  batchMode: boolean;
  onBatchChange: (v: boolean) => void;
}) {
  const anyAiInferred = Object.values(confidence).some(
    (c) => c && c !== "unable",
  );
  return (
    <section className="card" style={{ padding: "24px 28px" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="section-label">Provenance (optional)</span>
          <p className="mt-2 text-[12px] text-ink-500" style={{ lineHeight: 1.55 }}>
            Where you got this. Opus pre-fills anything it can read on the scan itself — archive stamps, catalog numbers, microfilm IDs. Everything is optional; skip or edit freely.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-[12px] text-ink-500">
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(e) => onBatchChange(e.target.checked)}
          />
          Reuse for next uploads
        </label>
      </div>

      {anyAiInferred && (
        <p
          className="mt-3 text-[12px]"
          style={{ color: "#0d9488" }}
        >
          Fields marked <span className="font-semibold">AI suggested</span> were read from visible marks on the scan. Edit or clear them as needed.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProvenanceField
          label="Archive name"
          placeholder="e.g. United Nations Archives"
          value={provenance.archive_name}
          confidence={confidence.archive_name}
          onChange={(v) => onChange("archive_name", v)}
        />
        <ProvenanceField
          label="Location"
          placeholder="e.g. New York, USA"
          value={provenance.archive_location}
          confidence={confidence.archive_location}
          onChange={(v) => onChange("archive_location", v)}
        />
        <ProvenanceField
          label="How obtained"
          placeholder="physical scan, photograph, microfilm…"
          value={provenance.acquisition_method}
          confidence={confidence.acquisition_method}
          onChange={(v) => onChange("acquisition_method", v)}
        />
        <div>
          <p className="field-label">Date found</p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="2026-04-21, April 2026, or 2026"
            className="input-field mt-2 font-mono"
            style={{ fontSize: 13 }}
            value={provenance.discovery_date}
            onChange={(e) => onChange("discovery_date", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <ProvenanceField
            label="Catalog reference"
            placeholder="e.g. S-1301-0000-2317"
            value={provenance.catalog_reference}
            confidence={confidence.catalog_reference}
            onChange={(v) => onChange("catalog_reference", v)}
            mono
          />
        </div>
      </div>
    </section>
  );
}

function ProvenanceField({
  label,
  value,
  placeholder,
  confidence,
  mono,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  confidence: ConfidenceLevel | null;
  mono?: boolean;
  onChange: (v: string) => void;
}) {
  const aiSuggested = !!value && confidence && confidence !== "unable";
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="field-label">{label}</p>
        {aiSuggested && (
          <span
            className="confidence-badge"
            style={{
              color: "#0d9488",
              background: "linear-gradient(135deg, rgba(13,148,136,0.08), rgba(6,182,212,0.06))",
              border: "1px solid rgba(13,148,136,0.15)",
            }}
            title="Opus 4.7 read this from the scan"
          >
            AI · {confidence}
          </span>
        )}
      </div>
      <input
        className={`input-field mt-2 ${mono ? "font-mono" : ""}`}
        style={{ fontSize: mono ? 13 : 14 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-8 w-8 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: "#0d9488" }}
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return btoa(binary);
}
