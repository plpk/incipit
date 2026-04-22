"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResearchProfile } from "@/lib/types";
import { ConfirmDialog } from "@/app/(app)/document/[id]/DeleteDocumentButton";

type EditableFields = {
  research_description: string;
  topic: string;
  time_period: string;
  countries: string;
  goal_type: string;
  audience: string;
  ai_summary: string;
};

function toEditable(p: ResearchProfile): EditableFields {
  return {
    research_description: p.research_description ?? "",
    topic: p.topic ?? "",
    time_period: p.time_period ?? "",
    countries: (p.countries ?? []).join(", "),
    goal_type: p.goal_type ?? "",
    audience: p.audience ?? "",
    ai_summary: p.ai_summary ?? "",
  };
}

export function ProfileManager({ profile }: { profile: ResearchProfile }) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [current, setCurrent] = useState<ResearchProfile>(profile);
  const [draft, setDraft] = useState<EditableFields>(toEditable(profile));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function startEdit() {
    setDraft(toEditable(current));
    setSaveError(null);
    setMode("edit");
  }

  function cancelEdit() {
    if (saving) return;
    setSaveError(null);
    setMode("view");
  }

  async function saveEdit() {
    setSaving(true);
    setSaveError(null);
    try {
      const trimmedDesc = draft.research_description.trim();
      if (trimmedDesc.length < 10) {
        throw new Error("Description needs at least 10 characters.");
      }
      const payload = {
        research_description: trimmedDesc,
        topic: draft.topic.trim() || null,
        time_period: draft.time_period.trim() || null,
        countries: draft.countries
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        goal_type: draft.goal_type.trim() || null,
        audience: draft.audience.trim() || null,
        ai_summary: draft.ai_summary.trim() || null,
      };
      const res = await fetch("/api/research-profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Save failed (${res.status})`);
      }
      const body = await res.json();
      setCurrent(body.profile as ResearchProfile);
      setMode("view");
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/research-profile", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Delete failed (${res.status})`);
      }
      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="font-display font-extrabold text-ink-900"
            style={{
              fontSize: 36,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Research profile
          </h1>
          <p
            className="mt-3 text-ink-500"
            style={{ fontSize: 15, lineHeight: 1.6 }}
          >
            How Incipit understands what you&apos;re working on. This context
            informs every extraction.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-2">
          {mode === "view" ? (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={startEdit}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-semibold transition"
                style={{
                  color: "#a1a1aa",
                  border: "1px solid rgba(220,38,38,0.15)",
                  background: "rgba(220,38,38,0.02)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#dc2626";
                  e.currentTarget.style.background = "rgba(220,38,38,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#a1a1aa";
                  e.currentTarget.style.background = "rgba(220,38,38,0.02)";
                }}
              >
                Delete profile
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-6">
        {mode === "view" ? (
          <ViewCards profile={current} />
        ) : (
          <EditCards
            draft={draft}
            setDraft={setDraft}
            saveError={saveError}
          />
        )}
      </div>

      {deleteOpen && (
        <ConfirmDialog
          title="Delete your research profile?"
          body="Your uploaded documents will stay in the archive but become unassociated. You can create a new profile anytime."
          confirmLabel={deleting ? "Deleting…" : "Delete profile"}
          cancelLabel="Cancel"
          disabled={deleting}
          error={deleteError}
          onCancel={() => {
            if (deleting) return;
            setDeleteOpen(false);
            setDeleteError(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

function ViewCards({ profile }: { profile: ResearchProfile }) {
  return (
    <>
      <div className="card" style={{ padding: "24px 28px" }}>
        <span className="section-label">Your description</span>
        <p
          className="mt-3 whitespace-pre-wrap text-ink-900"
          style={{ fontSize: 15, lineHeight: 1.7 }}
        >
          {profile.research_description}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field label="Topic" value={profile.topic} />
          <Field label="Time period" value={profile.time_period} />
          <Field
            label="Countries"
            value={(profile.countries ?? []).join(", ")}
          />
          <Field label="Goal" value={profile.goal_type} />
          <Field label="Audience" value={profile.audience} />
        </div>
      </div>

      {profile.ai_summary && (
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
              style={{
                fontSize: 12,
                color: "#0d9488",
                letterSpacing: "0.02em",
              }}
            >
              AI summary
            </span>
          </div>
          <p
            className="mt-4"
            style={{
              fontSize: 15.5,
              lineHeight: 1.8,
              color: "#3f3f46",
            }}
          >
            {profile.ai_summary}
          </p>
        </div>
      )}

      {profile.ai_questions?.length > 0 && (
        <div className="card" style={{ padding: "24px 28px" }}>
          <span className="section-label">Follow-up answers</span>
          <ul className="mt-4 flex flex-col gap-4">
            {profile.ai_questions.map((qa, i) => (
              <li
                key={i}
                style={{
                  borderLeft: "2px solid rgba(13,148,136,0.2)",
                  paddingLeft: 16,
                }}
              >
                <p
                  className="font-medium text-ink-700"
                  style={{ fontSize: 13.5 }}
                >
                  {qa.question}
                </p>
                <p
                  className="mt-1.5 text-ink-600"
                  style={{ fontSize: 14, lineHeight: 1.6 }}
                >
                  {qa.answer ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function EditCards({
  draft,
  setDraft,
  saveError,
}: {
  draft: EditableFields;
  setDraft: (next: EditableFields) => void;
  saveError: string | null;
}) {
  function set<K extends keyof EditableFields>(key: K, value: string) {
    setDraft({ ...draft, [key]: value });
  }

  return (
    <>
      <div className="card" style={{ padding: "24px 28px" }}>
        <span className="section-label">Your description</span>
        <textarea
          className="input-field mt-3"
          rows={6}
          value={draft.research_description}
          onChange={(e) => set("research_description", e.target.value)}
          placeholder="In plain language, what are you researching?"
        />

        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <EditField
            label="Topic"
            value={draft.topic}
            onChange={(v) => set("topic", v)}
          />
          <EditField
            label="Time period"
            value={draft.time_period}
            onChange={(v) => set("time_period", v)}
          />
          <EditField
            label="Countries"
            value={draft.countries}
            onChange={(v) => set("countries", v)}
            hint="Comma-separated"
          />
          <EditField
            label="Goal"
            value={draft.goal_type}
            onChange={(v) => set("goal_type", v)}
            hint="dissertation, book, course, article, other"
          />
          <EditField
            label="Audience"
            value={draft.audience}
            onChange={(v) => set("audience", v)}
          />
        </div>
      </div>

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
            AI summary
          </span>
        </div>
        <textarea
          className="input-field mt-4"
          rows={4}
          value={draft.ai_summary}
          onChange={(e) => set("ai_summary", e.target.value)}
          placeholder="Incipit generated this from your onboarding answers. Edit freely."
        />
      </div>

      {saveError && (
        <p className="text-[13px]" style={{ color: "#dc2626" }}>
          {saveError}
        </p>
      )}
    </>
  );
}

function EditField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field mt-1.5"
      />
      {hint && (
        <p className="mt-1 text-[11px] text-ink-400">{hint}</p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p
        className="mt-1.5"
        style={{
          fontSize: 14,
          color: value ? "#1a1a2e" : "#d4d4d8",
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
