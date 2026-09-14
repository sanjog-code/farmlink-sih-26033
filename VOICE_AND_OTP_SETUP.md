# FarmLink OTP and voice setup

## Farmer OTP

Farmer login uses the deployed `twilio-verify` Supabase Edge Function. It sends and checks a Twilio Verify SMS, then creates a short-lived Supabase session only after Twilio approves the OTP. Add these secrets to Supabase; never add them to Vercel or browser code:

```powershell
pnpm dlx supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase secrets set TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid --project-ref neoyrdfpvnfsnxwjbthm
```

Create the Verify Service in the Twilio Console and enable SMS. The phone number is normalized to `+91xxxxxxxxxx` before it is sent to Twilio.

The app deliberately returns a clear configuration error until all three secrets are set, rather than falling back to an insecure browser-side OTP flow.

## Secure voice transcription

Set these Supabase Edge Function secrets. Do not put them in Vercel or client code:

```powershell
pnpm dlx supabase secrets set OPENAI_API_KEY=your_openai_key --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase secrets set BHASHINI_API_KEY=your_bhashini_inference_key --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase secrets set BHASHINI_ASR_SERVICE_ID_HI=your_hindi_asr_service_id --project-ref neoyrdfpvnfsnxwjbthm
pnpm dlx supabase secrets set BHASHINI_ASR_SERVICE_ID_EN=your_english_asr_service_id --project-ref neoyrdfpvnfsnxwjbthm
```

The voice dialog offers BHASHINI ASR for Indic-language speech and Whisper for OpenAI transcription. The server accepts WebM, WAV, MP3, MP4, and OGG audio up to 10 MB.

Sources: OpenAI's Audio Transcriptions API and the BHASHINI ASR quickstart.
