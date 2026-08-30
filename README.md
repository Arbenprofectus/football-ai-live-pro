# Football AI Live Pro

Aplikacion Next.js për monitorimin e ndeshjeve live dhe probabilitete të përditësuara në kohë reale. Është gati për deploy në Vercel dhe funksionon menjëherë në modalitet demonstrues.

## Nisja lokale

```bash
npm install
npm run dev
```

## Të dhënat live

Krijo `.env.local` nga `.env.example` dhe vendos `API_FOOTBALL_KEY`. Pa këtë variabël aplikacioni përdor të dhëna demo. Çelësi ruhet vetëm në server dhe nuk dërgohet në browser.

## Deploy në Vercel

1. Importo repository-n në Vercel.
2. Framework preset: **Next.js**.
3. Nëse do të dhëna reale, shto `API_FOOTBALL_KEY` te **Project Settings → Environment Variables**.
4. Deploy.
