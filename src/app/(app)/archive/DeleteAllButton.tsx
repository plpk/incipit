"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/app/(app)/document/[id]/DeleteDocumentButton";

export function DeleteAllButton({ count }: { count: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Delete failed (${res.status})`);
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={count === 0}
        className="inline-flex items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          color: "#a1a1aa",
          border: "1px solid rgba(220,38,38,0.15)",
          background: "rgba(220,38,38,0.02)",
        }}
        onMouseEnter={(e) => {
          if (count === 0) return;
          e.currentTarget.style.color = "#dc2626";
          e.currentTarget.style.background = "rgba(220,38,38,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#a1a1aa";
          e.currentTarget.style.background = "rgba(220,38,38,0.02)";
        }}
      >
        <TrashIcon />
        <span>Clear archive</span>
      </button>
      {open && (
        <ConfirmDialog
          title="Delete all documents in your archive?"
          body="Every document, along with its entities, connections, research notes, and stored files, will be removed. This cannot be undone."
          confirmLabel={deleting ? "Clearing…" : "Delete all"}
          cancelLabel="Cancel"
          disabled={deleting}
          error={error}
          onCancel={() => {
            if (deleting) return;
            setOpen(false);
            setError(null);
          }}
          onConfirm={onConfirm}
          subject={`${count} document${count === 1 ? "" : "s"}`}
        />
      )}
    </>
  );
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
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
    </svg>
  );
}
