"use client";

import { useState, useMemo } from "react";
import type { DocumentRow, ConfidenceLevel } from "@/lib/types";
import type { DocumentEntity, DocumentConnection } from "@/lib/queries";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { entityClass, entityInlineClass, type EntityKind } from "@/lib/design";
import { CitationCopy } from "./CitationCopy";

type Tab = "overview" | "text" | "entities" | "connections";

export function DocumentTabs({
  doc,
  entities,
  connections,
  citation,
}: {
  doc: DocumentRow;
  entities: DocumentEntity[];
  connections: DocumentConnection[];
  citation: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: "overview", label: "Overview" },
    { id: "text", label: "Text" },
    { id: "entities", label: "Entities", count: entities.length },
    { id: "connections", label: "Connections", count: connections.length },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 pb-2">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pill-tab ${active ? "pill-tab-active" : ""}`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  className="inline-flex items-center justify-center rounded-full text-white"
                  style={{
                    background: active
                      ? "rgba(255,255,255,0.25)"
                      : "linear-gradient(135deg, #0d9488, #06b6d4)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 7px",
                    marginLeft: 4,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div key={tab} className="mt-6 animate-fade-up">
        {tab === "overview" && (
          <OverviewTab doc={doc} entities={entities} citation={citation} />
        )}
        {tab === "text" && <TextTab doc={doc} />}
        {tab === "entities" && <EntitiesTab entities={entities} />}
        {tab === "connections" && <ConnectionsTab connections={connections} />}
      </div>
    </div>
  );
}

function OverviewTab({
  doc,
  entities,
  citation,
}: {
  doc: DocumentRow;
  entities: DocumentEntity[];
  citation: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <AiAnalysisCard doc={doc} entities={entities} />

      <MetadataCard doc={doc} />

      <ProvenanceCard doc={doc} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CitationCard citation={citation} />
        <FilenameCard doc={doc} />
      </div>
    </div>
  );
}

function AiAnalysisCard({
  doc,
  entities,
}: {
  doc: DocumentRow;
  entities: DocumentEntity[];
}) {
  // A light summary paragraph. We highlight entity mentions inline by kind.
  const paragraph = useMemo(
    () => buildAnalysisParagraph(doc, entities),
    [doc, entities],
  );

  return (
    <div
      className="rounded-card-lg"
      style={{
        background:
          "linear-gradient(135deg, rgba(13,148,136,0.04), rgba(6,182,212,0.03))",
        border: "1px solid rgba(13,148,136,0.08)",
        padding: "24px 28px",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="inline-flex items-center justify-center text-white"
          style={{
            width: 22,
            height: 22,
            borderRadius: 7,
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
            fontSize: 12,
          }}
          aria-hidden
        >
          ✦
        </span>
        <span
          className="font-semibold"
          style={{ fontSize: 12, color: "#0d9488", letterSpacing: "0.02em" }}
        >
          AI Analysis
        </span>
      </div>
      <p
        className="mt-4"
        style={{
          fontSize: 15.5,
          lineHeight: 1.8,
          color: "#3f3f46",
        }}
      >
        {paragraph}
      </p>
    </div>
  );
}

function buildAnalysisParagraph(
  doc: DocumentRow,
  entities: DocumentEntity[],
): React.ReactNode {
  // Compose a short analytical summary from available metadata; highlight
  // named entities inline using their entity-type color.
  const pub = doc.publication_name;
  const date = doc.publication_date;
  const title = doc.title_subject;
  const author = doc.author;
  const lang = doc.language;

  const openingParts: string[] = [];
  if (title) openingParts.push(`"${title}"`);
  if (pub) openingParts.push(`appears in ${pub}`);
  if (date) openingParts.push(`dated ${date}`);
  const opening = openingParts.length
    ? openingParts.join(", ") + "."
    : "This document has been ingested into your archive.";

  const byline = author ? ` Authored by ${author}.` : "";
  const language = lang ? ` Written in ${lang}.` : "";

  const persons = entities.filter((e) => e.entity_type === "person").slice(0, 3);
  const places = entities.filter((e) => e.entity_type === "place").slice(0, 3);
  const orgs = entities
    .filter((e) => e.entity_type === "organization")
    .slice(0, 3);

  return (
    <>
      {opening}
      {byline}
      {language}
      {(persons.length > 0 || places.length > 0 || orgs.length > 0) && (
        <>
          {" "}
          Key references include{" "}
          {joinEntitiesInline([...persons, ...orgs, ...places])}.
        </>
      )}
      {doc.is_outside_research && doc.outside_research_reason && (
        <>
          {" "}
          <em>{doc.outside_research_reason}</em>
        </>
      )}
    </>
  );
}

function joinEntitiesInline(list: DocumentEntity[]): React.ReactNode {
  return list.map((e, i) => (
    <span key={e.id}>
      <span className={entityInlineClass(e.entity_type as EntityKind)}>
        {e.name}
      </span>
      {i < list.length - 1 ? (i === list.length - 2 ? " and " : ", ") : ""}
    </span>
  ));
}

function MetadataCard({ doc }: { doc: DocumentRow }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div className="flex items-center justify-between">
        <span className="section-label">Metadata</span>
      </div>
      <dl className="mt-4 flex flex-col divide-y divide-black/[0.04]">
        <MetaRow
          label="Publication"
          value={doc.publication_name}
          confidence={doc.confidence_scores?.publication_name as ConfidenceLevel}
        />
        <MetaRow
          label="Date"
          value={doc.publication_date}
          confidence={doc.confidence_scores?.publication_date as ConfidenceLevel}
          mono
        />
        <MetaRow
          label="Title"
          value={doc.title_subject}
          confidence={doc.confidence_scores?.title_subject as ConfidenceLevel}
        />
        <MetaRow
          label="Author"
          value={doc.author}
          confidence={doc.confidence_scores?.author as ConfidenceLevel}
        />
        <MetaRow
          label="Language"
          value={doc.language}
          confidence={doc.confidence_scores?.language as ConfidenceLevel}
        />
      </dl>
    </div>
  );
}

function MetaRow({
  label,
  value,
  confidence,
  mono,
}: {
  label: string;
  value: string | null;
  confidence?: ConfidenceLevel;
  mono?: boolean;
}) {
  return (
    <div
      className="grid items-center gap-4"
      style={{
        gridTemplateColumns: "110px 1fr auto",
        padding: "12px 0",
      }}
    >
      <dt
        className="font-medium"
        style={{ fontSize: 13, color: "#71717a" }}
      >
        {label}
      </dt>
      <dd
        className={mono ? "font-mono" : ""}
        style={{
          fontSize: mono ? 13 : 14,
          color: value ? "#1a1a2e" : "#d4d4d8",
        }}
      >
        {value || "—"}
      </dd>
      <div>
        {confidence && value && <ConfidenceBadge level={confidence} />}
      </div>
    </div>
  );
}

function ProvenanceCard({ doc }: { doc: DocumentRow }) {
  const fields: Array<{
    label: string;
    value: string | null;
    mono?: boolean;
  }> = [
    { label: "Archive", value: doc.archive_name },
    { label: "Location", value: doc.archive_location },
    { label: "Obtained", value: doc.acquisition_method },
    { label: "Date found", value: doc.discovery_date, mono: true },
    { label: "Catalog ref.", value: doc.catalog_reference, mono: true },
    { label: "Original file", value: doc.original_filename, mono: true },
  ];
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <span className="section-label">Provenance</span>
      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="field-label">{f.label}</p>
            <p
              className={`mt-1.5 ${f.mono ? "font-mono" : ""}`}
              style={{
                fontSize: f.mono ? 12 : 14,
                color: f.value ? "#1a1a2e" : "#d4d4d8",
                wordBreak: "break-word",
              }}
            >
              {f.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CitationCard({ citation }: { citation: string }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <span className="section-label">Citation</span>
      <p
        className="mt-3"
        style={{
          fontSize: 13.5,
          lineHeight: 1.7,
          color: "#52525b",
          fontStyle: "italic",
        }}
      >
        {citation}
      </p>
      <div className="mt-4">
        <CitationCopy text={citation} />
      </div>
    </div>
  );
}

function FilenameCard({ doc }: { doc: DocumentRow }) {
  const generated = doc.generated_filename || doc.original_filename;
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <span className="section-label">Filename</span>
      <div
        className="mt-3 mono-block"
        style={{ wordBreak: "break-all", fontSize: 12 }}
      >
        {generated}
      </div>
      {doc.generated_filename && doc.original_filename && (
        <p className="mt-2 text-[11px] text-ink-400">
          Original filename preserved: <span className="font-mono text-ink-500">{doc.original_filename}</span>
        </p>
      )}
    </div>
  );
}

function TextTab({ doc }: { doc: DocumentRow }) {
  return (
    <div className="card" style={{ padding: "28px 32px" }}>
      <span className="section-label">Extracted text</span>
      <div
        className="mt-4 whitespace-pre-wrap"
        style={{
          fontSize: 14.5,
          lineHeight: 1.9,
          color: "#52525b",
          fontFamily: "var(--font-body)",
        }}
      >
        {doc.extracted_text || "No text extracted."}
      </div>
    </div>
  );
}

function EntitiesTab({ entities }: { entities: DocumentEntity[] }) {
  const groups: Array<{
    kind: EntityKind;
    label: string;
    list: DocumentEntity[];
  }> = [
    {
      kind: "person",
      label: "People",
      list: entities.filter((e) => e.entity_type === "person"),
    },
    {
      kind: "place",
      label: "Places",
      list: entities.filter((e) => e.entity_type === "place"),
    },
    {
      kind: "organization",
      label: "Organizations",
      list: entities.filter((e) => e.entity_type === "organization"),
    },
  ];
  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <EntityGroupCard key={g.kind} kind={g.kind} label={g.label} list={g.list} />
      ))}
    </div>
  );
}

function EntityGroupCard({
  kind,
  label,
  list,
}: {
  kind: EntityKind;
  label: string;
  list: DocumentEntity[];
}) {
  const { bg, text, border } = {
    person: { bg: "#fff7ed", text: "#c2410c", border: "#ffedd5" },
    place: { bg: "#f1f5f9", text: "#334155", border: "#e2e8f0" },
    organization: { bg: "#fffbeb", text: "#92400e", border: "#fef3c7" },
    other: { bg: "#f4f4f5", text: "#52525b", border: "#e4e4e7" },
  }[kind];
  return (
    <div className="card overflow-hidden">
      <div
        style={{
          background: bg,
          color: text,
          borderBottom: `1px solid ${border}`,
          padding: "12px 24px",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label} · {list.length}
      </div>
      <div className="flex flex-wrap gap-2" style={{ padding: "16px 24px" }}>
        {list.length === 0 ? (
          <span className="text-[13px] text-ink-400">None detected.</span>
        ) : (
          list.map((e) => (
            <span key={e.id} className={entityClass(kind)} title={e.context_snippet ?? undefined}>
              {e.name}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function ConnectionsTab({ connections }: { connections: DocumentConnection[] }) {
  if (connections.length === 0) {
    return (
      <div className="card" style={{ padding: "32px 24px" }}>
        <p className="text-[14px] text-ink-500">
          No connections to other documents yet. As you add more uploads,
          Incipit will surface overlaps with your current research here.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {connections.map((c) => {
        const isNoteMatch = c.matched_by?.startsWith("note:");
        const strength =
          c.connection_type === "entity" || c.connection_type === "theme"
            ? "Strong"
            : "Medium";
        return (
          <div key={c.id} className="card" style={{ padding: "20px 24px" }}>
            <div className="flex items-start justify-between gap-4">
              <h3
                className="font-display font-bold text-ink-900"
                style={{ fontSize: 16, letterSpacing: "-0.02em" }}
              >
                {c.target_title ?? "Related document"}
              </h3>
              <span
                className={
                  strength === "Strong" ? "pill-verified" : "pill-unconfirmed"
                }
                style={{ flexShrink: 0 }}
              >
                {strength}
              </span>
            </div>
            {c.description && (
              <p className="mt-2 text-[14px] text-ink-600" style={{ lineHeight: 1.65 }}>
                {c.description}
              </p>
            )}
            {c.connection_type && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="entity-chip entity-other">
                  {c.connection_type}
                </span>
                {c.matched_by && !isNoteMatch && (
                  <span className="entity-chip entity-other font-mono" style={{ fontSize: 11 }}>
                    {c.matched_by}
                  </span>
                )}
              </div>
            )}
            {isNoteMatch && (
              <div
                className="mt-3 inline-flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, rgba(13,148,136,0.08), rgba(6,182,212,0.06))",
                  border: "1px solid rgba(13,148,136,0.15)",
                  color: "#0d9488",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span>✦</span>
                <span>Matched your research note</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
