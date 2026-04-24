import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getDocumentForUser,
  getDocumentEntitiesForUser,
  getDocumentConnectionsForUser,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/auth";
import { chicagoCitation } from "@/lib/citation";
import { TrustTierBadge } from "@/components/ConfidenceBadge";
import { PageShell } from "@/components/PageShell";
import { SetCurrentDocument } from "@/components/CurrentDocumentProvider";
import { DocumentTabs } from "./DocumentTabs";
import { DeleteDocumentButton } from "./DeleteDocumentButton";
import { DownloadDocumentButton } from "./DownloadDocumentButton";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  const doc = await getDocumentForUser(user.id, params.id);
  if (!doc) notFound();

  const [entities, connections] = await Promise.all([
    getDocumentEntitiesForUser(user.id, params.id),
    getDocumentConnectionsForUser(user.id, params.id),
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
              <DownloadDocumentButton documentId={doc.id} />
              <DeleteDocumentButton
                documentId={doc.id}
                documentTitle={
                  doc.title_subject ||
                  doc.publication_name ||
                  doc.original_filename
                }
              />
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

        {doc.is_outside_research && doc.outside_research_reason && (
          <div
            className="mt-8 rounded-card-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(217,119,6,0.06), rgba(217,119,6,0.03))",
              border: "1px solid rgba(217,119,6,0.15)",
              padding: "20px 24px",
            }}
          >
            <p
              className="font-display font-bold"
              style={{ fontSize: 15, color: "#92400e", letterSpacing: "-0.02em" }}
            >
              Outside your current research scope
            </p>
            <p
              className="mt-2 text-[14px] text-ink-600"
              style={{ lineHeight: 1.6 }}
            >
              {doc.outside_research_reason}
            </p>
            {doc.side_collection_name && (
              <p className="mt-2 text-[12px] text-ink-500">
                Saved to side collection:{" "}
                <span className="font-semibold">{doc.side_collection_name}</span>
              </p>
            )}
          </div>
        )}

        {connections.some((c) => c.matched_note_id) && (
          <div
            className="mt-8 rounded-card-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,148,136,0.06), rgba(6,182,212,0.04))",
              border: "1px solid rgba(13,148,136,0.15)",
              padding: "20px 24px",
            }}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden style={{ color: "#0d9488" }}>
                ✦
              </span>
              <p
                className="font-display font-bold"
                style={{
                  fontSize: 15,
                  color: "#0d9488",
                  letterSpacing: "-0.02em",
                }}
              >
                A research hunch paid off
              </p>
            </div>
            <p
              className="mt-2 text-[14px] text-ink-600"
              style={{ lineHeight: 1.65 }}
            >
              This document matches{" "}
              {connections.filter((c) => c.matched_note_id).length === 1
                ? "a note"
                : "notes"}{" "}
              you left on earlier uploads. See the Connections tab for detail.
            </p>
          </div>
        )}

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
