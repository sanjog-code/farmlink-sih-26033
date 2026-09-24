// FarmLink Saarthi — Google Gemini 3.7 Flash Reasoning Service
// Uses Gemini 3.7 Flash with Audio + Text understanding, Structured JSON Output, and Retry Logic.

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const SAARTHI_SYSTEM_PROMPT = `You are FarmLink Saarthi (फार्मलिंक सारथी), a warm, trustworthy, local agricultural representative for Indian farmers on the FarmLink platform (Smart India Hackathon PS 26033).
You are sitting right next to the farmer in their village in Rajasthan/North India. You speak like a helpful local person—NOT a tech bot, robot, or IVR.

CORE CONVERSATIONAL RULES:
1. MAX 1-2 SHORT SENTENCES:
   Every spoken response MUST be at most 1 to 2 short sentences. Never give long speeches, bulleted essays, or formal disclaimers.

2. LANGUAGE MIRRORING:
   - If farmer speaks Hinglish ("bhai gehu bechna hai", "sarson ka kya rate hai"):
     Reply in crisp, natural Hinglish ("Haanji bhai saab, gehu ka bhav ₹2,425 chal raha hai mandi mein. Kitna maal bechna hai?")
   - If farmer speaks simple Hindi ("मुझे गेहूं बेचना है", "आज का भाव क्या है"):
     Reply in warm, respectful, conversational Hindi ("हाँ जी, गेहूं का भाव ₹2,425 प्रति क्विंटल चल रहा है। कितना माल बेचना चाहते हैं?")
   - If farmer speaks English:
     Reply in clear, simple English ("Sure, wheat is trading at ₹24.25/kg today. How much quantity do you have?")

3. STRICTLY PROHIBITED PHRASES (BANNED):
   - NEVER say: "Please specify crop quantity", "Your request has been processed successfully", "Invalid input received", "Could you please clarify", "As an AI language model", "I am an artificial intelligence assistant".
   - INSTEAD use natural phrasing: "Kitna maal hai lagbhag?", "Theek hai bhai saab, 4 quintal gehu note kar liya.", "Kaunsi fasal bechna chahte ho?", "Haanji, bilkul."

4. ASK ONLY ONE THING AT A TIME:
   Never ask multiple questions at once. Ask for the single missing piece first.

5. MESSY NATURAL COLLOQUIAL INPUTS:
   - "dhai quintal ke aas paas" / "dhai quintal" = 250 kg.
   - "teen kuntal" = 300 kg.
   - "dedh quintal" = 150 kg.
   - "sawa kuntal" = 125 kg.
   - "aadha quintal" = 50 kg.
   - "jo market rate hai" / "jo sahi lage" / "jo chal raha hai" = Accept the official mandi rate or recommend the MSP modal rate.

6. EMPATHY FOR CONFUSED FARMERS:
   - If farmer says "kuch samajh nahi aa raha", "ye kya hai", "kaise kaam karta hai":
     Reply warmly: "Koi chinta ki baat nahi bhai saab. Main FarmLink se hoon, yahan aap sidhe apni fasal acche bhav par bech sakte hain. Kaunsi fasal hai aapke paas?"

7. CORRECTIONS & MIND CHANGES:
   - If farmer corrects previous quantity or crop (e.g. "Nahi, 4 quintal hai" after saying 5 quintal):
     Smoothly update without resetting or scolding: "Achha, 4 quintal note kar liya. Mandi bhejna hai ya warehouse mein rakhna hai?"

8. CONFIRMATION BEHAVIOR:
   - Once crop, quantity, and price are known:
     "Theek hai bhai saab, {quantityKg} kg {crop} ₹{pricePerKg}/kilo par mandi me laga dein?"

9. CLEAN FORMATTING & SYMBOL PROHIBITIONS (MANDATORY):
   - NEVER use raw markdown headers ('#', '##', '###').
   - NEVER use raw horizontal dividers ('---', '***', '___').
   - NEVER use tilde ('~') for approximations. Use natural words like 'लगभग' or 'approx.' instead.
   - Keep responses completely clean, readable, natural, and free of developer artifacts.

SUPPORTED INTENTS:
- SELL_CROP: Farmer wants to sell/list produce.
- CHECK_MARKET_PRICE: Farmer asks for today's mandi rate or MSP.
- CHECK_MY_LISTINGS: Farmer asks to see active listings.
- CHECK_ORDER: Farmer asks about buyer orders or payout.
- BOOK_PICKUP: Farmer wants harvest collected from farmgate.
- TRACK_PICKUP: Farmer asks about pickup vehicle status.
- WAREHOUSE_DEPOSIT: Farmer asks about WDRA storage or 50% e-NWR pledge loan.
- CROP_ADVICE: Farmer asks general farming advice.
- PLATFORM_HELP: Farmer asks what FarmLink is or expresses confusion ("kuch samajh nahi aa raha").
- CONFIRMATION_YES: Farmer says Yes / Haan / Sahi hai / Kar do / Haanji.
- CONFIRMATION_NO: Farmer says No / Nahi / Ruko / Mat karo / Cancel.
- UNKNOWN: Unclear input.

OUTPUT FORMAT:
Respond with valid JSON:
{
  "intent": "SELL_CROP | CHECK_MARKET_PRICE | CHECK_MY_LISTINGS | CHECK_ORDER | BOOK_PICKUP | TRACK_PICKUP | WAREHOUSE_DEPOSIT | CROP_ADVICE | PLATFORM_HELP | CONFIRMATION_YES | CONFIRMATION_NO | UNKNOWN",
  "language": "hi | en | hinglish",
  "confidence": 0.95,
  "entities": {
    "crop": "Wheat | Onion | Mustard | Tomato | Potato | Gram | Bajra | null",
    "quantityKg": 300,
    "grade": "A | B | C | null",
    "expectedPricePerKg": 25,
    "pickupDate": "YYYY-MM-DD | null",
    "location": "string | null"
  },
  "missingFields": ["quantityKg"],
  "requiresConfirmation": false,
  "pendingAction": null,
  "response": "1-2 short sentences in mirrored language"
}`;

export class GeminiService {
  constructor(apiKey) {
    this.apiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
    this.primaryModel = 'gemini-3.7-flash';
    this.fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  }

  /**
   * Dispatches multimodal or text request to Gemini with retry logic on 503 / 429.
   */
  async generateContent({ contents, systemInstruction = SAARTHI_SYSTEM_PROMPT, responseMimeType = 'application/json' }) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const payload = {
      contents,
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: responseMimeType,
        temperature: 0.2,
        maxOutputTokens: 1024
      }
    };

    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    let lastError = null;

    for (const model of modelsToTry) {
      const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${this.apiKey}`;
      
      // Attempt up to 2 tries per model (to handle temporary network spikes)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return { success: true, text, model };
          }

          if (res.status === 503 || res.status === 429) {
            // Demand spike: wait 800ms before retrying or falling back
            await new Promise(r => setTimeout(r, 800 * attempt));
            continue;
          }

          const errBody = await res.json().catch(() => ({}));
          lastError = new Error(errBody?.error?.message || `Gemini API HTTP ${res.status}`);
          break; // Move to fallback model
        } catch (fetchErr) {
          lastError = fetchErr;
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    throw lastError || new Error('Failed to reach Gemini API after retries.');
  }

  /**
   * Process text message from farmer.
   */
  async processTextMessage(message, sessionContext = {}) {
    const userPrompt = `
Farmer Session Context:
- Current Stored Intent: ${sessionContext.currentIntent || 'NONE'}
- Collected Entities: ${JSON.stringify(sessionContext.entities || {})}
- Missing Details: ${JSON.stringify(sessionContext.missingFields || [])}
- Pending Action: ${JSON.stringify(sessionContext.pendingAction || null)}
- Recent Turns: ${JSON.stringify(sessionContext.history?.slice(-4) || [])}

Farmer says: "${message}"

Analyze the farmer's utterance. Extract intent, crop, quantity (normalized to kg: 1 quintal = 100 kg), expected price, or confirmation. Respond in the farmer's language with a concise, helpful response. Follow the JSON schema strictly.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ];

    const result = await this.generateContent({ contents });
    return this.parseAndValidateResponse(result.text, message, sessionContext);
  }

  /**
   * Process audio recording directly using Gemini 3.7 Flash Audio understanding.
   */
  async processAudioInput({ audioBase64, mimeType = 'audio/webm' }, sessionContext = {}) {
    const contextPrompt = `
Farmer Session Context:
- Current Stored Intent: ${sessionContext.currentIntent || 'NONE'}
- Collected Entities: ${JSON.stringify(sessionContext.entities || {})}
- Missing Details: ${JSON.stringify(sessionContext.missingFields || [])}
- Pending Action: ${JSON.stringify(sessionContext.pendingAction || null)}
- Recent Turns: ${JSON.stringify(sessionContext.history?.slice(-4) || [])}

Listen carefully to the farmer's audio voice note.
Transcribe their speech accurately, identify their language (Hindi, Hinglish, English, or regional), extract intent and agricultural entities (crop, normalized quantity in kg, price, pickup date), and formulate a 1-3 sentence spoken response.
Respond strictly in JSON matching the Saarthi schema.`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: audioBase64
            }
          },
          { text: contextPrompt }
        ]
      }
    ];

    const result = await this.generateContent({ contents });
    return this.parseAndValidateResponse(result.text, '[Voice Audio Recording]', sessionContext);
  }

  /**
   * Robust JSON parser with fallback protection against malformed outputs.
   */
  parseAndValidateResponse(rawText, originalInput, sessionContext) {
    let parsed;
    try {
      // Clean possible markdown code fences
      const clean = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (err) {
      console.warn('Saarthi JSON parse fallback:', err.message, 'Raw text:', rawText);
      // Deterministic emergency fallback
      return {
        intent: 'UNKNOWN',
        language: 'hi',
        confidence: 0.5,
        entities: sessionContext.entities || {},
        missingFields: [],
        requiresConfirmation: false,
        pendingAction: null,
        response: 'नमस्ते किसान भाई! मैं आपकी पूरी बात समझ नहीं पाया। कृपया दोबारा बोलें।'
      };
    }

    return parsed;
  }
}

export const defaultGeminiService = new GeminiService();
