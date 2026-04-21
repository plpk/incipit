import { slugify } from "@/lib/utils";
import type { DocumentRow } from "@/lib/types";

// Convention: YYYY-MM-DD_publication_author_title.ext
// Missing pieces are dropped rather than replaced with placeholders.
export function generateFilename(
  doc: Pick<
    DocumentRow,
    "publication_date" | "publication_name" | "author" | "title_subject" | "original_filename"
  >,
): string {
  const parts: string[] = [];

  const date = normalizeDate(doc.publication_date);
  if (date) parts.push(date);

  if (doc.publication_name) parts.push(slugify(doc.publication_name));
  if (doc.author) parts.push(slugify(doc.author));
  if (doc.title_subject) parts.push(slugify(doc.title_subject));

  const ext = extractExtension(doc.original_filename) || "pdf";
  if (parts.length === 0) {
    return doc.original_filename;
  }
  return `${parts.join("_")}.${ext}`;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const iso = value.match(/\d{4}(-\d{2})?(-\d{2})?/);
  if (iso) return iso[0];
  const yearOnly = value.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
  if (yearOnly) return yearOnly[0];
  return null;
}

function extractExtension(filename: string): string | null {
  const m = filename.match(/\.([a-z0-9]{1,6})$/i);
  return m ? m[1].toLowerCase() : null;
}
