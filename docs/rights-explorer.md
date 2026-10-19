# Rechtenverkenner

`/rechten/verkennen` is de centrale leesweergave. De bestaande bibliotheek en opgeslagen combinaties blijven bereikbaar. Oude `/rechten/[id]`-links worden na aliascontrole doorgestuurd naar de geselecteerde kaart.

## Indeling

- `lib/rights-explorer-model.ts`: gedeelde datacontracten, zonder databronnen of React.
- `lib/rights-explorer-repository.ts`: alleen op de server; vertaalt de catalogus en het onderzoekssnapshot naar leesmodellen.
- `app/api/rechten/verkennen/route.ts`: index, detail, bewijs en begrensde directe verbindingen.
- `components/rights-workspace.tsx`: één herbruikbare weergave met lijst, filters, detail en lokaal netwerk.
- `lib/rights-explorer-navigation.ts`: URL- en browsergeschiedenis, los van componenten en gegevens.

De index bevat unieke onderwerpen met samenvattingen en aantallen. Details bevatten voorwaarden, uitzonderingen, gegroepeerde normsets en verbindingen met hun afzonderlijke redenen. Bewijsstappen worden pas geladen wanneer de bezoeker de onderbouwing opent. Het netwerk haalt maximaal twaalf buren per aanvraag op, standaard acht.

## Context en betekenis

`context=catalogus` is de standaard. Catalogusverbindingen zijn leesroutes: ze stellen geen gezamenlijke juridische toepasselijkheid vast. Onderzoekscontexten blijven gescheiden. Alleen `research=1` voegt hypothesen en analytische verbanden toe; het type blijft bij iedere reden en bewijsstap zichtbaar.

Onderzoeksnormen tonen hun opgeslagen historische peildatum. De dataset beslist niet welk recht op een persoonlijke situatie van toepassing is. Ontbrekende of niet geformaliseerde voorwaarden blijven als beperking zichtbaar.

## Ophalen en verversen

`GET /api/rechten/verkennen?part=index|detail|proof|neighbors&context=…&research=0|1`

Voor detail, proof en neighbors is `id` verplicht. Neighbors accepteert `limit=1..12`. Een onbekende expliciete context levert 404 op; er is geen terugval naar een andere context. Elke aanvraag toetst de actuele revisie. De ETag omvat revisie en aanvraagparameters; de revisie omvat ook bronreviews en modulestatus. De browser bewaart maximaal 24 antwoorden en 2 MiB, valideert bij hergebruik en ververst bij terugkeer naar het venster.

De algemene layout levert geen volledige graaf meer aan alle pagina’s. De grote onderliggende snapshot blijft een serverbestand.

## Onderzoekssnapshot vervangen

Exporteer `full_snapshot.json` en `graph.json` samen uit de afzonderlijke ERD-engine. Voer vanuit de website-checkout uit:

```sh
python scripts/export-research-network.py --input /pad/naar/engine/exports
node --test tests/*.test.ts
npm run typecheck
npm run build
```

De exporter weigert verschillende schema’s, exporttijdstippen of inconsistente assertion-ID’s. Alleen de expliciet toegestane tabellen met openbare, geaggregeerde onderzoeksmetadata worden overgenomen. Dossiers, personen, gebeurtenissen, beslissingen en gebruikersgegevens worden niet geëxporteerd. De repository controleert actieve bronnen, uitzonderingsbronnen, reviews, moduleafhankelijkheden en afleidingspremissen opnieuw.
