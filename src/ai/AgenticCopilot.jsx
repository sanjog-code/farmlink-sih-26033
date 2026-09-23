// FarmLink Autonomous Agentic AI Copilot (SIH PS 26033)
// Multilingual ReAct Reasoning Loop, Tool Calling, Action Execution & Gemini Integration
import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Mic,
  MicOff,
  Send,
  X,
  Settings2,
  Volume2,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Boxes,
  Truck,
  FileCheck,
  Square,
  Radio
} from 'lucide-react';
import { executeAutonomousAgent } from './agentCore.js';
import { testGeminiConnection } from './geminiClient.js';
import { CONSTITUTIONAL_LANGUAGES } from '../translations/constitutional22.js';
import {
  WebSpeechRecognizer,
  transcribeWithWhisper,
  transcribeWithSarvam,
  UnifiedAudioRecorder,
  unifiedSpeak,
  stopAllSpeech,
  resolveSpeechCode
} from './speechEngine.js';
import './agentic.css';

export default function AgenticCopilot({
  isOpen = false,
  onClose,
  session,
  lots = [],
  cart = [],
  updateCartQuantity,
  setFarmerListingPrefill,
  setView,
  notify = () => {},
  initialMode = 'chat'
}) {
  const [goal, setGoal] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState('hi');
  const [recording, setRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Gemini API configuration (Preinstalled & Ready Out-of-the-Box)
  const [geminiKey, setGeminiKey] = useState(() => {
    return (
      (typeof window !== 'undefined' && localStorage.getItem('farmlink_gemini_api_key')) ||
      (import.meta.env?.VITE_GEMINI_API_KEY2 || '') ||
      (import.meta.env?.VITE_GEMINI_API_KEY || '') ||
      'AQ.Ab8RN6KcU5BBNvGVAZvk4UfYKkENTK70eRqkqUpT6L6gRUU2Cg'
    );
  });
  const [geminiModel, setGeminiModel] = useState('gemini-3.6-flash');
  const [useGemini, setUseGemini] = useState(true);
  const [keyStatus, setKeyStatus] = useState('');

  // Speech & Voice AI Configuration (Hybrid WebSpeech + Sarvam + Whisper)
  const [settingsTab, setSettingsTab] = useState('voice'); // 'voice' | 'llm'
  const [voiceProvider, setVoiceProvider] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('farmlink_voice_provider')) || 'auto';
  });
  const [sarvamKey, setSarvamKey] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('farmlink_sarvam_api_key')) || (import.meta.env?.VITE_SARVAM_API_KEY || '') || 'sk_v9yrxpg0_ZzIdidU18EjUTGEFfkajp7OZ';
  });
  const [sarvamSpeaker, setSarvamSpeaker] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('farmlink_sarvam_speaker')) || 'aditya';
  });
  const [openAiKey, setOpenAiKey] = useState(() => {
    return (typeof window !== 'undefined' && (localStorage.getItem('farmlink_openai_api_key') || localStorage.getItem('farmlink_whisper_api_key'))) || (import.meta.env?.VITE_OPENAI_API_KEY || '');
  });
  const [openAiVoice, setOpenAiVoice] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('farmlink_openai_voice')) || 'nova';
  });
  const [speaking, setSpeaking] = useState(false);
  const [activeTTSProvider, setActiveTTSProvider] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');

  const speechRecognizerRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll when new step arrives
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [steps, result]);

  // Clean up speech recognition, recording & synthesis on unmount
  useEffect(() => {
    return () => {
      speechRecognizerRef.current?.abort();
      audioRecorderRef.current?.abort();
      stopAllSpeech();
    };
  }, []);

  // Hybrid Text to Speech playback
  const handlePlaySpeech = (text) => {
    unifiedSpeak({
      text,
      language,
      provider: voiceProvider,
      sarvamKey,
      openAiKey,
      speaker: sarvamSpeaker,
      openAiVoice,
      onStart: ({ provider }) => {
        setSpeaking(true);
        setActiveTTSProvider(provider);
      },
      onEnd: () => {
        setSpeaking(false);
        setActiveTTSProvider('');
      },
      onError: (errMsg) => {
        setSpeaking(false);
        setActiveTTSProvider('');
        console.warn('TTS playback note:', errMsg);
      }
    });
  };

  const handleStopSpeech = () => {
    stopAllSpeech();
    setSpeaking(false);
    setActiveTTSProvider('');
  };

  // Start hybrid voice recognition (Web Speech / Sarvam Saaras / Groq Whisper)
  const toggleRecording = async () => {
    if (recording) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
        speechRecognizerRef.current = null;
      }
      if (audioRecorderRef.current) {
        try {
          notify('Processing voice recording with Cloud AI…');
          const audioBlob = await audioRecorderRef.current.stop();
          audioRecorderRef.current = null;
          if (audioBlob && audioBlob.size > 0) {
            let transcript = '';
            if (voiceProvider === 'openai') {
              try {
                transcript = await transcribeWithWhisper(audioBlob, { apiKey: openAiKey, language });
              } catch (err) {
                console.warn('OpenAI Whisper notice, attempting Sarvam fallback:', err);
                if (sarvamKey) {
                  try {
                    transcript = await transcribeWithSarvam(audioBlob, { apiKey: sarvamKey, language });
                  } catch (sErr) {
                    console.warn('Sarvam ASR error:', sErr);
                  }
                }
              }
            } else if (voiceProvider === 'sarvam' || (voiceProvider === 'auto' && sarvamKey)) {
              try {
                transcript = await transcribeWithSarvam(audioBlob, { apiKey: sarvamKey, language });
              } catch (err) {
                console.warn('Sarvam ASR notice, attempting OpenAI Whisper fallback:', err);
                if (openAiKey) {
                  try {
                    transcript = await transcribeWithWhisper(audioBlob, { apiKey: openAiKey, language });
                  } catch (wErr) {
                    console.warn('OpenAI Whisper error:', wErr);
                  }
                }
              }
            } else if (openAiKey) {
              try {
                transcript = await transcribeWithWhisper(audioBlob, { apiKey: openAiKey, language });
              } catch (wErr) {
                console.warn('OpenAI Whisper error:', wErr);
              }
            }

            if (transcript && transcript.trim()) {
              setGoal(transcript.trim());
              handleExecute(transcript.trim());
            } else {
              notify('Speech recognition did not catch words. Tip: Browser Web Speech is active and can be used directly.');
            }
          }
        } catch (err) {
          notify(`Voice notice: ${err.message}. You can also type directly.`);
        }
      }
      setRecording(false);
      return;
    }

    // Determine recording strategy:
    const hasWebSpeech = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    const useCloudAudioCapture =
      (voiceProvider === 'sarvam' && Boolean(sarvamKey)) ||
      (voiceProvider === 'openai' && Boolean(openAiKey)) ||
      (!hasWebSpeech && (Boolean(sarvamKey) || Boolean(openAiKey)));

    if (useCloudAudioCapture) {
      try {
        const recorder = new UnifiedAudioRecorder();
        await recorder.start();
        audioRecorderRef.current = recorder;
        setRecording(true);
        const provName = voiceProvider === 'openai' ? 'OpenAI Whisper-1' : 'Sarvam Saaras ASR';
        notify(`🎙️ Recording with ${provName} (${resolveSpeechCode(language).name}). Click mic when finished.`);
      } catch (err) {
        console.warn('Microphone stream error, falling back to Browser Web Speech:', err);
        startWebSpeechFallback();
      }
    } else {
      startWebSpeechFallback();
    }
  };

  const startWebSpeechFallback = () => {
    try {
      const recognizer = new WebSpeechRecognizer({
        lang: language,
        onInterim: (interim) => {
          setGoal(interim);
        },
        onFinal: (finalText) => {
          setGoal(finalText);
          handleExecute(finalText);
        },
        onError: (errCode) => {
          console.warn('Web Speech note:', errCode);
          setRecording(false);
          if (errCode !== 'no-speech') {
            notify(`Microphone: ${errCode}. You can type directly.`);
          }
        },
        onEnd: () => {
          setRecording(false);
        }
      });
      recognizer.start();
      speechRecognizerRef.current = recognizer;
      setRecording(true);
      notify(`🎙️ Listening via Browser Web Speech (${resolveSpeechCode(language).name})…`);
    } catch (err) {
      notify(`Microphone: ${err.message}. Please type your query.`);
      setRecording(false);
    }
  };

  // Test Gemini API key
  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      setKeyStatus('Please enter an API key first.');
      return;
    }
    setKeyStatus('Testing Gemini connection…');
    try {
      await testGeminiConnection(geminiKey, geminiModel);
      setKeyStatus('✅ Gemini connection successful! Cloud LLM active.');
      if (typeof window !== 'undefined') {
        localStorage.setItem('farmlink_gemini_api_key', geminiKey.trim());
      }
      setUseGemini(true);
    } catch (err) {
      setKeyStatus(`❌ Failed: ${err.message}`);
    }
  };

  // Execute Agentic ReAct Cycle
  const handleExecute = async (inputGoal) => {
    const targetGoal = (inputGoal || goal).trim();
    if (!targetGoal || running) return;

    setRunning(true);
    setSteps([]);
    setResult(null);

    const userRole = session?.role || 'farmer';

    try {
      const res = await executeAutonomousAgent({
        goal: targetGoal,
        userRole,
        language,
        apiKey: geminiKey,
        model: geminiModel,
        useGeminiIfAvailable: useGemini && Boolean(geminiKey),
        runtimeContext: { lots, session },
        onStep: (newStep) => {
          setSteps(prev => [...prev, newStep]);
        }
      });

      setResult(res);
      if (res.text) {
        handlePlaySpeech(res.text);
      }
    } catch (err) {
      notify(`Agent notice: ${err.message}`);
      setResult({
        success: false,
        text: `The agent encountered an issue: ${err.message}. Please retry with another query.`
      });
    } finally {
      setRunning(false);
    }
  };

  // Handle Action Card Executions (1-Click Platform Actions)
  const handleExecuteAction = (action) => {
    if (!action) return;
    const { type, payload } = action;

    if (type === 'ACTION_PREFILL_LISTING') {
      if (setFarmerListingPrefill) {
        setFarmerListingPrefill({
          crop: payload.crop,
          price: payload.priceKg,
          quantity: payload.quantityKg,
          grade: payload.grade || 'A'
        });
      }
      if (setView) setView('farmer');
      notify(`Pre-filled listing form for ${payload.crop} at ₹${payload.priceKg}/kg.`);
      if (onClose) onClose();
      setTimeout(() => {
        const el = document.querySelector('.photo-listing, .farmer-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else if (type === 'ACTION_APPLY_ENWR') {
      if (setView) setView('farmer');
      notify(`Navigated to e-NWR pledge section. Eligible advance: ₹${payload.advanceAmount?.toLocaleString('en-IN')}.`);
      if (onClose) onClose();
      setTimeout(() => {
        const el = document.querySelector('.integration-section, .farmer-operations');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else if (type === 'ACTION_DISPATCH_PICKUP') {
      notify(`Cluster pickup request dispatched for ${payload.crop} (${payload.quantityKg} kg) at ${payload.cluster}.`);
    } else if (type === 'ACTION_RESERVE_PRODUCE') {
      if (updateCartQuantity && payload.id) {
        try {
          updateCartQuantity(payload.id, 5); // Add 5kg reservation
          notify(`Reserved 5 kg of ${payload.crop} in your cart!`);
          if (setView) setView('market');
          if (onClose) onClose();
        } catch (e) {
          notify(e.message);
        }
      }
    } else if (type === 'ACTION_FULFILL_WHOLESALE') {
      if (setView) setView('admin');
      notify('Opened Admin Wholesale Desk with matched farmer clusters.');
      if (onClose) onClose();
    } else if (type === 'ACTION_VIEW_ROUTE') {
      if (setView) setView('admin');
      notify('Opened Inter-Warehouse Route Map.');
      if (onClose) onClose();
    }
  };

  // Role-Aware Quick Goals
  const rolePrompts = {
    farmer: [
      { label: '🌾 क्या मुझे सरसों बेचनी चाहिए या रोकनी?', prompt: 'सरसों का मंडी भाव और एमएसपी में क्या अंतर है? क्या मुझे 500 किग्रा सरसों अभी बेचनी चाहिए या गोदाम में रखकर 50% एडवांस लेना चाहिए?' },
      { label: '💰 50% e-NWR एडवांस पात्रता', prompt: 'मेरे पास 1000 किग्रा गेहूं है। मुझे गोदाम रसीद पर 50% e-NWR गिरवी अग्रिम ऋण कितना मिल सकता है?' },
      { label: '🚚 फुलेरा क्लस्टर पिकअप वाहन', prompt: 'जैतपुरा से फुलेरा हब के लिए 800 किग्रा सरसों हेतु क्लस्टर पिकअप वाहन और भाड़ा बचत की योजना बनाएं।' }
    ],
    consumer: [
      { label: '🍅 जैविक टमाटर खोजें (Organic)', prompt: 'मुझे 30 किमी के भीतर ग्रेड-ए जैविक प्रमाणित टमाटर दिखाएं और मंडी की तुलना में बचत बताएं।' },
      { label: '⚖️ मंडी बनाम फार्मलिंक मूल्य तुलना', prompt: 'प्याज और आलू के थोक मंडी भाव बनाम फार्मलिंक डायरेक्ट फार्मगेट भाव की तुलना करें।' }
    ],
    admin: [
      { label: '🏢 बीकानेर मिल्स के लिए 5T सरसों क्लस्टर मैच', prompt: 'थोक खरीदार के लिए 5 टन सरसों की आवश्यकता है। जैतपुरा और फुलेरा के किसान लॉट को मैच करें।' },
      { label: '⚠️ गोदाम में खराब होने वाले लॉट का ऑडिट', prompt: 'जयपुर नॉर्थ गोदाम में उन सभी लॉट का ऑडिट करें जो शेल्फ लाइफ के 60% से अधिक पुराने हैं।' }
    ]
  };

  const currentPrompts = rolePrompts[session?.role] || rolePrompts.farmer;

  if (!isOpen) return null;

  return (
    <div className="agentic-modal-overlay" onClick={onClose}>
      <div className="agentic-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="agentic-header">
          <div className="agentic-title-group">
            <div className="agentic-avatar">
              <Bot size={26} />
            </div>
            <div className="agentic-title">
              <h3>
                FarmLink Agentic Copilot
                <span className={`agentic-engine-badge ${useGemini && geminiKey ? 'cloud' : 'edge'}`}>
                  {useGemini && geminiKey ? '☁️ Gemini 3.6 Flash' : '⚡ Autonomous Edge AI'}
                </span>
              </h3>
              <p>
                SIH PS 26033 · AI Agricultural Reasoning & Action Execution
              </p>
            </div>
          </div>

          <div className="agentic-controls">
            <button
              type="button"
              className="agentic-mode-pill-btn"
              title={useGemini && geminiKey ? 'Switch to Offline/Edge ReAct AI' : 'Switch to Gemini 3.6 Cloud AI'}
              onClick={() => {
                if (!geminiKey && !useGemini) {
                  setShowSettings(true);
                  setKeyStatus('Please enter your Gemini API key below to activate Cloud AI.');
                } else {
                  setUseGemini(!useGemini);
                }
              }}
            >
              {useGemini && geminiKey ? '☁️ Cloud LLM' : '⚡ Edge ReAct'}
            </button>
            <button
              type="button"
              className="agentic-icon-btn"
              title="Configure Gemini API LLM Key"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 size={18} />
            </button>
            <button
              type="button"
              className="agentic-icon-btn"
              title="Close Copilot"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="agentic-body">
          {/* Settings Drawer (Voice AI & Gemini Cloud Tabs) */}
          {showSettings && (
            <div className="agentic-settings-drawer">
              <div className="settings-tabs">
                <button
                  type="button"
                  className={`settings-tab-btn ${settingsTab === 'voice' ? 'active' : ''}`}
                  onClick={() => setSettingsTab('voice')}
                >
                  🎙️ Voice AI (Sarvam / Whisper / WebSpeech)
                </button>
                <button
                  type="button"
                  className={`settings-tab-btn ${settingsTab === 'llm' ? 'active' : ''}`}
                  onClick={() => setSettingsTab('llm')}
                >
                  ⚡ Gemini Cloud LLM
                </button>
              </div>

              {settingsTab === 'voice' && (
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#17372c' }}>
                      Hybrid Voice Engine Architecture
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 600 }}>
                      Auto-failover enabled
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '4px', fontSize: '0.78rem' }}>
                    <label style={{ fontWeight: 600, color: '#17372c' }}>Primary Speech Provider:</label>
                    <select
                      value={voiceProvider}
                      onChange={(e) => {
                        setVoiceProvider(e.target.value);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('farmlink_voice_provider', e.target.value);
                        }
                      }}
                      style={{ padding: '6px 8px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid #bdd7bc' }}
                    >
                      <option value="auto">Auto (Smart Hybrid · WebSpeech + Sarvam/OpenAI)</option>
                      <option value="webspeech">Browser Web Speech (100% Free, Zero Key, 0ms Latency)</option>
                      <option value="openai">OpenAI Whisper & TTS (Global Standard · whisper-1 + tts-1)</option>
                      <option value="sarvam">Sarvam AI (Indian Rural Dialects · Saaras + Bulbul)</option>
                    </select>
                  </div>

                  {/* OpenAI API Key Row */}
                  <div style={{ display: 'grid', gap: '4px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ fontWeight: 600 }}>🌐 OpenAI API Key (Whisper STT & Studio TTS):</span>
                      <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#176b49', textDecoration: 'underline' }}>
                        Get OpenAI Key ↗
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="Paste your OpenAI API key (sk-proj-... / sk-...)"
                      value={openAiKey}
                      onChange={(e) => setOpenAiKey(e.target.value)}
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>

                  {/* OpenAI TTS Voice Selection Row */}
                  <div style={{ display: 'grid', gap: '4px', marginTop: '4px', fontSize: '0.78rem' }}>
                    <label style={{ fontWeight: 600, color: '#17372c' }}>OpenAI Studio TTS Voice:</label>
                    <select
                      value={openAiVoice}
                      onChange={(e) => {
                        setOpenAiVoice(e.target.value);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('farmlink_openai_voice', e.target.value);
                        }
                      }}
                      style={{ padding: '6px 8px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid #bdd7bc' }}
                    >
                      <option value="nova">Nova (Warm & Natural Female · Recommended)</option>
                      <option value="alloy">Alloy (Neutral & Balanced)</option>
                      <option value="echo">Echo (Clear Male)</option>
                      <option value="shimmer">Shimmer (Expressive & Bright Female)</option>
                      <option value="onyx">Onyx (Deep Authoritative Male)</option>
                      <option value="fable">Fable (Dynamic & Warm)</option>
                    </select>
                  </div>

                  {/* Sarvam AI Key Row */}
                  <div style={{ display: 'grid', gap: '4px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ fontWeight: 600 }}>🇮🇳 Sarvam AI Subscription Key (Pre-configured):</span>
                      <a href="https://www.sarvam.ai/" target="_blank" rel="noreferrer" style={{ color: '#176b49', textDecoration: 'underline' }}>
                        Get Sarvam Key ↗
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="Paste your Sarvam API subscription key..."
                      value={sarvamKey}
                      onChange={(e) => setSarvamKey(e.target.value)}
                      style={{ fontSize: '0.78rem' }}
                    />
                  </div>

                  {/* Sarvam Speaker Selection Row */}
                  <div style={{ display: 'grid', gap: '4px', marginTop: '4px', fontSize: '0.78rem' }}>
                    <label style={{ fontWeight: 600, color: '#17372c' }}>Sarvam Bulbul Speaker Voice:</label>
                    <select
                      value={sarvamSpeaker}
                      onChange={(e) => {
                        setSarvamSpeaker(e.target.value);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('farmlink_sarvam_speaker', e.target.value);
                        }
                      }}
                      style={{ padding: '6px 8px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid #bdd7bc' }}
                    >
                      <option value="aditya">Aditya (Natural Indian Male · Recommended)</option>
                      <option value="priya">Priya (Clear Female · Studio Quality)</option>
                      <option value="ritu">Ritu (Melodic Female)</option>
                      <option value="rohan">Rohan (Deep Expressive Male)</option>
                      <option value="simran">Simran (Warm Friendly Female)</option>
                      <option value="kavya">Kavya (Soft Female)</option>
                      <option value="ratan">Ratan (Mature Authoritative Male)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('farmlink_openai_api_key', openAiKey.trim());
                          localStorage.setItem('farmlink_openai_voice', openAiVoice);
                          localStorage.setItem('farmlink_sarvam_api_key', sarvamKey.trim());
                          localStorage.setItem('farmlink_sarvam_speaker', sarvamSpeaker);
                          localStorage.setItem('farmlink_voice_provider', voiceProvider);
                        }
                        setVoiceStatus('✅ Voice settings saved! OpenAI Whisper & Sarvam AI ready.');
                      }}
                    >
                      Save Voice Configuration
                    </button>
                    {voiceStatus && <span style={{ fontSize: '0.74rem', color: '#176b49' }}>{voiceStatus}</span>}
                  </div>
                </div>
              )}

              {settingsTab === 'llm' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#17372c' }}>
                      ⚡ Google Gemini LLM API Configuration
                    </strong>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: '#176b49', textDecoration: 'underline' }}
                    >
                      Get Free Gemini API Key ↗
                    </a>
                  </div>
                  <div className="agentic-settings-row">
                    <input
                      type="password"
                      placeholder="Paste your Gemini API key (AIzaSy...)"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                    />
                    <button
                      type="button"
                      className="secondary"
                      style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                      onClick={handleTestGemini}
                    >
                      Test & Save
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.78rem', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={useGemini}
                        onChange={(e) => setUseGemini(e.target.checked)}
                      />
                      Enable Cloud Gemini Model
                    </label>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                    >
                      <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    </select>
                  </div>
                  {keyStatus && <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#203929' }}>{keyStatus}</p>}
                </div>
              )}
            </div>
          )}

          {/* Quick Goals */}
          <div className="quick-goals-wrap">
            <span className="quick-goals-label">
              Role Intent Suggestions · त्वरित लक्ष्य:
            </span>
            <div className="goal-chips">
              {currentPrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="goal-chip"
                  onClick={() => {
                    setGoal(item.prompt);
                    handleExecute(item.prompt);
                  }}
                >
                  <Sparkles size={14} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Running Status Indicator (Internal AI thought process and tool action controls are hidden from the user) */}
          {running && (
            <div className="copilot-running-card" style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0', boxShadow: 'var(--shadow-sm)' }}>
              <div className="pulse-loader" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, animation: 'pulseGlow 1.4s infinite' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  FarmLink AI is synthesizing verified agricultural strategy…
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Analyzing real-time Agmarknet mandi rates, cold-chain telemetry & e-NWR warehouse logistics.
                </div>
              </div>
            </div>
          )}

          {/* Final Strategic Response Box */}
          {result && (
            <div className="strategic-response">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>
                  <CheckCircle2 size={18} color="#176b49" />
                  FarmLink Autonomous Strategy
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {speaking ? (
                    <button
                      type="button"
                      className="agentic-audio-btn playing"
                      onClick={handleStopSpeech}
                    >
                      <Square size={13} /> Stop Audio ({activeTTSProvider === 'sarvam' ? 'Sarvam Bulbul' : 'Web Speech'})
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="agentic-audio-btn"
                      onClick={() => handlePlaySpeech(result.text)}
                    >
                      <Volume2 size={14} /> Listen Audio
                    </button>
                  )}
                </div>
              </div>
              <div className="strategic-text">
                {result.text}
              </div>

              {/* Action Cards Grid */}
              {result.actionCards && result.actionCards.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <span className="quick-goals-label" style={{ display: 'block', marginBottom: '8px' }}>
                    ⚡ Executable Platform Actions (1-Click Direct Execution):
                  </span>
                  <div className="action-cards-grid">
                    {result.actionCards.map((act) => (
                      <div key={act.id} className="action-card">
                        <div>
                          <div className="action-card-top">
                            <h5 className="action-card-title">{act.title}</h5>
                            {act.badge && <span className="action-badge">{act.badge}</span>}
                          </div>
                          <p className="action-card-desc">{act.description}</p>
                        </div>
                        <button
                          type="button"
                          className="action-card-btn"
                          onClick={() => handleExecuteAction(act)}
                        >
                          {act.buttonLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Footer & Input Bar */}
        <div className="agentic-footer">
          {/* Animated Audio Waveform Visualizer when Recording */}
          {recording && (
            <div className="agentic-recording-banner">
              <div className="audio-wave-container">
                <span className="audio-wave-bar"></span>
                <span className="audio-wave-bar"></span>
                <span className="audio-wave-bar"></span>
                <span className="audio-wave-bar"></span>
                <span className="audio-wave-bar"></span>
              </div>
              <span>
                {voiceProvider === 'openai' && openAiKey
                  ? '🎙️ OpenAI Whisper Recording… Click Mic to Transcribe & Execute'
                  : voiceProvider === 'sarvam' && sarvamKey
                  ? '🎙️ Sarvam Indic ASR Recording… Click Mic to Transcribe & Execute'
                  : `🎙️ Listening via Browser Web Speech (${resolveSpeechCode(language).name})… Speak now`}
              </span>
            </div>
          )}

          <div className="agentic-input-row">
            <input
              type="text"
              className="agentic-text-input"
              placeholder="Ask FarmLink Agentic Copilot (e.g. 'Should I sell 800kg mustard or hold for 50% advance?')"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleExecute();
                }
              }}
              disabled={running}
            />

            <button
              type="button"
              className={`agentic-mic-btn ${recording ? 'recording' : ''}`}
              title="Voice Input (22 Indian Languages)"
              onClick={toggleRecording}
              disabled={running}
            >
              {recording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              type="button"
              className="agentic-send-btn"
              onClick={() => handleExecute()}
              disabled={running || !goal.trim()}
              title="Execute Autonomous Agent"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="agentic-lang-bar">
            <span>
              Supported: All 22 8th Schedule Constitutional Languages + English
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              Language:
              <select
                className="agentic-lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={running || recording}
              >
                {CONSTITUTIONAL_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} · {l.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Persistent Floating Agentic Dock Button (Mounted Globally)
export function AgenticDockLauncher({ onOpen }) {
  return (
    <button
      type="button"
      className="agentic-dock-btn"
      onClick={onOpen}
      title="Open FarmLink Agentic AI Copilot (ReAct Tools & Voice in 22 Languages)"
    >
      <span className="sparkle-icon">
        <Sparkles size={18} />
      </span>
      <span>FarmLink Agentic Copilot</span>
    </button>
  );
}
