import Link from "next/link";

export const metadata = {
  title: "Early Access",
  description:
    "You're getting in early. Your archive is real and yours to keep.",
};

export default function EarlyAccessPage() {
  return (
    <>
      <header className="relative overflow-hidden px-6 pb-20 pt-[160px] md:px-12">
        <div className="mkt-header-bg" />
        <div className="relative mx-auto max-w-[680px]">
          <div className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-brand">
            Early Access
          </div>
          <h1
            className="mb-6 font-display font-bold leading-[1.15] tracking-tight"
            style={{ fontSize: "clamp(36px, 4vw, 48px)" }}
          >
            You&apos;re getting in early
          </h1>
          <p className="max-w-[580px] text-[19px] leading-[1.75] text-ink-600">
            Incipit is live and working. You can upload real documents, get
            real extractions, and start building your archive today.
            Here&apos;s what to expect.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[680px] px-6 pb-[120px] md:px-12">
        {/* HIGHLIGHT CARD */}
        <section className="mb-16 animate-fade-up">
          <div
            className="mkt-topbar-gradient relative overflow-hidden rounded-card bg-white p-9"
            style={{
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
            }}
          >
            <h3 className="mb-4 font-display text-[18px] font-semibold">
              Your archive is real
            </h3>
            <p className="text-[15px] leading-[1.75] text-ink-600">
              This is not a demo or a sandbox. The documents you upload, the
              metadata you verify, the connections Incipit surfaces: all of
              it is persistent and yours. Your early access archive carries
              forward as Incipit grows.
            </p>
          </div>
        </section>

        {/* TWO COLUMN */}
        <section className="mb-16 animate-fade-up">
          <h2 className="mb-4 font-display text-[24px] font-bold leading-[1.25] tracking-tight">
            What you can do right now
          </h2>
          <p className="mb-7 text-[16px] leading-[1.8] text-ink-600">
            Early access includes the full core workflow. You can upload
            scanned documents and photographs, have the AI read them
            directly from the image (not from OCR), review and verify the
            extracted metadata, and watch your archive start surfacing
            connections between documents as it grows.
          </p>

          <div className="my-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            <ColCard
              label="Live now"
              accent="#0d9488"
              items={[
                "AI vision extraction from scans and photographs",
                "Structured metadata with confidence scores",
                "Historian verification before anything is committed",
                "Cross-document connection surfacing",
                "Research notes as standing queries",
                "Provenance tracking and metadata changelog",
                "Natural language search across your archive",
                "Citation generation from verified metadata",
              ]}
            />
            <ColCard
              label="Coming soon"
              accent="#c2714f"
              items={[
                "Voice notes at the moment of capture",
                "Mobile upload from your phone",
                "Archive recommendations based on your corpus",
                "Multiple parallel research projects",
                "Batch upload with shared provenance",
                "Additional citation formats",
              ]}
            />
          </div>
        </section>

        <div
          className="my-16 h-[3px] w-12 rounded-[3px]"
          style={{
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
          }}
        />

        {/* 5-DOCUMENT LIMIT */}
        <section className="mb-16 animate-fade-up">
          <h2 className="mb-4 font-display text-[24px] font-bold leading-[1.25] tracking-tight">
            The 5-document limit
          </h2>
          <p className="mb-4 text-[16px] leading-[1.8] text-ink-600">
            During early access, each account can upload up to 5 documents.
            This is enough to experience the full workflow: upload, extract,
            verify, and see connections surface between your documents.
          </p>
          <p className="text-[16px] leading-[1.8] text-ink-600">
            We&apos;re keeping the cap low intentionally as we scale. This
            limit will increase as Incipit grows.
          </p>
        </section>

        {/* WHAT THIS IS NOT */}
        <section className="mb-16 animate-fade-up">
          <h2 className="mb-4 font-display text-[24px] font-bold leading-[1.25] tracking-tight">
            What this is not
          </h2>
          <p className="mb-4 text-[16px] leading-[1.8] text-ink-600">
            Incipit is not a place to bulk-upload your entire research
            archive right now. The 5-document limit means this is a chance
            to try the workflow, see how the AI handles your specific
            documents, and give us feedback on what works and what
            doesn&apos;t.
          </p>
          <p className="text-[16px] leading-[1.8] text-ink-600">
            If you have thousands of documents waiting for a home, we hear
            you. That&apos;s exactly what we&apos;re building toward.
          </p>
        </section>

        {/* FEEDBACK */}
        <section className="mb-16 animate-fade-up">
          <h2 className="mb-4 font-display text-[24px] font-bold leading-[1.25] tracking-tight">
            Your feedback shapes the product
          </h2>
          <p className="mb-4 text-[16px] leading-[1.8] text-ink-600">
            Incipit was built from years of firsthand archival experience.
            But every historian&apos;s workflow is different. Your documents
            are different. Your research questions are different. Early
            access is how we learn what matters most to you so we can build
            the right thing.
          </p>
          <p className="text-[16px] leading-[1.8] text-ink-600">
            If something doesn&apos;t work the way you expected, or if
            there&apos;s a feature you need that isn&apos;t here yet, we
            want to know.
          </p>
        </section>

        {/* CTA */}
        <section className="animate-fade-up">
          <div className="mkt-cta-dark" style={{ padding: "48px" }}>
            <h2 className="relative mb-3 font-display text-[24px] font-bold text-white">
              Ready to try it?
            </h2>
            <p
              className="relative mb-6 text-[15px]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Sign in to start building your archive.
            </p>
            <Link
              href="/signin"
              className="relative inline-block rounded-xl px-9 py-4 text-[16px] font-semibold text-white no-underline transition hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #0d9488, #06b6d4)",
                boxShadow: "0 2px 10px rgba(13,148,136,0.25)",
              }}
            >
              Sign In
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function ColCard({
  label,
  accent,
  items,
}: {
  label: string;
  accent: string;
  items: string[];
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white p-7"
      style={{
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
      }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: accent }}
      />
      <div
        className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em]"
        style={{ color: accent }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: accent }}
        />
        {label}
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="relative pl-5 text-[14px] leading-[1.6] text-ink-600"
          >
            <span
              className="absolute left-0 top-[7px] h-1.5 w-1.5 rounded-full"
              style={{
                background:
                  accent === "#0d9488"
                    ? "rgba(13,148,136,0.3)"
                    : "rgba(194,113,79,0.3)",
              }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
