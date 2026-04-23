import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata = {
  title: "How It Works",
  description: "From scan to searchable in five steps.",
};

export default function HowItWorksPage() {
  return (
    <>
      <header className="relative overflow-hidden px-6 pb-20 pt-[160px] text-center md:px-12">
        <div className="mkt-header-bg-center" />
        <div className="relative mx-auto max-w-[700px]">
          <div className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-brand">
            How It Works
          </div>
          <h1
            className="mb-6 font-display font-bold leading-[1.15] tracking-tight"
            style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
          >
            From scan to searchable
            <br />
            in five steps
          </h1>
          <p className="text-[19px] leading-[1.75] text-ink-600">
            Upload a document. Incipit reads it, extracts the metadata, and
            asks you to verify. Your archive grows smarter with every
            document.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[940px] px-6 pb-16 pt-10 md:px-12">
        <WorkflowStep
          number={1}
          phase="Upload"
          title="Drop in a scan"
          reverse={false}
          paragraphs={[
            "Upload a photograph, a PDF, a microfiche scan. Whatever you brought back from the archive. No special formatting needed. Incipit works with documents exactly as they are.",
          ]}
          detail={
            'Uploading a batch? Set the provenance once ("Archivo General de la Nación, Lima, scanned March 2023") and it carries across all files.'
          }
          visual={<UploadVisual />}
        />

        <WorkflowStep
          number={2}
          phase="Extract"
          title="AI reads the image directly"
          reverse
          paragraphs={[
            "Incipit reads the actual photograph of the page, not a broken OCR text layer. Degraded microfiche, century-old typography, handwritten marginalia, multi-column layouts in Spanish, Portuguese, or French. It reads what traditional OCR cannot.",
            "Every extracted field gets a confidence score so you always know how certain the AI is.",
          ]}
          visual={<ExtractVisual />}
        />

        <WorkflowStep
          number={3}
          phase="Verify"
          title="You confirm the facts"
          reverse={false}
          paragraphs={[
            "Before anything is committed to your archive, you review every field. Confirm what's right. Correct what's wrong. Flag what's uncertain.",
            "This is non-negotiable in academic research. A wrong date or misattribution in your archive can cascade through footnotes, citations, and arguments. Incipit never guesses silently.",
          ]}
          detail="Verified fields become T1 (safe for citations). Unconfirmed high-confidence fields stay at T2. Uncertain fields are flagged T3 and excluded from generated citations."
          visual={<VerifyVisual />}
        />

        <WorkflowStep
          number={4}
          phase="Connect"
          title="Your archive gets smarter"
          reverse
          paragraphs={[
            "Every new document is compared against everything already in your archive: entities, dates, themes, your research context. Incipit surfaces meaningful connections, not just keyword matches.",
            "A Peruvian letter that mentions the same diplomat as a Puerto Rican newspaper from a different decade? Incipit catches it and tells you why it matters to your research.",
          ]}
          detail="Your research notes (hunches recorded at upload time) act as standing queries that activate when a matching document arrives later."
          visual={<ConnectVisual />}
        />

        <WorkflowStep
          number={5}
          phase="Search"
          title="Search across everything"
          reverse={false}
          paragraphs={[
            `Query your entire archive in plain language. "Show me everything mentioning Vasconcelos" works regardless of which collection, country, or language the document came from.`,
            "Your archive is no longer a folder of files. It's a research brain: searchable, connected, and growing with every document you add.",
          ]}
          visual={<SearchVisual />}
        />
      </div>

      {/* CTA — card style, matching /about */}
      <div className="mx-auto max-w-[680px] px-6 pb-[120px] md:px-12">
        <div className="mkt-cta-dark">
          <h2 className="relative mb-3 font-display text-[28px] font-bold text-white">
            Your research archive, finally intelligent
          </h2>
          <p
            className="relative mb-7 text-[16px]"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Stop losing connections between sources. Start building an
            archive that compounds with every document.
          </p>
          <Link
            href="/signin"
            className="relative inline-block rounded-xl px-9 py-4 text-[16px] font-semibold text-white no-underline transition hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #0d9488, #06b6d4)",
              boxShadow: "0 2px 10px rgba(13,148,136,0.25)",
            }}
          >
            Get Early Access
          </Link>
        </div>
      </div>
    </>
  );
}

function WorkflowStep({
  number,
  phase,
  title,
  paragraphs,
  detail,
  visual,
  reverse,
}: {
  number: number;
  phase: string;
  title: string;
  paragraphs: string[];
  detail?: string;
  visual: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <Reveal
      className="mb-[80px] grid grid-cols-1 items-center gap-16 md:mb-[120px] md:grid-cols-2"
      threshold={0.15}
    >
      <div className={`max-w-[400px] ${reverse ? "md:order-2" : ""}`}>
        <div className="mb-5 inline-flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[10px] font-display text-[15px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #0d9488, #06b6d4)",
            }}
          >
            {number}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-brand">
            {phase}
          </span>
        </div>
        <h2 className="mb-4 font-display text-[26px] font-bold leading-[1.2] tracking-tight">
          {title}
        </h2>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className="mb-4 text-[15px] leading-[1.8] text-ink-600"
          >
            {p}
          </p>
        ))}
        {detail && (
          <p className="text-[14px] italic leading-[1.8] text-ink-400">
            {detail}
          </p>
        )}
      </div>
      <div
        className={`flex justify-center ${reverse ? "md:order-1" : ""}`}
      >
        {visual}
      </div>
    </Reveal>
  );
}

function VisualCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mkt-visual-card-glow relative w-full max-w-[380px] overflow-hidden rounded-card bg-white p-7"
      style={{
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function UploadVisual() {
  return (
    <VisualCard>
      <div className="mkt-upload-zone mb-4 px-5 py-9 text-center">
        <div
          className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl text-[18px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
            fontFamily: "var(--font-display)",
          }}
        >
          +
        </div>
        <div className="mb-1 font-display text-[14px] font-semibold">
          Drop a scan or click to upload
        </div>
        <div className="text-[12px] text-ink-400">PDF, JPG, PNG</div>
      </div>
      <div
        className="flex items-center gap-3 rounded-[10px] p-3 px-4"
        style={{ background: "rgba(13,148,136,0.04)" }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "rgba(13,148,136,0.1)" }}
        >
          <div
            className="h-5 w-4"
            style={{
              border: "2px solid #0d9488",
              borderRadius: 2,
              opacity: 0.5,
            }}
          />
        </div>
        <div>
          <div className="font-mono text-[12px] font-medium">
            IMG_0183.pdf
          </div>
          <div className="text-[11px] text-ink-400">2.4 MB · Uploaded</div>
        </div>
        <div
          className="ml-auto font-display text-[16px] font-bold"
          style={{ color: "#0d9488" }}
        >
          ✓
        </div>
      </div>
    </VisualCard>
  );
}

function ExtractVisual() {
  const fields = [
    { label: "Publication", value: "Amauta", tag: "High" },
    { label: "Date", value: "septiembre 1928", tag: "Medium" },
    { label: "Title", value: "El problema indígena y la tierra", tag: "High" },
    { label: "Author", value: "J.C. Mariátegui", tag: "High" },
    { label: "Language", value: "Spanish", tag: "High" },
  ] as const;

  return (
    <VisualCard>
      <div className="mb-5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-400">
        Extracted metadata
      </div>
      {fields.map((f, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3"
          style={{
            borderBottom:
              i < fields.length - 1
                ? "1px solid rgba(0,0,0,0.04)"
                : "none",
          }}
        >
          <span className="text-[12px] uppercase tracking-[0.06em] text-ink-400">
            {f.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium">{f.value}</span>
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
              style={
                f.tag === "High"
                  ? { background: "rgba(13,148,136,0.1)", color: "#0d9488" }
                  : { background: "rgba(194,113,79,0.1)", color: "#c2714f" }
              }
            >
              {f.tag}
            </span>
          </div>
        </div>
      ))}
    </VisualCard>
  );
}

function VerifyVisual() {
  return (
    <VisualCard>
      <div className="mb-1.5 font-display text-[14px] font-semibold">
        Review extracted metadata
      </div>
      <div className="mb-5 text-[12px] text-ink-400">
        Confirm, correct, or flag each field
      </div>
      <div
        className="py-3.5"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] text-ink-400">Publication</span>
        </div>
        <div className="text-[15px] font-medium">Amauta</div>
        <div
          className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold"
          style={{ color: "#0d9488" }}
        >
          ✓ Verified · T1
        </div>
      </div>
      <div
        className="py-3.5"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] text-ink-400">Date</span>
          <div className="flex gap-1.5">
            <button
              className="rounded-md px-3 py-1 text-[11px] font-semibold"
              style={{
                background: "rgba(13,148,136,0.1)",
                color: "#0d9488",
              }}
            >
              Confirm
            </button>
            <button
              className="rounded-md px-3 py-1 text-[11px] font-semibold"
              style={{ background: "rgba(0,0,0,0.04)", color: "#8a8a86" }}
            >
              Edit
            </button>
          </div>
        </div>
        <div className="text-[15px] font-medium">septiembre 1928</div>
      </div>
      <div className="py-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] text-ink-400">Author</span>
        </div>
        <div className="text-[15px] font-medium">J.C. Mariátegui</div>
        <div
          className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold"
          style={{ color: "#0d9488" }}
        >
          ✓ Verified · T1
        </div>
      </div>
    </VisualCard>
  );
}

function ConnectVisual() {
  return (
    <VisualCard>
      <div
        className="mb-3.5 rounded-[10px] p-4"
        style={{
          background: "rgba(13,148,136,0.04)",
          borderLeft: "3px solid #0d9488",
        }}
      >
        <div
          className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "#0d9488" }}
        >
          New document
        </div>
        <div className="font-display text-[13px] font-semibold">
          Letter from Mariátegui to Pedreira
        </div>
      </div>
      <div
        className="mb-3.5 text-center font-display text-[18px]"
        style={{ color: "#0d9488" }}
      >
        ↕
      </div>
      <div
        className="mb-3.5 rounded-[10px] p-4"
        style={{
          background: "rgba(194,113,79,0.04)",
          borderLeft: "3px solid #c2714f",
        }}
      >
        <div
          className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: "#c2714f" }}
        >
          Connection found
        </div>
        <div className="font-display text-[13px] font-semibold">
          El Nacionalista, 14 marzo 1926
        </div>
        <div className="mt-0.5 text-[12px] text-ink-400">
          Uploaded 3 weeks ago · Puerto Rico
        </div>
      </div>
      <div
        className="rounded-lg p-3.5 text-[13px] leading-[1.6] text-ink-600"
        style={{ background: "rgba(0,0,0,0.02)" }}
      >
        <strong className="text-ink-900">Why this matters:</strong> Both
        documents reference the Liga Anti-Imperialista and overlap with your
        research on pan-American intellectual networks, 1920 to 1930.
      </div>
    </VisualCard>
  );
}

function SearchVisual() {
  return (
    <VisualCard>
      <div
        className="mb-5 flex items-center gap-2.5 rounded-[10px] px-4 py-3.5"
        style={{
          background: "rgba(0,0,0,0.02)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="relative h-5 w-5 flex-shrink-0 rounded-full"
          style={{ border: "2px solid #8a8a86" }}
        >
          <span
            className="absolute -bottom-1 -right-1 h-0.5 w-1.5 rotate-45 rounded-sm"
            style={{ background: "#8a8a86" }}
          />
        </div>
        <span className="text-[14px]">
          Vasconcelos <span className="text-ink-400">· 3 results</span>
        </span>
      </div>
      <SearchResult
        color="#0d9488"
        title="El ideal de Vasconcelos y la raza cósmica"
        meta="El Nacionalista · Ponce, PR · 1927"
      />
      <SearchResult
        color="#c2714f"
        title="Carta de Mariátegui re: visita de Vasconcelos"
        meta="Correspondence · Lima, Peru · 1926"
      />
      <SearchResult
        color="#a08060"
        title="Conferencia del Sr. Vasconcelos en La Paz"
        meta="La Razón · La Paz, Bolivia · 1929"
        last
      />
    </VisualCard>
  );
}

function SearchResult({
  color,
  title,
  meta,
  last,
}: {
  color: string;
  title: string;
  meta: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex gap-3.5 py-3.5"
      style={{
        borderBottom: last ? "none" : "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
        style={{ background: color }}
      />
      <div>
        <div className="mb-0.5 font-display text-[13px] font-semibold">
          {title}
        </div>
        <div className="text-[12px] text-ink-400">{meta}</div>
      </div>
    </div>
  );
}
