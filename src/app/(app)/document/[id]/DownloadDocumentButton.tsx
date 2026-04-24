"use client";

import { useState } from "react";

export function DownloadDocumentButton({ documentId }: { documentId: string }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/download`);
      if (!res.ok) {
        // Only attempt JSON parsing when the server actually said it was
        // JSON — keeps us clear of the WebKit DOMException on HTML error
        // pages.
        let message = `Download failed (${res.status})`;
        const ct = res.headers.get("content-type") ?? "";
        if (ct.toLowerCase().includes("application/json")) {
          try {
            const body = (await res.json()) as { error?: string };
            if (body?.error) message = body.error;
          } catch {
            /* fall back to status-based message */
          }
        }
        throw new Error(message);
      }
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(cd);
      const filename = match?.[1] ?? "document.zip";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      {error && (
        <span
          className="text-[12px]"
          role="alert"
          style={{ color: "#dc2626" }}
        >
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={downloading}
        aria-label="Download document archive"
        title="Download (ZIP with renamed scan + metadata)"
        className="inline-flex items-center justify-center rounded-btn text-ink-400 transition hover:bg-[rgba(13,148,136,0.08)] hover:text-brand disabled:cursor-wait disabled:opacity-60"
        style={{ width: 34, height: 34 }}
      >
        {downloading ? <SpinnerIcon /> : <DownloadIcon />}
      </button>
    </>
  );
}

function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SpinnerIcon() {
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
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
