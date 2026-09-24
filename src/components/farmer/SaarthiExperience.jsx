import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  Warehouse,
  ShieldCheck,
  Languages,
  LayoutDashboard,
  Truck,
  Coins,
  Package,
  FileText
} from 'lucide-react';
import { SaarthiClient } from '../saarthi/saarthiClient.js';
import FormattedAiMessage from '../common/FormattedAiMessage.jsx';
import {
  getUserListings,
  addUserListing,
  updateUserListing,
  getUserOrders,
  getScheduledPickups,
  scheduleFarmPickup,
  subscribeToSync
} from '../../lib/dataSyncEngine.js';
import './saarthiExperience.css';

export default function SaarthiExperience({
  session = null,
  farmerVerification = null,
  notify = () => {},
  onSwitchToClassic = () => {},
  lang = 'hi',
  onListingCreated = () => {}
}) {
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  const [currentResponse, setCurrentResponse] = useState(
    'राम राम किसान भाई! बताइए, आज क्या बेचना है या मंडी भाव जानना है?'
  );
  const [pendingAction, setPendingAction] = useState(null);
  const [visualCard, setVisualCard] = useState(null);
  const [showServicesDrawer, setShowServicesDrawer] = useState(false);
  const [activeListings, setActiveListings] = useState([]);

  const clientRef = useRef(null);

  const farmerId = session?.userId || session?.farmerId || 'farmer-self';
  const farmerName = session?.name || farmerVerification?.farmerName || 'Kisan Bhai';

  // Load listings and subscribe to live changes
  useEffect(() => {
    const refreshData = () => {
      const all = getUserListings();
      setActiveListings(all.filter(l => l.status !== 'cancelled'));
    };

    refreshData();
    const unsubscribe = subscribeToSync(() => refreshData());
    return () => unsubscribe();
  }, []);

  // Initialize Saarthi Client
  useEffect(() => {
    const client = new SaarthiClient({
      notify,
      onStateChange: ({ status: newStatus, error }) => {
        setStatus(newStatus);
        if (error) {
          notify(`सारथी: ${error}`);
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
        if (data.visualData) {
          setVisualCard(data.visualData);
        } else {
          setVisualCard(null);
        }
        if (data.actionResult?.success && data.actionResult?.listing) {
          onListingCreated(data.actionResult.listing);
        }
      }
    });

    client.setSessionContext(farmerId, farmerName);
    clientRef.current = client;
  }, [farmerId, farmerName, notify, onListingCreated]);

  // Voice Toggle Handler
  const handleMicClick = async () => {
    if (!clientRef.current) return;

    if (status === 'LISTENING') {
      try {
        await clientRef.current.stopRecordingAndSend({
          farmerId,
          farmerName
        });
      } catch (err) {
        console.error('Stop recording error:', err);
      }
    } else {
      try {
        setVisualCard(null);
        await clientRef.current.startRecording();
      } catch (err) {
        console.error('Start recording error:', err);
      }
    }
  };

  // Shortcut dispatch handler
  const handleShortcutClick = async (actionType, promptText) => {
    if (!clientRef.current) return;
    setVisualCard(null);

    // Provide contextual mock data cards for fast visual-audio feedback
    if (actionType === 'CHECK_MARKET_PRICE') {
      setVisualCard({
        type: 'price',
        data: { crop: 'गेहूं (Wheat)', msp: '₹2,425/क्विंटल', modal: '₹2,480/क्विंटल', hub: 'जयपुर नॉर्थ मंडी' }
      });
    } else if (actionType === 'CHECK_PAYMENT') {
      setVisualCard({
        type: 'payment',
        data: { amount: '₹7,200', status: 'खाते में जमा', date: '23 सितंबर', ref: 'TXN-7819' }
      });
    } else if (actionType === 'TRACK_PICKUP') {
      setVisualCard({
        type: 'pickup',
        data: { status: 'रास्ते में', driver: 'महेंद्र सिंह (बोलेरो पिकअप)', time: 'आज शाम 4–6 PM' }
      });
    }

    try {
      await clientRef.current.sendMessage(promptText, {
        farmerId,
        farmerName
      });
    } catch (err) {
      console.error('Shortcut send error:', err);
    }
  };

  // Confirmation Handler
  const handleConfirmAction = async (confirmed) => {
    if (!clientRef.current) return;

    const action = pendingAction;
    try {
      const result = await clientRef.current.confirmAction(confirmed, {
        farmerId,
        farmerName,
        idempotencyKey: `CONFIRM-${Date.now()}`
      });

      // If action was cancellation, ensure local dataSyncEngine removes it
      if (confirmed && action?.type === 'CANCEL_LISTING' && action?.listingId) {
        updateUserListing(action.listingId, { status: 'cancelled' });
        notify('लिस्टिंग सफलतापूर्वक हटा दी गई।');
      }

      setPendingAction(null);
    } catch (err) {
      console.error('Confirm action error:', err);
    }
  };

  // Replay speech
  const handleReplay = () => {
    if (clientRef.current && currentResponse) {
      clientRef.current.speakResponse(currentResponse);
    }
  };

  return (
    <div className="saarthi-exp-container">
      {/* Top Header Control Bar */}
      <header className="saarthi-exp-header">
        <div className="saarthi-exp-brand">
          <div className="saarthi-exp-avatar">🌾</div>
          <div>
            <h3 className="saarthi-exp-greeting-title">
              राम-राम, {farmerName} 👋
            </h3>
            <span className="saarthi-exp-greeting-sub">
              FarmLink डिजिटल कृषि साथी
            </span>
          </div>
        </div>

        <div className="saarthi-exp-header-actions">
          <button
            type="button"
            className="saarthi-mode-switch-btn"
            onClick={onSwitchToClassic}
            title="स्विच करके क्लासिक डैशबोर्ड पर जाएं"
          >
            <LayoutDashboard size={15} />
            <span>Classic Mode</span>
          </button>
        </div>
      </header>

      {/* Main Voice Center */}
      <section className="saarthi-voice-center">
        <h2 className="saarthi-prompt-text">
          आप क्या करना चाहते हैं?
        </h2>

        {/* Giant Microphone Button */}
        <button
          type="button"
          className={`saarthi-giant-mic-btn ${
            status === 'LISTENING'
              ? 'is-listening'
              : status === 'PROCESSING'
              ? 'is-processing'
              : status === 'SPEAKING'
              ? 'is-speaking'
              : ''
          }`}
          onClick={handleMicClick}
          aria-label="बोलने के लिए माइक दबाएं"
        >
          {status === 'LISTENING' ? (
            <MicOff size={52} />
          ) : (
            <Mic size={52} />
          )}
        </button>

        <span className="saarthi-mic-caption">
          {status === 'LISTENING'
            ? 'सुन रहा हूँ... बोलिए'
            : status === 'PROCESSING'
            ? 'समझ रहा हूँ...'
            : status === 'SPEAKING'
            ? 'सारथी बोल रहा है...'
            : 'बोलने के लिए दबाएं'}
        </span>

        {/* Audio State Pill */}
        <div className={`saarthi-status-pill ${status.toLowerCase()}`}>
          <span style={{ fontSize: '0.9rem' }}>
            {status === 'LISTENING'
              ? '🔴 रिकॉर्डिंग जारी...'
              : status === 'PROCESSING'
              ? '⏳ गणना हो रही है...'
              : status === 'SPEAKING'
              ? '🔊 आवाज़ चालू'
              : '🎙️ बोलें या नीचे विकल्प चुनें'}
          </span>
        </div>
      </section>

      {/* Active Conversation Card */}
      <section className="saarthi-convo-card">
        <div className="saarthi-convo-top">
          <div className="saarthi-convo-badge">
            <Sparkles size={14} />
            <span>सारथी सलाह (Saarthi Answer)</span>
          </div>
          <button
            type="button"
            className="saarthi-replay-btn"
            onClick={handleReplay}
            title="दोबारा सुनें"
          >
            <RotateCcw size={13} />
            <span>दोबारा सुनें</span>
          </button>
        </div>

        <FormattedAiMessage
          text={currentResponse}
          onOptionClick={(opt) => handleShortcutClick('CUSTOM', opt)}
        />

        {/* Visual Cards (Market Price, Payment, Pickup) */}
        {visualCard && visualCard.type === 'price' && (
          <div className="saarthi-visual-card">
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">फसल</span>
              <span className="saarthi-card-val">{visualCard.data.crop}</span>
            </div>
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">सरकारी MSP</span>
              <span className="saarthi-card-val" style={{ color: '#059669' }}>
                {visualCard.data.msp} (सुरक्षित)
              </span>
            </div>
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">आज का मंडी रेट</span>
              <span className="saarthi-card-val">{visualCard.data.modal}</span>
            </div>
          </div>
        )}

        {visualCard && visualCard.type === 'payment' && (
          <div className="saarthi-visual-card">
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">खाते में प्राप्त रकम</span>
              <span className="saarthi-card-val" style={{ color: '#16a34a', fontSize: '1.2rem' }}>
                {visualCard.data.amount}
              </span>
            </div>
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">स्थिति</span>
              <span className="saarthi-card-pill">✓ {visualCard.data.status}</span>
            </div>
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">तारीख</span>
              <span className="saarthi-card-val">{visualCard.data.date}</span>
            </div>
          </div>
        )}

        {visualCard && visualCard.type === 'pickup' && (
          <div className="saarthi-visual-card">
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">पिकअप स्थिति</span>
              <span className="saarthi-card-pill">🚚 {visualCard.data.status}</span>
            </div>
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">गाड़ी व चालक</span>
              <span className="saarthi-card-val">{visualCard.data.driver}</span>
            </div>
            <div className="saarthi-card-row">
              <span className="saarthi-card-label">पहुंचने का समय</span>
              <span className="saarthi-card-val">{visualCard.data.time}</span>
            </div>
          </div>
        )}

        {/* Consequential Action Confirmation Box */}
        {pendingAction && (
          <div className="saarthi-confirm-box">
            <p className="saarthi-confirm-prompt">
              {pendingAction.type === 'CREATE_LISTING' && (
                <>🌾 क्या आप <b>{pendingAction.quantityKg} किलो {pendingAction.crop}</b> ₹{pendingAction.pricePerKg}/किग्रा के भाव पर लिस्ट करना चाहते हैं?</>
              )}
              {pendingAction.type === 'CANCEL_LISTING' && (
                <>⚠️ क्या आप सच में अपनी <b>{pendingAction.crop}</b> की लिस्टिंग हटाना चाहते हैं?</>
              )}
              {pendingAction.type === 'BOOK_PICKUP' && (
                <>🚚 क्या आप खेत से <b>{pendingAction.quantityKg} किलो {pendingAction.crop}</b> की पिकअप बुक करना चाहते हैं?</>
              )}
            </p>
            <div className="saarthi-confirm-actions">
              <button
                type="button"
                className="saarthi-btn-yes"
                onClick={() => handleConfirmAction(true)}
              >
                <Check size={18} />
                <span>हाँ, पक्का करें</span>
              </button>
              <button
                type="button"
                className="saarthi-btn-no"
                onClick={() => handleConfirmAction(false)}
              >
                <X size={18} />
                <span>नहीं, रोकें</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 6 VERY LARGE TOUCH SHORTCUTS */}
      <section className="saarthi-shortcuts-grid">
        <button
          type="button"
          className="saarthi-shortcut-card"
          onClick={() => handleShortcutClick('SELL_CROP', 'मुझे फसल बेचनी है')}
        >
          <div className="saarthi-shortcut-icon">🌾</div>
          <div className="saarthi-shortcut-title">फसल बेचनी है</div>
          <div className="saarthi-shortcut-sub">Sell Crop Directly</div>
        </button>

        <button
          type="button"
          className="saarthi-shortcut-card"
          onClick={() => handleShortcutClick('CHECK_MARKET_PRICE', 'गेहूं का आज का मंडी भाव क्या है?')}
        >
          <div className="saarthi-shortcut-icon">₹</div>
          <div className="saarthi-shortcut-title">आज का भाव</div>
          <div className="saarthi-shortcut-sub">Live Mandi & MSP</div>
        </button>

        <button
          type="button"
          className="saarthi-shortcut-card"
          onClick={() => handleShortcutClick('TRACK_PICKUP', 'मेरा पिकअप कहाँ है?')}
        >
          <div className="saarthi-shortcut-icon">🚚</div>
          <div className="saarthi-shortcut-title">मेरा पिकअप</div>
          <div className="saarthi-shortcut-sub">Track Farm Pickup</div>
        </button>

        <button
          type="button"
          className="saarthi-shortcut-card"
          onClick={() => handleShortcutClick('CHECK_PAYMENT', 'मेरा भुगतान और खाते के पैसे बताओ')}
        >
          <div className="saarthi-shortcut-icon">💰</div>
          <div className="saarthi-shortcut-title">मेरे पैसे</div>
          <div className="saarthi-shortcut-sub">Direct Bank Payouts</div>
        </button>

        <button
          type="button"
          className="saarthi-shortcut-card"
          onClick={() => handleShortcutClick('CHECK_ORDER', 'मेरी फसल के खरीदार ऑर्डर दिखाओ')}
        >
          <div className="saarthi-shortcut-icon">📦</div>
          <div className="saarthi-shortcut-title">मेरा ऑर्डर</div>
          <div className="saarthi-shortcut-sub">Buyer Orders</div>
        </button>

        <button
          type="button"
          className="saarthi-shortcut-card"
          onClick={() => setShowServicesDrawer(true)}
        >
          <div className="saarthi-shortcut-icon">☰</div>
          <div className="saarthi-shortcut-title">और सर्विसेज</div>
          <div className="saarthi-shortcut-sub">More Services</div>
        </button>
      </section>

      {/* Progressive Disclosure "Aur Services" Drawer */}
      {showServicesDrawer && (
        <div
          className="saarthi-drawer-overlay"
          onClick={() => setShowServicesDrawer(false)}
        >
          <div
            className="saarthi-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="saarthi-drawer-top">
              <h3 className="saarthi-drawer-title">
                किसान सेवाएं (More Services)
              </h3>
              <button
                type="button"
                className="saarthi-drawer-close"
                onClick={() => setShowServicesDrawer(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="saarthi-drawer-list">
              <div
                className="saarthi-drawer-item"
                onClick={() => {
                  setShowServicesDrawer(false);
                  handleShortcutClick('CHECK_MY_LISTINGS', 'मेरी फसल की लिस्टिंग दिखाओ');
                }}
              >
                <div className="saarthi-drawer-item-icon">📋</div>
                <div>
                  <div className="saarthi-drawer-item-title">मेरी लिस्टिंग (My Listings)</div>
                  <div className="saarthi-drawer-item-desc">
                    {activeListings.length > 0
                      ? `${activeListings.length} फसलें मंडी में लाइव हैं`
                      : 'सक्रिय लिस्टिंग देखें या रद्द करें'}
                  </div>
                </div>
              </div>

              <div
                className="saarthi-drawer-item"
                onClick={() => {
                  setShowServicesDrawer(false);
                  handleShortcutClick('WAREHOUSE_DEPOSIT', 'वेयरहाउस में माल रखकर लोन कैसे लें?');
                }}
              >
                <div className="saarthi-drawer-item-icon">🏬</div>
                <div>
                  <div className="saarthi-drawer-item-title">वेयरहाउस व 50% ई-NWR लोन</div>
                  <div className="saarthi-drawer-item-desc">
                    फसल रोके रखें, 50% तुरंत लोन पाएं (7% ब्याज)
                  </div>
                </div>
              </div>

              <div
                className="saarthi-drawer-item"
                onClick={() => {
                  setShowServicesDrawer(false);
                  handleShortcutClick('CUSTOM', 'जयपुर और कोटा मंडी में किस फसल की सबसे ज्यादा मांग है?');
                }}
              >
                <div className="saarthi-drawer-item-icon">📈</div>
                <div>
                  <div className="saarthi-drawer-item-title">बड़ी मंडी मांग (Buyer Demand)</div>
                  <div className="saarthi-drawer-item-desc">
                    जाने किन शहरों में आपकी फसल की सबसे ज्यादा मांग है
                  </div>
                </div>
              </div>

              <div
                className="saarthi-drawer-item"
                onClick={() => {
                  setShowServicesDrawer(false);
                  handleShortcutClick('CUSTOM', 'मेरी किसान केवाईसी स्थिति क्या है?');
                }}
              >
                <div className="saarthi-drawer-item-icon">🛡️</div>
                <div>
                  <div className="saarthi-drawer-item-title">किसान सत्यापन (KYC Status)</div>
                  <div className="saarthi-drawer-item-desc">
                    {farmerVerification?.status === 'verified'
                      ? '✓ सरकारी सत्यापित किसान'
                      : 'आधार व भूमि रिकॉर्ड सत्यापन'}
                  </div>
                </div>
              </div>

              <div
                className="saarthi-drawer-item"
                style={{ background: '#f0fdf4', borderColor: '#10b981' }}
                onClick={() => {
                  setShowServicesDrawer(false);
                  onSwitchToClassic();
                }}
              >
                <div className="saarthi-drawer-item-icon">📱</div>
                <div>
                  <div className="saarthi-drawer-item-title" style={{ color: '#065f46' }}>
                    क्लासिक डैशबोर्ड खोलें (Classic Mode)
                  </div>
                  <div className="saarthi-drawer-item-desc">
                    पूरा डैशबोर्ड, फॉर्म और सारे उन्नत फीचर्स इस्तेमाल करें
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
