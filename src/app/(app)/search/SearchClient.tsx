"use client";

import Link from "next/link";
import { useState } from "react";
import type { DocumentRow } from "@/lib/types";
import { TrustTierBadge } from "@/components/ConfidenceBadge";

export function SearchClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
            </svg>
          </span>
          <input
            className="input-field"
            style={{ paddingLeft: 44 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='e.g. "everything mentioning Vasconcelos"'
          />
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {error && (
        <p className="mt-4 text-[13px]" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {results.map((doc) => (
          <li key={doc.id}>
            <Link
              href={`/document/${doc.id}`}
              className="card card-interactive block"
              style={{ padding: "18px 24px" }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-display font-bold text-ink-900"
                    style={{ fontSize: 17, letterSpacing: "-0.02em" }}
                  >
                    {doc.title_subject ||
                      doc.publication_name ||
                      doc.original_filename}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-500">
                    {doc.publication_name && <span>{doc.publication_name}</span>}
                    {doc.publication_name && doc.publication_date && (
                      <span className="text-ink-300">·</span>
                    )}
                    {doc.publication_date && (
                      <span className="font-mono" style={{ fontSize: 12 }}>
                        {doc.publication_date}
                      </span>
                    )}
                    {doc.author && (
                      <>
                        <span className="text-ink-300">·</span>
                        <span>{doc.author}</span>
                      </>
                    )}
                  </p>
                  {doc.extracted_text && (
                    <p
                      className="mt-2.5 line-clamp-3 text-[13.5px] text-ink-600"
                      style={{ lineHeight: 1.65 }}
                    >
                      {doc.extracted_text.slice(0, 280)}
                      {doc.extracted_text.length > 280 ? "…" : ""}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0">
                  <TrustTierBadge tier={doc.trust_tier} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {!loading && results.length === 0 && searched && !error && (
        <p className="mt-8 text-[14px] text-ink-500">No matches yet.</p>
      )}
    </div>
  );
}
