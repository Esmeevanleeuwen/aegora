begin;

create extension if not exists vector with schema extensions;

create table if not exists public.aegora_legal_routes (
  id text primary key,
  label text not null,
  description text not null,
  domain text not null default 'zorg',
  keywords text[] not null default array[]::text[],
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aegora_route_questions (
  id text primary key,
  route_id text not null references public.aegora_legal_routes(id) on update cascade on delete cascade,
  question text not null,
  why_it_matters text not null,
  options text[] not null default array[]::text[],
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aegora_source_chunks (
  id uuid primary key default gen_random_uuid(),
  chunk_key text not null unique,
  source_id uuid not null references public.aegora_sources(id) on delete restrict,
  route_id text not null references public.aegora_legal_routes(id) on update cascade on delete restrict,
  heading text not null,
  source_locator text not null,
  content text not null,
  position integer not null default 0,
  status text not null default 'active' check (status in ('review', 'active', 'outdated', 'archived')),
  effective_from date,
  effective_until date,
  checked_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  search_document tsvector generated always as (
    to_tsvector('simple', coalesce(heading, '') || ' ' || coalesce(source_locator, '') || ' ' || coalesce(content, ''))
  ) stored,
  embedding extensions.vector(512),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_until is null or effective_from is null or effective_until >= effective_from)
);

create index if not exists aegora_source_chunks_route_idx
  on public.aegora_source_chunks (route_id, status, position);
create index if not exists aegora_source_chunks_search_idx
  on public.aegora_source_chunks using gin (search_document);
create index if not exists aegora_source_chunks_embedding_idx
  on public.aegora_source_chunks using hnsw (embedding vector_cosine_ops)
  where embedding is not null;
create index if not exists aegora_route_questions_route_idx
  on public.aegora_route_questions (route_id, is_active, position);

drop trigger if exists aegora_legal_routes_updated_at on public.aegora_legal_routes;
create trigger aegora_legal_routes_updated_at before update on public.aegora_legal_routes
for each row execute function public.aegora_set_updated_at();
drop trigger if exists aegora_route_questions_updated_at on public.aegora_route_questions;
create trigger aegora_route_questions_updated_at before update on public.aegora_route_questions
for each row execute function public.aegora_set_updated_at();
drop trigger if exists aegora_source_chunks_updated_at on public.aegora_source_chunks;
create trigger aegora_source_chunks_updated_at before update on public.aegora_source_chunks
for each row execute function public.aegora_set_updated_at();

insert into public.aegora_legal_routes (id, label, description, keywords, position)
values
  ('ggz-confidentiality', 'Beroepsgeheim en informatie delen', 'Wanneer en hoeveel informatie een psycholoog of andere behandelaar mag delen.', array['psycholoog', 'beroepsgeheim', 'informatie delen', 'toestemming', 'crisisdienst'], 10),
  ('ggz-compulsory-care', 'Verplichte zorg en medicatie', 'Of zorg tegen iemands wil mag worden toegepast en op welke formele grond.', array['verplichte zorg', 'medicatie', 'dwang', 'zorgmachtiging', 'weigeren'], 20),
  ('ggz-crisis-procedure', 'Crisismaatregel en spoed', 'De spoedprocedure, beslissers en tijdelijke verplichte zorg bij een crisis.', array['crisisdienst', 'crisismaatregel', 'burgemeester', 'spoed', 'ernstig nadeel'], 30),
  ('ggz-complaint-support', 'Klacht, PVP en tijdelijke stop', 'Onafhankelijke ondersteuning en klachtenmogelijkheden bij verplichte zorg.', array['klacht', 'pvp', 'patiëntenvertrouwenspersoon', 'schorsing', 'tijdelijke stop'], 40)
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  keywords = excluded.keywords,
  position = excluded.position,
  is_active = true;

insert into public.aegora_route_questions (id, route_id, question, why_it_matters, options, position)
values
  ('ggz-formal-basis', 'ggz-compulsory-care', 'Welke formele maatregel is genoemd of aan je gegeven?', 'Zonder crisismaatregel of zorgmachtiging is niet duidelijk op welke grond de zorg verplicht zou zijn.', array['Crisismaatregel', 'Zorgmachtiging', 'Alleen een behandelafspraak of waarschuwing', 'Ik weet het niet'], 10),
  ('ggz-medication-status', 'ggz-compulsory-care', 'Wat gebeurt er op dit moment met de medicatie?', 'Een behandeladvies, druk om akkoord te gaan en feitelijke toediening tegen je wil zijn juridisch verschillende situaties.', array['Alleen voorgesteld', 'Ik heb onder druk ingestemd', 'Wordt tegen mijn wil toegediend', 'Ik weet het niet'], 20),
  ('ggz-written-decision', 'ggz-crisis-procedure', 'Heb je een schriftelijke beslissing of beschikking ontvangen?', 'Het document laat zien wie heeft beslist, welke vorm van verplichte zorg is toegestaan en welke route of termijn geldt.', array['Ja', 'Nee', 'Ik weet het niet'], 10),
  ('ggz-shared-information', 'ggz-confidentiality', 'Weet je welke informatie met de crisisdienst is gedeeld?', 'De noodzaak en omvang van de gedeelde informatie zijn belangrijk voor de beoordeling van het beroepsgeheim.', array['Ja, precies', 'Alleen gedeeltelijk', 'Nee'], 10),
  ('ggz-danger-reason', 'ggz-confidentiality', 'Welke concrete reden voor direct gevaar of ernstig nadeel is aan je uitgelegd?', 'Een algemene zorg is niet hetzelfde als een concreet en direct risico dat doorbreking of verplichte zorg kan dragen.', array['Er is een concrete reden genoemd', 'Er is alleen algemene zorg genoemd', 'Er is niets uitgelegd', 'Ik weet het niet'], 20)
on conflict (id) do update set
  route_id = excluded.route_id,
  question = excluded.question,
  why_it_matters = excluded.why_it_matters,
  options = excluded.options,
  position = excluded.position,
  is_active = true;

insert into public.aegora_sources (
  title, publisher, url, source_type, status, last_checked_at, next_check_at
)
values
  ('NIP Beroepscode voor psychologen 2024', 'Nederlands Instituut van Psychologen', 'https://nip.nl/wp-content/uploads/pdfs/NIP_beroepscode_maart_2024_def.pdf', 'guidance', 'active', '2026-09-01 00:00:00+00', '2026-10-01 00:00:00+00'),
  ('Wet verplichte geestelijke gezondheidszorg', 'Informatiepunt Dwang in de zorg', 'https://www.dwangindezorg.nl/wvggz', 'official_webpage', 'active', '2026-09-01 00:00:00+00', '2026-10-01 00:00:00+00'),
  ('Crisismaatregel binnen de Wvggz', 'Informatiepunt Dwang in de zorg', 'https://www.dwangindezorg.nl/wvggz/crisismaatregel', 'official_webpage', 'active', '2026-09-01 00:00:00+00', '2026-10-01 00:00:00+00'),
  ('Klachtrecht binnen de Wvggz', 'Informatiepunt Dwang in de zorg', 'https://www.dwangindezorg.nl/wvggz/patientenrecht/klachtrecht', 'official_webpage', 'active', '2026-09-01 00:00:00+00', '2026-10-01 00:00:00+00')
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_type = excluded.source_type,
  status = 'active',
  last_checked_at = excluded.last_checked_at,
  next_check_at = excluded.next_check_at;

with chunk_seed (chunk_key, source_url, route_id, heading, source_locator, content, position) as (
  values
    ('nip-confidentiality-main', 'https://nip.nl/wp-content/uploads/pdfs/NIP_beroepscode_maart_2024_def.pdf', 'ggz-confidentiality', 'Hoofdregel: vertrouwelijkheid', 'Artikel 70', 'Een psycholoog bewaart geheimhouding over wat door de professionele relatie bekend is. Voor het delen van cliëntinformatie is in beginsel gerichte toestemming of een andere geldige grond nodig.', 10),
    ('nip-conflict-of-duties', 'https://nip.nl/wp-content/uploads/pdfs/NIP_beroepscode_maart_2024_def.pdf', 'ggz-confidentiality', 'Doorbreken bij een conflict van plichten', 'Artikelen 74 tot en met 76', 'Doorbreking van het beroepsgeheim kan alleen na een zorgvuldige afweging, wanneer dit de enige of laatste manier is om direct gevaar te voorkomen. De cliënt wordt zo mogelijk geïnformeerd en er wordt niet meer gedeeld dan noodzakelijk.', 20),
    ('nip-direct-care-team', 'https://nip.nl/wp-content/uploads/pdfs/NIP_beroepscode_maart_2024_def.pdf', 'ggz-confidentiality', 'Delen met rechtstreeks betrokken professionals', 'Artikel 82', 'Met professionals die rechtstreeks bij dezelfde opdracht of behandeling zijn betrokken kan noodzakelijke informatie onder voorwaarden worden gedeeld. De cliënt wordt daar vooraf over geïnformeerd en de informatie blijft beperkt tot wat nodig is.', 30),
    ('wvggz-decision-required', 'https://www.dwangindezorg.nl/wvggz', 'ggz-compulsory-care', 'Verplichte zorg vraagt een formele grond', 'Overzicht Wvggz', 'Verplichte zorg wordt niet enkel door een behandelaar of crisisdienst opgelegd. Daarvoor is een zorgmachtiging van de rechter of een crisismaatregel van de burgemeester nodig, behoudens strikt begrensde tijdelijke zorg tijdens de voorbereiding van een crisismaatregel.', 10),
    ('wvggz-substantive-criteria', 'https://www.dwangindezorg.nl/wvggz', 'ggz-compulsory-care', 'Voorwaarden voor verplichte zorg', 'Uitgangspunten Wvggz', 'Verplichte zorg is pas aan de orde als er door een psychische stoornis ernstig nadeel dreigt, vrijwillige zorg niet mogelijk is en de maatregel evenredig, naar verwachting effectief en zo weinig ingrijpend mogelijk is.', 20),
    ('wvggz-medication-scope', 'https://www.dwangindezorg.nl/wvggz', 'ggz-compulsory-care', 'Medicatie als vorm van verplichte zorg', 'Vormen van verplichte zorg', 'Medicatie kan een vorm van verplichte zorg zijn, maar alleen binnen de toepasselijke formele maatregel en de daarin toegestane zorg. Een behandeladvies of druk om in te stemmen is niet automatisch dezelfde juridische situatie als feitelijke gedwongen toediening.', 30),
    ('wvggz-crisis-decision', 'https://www.dwangindezorg.nl/wvggz/crisismaatregel', 'ggz-crisis-procedure', 'Wie beslist over een crisismaatregel', 'Besluit en medische verklaring', 'Bij acuut dreigend ernstig nadeel kan de burgemeester een crisismaatregel nemen. Daarvoor onderzoekt een onafhankelijke psychiater de betrokkene en stelt deze een medische verklaring op.', 10),
    ('wvggz-crisis-temporary-care', 'https://www.dwangindezorg.nl/wvggz/crisismaatregel', 'ggz-crisis-procedure', 'Tijdelijke verplichte zorg vóór het besluit', 'Voorafgaand aan de crisismaatregel', 'In spoed kan tijdens de voorbereiding tijdelijk verplichte zorg worden toegepast. Die mogelijkheid is kort en wettelijk begrensd; daarna moet er een formeel besluit of een andere geldige grond zijn.', 20),
    ('wvggz-complaint-pvp', 'https://www.dwangindezorg.nl/wvggz/patientenrecht/klachtrecht', 'ggz-complaint-support', 'Klacht en ondersteuning door een PVP', 'Klachtrecht', 'Een cliënt kan over beslissingen rond verplichte zorg klagen bij een onafhankelijke klachtencommissie en gratis hulp vragen aan een patiëntenvertrouwenspersoon (PVP).', 10),
    ('wvggz-complaint-suspension', 'https://www.dwangindezorg.nl/wvggz/patientenrecht/klachtrecht', 'ggz-complaint-support', 'Klacht stopt zorg niet automatisch', 'Schorsingsverzoek', 'Een klacht stopt de verplichte zorg niet vanzelf. Bij de klachtencommissie kan wel worden gevraagd de bestreden beslissing tijdelijk te schorsen terwijl de klacht wordt behandeld.', 20)
)
insert into public.aegora_source_chunks (
  chunk_key, source_id, route_id, heading, source_locator, content, position, status, checked_at, metadata
)
select
  seed.chunk_key,
  source.id,
  seed.route_id,
  seed.heading,
  seed.source_locator,
  seed.content,
  seed.position,
  'active',
  '2026-09-01 00:00:00+00'::timestamptz,
  jsonb_build_object('language', 'nl', 'review_method', 'manual_official_source')
from chunk_seed as seed
join public.aegora_sources as source on source.url = seed.source_url
on conflict (chunk_key) do update set
  source_id = excluded.source_id,
  route_id = excluded.route_id,
  heading = excluded.heading,
  source_locator = excluded.source_locator,
  content = excluded.content,
  position = excluded.position,
  status = 'active',
  checked_at = excluded.checked_at,
  metadata = excluded.metadata;

insert into public.aegora_rights (
  id, topic_id, title, summary, rule_type, applies_when, boundary, practical_note,
  next_step, status, position, version, source_checked_at
)
values
  ('wvggz-verplichte-zorg', 'zorg', 'Voorwaarden voor verplichte zorg', 'Zorg tegen je wil vereist een wettelijke route en inhoudelijke noodzaak.', 'grens', 'Wanneer een zorgverlener zegt dat behandeling of medicatie verplicht is.', 'Een advies, ernstige bezorgdheid of contact met de crisisdienst is op zichzelf nog geen crisismaatregel of zorgmachtiging.', 'Controleer eerst welke formele maatregel geldt en welke specifieke zorg daarin staat.', 'Vraag om de schriftelijke beslissing, de medische uitleg en contact met een PVP.', 'published', 235, 1, '2026-09-01 00:00:00+00'),
  ('wvggz-crisismaatregel', 'zorg', 'Rechten bij een crisismaatregel', 'Een crisismaatregel is een formeel spoedbesluit met onderzoek, voorwaarden en rechtsbescherming.', 'recht', 'Bij acuut dreigend ernstig nadeel en een voorgenomen of genomen crisismaatregel.', 'Een bezoek of telefoontje van de crisisdienst betekent niet automatisch dat al een crisismaatregel bestaat.', 'De schriftelijke beschikking en medische verklaring bepalen wat er is besloten.', 'Vraag welke maatregel geldt, wie heeft beslist en om een kopie van de beschikking.', 'published', 245, 1, '2026-09-01 00:00:00+00'),
  ('wvggz-klacht-pvp', 'zorg', 'PVP en klacht bij verplichte zorg', 'Je kunt gratis ondersteuning krijgen en over bepaalde beslissingen rond verplichte zorg klagen.', 'recht', 'Wanneer je te maken hebt met verplichte zorg of een besluit daarover.', 'Een klacht schorst de zorg niet automatisch; daarvoor kan een afzonderlijk tijdelijk schorsingsverzoek nodig zijn.', 'Een PVP staat onafhankelijk van de zorgaanbieder en kan helpen de juiste klacht en stukken te bepalen.', 'Neem contact op met de PVP en bewaar de beschikking, het zorgplan en de medicatiebeslissing.', 'published', 255, 1, '2026-09-01 00:00:00+00')
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  rule_type = excluded.rule_type,
  applies_when = excluded.applies_when,
  boundary = excluded.boundary,
  practical_note = excluded.practical_note,
  next_step = excluded.next_step,
  status = 'published',
  position = excluded.position,
  version = greatest(aegora_rights.version, excluded.version),
  source_checked_at = excluded.source_checked_at;

insert into public.aegora_right_roles (right_id, role_id)
values
  ('beroepsgeheim-zorg', 'client'),
  ('wvggz-verplichte-zorg', 'client'),
  ('wvggz-crisismaatregel', 'client'),
  ('wvggz-klacht-pvp', 'client')
on conflict (right_id, role_id) do nothing;

with right_source_seed (right_id, source_url, source_role) as (
  values
    ('beroepsgeheim-zorg', 'https://nip.nl/wp-content/uploads/pdfs/NIP_beroepscode_maart_2024_def.pdf', 'supporting'),
    ('wvggz-verplichte-zorg', 'https://www.dwangindezorg.nl/wvggz', 'primary'),
    ('wvggz-crisismaatregel', 'https://www.dwangindezorg.nl/wvggz/crisismaatregel', 'primary'),
    ('wvggz-klacht-pvp', 'https://www.dwangindezorg.nl/wvggz/patientenrecht/klachtrecht', 'primary')
)
insert into public.aegora_right_sources (right_id, source_id, source_role)
select seed.right_id, source.id, seed.source_role
from right_source_seed as seed
join public.aegora_sources as source on source.url = seed.source_url
on conflict (right_id, source_id) do update set source_role = excluded.source_role;

with right_situation_seed (right_id, situation_slug) as (
  values
    ('wvggz-verplichte-zorg', 'besluit-of-contract'),
    ('wvggz-verplichte-zorg', 'klacht-of-geschil'),
    ('wvggz-verplichte-zorg', 'acuut-gevaar'),
    ('wvggz-crisismaatregel', 'besluit-of-contract'),
    ('wvggz-crisismaatregel', 'acuut-gevaar'),
    ('wvggz-klacht-pvp', 'klacht-of-geschil'),
    ('wvggz-klacht-pvp', 'lopende-termijn')
)
insert into public.aegora_right_situations (right_id, situation_id)
select seed.right_id, situation.id
from right_situation_seed as seed
join public.aegora_situations as situation on situation.slug = seed.situation_slug
on conflict (right_id, situation_id) do nothing;

insert into public.aegora_source_versions (
  source_id, checked_at, change_status, change_summary, response_metadata, reviewed_at
)
select
  source.id,
  '2026-09-01 00:00:00+00'::timestamptz,
  'first_check',
  'Handmatig gecontroleerd en opgedeeld in bronpassages voor de GGZ-vraagroute.',
  jsonb_build_object('grounded_answering', true, 'language', 'nl'),
  '2026-09-01 00:00:00+00'::timestamptz
from public.aegora_sources as source
where source.url in (
  'https://nip.nl/wp-content/uploads/pdfs/NIP_beroepscode_maart_2024_def.pdf',
  'https://www.dwangindezorg.nl/wvggz',
  'https://www.dwangindezorg.nl/wvggz/crisismaatregel',
  'https://www.dwangindezorg.nl/wvggz/patientenrecht/klachtrecht'
)
on conflict (source_id, checked_at) do nothing;

alter table public.aegora_legal_routes enable row level security;
alter table public.aegora_route_questions enable row level security;
alter table public.aegora_source_chunks enable row level security;

drop policy if exists "aegora active legal routes" on public.aegora_legal_routes;
create policy "aegora active legal routes" on public.aegora_legal_routes
for select to anon, authenticated using (is_active = true);

drop policy if exists "aegora active route questions" on public.aegora_route_questions;
create policy "aegora active route questions" on public.aegora_route_questions
for select to anon, authenticated using (
  is_active = true
  and exists (
    select 1 from public.aegora_legal_routes as route
    where route.id = route_id and route.is_active = true
  )
);

drop policy if exists "aegora active source chunks" on public.aegora_source_chunks;
create policy "aegora active source chunks" on public.aegora_source_chunks
for select to anon, authenticated using (
  status = 'active'
  and (effective_from is null or effective_from <= current_date)
  and (effective_until is null or effective_until >= current_date)
  and exists (
    select 1 from public.aegora_sources as source
    where source.id = source_id and source.status = 'active'
  )
);

revoke all on table
  public.aegora_legal_routes,
  public.aegora_route_questions,
  public.aegora_source_chunks
from anon, authenticated;

grant select on table
  public.aegora_legal_routes,
  public.aegora_route_questions,
  public.aegora_source_chunks
to anon, authenticated;

grant all on table
  public.aegora_legal_routes,
  public.aegora_route_questions,
  public.aegora_source_chunks
to service_role;

create or replace function public.aegora_search_source_chunks(
  p_query text default '',
  p_route_ids text[] default null,
  p_limit integer default 12
)
returns table (
  chunk_key text,
  route_id text,
  route_label text,
  heading text,
  content text,
  source_locator text,
  source_title text,
  source_url text,
  source_publisher text,
  source_checked_at timestamptz,
  relevance real
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with search_params as (
    select case
      when nullif(btrim(p_query), '') is null then null
      else websearch_to_tsquery('simple', p_query)
    end as query
  )
  select
    chunk.chunk_key,
    chunk.route_id,
    route.label,
    chunk.heading,
    chunk.content,
    chunk.source_locator,
    source.title,
    source.url,
    source.publisher,
    chunk.checked_at,
    case
      when params.query is null then 0::real
      else ts_rank_cd(chunk.search_document, params.query)::real
    end as relevance
  from public.aegora_source_chunks as chunk
  join public.aegora_legal_routes as route on route.id = chunk.route_id
  join public.aegora_sources as source on source.id = chunk.source_id
  cross join search_params as params
  where chunk.status = 'active'
    and route.is_active = true
    and source.status = 'active'
    and (chunk.effective_from is null or chunk.effective_from <= current_date)
    and (chunk.effective_until is null or chunk.effective_until >= current_date)
    and (
      p_route_ids is null
      or cardinality(p_route_ids) = 0
      or chunk.route_id = any(p_route_ids)
    )
  order by
    case when params.query is not null and chunk.search_document @@ params.query then 0 else 1 end,
    route.position,
    relevance desc,
    chunk.position
  limit least(greatest(coalesce(p_limit, 12), 1), 20);
$$;

revoke all on function public.aegora_search_source_chunks(text, text[], integer) from public;
grant execute on function public.aegora_search_source_chunks(text, text[], integer)
to anon, authenticated, service_role;

comment on table public.aegora_source_chunks is
  'Reviewed source passages used as the only legal evidence supplied to source-grounded AI answers.';
comment on column public.aegora_source_chunks.embedding is
  'Optional 512-dimensional embedding for future hybrid retrieval; full-text and route retrieval work without it.';
comment on function public.aegora_search_source_chunks(text, text[], integer) is
  'RLS-protected retrieval of active source passages for selected Aegora legal routes.';

commit;
