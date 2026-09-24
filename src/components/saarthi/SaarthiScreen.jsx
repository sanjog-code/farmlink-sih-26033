// FarmLink Saarthi — Main Voice-First AI Farmer Assistant Screen
import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  Check,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  ShieldCheck,
  ChevronDown,
  Camera,
  Coins,
  PackageCheck
} from 'lucide-react';
import { SaarthiClient } from './saarthiClient.js';
import './saarthi.css';

export default function SaarthiScreen({
  isOpen = false,
  onClose = () => {},
  session = null,
  farmerVerification = null,
  initialKioskMode = false,
  notify = () => {},
  onListingCreated = () => {}
}) {
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  const [currentResponse, setCurrentResponse] = useState(
    'नमस्ते किसान भाई! मैं फार्मलिंक सारथी हूँ। बताइए, मैं आपकी क्या मदद कर सकता हूँ?'
  );
  const [pendingAction, setPendingAction] = useState(null);
  const [quickActions, setQuickActions] = useState([
    { label: '🌾 फसल बेचनी है', text: 'मुझे फसल बेचनी है' },
    { label: '💰 आज का भाव', text: 'गेहूं का आज का भाव क्या है?' },
    { label: '🚚 पिकअप कहाँ है?', text: 'मेरा पिकअप कहाँ है?' },
    { label: '📦 मेरी लिस्टिंग', text: 'मेरी फसल की लिस्टिंग दिखाओ' }
  ]);
  const [textInput, setTextInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [kioskMode, setKioskMode] = useState(initialKioskMode);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const clientRef = useRef(null);
  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const farmerId = session?.userId || 'farmer-self';
  const farmerName = session?.name || farmerVerification?.farmerName || 'Kisan Bhai';

  // Initialize Saarthi Client
  useEffect(() => {
    const client = new SaarthiClient({
      notify,
      onStateChange: ({ status: newStatus, error }) => {
        setStatus(newStatus);
        if (error) {
          notify(`सारथी सूचना: ${error}`);
        }
      },
      onMessage: (data) => {
        if (data.response) {
          setCurrentResponse(data.response);
        }
        if (data.pendingAction) {
          setPendingAction(data.pendingAction);
        } else {
          setPendingAction(null);
        }
        if (data.quickActions && data.quickActions.length) {
          setQuickActions(data.quickActions);
        }
        if (data.actionResult?.success && data.actionResult?.listing) {
          onListingCreated(data.actionResult.listing);
        }
      }
    });

    client.setSessionContext(farmerId, farmerName);
    clientRef.current = client;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      client.stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [farmerId, farmerName]);

  // Recording Timer
  useEffect(() => {
    if (status === 'LISTENING') {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Inactivity timeout in Kiosk Mode (60s privacy auto-reset)
  useEffect(() => {
    if (!kioskMode) return;
    const resetInactivity = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        setCurrentResponse('नमस्ते किसान भाई! मैं फार्मलिंक सारथी हूँ। बताइए, मैं आपकी क्या मदद कर सकता हूँ?');
        setPendingAction(null);
        clientRef.current?.stopSpeech();
      }, 60000);
    };

    resetInactivity();
    window.addEventListener('pointerdown', resetInactivity);
    return () => {
      window.removeEventListener('pointerdown', resetInactivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [kioskMode]);

  if (!isOpen) return null;

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────

  const handleMicToggle = async () => {
    if (!clientRef.current) return;

    if (status === 'LISTENING') {
      // Stop and send audio
      await clientRef.current.stopRecordingAndSend({ farmerId, farmerName });
    } else if (status === 'SPEAKING') {
      // Interrupt speech and start listening
      clientRef.current.stopSpeech();
      await clientRef.current.startRecording();
    } else {
      // Start recording voice
      try {
        await clientRef.current.startRecording();
      } catch (err) {
        notify('माइक्रोफ़ोन एक्सेस नहीं मिला। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।');
      }
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || !clientRef.current) return;
    const text = textInput;
    setTextInput('');
    await clientRef.current.sendMessage(text, { farmerId, farmerName });
  };

  const handleQuickAction = async (chip) => {
    if (!clientRef.current) return;
    if (chip.text === 'हाँ, लिस्टिंग बना दो' || chip.text === 'हाँ, पक्का करें') {
      await handleConfirm(true);
    } else if (chip.text === 'नहीं, रोकें') {
      await handleConfirm(false);
    } else {
      await clientRef.current.sendMessage(chip.text, { farmerId, farmerName });
    }
  };

  const handleConfirm = async (confirmed) => {
    if (!clientRef.current) return;
    await clientRef.current.confirmAction(confirmed, {
      farmerId,
      farmerName,
      idempotencyKey: `IDEM-${Date.now()}`
    });
  };

  const handleMuteToggle = () => {
    if (!clientRef.current) return;
    const muted = clientRef.current.toggleMute();
    setIsMuted(muted);
    notify(muted ? 'आवाज़ म्यूट की गई' : 'आवाज़ अनम्यूट की गई');
  };

  const handleReplay = () => {
    if (!clientRef.current || !currentResponse) return;
    clientRef.current.speakResponse(currentResponse);
  };

  return (
    <div className="saarthi-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget && !kioskMode) onClose();
    }}>
      <div className={`saarthi-container ${kioskMode ? 'kiosk-mode' : ''}`}>
        
        {/* HEADER */}
        <header className="saarthi-header">
          <div className="saarthi-header-title">
            <div className="saarthi-avatar">🌾</div>
            <div>
              <h2>फार्मलिंक सारथी (Saarthi)</h2>
              <p>किसान वॉयस असिस्टेंट · {farmerName}</p>
            </div>
          </div>

          <div className="saarthi-header-controls">
            <button
              type="button"
              className="saarthi-btn-icon"
              onClick={handleMuteToggle}
              title={isMuted ? 'Unmute voice' : 'Mute voice'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <button
              type="button"
              className="saarthi-btn-icon"
              onClick={() => setKioskMode(!kioskMode)}
              title={kioskMode ? 'Exit Kiosk Mode' : 'Enter Kiosk Mode'}
            >
              {kioskMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {!kioskMode && (
              <button
                type="button"
                className="saarthi-btn-icon"
                onClick={onClose}
                title="Close Saarthi"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        {/* MAIN BODY */}
        <div className="saarthi-body">

          {/* Network Status Badge if Offline */}
          {!isOnline && (
            <div className="saarthi-offline-banner">
              <WifiOff size={18} />
              <span>ऑफ़लाइन मोड: आपकी आवाज़ सुरक्षित रहेगी और इंटरनेट आने पर स्वतः सबमिट होगी।</span>
            </div>
          )}

          {/* Spoken AI Dialogue Bubble */}
          <div className="saarthi-speech-bubble">
            <div className="saarthi-bubble-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> सारथी
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {status === 'SPEAKING' && (
                  <div className="saarthi-waveform">
                    <span className="saarthi-wave-bar" />
                    <span className="saarthi-wave-bar" />
                    <span className="saarthi-wave-bar" />
                    <span className="saarthi-wave-bar" />
                    <span className="saarthi-wave-bar" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleReplay}
                  style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: 0 }}
                  title="Replay speech"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            <p className="saarthi-bubble-text">{currentResponse}</p>
          </div>

          {/* ACTION CONFIRMATION CARD (IF REQUIRING USER APPROVAL) */}
          {pendingAction && (
            <div className="saarthi-confirmation-card">
              <div className="saarthi-confirmation-summary">
                <div className="saarthi-crop-badge">
                  {pendingAction.crop === 'Wheat' ? '🌾' : pendingAction.crop === 'Onion' ? '🧅' : pendingAction.crop === 'Mustard' ? '🟡' : '🌱'}
                </div>
                <div className="saarthi-confirmation-details">
                  <h4>{pendingAction.crop || 'फसल'} की लिस्टिंग पुष्टि</h4>
                  <p>
                    मात्रा: <b>{pendingAction.quantityKg} किग्रा ({Math.round(pendingAction.quantityKg / 100 * 10) / 10} क्विंटल)</b> · भाव: <b>₹{pendingAction.pricePerKg}/किग्रा</b>
                    {pendingAction.mspProtected && (
                      <span style={{ display: 'block', color: '#059669', fontWeight: 700, fontSize: '0.8rem', marginTop: '2px' }}>
                        ✓ आधिकारिक सरकारी MSP सुरक्षित
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="saarthi-confirmation-buttons">
                <button
                  type="button"
                  className="saarthi-confirm-btn yes"
                  onClick={() => handleConfirm(true)}
                  disabled={status === 'PROCESSING'}
                >
                  <Check size={20} /> हाँ, बना दो
                </button>
                <button
                  type="button"
                  className="saarthi-confirm-btn no"
                  onClick={() => handleConfirm(false)}
                  disabled={status === 'PROCESSING'}
                >
                  <X size={20} /> नहीं, रोकें
                </button>
              </div>
            </div>
          )}

          {/* GIANT MICROPHONE INTERACTION BUTTON */}
          <div className="saarthi-mic-zone">
            <button
              type="button"
              className={`saarthi-mic-button ${status === 'LISTENING' ? 'is-listening' : status === 'PROCESSING' ? 'is-processing' : ''}`}
              onClick={handleMicToggle}
              aria-label="बोलने के लिए दबाएं"
            >
              {status === 'LISTENING' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Mic size={52} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, marginTop: '2px' }}>{recordingSeconds}s</span>
                </div>
              ) : status === 'PROCESSING' ? (
                <Sparkles size={52} />
              ) : (
                <Mic size={52} />
              )}
            </button>

            <div className="saarthi-mic-label">
              {status === 'LISTENING' ? '🔴 सुन रहे हैं... बोलते रहें' : status === 'PROCESSING' ? '⏳ समझ रहे हैं...' : status === 'SPEAKING' ? '🔊 सारथी बोल रहा है...' : '🎤 बोलने के लिए दबाएं'}
            </div>

            <p className="saarthi-mic-subtext">
              {status === 'LISTENING' ? 'बोलने के बाद दोबारा दबाएं' : 'हिंदी · Hinglish · English में बोलें'}
            </p>
          </div>

          {/* QUICK ACTION CARDS */}
          <div className="saarthi-quick-actions">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                className={`saarthi-chip ${action.primary ? 'primary' : ''}`}
                onClick={() => handleQuickAction(action)}
                disabled={status === 'PROCESSING'}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* TEXT FALLBACK INPUT DRAWER */}
          <form className="saarthi-text-drawer" onSubmit={handleTextSubmit}>
            <input
              type="text"
              className="saarthi-text-input"
              placeholder="या यहाँ लिखें (उदा. 3 क्विंटल गेहूं बेचना है)..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={status === 'PROCESSING' || status === 'LISTENING'}
            />
            <button
              type="submit"
              className="saarthi-send-btn"
              disabled={!textInput.trim() || status === 'PROCESSING'}
            >
              <Send size={18} />
            </button>
          </form>

        </div>

        {/* FOOTER */}
        <footer className="saarthi-footer">
          <div className="saarthi-lang-selector">
            <span>भाषा:</span>
            <button
              type="button"
              className={`saarthi-lang-pill ${selectedLanguage === 'hi' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('hi')}
            >
              हिंदी
            </button>
            <button
              type="button"
              className={`saarthi-lang-pill ${selectedLanguage === 'hinglish' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('hinglish')}
            >
              Hinglish
            </button>
            <button
              type="button"
              className={`saarthi-lang-pill ${selectedLanguage === 'en' ? 'active' : ''}`}
              onClick={() => setSelectedLanguage('en')}
            >
              English
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!feedbackGiven ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                मदद मिली?
                <button
                  type="button"
                  onClick={() => { setFeedbackGiven(true); notify('प्रतिक्रिया के लिए धन्यवाद!'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                  👍
                </button>
                <button
                  type="button"
                  onClick={() => { setFeedbackGiven(true); notify('हम इसे और बेहतर बनाएंगे!'); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                  👎
                </button>
              </span>
            ) : (
              <span style={{ color: '#059669', fontSize: '0.78rem' }}>✓ प्रतिक्रिया प्राप्त</span>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
}
