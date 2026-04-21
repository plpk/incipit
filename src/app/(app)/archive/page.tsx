import Link from "next/link";
import { listDocuments } from "@/lib/queries";
import { TrustTierBadge } from "@/components/ConfidenceBadge";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const docs = await listDocuments(200);
  const primary = docs.filter((d) => !d.is_outside_research);
  const sidelined = docs.filter((d) => d.is_outside_research);

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink-900">Archive</h1>
      <p className="mt-2 text-ink-500">
        Every document you&apos;ve ingested, newest first.
      </p>

      <DocSection title="Current research" docs={primary} />
      {sidelined.length > 0 && (
        <DocSection title="Side collections" docs={sidelined} />
      )}
    </div>
  );
}

function DocSection({
  title,
  docs,
}: {
  title: string;
  docs: Awaited<ReturnType<typeof listDocuments>>;
}) {
  if (docs.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        <div className="card mt-4 p-8 text-center text-sm text-ink-500">
          No documents yet.{" "}
          <Link href="/upload" className="text-accent-600 underline">
            Upload one
          </Link>
          .
        </div>
      </section>
    );
  }
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {docs.map((doc) => (
          <li key={doc.id}>
            <Link
              href={`/document/${doc.id}`}
              className="card flex items-start justify-between gap-6 p-5 transition hover:shadow-card-hover"
            >
              <div className="min-w-0">
                <p className="truncate font-serif text-lg text-ink-900">
                  {doc.title_subject || doc.publication_name || doc.original_filename}
                </p>
                <p className="mt-1 truncate text-sm text-ink-500">
                  {[doc.publication_name, doc.publication_date, doc.author]
                    .filter(Boolean)
                    .join(" · ") || "No metadata yet"}
                </p>
                {doc.archive_name && (
                  <p className="mt-1 text-xs text-ink-400">
                    {doc.archive_name}
                    {doc.archive_location ? `, ${doc.archive_location}` : ""}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <TrustTierBadge tier={doc.trust_tier} />
                <span className="text-xs text-ink-400">
                  {new Date(doc.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
