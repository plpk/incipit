-- Incipit: initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once per project.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =====================================================================
-- research_profiles
--   The historian's stated research context. Informs all extraction and
--   connection-surfacing prompts. Usually one row per user for v1.
-- =====================================================================
create table if not exists research_profiles (
    id uuid primary key default gen_random_uuid(),
    research_description text not null,
    topic text,
    time_period text,
    countries text[] default '{}',
    goal_type text,            -- 'dissertation' | 'book' | 'course' | 'article' | 'other'
    audience text,
    ai_questions jsonb default '[]'::jsonb,  -- [{question, answer}]
    ai_summary text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =====================================================================
-- documents
--   One row per ingested primary source. Confidence scores are stored as
--   a jsonb map so we can version/extend without a migration.
-- =====================================================================
create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    research_profile_id uuid references research_profiles(id) on delete set null,

    -- filenames
    original_filename text not null,
    generated_filename text,

    -- storage
    file_url text not null,
    file_path text,         -- bucket path
    file_type text,         -- mime type
    file_size_bytes bigint,

    -- extracted metadata
    extracted_text text,
    publication_name text,
    publication_date text,  -- keep text; dates are often partial/uncertain
    title_subject text,
    author text,
    language text,

    -- AI output
    confidence_scores jsonb default '{}'::jsonb,  -- { field_name: 'high'|'medium'|'low'|'unable' }
    trust_tier text not null default 'T2',        -- T1 verified, T2 unconfirmed high-conf, T3 flagged

    -- provenance
    archive_name text,
    archive_location text,
    acquisition_method text,
    discovery_date date,
    catalog_reference text,

    -- side collection routing
    is_outside_research boolean not null default false,
    side_collection_name text,
    outside_research_reason text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists documents_research_profile_id_idx
    on documents (research_profile_id);
create index if not exists documents_created_at_idx
    on documents (created_at desc);
create index if not exists documents_trust_tier_idx
    on documents (trust_tier);

-- =====================================================================
-- document_changelog
--   Every field change is recorded. AI-generated vs historian-corrected.
-- =====================================================================
create table if not exists document_changelog (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    field_changed text not null,
    old_value text,
    new_value text,
    change_source text not null,   -- 'ai_extraction' | 'historian_edit' | 'ai_rename'
    changed_at timestamptz not null default now()
);

create index if not exists document_changelog_document_id_idx
    on document_changelog (document_id, changed_at desc);

-- =====================================================================
-- entities + document_entities
--   Normalised people / places / organisations for cross-document linking.
-- =====================================================================
create table if not exists entities (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    entity_type text not null,  -- 'person' | 'place' | 'organization' | 'other'
    created_at timestamptz not null default now(),
    unique (name, entity_type)
);

create table if not exists document_entities (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references documents(id) on delete cascade,
    entity_id uuid not null references entities(id) on delete cascade,
    confidence text,             -- 'high' | 'medium' | 'low'
    context_snippet text,
    created_at timestamptz not null default now(),
    unique (document_id, entity_id)
);

create index if not exists document_entities_document_id_idx
    on document_entities (document_id);
create index if not exists document_entities_entity_id_idx
    on document_entities (entity_id);

-- =====================================================================
-- research_notes
--   Plain-language notes from the historian. If is_standing_query = true,
--   the note should be checked against every subsequent document upload.
-- =====================================================================
create table if not exists research_notes (
    id uuid primary key default gen_random_uuid(),
    document_id uuid references documents(id) on delete set null,
    research_profile_id uuid references research_profiles(id) on delete set null,
    note_text text not null,
    is_standing_query boolean not null default true,
    created_at timestamptz not null default now()
);

create index if not exists research_notes_standing_idx
    on research_notes (is_standing_query) where is_standing_query = true;

-- =====================================================================
-- connections
--   Surfaced cross-document links. AI-proposed, optionally confirmed.
-- =====================================================================
create table if not exists connections (
    id uuid primary key default gen_random_uuid(),
    source_document_id uuid not null references documents(id) on delete cascade,
    target_document_id uuid not null references documents(id) on delete cascade,
    connection_type text,             -- 'entity' | 'theme' | 'date' | 'note_match'
    description text,
    matched_by text,                   -- e.g. 'entity:Vasconcelos' or 'note:<uuid>'
    created_at timestamptz not null default now(),
    check (source_document_id <> target_document_id)
);

create index if not exists connections_source_idx on connections (source_document_id);
create index if not exists connections_target_idx on connections (target_document_id);

-- =====================================================================
-- updated_at triggers
-- =====================================================================
create or replace function touch_updated_at() returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists t_research_profiles_updated_at on research_profiles;
create trigger t_research_profiles_updated_at
    before update on research_profiles
    for each row execute function touch_updated_at();

drop trigger if exists t_documents_updated_at on documents;
create trigger t_documents_updated_at
    before update on documents
    for each row execute function touch_updated_at();

-- =====================================================================
-- storage bucket
--   Run separately in Supabase dashboard or via the storage API if this
--   does not succeed (it requires the service role).
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;
