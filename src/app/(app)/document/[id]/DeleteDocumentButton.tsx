"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteDocumentButton({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Delete failed (${res.status})`);
      }
      router.push("/archive");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Delete document"
        title="Delete document"
        className="inline-flex items-center justify-center rounded-btn text-ink-400 transition hover:bg-[rgba(220,38,38,0.08)] hover:text-[#dc2626]"
        style={{ width: 34, height: 34 }}
      >
        <TrashIcon />
      </button>

      {open && (
        <ConfirmDialog
          title="Delete this document?"
          body="This will also remove its connections and extracted entities. This cannot be undone."
          confirmLabel={deleting ? "Deleting…" : "Delete"}
          cancelLabel="Cancel"
          disabled={deleting}
          error={error}
          onCancel={() => {
            if (deleting) return;
            setOpen(false);
            setError(null);
          }}
          onConfirm={onConfirm}
          subject={documentTitle}
        />
      )}
    </>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function ConfirmDialog({
  title,
  body,
  subject,
  confirmLabel,
  cancelLabel,
  disabled,
  error,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  subject?: string;
  confirmLabel: string;
  cancelLabel: string;
  disabled?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(26,26,46,0.35)", backdropFilter: "blur(2px)" }}
      onClick={onCancel}
    >
      <div
        className="card-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "28px 32px",
          maxWidth: 440,
          width: "calc(100% - 32px)",
          background: "#fff",
        }}
      >
        <h2
          className="font-display font-extrabold text-ink-900"
          style={{ fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.2 }}
        >
          {title}
        </h2>
        {subject && (
          <p
            className="mt-2 truncate text-[13px] text-ink-500"
            title={subject}
          >
            {subject}
          </p>
        )}
        <p
          className="mt-3 text-ink-600"
          style={{ fontSize: 14, lineHeight: 1.6 }}
        >
          {body}
        </p>
        {error && (
          <p
            className="mt-3 text-[13px]"
            style={{ color: "#dc2626" }}
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={disabled}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-btn px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "#dc2626",
              boxShadow: "0 2px 10px rgba(220,38,38,0.25)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
