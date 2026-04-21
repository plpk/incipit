import { SearchClient } from "./SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink-900">Search</h1>
      <p className="mt-2 text-ink-500">
        Natural-language search across every document in your archive.
      </p>
      <div className="mt-8">
        <SearchClient />
      </div>
    </div>
  );
}
