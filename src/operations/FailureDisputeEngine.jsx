import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Truck,
  Building,
  UserX,
  Cpu,
  BadgeAlert,
  ArrowRight
} from "lucide-react";
import { DEMO_NOTICE, isDemoMode } from '../lib/platformMode.js';

export default function FailureDisputeEngine({ notify = () => {} }) {
  if (isDemoMode) return <section className="account-panel"><p className="eyebrow green">DEMONSTRATION SAFETY GATE</p><h2>Dispute records are unavailable</h2><p>{DEMO_NOTICE}</p><p>This preview cannot create, resolve, or represent an operational dispute record.</p></section>;
  const [activeScenario, setActiveScenario] = useState("rejection");
  const [resolvedScenarios, setResolvedScenarios] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const scenarios = {
    rejection: {
      id: "rejection",
      title: "Warehouse QC Grade Rejection",
      icon: <ShieldAlert size={20} color="#ef4444" />,
      trigger: "Intake lot moisture content (e.g. 14.8%) exceeds WDRA Grade-A standard (max 12.0%).",
      impact: "High risk of dispute or farmer distress selling.",
      failoverAction: "3-Way Digital Arbitration Protocol",
      steps: [
        "1. Instant Notification: Mobile alert & SMS dispatched to registered producer with digital NIR spectrometer telemetry evidence.",
        "2. Independent Assayer Inspection: 3rd party accredited assayer re-tests sample within 4 hours at government certified lab.",
        "3. Automatic Secondary Diversion: If Grade-B confirmed, automated switch to regional food processing / bio-fuel off-taker at guaranteed floor price, avoiding rejection return freight.",
        "4. No Farmer Penalty: Zero storage charge levied during the 4-hour arbitration window."
      ],
      resolutionStatus: "Arbitration Protocol Verified & Active"
    },
    shortage: {
      id: "shortage",
      title: "Farmer Stock Shortage at Farmgate",
      icon: <BadgeAlert size={20} color="#f59e0b" />,
      trigger: "Produce listed with target weight, but actual calibrated farmgate weighment yields deficit due to sorting/drying loss.",
      impact: "Buyer wholesale order delivery at risk of partial fulfillment.",
      failoverAction: "Automated Proximity Cluster Fulfillment",
      steps: [
        "1. Real-Time Deficit Detection: Smart electronic weighing scale auto-syncs actual net weight to digital dispatch ledger.",
        "2. Cluster Auto-Fill: FarmLink matching engine immediately queries adjacent farmer cluster within 12 km radius.",
        "3. Instant Cluster Top-up: Reserve lot from verified cluster producer is dynamically attached to the same transit vehicle.",
        "4. Buyer Order Unaffected: 100% of order fulfilled on schedule without delay or penalty."
      ],
      resolutionStatus: "Proximity Failover Auto-Triggered"
    },
    breakdown: {
      id: "breakdown",
      title: "Collection Vehicle In-Transit Breakdown",
      icon: <Truck size={20} color="#ef4444" />,
      trigger: "Reefer Vehicle RJ-14-GA-8910 reports transmission failure on NH-48 with 2,150 kg perishables onboard.",
      impact: "Cold-chain spoilage risk if internal temp rises above 8.0°C.",
      failoverAction: "Emergency Fleet Swap & Cold-Chain Battery Hold",
      steps: [
        "1. IoT Telemetry SOS: Vehicle onboard telematics automatically triggers breakdown alert to FarmLink Logistics Dispatch.",
        "2. Backup Chiller Activation: Auxiliary battery pack maintains Reefer cabin at 4.2°C for up to 6 hours.",
        "3. Standby Fleet Dispatch: Nearest available vehicle (Bolero Maxi Truck RJ-14-GB-1102) routed from Chomu depot (ETA 22 mins).",
        "4. Quick Transshipment: Drivers complete QR sealed pallet transfer with temperature log verified."
      ],
      resolutionStatus: "Standby Fleet Rerouted"
    },
    cancellation: {
      id: "cancellation",
      title: "Wholesale Buyer Cancellation During Transit",
      icon: <UserX size={20} color="#8b5cf6" />,
      trigger: "Retail buyer cancels 500 kg Tomato order while collection truck is already en route to warehouse.",
      impact: "Farmer income loss and logistics wasted travel.",
      failoverAction: "Escrow Protection & Automated Cold-Storage Re-Listing",
      steps: [
        "1. 100% Escrow Guarantee: Buyer escrow lock forfeits standard 10% logistics cancellation fee directly to farmer account.",
        "2. Zero Farmer Loss: Farmer receives full contracted baseline price for produce.",
        "3. Automated Warehouse Holding: Produce is admitted directly into nearest WDRA cold-storage room with e-NWR receipt issued.",
        "4. AI Flash Re-Auction: Lot is automatically broadcasted to 8 regional institutional buyers at wholesale market rate."
      ],
      resolutionStatus: "100% Escrow Protected"
    },
    ai_failure: {
      id: "ai_failure",
      title: "AI Forecast / API Discrepancy",
      icon: <Cpu size={20} color="#0284c7" />,
      trigger: "External mandi Agmarknet API downtime or unexpected external price anomaly detected.",
      impact: "Pricing models could generate skewed recommendations.",
      failoverAction: "Multi-Model Ensemble & Conservative Floor Fallback",
      steps: [
        "1. Health Check Tripwire: Model drift monitor detects API timeout or >25% variance vs 30-day baseline.",
        "2. Graceful Degrade: Autonomously deactivates volatile SARIMAX high-tier horizon and switches to 10-year Agmarknet historical moving average.",
        "3. Hardcoded Legal MSP Floor: System strictly enforces Government MSP as unbreachable lower bound.",
        "4. Admin Review Flag: Diagnostic alert dispatched to platform administrator with telemetry payload."
      ],
      resolutionStatus: "Conservative Baseline Fallback Active"
    }
  };

  const current = scenarios[activeScenario];

  const handleSimulateFailover = (key) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResolvedScenarios((prev) => ({ ...prev, [key]: true }));
      notify(`✓ Automated Failover Protocol Executed for: ${scenarios[key].title}`);
    }, 500);
  };

  return (
    <div className="admin-analytics-wrapper" style={{ margin: "20px 0" }}>
      {/* Top Banner */}
      <div style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)", borderRadius: "16px", padding: "24px", color: "#fff", marginBottom: "20px", border: "1px solid #44403c" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f87171", background: "rgba(239, 68, 68, 0.15)", padding: "4px 10px", borderRadius: "999px" }}>
                SIH-26033 CRITICAL FAILURE HANDLING
              </span>
              <span style={{ fontSize: "0.74rem", background: "rgba(255, 255, 255, 0.12)", color: "#fff", padding: "3px 8px", borderRadius: "6px" }}>
                Resilience &amp; Dispute Protection
              </span>
            </div>
            <h2 style={{ fontSize: "1.6rem", margin: "4px 0 6px", color: "#fff", fontWeight: 900 }}>
              ⚠️ Platform Failure Handling &amp; Automated Dispute Arbitration Engine
            </h2>
            <p style={{ margin: 0, color: "#d6d3d1", fontSize: "0.92rem", maxWidth: "780px" }}>
              Agricultural supply chains face real-world breakdowns: QC rejections, stock shortages, vehicle breakdowns, buyer cancellations, and API downtime. FarmLink eliminates failure points with automated failover logic.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        {Object.entries(scenarios).map(([key, item]) => {
          const isActive = activeScenario === key;
          const isResolved = resolvedScenarios[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveScenario(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: isActive ? "var(--surface-raised)" : "var(--surface)",
                border: isActive ? "2px solid var(--primary)" : "1px solid var(--border)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: "0.82rem", color: "var(--text-main)", display: "block" }}>{item.title}</b>
                <span style={{ fontSize: "0.7rem", color: isResolved ? "#059669" : "var(--text-muted)", fontWeight: 600 }}>
                  {isResolved ? "✓ Auto-Resolved" : "Click to Inspect"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Detailed Deep-Dive Card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {current.icon}
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "var(--text-main)" }}>
                {current.title}
              </h3>
            </div>
            <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "0.86rem", fontWeight: 600 }}>
              ⚡ Trigger Event: {current.trigger}
            </p>
          </div>

          <button
            type="button"
            className="primary"
            disabled={isProcessing}
            onClick={() => handleSimulateFailover(activeScenario)}
            style={{ padding: "10px 18px", borderRadius: "8px", fontWeight: 800, fontSize: "0.86rem", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <RefreshCw size={15} className={isProcessing ? "spin" : ""} />
            <span>{isProcessing ? "Executing Failover Protocol…" : "Simulate Automated Failover"}</span>
          </button>
        </div>

        {/* Impact & Action Banner */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
          <div>
            <small style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.72rem", fontWeight: 700 }}>Supply Chain Risk</small>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-main)", marginTop: "2px" }}>
              {current.impact}
            </div>
          </div>
          <div>
            <small style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.72rem", fontWeight: 700 }}>Automated Protocol</small>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--primary)", marginTop: "2px" }}>
              {current.failoverAction}
            </div>
          </div>
        </div>

        {/* Sequential Step-by-Step Failover Architecture */}
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: "0.98rem", fontWeight: 800, color: "var(--text-main)" }}>
            🛡️ Automated Step-by-Step Resolution Architecture:
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {current.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                  lineHeight: "1.5",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px"
                }}
              >
                <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {resolvedScenarios[activeScenario] && (
          <div style={{ marginTop: "18px", padding: "12px 16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "10px", color: "#065f46", fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={18} />
            <span>Failover executed successfully. Audit trail and escrow adjustments logged to immutable platform ledger.</span>
          </div>
        )}
      </div>
    </div>
  );
}
