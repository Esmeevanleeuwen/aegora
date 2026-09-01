begin;

create index if not exists aegora_source_chunks_source_idx
  on public.aegora_source_chunks (source_id);

commit;
