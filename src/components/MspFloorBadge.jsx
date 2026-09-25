import React, { useEffect, useState } from "react";
import { ShieldCheck, AlertOctagon, TrendingUp, Info } from "lucide-react";
import { getMspFloorForCrop } from "../lib/mspRates";

export default function MspFloorBadge({ crop, enteredPrice, onFloorDetected }) {
  const [floorData, setFloorData] = useState(() => getMspFloorForCrop(crop));

  useEffect(() => {
    const updated = getMspFloorForCrop(crop);
    setFloorData(updated);
    if (onFloorDetected) onFloorDetected(updated.price);

    const handleMspUpdate = (e) => {
      const fresh = getMspFloorForCrop(crop);
      setFloorData(fresh);
      if (onFloorDetected) onFloorDetected(fresh.price);
    };

    window.addEventListener("farmlink_msp_updated", handleMspUpdate);
    return () => window.removeEventListener("farmlink_msp_updated", handleMspUpdate);
  }, [crop]);

  if (!floorData || !floorData.price) return null;

  const floor = floorData.price;
  const numEntered = Number(enteredPrice);
  const hasEntered = !isNaN(numEntered) && numEntered > 0;
  const isViolation = hasEntered && numEntered < floor;

  return (
    <div className={`msp-hovering-badge ${isViolation ? "violation-active" : "compliant-active"}`}>
      <div className="msp-badge-top">
        <span className="msp-badge-title">
          <ShieldCheck size={14} className="msp-icon" />
          {floorData.isOfficial === true ? (
            <b>🏛️ CACP Minimum Support Price: ₹{floor.toFixed(2)}/kg</b>
          ) : (
            <b>🌿 Transparent Farmgate Benchmark: ₹{floor.toFixed(2)}/kg</b>
          )}
        </span>
        <span className="msp-live-tag">
          <span className="pulse-dot"></span> LIVE
        </span>
      </div>

      <div className="msp-price-display">
        <span className="msp-currency">₹</span>
        <span className="msp-value">{floor.toFixed(2)}</span>
        <span className="msp-unit">/kg</span>
      </div>

      <div className="msp-compliance-tag">
        {isViolation ? (
          <span className="violation-text">
            <AlertOctagon size={12} /> Below Floor Forbidden
          </span>
        ) : (
          <span className="compliant-text">
            ✓ Strictly Protected
          </span>
        )}
      </div>

      <div className="msp-badge-footer">
        <span>{floorData.season || "RMS 2026-27"}</span>
        {floorData.source && (
          <a href={floorData.source} target="_blank" rel="noreferrer" title="Official Government CACP gazette notification">
            Gazette
          </a>
        )}
      </div>
    </div>
  );
}
