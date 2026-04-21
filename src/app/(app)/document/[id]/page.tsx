import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocument } from "@/lib/queries";
import { chicagoCitation } from "@/lib/citation";
import { ConfidenceBadge, TrustTierBadge } from "@/components/ConfidenceBadge";
import { CitationCopy } from "./CitationCopy";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const doc = await getDocument(params.id);
  if (!doc) notFound();

  const citation = chicagoCitation(doc);

  return (
    <div>
      <Link href="/archive" className="text-sm text-ink-500 hover:text-ink-900">
        ← Back to archive
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink-900">
            {doc.title_subject || doc.publication_name || doc.original_filename}
          </h1>
          <p className="mt-2 text-ink-500">
            {[doc.publication_name, doc.publication_date, doc.author]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <TrustTierBadge tier={doc.trust_tier} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-lg font-semibold">Metadata</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <MetaField label="Publication" value={doc.publication_name} confidence={doc.confidence_scores?.publication_name} />
              <MetaField label="Date" value={doc.publication_date} confidence={doc.confidence_scores?.publication_date} />
              <MetaField label="Title / subject" value={doc.title_subject} confidence={doc.confidence_scores?.title_subject} />
              <MetaField label="Author" value={doc.author} confidence={doc.confidence_scores?.author} />
              <MetaField label="Language" value={doc.language} confidence={doc.confidence_scores?.language} />
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="font-serif text-lg font-semibold">Provenance</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <MetaField label="Archive" value={doc.archive_name} />
              <MetaField label="Location" value={doc.archive_location} />
              <MetaField label="How obtained" value={doc.acquisition_method} />
              <MetaField label="Date found" value={doc.discovery_date} />
              <MetaField label="Catalog reference" value={doc.catalog_reference} />
              <MetaField label="Original filename" value={doc.original_filename} />
            </dl>
          </div>

          {doc.extracted_text && (
            <div className="card p-6">
              <h2 className="font-serif text-lg font-semibold">Extracted text</h2>
              <pre className="mt-4 max-h-[400px] overflow-auto whitespace-pre-wrap font-mono text-xs text-ink-700">
                {doc.extracted_text}
              </pre>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          {doc.file_url && (
            <div className="card overflow-hidden">
              {doc.file_type?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.file_url}
                  alt={doc.original_filename}
                  className="w-full object-cover"
                />
              ) : (
                <div className="p-6">
                  <p className="text-sm text-ink-500">
                    {doc.original_filename}
                  </p>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary mt-3 inline-flex"
                  >
                    Open file
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="card p-6">
            <h3 className="font-serif text-lg font-semibold">Citation</h3>
            <p className="mt-3 text-sm text-ink-700">{citation}</p>
            <CitationCopy text={citation} />
          </div>

          {doc.generated_filename && doc.generated_filename !== doc.original_filename && (
            <div className="card p-6 text-sm">
              <p className="label">Generated filename</p>
              <p className="mt-2 font-mono text-xs">{doc.generated_filename}</p>
              <p className="mt-2 text-xs text-ink-500">
                Original kept: {doc.original_filename}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function MetaField({
  label,
  value,
  confidence,
}: {
  label: string;
  value: string | null;
  confidence?: "high" | "medium" | "low" | "unable";
}) {
  return (
    <div>
      <dt className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-ink-400">
        <span>{label}</span>
        {confidence && <ConfidenceBadge level={confidence} />}
      </dt>
      <dd className="mt-1 text-ink-800">{value || "—"}</dd>
    </div>
  );
}
