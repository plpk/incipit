import { PageShell } from "@/components/PageShell";
import { SearchClient } from "./SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <PageShell>
      <header>
        <h1
          className="font-display font-extrabold text-ink-900"
          style={{
            fontSize: 36,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Search
        </h1>
        <p className="mt-3 text-ink-500" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Natural-language search across every document in your archive.
        </p>
      </header>
      <div className="mt-10">
        <SearchClient />
      </div>
    </PageShell>
  );
}
