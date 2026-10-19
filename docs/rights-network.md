# Rechtennetwerk

Rechten en regels hebben één vast ID. Een recht kan daardoor vanuit de
homepage, bibliotheek, basisrechten, antwoorden en opgeslagen rechten worden
geopend. Een gewone klik opent het React-venster; de link naar
`/rechten/[id]` blijft beschikbaar om een pagina te openen of te delen.
Het volledige netwerk staat op `/rechten/netwerk`.

## Gegevens en hergebruik

- `lib/rights-network.ts` bevat de typen en functies voor samenvoegen,
  verwijzingen, verbonden rechten en aanbevolen combinaties.
- `lib/rights-network-data.ts` bevat de expliciete leesverbindingen,
  redactionele combinaties en aliassen van bestaande rechten.
- `lib/rights-network-repository.ts` leest de openbare catalogus en eventueel
  gepubliceerde netwerkgegevens uit Supabase. Alleen de server doet deze
  gegevensopvragingen.
- `components/rights-network-provider.tsx` beheert het venster en de gedeelde
  selectie. `RightLink` maakt een bestaand recht doorklikbaar.
- `components/rights-explorer.tsx` toont de details, het netwerk, de lijst,
  combinaties en suggesties met dezelfde gegevens.

Een `RightsNode` bevat de uitleg, toepassingsvoorwaarden, grens, vervolgstap en
oorspronkelijke bron van een recht of regel. Het model combineert de bestaande
openbare catalogus, basisrechten en aanvullende cataloguskaarten. Een plicht,
bevoegdheid of grens behoudt zijn eigen soort; het netwerk maakt daarvan geen
nieuw recht.

Een `RightsEdge` verbindt twee vaste node-ID's en bevat een type, korte naam,
uitleg en prioriteit van 0 tot 100. Iedere verbinding kan van beide kanten
worden gevolgd. De types betekenen:

| Type | Betekenis in de interface |
| --- | --- |
| `related` | Lees deze artikelen naast elkaar. |
| `context` | Lees verder over achtergrond of een specifiekere situatie. |
| `procedure` | Vergelijk de uitleg met een mogelijke procedure of vervolgstap. |
| `protection` | Lees een aanvullende invalshoek op bescherming. |

Dit zijn redactionele leesroutes. Een verbinding bewijst niet dat twee regels
tegelijk gelden, dat een recht is geschonden of dat een bepaalde procedure
openstaat. De voorwaarden en grenzen van ieder artikel blijven afzonderlijk
zichtbaar. Een nieuwe cataloguskaart zonder opgeslagen verbinding krijgt hooguit
één als context beschreven leesroute, geen automatisch volledig netwerk van
veronderstelde juridische relaties.

Een `RightsCombination` bewaart een herkenbare groep rechten: ID, slug, titel,
samenvatting, node-ID's, tags, aanbevolen-status, prioriteit en `openCount`.
De eerste versie bevat 29 artikelen, 37 expliciete verbindingen en 8 opgeslagen
redactionele combinaties. De code blijft ook met aanvullende gepubliceerde
cataloguskaarten werken.

## Vaste ID's en oude links

Gebruik voor een nieuwe verwijzing het canonieke node-ID. `resolveRightId`
herkent daarnaast de namen uit eerdere catalogi. Zo verwijst
`duidelijke-informatie-en-keuze` naar `patient-informatie-keuze` en
`inzage-en-kopie-dossier` naar `patient-dossier`. Basisrechten gebruiken in het
netwerk de prefix `basis-`, bijvoorbeeld `basis-religie`.

Voeg bij een naamswijziging een alias toe in `rights-network-data.ts` in plaats
van bestaande links of opgeslagen selecties te laten breken. Een onbekend ID
mag geen lege detailkaart of verzonnen bron opleveren.

## Combinaties en aanbevelingen

Een bezoeker kan maximaal 12 bestaande artikelen selecteren. Een eigen
combinatie is een weergave van bestaande artikelen en verbindingen; de selectie
maakt zelf geen nieuwe juridische relaties.

Aanbevolen redactionele combinaties moeten minstens twee unieke, bestaande
artikelen bevatten. Alle artikelen van zo'n combinatie moeten via opgeslagen
verbindingen binnen die combinatie met elkaar verbonden zijn. Een groep met
een onbekend of losstaand artikel wordt niet aanbevolen. Dit wordt zowel bij
het lezen van databasecombinaties als in het aanbevelingsmodel gecontroleerd.

De volgorde gebruikt overlap met de selectie, directe verbindingen, de
redactionele prioriteit, aanbevolen-status en eventueel een werkelijk
vastgelegd totaalaantal openingen. Een gedeeld onderwerp alleen is geen bewijs
van juridische samenhang.

## Bewaren en gebruik op het apparaat

Eigen combinaties worden met een versienummer in de browser bewaard onder
`aegora:rights-combinations:v1`. Er worden maximaal 12 combinaties opgeslagen.
De lijst is lokaal op dat apparaat en wordt niet naar Supabase of een account
verstuurd. Bij het inlezen worden ID's en aantallen opnieuw gecontroleerd.
Wanneer browseropslag niet beschikbaar is, blijft verkennen mogelijk en kan
de bezoeker een link naar de selectie kopiëren.

`aegora:rights-combination-opens:v1` houdt uitsluitend lokaal bij welke
redactionele combinaties op dit apparaat zijn geopend. Dit stuurt de lijst
“Vaak geopend op dit apparaat” aan. Het is geen meting van bezoekers op de hele
site en schrijft niets naar de database.

Het databaseveld `open_count` is een afzonderlijk, gereserveerd totaal. Alle
beginwaarden zijn 0. Er is geen publieke schrijf- of incrementroute. De
interface toont een algemene lijst “populair” alleen als er echt positieve
databaseaantallen beschikbaar zijn. De huidige versie verzamelt die aantallen
niet en verzint geen populariteit.

## Redactionele gegevens uitbreiden

Voor een wijziging in de cataloguscode:

1. Voeg het bronartikel toe aan de passende bestaande catalogus.
2. Gebruik het vaste node-ID voor een expliciete verbinding in
   `rights-network-data.ts`. Leg in gewone taal uit waarom deze leesroute helpt.
3. Voeg eventueel een herkenbare combinatie toe met 2 tot 12 bestaande ID's.
   Zorg dat de opgeslagen verbindingen die artikelen onderling verbinden.
4. Voeg een alias toe als een oudere naam moet blijven werken en voer de
   controles hieronder uit.

De optionele databasetabellen zijn:

- `aegora_right_links`: `source_id`, `target_id`, `relation`, `label`,
  `explanation`, `priority`, `is_published`.
- `aegora_right_combinations`: `id`, `slug`, `title`, `summary`, `node_ids`,
  `featured`, `priority`, `open_count`, `tags`, `is_published`.

Deze tabellen bewaren alleen redactionele navigatiegegevens. De inhoud en
bronnen van een artikel komen uit de catalogus. Node-ID's verwijzen ook naar
basisrechten en oudere cataloguskaarten en hebben daarom geen foreign key naar
de bestaande tabel `aegora_rights`.

Nieuwe rijen zijn standaard ongepubliceerd. Alleen vertrouwde
databaseadministratie of gecontroleerde migraties kunnen publiceren. Anonieme
en ingelogde bezoekers hebben uitsluitend `SELECT` en zien via RLS alleen
`is_published = true`. Zij kunnen niets toevoegen, wijzigen of verwijderen.
De migratie bevat geen publieke privileged function of service-role-sleutel.

Gepubliceerde databaseverbindingen overschrijven dezelfde canonieke combinatie
van twee ID's en relatietype uit de catalogus. Databasecombinaties overschrijven
dezelfde slug. Aanvullende geldige rijen worden toegevoegd. Een database-only
rij verbergen kan met `is_published = false`; openbare beginroutes uit de
catalogus blijven bestaan totdat ze ook uit de cataloguscode worden verwijderd.
Een ongepubliceerde databaserij is dus geen verwijderinstructie voor de
broncode. Dit houdt de openbare fallback consistent.

Na een redactionele wijziging kunnen de gegevens maximaal één uur in de
servercache staan. De metadata-opvragingen hebben tevens de cachetag
`rights-network` voor een latere beveiligde publicatieflow.

## Fallback en database-status

De in de README gekoppelde Supabase-project-ID is `lansmpclefejsahufszl`
(RECHT NU). Dit project werd bij de implementatie als `INACTIVE` gerapporteerd;
een read-only tabelopvraging liep in een verbindingstime-out. Er is geen ander
project gebruikt en er is geen project hervat.

De migratie
`supabase/migrations/20261019163801_rights_network.sql` is voorbereid en bevat
tabellen, constraints, indexen, leesbeleid en de 37 verbindingen plus 8
combinaties. **De migratie is niet op Supabase uitgevoerd.** Controleer vóór
toepassing opnieuw het juiste project, de actuele tabellen en de bestaande
migratiehistorie.

De applicatie blijft werken vanuit de openbare catalogus wanneer configuratie,
een tabel of een databaseverbinding ontbreekt. Catalogus en metadata starten
parallel en hebben begrensde fetches van 4 seconden. De metadata wordt maximaal
één keer per server-render opgevraagd via React `cache`. De catalogusstatus
blijft `catalog` totdat er daadwerkelijk geldige, gepubliceerde
databasenetwerkgegevens zijn geladen. Onbekende ID's, ongeldige rijen en
onverbonden opgeslagen combinaties worden niet als nieuwe inhoud getoond.

## Controleren

```bash
node --test scripts/tests/rights-network.test.mjs
npm run typecheck
npm run lint
npm run build
```

De modeltests controleren canonieke verwijzingen, geldige en verbonden
combinaties, directe relaties en de aanbevelingsvolgorde. De repository is
daarnaast met gemockte responses gecontroleerd op ontbrekende configuratie,
onbereikbare of ongeldige metadata, gepubliceerd-filtering, override van een
bestaande verbinding en ongeldige ID-verwijzingen. Dit is geen uitvoering van
de migratie op de externe database.

De migratie is ook uitgevoerd in een tijdelijke, volledig lokale PostgreSQL-
omgeving met PGlite 0.3.14, buiten de projectafhankelijkheden. Daar zijn 37
gepubliceerde verbindingen en 8 combinaties bevestigd, met uitsluitend nul als
gebruiksaantal. De rollen `anon` en `authenticated` konden gepubliceerde rijen
lezen, zagen geen concepten en konden in geen van beide tabellen toevoegen,
wijzigen of verwijderen. Omgekeerde dubbele verbindingen, zelfverwijzingen,
negatieve aantallen en prioriteiten buiten 0 tot 100 werden geweigerd. Deze
controle heeft de externe Supabase-database niet gebruikt.

Controleer na daadwerkelijke toepassing ook met de publieke rol dat alleen
gepubliceerde metadata leesbaar is en dat toevoegen, wijzigen en verwijderen
worden geweigerd. De SQL-migratie beperkt de rechten expliciet; de externe
toepassing en deze live-controle zijn nog niet uitgevoerd.
