"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthClient } from "@/lib/supabase/ssr-browser";

const CONFIRM_PHRASE = "DELETE";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-card-lg"
      style={{
        border: "1px solid rgba(220,38,38,0.18)",
        background: "rgba(220,38,38,0.02)",
        padding: "24px 28px",
      }}
    >
      <h2
        className="font-display font-bold"
        style={{ fontSize: 18, letterSpacing: "-0.02em", color: "#dc2626" }}
      >
        Delete account
      </h2>
      <p
        className="mt-3 text-ink-600"
        style={{ fontSize: 14, lineHeight: 1.65 }}
      >
        Permanently delete your Incipit account, every document you&apos;ve
        uploaded, your research context, notes, connections, and all files in
        storage. This cannot be undone.
      </p>
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-btn px-4 py-2.5 text-sm font-semibold text-white transition"
          style={{
            background: "#dc2626",
            boxShadow: "0 2px 10px rgba(220,38,38,0.25)",
          }}
        >
          Delete account
        </button>
      </div>

      {open && (
        <DeleteAccountDialog
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed = typed === CONFIRM_PHRASE;

  async function handleConfirm() {
    if (!confirmed || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || !body.success) {
        throw new Error(body.error ?? `Delete failed (${res.status})`);
      }

      // Sign out the browser session BEFORE navigating. If we redirect
      // first, the session cookie can linger on the client until the
      // next request.
      try {
        await getAuthClient().auth.signOut();
      } catch (signOutErr) {
        console.error("[account.delete] client signOut failed", signOutErr);
      }

      // Hard nav — the service role key already deleted the auth user,
      // so any cached server state must be dropped.
      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again or contact support.",
      );
      setDeleting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(26,26,46,0.35)", backdropFilter: "blur(2px)" }}
      onClick={() => {
        if (!deleting) onClose();
      }}
    >
      <div
        className="card-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "28px 32px",
          maxWidth: 480,
          width: "calc(100% - 32px)",
          background: "#fff",
        }}
      >
        <h2
          id="delete-account-title"
          className="font-display font-extrabold text-ink-900"
          style={{ fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.2 }}
        >
          Delete your account?
        </h2>
        <p
          className="mt-3 text-ink-600"
          style={{ fontSize: 14, lineHeight: 1.65 }}
        >
          This will permanently delete your account, all uploaded documents,
          research context, notes, connections, and every file you&apos;ve
          uploaded. This cannot be undone.
        </p>

        <label
          className="mt-5 block"
          style={{ fontSize: 13, color: "#3f3f46" }}
        >
          Type <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span>
          {" "}to confirm
        </label>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          disabled={deleting}
          className="input-field mt-2"
          style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {error && (
          <p className="mt-3 text-[13px]" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!confirmed || deleting}
            className="inline-flex items-center justify-center rounded-btn px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "#dc2626",
              boxShadow: "0 2px 10px rgba(220,38,38,0.25)",
            }}
          >
            {deleting ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </div>
    </div>
  );
}
