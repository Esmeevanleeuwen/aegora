begin;

create table if not exists public.aegora_topics (
  id text primary key,
  label text not null unique,
  description text not null default '',
  position integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aegora_roles (
  id text primary key,
  label text not null unique,
  description text not null default '',
  icon text not null default 'users',
  position integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aegora_situations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  topic_id text references public.aegora_topics(id) on update cascade on delete set null,
  label text not null,
  description text not null default '',
  position integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aegora_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  publisher text not null,
  url text not null unique check (url ~* '^https://'),
  source_type text not null default 'official_webpage'
    check (source_type in ('legislation', 'official_webpage', 'case_law', 'regulator', 'guidance')),
  jurisdiction text not null default 'NL',
  status text not null default 'active' check (status in ('pending', 'active', 'outdated', 'archived')),
  published_at date,
  last_checked_at timestamptz,
  next_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aegora_rights (
  id text primary key,
  topic_id text not null references public.aegora_topics(id) on update cascade on delete restrict,
  title text not null,
  summary text not null,
  rule_type text not null check (rule_type in ('recht', 'plicht', 'bevoegdheid', 'grens')),
  applies_when text not null,
  boundary text not null,
  next_step text,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  position integer not null default 0,
  version integer not null default 1 check (version > 0),
  effective_from date,
  effective_until date,
  source_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (effective_until is null or effective_from is null or effective_until >= effective_from)
);

create table if not exists public.aegora_right_roles (
  right_id text not null references public.aegora_rights(id) on update cascade on delete cascade,
  role_id text not null references public.aegora_roles(id) on update cascade on delete cascade,
  primary key (right_id, role_id)
);

create table if not exists public.aegora_right_situations (
  right_id text not null references public.aegora_rights(id) on update cascade on delete cascade,
  situation_id uuid not null references public.aegora_situations(id) on delete cascade,
  primary key (right_id, situation_id)
);

create table if not exists public.aegora_right_sources (
  right_id text not null references public.aegora_rights(id) on update cascade on delete cascade,
  source_id uuid not null references public.aegora_sources(id) on delete restrict,
  source_role text not null default 'primary' check (source_role in ('primary', 'supporting', 'exception')),
  notes text,
  primary key (right_id, source_id)
);

create table if not exists public.aegora_source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.aegora_sources(id) on delete cascade,
  checked_at timestamptz not null default now(),
  content_hash text,
  change_status text not null default 'unchanged'
    check (change_status in ('first_check', 'unchanged', 'changed', 'unreachable', 'manual_review')),
  change_summary text,
  response_metadata jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  unique (source_id, checked_at)
);

create table if not exists public.aegora_right_versions (
  id uuid primary key default gen_random_uuid(),
  right_id text not null references public.aegora_rights(id) on update cascade on delete cascade,
  version integer not null check (version > 0),
  snapshot jsonb not null,
  change_note text,
  published_at timestamptz not null default now(),
  unique (right_id, version)
);

create index if not exists aegora_rights_public_topic_idx
  on public.aegora_rights (status, topic_id, position);
create index if not exists aegora_rights_topic_idx
  on public.aegora_rights (topic_id);
create index if not exists aegora_right_roles_role_idx
  on public.aegora_right_roles (role_id, right_id);
create index if not exists aegora_right_situations_situation_idx
  on public.aegora_right_situations (situation_id);
create index if not exists aegora_right_sources_source_idx
  on public.aegora_right_sources (source_id);
create index if not exists aegora_situations_topic_idx
  on public.aegora_situations (topic_id);
create index if not exists aegora_sources_check_idx
  on public.aegora_sources (status, next_check_at);
create index if not exists aegora_source_versions_source_idx
  on public.aegora_source_versions (source_id, checked_at desc);

create or replace function public.aegora_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.aegora_set_updated_at() from public, anon, authenticated;

drop trigger if exists aegora_topics_updated_at on public.aegora_topics;
create trigger aegora_topics_updated_at before update on public.aegora_topics
for each row execute function public.aegora_set_updated_at();
drop trigger if exists aegora_roles_updated_at on public.aegora_roles;
create trigger aegora_roles_updated_at before update on public.aegora_roles
for each row execute function public.aegora_set_updated_at();
drop trigger if exists aegora_situations_updated_at on public.aegora_situations;
create trigger aegora_situations_updated_at before update on public.aegora_situations
for each row execute function public.aegora_set_updated_at();
drop trigger if exists aegora_sources_updated_at on public.aegora_sources;
create trigger aegora_sources_updated_at before update on public.aegora_sources
for each row execute function public.aegora_set_updated_at();
drop trigger if exists aegora_rights_updated_at on public.aegora_rights;
create trigger aegora_rights_updated_at before update on public.aegora_rights
for each row execute function public.aegora_set_updated_at();

insert into public.aegora_topics (id, label, description, position)
values
  ('algemeen', 'Algemeen', 'Grondrechten, privacy en gelijke behandeling.', 10),
  ('zorg', 'Zorg', 'Behandeling, dossier, beroep en klachten.', 20),
  ('werk', 'Werk', 'Arbeidsvoorwaarden, veiligheid en professionele verantwoordelijkheid.', 30),
  ('wonen', 'Wonen', 'Huur, onderhoud en huurbescherming.', 40),
  ('veiligheid', 'Veiligheid', 'Politietaken, bevoegdheden en bescherming.', 50),
  ('kinderen', 'Kinderen', 'Rechten, toestemming en vertegenwoordiging van minderjarigen.', 60)
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  position = excluded.position,
  is_public = true;

insert into public.aegora_roles (id, label, description, icon, position)
values
  ('iedereen', 'Iedereen', 'Grondrechten en bescherming die niet van een beroep afhangen.', 'users', 10),
  ('client', 'Cliënt of patiënt', 'Behandeling, dossier, toestemming, privacy en klachten.', 'heart', 20),
  ('psycholoog', 'Psycholoog', 'Beroepsgeheim, professionele grenzen, veiligheid en tuchtrecht.', 'brain', 30),
  ('zorgmedewerker', 'Zorgmedewerker', 'Veilig werken, bekwaamheid, beroepsgeheim en verantwoordelijkheid.', 'stethoscope', 40),
  ('politieagent', 'Politieagent', 'Politietaak, bevoegdheden, grenzen en arbeidsveiligheid.', 'badge', 50),
  ('werknemer', 'Werknemer', 'Contract, loon, vakantie, veiligheid en gelijke behandeling.', 'briefcase', 60),
  ('huurder', 'Huurder', 'Huurcontract, onderhoud, servicekosten en huurbescherming.', 'home', 70),
  ('ouder', 'Ouder of voogd', 'Beslissen, informatie en vertegenwoordiging van een kind.', 'family', 80)
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  icon = excluded.icon,
  position = excluded.position,
  is_public = true;

insert into public.aegora_situations (slug, label, description, position)
values
  ('besluit-of-contract', 'Er is een besluit of contract', 'Een schriftelijke afspraak of formeel besluit bepaalt mogelijk de route.', 10),
  ('informatie-gedeeld', 'Er is informatie gedeeld', 'Privacy, toestemming of beroepsgeheim kan relevant zijn.', 20),
  ('lopende-termijn', 'Er loopt een termijn', 'Een bezwaar-, reactie- of opzegtermijn kan gevolgen hebben.', 30),
  ('klacht-of-geschil', 'Er is een klacht of geschil', 'De juiste klachten- of bezwaarroute moet worden bepaald.', 40),
  ('acuut-gevaar', 'Er is direct gevaar', 'Veiligheid en directe menselijke hulp gaan voor op algemene uitleg.', 50)
on conflict (slug) do update set
  label = excluded.label,
  description = excluded.description,
  position = excluded.position,
  is_public = true;

create temporary table aegora_seed_rules on commit drop as
select
  id,
  roles,
  topic,
  type,
  title,
  summary,
  "appliesWhen" as applies_when,
  boundary,
  "sourceTitle" as source_title,
  "sourceUrl" as source_url
from jsonb_to_recordset($aegora_rules$
[
  {"id":"gelijke-behandeling","roles":["iedereen"],"topic":"Algemeen","type":"recht","title":"Gelijke behandeling","summary":"Iedereen in Nederland moet in gelijke gevallen gelijk worden behandeld.","appliesWhen":"Bij contact met overheid, werk, onderwijs en veel vormen van dienstverlening.","boundary":"Niet ieder verschil is discriminatie. Het verschil moet samenhangen met een beschermde grond en mag niet wettelijk gerechtvaardigd zijn.","sourceTitle":"College voor de Rechten van de Mens","sourceUrl":"https://www.mensenrechten.nl/mensenrechten-voor-jou/discriminatie-en-gelijke-behandeling/wat-zegt-de-wet-over-discriminatie-en-gelijke-behandeling"},
  {"id":"vrijheid-meningsuiting","roles":["iedereen"],"topic":"Algemeen","type":"recht","title":"Vrijheid van meningsuiting","summary":"Je mag informatie en ideeën ontvangen, delen en bekritiseren, ook wanneer een mening schuurt.","appliesWhen":"Mondeling, schriftelijk, tijdens demonstraties en online.","boundary":"Bedreiging, smaad, opruiing en aanzetten tot haat, geweld of discriminatie kunnen strafbaar zijn.","sourceTitle":"Rijksoverheid — vrijheid van meningsuiting","sourceUrl":"https://www.rijksoverheid.nl/themas/overheid-en-democratie/media-en-publieke-omroep/persvrijheid-bewaken"},
  {"id":"privacy","roles":["iedereen"],"topic":"Algemeen","type":"recht","title":"Privacy en bescherming van gegevens","summary":"Persoonsgegevens mogen niet zonder doel, grondslag en passende bescherming worden gebruikt.","appliesWhen":"Wanneer een organisatie gegevens over jou verzamelt, bewaart, gebruikt of deelt.","boundary":"Een organisatie kan gegevens soms zonder toestemming verwerken als daarvoor een andere geldige wettelijke grondslag bestaat.","sourceTitle":"Autoriteit Persoonsgegevens — basis AVG","sourceUrl":"https://www.autoriteitpersoonsgegevens.nl/themas/basis-avg/avg-algemeen"},
  {"id":"patient-informatie-keuze","roles":["client"],"topic":"Zorg","type":"recht","title":"Informatie, overleg en zelf beslissen","summary":"Je hebt recht op begrijpelijke informatie, overleg en de mogelijkheid een behandeling te weigeren.","appliesWhen":"Bij een medische behandeling of behandelvoorstel.","boundary":"Leeftijd, vertegenwoordiging, wilsbekwaamheid en verplichte zorg kunnen de beslisroute veranderen.","sourceTitle":"Rijksoverheid — rechten bij behandeling","sourceUrl":"https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/rechten-bij-een-medische-behandeling/rechten-en-plichten-bij-medische-behandeling"},
  {"id":"patient-dossier","roles":["client"],"topic":"Zorg","type":"recht","title":"Inzage en kopie van je dossier","summary":"Je mag je medisch dossier inzien, een kopie vragen en feitelijke fouten laten aanpassen.","appliesWhen":"Voor medische gegevens die over jouzelf zijn vastgelegd.","boundary":"Informatie die de privacy van een ander schaadt kan worden afgeschermd. De zorgverlener moet dit kunnen uitleggen.","sourceTitle":"Rijksoverheid — rechten bij behandeling","sourceUrl":"https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/rechten-bij-een-medische-behandeling/rechten-en-plichten-bij-medische-behandeling"},
  {"id":"patient-klacht","roles":["client"],"topic":"Zorg","type":"recht","title":"Klacht en klachtenfunctionaris","summary":"Je kunt een klacht bespreken en gratis ondersteuning vragen van de klachtenfunctionaris van de zorgaanbieder.","appliesWhen":"Als je ontevreden bent over zorg, informatie, bejegening of de afhandeling van een probleem.","boundary":"De juiste vervolgroute verschilt per zorgvorm en kan via een geschilleninstantie of het tuchtrecht lopen.","sourceTitle":"Rijksoverheid — klachten over zorg","sourceUrl":"https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/kwaliteit-van-de-zorg/wet-kwaliteit-klachten-en-geschillen-zorg"},
  {"id":"beroepsgeheim-zorg","roles":["psycholoog","zorgmedewerker"],"topic":"Zorg","type":"plicht","title":"Beroepsgeheim en vertrouwelijkheid","summary":"Informatie over een cliënt hoort vertrouwelijk te blijven en mag niet zomaar worden gedeeld.","appliesWhen":"Bij informatie die je door je behandel- of zorgrelatie over een cliënt kent.","boundary":"Een uitzondering vereist een concrete grond en zorgvuldige afweging. Alleen algemene zorgen noemen is niet genoeg.","sourceTitle":"Tuchtcolleges — beroepsgeheim in de ggz","sourceUrl":"https://www.tuchtcollege-gezondheidszorg.nl/actueel/nieuws/2026/07/24/vier-van-de-zes-klachten-over-schending-beroepsgeheim-in-ggz-instelling-gegrond"},
  {"id":"veilig-werken-zorg","roles":["psycholoog","zorgmedewerker","politieagent","werknemer"],"topic":"Werk","type":"recht","title":"Veilige en gezonde werkplek","summary":"Je werkgever moet maatregelen nemen tegen onveilig werk, agressie, geweld en andere arbeidsrisico’s.","appliesWhen":"Tijdens je werk, ook bij contact met cliënten, patiënten of burgers.","boundary":"Je hebt ook een eigen verantwoordelijkheid om instructies en beschermingsmaatregelen te gebruiken en risico’s te melden.","sourceTitle":"Arboportaal — rechten en plichten werkenden","sourceUrl":"https://www.arboportaal.nl/onderwerpen/rechten-plichten-werkenden/algemene-rechten--plichten-van-werkenden"},
  {"id":"psycholoog-titel-tucht","roles":["psycholoog"],"topic":"Zorg","type":"grens","title":"Titel, registratie en tuchtrecht","summary":"Niet iedere psycholoog heeft dezelfde wettelijke registratie of valt onder dezelfde tuchtrechtelijke route.","appliesWhen":"Onder meer bij de beschermde titel gezondheidszorgpsycholoog en andere BIG-geregistreerde beroepen.","boundary":"Controleer altijd de precieze beroepstitel en registratie voordat je bevoegdheden of een klachtprocedure bepaalt.","sourceTitle":"BIG-register — zorgberoepen en registratie","sourceUrl":"https://www.bigregister.nl/over-het-big-register/voor-zorgconsumenten"},
  {"id":"zorg-tucht-verweer","roles":["psycholoog","zorgmedewerker"],"topic":"Zorg","type":"recht","title":"Verweer voeren bij een tuchtklacht","summary":"Een beklaagde BIG-zorgverlener ontvangt de klacht en kan zelf of met ondersteuning schriftelijk verweer voeren.","appliesWhen":"Wanneer tegen jou een klacht is ingediend bij een Regionaal Tuchtcollege.","boundary":"Deze procedure geldt alleen voor zorgverleners en handelingen die onder het wettelijk tuchtrecht vallen.","sourceTitle":"Tuchtcolleges — ik ben beklaagde","sourceUrl":"https://www.tuchtcollege-gezondheidszorg.nl/ik-ben-beklaagde"},
  {"id":"zorg-bevoegd-bekwaam","roles":["zorgmedewerker"],"topic":"Zorg","type":"grens","title":"Bevoegd én bekwaam handelen","summary":"Voor voorbehouden handelingen zijn bevoegdheid, bekwaamheid en zo nodig opdracht, toezicht en tussenkomst nodig.","appliesWhen":"Wanneer je een voorbehouden medische handeling uitvoert of laat uitvoeren.","boundary":"Een functie of opdracht alleen maakt iemand niet automatisch bekwaam. Handel niet wanneer de noodzakelijke kennis of vaardigheid ontbreekt.","sourceTitle":"BIG-register — bevoegd en bekwaam","sourceUrl":"https://www.bigregister.nl/herregistratie/vragen-en-antwoorden"},
  {"id":"politie-taak","roles":["politieagent"],"topic":"Veiligheid","type":"plicht","title":"Beschermen, begrenzen en hulp verlenen","summary":"De politie handhaaft de rechtsorde en verleent hulp aan mensen die deze nodig hebben.","appliesWhen":"Binnen de wettelijke politietaak en onder gezag van de bevoegde autoriteit.","boundary":"De brede politietaak is geen onbeperkte bevoegdheid en garandeert niet in iedere situatie een bepaalde uitkomst.","sourceTitle":"Politie — kerntaken","sourceUrl":"https://www.politie.nl/informatie/kerntaken-politie.html"},
  {"id":"politie-bevoegdheden","roles":["politieagent"],"topic":"Veiligheid","type":"bevoegdheid","title":"Wettelijke politiebevoegdheden","summary":"Agenten kunnen onder voorwaarden onder meer identiteit controleren, staandehouden, aanhouden en geweld gebruiken.","appliesWhen":"Alleen wanneer een specifieke wettelijke bevoegdheid op de concrete situatie van toepassing is.","boundary":"Noodzaak, proportionaliteit, subsidiariteit, instructies en verslaglegging begrenzen het gebruik van bevoegdheden.","sourceTitle":"Politie — bevoegdheden","sourceUrl":"https://www.politie.nl/informatie/bevoegdheden-van-de-politie.html"},
  {"id":"arbeidscontract-basis","roles":["werknemer","psycholoog","zorgmedewerker","politieagent"],"topic":"Werk","type":"recht","title":"Contract, loon, werktijd en vakantie","summary":"Werkenden worden beschermd door regels over onder meer loon, vakantie, werktijden, rust en ontslag.","appliesWhen":"Wanneer je werkt op basis van een arbeidsovereenkomst; cao-regels kunnen aanvullend gelden.","boundary":"De precieze rechten hangen af van contractvorm, cao, sector en omstandigheden zoals ziekte of verlof.","sourceTitle":"Rijksoverheid — regels arbeidsovereenkomst","sourceUrl":"https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/waaraan-moet-mijn-werkgever-zich-houden-bij-een-arbeidsovereenkomst"},
  {"id":"huurder-contract","roles":["huurder"],"topic":"Wonen","type":"recht","title":"Schriftelijk huurcontract en goed verhuurderschap","summary":"Een verhuurder moet een schriftelijke huurovereenkomst opstellen en informeren over rechten en plichten.","appliesWhen":"Bij verhuur van woonruimte in Nederland.","boundary":"Welke huurprijs- en procedurebescherming geldt, hangt onder meer af van het soort woning en contract.","sourceTitle":"Rijksoverheid — rechten en plichten huurder","sourceUrl":"https://www.rijksoverheid.nl/vraag-en-antwoord/woning-huren/welke-rechten-en-plichten-heb-ik-als-huurder"},
  {"id":"huurder-onderhoud","roles":["huurder"],"topic":"Wonen","type":"recht","title":"Groot onderhoud door verhuurder","summary":"Groot onderhoud is in beginsel voor de verhuurder; klein dagelijks onderhoud meestal voor de huurder.","appliesWhen":"Bij gebreken of noodzakelijk onderhoud aan een huurwoning.","boundary":"Meld gebreken schriftelijk en volg de juiste route voordat je kosten inhoudt of zelf werkzaamheden laat uitvoeren.","sourceTitle":"Rijksoverheid — onderhoud huurwoning","sourceUrl":"https://www.rijksoverheid.nl/vraag-en-antwoord/woning-huren/welke-kosten-zijn-voor-de-huurder-en-welke-voor-de-verhuurder"},
  {"id":"huurder-opzegging","roles":["huurder"],"topic":"Wonen","type":"recht","title":"Bescherming tegen zomaar opzeggen","summary":"Een verhuurder mag de huur niet zonder geldige reden beëindigen.","appliesWhen":"Wanneer de verhuurder een woonhuurovereenkomst wil opzeggen.","boundary":"Bij bijvoorbeeld ernstige huurachterstand of ander tekortschieten kan beëindiging wel mogelijk zijn; bezwaar en rechterlijke toetsing kunnen een rol spelen.","sourceTitle":"Rijksoverheid — verhuurder zegt huur op","sourceUrl":"https://www.rijksoverheid.nl/vraag-en-antwoord/woning-huren/verhuurder-zegt-huur-op-woning"},
  {"id":"ouder-medisch-dossier-kind","roles":["ouder"],"topic":"Kinderen","type":"recht","title":"Medisch dossier van een minderjarig kind","summary":"Inzage en toestemming veranderen met de leeftijd van het kind.","appliesWhen":"Bij medische behandeling van een kind jonger dan 18 jaar.","boundary":"Tot 12 jaar beslissen ouders; tussen 12 en 16 meestal samen; vanaf 16 beslist het kind in beginsel zelf en is ouderlijke inzage niet automatisch toegestaan.","sourceTitle":"Rijksoverheid — dossier minderjarig kind","sourceUrl":"https://www.rijksoverheid.nl/themas/familie-zorg-en-gezondheid/rechten-van-patient-en-privacy/jongeren-en-het-medisch-dossier/medisch-dossier-minderjarige-kind-inzien"}
]
$aegora_rules$::jsonb) as item(
  id text,
  roles jsonb,
  topic text,
  type text,
  title text,
  summary text,
  "appliesWhen" text,
  boundary text,
  "sourceTitle" text,
  "sourceUrl" text
);

insert into public.aegora_sources (
  title, publisher, url, source_type, status, last_checked_at, next_check_at
)
select distinct on (source_url)
  source_title,
  case
    when source_url like '%rijksoverheid.nl%' then 'Rijksoverheid'
    when source_url like '%politie.nl%' then 'Politie'
    when source_url like '%bigregister.nl%' then 'BIG-register'
    when source_url like '%tuchtcollege-gezondheidszorg.nl%' then 'Tuchtcolleges voor de Gezondheidszorg'
    when source_url like '%autoriteitpersoonsgegevens.nl%' then 'Autoriteit Persoonsgegevens'
    when source_url like '%mensenrechten.nl%' then 'College voor de Rechten van de Mens'
    when source_url like '%arboportaal.nl%' then 'Arboportaal'
    else 'Officiële Nederlandse bron'
  end,
  source_url,
  case
    when source_url like '%autoriteitpersoonsgegevens.nl%' or source_url like '%mensenrechten.nl%' then 'regulator'
    else 'official_webpage'
  end,
  'active',
  '2026-08-30 00:00:00+00'::timestamptz,
  '2026-09-30 00:00:00+00'::timestamptz
from aegora_seed_rules
order by source_url, source_title
on conflict (url) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_type = excluded.source_type,
  status = 'active',
  last_checked_at = excluded.last_checked_at,
  next_check_at = excluded.next_check_at;

insert into public.aegora_rights (
  id, topic_id, title, summary, rule_type, applies_when, boundary,
  status, position, version, source_checked_at
)
select
  id,
  case topic
    when 'Algemeen' then 'algemeen'
    when 'Zorg' then 'zorg'
    when 'Werk' then 'werk'
    when 'Wonen' then 'wonen'
    when 'Veiligheid' then 'veiligheid'
    when 'Kinderen' then 'kinderen'
  end,
  title,
  summary,
  type,
  applies_when,
  boundary,
  'published',
  row_number() over (order by id)::integer * 10,
  1,
  '2026-08-30 00:00:00+00'::timestamptz
from aegora_seed_rules
on conflict (id) do update set
  topic_id = excluded.topic_id,
  title = excluded.title,
  summary = excluded.summary,
  rule_type = excluded.rule_type,
  applies_when = excluded.applies_when,
  boundary = excluded.boundary,
  status = 'published',
  source_checked_at = excluded.source_checked_at;

insert into public.aegora_right_roles (right_id, role_id)
select rule.id, role.value
from aegora_seed_rules rule
cross join lateral jsonb_array_elements_text(rule.roles) as role(value)
on conflict (right_id, role_id) do nothing;

insert into public.aegora_right_sources (right_id, source_id, source_role)
select rule.id, source.id, 'primary'
from aegora_seed_rules rule
join public.aegora_sources source on source.url = rule.source_url
on conflict (right_id, source_id) do update set source_role = excluded.source_role;

insert into public.aegora_source_versions (
  source_id, checked_at, change_status, change_summary, response_metadata, reviewed_at
)
select
  source.id,
  '2026-08-30 00:00:00+00'::timestamptz,
  'first_check',
  'Eerste gecontroleerde bronversie voor de Aegora-rechtenbibliotheek.',
  jsonb_build_object('seed', true, 'jurisdiction', 'NL'),
  '2026-08-30 00:00:00+00'::timestamptz
from public.aegora_sources source
where exists (
  select 1 from public.aegora_right_sources link where link.source_id = source.id
)
on conflict (source_id, checked_at) do nothing;

insert into public.aegora_right_versions (right_id, version, snapshot, change_note)
select
  right_item.id,
  right_item.version,
  jsonb_build_object(
    'topic_id', right_item.topic_id,
    'title', right_item.title,
    'summary', right_item.summary,
    'rule_type', right_item.rule_type,
    'applies_when', right_item.applies_when,
    'boundary', right_item.boundary,
    'status', right_item.status,
    'source_checked_at', right_item.source_checked_at
  ),
  'Eerste gepubliceerde versie.'
from public.aegora_rights right_item
on conflict (right_id, version) do nothing;

alter table public.aegora_topics enable row level security;
alter table public.aegora_roles enable row level security;
alter table public.aegora_situations enable row level security;
alter table public.aegora_sources enable row level security;
alter table public.aegora_rights enable row level security;
alter table public.aegora_right_roles enable row level security;
alter table public.aegora_right_situations enable row level security;
alter table public.aegora_right_sources enable row level security;
alter table public.aegora_source_versions enable row level security;
alter table public.aegora_right_versions enable row level security;

drop policy if exists "aegora public topics" on public.aegora_topics;
create policy "aegora public topics" on public.aegora_topics
for select to anon, authenticated using (is_public = true);
drop policy if exists "aegora public roles" on public.aegora_roles;
create policy "aegora public roles" on public.aegora_roles
for select to anon, authenticated using (is_public = true);
drop policy if exists "aegora public situations" on public.aegora_situations;
create policy "aegora public situations" on public.aegora_situations
for select to anon, authenticated using (is_public = true);
drop policy if exists "aegora active sources" on public.aegora_sources;
create policy "aegora active sources" on public.aegora_sources
for select to anon, authenticated using (status = 'active');
drop policy if exists "aegora published rights" on public.aegora_rights;
create policy "aegora published rights" on public.aegora_rights
for select to anon, authenticated using (
  status = 'published'
  and (effective_from is null or effective_from <= current_date)
  and (effective_until is null or effective_until >= current_date)
);
drop policy if exists "aegora public right roles" on public.aegora_right_roles;
create policy "aegora public right roles" on public.aegora_right_roles
for select to anon, authenticated using (
  exists (select 1 from public.aegora_rights r where r.id = right_id and r.status = 'published')
);
drop policy if exists "aegora public right situations" on public.aegora_right_situations;
create policy "aegora public right situations" on public.aegora_right_situations
for select to anon, authenticated using (
  exists (select 1 from public.aegora_rights r where r.id = right_id and r.status = 'published')
);
drop policy if exists "aegora public right sources" on public.aegora_right_sources;
create policy "aegora public right sources" on public.aegora_right_sources
for select to anon, authenticated using (
  exists (select 1 from public.aegora_rights r where r.id = right_id and r.status = 'published')
);
drop policy if exists "aegora source history service only" on public.aegora_source_versions;
create policy "aegora source history service only" on public.aegora_source_versions
for all to service_role using (true) with check (true);
drop policy if exists "aegora right history service only" on public.aegora_right_versions;
create policy "aegora right history service only" on public.aegora_right_versions
for all to service_role using (true) with check (true);

revoke all on table
  public.aegora_topics,
  public.aegora_roles,
  public.aegora_situations,
  public.aegora_sources,
  public.aegora_rights,
  public.aegora_right_roles,
  public.aegora_right_situations,
  public.aegora_right_sources,
  public.aegora_source_versions,
  public.aegora_right_versions
from anon, authenticated;

grant select on table
  public.aegora_topics,
  public.aegora_roles,
  public.aegora_situations,
  public.aegora_sources,
  public.aegora_rights,
  public.aegora_right_roles,
  public.aegora_right_situations,
  public.aegora_right_sources
to anon, authenticated;

grant all on table
  public.aegora_topics,
  public.aegora_roles,
  public.aegora_situations,
  public.aegora_sources,
  public.aegora_rights,
  public.aegora_right_roles,
  public.aegora_right_situations,
  public.aegora_right_sources,
  public.aegora_source_versions,
  public.aegora_right_versions
to service_role;

create or replace view public.aegora_public_rights
with (security_invoker = true)
as
select
  right_item.id,
  right_item.title,
  right_item.summary,
  right_item.rule_type,
  right_item.applies_when,
  right_item.boundary,
  right_item.next_step,
  right_item.position,
  right_item.version,
  right_item.source_checked_at,
  topic.id as topic_id,
  topic.label as topic_label,
  coalesce((
    select array_agg(role_link.role_id order by role_item.position)
    from public.aegora_right_roles role_link
    join public.aegora_roles role_item on role_item.id = role_link.role_id
    where role_link.right_id = right_item.id
  ), array[]::text[]) as roles,
  primary_source.title as source_title,
  primary_source.url as source_url,
  primary_source.publisher as source_publisher,
  primary_source.last_checked_at as source_last_checked_at
from public.aegora_rights right_item
join public.aegora_topics topic on topic.id = right_item.topic_id
left join lateral (
  select source.title, source.url, source.publisher, source.last_checked_at
  from public.aegora_right_sources source_link
  join public.aegora_sources source on source.id = source_link.source_id
  where source_link.right_id = right_item.id
  order by case source_link.source_role when 'primary' then 0 else 1 end, source.title
  limit 1
) primary_source on true
where right_item.status = 'published'
  and topic.is_public = true
  and (right_item.effective_from is null or right_item.effective_from <= current_date)
  and (right_item.effective_until is null or right_item.effective_until >= current_date);

revoke all on public.aegora_public_rights from public, anon, authenticated;
grant select on public.aegora_public_rights to anon, authenticated, service_role;

comment on view public.aegora_public_rights is
  'Read-only public projection of published Aegora rights. Internal source and version history stays private.';

commit;
