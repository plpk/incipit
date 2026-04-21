export type ConfidenceLevel = "high" | "medium" | "low" | "unable";
export type TrustTier = "T1" | "T2" | "T3";

export type ExtractedField<T = string> = {
  value: T | null;
  confidence: ConfidenceLevel;
};

export type VisionExtraction = {
  publication_name: ExtractedField;
  publication_date: ExtractedField;
  title_subject: ExtractedField;
  author: ExtractedField;
  language: ExtractedField;
  extracted_text: ExtractedField;
  entities: Array<{
    name: string;
    entity_type: "person" | "place" | "organization" | "other";
    confidence: ConfidenceLevel;
    context_snippet?: string;
  }>;
  // Opus-inferred provenance from visible clues on the scan itself
  // (archive stamps, catalog numbers, microfilm IDs, ownership marks).
  // All fields nullable; older extractions without this block should
  // still deserialize.
  provenance_hints?: {
    archive_name?: ExtractedField;
    archive_location?: ExtractedField;
    catalog_reference?: ExtractedField;
    acquisition_method?: ExtractedField;
  };
  is_outside_research: boolean;
  outside_research_reason?: string;
  summary: string;
};

export type ResearchProfile = {
  id: string;
  research_description: string;
  topic: string | null;
  time_period: string | null;
  countries: string[] | null;
  goal_type: string | null;
  audience: string | null;
  ai_questions: Array<{ question: string; answer?: string }>;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  research_profile_id: string | null;
  original_filename: string;
  generated_filename: string | null;
  file_url: string;
  file_path: string | null;
  file_type: string | null;
  file_size_bytes: number | null;
  extracted_text: string | null;
  publication_name: string | null;
  publication_date: string | null;
  title_subject: string | null;
  author: string | null;
  language: string | null;
  confidence_scores: Record<string, ConfidenceLevel>;
  trust_tier: TrustTier;
  archive_name: string | null;
  archive_location: string | null;
  acquisition_method: string | null;
  discovery_date: string | null;
  catalog_reference: string | null;
  is_outside_research: boolean;
  side_collection_name: string | null;
  outside_research_reason: string | null;
  created_at: string;
  updated_at: string;
};
