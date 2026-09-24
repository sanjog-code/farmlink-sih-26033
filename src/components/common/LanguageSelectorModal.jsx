import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Check, Globe2, Languages } from "lucide-react";
import { CONSTITUTIONAL_LANGUAGES, isRtlLanguage, translateText } from "../../translations/constitutional22.js";
import "./languageSelector.css";

export default function LanguageSelectorModal({ isOpen, onClose, currentLang, onSelectLang }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredLanguages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CONSTITUTIONAL_LANGUAGES;
    return CONSTITUTIONAL_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        (l.region && l.region.toLowerCase().includes(q))
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="lang-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Select Language">
      <div className="lang-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="lang-modal-header">
          <div className="lang-modal-title-row">
            <div className="lang-modal-icon-badge">
              <Languages size={20} />
            </div>
            <div>
              <h2 className="lang-modal-title">
                {currentLang === "hi" ? "भाषा चुनें" : "Select Language"}
              </h2>
              <p className="lang-modal-subtitle">
                22 Constitutional Languages of India · {CONSTITUTIONAL_LANGUAGES.length} Languages
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lang-modal-close-btn"
            onClick={onClose}
            aria-label="Close language selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="lang-search-wrapper">
          <Search size={16} className="lang-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="lang-search-input"
            placeholder="Search language, script or state (e.g. Hindi, ਪੰਜਾਬੀ, Tamil)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search language"
          />
          {search && (
            <button
              type="button"
              className="lang-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Language Grid */}
        <div className="lang-grid-container">
          {filteredLanguages.length === 0 ? (
            <div className="lang-empty-state">
              <Globe2 size={32} />
              <p>No language found matching "{search}"</p>
              <small>Try searching in English or native script</small>
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-option-card ${isSelected ? "selected" : ""} ${lang.dir === "rtl" ? "is-rtl" : ""}`}
                  onClick={() => {
                    onSelectLang(lang.code);
                    onClose();
                  }}
                  aria-pressed={isSelected}
                >
                  <div className="lang-card-main">
                    <span className="lang-native-script" dir={lang.dir}>
                      {lang.nativeName}
                    </span>
                    <span className="lang-english-name">
                      {lang.name}
                      {lang.dir === "rtl" && <span className="lang-rtl-badge">RTL</span>}
                    </span>
                  </div>
                  <div className="lang-card-right">
                    <span className="lang-region-hint">{lang.region?.split(",")[0]}</span>
                    {isSelected && (
                      <span className="lang-selected-check">
                        <Check size={16} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="lang-modal-footer">
          <span>Eighth Schedule to the Constitution of India Compliant</span>
          <button type="button" className="lang-footer-done-btn" onClick={onClose}>
            {translateText("Close", currentLang)}
          </button>
        </div>
      </div>
    </div>
  );
}
