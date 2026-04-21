"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import type { ConfidenceLevel, VisionExtraction } from "@/lib/types";

type Stage = "idle" | "uploading" | "extracting" | "review" | "saving" | "done" | "error";

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
  // When the historian checks "apply to the next uploads too", we carry the
  // hand-entered provenance forward to the next upload but discard AI-inferred
  // confidence (the next doc may have different visible stamps).
  const [batchMode, setBatchMode] = useState(false);
  const [researchNote, setResearchNote] = useState("");
  const [noteIsStanding, setNoteIsStanding] = useState(true);
  const [saveToSideCollection, setSaveToSideCollection] = useState(false);
  const [sideCollectionName, setSideCollectionName] = useState("");

  const [savedDocId, setSavedDocId] = useState<string | null>(null);
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

        // Merge AI-inferred provenance hints into whatever the historian
        // carried over from the previous upload (batch mode). Only fill an
        // empty field; never overwrite something the historian already typed.
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
    // Once the historian edits an AI-suggested value, the chip turns from
    // "AI suggested" into plain text — they own it now.
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
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSavedDocId(data.document.id);
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
        className={`card flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-16 text-center transition ${
          isDragActive ? "border-accent-400 bg-accent-50" : "border-parchment-300"
        }`}
      >
        <input {...getInputProps()} />
        <p className="font-serif text-xl">
          {isDragActive ? "Drop the file here…" : "Drop a scan or click to pick a file"}
        </p>
        <p className="text-sm text-ink-500">
          PDF or image. We&apos;ll read the picture directly — OCR text layers are
          ignored.
        </p>
        <p className="mt-2 text-xs text-ink-400">
          You&apos;ll review everything Incipit finds — including any archive
          markings — before anything is saved.
        </p>
      </div>
    );
  }

  if (stage === "uploading" || stage === "extracting") {
    return (
      <div className="card flex flex-col items-center gap-4 p-12 text-center">
        <Spinner />
        <p className="font-serif text-lg">
          {stage === "uploading" ? "Reading your file…" : "Opus 4.7 is reading the image…"}
        </p>
        <p className="text-sm text-ink-500">
          This can take 20–60 seconds for a dense page. Keep this window open.
        </p>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="card flex flex-col items-start gap-4 p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-700">
            Saved
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold">
            Document added to your archive.
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            All fields you touched are marked as verified (T1).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
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
      <div className="card p-8">
        <p className="text-sm font-medium text-accent-700">Something went wrong</p>
        <p className="mt-2 text-sm text-ink-700">{error}</p>
        <button className="btn-secondary mt-6" onClick={() => resetForNext(batchMode)}>
          Start over
        </button>
      </div>
    );
  }

  // review stage — extraction + provenance together, nothing required
  return (
    <div className="space-y-6">
      {extraction?.is_outside_research && (
        <div className="card border border-accent-200 bg-accent-50 p-4 text-sm text-accent-700">
          <p className="font-medium">This may not fit your current research.</p>
          <p className="mt-1">
            {extraction.outside_research_reason ||
              "Incipit thinks this document is outside your stated research context."}{" "}
            You can still save it to a separate collection.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Document preview"
              className="w-full rounded-md border border-parchment-200 object-cover"
            />
          ) : (
            <div className="card flex h-48 items-center justify-center text-sm text-ink-500">
              {file?.name ?? "Preview unavailable"}
            </div>
          )}
          <p className="text-xs text-ink-500">{file?.name}</p>
          {extraction && (
            <div className="card p-4 text-sm text-ink-700">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                Summary
              </p>
              <p className="mt-2">{extraction.summary}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <section>
            <h2 className="font-serif text-lg font-semibold text-ink-900">
              Extracted metadata
            </h2>
            <p className="text-xs text-ink-500">
              Review what Opus 4.7 read from the image. Edit anything that&apos;s
              wrong — your edits become the verified version.
            </p>
          </section>

          {fields &&
            (Object.keys(FIELD_LABELS) as Array<keyof EditableFields>).map((key) => (
              <FieldEditor
                key={key}
                label={FIELD_LABELS[key]}
                value={fields[key].value ?? ""}
                confidence={fields[key].confidence}
                multiline={key === "extracted_text"}
                edited={editedFields.has(key)}
                onChange={(v) => updateField(key, v)}
              />
            ))}

          {extraction && extraction.entities.length > 0 && (
            <div className="card p-4">
              <p className="label">Entities detected</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {extraction.entities.map((e, i) => (
                  <li
                    key={i}
                    className="chip border border-parchment-300 bg-parchment-50 text-ink-700"
                    title={e.context_snippet}
                  >
                    {e.name} · {e.entity_type}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ProvenanceBlock
            provenance={provenance}
            confidence={provenanceConf}
            onChange={updateProvenance}
            batchMode={batchMode}
            onBatchChange={setBatchMode}
          />

          <div className="card p-6">
            <p className="label">Research note</p>
            <p className="mt-1 text-xs text-ink-500">
              Your hunches, context, suspected connections. Notes are checked
              against every future upload.
            </p>
            <textarea
              className="input-field mt-3 min-h-[80px]"
              value={researchNote}
              onChange={(e) => setResearchNote(e.target.value)}
              placeholder="e.g. I think this connects to something at the UN archives about Tacna-Arica."
            />
            <label className="mt-3 flex items-center gap-2 text-xs text-ink-500">
              <input
                type="checkbox"
                checked={noteIsStanding}
                onChange={(e) => setNoteIsStanding(e.target.checked)}
              />
              Use this as a standing query against future uploads
            </label>
          </div>

          {saveToSideCollection && (
            <div className="card p-4">
              <label className="label">Side collection name</label>
              <input
                className="input-field mt-2"
                value={sideCollectionName}
                onChange={(e) => setSideCollectionName(e.target.value)}
                placeholder="e.g. Labour movements (future thread)"
              />
              <label className="mt-3 flex items-center gap-2 text-xs text-ink-500">
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

          {error && <p className="text-sm text-accent-700">{error}</p>}

          <div className="flex items-center justify-end gap-3 border-t border-parchment-200 pt-6">
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
      </div>
    </div>
  );
}

function FieldEditor({
  label,
  value,
  confidence,
  multiline,
  edited,
  onChange,
}: {
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  multiline?: boolean;
  edited: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="label">{label}</label>
        <div className="flex items-center gap-2">
          {edited && (
            <span className="chip border border-emerald-200 bg-emerald-50 text-emerald-800">
              Edited
            </span>
          )}
          <ConfidenceBadge level={confidence} />
        </div>
      </div>
      {multiline ? (
        <textarea
          className="input-field mt-3 min-h-[180px] font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input-field mt-3"
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
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink-900">
            Provenance{" "}
            <span className="text-xs font-normal text-ink-400">(optional)</span>
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Where you got this. Opus pre-fills anything it can read on the scan
            itself — archive stamps, catalog numbers, microfilm IDs. Everything
            is optional; skip or edit freely.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs text-ink-500">
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(e) => onBatchChange(e.target.checked)}
          />
          Reuse for next uploads
        </label>
      </div>

      {anyAiInferred && (
        <p className="mt-3 text-xs text-accent-700">
          Fields marked <span className="font-medium">AI suggested</span> were
          read from visible marks on the scan. Edit or clear them as needed.
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
          <label className="label">Date found</label>
          <input
            type="date"
            className="input-field mt-2"
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
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  confidence: ConfidenceLevel | null;
  onChange: (v: string) => void;
}) {
  const aiSuggested = !!value && confidence && confidence !== "unable";
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className="label">{label}</label>
        {aiSuggested && (
          <span
            className="chip border border-accent-200 bg-accent-50 text-accent-700"
            title="Opus 4.7 read this from the scan"
          >
            AI suggested · {confidence}
          </span>
        )}
      </div>
      <input
        className="input-field mt-2"
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
      className="h-6 w-6 animate-spin text-ink-600"
      viewBox="0 0 24 24"
      fill="none"
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
