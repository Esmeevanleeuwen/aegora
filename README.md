# RECHT NU

RECHT NU is een openbaar rechtenplatform voor burgers, cliënten en professionals. Bezoekers kunnen zonder account rechten zoeken per rol en onderwerp. Met een account kunnen zij daarnaast eigen dossiers en documenten beheren.

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
- Registreren, inloggen, uitloggen en bevestigen via Supabase Auth.
- Persoonlijk dashboard voor dossiers, termijnen, profielvoorkeuren en contracten.
- Private bestandsopslag met een limiet van 10 MB en toegang per eigenaar.

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
NEXT_PUBLIC_SUPABASE_URL=https://lansmpclefejsahufszl.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

De openbare catalogus leest de view `aegora_public_rights`. Row Level Security zorgt dat anonieme bezoekers uitsluitend gepubliceerde rechten en actieve bronnen kunnen zien. Persoonlijke tabellen zijn alleen beschikbaar na inloggen. Zonder deze variabelen gebruikt de openbare catalogus automatisch de lokale basisset.

De versiebeheerbare database-opzet staat in `supabase/migrations`. De tweede migratie voegt de accounttabellen, private bucket en alle RLS-regels toe.

## Belangrijke productgrens

De AI bepaalt niet zelfstandig wat het recht is. Zij mag alleen formuleren met rechten, voorwaarden, uitzonderingen en bron-URL's uit de beheerde catalogus. Zonder passende bron of voldoende context mag geen stellige conclusie worden getoond.

## Beveiliging

Persoonlijke tabellen zijn niet toegankelijk voor anonieme bezoekers. Iedere selectie, toevoeging, wijziging en verwijdering controleert `auth.uid()`. Bestanden staan in een private bucket onder een map met het gebruikers-ID. De secret- of service-role-key hoort nooit in deze applicatie.
