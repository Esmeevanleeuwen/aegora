begin;

create table if not exists public.aegora_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  pronouns text,
  role_contexts text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aegora_profiles_display_name_length check (
    display_name is null or char_length(display_name) <= 120
  ),
  constraint aegora_profiles_pronouns_length check (
    pronouns is null or char_length(pronouns) <= 80
  )
);

create table if not exists public.aegora_dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'anders',
  status text not null default 'open',
  next_deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aegora_dossiers_title_length check (
    char_length(title) between 2 and 160
  ),
  constraint aegora_dossiers_description_length check (
    description is null or char_length(description) <= 5000
  ),
  constraint aegora_dossiers_category_check check (
    category in (
      'zorg',
      'werk',
      'wonen',
      'overheid',
      'politie_justitie',
      'onderwijs',
      'discriminatie',
      'contract',
      'anders'
    )
  ),
  constraint aegora_dossiers_status_check check (
    status in ('open', 'gepauzeerd', 'afgerond')
  )
);

create index if not exists aegora_dossiers_user_created_idx
  on public.aegora_dossiers (user_id, created_at desc);

create table if not exists public.aegora_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dossier_id uuid references public.aegora_dossiers(id) on delete cascade,
  title text not null,
  document_type text not null default 'overig',
  contract_party text,
  contract_start date,
  contract_end date,
  contract_status text not null default 'niet_van_toepassing',
  storage_path text not null unique,
  original_file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aegora_documents_title_length check (
    char_length(title) between 2 and 180
  ),
  constraint aegora_documents_file_name_length check (
    char_length(original_file_name) between 1 and 255
  ),
  constraint aegora_documents_type_check check (
    document_type in (
      'contract',
      'brief',
      'besluit',
      'bewijs',
      'zorgdocument',
      'overig'
    )
  ),
  constraint aegora_documents_contract_status_check check (
    contract_status in (
      'actief',
      'verloopt_binnenkort',
      'verlopen',
      'beeindigd',
      'niet_van_toepassing'
    )
  ),
  constraint aegora_documents_file_size_check check (
    size_bytes > 0 and size_bytes <= 10485760
  ),
  constraint aegora_documents_contract_dates_check check (
    contract_end is null or contract_start is null or contract_end >= contract_start
  )
);

create index if not exists aegora_documents_user_created_idx
  on public.aegora_documents (user_id, created_at desc);

create index if not exists aegora_documents_dossier_idx
  on public.aegora_documents (dossier_id)
  where dossier_id is not null;

create table if not exists public.aegora_saved_rights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  right_id text not null references public.aegora_rights(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  constraint aegora_saved_rights_unique unique (user_id, right_id),
  constraint aegora_saved_rights_note_length check (
    note is null or char_length(note) <= 1200
  )
);

alter table public.aegora_profiles enable row level security;
alter table public.aegora_profiles force row level security;
alter table public.aegora_dossiers enable row level security;
alter table public.aegora_dossiers force row level security;
alter table public.aegora_documents enable row level security;
alter table public.aegora_documents force row level security;
alter table public.aegora_saved_rights enable row level security;
alter table public.aegora_saved_rights force row level security;

revoke all on table public.aegora_profiles from anon;
revoke all on table public.aegora_dossiers from anon;
revoke all on table public.aegora_documents from anon;
revoke all on table public.aegora_saved_rights from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.aegora_profiles to authenticated;
grant select, insert, update, delete on table public.aegora_dossiers to authenticated;
grant select, insert, update, delete on table public.aegora_documents to authenticated;
grant select, insert, update, delete on table public.aegora_saved_rights to authenticated;

drop policy if exists "aegora_profiles_select_own" on public.aegora_profiles;
create policy "aegora_profiles_select_own"
  on public.aegora_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "aegora_profiles_insert_own" on public.aegora_profiles;
create policy "aegora_profiles_insert_own"
  on public.aegora_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "aegora_profiles_update_own" on public.aegora_profiles;
create policy "aegora_profiles_update_own"
  on public.aegora_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "aegora_profiles_delete_own" on public.aegora_profiles;
create policy "aegora_profiles_delete_own"
  on public.aegora_profiles
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "aegora_dossiers_select_own" on public.aegora_dossiers;
create policy "aegora_dossiers_select_own"
  on public.aegora_dossiers
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "aegora_dossiers_insert_own" on public.aegora_dossiers;
create policy "aegora_dossiers_insert_own"
  on public.aegora_dossiers
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "aegora_dossiers_update_own" on public.aegora_dossiers;
create policy "aegora_dossiers_update_own"
  on public.aegora_dossiers
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "aegora_dossiers_delete_own" on public.aegora_dossiers;
create policy "aegora_dossiers_delete_own"
  on public.aegora_dossiers
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "aegora_documents_select_own" on public.aegora_documents;
create policy "aegora_documents_select_own"
  on public.aegora_documents
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "aegora_documents_insert_own" on public.aegora_documents;
create policy "aegora_documents_insert_own"
  on public.aegora_documents
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and (
      dossier_id is null
      or exists (
        select 1
        from public.aegora_dossiers as dossier
        where dossier.id = aegora_documents.dossier_id
          and dossier.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "aegora_documents_update_own" on public.aegora_documents;
create policy "aegora_documents_update_own"
  on public.aegora_documents
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      dossier_id is null
      or exists (
        select 1
        from public.aegora_dossiers as dossier
        where dossier.id = aegora_documents.dossier_id
          and dossier.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "aegora_documents_delete_own" on public.aegora_documents;
create policy "aegora_documents_delete_own"
  on public.aegora_documents
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "aegora_saved_rights_select_own" on public.aegora_saved_rights;
create policy "aegora_saved_rights_select_own"
  on public.aegora_saved_rights
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "aegora_saved_rights_insert_own" on public.aegora_saved_rights;
create policy "aegora_saved_rights_insert_own"
  on public.aegora_saved_rights
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "aegora_saved_rights_update_own" on public.aegora_saved_rights;
create policy "aegora_saved_rights_update_own"
  on public.aegora_saved_rights
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "aegora_saved_rights_delete_own" on public.aegora_saved_rights;
create policy "aegora_saved_rights_delete_own"
  on public.aegora_saved_rights
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'aegora-private-documents',
  'aegora-private-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ]::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "aegora_storage_select_own" on storage.objects;
create policy "aegora_storage_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'aegora-private-documents'
    and (storage.foldername(name))[1] = ((select auth.uid())::text)
  );

drop policy if exists "aegora_storage_insert_own" on storage.objects;
create policy "aegora_storage_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'aegora-private-documents'
    and (storage.foldername(name))[1] = ((select auth.uid())::text)
  );

drop policy if exists "aegora_storage_update_own" on storage.objects;
create policy "aegora_storage_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'aegora-private-documents'
    and (storage.foldername(name))[1] = ((select auth.uid())::text)
  )
  with check (
    bucket_id = 'aegora-private-documents'
    and (storage.foldername(name))[1] = ((select auth.uid())::text)
  );

drop policy if exists "aegora_storage_delete_own" on storage.objects;
create policy "aegora_storage_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'aegora-private-documents'
    and (storage.foldername(name))[1] = ((select auth.uid())::text)
  );

commit;
