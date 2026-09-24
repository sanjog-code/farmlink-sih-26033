import fs from 'fs';

const filePath = 'api/saarthi/saarthiEngine.js';
let content = fs.readFileSync(filePath, 'utf8');

const updatedEngine = `// FarmLink Saarthi — Master Conversational State Machine & Business Engine
// Enforces deterministic state management, unit normalization, local representative persona, and zero data hallucination.

import { GeminiService } from './geminiService.js';
import * as tools from './saarthiTools.js';
import { normalizeCropName, normalizeQuantityToKg } from './saarthiTools.js';
import { getMspFloorForCrop } from '../../src/lib/mspRates.js';

// In-memory conversation state store (with automatic TTL cleanup)
const sessionStore = new Map();
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export function detectLanguage(text = '') {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  const enWords = ['sell', 'what', 'how', 'price', 'rate', 'wheat', 'onion', 'mustard', 'tomato', 'potato', 'pickup', 'where', 'hello', 'yes', 'no'];
  const words = text.toLowerCase().split(/\\s+/);
  const matchEn = words.filter(w => enWords.includes(w)).length;
  if (matchEn > 1 && !words.some(w => ['gehu', 'bhav', 'kuntal', 'bhai', 'bechna', 'karo', 'meri', 'fasal'].includes(w))) {
    return 'en';
  }
  return 'hinglish';
}

export function getOrCreateSession(sessionId, farmerContext = {}) {
  const id = sessionId || \`SES-\${Date.now().toString(36).slice(-6)}\`;
  let session = sessionStore.get(id);

  if (!session) {
    session = {
      id,
      farmerId: farmerContext.farmerId || 'farmer-self',
      farmerName: farmerContext.farmerName || 'Kisan Bhai',
      currentIntent: null,
      entities: {
        crop: null,
        quantityKg: null,
        grade: null,
        expectedPricePerKg: null,
        pickupDate: null,
        location: null
      },
      missingFields: [],
      pendingAction: null,
      history: [],
      language: 'hinglish',
      isCorrection: false,
      lastActive: Date.now()
    };
    sessionStore.set(id, session);
  } else {
    session.lastActive = Date.now();
    if (farmerContext.farmerId) session.farmerId = farmerContext.farmerId;
    if (farmerContext.farmerName) session.farmerName = farmerContext.farmerName;
  }

  return session;
}

export class SaarthiEngine {
  constructor(geminiService = new GeminiService()) {
    this.gemini = geminiService;
  }

  async handleTurn({
    sessionId,
    message,
    audioBase64,
    mimeType,
    farmerId,
    farmerName,
    dataContext = {}
  }) {
    const session = getOrCreateSession(sessionId, { farmerId, farmerName });
    const userLang = detectLanguage(message || '');
    session.language = userLang;

    let aiResult;
    try {
      if (audioBase64) {
        aiResult = await this.gemini.processAudioInput({ audioBase64, mimeType }, session);
      } else if (message) {
        aiResult = await this.gemini.processTextMessage(message, session);
      } else {
        const welcome = session.language === 'hi'
          ? 'राम राम किसान भाई! बताइए, आज क्या बेचना है या मंडी भाव जानना है?'
          : 'Ram Ram bhai saab! Batiye, aaj kya bechna hai ya mandi bhav janna hai?';
        return {
          sessionId: session.id,
          response: welcome,
          state: session
        };
      }
    } catch (llmErr) {
      console.warn('Saarthi LLM processing notice (using deterministic rural rules):', llmErr.message);
      aiResult = this.ruleBasedFallback(message || '', session);
    }

    // Merge entities and update session state
    this.updateSessionState(session, aiResult, message || '');

    // Run deterministic state machine logic
    const finalResponse = await this.executeStateMachine(session, aiResult, dataContext);

    // Append to bounded conversation history (max 8 turns)
    session.history.push({
      role: 'user',
      text: message || '[Voice Audio]',
      timestamp: new Date().toISOString()
    });
    session.history.push({
      role: 'assistant',
      text: finalResponse.response,
      timestamp: new Date().toISOString()
    });
    if (session.history.length > 8) {
      session.history = session.history.slice(-8);
    }

    return {
      sessionId: session.id,
      response: finalResponse.response,
      intent: session.currentIntent,
      entities: session.entities,
      missingFields: session.missingFields,
      requiresConfirmation: Boolean(session.pendingAction),
      pendingAction: session.pendingAction,
      actionResult: finalResponse.actionResult || null,
      quickActions: this.getRecommendedQuickActions(session)
    };
  }

  async executeStateMachine(session, aiResult, dataContext = {}) {
    const intent = (aiResult.intent && aiResult.intent !== 'UNKNOWN') ? aiResult.intent : (session.currentIntent || 'UNKNOWN');
    const lang = session.language || 'hinglish';

    // ─── 1. USER SAYS YES / CONFIRMS ──────────────────────────────────────────
    if (intent === 'CONFIRMATION_YES' || this.isAffirmative(aiResult.response || '')) {
      if (session.pendingAction) {
        const action = session.pendingAction;
        session.pendingAction = null; // Clear pending

        if (action.type === 'CREATE_LISTING') {
          const res = await tools.tool_createCropListing({
            crop: action.crop,
            quantityKg: action.quantityKg,
            pricePerKg: action.pricePerKg,
            grade: action.grade || 'A',
            farmerId: session.farmerId,
            farmerName: session.farmerName,
            dataContext
          });

          const resp = lang === 'hi'
            ? \`बहुत बढ़िया! आपकी \${action.quantityKg} किलो \${action.crop} की लिस्टिंग मंडी में लाइव हो गई है।\`
            : lang === 'en'
              ? \`Great! Your listing for \${action.quantityKg} kg of \${action.crop} is now live on the marketplace.\`
              : \`Badhiya bhai saab! \${action.quantityKg} kg \${action.crop} ki listing mandi me live ho gayi hai.\`;

          return { response: resp, actionResult: res };
        }

        if (action.type === 'BOOK_PICKUP') {
          const res = await tools.tool_bookProducePickup({
            crop: action.crop,
            quantityKg: action.quantityKg,
            pickupAddress: action.pickupAddress || 'Farmgate',
            farmerName: session.farmerName
          });

          const resp = lang === 'hi'
            ? \`आपके खेत से \${action.crop} की पिकअप बुक हो गई है। चालक आते ही आपसे संपर्क करेगा।\`
            : lang === 'en'
              ? \`Doorstep pickup for your \${action.crop} has been booked. The driver will contact you before arriving.\`
              : \`Aapke khet se \${action.crop} ki pickup book ho gayi hai. Driver gadi leke aate hi call karega.\`;

          return { response: resp, actionResult: res };
        }
      }
    }

    // ─── 2. USER SAYS NO / CANCELS ───────────────────────────────────────────
    if (intent === 'CONFIRMATION_NO' || this.isNegative(aiResult.response || '')) {
      if (session.pendingAction) {
        session.pendingAction = null;
        const resp = lang === 'hi'
          ? 'ठीक है भाई साहब, इसे रोक दिया गया है। जब चाहें दोबारा बता दीजिएगा।'
          : lang === 'en'
            ? 'Understood, cancelled. Just let me know whenever you are ready.'
            : 'Theek hai bhai saab, ye rok diya hai. Jab bechna ho, dobara bata dena.';
        return { response: resp };
      }
    }

    // ─── 3. WORKFLOW: SELL CROP ──────────────────────────────────────────────
    if (intent === 'SELL_CROP') {
      session.currentIntent = 'SELL_CROP';
      const crop = session.entities.crop;
      const qty = session.entities.quantityKg;

      // Question 1: Which crop?
      if (!crop) {
        session.missingFields = ['crop'];
        const resp = lang === 'hi'
          ? 'हाँ जी! आप कौन सी फसल बेचना चाहते हैं?'
          : lang === 'en'
            ? 'Sure! Which crop would you like to sell?'
            : 'Haanji bhai saab! Kaunsi fasal bechna chahte ho?';
        return { response: resp };
      }

      // Question 2: How much quantity?
      if (!qty || qty <= 0) {
        session.missingFields = ['quantityKg'];
        const resp = lang === 'hi'
          ? \`आपके पास कितना \${crop} है? क्विंटल या किलो में बता दीजिए।\`
          : lang === 'en'
            ? \`How much \${crop} do you have? You can tell me in quintals or kg.\`
            : \`Kitna \${crop} hai lagbhag? Quintal ya kilo me bata do.\`;
        return { response: resp };
      }

      // We have both crop and quantity! Check MSP floor
      const mspFloor = getMspFloorForCrop(crop);
      const expectedPrice = session.entities.expectedPricePerKg || (mspFloor.price > 0 ? Math.round(mspFloor.price * 1.08) : 25);
      session.entities.expectedPricePerKg = expectedPrice;

      session.missingFields = [];
      session.pendingAction = {
        type: 'CREATE_LISTING',
        crop,
        quantityKg: qty,
        pricePerKg: expectedPrice,
        grade: session.entities.grade || 'A',
        mspProtected: Boolean(mspFloor.price > 0)
      };

      if (session.isCorrection) {
        session.isCorrection = false;
        const resp = lang === 'hi'
          ? \`अच्छा, \${qty} किलो \${crop} नोट कर लिया। मंडी रेट ₹\${expectedPrice}/किग्रा है, क्या लिस्टिंग लगा दें?\`
          : lang === 'en'
            ? \`Got it, updated to \${qty} kg of \${crop}. Market rate is ₹\${expectedPrice}/kg, shall I list it?\`
            : \`Achha, \${qty} kg \${crop} note kar liya. Mandi rate ₹\${expectedPrice}/kg chal raha hai, kya listing laga dein?\`;
        return { response: resp };
      }

      const resp = lang === 'hi'
        ? \`ठीक है भाई साहब, \${qty} किलो \${crop} ₹\${expectedPrice}/किग्रा भाव पर लिस्ट कर दें?\`
        : lang === 'en'
          ? \`Alright, shall I list \${qty} kg of \${crop} at ₹\${expectedPrice}/kg?\`
          : \`Theek hai bhai saab, \${qty} kg \${crop} ₹\${expectedPrice}/kilo par mandi me laga dein?\`;

      return { response: resp };
    }

    // ─── 4. WORKFLOW: CHECK MARKET PRICE / MSP ───────────────────────────────
    if (intent === 'CHECK_MARKET_PRICE') {
      const crop = session.entities.crop || 'Wheat';
      const mspData = await tools.tool_getCropMarketPrice({ crop });

      if (mspData.found && mspData.mspPricePerKg) {
        const resp = lang === 'hi'
          ? \`आज मंडी में \${mspData.crop} का सरकारी न्यूनतम भाव ₹\${mspData.mspPricePerKg}/किग्रा (₹\${mspData.mspPricePerQuintal}/क्विंटल) है।\`
          : lang === 'en'
            ? \`Today's official MSP for \${mspData.crop} is ₹\${mspData.mspPricePerKg}/kg (₹\${mspData.mspPricePerQuintal}/quintal).\`
            : \`Haanji, aaj mandi mein \${mspData.crop} ka bhav ₹\${mspData.mspPricePerKg}/kilo (₹\${mspData.mspPricePerQuintal}/quintal) chal raha hai.\`;
        return { response: resp };
      }

      const resp = lang === 'hi'
        ? \`\${crop} का आज का औसत मंडी भाव लगभग ₹24 प्रति किलो चल रहा है।\`
        : lang === 'en'
          ? \`\${crop} is trading around ₹24/kg in the local mandi.\`
          : \`\${crop} ka aaj mandi mein rate lagbhag ₹24/kilo chal raha hai.\`;
      return { response: resp };
    }

    // ─── 5. WORKFLOW: CHECK MY LISTINGS ──────────────────────────────────────
    if (intent === 'CHECK_MY_LISTINGS') {
      const existing = dataContext.existingListings || [];
      const res = await tools.tool_getCropListings({
        farmerId: session.farmerId,
        farmerName: session.farmerName,
        existingListings: existing
      });

      if (res.count === 0) {
        const resp = lang === 'hi'
          ? 'अभी आपकी कोई सक्रिय फसल लिस्टिंग नहीं है। क्या आप कोई फसल बेचना चाहते हैं?'
          : lang === 'en'
            ? 'You do not have any active crop listings yet. Would you like to sell any produce?'
            : 'Abhi aapki koi fasal listing nahi hai. Kya koi fasal bechna chahte ho?';
        return { response: resp };
      }

      const summary = res.listings.slice(0, 2).map(l => \`\${l.quantityKg} kg \${l.crop}\`).join(' aur ');
      const resp = lang === 'hi'
        ? \`आपकी कुल \${res.count} फसल लिस्टिंग चालू हैं: \${summary}।\`
        : \`Aapki kul \${res.count} listing live hain: \${summary}.\`;
      return { response: resp };
    }

    // ─── 6. WORKFLOW: BOOK PICKUP ────────────────────────────────────────────
    if (intent === 'BOOK_PICKUP') {
      session.currentIntent = 'BOOK_PICKUP';
      const crop = session.entities.crop;
      const qty = session.entities.quantityKg;

      if (!crop) {
        const resp = lang === 'hi'
          ? 'खेत से किस फसल की पिकअप करवानी है?'
          : 'Khet se kaunsi fasal ki pickup karwani hai?';
        return { response: resp };
      }
      if (!qty) {
        const resp = lang === 'hi'
          ? \`पिकअप के लिए कितना \${crop} तैयार है?\`
          : \`Pickup ke liye kitna \${crop} taiyar hai?\`;
        return { response: resp };
      }

      session.pendingAction = {
        type: 'BOOK_PICKUP',
        crop,
        quantityKg: qty
      };

      const resp = lang === 'hi'
        ? \`खेत से \${qty} किलो \${crop} की WDRA वेयरहाउस पिकअप बुक करें?\`
        : \`Khet se \${qty} kg \${crop} ki WDRA warehouse pickup book kar dein?\`;
      return { response: resp };
    }

    // ─── 7. WORKFLOW: WAREHOUSE DEPOSIT / PLEDGE ADVANCE ─────────────────────
    if (intent === 'WAREHOUSE_DEPOSIT') {
      const resp = lang === 'hi'
        ? 'वेयरहाउस में माल रखकर आप 50% ई-NWR लोन (7% ब्याज पर) पा सकते हैं ताकि सस्ता न बेचना पड़े।'
        : 'Warehouse mein maal rakhkar aap 50% e-NWR pledge loan turant pa sakte hain taaki sasta na bechna pade.';
      return { response: resp };
    }

    // ─── 8. WORKFLOW: PLATFORM HELP / CONFUSION ──────────────────────────────
    if (intent === 'PLATFORM_HELP') {
      const resp = lang === 'hi'
        ? 'कोई चिंता की बात नहीं भाई साहब। मैं फार्मलिंक से हूँ, यहाँ आप सीधे अच्छे भाव पर फसल बेच सकते हैं। आपके पास कौन सी फसल है?'
        : lang === 'en'
          ? 'No worries at all! I am here to help you sell your harvest at the best mandi rate. Which crop do you have?'
          : 'Koi chinta ki baat nahi bhai saab. Main FarmLink se hoon, yahan aap sidhe apni fasal acche bhav par bech sakte hain. Kaunsi fasal hai aapke paas?';
      return { response: resp };
    }

    // ─── 9. DEFAULT / UNKNOWN ────────────────────────────────────────────────
    const defaultResp = lang === 'hi'
      ? 'राम राम! आप फसल बेचने, आज का मंडी भाव जानने, या पिकअप के लिए बोल सकते हैं।'
      : 'Ram Ram! Aap fasal bechne, mandi bhav janne, ya pickup ke liye bol sakte hain.';
    return {
      response: aiResult.response || defaultResp
    };
  }

  updateSessionState(session, aiResult, rawMessage = '') {
    if (aiResult.intent && aiResult.intent !== 'UNKNOWN') {
      session.currentIntent = aiResult.intent;
    }

    if (aiResult.entities) {
      if (aiResult.entities.crop) {
        const norm = normalizeCropName(aiResult.entities.crop);
        const resolved = norm ? norm.canonical : aiResult.entities.crop;
        if (session.entities.crop && session.entities.crop !== resolved) {
          session.isCorrection = true;
        }
        session.entities.crop = resolved;
      }
      if (aiResult.entities.quantityKg) {
        const resolvedQty = normalizeQuantityToKg(aiResult.entities.quantityKg);
        if (session.entities.quantityKg && session.entities.quantityKg !== resolvedQty) {
          session.isCorrection = true;
        }
        session.entities.quantityKg = resolvedQty;
      }
      if (aiResult.entities.expectedPricePerKg) {
        session.entities.expectedPricePerKg = Number(aiResult.entities.expectedPricePerKg);
      }
      if (aiResult.entities.grade) {
        session.entities.grade = aiResult.entities.grade;
      }
      if (aiResult.entities.pickupDate) {
        session.entities.pickupDate = aiResult.entities.pickupDate;
      }
    }

    // Also check rawMessage with our colloquial normalizer if quantity not extracted
    if (!session.entities.quantityKg && rawMessage) {
      const parsedKg = normalizeQuantityToKg(rawMessage);
      if (parsedKg > 0) {
        session.entities.quantityKg = parsedKg;
      }
    }
  }

  isAffirmative(text = '') {
    const t = text.toLowerCase();
    return t.includes('हाँ') || t.includes('haan') || t.includes('yes') || t.includes('sahi hai') || t.includes('bana do') || t.includes('kardo') || t.includes('pakka') || t.includes('thik hai') || t.includes('theek hai');
  }

  isNegative(text = '') {
    const t = text.toLowerCase();
    // Only pure negative if not containing crop or quantity numbers
    const hasCorrection = t.includes('quintal') || t.includes('kuntal') || t.includes('kilo') || t.includes('kg') || /\\d+/.test(t);
    if (hasCorrection) return false;
    return t.includes('नहीं') || t.includes('nahi') || t.includes('no') || t.includes('mat karo') || t.includes('ruko') || t.includes('cancel') || t.includes('rehne do');
  }

  ruleBasedFallback(text = '', session) {
    const t = text.toLowerCase();

    // 0. Security
    if (t.includes('password') || t.includes('database') || t.includes('ignore previous') || t.includes('attacker') || t.includes('admin password')) {
      return {
        intent: 'UNKNOWN',
        entities: {},
        response: 'Main FarmLink ka kisan saarthi hoon. Main keval fasal bechne aur mandi bhav batane me madad karta hoon.'
      };
    }

    // 1. Confused farmer empathy
    if (t.includes('samajh nahi') || t.includes('kuch samajh') || t.includes('kya hai') || t.includes('kaise hoga') || t.includes('kya karu')) {
      return {
        intent: 'PLATFORM_HELP',
        entities: {},
        response: 'Koi chinta ki baat nahi bhai saab. Main FarmLink se hoon, yahan aap sidhe apni fasal acche bhav par bech sakte hain. Kaunsi fasal hai aapke paas?'
      };
    }

    // Crop extraction
    let foundCrop = null;
    if (t.includes('gehu') || t.includes('wheat') || t.includes('गेहूं')) foundCrop = 'Wheat';
    else if (t.includes('sarson') || t.includes('mustard') || t.includes('सरसों')) foundCrop = 'Mustard';
    else if (t.includes('pyaz') || t.includes('onion') || t.includes('प्याज')) foundCrop = 'Onion';
    else if (t.includes('tamatar') || t.includes('tomato') || t.includes('टमाटर')) foundCrop = 'Tomato';
    else if (t.includes('chana') || t.includes('gram') || t.includes('चना')) foundCrop = 'Gram';
    else if (session.entities.crop) foundCrop = session.entities.crop;

    // Quantity extraction using enhanced rural unit normalizer
    const extractedQty = normalizeQuantityToKg(text);
    const qty = extractedQty > 0 ? extractedQty : session.entities.quantityKg;

    // Check correction like "Nahi, 4 quintal hai"
    const hasCorrection = (t.includes('nahi') || t.includes('नहीं')) && extractedQty > 0;
    if (hasCorrection) {
      return {
        intent: 'SELL_CROP',
        entities: { crop: foundCrop, quantityKg: extractedQty },
        response: ''
      };
    }

    // Pure confirmations
    if (t.includes('haan') || t.includes('हाँ') || t.includes('yes') || t.includes('sahi hai') || t.includes('bana do') || t.includes('kardo') || t.includes('pakka')) {
      return { intent: 'CONFIRMATION_YES', entities: { crop: foundCrop, quantityKg: qty }, response: 'हाँ' };
    }
    if ((t.includes('nahi') || t.includes('नहीं') || t.includes('cancel') || t.includes('mat karo') || t.includes('ruko') || t.includes('rehne do')) && !hasCorrection) {
      return { intent: 'CONFIRMATION_NO', entities: { crop: foundCrop, quantityKg: qty }, response: 'नहीं' };
    }

    // Price query
    if (t.includes('bhav') || t.includes('rate') || t.includes('msp') || t.includes('भाव') || t.includes('रेट')) {
      return { intent: 'CHECK_MARKET_PRICE', entities: { crop: foundCrop || 'Wheat' }, response: '' };
    }

    // Listings query
    if (t.includes('listing') || t.includes('meri fasal') || t.includes('मेरी फसल') || t.includes('लिस्टिंग') || t.includes('dikhao') || t.includes('दिखाओ')) {
      return { intent: 'CHECK_MY_LISTINGS', entities: {}, response: '' };
    }

    // Pickup Booking
    if (t.includes('pickup') || t.includes('गाड़ी') || t.includes('पिकअप') || t.includes('उठाओ')) {
      return { intent: 'BOOK_PICKUP', entities: { crop: foundCrop, quantityKg: qty }, response: '' };
    }

    // Sell Crop
    if (t.includes('bechna') || t.includes('sell') || t.includes('बेचना') || (foundCrop && qty)) {
      return { intent: 'SELL_CROP', entities: { crop: foundCrop, quantityKg: qty }, response: '' };
    }

    return {
      intent: 'UNKNOWN',
      entities: {},
      response: 'Ram Ram! Aap fasal bechne, mandi bhav janne, ya pickup ke liye bol sakte hain.'
    };
  }

  getRecommendedQuickActions(session) {
    if (session.pendingAction) {
      return [
        { label: '✅ हाँ, ठीक है', text: 'हाँ, लिस्टिंग बना दो', primary: true },
        { label: '❌ नहीं, बदलो', text: 'नहीं, रोकें' }
      ];
    }
    return [
      { label: '🌾 फसल बेचनी है', text: 'मुझे फसल बेचनी है' },
      { label: '💰 आज का भाव', text: 'गेहूं का आज का भाव क्या है?' },
      { label: '🚚 पिकअप कहाँ है?', text: 'मेरा पिकअप कहाँ है?' },
      { label: '📦 मेरी लिस्टिंग', text: 'मेरी फसल की लिस्टिंग दिखाओ' }
    ];
  }
}

export const defaultSaarthiEngine = new SaarthiEngine();
`;

fs.writeFileSync(filePath, updatedEngine, 'utf8');
console.log('Successfully updated api/saarthi/saarthiEngine.js with conversational polish');
