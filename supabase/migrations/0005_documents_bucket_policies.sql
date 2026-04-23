-- Incipit: per-user RLS policies on the `documents` storage bucket.
--
-- RLS on storage.objects is already enabled by Supabase's default setup — do
-- not try to `alter table storage.objects enable row level security` here;
-- the postgres role is not the owner.
--
-- Each upload path must be prefixed with the owner's uuid (e.g.
-- "<user_id>/<filename>") so (storage.foldername(name))[1] resolves to
-- the user's id and scopes access correctly.

drop policy if exists documents_bucket_select_own on storage.objects;
create policy documents_bucket_select_own on storage.objects
    for select using (
        bucket_id = 'documents'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists documents_bucket_insert_own on storage.objects;
create policy documents_bucket_insert_own on storage.objects
    for insert with check (
        bucket_id = 'documents'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists documents_bucket_update_own on storage.objects;
create policy documents_bucket_update_own on storage.objects
    for update using (
        bucket_id = 'documents'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists documents_bucket_delete_own on storage.objects;
create policy documents_bucket_delete_own on storage.objects
    for delete using (
        bucket_id = 'documents'
        and (storage.foldername(name))[1] = auth.uid()::text
    );
