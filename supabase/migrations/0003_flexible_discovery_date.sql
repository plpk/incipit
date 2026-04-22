-- Incipit: loosen discovery_date to text so historians can record partial or
-- free-form dates ("April 2026", "Spring 2024", "2026-04-21"). Mirrors the
-- publication_date convention established in 0001 — archival dates are often
-- uncertain, and rejecting them at the column level is user-hostile.

alter table documents
    alter column discovery_date type text
    using discovery_date::text;
