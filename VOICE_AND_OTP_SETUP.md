# FarmLink OTP and voice setup

## Farmer OTP

Farmer login uses Firebase Phone Authentication. Firebase sends the SMS after a reCAPTCHA challenge; the deployed `firebase-phone-session` Supabase Edge Function validates Firebase’s signed token and opens the FarmLink session.

In Firebase Console, create a web app, enable **Authentication → Sign-in method → Phone**, allow India in the SMS region policy, and add the FarmLink Vercel domain under Authorized domains. Then add the Firebase web configuration to Vercel as these public environment variables:

```powershell
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_web_app_id
```

Also add the project ID to Supabase Edge Function secrets:

```powershell
pnpm dlx supabase secrets set FIREBASE_PROJECT_ID=your_project_id --project-ref neoyrdfpvnfsnxwjbthm
```

The phone number is normalized to `+91xxxxxxxxxx`. Firebase Phone Auth has a free usage tier, but Google’s current SMS quotas and regional policies apply.

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
