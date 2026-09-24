// FarmLink Saarthi — Master Conversational State Machine & Business Engine
// Enforces deterministic state management, unit normalization, and genuine tool execution.

import { GeminiService } from './geminiService.js';
import * as tools from './saarthiTools.js';
import { normalizeCropName, normalizeQuantityToKg } from './saarthiTools.js';
import { getMspFloorForCrop } from '../../src/lib/mspRates.js';

// In-memory conversation state store (with automatic TTL cleanup)
const sessionStore = new Map();
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getOrCreateSession(sessionId, farmerContext = {}) {
  const id = sessionId || `SES-${Date.now().toString(36).slice(-6)}`;
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

  /**
   * Main conversation turn processor.
   * Handles text message or audio input, routes through Gemini, and executes state machine.
   */
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

    let aiResult;
    try {
      if (audioBase64) {
        aiResult = await this.gemini.processAudioInput({ audioBase64, mimeType }, session);
      } else if (message) {
        aiResult = await this.gemini.processTextMessage(message, session);
      } else {
        return {
          sessionId: session.id,
          response: 'नमस्ते! मैं फार्मलिंक सारथी हूँ। बताइए, मैं आपकी क्या मदद कर सकता हूँ?',
          state: session
        };
      }
    } catch (llmErr) {
      console.warn('Saarthi LLM processing error:', llmErr.message);
      // Deterministic rule-based fallback when LLM is unreachable/rate-limited
      aiResult = this.ruleBasedFallback(message || '', session);
    }

    // Merge entities and update session state
    this.updateSessionState(session, aiResult);

    // Run deterministic state machine logic
    const finalResponse = await this.executeStateMachine(session, aiResult, dataContext);

    // Append to bounded conversation history (max 6 turns)
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

  /**
   * Deterministic State Machine for multi-step workflows (SELL_CROP, etc.)
   */
  async executeStateMachine(session, aiResult, dataContext = {}) {
    const intent = (aiResult.intent && aiResult.intent !== 'UNKNOWN') ? aiResult.intent : (session.currentIntent || 'UNKNOWN');

    // ─── 1. USER SAYS YES / CONFIRMS ──────────────────────────────────────────
    if (intent === 'CONFIRMATION_YES' || this.isAffirmative(aiResult.response)) {
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

          return {
            response: `बहुत बढ़िया! आपकी ${action.quantityKg} किलो ${action.crop} की लिस्टिंग सफलतापूर्वक बन गई है। यह तुरंत बाज़ार में दिखने लगी है।`,
            actionResult: res
          };
        }

        if (action.type === 'BOOK_PICKUP') {
          const res = await tools.tool_bookProducePickup({
            crop: action.crop,
            quantityKg: action.quantityKg,
            pickupAddress: action.pickupAddress || 'Farmgate',
            farmerName: session.farmerName
          });

          return {
            response: `आपकी ${action.crop} की घर से पिकअप सफलतापूर्वक बुक हो गई है। वाहन चालक महिंद्रा सिंह आपसे संपर्क करेंगे।`,
            actionResult: res
          };
        }
      }
    }

    // ─── 2. USER SAYS NO / CANCELS ───────────────────────────────────────────
    if (intent === 'CONFIRMATION_NO' || this.isNegative(aiResult.response)) {
      if (session.pendingAction) {
        session.pendingAction = null;
        return {
          response: 'ठीक है, मैंने यह कार्य रोक दिया है। आप जब चाहें दोबारा बता सकते हैं।'
        };
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
        return {
          response: 'नमस्ते किसान भाई! आप कौन सी फसल बेचना चाहते हैं?'
        };
      }

      // Question 2: How much quantity?
      if (!qty || qty <= 0) {
        session.missingFields = ['quantityKg'];
        return {
          response: `आपके पास कितना ${crop} है? आप किलो या क्विंटल में बता सकते हैं।`
        };
      }

      // We have crop and quantity! Check MSP floor
      const mspFloor = getMspFloorForCrop(crop);
      const expectedPrice = session.entities.expectedPricePerKg || (mspFloor.price > 0 ? Math.round(mspFloor.price * 1.08) : 25);
      session.entities.expectedPricePerKg = expectedPrice;

      // Ask for confirmation before creating listing
      session.missingFields = [];
      session.pendingAction = {
        type: 'CREATE_LISTING',
        crop,
        quantityKg: qty,
        pricePerKg: expectedPrice,
        grade: session.entities.grade || 'A',
        mspProtected: Boolean(mspFloor.price > 0)
      };

      const mspText = mspFloor.price > 0 ? ` (MSP सुरक्षित: ₹${mspFloor.price}/किलो)` : '';
      return {
        response: `आप ${qty} किलो ${crop} ₹${expectedPrice}/किलो के भाव पर${mspText} लिस्ट करना चाहते हैं। क्या मैं लिस्टिंग बना दूँ?`
      };
    }

    // ─── 4. WORKFLOW: CHECK MARKET PRICE / MSP ───────────────────────────────
    if (intent === 'CHECK_MARKET_PRICE') {
      const crop = session.entities.crop || 'Wheat';
      const mspData = await tools.tool_getCropMarketPrice({ crop });

      if (mspData.found && mspData.mspPricePerKg) {
        return {
          response: `${mspData.crop} का आधिकारिक न्यूनतम समर्थन मूल्य (MSP) ₹${mspData.mspPricePerKg} प्रति किलो यानी ₹${mspData.mspPricePerQuintal} प्रति क्विंटल है (${mspData.marketingSeason})।`
        };
      }

      return {
        response: `${crop} का नवीनतम आधिकारिक मंडी रेट अभी उपलब्ध नहीं है। हमारे पास सरकारी न्यूनतम मूल्य की सूची उपलब्ध है।`
      };
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
        return {
          response: 'अभी आपकी कोई सक्रिय फसल लिस्टिंग नहीं है। क्या आप कोई फसल बेचना चाहते हैं?'
        };
      }

      const summary = res.listings.slice(0, 2).map(l => `${l.quantityKg} किलो ${l.crop}`).join(' और ');
      return {
        response: `आपकी कुल ${res.count} फसल लिस्टिंग चालू हैं: ${summary}।`
      };
    }

    // ─── 6. WORKFLOW: BOOK PICKUP ────────────────────────────────────────────
    if (intent === 'BOOK_PICKUP') {
      session.currentIntent = 'BOOK_PICKUP';
      const crop = session.entities.crop;
      const qty = session.entities.quantityKg;

      if (!crop) {
        return { response: 'आप कौन सी फसल की खेत से पिकअप बुक करना चाहते हैं?' };
      }
      if (!qty) {
        return { response: `पिकअप के लिए कितना ${crop} तैयार है?` };
      }

      session.pendingAction = {
        type: 'BOOK_PICKUP',
        crop,
        quantityKg: qty
      };

      return {
        response: `हम आपके खेत से ${qty} किलो ${crop} की WDRA वेयरहाउस पिकअप बुक कर रहे हैं। क्या इसे पक्का करें?`
      };
    }

    // ─── 7. WORKFLOW: WAREHOUSE DEPOSIT / 50% PLEDGE ADVANCE ─────────────────
    if (intent === 'WAREHOUSE_DEPOSIT') {
      return {
        response: 'फार्मलिंक से जुड़े WDRA मान्यता प्राप्त वेयरहाउस में माल रखकर आप तुरंत 50% ई-NWR प्लेज लोन (7% ब्याज पर) पा सकते हैं ताकि आपको मजबूरी में सस्ता न बेचना पड़े।'
      };
    }

    // ─── 8. DEFAULT / GENERAL ADVICE ─────────────────────────────────────────
    return {
      response: aiResult.response || 'नमस्ते किसान भाई! आप फसल बेचने, आज का मंडी भाव जानने, या पिकअप बुक करने के लिए बोल सकते हैं।'
    };
  }

  /**
   * Updates session entities based on normalized AI extraction
   */
  updateSessionState(session, aiResult) {
    if (aiResult.intent && aiResult.intent !== 'UNKNOWN') {
      session.currentIntent = aiResult.intent;
    }

    if (aiResult.entities) {
      if (aiResult.entities.crop) {
        const norm = normalizeCropName(aiResult.entities.crop);
        session.entities.crop = norm ? norm.canonical : aiResult.entities.crop;
      }
      if (aiResult.entities.quantityKg) {
        session.entities.quantityKg = normalizeQuantityToKg(aiResult.entities.quantityKg);
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
  }

  isAffirmative(text = '') {
    const t = text.toLowerCase();
    return t.includes('हाँ') || t.includes('haan') || t.includes('yes') || t.includes('sahi hai') || t.includes('bana do') || t.includes('kardo') || t.includes('pakka');
  }

  isNegative(text = '') {
    const t = text.toLowerCase();
    return t.includes('नहीं') || t.includes('nahi') || t.includes('no') || t.includes('mat karo') || t.includes('ruko') || t.includes('cancel');
  }

  /**
   * Deterministic rule-based fallback when offline or LLM unavailable
   */
  ruleBasedFallback(text = '', session) {
    const t = text.toLowerCase();

    // 0. Security & Prompt Injection Defense
    if (t.includes('password') || t.includes('database') || t.includes('ignore previous') || t.includes('attacker') || t.includes('admin password')) {
      return {
        intent: 'UNKNOWN',
        entities: {},
        response: 'नमस्ते किसान भाई! मैं फार्मलिंक का कृषि सारथी हूँ। मैं केवल आपकी फसल बेचने, मंडी भाव जानने और सहायता में मदद कर सकता हूँ।'
      };
    }

    // Check crop
    let foundCrop = null;
    if (t.includes('gehu') || t.includes('wheat') || t.includes('गेहूं')) foundCrop = 'Wheat';
    else if (t.includes('sarson') || t.includes('mustard') || t.includes('सरसों')) foundCrop = 'Mustard';
    else if (t.includes('pyaz') || t.includes('onion') || t.includes('प्याज')) foundCrop = 'Onion';
    else if (t.includes('tamatar') || t.includes('tomato') || t.includes('टमाटर')) foundCrop = 'Tomato';
    else if (t.includes('chana') || t.includes('gram') || t.includes('चना')) foundCrop = 'Gram';
    else if (session.entities.crop) foundCrop = session.entities.crop;

    // Check quantity
    let qty = null;
    const quintalMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:quintal|kuntal|क्विंटल|कुंतल)/);
    if (quintalMatch) {
      qty = Math.round(Number(quintalMatch[1]) * 100);
    } else if (t.includes('dhai quintal') || t.includes('ढाई')) {
      qty = 250;
    } else {
      const kgMatch = t.match(/(\d+)\s*(?:kg|kilo|किलो)/);
      if (kgMatch) qty = Number(kgMatch[1]);
      else if (session.entities.quantityKg) qty = session.entities.quantityKg;
    }

    // 1. Confirmations
    if (t.includes('haan') || t.includes('हाँ') || t.includes('yes') || t.includes('sahi') || t.includes('bana do') || t.includes('kardo')) {
      return { intent: 'CONFIRMATION_YES', entities: { crop: foundCrop, quantityKg: qty }, response: 'हाँ' };
    }
    if (t.includes('nahi') || t.includes('नहीं') || t.includes('cancel') || t.includes('mat karo') || t.includes('ruko')) {
      return { intent: 'CONFIRMATION_NO', entities: { crop: foundCrop, quantityKg: qty }, response: 'नहीं' };
    }

    // 2. Query Listings
    if (t.includes('listing') || t.includes('meri fasal') || t.includes('मेरी फसल') || t.includes('लिस्टिंग') || t.includes('dikhao') || t.includes('दिखाओ')) {
      return { intent: 'CHECK_MY_LISTINGS', entities: {}, response: '' };
    }

    // 3. Price / Mandi Check
    if (t.includes('bhav') || t.includes('rate') || t.includes('msp') || t.includes('भाव') || t.includes('रेट')) {
      return { intent: 'CHECK_MARKET_PRICE', entities: { crop: foundCrop || 'Wheat' }, response: '' };
    }

    // 4. Pickup Booking
    if (t.includes('pickup') || t.includes('गाड़ी') || t.includes('पिकअप') || t.includes('उठाओ')) {
      return { intent: 'BOOK_PICKUP', entities: { crop: foundCrop, quantityKg: qty }, response: '' };
    }

    // 5. Sell Crop
    if (t.includes('bechna') || t.includes('sell') || t.includes('बेचना') || (foundCrop && qty)) {
      return { intent: 'SELL_CROP', entities: { crop: foundCrop, quantityKg: qty }, response: '' };
    }

    return {
      intent: 'UNKNOWN',
      entities: {},
      response: 'नमस्ते! मैं फार्मलिंक सारथी हूँ। बताइए, मैं आपकी क्या मदद कर सकता हूँ?'
    };
  }

  getRecommendedQuickActions(session) {
    if (session.pendingAction) {
      return [
        { label: '✅ हाँ, पक्का करें', text: 'हाँ, लिस्टिंग बना दो', primary: true },
        { label: '❌ नहीं, रोकें', text: 'नहीं, रोकें' }
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
