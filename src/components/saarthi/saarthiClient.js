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

    // Monitor connectivity
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncOfflineQueue());
    }
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

    try {
      const audioBlob = await this.recorder.stop();
      if (!audioBlob || audioBlob.size < 500) {
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
        farmerName: farmerName || this.farmerName
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

  async sendAudio({ audioBase64, mimeType, farmerId, farmerName }) {
    if (!navigator.onLine) {
      return this.handleOfflineTurn('आवाज़ संदेश');
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
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      this.handleServerResponse(data);
      return data;
    } catch (err) {
      console.warn('Saarthi audio dispatch fallback:', err.message);
      // Fallback turn if backend API has transient error
      const fallback = {
        sessionId: this.sessionId,
        response: 'नमस्ते किसान भाई! आवाज़ साफ़ नहीं आई। कृपया दोबारा बोलें या नीचे दिए गए बटन पर टैप करें।',
        quickActions: [
          { label: '🌾 फसल बेचनी है', text: 'मुझे फसल बेचनी है' },
          { label: '💰 आज का भाव', text: 'आज का भाव क्या है?' }
        ]
      };
      this.handleServerResponse(fallback);
      return fallback;
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
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      this.handleServerResponse(data);
      return data;
    } catch (err) {
      console.warn('Saarthi message dispatch error:', err.message);
      const fallback = {
        sessionId: this.sessionId,
        response: 'नमस्ते किसान भाई! सारथी अभी व्यस्त है। कृपया कुछ क्षण बाद प्रयास करें।',
        quickActions: [{ label: '🌾 फसल बेचनी है', text: 'मुझे फसल बेचनी है' }]
      };
      this.handleServerResponse(fallback);
      return fallback;
    } finally {
      this.isProcessing = false;
    }
  }

  async confirmAction(confirmed, { idempotencyKey, farmerId, farmerName } = {}) {
    this.isProcessing = true;
    this.onStateChange({ status: 'PROCESSING' });

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

      const data = await res.json();
      this.handleServerResponse(data);

      // If a listing was created, commit it to local dataSyncEngine immediately
      if (data.actionResult?.success && data.actionResult?.listing) {
        const saved = addUserListing(data.actionResult.listing);
        this.notify(`लिस्टिंग सफलतापूर्वक जुड़ गई: ${saved.crop} (${saved.quantity_kg} kg)`);
      }

      // If a pickup was booked, commit it to local dataSyncEngine
      if (data.actionResult?.success && data.actionResult?.pickup) {
        scheduleFarmPickup({
          lotId: data.actionResult.pickup.pickupId,
          crop: data.actionResult.pickup.crop,
          qty: data.actionResult.pickup.quantityKg,
          cluster: 'Jaipur North cluster',
          farmer: this.farmerName || 'Verified Farmer'
        });
        this.notify(`खेत से पिकअप बुक हो गई: ${data.actionResult.pickup.crop}`);
      }

      return data;
    } catch (err) {
      console.error('Confirmation dispatch error:', err);
      this.onStateChange({ status: 'ERROR', error: err.message });
      throw err;
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
