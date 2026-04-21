"use client";

import Link from "next/link";
import { useState } from "react";
import type { DocumentRow } from "@/lib/types";

export function SearchClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
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
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          className="input-field"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='e.g. "everything mentioning Vasconcelos"'
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-accent-700">{error}</p>}

      <ul className="mt-6 space-y-3">
        {results.map((doc) => (
          <li key={doc.id}>
            <Link
              href={`/document/${doc.id}`}
              className="card block p-5 transition hover:shadow-card-hover"
            >
              <p className="font-serif text-lg">
                {doc.title_subject || doc.publication_name || doc.original_filename}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                {[doc.publication_name, doc.publication_date, doc.author]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {doc.extracted_text && (
                <p className="mt-2 line-clamp-3 text-sm text-ink-600">
                  {doc.extracted_text.slice(0, 280)}
                  {doc.extracted_text.length > 280 ? "…" : ""}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {!loading && results.length === 0 && q && !error && (
        <p className="mt-6 text-sm text-ink-500">No matches yet.</p>
      )}
    </div>
  );
}
