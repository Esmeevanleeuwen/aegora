# RECHT NU

RECHT NU is een eerste werkende productbasis voor een persoonlijk burgerplatform. De gebruiker stelt een vraag in gewone taal, voegt alleen relevante context toe en krijgt een gestructureerd antwoord met status, rechten, aannames, vervolgstappen en officiële bronnen.

## Wat er nu werkt

- Rustige, responsive homepage en rechtenoverzicht.
- Vrijwillige contextkeuzes voor situatie, leeftijd en aanspreekvorm.
- Cliëntrechten met voorwaarden, uitzonderingen, bronversie en vervolgstap.
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

## Belangrijke productgrens

De AI bepaalt niet zelfstandig wat het recht is. Zij mag alleen formuleren met rechten, voorwaarden, uitzonderingen en bron-URL's uit de beheerde catalogus. Zonder passende bron of voldoende context mag geen stellige conclusie worden getoond.

## Volgende stap

De eerste bronset richt zich op zorg en cliëntrechten. Wonen, werk, veiligheid, familie en overheid staan al in de interface, maar worden pas geactiveerd nadat hun rechtenkaarten en uitzonderingen juridisch zijn gevalideerd.
