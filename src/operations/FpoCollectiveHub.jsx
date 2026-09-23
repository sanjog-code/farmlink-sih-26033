import React, { useState } from "react";
import {
  Building2,
  Users,
  PackageCheck,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Coins,
  CheckCircle2,
  ArrowRight,
  Plus,
  Scale,
  DollarSign,
  Truck,
  Award
} from "lucide-react";

export default function FpoCollectiveHub({ notify = () => {} }) {
  const [activeTab, setActiveTab] = useState("batches");
  const [contractModal, setContractModal] = useState(null);

  // FPO Profile Data
  const fpoProfile = {
    name: "Kisan Samriddhi Farmer Producer Company Ltd (FPO)",
    regNo: "FPO-RJ-2024-8812 / SFAC Recognized",
    cluster: "Chomu - Phulera Rural Belt, Jaipur District",
    totalMembers: 428,
    activePoolKg: 15500,
    collectiveRealizationRate: "89.4%",
    bankEscrowAccount: "SBI A/C XXXXXX4821 (FPO Common Pool)"
  };

  // Aggregated Collective Batches (Multiple smallholder farmers pooled together)
  const [batches, setBatches] = useState([
    {
      id: "FPO-BATCH-01",
      crop: "Mustard (Grade A)",
      totalQtyKg: 4500,
      targetMsp: 56.50,
      collectivePrice: 88.00,
      contributingFarmersCount: 14,
      farmers: [
        { name: "Ramesh Patel", qty: 450, sharePercent: 10.0, payout: 39600 },
        { name: "Suresh Meena", qty: 600, sharePercent: 13.3, payout: 52800 },
        { name: "Kailash Gurjar", qty: 350, sharePercent: 7.8, payout: 30800 },
        { name: "Manoj Sharma", qty: 500, sharePercent: 11.1, payout: 44000 },
        { name: "10 other smallholders", qty: 2600, sharePercent: 57.8, payout: 228800 }
      ],
      warehouse: "Jaipur North Mandi WDRA Hub",
      status: "Aggregated & Certified",
      buyerContract: "BigBasket Direct Supply Contract #BB-2026-99"
    },
    {
      id: "FPO-BATCH-02",
      crop: "Lokwan Wheat (Grade A)",
      totalQtyKg: 8200,
      targetMsp: 24.25,
      collectivePrice: 28.50,
      contributingFarmersCount: 22,
      farmers: [
        { name: "Bhanwar Singh", qty: 800, sharePercent: 9.8, payout: 22800 },
        { name: "Deepak Yadav", qty: 650, sharePercent: 7.9, payout: 18525 },
        { name: "20 other smallholders", qty: 6750, sharePercent: 82.3, payout: 192375 }
      ],
      warehouse: "Sanganer Cold & Grain Hub",
      status: "In Transit to Warehouse",
      buyerContract: "Taj Hospitality Bulk Supply Order"
    },
    {
      id: "FPO-BATCH-03",
      crop: "Desi Chickpea (Chana)",
      totalQtyKg: 2800,
      targetMsp: 54.40,
      collectivePrice: 65.00,
      contributingFarmersCount: 9,
      farmers: [
        { name: "Hukma Ram", qty: 500, sharePercent: 17.8, payout: 32500 },
        { name: "8 other smallholders", qty: 2300, sharePercent: 82.2, payout: 149500 }
      ],
      warehouse: "Phulera Rural Depot",
      status: "Ready for Dispatch",
      buyerContract: "Awaiting Final Procurement Confirmation"
    }
  ]);

  // Bulk Buyer Institutional Contracts
  const institutionalContracts = [
    {
      id: "IBC-901",
      buyer: "BigBasket Regional Sourcing Hub",
      category: "E-Grocery Platform",
      crop: "Mustard (Grade A)",
      qtyKg: 4500,
      offeredPriceKg: 88.00,
      deliveryFrequency: "Bi-Weekly Scheduled",
      status: "Active & Contracted"
    },
    {
      id: "IBC-902",
      buyer: "Taj Hospitality & Hotel Group",
      category: "Hotel / Catering Bulk",
      crop: "Lokwan Wheat (Grade A)",
      qtyKg: 8200,
      offeredPriceKg: 28.50,
      deliveryFrequency: "Monthly Batch",
      status: "Quality Inspection Complete"
    },
    {
      id: "IBC-903",
      buyer: "ITC Agri Business Division",
      category: "Food Processor",
      crop: "Desi Chickpea",
      qtyKg: 5000,
      offeredPriceKg: 66.00,
      deliveryFrequency: "Quarterly Demand",
      status: "Pending FPO Member Vote"
    }
  ];

  return (
    <div className="admin-analytics-wrapper" style={{ margin: "20px 0" }}>
      {/* Top Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f231a 0%, #1c4a34 100%)", borderRadius: "16px", padding: "24px", color: "#fff", marginBottom: "20px", border: "1px solid #1e4533" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c8f55b", background: "rgba(200, 245, 91, 0.15)", padding: "4px 10px", borderRadius: "999px" }}>
                SIH-26033 EXPLICIT REQUIREMENT
              </span>
              <span style={{ fontSize: "0.74rem", background: "rgba(255, 255, 255, 0.15)", color: "#fff", padding: "3px 8px", borderRadius: "6px" }}>
                SFAC Registered FPO Portal
              </span>
            </div>
            <h2 style={{ fontSize: "1.6rem", margin: "4px 0 6px", color: "#fff", fontWeight: 900 }}>
              🏢 FPO / Bulk Seller Aggregation &amp; Collective Bargaining Hub
            </h2>
            <p style={{ margin: 0, color: "#d5e6d7", fontSize: "0.92rem", maxWidth: "780px" }}>
              Enables Farmer Producer Organizations (FPOs) and cooperatives to pool fragmented 100–500 kg smallholder harvests into commercial 5,000+ kg institutional lots, unlocking direct corporate contracts with zero intermediary cuts.
            </p>
          </div>

          <div style={{ background: "rgba(0, 0, 0, 0.35)", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "right" }}>
            <small style={{ color: "#94a3b8", display: "block", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700 }}>
              FPO Collective Realization
            </small>
            <b style={{ fontSize: "1.5rem", color: "#34d399", fontWeight: 900 }}>89.4%</b>
            <span style={{ display: "block", fontSize: "0.74rem", color: "#e2e8f0" }}>
              vs 41.2% in local APMC auctions
            </span>
          </div>
        </div>
      </div>

      {/* FPO KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 700 }}>
            <span>ACTIVE MEMBER FARMERS</span>
            <Users size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text-main)", margin: "6px 0 2px" }}>
            {fpoProfile.totalMembers}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 700 }}>
            ✓ Verified Aadhaar &amp; Khasra linked
          </span>
        </div>

        <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 700 }}>
            <span>TOTAL POOLED INVENTORY</span>
            <Scale size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--primary)", margin: "6px 0 2px" }}>
            {fpoProfile.activePoolKg.toLocaleString("en-IN")} kg
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Backed by WDRA electronic receipts
          </span>
        </div>

        <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 700 }}>
            <span>COLLECTIVE PRICE PREMIUM</span>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--success)", margin: "6px 0 2px" }}>
            +₹4.20/kg
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Bulk volume bargaining advantage
          </span>
        </div>

        <div className="metric-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 700 }}>
            <span>ACTIVE BUYER CONTRACTS</span>
            <Building2 size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 900, color: "var(--text-main)", margin: "6px 0 2px" }}>
            {institutionalContracts.length} Corporate
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Zero middleman commissions
          </span>
        </div>
      </div>

      {/* Segmented Sub-Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
        <button
          type="button"
          className={activeTab === "batches" ? "primary" : "secondary"}
          onClick={() => setActiveTab("batches")}
          style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem" }}
        >
          📦 Pooled Collective Batches ({batches.length})
        </button>
        <button
          type="button"
          className={activeTab === "contracts" ? "primary" : "secondary"}
          onClick={() => setActiveTab("contracts")}
          style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem" }}
        >
          🏬 Bulk Buyer Supply Contracts ({institutionalContracts.length})
        </button>
        <button
          type="button"
          className={activeTab === "equity" ? "primary" : "secondary"}
          onClick={() => setActiveTab("equity")}
          style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem" }}
        >
          💳 Member Equity &amp; Dividend Split Ledger
        </button>
      </div>

      {/* Tab 1: Pooled Collective Batches */}
      {activeTab === "batches" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {batches.map((batch) => (
            <div
              key={batch.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 900, color: "var(--text-main)" }}>
                      {batch.crop}
                    </h3>
                    <span style={{ fontSize: "0.75rem", background: "var(--primary-light)", color: "var(--primary)", padding: "3px 8px", borderRadius: "6px", fontWeight: 800 }}>
                      {batch.id}
                    </span>
                    <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "#059669", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                      ✓ {batch.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    🏛️ Storage: {batch.warehouse} · Contract: <b>{batch.buyerContract}</b>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--primary)" }}>
                    ₹{batch.collectivePrice}/kg
                  </div>
                  <small style={{ color: "var(--text-light)" }}>
                    MSP Floor: ₹{batch.targetMsp}/kg (+₹{(batch.collectivePrice - batch.targetMsp).toFixed(2)} premium)
                  </small>
                </div>
              </div>

              {/* Aggregation Breakdown Pill Bar */}
              <div style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <small style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700 }}>Total Batch Quantity</small>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--text-main)" }}>
                    {batch.totalQtyKg.toLocaleString("en-IN")} kg
                  </div>
                </div>
                <div>
                  <small style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700 }}>Total Batch Value</small>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--primary)" }}>
                    ₹{(batch.totalQtyKg * batch.collectivePrice).toLocaleString("en-IN")}
                  </div>
                </div>
                <div>
                  <small style={{ color: "var(--text-light)", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 700 }}>Pooled Farmers</small>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--text-main)" }}>
                    {batch.contributingFarmersCount} Smallholders
                  </div>
                </div>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => notify(`Generating full transparent audit manifest for ${batch.id}…`)}
                  style={{ fontSize: "0.82rem", padding: "6px 14px", borderRadius: "8px" }}
                >
                  <FileCheck size={14} /> View Audit Manifest
                </button>
              </div>

              {/* Member Farmers Mini Table */}
              <div>
                <b style={{ fontSize: "0.84rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Member Farmer Allocation &amp; Payout Share:
                </b>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px" }}>
                  {batch.farmers.map((farmer, fIdx) => (
                    <div key={fIdx} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.8rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{farmer.name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>
                        {farmer.qty} kg ({farmer.sharePercent}%) ➔ <strong style={{ color: "var(--primary)" }}>₹{farmer.payout.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Bulk Buyer Institutional Contracts */}
      {activeTab === "contracts" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {institutionalContracts.map((c) => (
            <div
              key={c.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", background: "var(--primary-light)", color: "var(--primary)", padding: "2px 7px", borderRadius: "6px", fontWeight: 800 }}>
                    {c.category}
                  </span>
                  <h4 style={{ margin: "4px 0 2px", fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
                    {c.buyer}
                  </h4>
                </div>
                <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#059669", padding: "3px 8px", borderRadius: "999px", fontWeight: 700 }}>
                  {c.status}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", margin: "12px 0", color: "var(--text-muted)" }}>
                <div>🌾 Produce: <strong>{c.crop}</strong></div>
                <div>📦 Demand Size: <strong>{c.qtyKg.toLocaleString("en-IN")} kg</strong></div>
                <div>💰 Guaranteed Price: <strong style={{ color: "var(--primary)" }}>₹{c.offeredPriceKg}/kg</strong></div>
                <div>🕒 Delivery Schedule: <strong>{c.deliveryFrequency}</strong></div>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => notify(`Contract ${c.id} confirmed. Escrow payment released to FPO common pool.`)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem" }}
              >
                Accept &amp; Allocate from FPO Pool
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Member Equity Ledger */}
      {activeTab === "equity" && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", fontWeight: 800 }}>
            💳 Transparent FPO Member Dividend &amp; Bank Settlement Ledger
          </h3>
          <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Zero commission structure: 100% of the institutional buyer price is distributed proportionally to member farmers based on digital weighment records.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "var(--surface-raised)", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Farmer Member</th>
                  <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Khasra / Land</th>
                  <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Contributed (kg)</th>
                  <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Gross Realization</th>
                  <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>50% e-NWR Advance</th>
                  <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Final Bank Settlement</th>
                  <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}><b>Ramesh Patel</b></td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>412/1 (Chomu)</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>450 kg</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>₹39,600</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "#0284c7" }}>₹19,800</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--primary)", fontWeight: 800 }}>₹19,800</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#059669", padding: "2px 7px", borderRadius: "6px", fontWeight: 700 }}>
                      ✓ Paid via UPI
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}><b>Suresh Meena</b></td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>119/4 (Phulera)</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>600 kg</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>₹52,800</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "#0284c7" }}>₹26,400</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--primary)", fontWeight: 800 }}>₹26,400</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#059669", padding: "2px 7px", borderRadius: "6px", fontWeight: 700 }}>
                      ✓ Paid via NEFT
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}><b>Kailash Gurjar</b></td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>88/2 (Jaitpura)</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>350 kg</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>₹30,800</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "#0284c7" }}>₹15,400</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--primary)", fontWeight: 800 }}>₹15,400</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.15)", color: "#059669", padding: "2px 7px", borderRadius: "6px", fontWeight: 700 }}>
                      ✓ Paid via UPI
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
