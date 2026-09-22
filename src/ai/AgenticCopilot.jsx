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
  FileCheck
} from 'lucide-react';
import { executeAutonomousAgent } from './agentCore.js';
import { testGeminiConnection } from './geminiClient.js';
import { CONSTITUTIONAL_LANGUAGES } from '../translations/constitutional22.js';
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
  const [showSteps, setShowSteps] = useState(true);

  // Gemini API configuration
  const [geminiKey, setGeminiKey] = useState(() => {
    return (
      (typeof window !== 'undefined' && localStorage.getItem('farmlink_gemini_api_key')) ||
      (import.meta.env?.VITE_GEMINI_API_KEY2 || '')
    );
  });
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
  const [useGemini, setUseGemini] = useState(() => {
    // Auto-enable Gemini if a key is already available
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY2 || '';
    const storedKey = (typeof window !== 'undefined' && localStorage.getItem('farmlink_gemini_api_key')) || '';
    return Boolean(envKey || storedKey);
  });
  const [keyStatus, setKeyStatus] = useState('');

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll when new step arrives
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [steps, result]);

  // Clean up speech recognition & synthesis on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Text to speech playback
  const speakText = (text, langCode) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = (text || '').replace(/[#*`_~]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langObj = CONSTITUTIONAL_LANGUAGES.find(l => l.code === langCode);
    utterance.lang = langObj?.speechCode || (langCode === 'hi' ? 'hi-IN' : 'en-IN');
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Start voice recognition in selected 22 constitutional languages
  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      notify('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    const langObj = CONSTITUTIONAL_LANGUAGES.find(l => l.code === language);
    recognition.lang = langObj?.speechCode || (language === 'hi' ? 'hi-IN' : 'en-IN');
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setRecording(true);
      notify(`Listening in ${langObj?.name || 'selected language'}… Speak your goal.`);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          setGoal(event.results[i][0].transcript);
        }
      }
      if (finalTranscript) {
        setGoal(finalTranscript);
        handleExecute(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice:', event.error);
      setRecording(false);
      if (event.error !== 'no-speech') {
        notify(`Microphone: ${event.error}. You can also type directly.`);
      }
    };

    recognition.onend = () => setRecording(false);

    try {
      recognition.start();
    } catch {
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
        speakText(res.text, language);
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
                <span className="agentic-engine-badge">
                  {useGemini && geminiKey ? 'Gemini 1.5 Flash' : 'Autonomous Edge ReAct'}
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
          {/* Gemini LLM Settings Drawer */}
          {showSettings && (
            <div className="agentic-settings-drawer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.78rem' }}>
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
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fastest)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>
              {keyStatus && <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#203929' }}>{keyStatus}</p>}
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

          {/* ReAct Execution Timeline */}
          {steps.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowSteps(!showSteps)}
              >
                <span className="quick-goals-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={14} /> Agent Reasoning Steps ({steps.length})
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64756d' }}>
                  {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>

              {showSteps && (
                <div className="react-timeline">
                  {steps.map((s, idx) => (
                    <div key={idx} className="react-step">
                      {s.type === 'thought' && (
                        <div className="step-thought">
                          <div className="step-header">
                            <Sparkles size={14} /> 💭 Agent Thought
                          </div>
                          <div>{s.content}</div>
                        </div>
                      )}
                      {s.type === 'action' && (
                        <div className="step-action">
                          <div className="step-header">
                            <Boxes size={14} /> 🛠️ Tool Action: <code>{s.tool}</code>
                          </div>
                          <div>{s.content}</div>
                        </div>
                      )}
                      {s.type === 'observation' && (
                        <div className="step-observation">
                          <div className="step-header">
                            <CheckCircle2 size={14} /> 📊 Tool Observation: <code>{s.tool}</code>
                          </div>
                          <div>{s.content}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  {running && (
                    <div style={{ padding: '8px', fontSize: '0.82rem', color: '#176b49', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="sparkle-icon"><Sparkles size={16} /></span>
                      Autonomous agent reasoning & executing platform tools…
                    </div>
                  )}
                </div>
              )}
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
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: '0.75rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => speakText(result.text, language)}
                >
                  <Volume2 size={14} /> Listen Audio
                </button>
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
