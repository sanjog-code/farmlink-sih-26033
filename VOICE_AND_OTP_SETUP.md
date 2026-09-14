# FarmLink OTP and voice setup

## Farmer OTP

Farmer registration now creates a phone-based Supabase user. To send an actual OTP, configure an SMS provider in Supabase Auth:

1. In Supabase Dashboard, open Authentication → Providers → Phone.
2. Enable Phone authentication.
3. Add credentials for your approved SMS provider (for example Twilio Verify).
4. Add the provider's sending configuration and save.

The browser normalises Indian 10-digit numbers to `+91xxxxxxxxxx`.

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
