import Link from "next/link";
import { listDocuments } from "@/lib/queries";
import { TrustTierBadge } from "@/components/ConfidenceBadge";
import { PageShell } from "@/components/PageShell";
import { DeleteAllButton } from "./DeleteAllButton";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const docs = await listDocuments(200);
  const primary = docs.filter((d) => !d.is_outside_research);
  const sidelined = docs.filter((d) => d.is_outside_research);

  return (
    <PageShell>
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1
            className="font-display font-extrabold text-ink-900"
            style={{
              fontSize: 36,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            Archive
          </h1>
          <p
            className="mt-3 text-ink-500"
            style={{ fontSize: 15, lineHeight: 1.6 }}
          >
            Every document you&apos;ve ingested, newest first.
          </p>
        </div>
        <div className="shrink-0 pt-2">
          <DeleteAllButton count={docs.length} />
        </div>
      </header>

      <DocSection title="Current research" docs={primary} />
      {sidelined.length > 0 && (
        <DocSection title="Side collections" docs={sidelined} />
      )}
    </PageShell>
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
      <section className="mt-12">
        <span className="section-label">{title}</span>
        <div
          className="card mt-4 flex flex-col items-center gap-3 text-center"
          style={{ padding: "48px 24px" }}
        >
          <p className="text-[14px] text-ink-500">
            No documents yet.
          </p>
          <Link href="/upload" className="btn-primary">
            Upload one
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="mt-12">
      <span className="section-label">{title}</span>
      <ul className="mt-4 flex flex-col gap-3">
        {docs.map((doc) => (
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
                    {!doc.publication_name &&
                      !doc.publication_date &&
                      !doc.author && (
                        <span className="text-ink-400">No metadata yet</span>
                      )}
                  </p>
                  {doc.archive_name && (
                    <p
                      className="mt-1.5 text-[12px] text-ink-400"
                      style={{ letterSpacing: "-0.005em" }}
                    >
                      {doc.archive_name}
                      {doc.archive_location ? `, ${doc.archive_location}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <TrustTierBadge tier={doc.trust_tier} />
                  <span
                    className="font-mono text-ink-400"
                    style={{ fontSize: 11 }}
                  >
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
