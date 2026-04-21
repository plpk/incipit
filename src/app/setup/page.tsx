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
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-3xl font-semibold text-ink-900">
        Incipit needs a few minutes of setup.
      </h1>
      <p className="mt-4 text-ink-600">
        Welcome. Before you can start uploading documents, two services need to
        be wired up. Once they're in place this screen goes away.
      </p>

      <section className="mt-10 space-y-6">
        <div className="card p-6">
          <h2 className="font-serif text-xl font-semibold">1. Supabase</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-700">
            <li>Create a new project at supabase.com.</li>
            <li>
              Open the SQL editor and run{" "}
              <code className="rounded bg-parchment-100 px-1 py-0.5 text-xs">
                supabase/migrations/0001_initial_schema.sql
              </code>{" "}
              from this repo.
            </li>
            <li>
              Storage → create a public bucket named{" "}
              <code className="rounded bg-parchment-100 px-1 py-0.5 text-xs">
                documents
              </code>{" "}
              (the migration does this automatically if you have permission).
            </li>
            <li>Copy the Project URL, anon key, and service role key.</li>
          </ol>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-xl font-semibold">2. Anthropic API key</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-700">
            <li>Visit console.anthropic.com and create an API key.</li>
            <li>Opus 4.7 must be enabled on the workspace.</li>
          </ol>
        </div>

        <div className="card p-6">
          <h2 className="font-serif text-xl font-semibold">3. Environment variables</h2>
          <p className="mt-2 text-sm text-ink-700">
            Add these to{" "}
            <code className="rounded bg-parchment-100 px-1 py-0.5 text-xs">
              .env.local
            </code>{" "}
            (or to your Vercel project settings):
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-ink-900 p-4 text-xs text-parchment-100">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...`}
          </pre>
          {missing.length > 0 && (
            <p className="mt-4 text-sm text-accent-700">
              Currently missing: <span className="font-medium">{missing.join(", ")}</span>
            </p>
          )}
          <p className="mt-4 text-sm text-ink-600">
            After these are set, reload this page.
          </p>
        </div>
      </section>
    </main>
  );
}
