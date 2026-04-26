-- Incipit: multi-user support
--
-- WHAT THIS MIGRATION DOES
-- 1. Wipes all existing document / entity / connection / note / changelog data.
--    (The schema was single-user up to this point; there is no safe way to
--    retroactively attribute legacy rows to a user, so we start fresh.)
-- 2. Creates a `profiles` table keyed to `auth.users`.
-- 3. Adds `user_id` to every user-scoped table.
-- 4. Enables Row Level Security and adds "own-rows only" policies on each.
-- 5. Sets up an `on_auth_user_created` trigger that provisions a profile row
--    the first time a new auth user appears.
--
-- This file is intentionally NOT idempotent with respect to data: the
-- truncate block at the top is destructive and will run every time the
-- migration is applied. Review carefully before running in production.

-- =====================================================================
-- 0. Wipe existing data (pre-multi-user rows cannot be safely migrated)
-- =====================================================================
truncate table
    connections,
    research_notes,
    document_entities,
    entities,
    document_changelog,
    documents,
    research_profiles
restart identity cascade;

-- Note: the `documents` storage bucket must be cleared separately via the
-- Storage API. Supabase blocks `delete from storage.objects` at the DB
-- layer to prevent orphaned files — run scripts/clear-documents-bucket.mjs
-- (or use the dashboard) before this migration.

-- =====================================================================
-- 1. profiles
-- =====================================================================
create table if not exists profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text,
    full_name text,
    avatar_url text,
    marketing_opt_in boolean not null default false,
    document_count integer not null default 0,
    document_limit integer not null default 10,
    onboarding_completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on profiles (email);

drop trigger if exists t_profiles_updated_at on profiles;
create trigger t_profiles_updated_at
    before update on profiles
    for each row execute function touch_updated_at();

-- Auto-provision a profile row whenever a new auth user is created.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name, avatar_url)
    values (
        new.id,
        new.email,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name'
        ),
        new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_auth_user();

-- =====================================================================
-- 2. Add user_id to every user-scoped table
-- =====================================================================

alter table research_profiles
    add column if not exists user_id uuid references profiles (id) on delete cascade;
alter table research_profiles
    alter column user_id set not null;
create index if not exists research_profiles_user_id_idx
    on research_profiles (user_id);

alter table documents
    add column if not exists user_id uuid references profiles (id) on delete cascade;
alter table documents
    alter column user_id set not null;
create index if not exists documents_user_id_idx on documents (user_id);

alter table document_changelog
    add column if not exists user_id uuid references profiles (id) on delete cascade;
alter table document_changelog
    alter column user_id set not null;
create index if not exists document_changelog_user_id_idx
    on document_changelog (user_id);

alter table entities
    add column if not exists user_id uuid references profiles (id) on delete cascade;
alter table entities
    alter column user_id set not null;
-- Swap the global (name, entity_type) uniqueness for a per-user one.
alter table entities drop constraint if exists entities_name_entity_type_key;
create unique index if not exists entities_user_name_type_uniq
    on entities (user_id, name, entity_type);
create index if not exists entities_user_id_idx on entities (user_id);

alter table document_entities
    add column if not exists user_id uuid references profiles (id) on delete cascade;
alter table document_entities
    alter column user_id set not null;
create index if not exists document_entities_user_id_idx
    on document_entities (user_id);

alter table research_notes
    add column if not exists user_id uuid references profiles (id) on delete cascade;
alter table research_notes
    alter column user_id set not null;
create index if not exists research_notes_user_id_idx
    on research_notes (user_id);

alter table connections
    add column if not exists user_id uuid references profiles (id) on delete cascade;
alter table connections
    alter column user_id set not null;
create index if not exists connections_user_id_idx on connections (user_id);

-- =====================================================================
-- 3. Row Level Security
--    Every user-scoped table gets four "own-rows-only" policies.
-- =====================================================================

-- --- profiles --------------------------------------------------------
alter table profiles enable row level security;

drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles
    for select using (id = auth.uid());

drop policy if exists profiles_insert_own on profiles;
create policy profiles_insert_own on profiles
    for insert with check (id = auth.uid());

drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles
    for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_delete_own on profiles;
create policy profiles_delete_own on profiles
    for delete using (id = auth.uid());

-- --- research_profiles ----------------------------------------------
alter table research_profiles enable row level security;

drop policy if exists research_profiles_select_own on research_profiles;
create policy research_profiles_select_own on research_profiles
    for select using (user_id = auth.uid());

drop policy if exists research_profiles_insert_own on research_profiles;
create policy research_profiles_insert_own on research_profiles
    for insert with check (user_id = auth.uid());

drop policy if exists research_profiles_update_own on research_profiles;
create policy research_profiles_update_own on research_profiles
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists research_profiles_delete_own on research_profiles;
create policy research_profiles_delete_own on research_profiles
    for delete using (user_id = auth.uid());

-- --- documents -------------------------------------------------------
alter table documents enable row level security;

drop policy if exists documents_select_own on documents;
create policy documents_select_own on documents
    for select using (user_id = auth.uid());

drop policy if exists documents_insert_own on documents;
create policy documents_insert_own on documents
    for insert with check (user_id = auth.uid());

drop policy if exists documents_update_own on documents;
create policy documents_update_own on documents
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists documents_delete_own on documents;
create policy documents_delete_own on documents
    for delete using (user_id = auth.uid());

-- --- document_changelog ---------------------------------------------
alter table document_changelog enable row level security;

drop policy if exists document_changelog_select_own on document_changelog;
create policy document_changelog_select_own on document_changelog
    for select using (user_id = auth.uid());

drop policy if exists document_changelog_insert_own on document_changelog;
create policy document_changelog_insert_own on document_changelog
    for insert with check (user_id = auth.uid());

drop policy if exists document_changelog_update_own on document_changelog;
create policy document_changelog_update_own on document_changelog
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists document_changelog_delete_own on document_changelog;
create policy document_changelog_delete_own on document_changelog
    for delete using (user_id = auth.uid());

-- --- entities --------------------------------------------------------
alter table entities enable row level security;

drop policy if exists entities_select_own on entities;
create policy entities_select_own on entities
    for select using (user_id = auth.uid());

drop policy if exists entities_insert_own on entities;
create policy entities_insert_own on entities
    for insert with check (user_id = auth.uid());

drop policy if exists entities_update_own on entities;
create policy entities_update_own on entities
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists entities_delete_own on entities;
create policy entities_delete_own on entities
    for delete using (user_id = auth.uid());

-- --- document_entities ----------------------------------------------
alter table document_entities enable row level security;

drop policy if exists document_entities_select_own on document_entities;
create policy document_entities_select_own on document_entities
    for select using (user_id = auth.uid());

drop policy if exists document_entities_insert_own on document_entities;
create policy document_entities_insert_own on document_entities
    for insert with check (user_id = auth.uid());

drop policy if exists document_entities_update_own on document_entities;
create policy document_entities_update_own on document_entities
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists document_entities_delete_own on document_entities;
create policy document_entities_delete_own on document_entities
    for delete using (user_id = auth.uid());

-- --- research_notes -------------------------------------------------
alter table research_notes enable row level security;

drop policy if exists research_notes_select_own on research_notes;
create policy research_notes_select_own on research_notes
    for select using (user_id = auth.uid());

drop policy if exists research_notes_insert_own on research_notes;
create policy research_notes_insert_own on research_notes
    for insert with check (user_id = auth.uid());

drop policy if exists research_notes_update_own on research_notes;
create policy research_notes_update_own on research_notes
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists research_notes_delete_own on research_notes;
create policy research_notes_delete_own on research_notes
    for delete using (user_id = auth.uid());

-- --- connections -----------------------------------------------------
alter table connections enable row level security;

drop policy if exists connections_select_own on connections;
create policy connections_select_own on connections
    for select using (user_id = auth.uid());

drop policy if exists connections_insert_own on connections;
create policy connections_insert_own on connections
    for insert with check (user_id = auth.uid());

drop policy if exists connections_update_own on connections;
create policy connections_update_own on connections
    for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists connections_delete_own on connections;
create policy connections_delete_own on connections
    for delete using (user_id = auth.uid());

-- =====================================================================
-- 4. Storage policies for the `documents` bucket live in a companion
--    migration: 0005_documents_bucket_policies.sql. Supabase restricts
--    `alter table storage.objects` to the storage_admin role, so the
--    storage-side work is isolated to keep this file re-runnable.
