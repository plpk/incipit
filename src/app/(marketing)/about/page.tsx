import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Built by a historian who spent years in archives across eight countries.",
};

export default function AboutPage() {
  return (
    <>
      <header className="relative overflow-hidden px-6 pb-24 pt-[160px] md:px-12">
        <div className="mkt-header-bg" />
        <div className="relative mx-auto max-w-[760px]">
          <div className="mb-5 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-brand">
            About
          </div>
          <h1
            className="mb-6 font-display font-bold leading-[1.15] tracking-tight"
            style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
          >
            Built by a historian,
            <br />
            for historians
          </h1>
          <p className="max-w-[620px] text-[19px] leading-[1.75] text-ink-600">
            Incipit wasn&apos;t designed in a lab. It was designed in
            archives, after years of losing connections between documents
            scattered across countries, languages, and filing cabinets.
          </p>
        </div>
      </header>

      <div className="relative mx-auto max-w-[760px] px-6 pb-[120px] md:px-12">
        {/* ETYMOLOGY / NAME BLOCK */}
        <section className="mb-20 animate-fade-up">
          <div
            className="mkt-topbar-gradient relative overflow-hidden rounded-card bg-white p-10"
            style={{
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
            }}
          >
            <div className="mkt-gradient-text mb-2 font-display text-[40px] font-bold tracking-tight">
              incipit
            </div>
            <div className="mb-5 font-mono text-[14px] text-ink-400">
              /ˈɪn.sɪ.pɪt/ — Latin: &ldquo;it begins&rdquo;
            </div>
            <p className="text-[16px] leading-[1.75] text-ink-600">
              In manuscript studies, an{" "}
              <strong className="font-semibold text-ink-900">incipit</strong>{" "}
              is the opening words of a text, used to identify documents
              before titles existed. Medieval scribes cataloged entire
              libraries by incipit alone. Incipit gives unnamed documents an
              identity.
            </p>
          </div>
        </section>

        {/* THE RESEARCH PROBLEM */}
        <section className="mb-20 animate-fade-up">
          <h2 className="mb-5 font-display text-[28px] font-bold leading-[1.25] tracking-tight">
            The research problem nobody solved
          </h2>
          <p className="mb-5 text-[16px] leading-[1.8] text-ink-600">
            Academic historical research depends on primary source
            documents: newspaper scans, handwritten letters, government
            records, photographs of archival pages. These documents are the
            evidence. Everything else (the articles, the dissertations, the
            books) is built on top of them.
          </p>
          <p className="mb-5 text-[16px] leading-[1.8] text-ink-600">
            The workflow for handling these sources hasn&apos;t meaningfully
            changed in decades. You visit an archive. You scan or photograph
            as many documents as your time allows. You fly home with
            hundreds of images named IMG_0047 through IMG_0312. The metadata
            (what each document is, where it came from, why it matters)
            lives in your head and maybe a paper notebook.
          </p>

          <div className="mkt-pullquote">
            <p className="relative m-0 font-display text-[20px] font-medium italic leading-[1.55] text-ink-900">
              The hunch you had in an archive in Lima about a document you
              saw in New York? Gone the moment you walked out the door.
            </p>
          </div>

          <p className="mb-5 text-[16px] leading-[1.8] text-ink-600">
            Connections between documents from different archives, different
            countries, different decades: these are tracked on sticky notes
            or not at all. And those connections are often the entire point
            of the research. A Bolivian newspaper article that mentions the
            same diplomat as a Puerto Rican letter from a different year. A
            Peruvian intellectual&apos;s magazine that shares contributors
            with a nationalist movement 3,000 miles away. You&apos;d only
            notice if you happened to remember both.
          </p>
          <p className="text-[16px] leading-[1.8] text-ink-600">
            You could technically piece together parts of this workflow
            using general-purpose AI tools. Upload a few documents to a chat
            project, ask questions, get answers. But that&apos;s a
            workaround, not a workflow. It doesn&apos;t give you structured
            metadata, confidence scores, provenance tracking, or an archive
            that scales past 40 files. Your research deserves infrastructure,
            not improvisation.
          </p>
        </section>

        <div
          className="my-20 h-[3px] w-12 rounded-[3px]"
          style={{
            background: "linear-gradient(135deg, #0d9488, #06b6d4)",
          }}
        />

        {/* WHY WE BUILT THIS */}
        <section className="mb-20 animate-fade-up">
          <h2 className="mb-5 font-display text-[28px] font-bold leading-[1.25] tracking-tight">
            Why we built this
          </h2>
          <p className="mb-5 text-[16px] leading-[1.8] text-ink-600">
            Incipit was built by someone who spent years doing firsthand
            archival research across Latin America. Not reading about
            archives. Not theorizing about workflows. Sitting in reading
            rooms, scanning documents, flying home with hundreds of unnamed
            files, and trying to make sense of it all.
          </p>
          <p className="mb-5 text-[16px] leading-[1.8] text-ink-600">
            That experience is why every feature in Incipit works the way it
            does. Trust tiers exist because a wrong date can sink a
            dissertation defense. Provenance tracking exists because we once
            spent two days trying to trace a document back to an archive
            after renaming the file. Standing queries exist because the best
            research connections happen in your head, weeks after visiting
            an archive, and there was never a way to preserve them.
          </p>
          <p className="mb-8 text-[16px] leading-[1.8] text-ink-600">
            We didn&apos;t build Incipit because we saw a market
            opportunity. We built it because we needed it and it didn&apos;t
            exist. The tool that should have been there for every historian
            who&apos;s ever walked out of an archive knowing they&apos;d
            forget something important. That&apos;s what Incipit is.
          </p>

          {/* COUNTRIES BLOCK */}
          <div
            className="mkt-countries-glow relative my-8 overflow-hidden rounded-card bg-white px-10 py-9"
            style={{
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
            }}
          >
            <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.12em] text-brand">
              Countries researched
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4">
              <Country name="Peru" detail="Lima, Cuzco" />
              <Country name="Mexico" detail="Mexico City" />
              <Country name="Bolivia" detail="La Paz, Sucre" />
              <Country name="Puerto Rico" detail="Ponce, San Juan" />
              <Country name="Chile" detail="Santiago, Valparaíso" />
              <Country name="Argentina" detail="Buenos Aires" />
              <Country name="Colombia" detail="Bogotá" />
              <Country name="Ecuador" detail="Quito, Guayaquil" />
            </div>
          </div>

          {/* CREDENTIAL CARDS */}
          <div className="my-9 flex flex-col gap-4 md:flex-row">
            <Credential
              accent="#0d9488"
              title="Fieldwork"
              body="National archives, special collections, and private repositories across Latin America."
            />
            <Credential
              accent="#c2714f"
              title="Languages"
              body="Research conducted in Spanish, Portuguese, and English. Source materials handled natively."
            />
            <Credential
              accent="#a08060"
              title="Focus"
              body="20th-century pan-American intellectual networks, nationalism, and diplomatic history."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="animate-fade-up">
          <div className="mkt-cta-dark">
            <h2 className="relative mb-3 font-display text-[28px] font-bold text-white">
              Your research archive, finally intelligent
            </h2>
            <p
              className="relative mb-7 text-[16px]"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Incipit is in early access. Be among the first historians to
              try it.
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
        </section>
      </div>
    </>
  );
}

function Country({ name, detail }: { name: string; detail: string }) {
  return (
    <div
      className="py-3.5"
      style={{
        borderTop: "1px solid rgba(0,0,0,0.04)",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div className="font-display text-[14px] font-semibold">{name}</div>
      <div className="mt-0.5 text-[12px] text-ink-400">{detail}</div>
    </div>
  );
}

function Credential({
  accent,
  title,
  body,
}: {
  accent: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="relative flex-1 overflow-hidden rounded-xl bg-white p-6"
      style={{
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
      }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: accent }}
      />
      <h4 className="mb-1 font-display text-[14px] font-semibold">{title}</h4>
      <p className="text-[13px] leading-[1.5] text-ink-400">{body}</p>
    </div>
  );
}
