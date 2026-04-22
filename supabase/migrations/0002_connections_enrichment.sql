-- Incipit: enrich the connections table for cross-document analysis
-- (Features 10 + 11 — Opus 4.7 structured connection / standing-query output).

alter table connections
    add column if not exists strength text,
    add column if not exists linked_entities jsonb not null default '[]'::jsonb,
    add column if not exists matched_note_id uuid references research_notes(id) on delete set null,
    add column if not exists ai_generated boolean not null default true;

-- Strength values: 'strong' | 'medium'. Kept nullable for legacy rows.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'connections_strength_check'
    ) then
        alter table connections
            add constraint connections_strength_check
            check (strength is null or strength in ('strong', 'medium'));
    end if;
end$$;

-- connection_type values used by the analysis pipeline: 'direct' | 'thematic' | 'argumentative'.
-- Legacy values remain valid (older rows may use 'entity' | 'theme' | etc.).

-- Prevent duplicate surfaced connections per (source, target, type).
create unique index if not exists connections_source_target_type_uniq
    on connections (source_document_id, target_document_id, connection_type);

create index if not exists connections_matched_note_idx
    on connections (matched_note_id)
    where matched_note_id is not null;
