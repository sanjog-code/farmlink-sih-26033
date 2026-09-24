# 🌾 FarmLink Saarthi — Rural AI Farmer Assistant

> **"The farmer should not have to learn technology. Technology should learn how the farmer communicates."**

FarmLink Saarthi is a voice-first, AI-powered agricultural assistant designed for Indian farmers with zero digital literacy. Instead of navigating menus, typing search terms, and filling complex multi-step forms, farmers simply press one large button, speak naturally in their native language (Hindi, Hinglish, or English), and Saarthi handles the rest: understanding agricultural intent, asking one clear question at a time, enforcing official Minimum Support Price (MSP) floors, seeking verbal/button confirmation, and executing genuine FarmLink operations.

---

## 🏛️ 1. Architecture Overview

```
                          FARMER
               ┌─────────────┼─────────────┐
               ↓             ↓             ↓
            Web App     Future Kiosk   Future IVR
               │             │             │
               └────── Input Adapters ─────┘
                              │
               POST /api/saarthi/audio | message
                              │
               ┌──────────────┴──────────────┐
               │    FarmLink Saarthi Core     │
               │   (Server-Side API Gateway)  │
               └──────────────┬──────────────┘
                              │
                      Gemini 3.7 Flash
               (Multimodal Audio + Text Reasoning)
                              │
                      Intent + Entities
                              │
                   Deterministic State Machine
                              │
                      Saarthi Tool Gateway
               ┌──────────────┼──────────────┐
               ↓              ↓              ↓
          Marketplace     Warehouse      Logistics
               └──────────────┬──────────────┘
                              │
                      FarmLink Backend
               (DataSyncEngine / Supabase / DB)
```

**Key Architectural Principle:**
- **Gemini is the Language & Reasoning Layer.**
- **FarmLink is the Authority & Action Layer.**

Gemini NEVER has unrestricted database access, and the client NEVER calls Gemini directly or exposes the API key.

---

## 🤖 2. Gemini 3.7 Flash Integration

- **Model:** `gemini-3.7-flash` (Google's official reasoning model).
- **Official SDK Compatibility:** Follows `@google/genai` standards with direct, high-performance streaming REST fallbacks.
- **Multimodal Voice Pipeline:**
  ```
  Farmer records voice ➔ Audio blob (WebM/WAV) ➔ POST /api/saarthi/audio
  ➔ Base64 Audio passed to Gemini 3.7 Flash inlineData
  ➔ Gemini transcribes, extracts intent & agricultural entities
  ➔ Deterministic state machine checks missing fields / confirmation
  ➔ Spoken text response returned ➔ Device SpeechSynthesis / Hybrid TTS speaks response
  ```
- **Resilience:** Automatic retry with exponential backoff on HTTP 503/429 spikes.

---

## 🔑 3. Environment Variables

Store credentials strictly on the server:

| Variable | Environment | Required | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-side / Vercel | **Yes** | Google Gemini API key used by `/api/saarthi/*` |
| `VITE_SUPABASE_URL` | Client / Server | Optional | Supabase database endpoint |
| `VITE_SUPABASE_ANON_KEY` | Client / Server | Optional | Supabase public anonymous key |
| `VITE_SARVAM_API_KEY` | Client (Optional) | Optional | Sarvam AI Bulbul TTS key for Indian regional dialects |

> [!CAUTION]
> Never prefix `GEMINI_API_KEY` with `VITE_`. Keeping it un-prefixed ensures it is NEVER bundled into the client JavaScript build.

---

## 📱 4. Frontend Flow & User Experience

Accessible directly from the **Farmer Dashboard** (`FarmerView`):
1. **Prominent Flagship Banner:** "🌾 FarmLink Saarthi — बोलकर फसल बेचें".
2. **Giant Microphone Interface:**
   - `IDLE`: Calm emerald circle with microphone icon.
   - `LISTENING`: Pulsing animated red halo with live elapsed timer (`0s`, `1s`, `2s`...).
   - `PROCESSING`: Spinning sparkles indicator while Gemini transcribes and reasons.
   - `SPEAKING`: Real-time audio waveform visualizer while speech response plays.
   - `ERROR`: Amber badge with 1-click retry.
3. **Confirmation Card:**
   - Summarizes crop, quantity in kg & quintals, expected price, and MSP protection.
   - Two large buttons (60px height):
     - `✅ हाँ, बना दो` (Yes, confirm)
     - `❌ नहीं, रोकें` (No, cancel)
4. **Quick Action Cards:**
   - 🌾 Fasal Bechni Hai
   - 💰 Aaj Ka Bhav
   - 🚚 Pickup Kahan Hai?
   - 📦 Meri Listing
5. **Text Fallback Drawer:** Integrated input field with send button for quiet environments.

---

## ⚙️ 5. Backend Flow & Endpoints

All endpoints are hosted as Vercel Serverless Functions in `api/saarthi/` and served locally via Vite middleware in `vite.config.js`:

### `POST /api/saarthi/message`
- **Payload:** `{ sessionId, message, farmerId, farmerName, dataContext }`
- **Output:** `{ response, intent, entities, requiresConfirmation, pendingAction, quickActions }`

### `POST /api/saarthi/audio`
- **Payload:** `{ sessionId, audioBase64, mimeType, farmerId, farmerName, dataContext }`
- **Output:** Transcribed intent, agricultural entities, and concise spoken response.

### `POST /api/saarthi/confirm`
- **Payload:** `{ sessionId, confirmed: true|false, idempotencyKey, farmerId, farmerName }`
- **Output:** Executes pending action with duplicate prevention, returning confirmation.

---

## 🛠️ 6. Tool & Function Calling Architecture

All tools in `api/saarthi/saarthiTools.js` enforce authentication and validation:

1. **`tool_createCropListing`**:
   - Enforces legal MSP floor protection via `getMspFloorForCrop`.
   - Prevents below-MSP distress selling.
   - Inserts into `dataSyncEngine` / Supabase.
2. **`tool_getCropMarketPrice`**:
   - Queries official CACP / Agmarknet registry.
   - Never hallucinates prices; returns official season and source link.
3. **`tool_getCropListings`**:
   - Queries authenticated farmer's active produce lots.
4. **`tool_bookProducePickup`**:
   - Schedules doorstep harvest collection to the nearest WDRA accredited warehouse.
5. **`tool_getFarmerOrders`**:
   - Queries consumer / wholesale orders and buyer escrow status.

---

## 🧠 7. Conversation-State Architecture

- **Bounded Session History:** Retains up to 8 conversation turns to eliminate context bloat.
- **Short-Term Memory Entities:**
  - `crop`: Canonical crop name (Wheat, Onion, Mustard, Tomato, etc.).
  - `quantityKg`: Canonical integer in kilograms (automatically normalizes 1 quintal = 100 kg, dhai quintal = 250 kg).
  - `pricePerKg`: Expected listing price.
  - `grade`: Assayed or farmer-claimed grade (A, B, C).
  - `pickupDate`: Date for doorstep pickup.
- **Session Store:** In-memory store with 1-hour TTL cleanup.

---

## 🛡️ 8. Security & Prompt Injection Defense

1. **Server-Side API Key:** Client never accesses the Gemini key.
2. **Untrusted Input Sanitation:** User speech and text are treated as untrusted data.
3. **Prompt Injection Filtering:** Queries attempting to override instructions or dump database tables are safely rejected.
4. **Constrained Tools:** Gemini cannot generate raw SQL or access arbitrary user accounts. The authenticated farmer identity is derived server-side.
5. **Idempotency Cache:** Action confirmation buttons enforce idempotency keys, preventing accidental duplicate listings if a farmer double-taps on 2G/3G networks.

---

## 📡 9. Offline Strategy

1. **Network Detector:** Automatically monitors `navigator.onLine`.
2. **Offline Queue:** When disconnected, farmer requests are safely preserved in `farmlink_saarthi_offline_queue`.
3. **Honest Feedback:** Saarthi informs the farmer: *"आपकी आवाज़/अनुरोध फ़ोन में सुरक्षित सेव हो गया है। इंटरनेट कनेक्ट होते ही यह फार्मलिंक पर सबमिट हो जाएगा।"*
4. **Automatic Re-sync:** As soon as connectivity returns, pending items are submitted in sequence.

---

## ⚠️ 10. Current Limitations & Edge Cases

- **Cold-Start Speech Synthesis:** Some mobile browsers require an initial user tap before allowing speech audio playback (handled gracefully by showing text and offering a replay button).
- **Laboratory-Grade Quality Testing:** Voice and camera inputs provide preliminary assessments; certified grading is officially verified at WDRA intake.

---

## ➕ 11. How to Add Another FarmLink Action

To add a new action (e.g. `APPLY_ENWR_LOAN`):
1. In `api/saarthi/geminiService.js`: Add `APPLY_ENWR_LOAN` to `SUPPORTED_INTENTS`.
2. In `api/saarthi/saarthiTools.js`: Export `tool_applyEnwrLoan({ farmerId, quantityKg, crop })`.
3. In `api/saarthi/saarthiEngine.js`: Add a state machine branch in `executeStateMachine` under `if (intent === 'APPLY_ENWR_LOAN')`.

---

## 🌐 12. How to Add Another Regional Language

1. In `api/saarthi/saarthiTools.js`: Add regional synonyms into `CROP_SYNONYMS` (e.g. Punjabi "ਕਣਕ" or Rajasthani "कणक").
2. In `src/ai/speechEngine.js`: Map the BCP-47 language tag into `SPEECH_LANG_MAP` (e.g. `pa-IN` for Punjabi, `mr-IN` for Marathi).
3. In `SaarthiScreen.jsx`: Add the language chip to `saarthi-lang-selector`.

---

## 🎙️ 13. Future Roadmap: Gemini Live Integration

When Google releases Gemini Live bidirectional audio streaming for web clients:
- The WebSocket stream will replace `UnifiedAudioRecorder` and browser TTS.
- The `saarthiEngine` and `saarthiTools` remain unchanged, acting as the deterministic tool execution backend.

---

## 📞 14. Future Roadmap: Basic-Phone IVR Adapter

To support non-smartphone users on feature phones:
```
Farmer dials 1800-FARMLINK ➔ Twilio/Exotel IVR Gateway
➔ Streams audio chunk to /api/saarthi/audio
➔ Saarthi executes tool ➔ Returns audio stream to phone line
```

---

## 🏪 15. Future Roadmap: Village Kiosk Mode

Saarthi includes a full-screen **Kiosk Mode** accessible via:
- Tapping the `कियोस्क मोड` button in `FarmerView` or `SaarthiScreen`.
- Navigating to `/saarthi/kiosk`.
- Features: 160px gigantic touch targets, 60-second inactivity privacy reset, and no exposed settings.
