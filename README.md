# FarmLink - SIH 26033 demo

Mobile-first working concept for connecting farmers, warehouses, consumers and bulk buyers. It includes live demo inventory, a warehouse intake flow, an explainable pricing assistant, grading simulation, purchase reservation, logistics status, Hindi/English interface and accessibility-friendly voice-demo control.

## Local run

```powershell
pnpm install
pnpm dev
```

Open the URL printed by Vite. The demo intentionally uses browser memory/local storage, so no secret or external account is needed.

## Supabase

1. Create a Supabase project in an India-appropriate region for the actual pilot.
2. Run `supabase/schema.sql` in SQL Editor.
3. Deploy the farmer registration function: `supabase functions deploy register-farmer`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel project environment variables.
5. Create the first admin user through Supabase Auth, then promote it from SQL Editor using the commented statement at the end of `supabase/schema.sql`.

The app automatically uses Supabase Auth whenever both Vite environment variables are present. Farmers receive a Farmer ID through the protected `register-farmer` Edge Function; consumers use email/password registration.

## Vercel

Import this repository in Vercel, framework preset **Vite**, and deploy. Or run `npx vercel --prod` after logging into a Vercel account.

## Demo boundaries

AI prices and grades are explainable deterministic demo recommendations, not market guarantees. ONDC, payment, IVR, lenders and e-NWR are presented as integration-ready workflows, not live/certified services. No live finance or e-NWR decision is made.
