# FarmLink service activation

The database, queues, security rules, admin controls and fallback screens are already part of the application. Keep all private keys in Supabase Edge Function secrets. Do not add them to Vercel or `VITE_*` variables.

## Add secrets

Run only the lines for services you want to activate. Replace the example values.

```powershell
pnpm dlx supabase@latest secrets set DATA_GOV_IN_API_KEY="YOUR_DATA_GOV_KEY" --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase@latest secrets set OPENAI_API_KEY="YOUR_OPENAI_KEY" --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase@latest secrets set BHASHINI_API_KEY="YOUR_BHASHINI_KEY" BHASHINI_ASR_SERVICE_ID_HI="YOUR_HINDI_SERVICE_ID" BHASHINI_ASR_SERVICE_ID_EN="YOUR_ENGLISH_SERVICE_ID" --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase@latest secrets set GRADING_API_URL="https://YOUR-MODEL-ENDPOINT" GRADING_API_KEY="YOUR_MODEL_KEY" --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase@latest secrets set RESEND_API_KEY="YOUR_RESEND_KEY" NOTIFICATION_FROM_EMAIL="FarmLink <orders@YOUR_VERIFIED_DOMAIN>" --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase@latest secrets set ONDC_PARTNER_URL="https://YOUR-ONDC-PARTNER-ENDPOINT" ONDC_PARTNER_API_KEY="YOUR_PARTNER_KEY" --project-ref neoyrdfpvnfsnxwjbthm
```

For other BHASHINI languages, add secrets following `BHASHINI_ASR_SERVICE_ID_BN`, `TA`, `TE`, `MR`, `GU`, `KN`, `ML`, `PA`, `OR`, and `AS`.

## What activates automatically

- The government mandi importer runs daily at 18:00 IST and continues large imports every five minutes from its saved checkpoint.
- Official MSP source pages are checked for availability/content changes. A FarmLink administrator must verify and publish the exact Government notification in **Admin → MSP & mandi data**. Daily mandi prices never overwrite MSP.
- Ready-for-pickup notifications stay in the app. When Resend is configured, the same events enter an idempotent email delivery queue processed every five minutes.
- Voice supports browser speech immediately. With keys present, Automatic uses BHASHINI first and Whisper as fallback. BHASHINI accepts the configured 16 kHz mono WAV input.
- The grading endpoint receives the crop and warehouse photo and must return `suggested_grade`, `observations`, `limitations`, and `model_version`. The operator always confirms the final A/B/C grade.
- ONDC exports are queued only by an administrator and sent to an onboarded partner adapter. Partner acknowledgement does not itself mean ONDC certification.
- e-NWR and finance requests are consented enquiries. An administrator records the external provider reference only after acknowledgement. Warehouse registration must be verified before an e-NWR referral.

## Authentication setup

In Supabase Authentication URL Configuration set:

- Site URL: `https://farmlinkk.vercel.app`
- Redirect URL: `https://farmlinkk.vercel.app/**`

Consumer password-reset links use `https://farmlinkk.vercel.app/?reset-password=1`. Farmer accounts continue to use the issued Farmer ID and password. Admin accounts remain provisioned accounts with the admin database role.

## Verify

```powershell
pnpm test
pnpm build
pnpm dlx supabase@latest db push --project-ref neoyrdfpvnfsnxwjbthm --dry-run
```

After adding a key, open **Admin → Integrations** to verify configuration status without revealing the secret value.
