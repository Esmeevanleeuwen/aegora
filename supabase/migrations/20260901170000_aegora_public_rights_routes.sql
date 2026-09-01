begin;

alter table public.aegora_rights
  add column if not exists practical_note text;

create temporary table aegora_route_seed (
  right_id text primary key,
  practical_note text not null,
  next_step text not null,
  situation_slugs text[] not null
) on commit drop;

insert into aegora_route_seed (right_id, practical_note, next_step, situation_slugs)
values
  ('gelijke-behandeling', 'Ongelijke behandeling is niet automatisch verboden discriminatie. De reden, vergelijking en context moeten duidelijk worden.', 'Schrijf op wat er gebeurde, wie anders werd behandeld en welke reden daarbij werd genoemd.', array['klacht-of-geschil']),
  ('vrijheid-meningsuiting', 'De grens hangt sterk af van de precieze woorden, de context, het bereik en de vraag of iemand wordt bedreigd of tot uitsluiting oproept.', 'Bewaar de volledige uiting en context voordat je beoordeelt welke juridische grens mogelijk is bereikt.', array['klacht-of-geschil', 'acuut-gevaar']),
  ('privacy', 'Toestemming is niet de enige mogelijke grondslag. De organisatie moet wel kunnen uitleggen waarom de verwerking noodzakelijk en toegestaan is.', 'Vraag welke gegevens zijn gebruikt of gedeeld, met welk doel en op basis van welke grondslag.', array['informatie-gedeeld', 'klacht-of-geschil']),
  ('patient-informatie-keuze', 'Leeftijd, vertegenwoordiging, wilsbekwaamheid en verplichte zorg kunnen bepalen wie beslist en welke procedure nodig is.', 'Vraag om begrijpelijke uitleg over het voorstel, de alternatieven, risico''s en gevolgen van niet behandelen.', array['besluit-of-contract', 'klacht-of-geschil']),
  ('patient-dossier', 'Een dossier kan ook informatie over anderen bevatten. Dat kan invloed hebben op welke delen volledig zichtbaar zijn.', 'Vraag schriftelijk om inzage of een kopie en benoem apart welke feitelijke gegevens volgens jou niet kloppen.', array['informatie-gedeeld', 'klacht-of-geschil', 'lopende-termijn']),
  ('patient-klacht', 'De juiste route verschilt per zorgvorm, beroep en soort klacht. Een gesprek, klachtenfunctionaris, geschilleninstantie en tuchtrecht hebben verschillende doelen.', 'Beschrijf één voor één wat er gebeurde, wat je al hebt besproken en welke oplossing je vraagt.', array['klacht-of-geschil', 'lopende-termijn']),
  ('beroepsgeheim-zorg', 'Een uitzondering op geheimhouding vraagt een concrete wettelijke grond of een zorgvuldig onderbouwde noodsituatie; alleen algemene zorgen zijn niet genoeg.', 'Leg vast welke informatie is gedeeld, met wie, waarom en welke toestemming of uitzondering is gebruikt.', array['informatie-gedeeld', 'klacht-of-geschil', 'acuut-gevaar']),
  ('veilig-werken-zorg', 'De werkgever moet risico''s aanpakken, maar heeft daarvoor vaak concrete meldingen en informatie over de werksituatie nodig.', 'Meld het risico schriftelijk en bewaar wat je werkgever daarna doet of nalaat.', array['klacht-of-geschil', 'acuut-gevaar']),
  ('psycholoog-titel-tucht', 'De gebruikte functienaam zegt niet altijd welke wettelijke registratie, klachtenroute of bevoegdheid daadwerkelijk geldt.', 'Controleer de exacte beroepstitel en registratie in het BIG-register voordat je een procedure kiest.', array['klacht-of-geschil', 'besluit-of-contract']),
  ('zorg-tucht-verweer', 'Het tuchtcollege beoordeelt professioneel handelen. Dat is een andere procedure dan een arbeidsconflict, schadeclaim of strafzaak.', 'Lees de klacht en reactietermijn volledig, orden het dossier en vraag zo nodig professionele rechtsbijstand.', array['klacht-of-geschil', 'lopende-termijn']),
  ('zorg-bevoegd-bekwaam', 'Een opdracht of functie maakt iemand niet automatisch bekwaam. De concrete handeling, scholing, ervaring en mogelijkheid tot toezicht tellen mee.', 'Controleer vóór uitvoering welke bevoegdheid, bekwaamheid, opdracht en toezicht aantoonbaar aanwezig zijn.', array['besluit-of-contract', 'klacht-of-geschil', 'acuut-gevaar']),
  ('politie-taak', 'De algemene politietaak is breed, maar geeft niet in iedere melding recht op dezelfde inzet, snelheid of uitkomst.', 'Maak duidelijk of je iets wilt melden, aangifte wilt doen, directe hulp nodig hebt of over politieoptreden wilt klagen.', array['acuut-gevaar', 'klacht-of-geschil']),
  ('politie-bevoegdheden', 'Een bevoegdheid mag alleen worden gebruikt wanneer de wettelijke voorwaarden en grenzen in de concrete situatie zijn vervuld.', 'Noteer welke bevoegdheid is gebruikt, wanneer, door wie en welke reden daarbij is gegeven.', array['klacht-of-geschil', 'acuut-gevaar']),
  ('arbeidscontract-basis', 'Contractvorm, cao, sector, ziekte en verlof kunnen de algemene arbeidsregels aanvullen of de juiste route veranderen.', 'Verzamel je contract, cao, loonstroken en schriftelijke afspraken en controleer welke termijn nu loopt.', array['besluit-of-contract', 'lopende-termijn', 'klacht-of-geschil']),
  ('huurder-contract', 'De bescherming hangt onder meer af van het type woonruimte, de huurprijs, de contractduur en wat schriftelijk is afgesproken.', 'Bewaar het volledige huurcontract, de bijlagen en informatie die je bij de start van de huur kreeg.', array['besluit-of-contract', 'lopende-termijn']),
  ('huurder-onderhoud', 'Wie het herstel moet uitvoeren hangt af van het soort gebrek. Zonder duidelijke melding is later lastiger vast te stellen wat de verhuurder wist.', 'Meld het gebrek schriftelijk, voeg foto''s en data toe en vraag om een concrete hersteltermijn.', array['klacht-of-geschil', 'lopende-termijn']),
  ('huurder-opzegging', 'Een opzegging beëindigt de huur niet altijd direct. De reden, contractvorm, reactie en eventuele rechterlijke toetsing zijn belangrijk.', 'Bewaar de opzegging, reageer niet overhaast en controleer direct welke reactie- of proceduretermijn geldt.', array['besluit-of-contract', 'lopende-termijn', 'klacht-of-geschil']),
  ('ouder-medisch-dossier-kind', 'De leeftijd van het kind, het gezag en het belang van het kind bepalen wie toestemming geeft en wie het dossier mag inzien.', 'Controleer de leeftijd, het gezag en over welke gegevens of behandeling de vraag precies gaat.', array['informatie-gedeeld', 'besluit-of-contract', 'klacht-of-geschil']);

update public.aegora_rights as right_item
set
  practical_note = seed.practical_note,
  next_step = seed.next_step,
  version = greatest(right_item.version, 2),
  updated_at = now()
from aegora_route_seed as seed
where right_item.id = seed.right_id;

delete from public.aegora_right_situations as link
using aegora_route_seed as seed
where link.right_id = seed.right_id;

insert into public.aegora_right_situations (right_id, situation_id)
select seed.right_id, situation.id
from aegora_route_seed as seed
cross join lateral unnest(seed.situation_slugs) as selected_slug(slug)
join public.aegora_situations as situation on situation.slug = selected_slug.slug
on conflict (right_id, situation_id) do nothing;

alter table public.aegora_rights
  drop constraint if exists aegora_rights_published_route_check;
alter table public.aegora_rights
  add constraint aegora_rights_published_route_check check (
    status <> 'published'
    or (
      next_step is not null
      and char_length(trim(next_step)) between 1 and 1500
      and practical_note is not null
      and char_length(trim(practical_note)) between 1 and 2000
    )
  );

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
    'practical_note', right_item.practical_note,
    'next_step', right_item.next_step,
    'status', right_item.status,
    'source_checked_at', right_item.source_checked_at
  ),
  'Rechtenroute toegevoegd met situaties, praktische uitleg en eerstvolgende stap.'
from public.aegora_rights as right_item
join aegora_route_seed as seed on seed.right_id = right_item.id
on conflict (right_id, version) do update set
  snapshot = excluded.snapshot,
  change_note = excluded.change_note,
  published_at = now();

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
    from public.aegora_right_roles as role_link
    join public.aegora_roles as role_item on role_item.id = role_link.role_id
    where role_link.right_id = right_item.id
  ), array[]::text[]) as roles,
  primary_source.title as source_title,
  primary_source.url as source_url,
  primary_source.publisher as source_publisher,
  primary_source.last_checked_at as source_last_checked_at,
  right_item.practical_note,
  coalesce((
    select array_agg(situation.slug order by situation.position)
    from public.aegora_right_situations as situation_link
    join public.aegora_situations as situation on situation.id = situation_link.situation_id
    where situation_link.right_id = right_item.id
  ), array[]::text[]) as situations
from public.aegora_rights as right_item
join public.aegora_topics as topic on topic.id = right_item.topic_id
left join lateral (
  select source.title, source.url, source.publisher, source.last_checked_at
  from public.aegora_right_sources as source_link
  join public.aegora_sources as source on source.id = source_link.source_id
  where source_link.right_id = right_item.id
  order by case source_link.source_role when 'primary' then 0 else 1 end, source.title
  limit 1
) as primary_source on true
where right_item.status = 'published'
  and topic.is_public = true
  and (right_item.effective_from is null or right_item.effective_from <= current_date)
  and (right_item.effective_until is null or right_item.effective_until >= current_date);

revoke all on public.aegora_public_rights from public, anon, authenticated;
grant select on public.aegora_public_rights to anon, authenticated, service_role;

commit;
