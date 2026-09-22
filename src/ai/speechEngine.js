// FarmLink Unified Hybrid Speech Engine (SIH PS 26033)
// Merging Browser Web Speech API, Sarvam AI (Saaras & Bulbul), and Groq/OpenAI Whisper
import { CONSTITUTIONAL_LANGUAGES } from '../translations/constitutional22.js';

// Language code mapper between ISO, BCP-47, Sarvam, and Whisper
export const SPEECH_LANG_MAP = {
  hi: { bcp47: 'hi-IN', sarvam: 'hi-IN', whisper: 'hi', name: 'Hindi' },
  en: { bcp47: 'en-IN', sarvam: 'en-IN', whisper: 'en', name: 'Indian English' },
  bn: { bcp47: 'bn-IN', sarvam: 'bn-IN', whisper: 'bn', name: 'Bengali' },
  gu: { bcp47: 'gu-IN', sarvam: 'gu-IN', whisper: 'gu', name: 'Gujarati' },
  kn: { bcp47: 'kn-IN', sarvam: 'kn-IN', whisper: 'kn', name: 'Kannada' },
  ml: { bcp47: 'ml-IN', sarvam: 'ml-IN', whisper: 'ml', name: 'Malayalam' },
  mr: { bcp47: 'mr-IN', sarvam: 'mr-IN', whisper: 'mr', name: 'Marathi' },
  or: { bcp47: 'or-IN', sarvam: 'od-IN', whisper: 'or', name: 'Odia' },
  pa: { bcp47: 'pa-IN', sarvam: 'pa-IN', whisper: 'pa', name: 'Punjabi' },
  ta: { bcp47: 'ta-IN', sarvam: 'ta-IN', whisper: 'ta', name: 'Tamil' },
  te: { bcp47: 'te-IN', sarvam: 'te-IN', whisper: 'te', name: 'Telugu' },
  as: { bcp47: 'as-IN', sarvam: 'as-IN', whisper: 'as', name: 'Assamese' },
  ur: { bcp47: 'ur-IN', sarvam: 'ur-IN', whisper: 'ur', name: 'Urdu' }
};

export function resolveSpeechCode(langCode = 'hi') {
  return SPEECH_LANG_MAP[langCode] || {
    bcp47: 'hi-IN',
    sarvam: 'hi-IN',
    whisper: 'hi',
    name: 'Hindi'
  };
}

// ─── 1. BROWSER WEB SPEECH API (ZERO-COST, ZERO-KEY, INSTANT) ───────────────

export class WebSpeechRecognizer {
  constructor({ lang = 'hi', onInterim = () => {}, onFinal = () => {}, onError = () => {}, onEnd = () => {} }) {
    const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!Recognition) {
      throw new Error('Web Speech API is not supported in this browser.');
    }
    this.recognition = new Recognition();
    const info = resolveSpeechCode(lang);
    this.recognition.lang = info.bcp47;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      if (interimTranscript) onInterim(interimTranscript);
      if (finalTranscript) onFinal(finalTranscript);
    };

    this.recognition.onerror = (e) => {
      onError(e.error);
    };

    this.recognition.onend = () => {
      onEnd();
    };
  }

  start() {
    this.recognition.start();
  }

  stop() {
    try {
      this.recognition.stop();
    } catch {
      // Ignored if already stopped
    }
  }

  abort() {
    try {
      this.recognition.abort();
    } catch {
      // Ignored
    }
  }
}

// ─── 2. GROQ / OPENAI WHISPER TRANSCRIPTION (AUDIO BLOB UPLOAD) ─────────────

export async function transcribeWithWhisper(audioBlob, { apiKey, endpoint = 'groq', language = 'hi' }) {
  if (!apiKey || !apiKey.trim()) throw new Error('Whisper API key is required.');
  
  // Use Groq Whisper (ultra-fast 250ms) or OpenAI Whisper
  const url = endpoint === 'openai'
    ? 'https://api.openai.com/v1/audio/transcriptions'
    : 'https://api.groq.com/openai/v1/audio/transcriptions';

  const model = endpoint === 'openai' ? 'whisper-1' : 'whisper-large-v3';

  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.wav');
  formData.append('model', model);
  const langInfo = resolveSpeechCode(language);
  if (langInfo.whisper) {
    formData.append('language', langInfo.whisper);
  }
  formData.append('response_format', 'json');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`
    },
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Whisper error (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.text || '';
}

// ─── 2.5 AUDIO FORMAT CONVERTER TO 16kHz MONO PCM WAV ─────────────────────────

export async function convertBlobToWav(blob) {
  if (typeof window === 'undefined') return blob;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return blob;

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContextClass({ sampleRate: 16000 });
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const numChannels = 1;
    const sampleRate = 16000;
    const samples = audioBuffer.getChannelData(0);
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    function writeString(offset, str) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true); // 16 bits per sample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    audioCtx.close().catch(() => {});
    return new Blob([view], { type: 'audio/wav' });
  } catch (err) {
    console.warn('WAV transcoding error, using raw audio blob:', err);
    return blob;
  }
}

// ─── 3. SARVAM AI SAARAS ASR & BULBUL TTS ───────────────────────────────────

export async function transcribeWithSarvam(audioBlob, { apiKey, language = 'hi' }) {
  if (!apiKey || !apiKey.trim()) throw new Error('Sarvam API key is required.');

  // Transcode to 16kHz PCM WAV for Sarvam Saaras
  const wavBlob = await convertBlobToWav(audioBlob);

  const langInfo = resolveSpeechCode(language);
  const formData = new FormData();
  formData.append('file', wavBlob, 'audio.wav');
  formData.append('model', 'saaras:v3');
  formData.append('language_code', langInfo.sarvam || 'hi-IN');

  const res = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey.trim()
    },
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Sarvam ASR error (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.transcript || '';
}

export async function synthesizeWithSarvam(text, { apiKey, language = 'hi', speaker = 'aditya' }) {
  if (!apiKey || !apiKey.trim()) throw new Error('Sarvam API key is required.');

  const langInfo = resolveSpeechCode(language);
  const cleanText = (text || '').replace(/[#*`_~]/g, '').slice(0, 450);

  const res = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey.trim()
    },
    body: JSON.stringify({
      inputs: [cleanText],
      target_language_code: langInfo.sarvam || 'hi-IN',
      speaker: speaker || 'aditya',
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: 'bulbul:v3'
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Sarvam TTS error (HTTP ${res.status})`);
  }

  const data = await res.json();
  const base64Audio = data?.audios?.[0];
  if (!base64Audio) throw new Error('Sarvam returned empty audio data.');
  return `data:audio/wav;base64,${base64Audio}`;
}

// ─── 4. UNIFIED AUDIO RECORDER (FOR WHISPER & SARVAM) ─────────────────────────

export class UnifiedAudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is not supported by your browser.');
    }
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    this.mediaRecorder.start(250);
  }

  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
        }
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        reject(err);
      }
    });
  }

  abort() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignored
      }
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
  }
}

// ─── 5. UNIFIED TTS PLAYER WITH BROWSER WEBSPEECH FALLBACK ───────────────────

let currentAudioInstance = null;

export async function unifiedSpeak({
  text,
  language = 'hi',
  provider = 'auto',
  sarvamKey = '',
  speaker = 'aditya',
  onStart = () => {},
  onEnd = () => {},
  onError = () => {}
}) {
  // Cancel any running speech
  stopAllSpeech();

  // Try Sarvam AI Bulbul TTS if requested/configured
  const shouldTrySarvam = (provider === 'sarvam' || (provider === 'auto' && Boolean(sarvamKey))) && Boolean(sarvamKey);

  if (shouldTrySarvam) {
    try {
      onStart({ provider: 'sarvam' });
      const audioUrl = await synthesizeWithSarvam(text, { apiKey: sarvamKey, language, speaker });
      const audio = new Audio(audioUrl);
      currentAudioInstance = audio;
      audio.onended = () => {
        currentAudioInstance = null;
        onEnd();
      };
      audio.onerror = () => {
        currentAudioInstance = null;
        // Fall back to WebSpeech
        speakWithBrowserNative(text, language, onStart, onEnd, onError);
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((playErr) => {
          console.warn('Sarvam audio play prevented by browser autoplay policy, falling back to Web Speech:', playErr);
          currentAudioInstance = null;
          speakWithBrowserNative(text, language, onStart, onEnd, onError);
        });
      }
      return;
    } catch (err) {
      console.warn('Sarvam TTS failed, falling back to Web Speech:', err.message);
    }
  }

  // Fallback / Native Web Speech
  speakWithBrowserNative(text, language, onStart, onEnd, onError);
}

function speakWithBrowserNative(text, language, onStart, onEnd, onError) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError('Text-to-speech is not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  onStart({ provider: 'webspeech' });
  const cleanText = (text || '').replace(/[#*`_~]/g, '').slice(0, 320);
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const info = resolveSpeechCode(language);
  utterance.lang = info.bcp47 || 'hi-IN';
  utterance.rate = 0.95;

  utterance.onend = () => onEnd();
  utterance.onerror = (e) => {
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      onError(e.error || 'TTS error');
    }
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopAllSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudioInstance) {
    currentAudioInstance.pause();
    currentAudioInstance.currentTime = 0;
    currentAudioInstance = null;
  }
}
