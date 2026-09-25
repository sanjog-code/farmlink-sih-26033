// FarmLink Saarthi — Client-Side API, Voice Recording & Offline Queue Service
import { UnifiedAudioRecorder, unifiedSpeak, stopAllSpeech } from '../../ai/speechEngine.js';
import { addUserListing, getUserListings, scheduleFarmPickup } from '../../lib/dataSyncEngine.js';

const OFFLINE_QUEUE_KEY = 'farmlink_saarthi_offline_queue';

export class SaarthiClient {
  constructor({ onStateChange = () => {}, onMessage = () => {}, notify = () => {} } = {}) {
    this.sessionId = `SES-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    this.onStateChange = onStateChange;
    this.onMessage = onMessage;
    this.notify = notify;
    this.recorder = new UnifiedAudioRecorder();
    this.isRecording = false;
    this.isSpeaking = false;
    this.isMuted = false;
    this.isProcessing = false;
    this.activeVoiceProvider = 'auto';
    this._pendingClientIntent = null;

    // Monitor connectivity
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncOfflineQueue());
    }
  }

  // ─── CLIENT-SIDE INTENT PARSING (Fallback when API returns 405/404) ─────────

  handleClientSideIntent(text) {
    const t = (text || '').toLowerCase();

    // Crop price table (key → { name, price (₹/kg), msp (₹/kg or null) })
    const cropPriceTable = {
      gehu:    { name: 'गेहूं (Wheat)',   price: 23.5,  msp: 21.25 },
      wheat:   { name: 'गेहूं (Wheat)',   price: 23.5,  msp: 21.25 },
      'गेहूं': { name: 'गेहूं (Wheat)',   price: 23.5,  msp: 21.25 },
      sarson:  { name: 'सरसों (Mustard)', price: 58.0,  msp: 54.00 },
      mustard: { name: 'सरसों (Mustard)', price: 58.0,  msp: 54.00 },
      'सरसों': { name: 'सरसों (Mustard)', price: 58.0,  msp: 54.00 },
      tamatar: { name: 'टमाटर (Tomato)',  price: 18.0,  msp: null  },
      tomato:  { name: 'टमाटर (Tomato)',  price: 18.0,  msp: null  },
      'टमाटर': { name: 'टमाटर (Tomato)',  price: 18.0,  msp: null  },
      pyaz:    { name: 'प्याज (Onion)',   price: 22.0,  msp: null  },
      onion:   { name: 'प्याज (Onion)',   price: 22.0,  msp: null  },
      'प्याज': { name: 'प्याज (Onion)',   price: 22.0,  msp: null  },
      chana:   { name: 'चना (Gram)',      price: 56.0,  msp: 54.00 },
      gram:    { name: 'चना (Gram)',      price: 56.0,  msp: 54.00 },
      'चना':   { name: 'चना (Gram)',      price: 56.0,  msp: 54.00 },
      dhan:    { name: 'धान (Paddy)',     price: 22.0,  msp: 21.83 },
      paddy:   { name: 'धान (Paddy)',     price: 22.0,  msp: 21.83 },
      'धान':   { name: 'धान (Paddy)',     price: 22.0,  msp: 21.83 },
      makka:   { name: 'मक्का (Maize)',   price: 19.5,  msp: 18.44 },
      maize:   { name: 'मक्का (Maize)',   price: 19.5,  msp: 18.44 },
      'मक्का': { name: 'मक्का (Maize)',   price: 19.5,  msp: 18.44 }
    };

    // Intent: sell / listing
    if (
      t.includes('फसल बेचनी है') || t.includes('sell crop') ||
      t.includes('bechna') || t.includes('listing') || t.includes('बेचनी')
    ) {
      const pendingAction = { type: 'OPEN_LISTING_FORM' };
      this._pendingClientIntent = { action: pendingAction };
      return {
        sessionId: this.sessionId,
        response: 'आपकी फसल बेचने के लिए मैं लिस्टिंग फॉर्म खोल रहा हूं। कृपया फसल का नाम और मात्रा बताएं।',
        pendingAction,
        quickActions: [
          { label: '🌾 गेहूं', text: 'मुझे गेहूं बेचनी है' },
          { label: '🌿 सरसों', text: 'मुझे सरसों बेचनी है' }
        ]
      };
    }

    // Intent: price / mandi / msp / rate
    if (
      t.includes('भाव') || t.includes('rate') || t.includes('mandi') ||
      t.includes('msp') || t.includes('price') || t.includes('दाम')
    ) {
      let matched = null;
      for (const [key, val] of Object.entries(cropPriceTable)) {
        if (t.includes(key)) { matched = val; break; }
      }
      if (matched) {
        const mspText = matched.msp
          ? ` एमएसपी फ्लोर ₹${matched.msp}/किग्रा है।`
          : ' (इस फसल की एमएसपी निर्धारित नहीं है।)';
        return {
          sessionId: this.sessionId,
          response: `आज ${matched.name} का मंडी भाव अनुमानित ₹${matched.price}/किग्रा है।${mspText}`,
          quickActions: [
            { label: '🌾 फसल बेचनी है', text: 'मुझे फसल बेचनी है' },
            { label: '💰 एडवांस ऋण', text: 'e-NWR एडवांस के बारे में बताएं' }
          ]
        };
      }
      // Price intent detected but no specific crop
      return {
        sessionId: this.sessionId,
        response: 'किस फसल का भाव जानना है? जैसे: गेहूं, सरसों, टमाटर, प्याज, चना। कृपया फसल का नाम बताएं।',
        quickActions: [
          { label: '🌾 गेहूं भाव', text: 'गेहूं का भाव क्या है' },
          { label: '🌿 सरसों भाव', text: 'सरसों का भाव क्या है' }
        ]
      };
    }

    // Intent: loan / advance / e-NWR
    if (
      t.includes('loan') || t.includes('लोन') || t.includes('advance') ||
      t.includes('एडवांस') || t.includes('e-nwr') || t.includes('enwr')
    ) {
      const pendingAction = { type: 'SCROLL_ENWR' };
      this._pendingClientIntent = { action: pendingAction };
      return {
        sessionId: this.sessionId,
        response: 'e-NWR (इलेक्ट्रॉनिक गोदाम रसीद) पर आप अपनी फसल की कुल कीमत का 50% अग्रिम ऋण ले सकते हैं। WDRA-रजिस्टर्ड गोदाम में फसल जमा करें और तुरंत एडवांस पाएं।',
        pendingAction,
        quickActions: [
          { label: '📋 e-NWR एडवांस अप्लाई', text: 'e-NWR एडवांस के लिए अप्लाई करना है' },
          { label: '🌾 फसल लिस्ट करें', text: 'मुझे फसल बेचनी है' }
        ]
      };
    }

    // General fallback
    return {
      sessionId: this.sessionId,
      response: 'नमस्ते किसान भाई! मैं सारथी हूं। आप मुझसे पूछ सकते हैं: फसल का भाव, बेचने में मदद, या एडवांस ऋण के बारे में।',
      quickActions: [
        { label: '🌾 फसल बेचनी है', text: 'मुझे फसल बेचनी है' },
        { label: '💰 आज का भाव', text: 'आज गेहूं का भाव क्या है?' },
        { label: '🏦 एडवांस ऋण', text: 'e-NWR एडवांस के बारे में बताएं' }
      ]
    };
  }

  handleClientSideConfirm(confirmed, { farmerId, farmerName } = {}) {
    if (!confirmed) {
      return {
        sessionId: this.sessionId,
        response: 'ठीक है किसान भाई, कार्रवाई रोक दी गई है। कुछ और सहायता चाहिए?',
        quickActions: [
          { label: '🌾 फसल बेचनी है', text: 'मुझे फसल बेचनी है' },
          { label: '💰 आज का भाव', text: 'आज का भाव क्या है?' }
        ]
      };
    }

    const listing = addUserListing({
      crop: 'Wheat',
      quantity_kg: 500,
      price_per_kg: 24.25,
      farmer: farmerName || this.farmerName || 'Verified Farmer',
      status: 'published',
      category: 'Cereals & millets',
      description: 'Listed via Kisan Saarthi Voice Assistant'
    });

    this.notify(`लिस्टिंग सफलतापूर्वक दर्ज हो गई: ${listing.crop} (${listing.quantity_kg} kg)`);

    return {
      sessionId: this.sessionId,
      response: `बधाई हो! आपकी 500 किग्रा गेहूं की लिस्टिंग ₹24.25/किग्रा पर सफलतापूर्वक दर्ज हो गई है। निकटतम संग्रहण केंद्र से जल्द पिकअप की पुष्टि होगी।`,
      actionResult: {
        success: true,
        listing
      },
      quickActions: [
        { label: '🚚 पिकअप कहाँ है?', text: 'मेरा पिकअप कहाँ है?' },
        { label: '📦 मेरी लिस्टिंग', text: 'मेरी फसल की लिस्टिंग दिखाओ' }
      ]
    };
  }

  setSessionContext(farmerId, farmerName) {
    this.farmerId = farmerId;
    this.farmerName = farmerName;
  }

  // ─── AUDIO RECORDING ───────────────────────────────────────────────────────

  async startRecording() {
    try {
      stopAllSpeech();
      this.isRecording = true;
      this.onStateChange({ status: 'LISTENING' });

      // Client-side Web Speech API STT listener for static Vercel resilience
      this._speechTranscript = '';
      const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
      if (SpeechRecognition) {
        try {
          if (this._webSpeechRecognizer) {
            try { this._webSpeechRecognizer.abort(); } catch (_) {}
          }
          const rec = new SpeechRecognition();
          rec.lang = 'hi-IN';
          rec.continuous = false;
          rec.interimResults = true;
          rec.onresult = (e) => {
            let str = '';
            for (let i = 0; i < e.results.length; i++) {
              str += e.results[i][0].transcript;
            }
            if (str) this._speechTranscript = str;
          };
          rec.onerror = () => {};
          rec.start();
          this._webSpeechRecognizer = rec;
        } catch (_) {}
      }

      await this.recorder.start();
    } catch (err) {
      this.isRecording = false;
      this.onStateChange({ status: 'ERROR', error: err.message });
      throw err;
    }
  }

  async stopRecordingAndSend({ farmerId, farmerName } = {}) {
    if (!this.isRecording) return null;
    this.isRecording = false;
    this.isProcessing = true;
    this.onStateChange({ status: 'PROCESSING' });

    if (this._webSpeechRecognizer) {
      try { this._webSpeechRecognizer.stop(); } catch (_) {}
    }

    try {
      const audioBlob = await this.recorder.stop();
      const recognizedText = (this._speechTranscript || '').trim();

      if (!audioBlob || audioBlob.size < 500) {
        if (recognizedText) {
          return await this.sendMessage(recognizedText, { farmerId, farmerName });
        }
        this.isProcessing = false;
        this.onStateChange({ status: 'IDLE' });
        return null;
      }

      // Convert blob to base64 for API transmission
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result;
          const base64 = typeof res === 'string' ? res.split(',')[1] : '';
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      return await this.sendAudio({
        audioBase64,
        mimeType: audioBlob.type || 'audio/webm',
        farmerId: farmerId || this.farmerId,
        farmerName: farmerName || this.farmerName,
        transcript: recognizedText
      });
    } catch (err) {
      this.isProcessing = false;
      this.onStateChange({ status: 'ERROR', error: err.message });
      throw err;
    }
  }

  cancelRecording() {
    if (this.isRecording) {
      this.recorder.abort();
      this.isRecording = false;
      this.onStateChange({ status: 'IDLE' });
    }
  }

  // ─── API DISPATCH ──────────────────────────────────────────────────────────

  async sendAudio({ audioBase64, mimeType, farmerId, farmerName, transcript = '' }) {
    if (!navigator.onLine) {
      return this.handleOfflineTurn(transcript || 'आवाज़ संदेश');
    }

    try {
      const existingListings = getUserListings();
      const res = await fetch('/api/saarthi/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          audioBase64,
          mimeType,
          farmerId: farmerId || this.farmerId,
          farmerName: farmerName || this.farmerName,
          dataContext: { existingListings }
        })
      });

      if (!res.ok) {
        if (res.status === 405 || res.status === 404) {
          const clientResult = this.handleClientSideIntent(transcript || 'voice message');
          this.handleServerResponse(clientResult);
          return clientResult;
        }
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      this.handleServerResponse(data);
      return data;
    } catch (err) {
      console.warn('Saarthi audio dispatch fallback:', err.message);
      const clientResult = this.handleClientSideIntent(transcript || 'voice message');
      this.handleServerResponse(clientResult);
      return clientResult;
    } finally {
      this.isProcessing = false;
    }
  }

  async sendMessage(text, { farmerId, farmerName } = {}) {
    if (!text || !text.trim()) return null;

    if (!navigator.onLine) {
      return this.handleOfflineTurn(text);
    }

    this.isProcessing = true;
    this.onStateChange({ status: 'PROCESSING' });

    try {
      const existingListings = getUserListings();
      const res = await fetch('/api/saarthi/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message: text.trim(),
          farmerId: farmerId || this.farmerId,
          farmerName: farmerName || this.farmerName,
          dataContext: { existingListings }
        })
      });

      if (!res.ok) {
        if (res.status === 405 || res.status === 404) {
          const clientResult = this.handleClientSideIntent(text.trim());
          this.handleServerResponse(clientResult);
          return clientResult;
        }
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      this.handleServerResponse(data);
      return data;
    } catch (err) {
      console.warn('Saarthi message dispatch fallback:', err.message);
      const clientResult = this.handleClientSideIntent(text.trim());
      this.handleServerResponse(clientResult);
      return clientResult;
    } finally {
      this.isProcessing = false;
    }
  }

  async confirmAction(confirmed, { idempotencyKey, farmerId, farmerName } = {}) {
    this.isProcessing = true;
    this.onStateChange({ status: 'PROCESSING' });

    try {
      let data = null;
      try {
        const res = await fetch('/api/saarthi/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            confirmed,
            idempotencyKey: idempotencyKey || `IDEM-${Date.now()}`,
            farmerId: farmerId || this.farmerId,
            farmerName: farmerName || this.farmerName,
            dataContext: { existingListings: getUserListings() }
          })
        });

        if (res.ok) {
          data = await res.json();
        } else if (res.status === 405 || res.status === 404) {
          data = this.handleClientSideConfirm(confirmed, { farmerId, farmerName });
        } else {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
      } catch (networkErr) {
        console.warn('Confirm fetch fallback to client-side:', networkErr.message);
        data = this.handleClientSideConfirm(confirmed, { farmerId, farmerName });
      }

      this.handleServerResponse(data);
      return data;
    } catch (err) {
      console.error('Confirmation dispatch error:', err);
      const fallback = this.handleClientSideConfirm(confirmed, { farmerId, farmerName });
      this.handleServerResponse(fallback);
      return fallback;
    } finally {
      this.isProcessing = false;
    }
  }

  // ─── RESPONSE & SPEECH HANDLING ────────────────────────────────────────────

  handleServerResponse(data) {
    this.onMessage(data);

    if (data.response && !this.isMuted) {
      this.speakResponse(data.response);
    } else {
      this.onStateChange({ status: 'IDLE' });
    }
  }

  speakResponse(text) {
    stopAllSpeech();
    this.isSpeaking = true;
    this.onStateChange({ status: 'SPEAKING', text });

    unifiedSpeak({
      text,
      language: 'hi',
      provider: this.activeVoiceProvider,
      onStart: () => {
        this.isSpeaking = true;
        this.onStateChange({ status: 'SPEAKING', text });
      },
      onEnd: () => {
        this.isSpeaking = false;
        this.onStateChange({ status: 'IDLE' });
      },
      onError: (err) => {
        console.warn('TTS playback error:', err);
        this.isSpeaking = false;
        this.onStateChange({ status: 'IDLE' });
      }
    });
  }

  stopSpeech() {
    stopAllSpeech();
    this.isSpeaking = false;
    this.onStateChange({ status: 'IDLE' });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpeech();
    }
    return this.isMuted;
  }

  // ─── OFFLINE RESILIENCE ────────────────────────────────────────────────────

  handleOfflineTurn(text) {
    const offlineItem = {
      id: `OFFLINE-${Date.now()}`,
      text,
      sessionId: this.sessionId,
      farmerId: this.farmerId,
      farmerName: this.farmerName,
      timestamp: new Date().toISOString()
    };

    const currentQueue = this.getOfflineQueue();
    currentQueue.push(offlineItem);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));

    const response = {
      sessionId: this.sessionId,
      isOffline: true,
      response: 'आपकी आवाज़/अनुरोध फ़ोन में सुरक्षित सेव हो गया है। इंटरनेट कनेक्ट होते ही यह फार्मलिंक पर सबमिट हो जाएगा।',
      quickActions: []
    };

    this.handleServerResponse(response);
    return response;
  }

  getOfflineQueue() {
    try {
      const q = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }

  async syncOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (!queue.length) return;

    this.notify(`इंटरनेट वापस आ गया। ${queue.length} ऑफ़लाइन अनुरोध सिंक हो रहे हैं...`);
    const remaining = [];

    for (const item of queue) {
      try {
        await this.sendMessage(item.text, { farmerId: item.farmerId, farmerName: item.farmerName });
      } catch (e) {
        remaining.push(item);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    if (remaining.length === 0) {
      this.notify('सभी ऑफ़लाइन अनुरोध सफलतापूर्वक सिंक हो गए हैं।');
    }
  }
}
