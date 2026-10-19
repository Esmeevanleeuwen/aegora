-- Public navigation metadata only. Legal rule text and sources remain in the
-- canonical rights catalog. Node IDs also cover basic rights and legacy catalog
-- items, so these text references deliberately do not point at aegora_rights.
begin;

create table public.aegora_right_links (
  id uuid primary key default gen_random_uuid(),
  source_id text not null check (char_length(btrim(source_id)) between 1 and 160),
  target_id text not null check (char_length(btrim(target_id)) between 1 and 160),
  relation text not null check (relation in ('related', 'context', 'procedure', 'protection')),
  label text not null check (char_length(btrim(label)) between 1 and 160),
  explanation text not null check (char_length(btrim(explanation)) between 1 and 2000),
  priority integer not null default 50 check (priority between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aegora_right_links_no_self_link check (source_id <> target_id)
);

-- Every relationship can be opened from either end. Store a pair once per type.
create unique index aegora_right_links_pair_relation_idx
  on public.aegora_right_links (least(source_id, target_id), greatest(source_id, target_id), relation);
create index aegora_right_links_source_published_idx
  on public.aegora_right_links (source_id, priority desc) where is_published;
create index aegora_right_links_target_published_idx
  on public.aegora_right_links (target_id, priority desc) where is_published;

create table public.aegora_right_combinations (
  id text primary key check (char_length(btrim(id)) between 1 and 160),
  slug text not null unique check (char_length(slug) <= 160 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  summary text not null check (char_length(btrim(summary)) between 1 and 2000),
  node_ids text[] not null check (cardinality(node_ids) between 2 and 12 and array_position(node_ids, null) is null),
  featured boolean not null default false,
  priority integer not null default 50 check (priority between 0 and 100),
  open_count bigint not null default 0 check (open_count between 0 and 9007199254740991),
  tags text[] not null default '{}' check (cardinality(tags) <= 12 and array_position(tags, null) is null),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index aegora_right_combinations_featured_published_idx
  on public.aegora_right_combinations (featured desc, priority desc, slug) where is_published;
create index aegora_right_combinations_nodes_published_idx
  on public.aegora_right_combinations using gin (node_ids) where is_published;

comment on table public.aegora_right_links is
  'Editorial navigation links between catalog rights; a link does not establish a legal conclusion or applicability.';
comment on table public.aegora_right_combinations is
  'Reusable editorial sets of canonical right IDs. Only published sets may be read by visitors.';
comment on column public.aegora_right_combinations.open_count is
  'Reserved aggregate count, starts at zero. No personal data and no browser write or increment endpoint.';

alter table public.aegora_right_links enable row level security;
alter table public.aegora_right_combinations enable row level security;

-- Visitors, including signed-in visitors, can only read published metadata.
-- Editorial writes stay with trusted SQL/migration administration.
revoke all on table public.aegora_right_links from public, anon, authenticated;
revoke all on table public.aegora_right_combinations from public, anon, authenticated;
grant select on table public.aegora_right_links to anon, authenticated;
grant select on table public.aegora_right_combinations to anon, authenticated;

create policy "Published rights links are public"
  on public.aegora_right_links for select to anon, authenticated
  using (is_published = true);
create policy "Published rights combinations are public"
  on public.aegora_right_combinations for select to anon, authenticated
  using (is_published = true);

-- Source-controlled navigation seeds are appended below.

-- Initial public reading routes mirror lib/rights-network-data.ts. All open
-- counts are zero. Later unpublished editorial rows are never read by the app.
insert into public.aegora_right_links (source_id, target_id, relation, label, explanation, priority, is_published)
values
  ('patient-informatie-keuze', 'patient-dossier', 'related', 'Van uitleg naar vastlegging', 'Lees naast informatie en beslissen ook wat in het dossier is vastgelegd. De voorwaarden van ieder onderdeel blijven afzonderlijk gelden.', 100, true),
  ('patient-informatie-keuze', 'patient-klacht', 'procedure', 'Uitleg of keuze betwisten', 'De klachtenroute is een vervolgartikel wanneer je vragen hebt over informatie, overleg of een behandelkeuze. Welke route past, vraagt eigen beoordeling.', 90, true),
  ('gelijke-behandeling', 'patient-informatie-keuze', 'context', 'Gelijke behandeling en zorg', 'Lees naast informatie en behandelkeuze ook het algemene kader van gelijke behandeling. Deze leesroute beoordeelt niet of een verschil in zorg verboden is.', 70, true),
  ('patient-dossier', 'patient-klacht', 'procedure', 'Dossier en klachtenroute', 'Deze leesroute brengt dossierinformatie en de uitleg over klachten samen. Een dossierstuk bewijst op zichzelf niet dat een klacht gegrond is.', 95, true),
  ('privacy', 'privacy-medische-gegevens', 'context', 'Privacy in de zorg', 'Ga van algemene gegevensbescherming naar de specifieke uitleg over medische gegevens. Controleer de grondslag en uitzonderingen per onderdeel.', 100, true),
  ('privacy-medische-gegevens', 'beroepsgeheim-zorg', 'protection', 'Gegevens en geheimhouding', 'Lees de bescherming van medische gegevens naast de professionele geheimhoudingsplicht. Dit zijn verschillende invalshoeken op het omgaan met informatie.', 100, true),
  ('privacy-medische-gegevens', 'patient-dossier', 'related', 'Welke informatie is vastgelegd?', 'Bij vragen over medische gegevens kan de uitleg over inzage helpen om het dossier te begrijpen. De verbinding geeft geen automatische toegang tot alle gegevens.', 95, true),
  ('privacy-medische-gegevens', 'patient-klacht', 'procedure', 'Een vraag over gegevens bespreken', 'Deze route verwijst van een privacyvraag naar de algemene uitleg over klachten in de zorg. De juiste privacy- of klachtenroute hangt van de situatie af.', 85, true),
  ('beroepsgeheim-zorg', 'patient-dossier', 'related', 'Vertrouwelijkheid en dossier', 'De dossieruitleg en geheimhoudingsplicht belichten dezelfde informatie vanuit patiënt en professional. Lees de grenzen van beide onderdelen apart.', 90, true),
  ('ouder-medisch-dossier-kind', 'patient-dossier', 'context', 'Leeftijd en dossierinzage', 'De algemene dossieruitleg krijgt een aparte context bij minderjarigen. Het artikel over kinderen beschrijft waarom leeftijd en gezag moeten worden gecontroleerd.', 100, true),
  ('ouder-medisch-dossier-kind', 'patient-informatie-keuze', 'context', 'Wie krijgt uitleg en beslist?', 'Lees de uitleg over informatie en keuze samen met de leeftijds- en gezagscontext bij een kind. De verbinding bepaalt niet wie in een concreet geval beslist.', 95, true),
  ('ouder-medisch-dossier-kind', 'privacy-medische-gegevens', 'protection', 'Privacy rond een kind', 'Deze leesroute combineert de uitleg over medische privacy met de specifieke voorwaarden voor een minderjarig kind.', 90, true),
  ('psycholoog-titel-tucht', 'zorg-bevoegd-bekwaam', 'context', 'Registratie en handelen', 'Beroepstitel, registratie en de voorwaarden voor een concrete handeling zijn verschillende vragen. Deze artikelen helpen die naast elkaar te onderzoeken.', 90, true),
  ('psycholoog-titel-tucht', 'zorg-tucht-verweer', 'procedure', 'De tuchtrechtelijke route', 'De uitleg over registratie helpt de context van de tuchtprocedure te begrijpen. Een verbinding betekent niet dat iedere psycholoog onder die procedure valt.', 100, true),
  ('psycholoog-titel-tucht', 'patient-klacht', 'procedure', 'Een passende klachtenroute', 'Vergelijk de algemene klachtenroute met de uitleg over beroepstitel en registratie. Die context helpt om verschillende procedures uit elkaar te houden.', 95, true),
  ('zorg-bevoegd-bekwaam', 'patient-informatie-keuze', 'protection', 'Handelen en behandelkeuze', 'Deze artikelen bieden twee invalshoeken: de voorwaarden voor professioneel handelen en de informatie en keuze van de patiënt. Het ene vervangt het andere niet.', 80, true),
  ('zorg-tucht-verweer', 'beroepsgeheim-zorg', 'context', 'Informatie in een procedure', 'Lees de algemene uitleg over beroepsgeheim ook bij een tuchtprocedure. Deze link stelt niet vast welke informatie in een concrete procedure gedeeld mag worden.', 80, true),
  ('gelijke-behandeling', 'basis-religie', 'protection', 'Religie en gelijke behandeling', 'Bekijk naast de algemene uitleg over gelijke behandeling het afzonderlijke grondrecht rond religie en levensovertuiging.', 90, true),
  ('gelijke-behandeling', 'basis-geslacht', 'protection', 'Geslacht als beschermd kenmerk', 'Dit onderdeel werkt de algemene uitleg over gelijke behandeling uit rond geslacht en gender, met eigen grenzen en toepassingsgebieden.', 90, true),
  ('gelijke-behandeling', 'basis-ras', 'protection', 'Afkomst als beschermd kenmerk', 'Dit onderdeel biedt nadere uitleg over afkomst en huidskleur binnen het thema gelijke behandeling. De concrete context blijft bepalend.', 90, true),
  ('gelijke-behandeling', 'basis-seksuele-gerichtheid', 'protection', 'Gerichtheid en gelijke behandeling', 'Lees de algemene gelijkebehandelingsuitleg naast het onderdeel over seksuele gerichtheid en de daar beschreven voorwaarden.', 90, true),
  ('gelijke-behandeling', 'basis-handicap', 'protection', 'Handicap en toegankelijkheid', 'Het onderdeel over handicap en chronische ziekte verdiept de algemene uitleg over gelijke behandeling en beschrijft ook aanpassingen en grenzen.', 95, true),
  ('gelijke-behandeling', 'basis-politieke-overtuiging', 'protection', 'Overtuiging en gelijke behandeling', 'Deze route verbindt algemene gelijkebehandelingsuitleg met het afzonderlijke onderdeel over politieke overtuiging.', 85, true),
  ('gelijke-behandeling', 'basis-overige-gronden', 'protection', 'Andere beschermde kenmerken', 'Lees verder over andere beschermde kenmerken en de terreinen waarop de betreffende regels gelden.', 85, true),
  ('vrijheid-meningsuiting', 'basis-politieke-overtuiging', 'context', 'Overtuiging en uiting', 'Een politieke overtuiging en het uiten van een mening zijn verwante onderwerpen met eigen juridische grenzen. Deze route laat beide artikelen naast elkaar lezen.', 95, true),
  ('vrijheid-meningsuiting', 'basis-religie', 'context', 'Een overtuiging uiten', 'Bekijk de uitleg over meningsuiting naast religie en levensovertuiging. De verbinding laat verschillende grondrechten zien zonder een belangenafweging te beslissen.', 80, true),
  ('arbeidscontract-basis', 'wettelijke-vakantie', 'context', 'Vakantie binnen het contract', 'Het vakantieartikel verdiept één onderdeel uit de bredere uitleg over contract, loon en werktijd. Controleer ook de eigen contract- en cao-context.', 100, true),
  ('arbeidscontract-basis', 'veilig-werken-zorg', 'related', 'Arbeidsvoorwaarden en werkplek', 'Lees arbeidsvoorwaarden naast de uitleg over een veilige werkplek. De artikelen behandelen verschillende onderdelen van werken in loondienst.', 90, true),
  ('arbeidscontract-basis', 'gelijke-behandeling', 'protection', 'Gelijke behandeling op het werk', 'De algemene gelijkebehandelingsuitleg kan als achtergrond bij de arbeidsartikelen worden gelezen. Dit bepaalt niet of een concreet arbeidsverschil verboden is.', 80, true),
  ('huurder-contract', 'huurder-onderhoud', 'context', 'Contract en onderhoud', 'Bekijk de algemene huurcontractuitleg naast de specifieke uitleg over onderhoud en het melden van gebreken.', 100, true),
  ('huurder-contract', 'huurder-opzegging', 'protection', 'Contract en beëindiging', 'De uitleg over het huurcontract vormt context bij het artikel over opzegging. Contractsoort en omstandigheden moeten afzonderlijk worden nagegaan.', 100, true),
  ('huurder-contract', 'gelijke-behandeling', 'context', 'Gelijke behandeling bij wonen', 'Deze route biedt naast de huurartikelen algemene achtergrond over gelijke behandeling. Niet ieder huurgeschil is een discriminatiekwestie.', 70, true),
  ('huurder-contract', 'bezwaar-overheidsbesluit', 'procedure', 'Een besluit of een huurgeschil?', 'Vergelijk bij vragen rond wonen de huurroute met de uitleg over een overheidsbesluit. Een verhuurdersbrief is niet automatisch een besluit waartegen bezwaar openstaat.', 65, true),
  ('politie-taak', 'politie-bevoegdheden', 'context', 'Taak en wettelijke grenzen', 'Lees de algemene politietaak naast de voorwaarden en grenzen van specifieke politiebevoegdheden. Een taak geeft op zichzelf geen onbeperkte bevoegdheid.', 100, true),
  ('politie-taak', 'slachtofferrechten', 'protection', 'Politie en slachtofferinformatie', 'Deze route brengt de uitleg over de politietaak samen met de informatie voor slachtoffers. De benodigde hulp of bescherming hangt van de situatie af.', 100, true),
  ('politie-bevoegdheden', 'privacy', 'context', 'Bevoegdheden en gegevens', 'Bekijk bij informatieverwerking ook de algemene privacyuitleg. Voor politiegegevens kunnen specifieke regels gelden; deze algemene link beoordeelt die niet.', 70, true),
  ('bezwaar-overheidsbesluit', 'gelijke-behandeling', 'context', 'Een besluit en gelijke behandeling', 'Naast de formele bezwaarroute kun je de algemene uitleg over gelijke behandeling lezen. De koppeling zegt niets over de geldigheid of uitkomst van een bezwaar.', 70, true)
on conflict do nothing;

insert into public.aegora_right_combinations (id, slug, title, summary, node_ids, featured, priority, open_count, tags, is_published)
values
  ('zorg-informatie-dossier-klacht', 'zorg-informatie-dossier-klacht', 'Uitleg, dossier en een klacht', 'Lees hoe behandelkeuze, dossierinformatie en de klachtenroute zich tot elkaar verhouden.', array['patient-informatie-keuze', 'patient-dossier', 'patient-klacht']::text[], true, 100, 0, array['Zorg', 'Dossier', 'Klachten']::text[], true),
  ('privacy-en-beroepsgeheim', 'privacy-en-beroepsgeheim', 'Privacy en beroepsgeheim', 'Verbind algemene privacy, medische gegevens, geheimhouding en je dossier.', array['privacy', 'privacy-medische-gegevens', 'beroepsgeheim-zorg', 'patient-dossier']::text[], true, 95, 0, array['Zorg', 'Privacy', 'Gegevens']::text[], true),
  ('kind-informatie-en-privacy', 'kind-informatie-en-privacy', 'Een kind, informatie en privacy', 'Bekijk de algemene zorguitleg samen met de bijzondere context van leeftijd en gezag.', array['ouder-medisch-dossier-kind', 'patient-informatie-keuze', 'patient-dossier', 'privacy-medische-gegevens']::text[], true, 90, 0, array['Kinderen', 'Zorg', 'Privacy']::text[], true),
  ('zorg-registratie-en-procedure', 'zorg-registratie-en-procedure', 'Registratie, handelen en klachten', 'Onderzoek de samenhang tussen beroepstitel, bekwaamheid en verschillende klachtenprocedures.', array['psycholoog-titel-tucht', 'zorg-bevoegd-bekwaam', 'patient-klacht', 'zorg-tucht-verweer']::text[], true, 85, 0, array['Zorg', 'Professional', 'Klachten']::text[], true),
  ('gelijke-behandeling-en-overtuiging', 'gelijke-behandeling-en-overtuiging', 'Gelijke behandeling en overtuiging', 'Lees algemene bescherming naast religie, politieke overtuiging en meningsuiting.', array['gelijke-behandeling', 'basis-religie', 'basis-politieke-overtuiging', 'vrijheid-meningsuiting']::text[], true, 80, 0, array['Grondrechten', 'Gelijke behandeling', 'Overtuiging']::text[], true),
  ('werken-voorwaarden-en-veiligheid', 'werken-voorwaarden-en-veiligheid', 'Werken, verlof en veiligheid', 'Bekijk arbeidsvoorwaarden, wettelijke vakantie en een veilige werkplek in één leesroute.', array['arbeidscontract-basis', 'wettelijke-vakantie', 'veilig-werken-zorg', 'gelijke-behandeling']::text[], true, 75, 0, array['Werk', 'Contract', 'Veiligheid']::text[], true),
  ('wonen-contract-en-bescherming', 'wonen-contract-en-bescherming', 'Wonen, onderhoud en opzegging', 'Verbind je huurcontract met de uitleg over onderhoud en bescherming bij opzegging.', array['huurder-contract', 'huurder-onderhoud', 'huurder-opzegging']::text[], true, 70, 0, array['Wonen', 'Contract', 'Onderhoud']::text[], true),
  ('politie-bescherming-en-grenzen', 'politie-bescherming-en-grenzen', 'Politie, bescherming en grenzen', 'Lees slachtofferinformatie naast de politietaak en de grenzen van bevoegdheden.', array['politie-taak', 'politie-bevoegdheden', 'slachtofferrechten']::text[], true, 65, 0, array['Veiligheid', 'Politie', 'Bescherming']::text[], true)
on conflict do nothing;

commit;
