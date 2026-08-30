# RECHT NU

RECHT NU is een openbaar rechtenplatform voor burgers, cliënten en professionals. Bezoekers kunnen zonder account rechten zoeken per rol en onderwerp. Persoonlijke functies worden later achter een account geplaatst.

## Wat er nu werkt

- Rustige, responsive homepage en rechtenoverzicht.
- Openbare rechtenbibliotheek voor zorg, werk, wonen, veiligheid, kinderen en algemene rechten.
- Selectie op rol, waaronder cliënt, psycholoog, zorgmedewerker, politieagent, werknemer en huurder.
- Vrijwillige contextkeuzes voor situatie, leeftijd en aanspreekvorm.
- Rechten, plichten, bevoegdheden en grenzen met officiële bronnen.
- Supabase-database voor rechten, rollen, onderwerpen, situaties, bronnen en versiehistorie.
- Werkende `/api/ask`-route met een gestructureerd antwoordcontract.
- AI via Vercel AI Gateway wanneer `AI_GATEWAY_API_KEY` aanwezig is.
- Veilige, deterministische demo-uitkomst zonder API-sleutel.
- Aparte statussen voor bevestigde toepassing, waarschijnlijkheid, mogelijke uitzonderingen en ontbrekende context.

## Lokaal starten

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open daarna `http://localhost:3000`.

## AI configureren

Vul in `.env.local` een Vercel AI Gateway-sleutel in:

```env
AI_GATEWAY_API_KEY=...
```

Zonder sleutel blijft de volledige interface bruikbaar en retourneert de API een veilige demo-uitkomst uit de lokale rechtenkaarten.

## Supabase configureren

Vul de publishable key van het gekoppelde Supabase-project in `.env.local` in:

```env
SUPABASE_URL=https://frvkibbrbxiqrlmlfnxc.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
```

De website leest alleen de view `aegora_public_rights`. Row Level Security zorgt dat anonieme bezoekers uitsluitend gepubliceerde rechten en actieve bronnen kunnen zien. Zonder deze variabelen gebruikt de website automatisch de lokale basisset.

De versiebeheerbare database-opzet staat in `supabase/migrations/20260830141711_aegora_rights_catalog.sql`.

## Belangrijke productgrens

De AI bepaalt niet zelfstandig wat het recht is. Zij mag alleen formuleren met rechten, voorwaarden, uitzonderingen en bron-URL's uit de beheerde catalogus. Zonder passende bron of voldoende context mag geen stellige conclusie worden getoond.

## Volgende stap

Supabase Auth koppelen aan opgeslagen rechten, dossiers, termijnen en versleutelde documentopslag. Publieke rechten blijven ook daarna zonder account beschikbaar.
