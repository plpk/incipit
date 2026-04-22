import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDocument,
  getDocumentEntities,
  getDocumentConnections,
} from "@/lib/queries";
import { chicagoCitation } from "@/lib/citation";
import { TrustTierBadge } from "@/components/ConfidenceBadge";
import { PageShell } from "@/components/PageShell";
import { SetCurrentDocument } from "@/components/CurrentDocumentProvider";
import { DocumentTabs } from "./DocumentTabs";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const doc = await getDocument(params.id);
  if (!doc) notFound();

  const [entities, connections] = await Promise.all([
    getDocumentEntities(params.id),
    getDocumentConnections(params.id),
  ]);

  const citation = chicagoCitation(doc);

  return (
    <>
      <SetCurrentDocument
        id={doc.id}
        file_url={doc.file_url}
        file_type={doc.file_type}
        original_filename={doc.original_filename}
      />
      <PageShell
        topbar={
          <>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-500 transition hover:text-ink-900"
            >
              <span aria-hidden>←</span>
              <span>Back to archive</span>
            </Link>
            <div className="flex items-center gap-2">
              <TrustTierBadge tier={doc.trust_tier} />
              <span className="pill-brand-soft">
                <span aria-hidden>✦</span> Opus 4.7
              </span>
            </div>
          </>
        }
      >
        <header>
          <h1
            className="font-display font-extrabold text-ink-900"
            style={{
              fontSize: 36,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            {doc.title_subject || doc.publication_name || doc.original_filename}
          </h1>
          <p
            className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-500"
            style={{ fontSize: 14.5 }}
          >
            {doc.publication_name && (
              <span style={{ fontWeight: 600, color: "#3f3f46" }}>
                {doc.publication_name}
              </span>
            )}
            {doc.publication_name && doc.publication_date && (
              <span className="text-ink-300">·</span>
            )}
            {doc.publication_date && (
              <span className="font-mono text-ink-500" style={{ fontSize: 13 }}>
                {doc.publication_date}
              </span>
            )}
            {(doc.publication_date || doc.publication_name) && doc.language && (
              <span className="text-ink-300">·</span>
            )}
            {doc.language && <span>{doc.language}</span>}
          </p>
        </header>

        <div className="mt-10">
          <DocumentTabs
            doc={doc}
            entities={entities}
            connections={connections}
            citation={citation}
          />
        </div>
      </PageShell>
    </>
  );
}
