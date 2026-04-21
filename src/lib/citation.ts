import type { DocumentRow } from "@/lib/types";

// Produce a Chicago/Turabian-style note citation from confirmed metadata.
// Fields known to be uncertain are bracketed, never guessed. If we don't
// have enough to produce a real citation we return a stub the historian
// can complete by hand.
export function chicagoCitation(doc: DocumentRow): string {
  const c = doc.confidence_scores ?? {};
  const mark = (field: keyof DocumentRow, rendered: string): string => {
    if (doc.trust_tier === "T1") return rendered;
    const conf = c[field as string];
    if (conf === "low" || conf === "unable") return `[${rendered}?]`;
    return rendered;
  };

  const author = doc.author ? mark("author", doc.author) : null;
  const title = doc.title_subject ? `"${mark("title_subject", doc.title_subject)}"` : null;
  const publication = doc.publication_name ? mark("publication_name", doc.publication_name) : null;
  const date = doc.publication_date ? mark("publication_date", doc.publication_date) : null;

  const archiveBits = [doc.archive_name, doc.archive_location].filter(Boolean).join(", ");
  const catalog = doc.catalog_reference ? `, ${doc.catalog_reference}` : "";

  const lead = [author, title].filter(Boolean).join(", ");
  const middle = [publication, date].filter(Boolean).join(", ");
  const tail = archiveBits ? ` ${archiveBits}${catalog}.` : catalog ? `${catalog}.` : "";

  const parts = [lead, middle].filter(Boolean).join(", ");
  if (!parts && !tail) return "[Incomplete citation — confirm metadata before citing.]";
  return `${parts}.${tail}`.replace(/\s+/g, " ").trim();
}
