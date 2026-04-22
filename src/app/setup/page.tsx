import Link from "next/link";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  const missing = [
    !env.supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !env.supabaseAnonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    !env.supabaseServiceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    !env.anthropicKey && "ANTHROPIC_API_KEY",
  ].filter(Boolean);

  return (
    <main className="min-h-screen">
      <div
        className="mx-auto animate-fade-up"
        style={{ maxWidth: 720, padding: "64px 48px 96px" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-3"
          style={{ textDecoration: "none" }}
        >
          <span className="logo-tile">I</span>
          <span
            className="font-display font-bold text-ink-900"
            style={{ fontSize: 18, letterSpacing: "-0.03em" }}
          >
            Incipit
          </span>
        </Link>

        <h1
          className="mt-10 font-display font-extrabold text-ink-900"
          style={{
            fontSize: 36,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Incipit needs a few minutes of setup.
        </h1>
        <p
          className="mt-4 text-ink-600"
          style={{ fontSize: 16, lineHeight: 1.6 }}
        >
          Welcome. Before you can start uploading documents, two services need to be wired up. Once they&apos;re in place this screen goes away.
        </p>

        <section className="mt-10 flex flex-col gap-6">
          <div className="card" style={{ padding: "24px 28px" }}>
            <span className="section-label">Step 1</span>
            <h2
              className="mt-2 font-display font-bold text-ink-900"
              style={{ fontSize: 20, letterSpacing: "-0.02em" }}
            >
              Supabase
            </h2>
            <ol
              className="mt-4 list-decimal space-y-2 pl-5 text-ink-700"
              style={{ fontSize: 14, lineHeight: 1.6 }}
            >
              <li>Create a new project at supabase.com.</li>
              <li>
                Open the SQL editor and run{" "}
                <code className="mono-block" style={{ display: "inline-block", padding: "1px 8px", fontSize: 12 }}>
                  supabase/migrations/0001_initial_schema.sql
                </code>{" "}
                from this repo.
              </li>
              <li>
                Storage → create a public bucket named{" "}
                <code className="mono-block" style={{ display: "inline-block", padding: "1px 8px", fontSize: 12 }}>
                  documents
                </code>{" "}
                (the migration does this automatically if you have permission).
              </li>
              <li>Copy the Project URL, anon key, and service role key.</li>
            </ol>
          </div>

          <div className="card" style={{ padding: "24px 28px" }}>
            <span className="section-label">Step 2</span>
            <h2
              className="mt-2 font-display font-bold text-ink-900"
              style={{ fontSize: 20, letterSpacing: "-0.02em" }}
            >
              Anthropic API key
            </h2>
            <ol
              className="mt-4 list-decimal space-y-2 pl-5 text-ink-700"
              style={{ fontSize: 14, lineHeight: 1.6 }}
            >
              <li>Visit console.anthropic.com and create an API key.</li>
              <li>Opus 4.7 must be enabled on the workspace.</li>
            </ol>
          </div>

          <div className="card" style={{ padding: "24px 28px" }}>
            <span className="section-label">Step 3</span>
            <h2
              className="mt-2 font-display font-bold text-ink-900"
              style={{ fontSize: 20, letterSpacing: "-0.02em" }}
            >
              Environment variables
            </h2>
            <p
              className="mt-3 text-ink-700"
              style={{ fontSize: 14, lineHeight: 1.6 }}
            >
              Add these to{" "}
              <code className="mono-block" style={{ display: "inline-block", padding: "1px 8px", fontSize: 12 }}>
                .env.local
              </code>{" "}
              (or to your Vercel project settings):
            </p>
            <pre
              className="mt-4 overflow-x-auto rounded-input p-4 font-mono"
              style={{
                background: "#1a1a2e",
                color: "#f4f4f5",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...`}
            </pre>
            {missing.length > 0 && (
              <p
                className="mt-4"
                style={{ fontSize: 13, color: "#dc2626" }}
              >
                Currently missing:{" "}
                <span className="font-semibold">{missing.join(", ")}</span>
              </p>
            )}
            <p
              className="mt-4 text-ink-500"
              style={{ fontSize: 13 }}
            >
              After these are set, reload this page.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
