import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata = {
  title:
    "Incipit — The research brain that grows with every document you feed it",
  description:
    "Incipit turns fieldwork scans into a persistent, searchable, relationship-aware research archive.",
};

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-[120px] text-center md:px-12">
        <div className="mkt-hero-bg" />

        <div
          className="mkt-fade-up relative mb-10 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2 text-[13px] font-medium"
          style={{ borderColor: "rgba(13,148,136,0.15)", color: "#0d9488" }}
        >
          <span
            className="mkt-pulse-dot h-[7px] w-[7px] rounded-full"
            style={{ background: "#0d9488" }}
          />
          Now in early access
        </div>

        <h1
          className="mkt-fade-up mkt-delay-1 relative mb-7 max-w-[820px] font-display font-bold leading-[1.1] tracking-tighter"
          style={{ fontSize: "clamp(42px, 5.5vw, 72px)" }}
        >
          Your research archive,
          <br />
          <span className="mkt-gradient-text">finally intelligent</span>
        </h1>

        <p
          className="mkt-fade-up mkt-delay-2 relative mb-12 max-w-[600px] leading-[1.7] text-ink-600"
          style={{ fontSize: "clamp(17px, 1.8vw, 20px)" }}
        >
          Incipit turns fieldwork scans into a persistent, searchable,
          relationship-aware research archive. Shaped by your intuition.
          Verified by your expertise.
        </p>

        <div className="mkt-fade-up mkt-delay-3 relative flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/signin"
            className="inline-block rounded-xl px-9 py-4 text-center text-[16px] font-semibold text-white no-underline transition hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #0d9488, #06b6d4)",
              boxShadow: "0 2px 10px rgba(13,148,136,0.25)",
            }}
          >
            Get Early Access
          </Link>
          <Link
            href="/how-it-works"
            className="inline-block rounded-xl border-[1.5px] border-black/10 bg-transparent px-9 py-4 text-center text-[16px] font-semibold text-ink-900 no-underline transition hover:border-brand hover:text-brand"
          >
            See How It Works
          </Link>
        </div>

        {/* APP PREVIEW */}
        <div
          className="mkt-fade-up mkt-delay-4 relative mt-[72px] w-full max-w-[960px]"
        >
          <div className="mkt-preview-window">
            <div className="mkt-preview-titlebar">
              <span
                className="mkt-preview-dot"
                style={{ background: "#ff5f57" }}
              />
              <span
                className="mkt-preview-dot"
                style={{ background: "#febc2e" }}
              />
              <span
                className="mkt-preview-dot"
                style={{ background: "#28c840" }}
              />
              <span className="flex-1 text-center font-mono text-[12px] text-ink-400">
                incipit.dev
              </span>
            </div>
            <div className="flex gap-6 px-10 pb-10 pt-8">
              <div className="hidden w-40 shrink-0 md:block">
                <PreviewSidebarItem label="Upload" />
                <PreviewSidebarItem label="Archive" active />
                <PreviewSidebarItem label="Search" />
                <PreviewSidebarItem label="Profile" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="rounded-xl bg-canvas p-6">
                  <div className="mb-1 font-display text-[15px] font-semibold">
                    El Tacna-Arica y la actitud continental
                  </div>
                  <div className="mb-4 text-[12px] text-ink-400">
                    El Nacionalista · Ponce, Puerto Rico · 14 de marzo, 1926
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <PreviewMeta label="Publication" value="El Nacionalista" tier="T1" />
                    <PreviewMeta label="Date" value="1926-03-14" tier="T1" />
                    <PreviewMeta label="Language" value="Spanish" />
                    <PreviewMeta label="Author" value="Unknown" tier="T2" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <EntityChip kind="person">Augusto Leguía</EntityChip>
                    <EntityChip kind="place">Tacna-Arica</EntityChip>
                    <EntityChip kind="org">Liga Anti-Imperialista</EntityChip>
                    <EntityChip kind="person">José Vasconcelos</EntityChip>
                    <EntityChip kind="place">Bolivia</EntityChip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mb-[140px] px-6 md:px-12" id="problem">
        <Reveal className="mx-auto max-w-[1080px]">
          <div className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-brand">
            The Problem
          </div>
          <h2
            className="mb-6 max-w-[700px] font-display font-bold leading-[1.15] tracking-tight"
            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
          >
            The historian&apos;s workflow is fundamentally broken
          </h2>
          <p className="max-w-[620px] text-[17px] leading-[1.75] text-ink-600">
            You scan 60 documents in a day and they all come out as
            IMG_0047.pdf. Metadata lives in your head. Connections live on
            sticky notes. The hunch you had in Lima about a document you saw
            in New York? Gone.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            <ProblemCard
              emoji="📄"
              title="Documents without identity"
              body="Hundreds of files named IMG_0047 or scan_final_v2. The original archive reference codes get lost in the renaming shuffle."
            />
            <ProblemCard
              emoji="🔍"
              title="OCR that can't read your sources"
              body="Degraded microfiche, century-old typography, handwritten marginalia, multilingual text. Traditional OCR mangles exactly the documents that matter most."
            />
            <ProblemCard
              emoji="🧠"
              title="Connections only in your head"
              body="A Bolivian newspaper mentions the same diplomat as a Puerto Rican letter from a different decade. You'd only notice if you remembered both."
            />
            <ProblemCard
              emoji="💬"
              title="AI tools weren't built for this"
              body="You can chat with a handful of documents. But that's a workaround, not a workflow. Your research needs structured metadata, verified facts, and an archive that scales."
            />
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section className="mb-[140px] px-6 md:px-12" id="features">
        <Reveal className="mx-auto max-w-[1080px]">
          <div className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-brand">
            How It Works
          </div>
          <h2
            className="mb-6 max-w-[700px] font-display font-bold leading-[1.15] tracking-tight"
            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
          >
            A research brain that compounds with every document
          </h2>
          <p className="max-w-[620px] text-[17px] leading-[1.75] text-ink-600">
            Incipit doesn&apos;t just read documents. It builds an archive
            that gets smarter over time, shaped by your research goals and
            your intuition.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            <FeatureCard
              emoji="👁️"
              color="rgba(13,148,136,0.08)"
              title="Vision-First Ingestion"
              body="AI reads the actual image of your scan, not a broken OCR layer. Degraded microfiche, old Spanish typography, multi-column layouts. It reads what OCR cannot."
            />
            <FeatureCard
              emoji="✓"
              color="rgba(194,113,79,0.08)"
              title="Trust Tiers"
              body="Every extracted field gets a confidence score. You verify before anything is committed. T1 for confirmed, T2 for high-confidence, T3 for uncertain. No silent guessing."
            />
            <FeatureCard
              emoji="🔗"
              color="rgba(160,128,96,0.08)"
              title="Connection Surfacing"
              body="Every new document is compared against your entire archive: entities, dates, themes. Informed by your research context. Meaningful connections, not just keyword matches."
            />
            <FeatureCard
              emoji="📝"
              color="rgba(100,116,139,0.08)"
              title="Standing Queries"
              body="Record a hunch at upload time. That note becomes a live query that activates when a matching document arrives, weeks or months later."
            />
            <FeatureCard
              emoji="📜"
              color="rgba(6,182,212,0.08)"
              title="Provenance & Changelog"
              body="Where it came from, how you got it, every rename and correction: logged permanently. That gibberish filename might be a catalog reference you need later."
            />
            <FeatureCard
              emoji="📚"
              color="rgba(13,148,136,0.08)"
              title="Instant Citations"
              body="Chicago/Turabian citations generated from verified metadata. Copy-paste ready. If a field is uncertain, the citation reflects that. Never fabricates."
            />
          </div>
        </Reveal>
      </section>

      {/* WHY INCIPIT — dark contrast section */}
      <section className="mkt-contrast-section mb-[140px]" id="why">
        <Reveal className="relative mx-auto max-w-[1080px]">
          <div
            className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em]"
            style={{ color: "#06b6d4" }}
          >
            Why Incipit
          </div>
          <h2
            className="mb-6 max-w-[700px] font-display font-bold leading-[1.15] tracking-tight text-white"
            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
          >
            A workaround is not a workflow
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Generic card */}
            <div
              className="rounded-2xl p-9"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="mb-7 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[14px] font-bold"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  □
                </div>
                <h3
                  className="font-display text-[17px] font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  General-purpose AI tools
                </h3>
              </div>
              <ContrastList
                variant="generic"
                items={[
                  "Upload a handful of documents to a chat project",
                  "Get prose answers you have to verify yourself",
                  "No structured metadata or confidence scores",
                  "No provenance tracking or changelogs",
                  "No standing queries or automatic connection surfacing",
                  "Cap at 10 to 40 files per project",
                ]}
              />
            </div>

            {/* Incipit card */}
            <div
              className="rounded-2xl p-9"
              style={{
                background:
                  "linear-gradient(135deg, rgba(13,148,136,0.12), rgba(6,182,212,0.08))",
                border: "1px solid rgba(13,148,136,0.2)",
              }}
            >
              <div className="mb-7 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] font-display text-[14px] font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #0d9488, #06b6d4)",
                  }}
                >
                  I
                </div>
                <h3 className="font-display text-[17px] font-semibold text-white">
                  Incipit
                </h3>
              </div>
              <ContrastList
                variant="incipit"
                items={[
                  "A persistent archive that scales with your research",
                  "Structured, searchable metadata with trust tiers",
                  "You verify every field before it's committed",
                  "Provenance, changelogs, and original filenames preserved",
                  "Research notes become standing queries that activate over time",
                  "Built for researchers, not developers",
                ]}
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* BUILT BY / ORIGIN */}
      <section className="mb-[140px] px-6 md:px-12" id="about-origin">
        <Reveal className="mx-auto max-w-[1080px]">
          <div className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-brand">
            Origin
          </div>
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <div>
              <p
                className="mb-6 font-display font-semibold leading-[1.35] tracking-tight"
                style={{ fontSize: "clamp(24px, 2.5vw, 32px)" }}
              >
                &ldquo;Built by a historian who spent{" "}
                <span className="mkt-gradient-text">
                  years in archives across eight countries
                </span>{" "}
                and built the tool that should have existed.&rdquo;
              </p>
              <p className="text-[15px] leading-[1.75] text-ink-600">
                Every feature in Incipit comes from direct experience in
                national archives, university special collections, and
                private document repositories across Latin America. This
                isn&apos;t a tool designed by engineers guessing at a
                workflow. It&apos;s the tool a researcher needed and nobody
                had built.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <StatCard number="8" label="Countries researched" />
              <StatCard number="500+" label="Primary sources" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative mkt-cta-bottom-glow px-6 pb-[120px] pt-[100px] text-center md:px-12">
        <Reveal>
          <div className="mb-5 text-center font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-brand">
            Early Access
          </div>
          <h2
            className="mx-auto mb-6 max-w-[600px] text-center font-display font-bold leading-[1.15] tracking-tight"
            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
          >
            Your documents deserve
            <br />a real archive
          </h2>
          <p className="mx-auto mb-10 max-w-[620px] text-center text-[17px] leading-[1.75] text-ink-600">
            Stop losing connections between sources. Start building a
            research brain that compounds with every document you feed it.
          </p>
          <div className="flex justify-center">
            <Link
              href="/signin"
              className="inline-block rounded-xl px-9 py-4 text-[16px] font-semibold text-white no-underline transition hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                boxShadow: "0 2px 10px rgba(13,148,136,0.25)",
              }}
            >
              Get Early Access
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* ——————————————————— Subcomponents ——————————————————— */

function PreviewSidebarItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className="mb-1 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px]"
      style={{
        background: active ? "rgba(13,148,136,0.08)" : "transparent",
        color: active ? "#0d9488" : "#8a8a86",
        fontWeight: active ? 600 : 400,
      }}
    >
      <span
        className="h-4 w-4 rounded-[4px]"
        style={{ background: "currentColor", opacity: 0.3 }}
      />
      {label}
    </div>
  );
}

function PreviewMeta({
  label,
  value,
  tier,
}: {
  label: string;
  value: string;
  tier?: "T1" | "T2";
}) {
  return (
    <div className="flex flex-col gap-[3px]">
      <span className="text-[10px] uppercase tracking-[0.08em] text-ink-400">
        {label}
      </span>
      <span className="text-[13px] font-medium">
        {value}{" "}
        {tier && (
          <span
            className="ml-1 inline-block rounded-md px-2.5 py-[2px] text-[11px] font-semibold"
            style={{
              background:
                tier === "T1"
                  ? "rgba(13,148,136,0.1)"
                  : "rgba(194,113,79,0.1)",
              color: tier === "T1" ? "#0d9488" : "#c2714f",
            }}
          >
            {tier}
          </span>
        )}
      </span>
    </div>
  );
}

function EntityChip({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind: "person" | "place" | "org";
}) {
  const styles = {
    person: { background: "rgba(194,113,79,0.1)", color: "#c2714f" },
    place: { background: "rgba(13,148,136,0.08)", color: "#0d9488" },
    org: { background: "rgba(160,128,96,0.1)", color: "#a08060" },
  }[kind];
  return (
    <span
      className="rounded-full px-3 py-1 text-[11px] font-medium"
      style={styles}
    >
      {children}
    </span>
  );
}

function ProblemCard({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="mkt-card-hover rounded-card bg-white p-8"
      style={{
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <div
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-[20px]"
        style={{ background: "rgba(194,113,79,0.08)" }}
      >
        {emoji}
      </div>
      <h3 className="mb-2.5 font-display text-[17px] font-semibold">
        {title}
      </h3>
      <p className="text-[14px] leading-[1.7] text-ink-600">{body}</p>
    </div>
  );
}

function FeatureCard({
  emoji,
  color,
  title,
  body,
}: {
  emoji: string;
  color: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="mkt-card-hover rounded-card bg-white px-7 py-8"
      style={{
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <div
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-[20px]"
        style={{ background: color }}
      >
        {emoji}
      </div>
      <h3 className="mb-2.5 font-display text-[16px] font-semibold">
        {title}
      </h3>
      <p className="text-[14px] leading-[1.7] text-ink-600">{body}</p>
    </div>
  );
}

function ContrastList({
  items,
  variant,
}: {
  items: string[];
  variant: "generic" | "incipit";
}) {
  const liStyle =
    variant === "incipit"
      ? { color: "rgba(255,255,255,0.9)" }
      : { color: "rgba(255,255,255,0.45)" };
  const dotStyle =
    variant === "incipit"
      ? { background: "#06b6d4" }
      : { background: "rgba(255,255,255,0.15)" };

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-6 text-[15px] leading-[1.65]"
          style={liStyle}
        >
          <span
            className="absolute left-0 top-2 h-[6px] w-[6px] rounded-full"
            style={dotStyle}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div
      className="rounded-card bg-white px-7 py-10 text-center"
      style={{ border: "1px solid rgba(0,0,0,0.04)" }}
    >
      <div className="mb-2 font-display text-[48px] font-bold text-brand">
        {number}
      </div>
      <div className="text-[14px] font-medium text-ink-400">{label}</div>
    </div>
  );
}
