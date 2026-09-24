import fs from 'fs';

let content = fs.readFileSync('src/main.jsx', 'utf8');

// 1. Add SaarthiScreen import
if (!content.includes('import SaarthiScreen')) {
  content = content.replace(
    'import AgenticCopilot, { AgenticDockLauncher } from "./ai/AgenticCopilot.jsx";',
    'import AgenticCopilot, { AgenticDockLauncher } from "./ai/AgenticCopilot.jsx";\nimport SaarthiScreen from "./components/saarthi/SaarthiScreen.jsx";'
  );
  console.log('✓ Added SaarthiScreen import');
}

// 2. Add Saarthi modal mount
if (!content.includes('modal === "saarthi"')) {
  const targetModal = '{modal === "agentic" && (';
  const replacementModal = `{(modal === "saarthi" || modal === "kiosk" || view === "saarthi") && (
        <SaarthiScreen
          isOpen={true}
          onClose={() => setModal(null)}
          session={session}
          farmerVerification={farmerVerification}
          initialKioskMode={modal === "kiosk"}
          notify={notify}
          onListingCreated={(newListing) => {
            setLiveTick((tick) => tick + 1);
          }}
        />
      )}
      {modal === "agentic" && (`;
  content = content.replace(targetModal, replacementModal);
  console.log('✓ Added Saarthi modal mount');
}

// 3. Add Saarthi Hero Banner to FarmerView
if (!content.includes('farmer-saarthi-hero-card')) {
  const targetHero = '{/* Executive Hero Banner */}';
  const saarthiHero = `{/* Saarthi Voice AI Flagship Banner */}
      <div className="farmer-saarthi-hero-card" style={{
        background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
        color: "#ffffff",
        borderRadius: "20px",
        padding: "20px 24px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 10px 25px -5px rgba(6, 95, 70, 0.4)",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "54px",
            height: "54px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            border: "2px solid rgba(255,255,255,0.4)"
          }}>
            🌾
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>
                फार्मलिंक सारथी (FarmLink Saarthi)
              </h3>
              <span style={{ background: "#f59e0b", color: "#78350f", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: "10px" }}>
                AI VOICE ASSISTANT
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.88rem", opacity: 0.9 }}>
              बिना कोई फॉर्म भरे सिर्फ बोलकर फसल बेचें · सरकारी MSP रेट जानें · खेत से पिकअप बुक करें
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="primary"
            onClick={() => setModal("saarthi")}
            style={{
              background: "#ffffff",
              color: "#065f46",
              border: "none",
              fontWeight: 800,
              fontSize: "0.95rem",
              padding: "12px 22px",
              borderRadius: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
            }}
          >
            <Mic size={19} color="#059669" /> सारथी से बोलें (Voice)
          </button>
          <button
            type="button"
            onClick={() => setModal("kiosk")}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.4)",
              fontWeight: 700,
              fontSize: "0.85rem",
              padding: "10px 16px",
              borderRadius: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer"
            }}
            title="Open Rural Kiosk Mode"
          >
            <Maximize2 size={15} /> कियोस्क मोड
          </button>
        </div>
      </div>

      {/* Executive Hero Banner */}`;

  content = content.replace(targetHero, saarthiHero);
  console.log('✓ Added Saarthi banner to FarmerView');
}

// 4. Also add Saarthi button into farmer-quick-actions
if (!content.includes('onClick={() => setModal("saarthi")}')) {
  const targetQuick = '<button\n              type="button"\n              className="primary"\n              onClick={() => {\n                if (setAiInitialCrop) setAiInitialCrop(null);\n                setModal("ai");\n              }}';
  const saarthiQuick = `<button
              type="button"
              className="primary"
              onClick={() => setModal("saarthi")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", background: "#059669" }}
            >
              <Mic size={15} /> 🌾 Saarthi Assistant
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                if (setAiInitialCrop) setAiInitialCrop(null);
                setModal("ai");
              }}`;
  content = content.replace(targetQuick, saarthiQuick);
  console.log('✓ Added Saarthi button to farmer-quick-actions');
}

fs.writeFileSync('src/main.jsx', content, 'utf8');
console.log('=== MAIN.JSX PATCHED SUCCESSFULLY ===');
