import React, { useState, useEffect } from 'react';
import SaarthiExperience from './SaarthiExperience.jsx';
import { Mic, LayoutDashboard, Sparkles, X } from 'lucide-react';
import './saarthiExperience.css';

const FARMER_MODE_STORAGE_KEY = 'farmlink_farmer_mode';
const FIRST_LOGIN_SHOWN_KEY = 'farmlink_first_login_choice_made';

export default function FarmerExperience({
  session,
  lots,
  setModal,
  setAiInitialCrop,
  listingPrefill,
  produceRequests,
  setProduceRequests,
  liveTick,
  notify,
  farmerVerification,
  setFarmerVerification,
  lang = 'hi',
  // Reference to existing Classic FarmerView component
  ClassicFarmerViewComponent = null
}) {
  const [farmerMode, setFarmerMode] = useState(() => {
    try {
      const saved = localStorage.getItem(FARMER_MODE_STORAGE_KEY);
      if (saved === 'classic' || saved === 'saarthi') return saved;
      // Default to Saarthi for SIH evaluation
      return 'saarthi';
    } catch {
      return 'saarthi';
    }
  });

  const [showFirstLoginModal, setShowFirstLoginModal] = useState(() => {
    try {
      const choiceMade = localStorage.getItem(FIRST_LOGIN_SHOWN_KEY);
      return !choiceMade;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleOpenListing = () => {
      setFarmerMode('classic');
      try {
        localStorage.setItem(FARMER_MODE_STORAGE_KEY, 'classic');
      } catch (_) {}
    };
    window.addEventListener('farmlink_open_listing_form', handleOpenListing);
    return () => window.removeEventListener('farmlink_open_listing_form', handleOpenListing);
  }, []);

  const handleSelectMode = (mode) => {
    setFarmerMode(mode);
    try {
      localStorage.setItem(FARMER_MODE_STORAGE_KEY, mode);
      localStorage.setItem(FIRST_LOGIN_SHOWN_KEY, 'true');
    } catch (e) {
      console.warn('Storage save notice:', e);
    }
    setShowFirstLoginModal(false);
    if (notify) {
      notify(
        mode === 'saarthi'
          ? 'सारथी मोड सक्रिय: बस बोलकर काम करें।'
          : 'क्लासिक मोड सक्रिय: पूर्ण डैशबोर्ड चालू।'
      );
    }
  };

  const handleSwitchMode = (mode) => {
    setFarmerMode(mode);
    try {
      localStorage.setItem(FARMER_MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Storage save notice:', e);
    }
    if (notify) {
      notify(
        mode === 'saarthi'
          ? 'सारथी मोड में स्विच किया गया।'
          : 'क्लासिक डैशबोर्ड में स्विच किया गया।'
      );
    }
  };

  return (
    <div className="farmer-dual-experience-wrapper">
      {/* First Login Choice Modal */}
      {showFirstLoginModal && (
        <div className="mode-select-modal-overlay">
          <div className="mode-select-card">
            <h2 className="mode-select-title">
              FarmLink कैसे इस्तेमाल करना चाहेंगे?
            </h2>
            <p className="mode-select-sub">
              अपनी पसंद के अनुसार मोड चुनें (बाद में कभी भी बदल सकते हैं)
            </p>

            {/* Option 1: Saarthi Mode (Recommended) */}
            <button
              type="button"
              className="mode-option-btn"
              onClick={() => handleSelectMode('saarthi')}
            >
              <div className="mode-option-icon">🎙️</div>
              <div>
                <div className="mode-option-title">सारथी मोड (Saarthi Mode)</div>
                <div className="mode-option-desc">
                  बस बोलिए, सारथी आपका काम करेगा। बेहद सरल और आवाज़-आधारित।
                </div>
              </div>
            </button>

            {/* Option 2: Classic Mode */}
            <button
              type="button"
              className="mode-option-btn classic"
              onClick={() => handleSelectMode('classic')}
            >
              <div className="mode-option-icon">📱</div>
              <div>
                <div className="mode-option-title">क्लासिक मोड (Classic Mode)</div>
                <div className="mode-option-desc">
                  डैशबोर्ड, फॉर्म और सारे उन्नत फीचर्स खुद मैन्युअली इस्तेमाल करें।
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Render Selected Mode */}
      {farmerMode === 'saarthi' ? (
        <SaarthiExperience
          session={session}
          farmerVerification={farmerVerification}
          notify={notify}
          lang={lang}
          onSwitchToClassic={() => handleSwitchMode('classic')}
          onListingCreated={(newListing) => {
            if (notify) {
              notify(`नई लिस्टिंग मंडी में लाइव: ${newListing.crop}`);
            }
          }}
        />
      ) : (
        <div className="classic-farmer-container">
          {/* Top Banner inside Classic Mode to switch to Saarthi */}
          <div className="classic-mode-top-banner">
            <div className="classic-banner-text">
              <Sparkles size={18} color="#059669" />
              <span>
                सरल व आसान बोलकर उपयोग के लिए <b>सारथी मोड</b> उपलब्ध है।
              </span>
            </div>
            <button
              type="button"
              className="classic-switch-to-saarthi-btn"
              onClick={() => handleSwitchMode('saarthi')}
            >
              <Mic size={15} />
              <span>🎙️ Use Saarthi Mode</span>
            </button>
          </div>

          {/* Render Existing Classic FarmerView */}
          {ClassicFarmerViewComponent ? (
            <ClassicFarmerViewComponent
              session={session}
              lots={lots}
              setModal={setModal}
              setAiInitialCrop={setAiInitialCrop}
              listingPrefill={listingPrefill}
              produceRequests={produceRequests}
              setProduceRequests={setProduceRequests}
              liveTick={liveTick}
              notify={notify}
              farmerVerification={farmerVerification}
              setFarmerVerification={setFarmerVerification}
              lang={lang}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
