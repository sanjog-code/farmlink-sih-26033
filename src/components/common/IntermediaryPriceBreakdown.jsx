/**
 * IntermediaryPriceBreakdown
 * --------------------------
 * Reusable component for SIH PS 26033:
 *   "Multiple intermediaries reduce farmers' earnings and increase consumer prices"
 *
 * Shows a side-by-side comparison of the traditional Mandi chain vs the
 * FarmLink direct-stack, calculated from the crop and (optional) farmerPrice.
 *
 * Props:
 *   crop          {string}  Crop name, e.g. "Tomato"
 *   farmerPrice   {number}  Optional — price farmer earns on FarmLink (₹/kg)
 *   consumerPrice {number}  Optional — consumer price on FarmLink (₹/kg)
 */

import React from "react";
import "./intermediaryBreakdown.css";

// Default farmgate reference prices per crop (FarmLink benchmarks, ₹/kg)
const CROP_DEFAULTS = {
  Wheat: 24,
  Mustard: 82,
  Tomato: 14,
  Onion: 18,
};

const DEFAULT_FARMGATE = 20; // fallback

/**
 * Round a number to 2 decimal places.
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  return Number(n).toFixed(2);
}

export default function IntermediaryPriceBreakdown({ crop = "", farmerPrice, consumerPrice }) {
  // ── Derive traditional chain numbers ──────────────────────────────────────

  // Farmer's price in the traditional chain
  const traditionalFarmerPrice =
    typeof farmerPrice === "number" && farmerPrice > 0
      ? farmerPrice                            // reuse provided price as the traditional reference
      : (CROP_DEFAULTS[crop] ?? DEFAULT_FARMGATE);

  // In the traditional chain the farmer gets ~35 % of what the consumer pays
  const farmerSharePct = 35;
  const traditionalConsumerPrice = Math.ceil(traditionalFarmerPrice / 0.35);

  // ── FarmLink chain numbers ─────────────────────────────────────────────────

  // FarmLink farmer earns ~78 % more than the traditional farmgate price
  const gainPct = 78;
  const flFarmerPrice =
    typeof farmerPrice === "number" && farmerPrice > 0
      ? farmerPrice
      : Number(fmt(traditionalFarmerPrice * (1 + gainPct / 100)));

  // FarmLink consumer pays ~25 % less than the traditional consumer price
  const savedPct = 25;
  const flConsumerPrice =
    typeof consumerPrice === "number" && consumerPrice > 0
      ? consumerPrice
      : Math.ceil(traditionalConsumerPrice * (1 - savedPct / 100));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="intermediary-breakdown-card">
      {/* Header */}
      <div className="ib-header">
        <span className="ib-header-icon">⚡</span>
        <span className="ib-header-title">HOW FARMLINK ELIMINATES MIDDLEMEN</span>
        <span className="ib-sih-badge">SIH PS 26033</span>
      </div>

      {/* Two-column comparison */}
      <div className="ib-columns">

        {/* ── Traditional Mandi Chain ── */}
        <div className="ib-col ib-col-traditional">
          <div className="ib-col-header">❌ Traditional Mandi Chain</div>

          <div className="ib-row">
            <span className="ib-label">Farmer receives</span>
            <span className="ib-value ib-value-low">
              ₹{fmt(traditionalFarmerPrice)}/kg ({farmerSharePct}%)
            </span>
          </div>

          <div className="ib-row">
            <span className="ib-label">Village Trader</span>
            <span className="ib-value">₹4/kg</span>
          </div>

          <div className="ib-row">
            <span className="ib-label">Mandi Commission</span>
            <span className="ib-value">₹3/kg</span>
          </div>

          <div className="ib-row">
            <span className="ib-label">Wholesaler Cut</span>
            <span className="ib-value">₹5/kg</span>
          </div>

          <div className="ib-row">
            <span className="ib-label">Retailer Margin</span>
            <span className="ib-value">₹9/kg</span>
          </div>

          <div className="ib-row">
            <span className="ib-label">Mandi Wastage</span>
            <span className="ib-value">₹5/kg</span>
          </div>

          <div className="ib-consumer-row">
            <span>🛒 Consumer Pays</span>
            <span className="ib-consumer-price ib-price-high">
              ₹{traditionalConsumerPrice}/kg
            </span>
          </div>
        </div>

        {/* ── FarmLink Direct Stack ── */}
        <div className="ib-col ib-col-farmlink">
          <div className="ib-col-header">✅ FarmLink Direct Stack</div>

          <div className="ib-row">
            <span className="ib-label">Farmer receives</span>
            <span className="ib-value ib-value-high">
              ₹{fmt(flFarmerPrice)}/kg (+{gainPct}% GAIN)
            </span>
          </div>

          <div className="ib-row">
            <span className="ib-label">Direct Transit &amp; Hub</span>
            <span className="ib-value">₹4/kg</span>
          </div>

          <div className="ib-row">
            <span className="ib-label">Quality &amp; Platform Fee</span>
            <span className="ib-value">₹1/kg</span>
          </div>

          <div className="ib-row ib-row-eliminated">
            <span className="ib-label">Middlemen Commission</span>
            <span className="ib-eliminated">₹0 — ELIMINATED</span>
          </div>

          <div className="ib-consumer-row">
            <span>🛒 Consumer Pays</span>
            <span className="ib-consumer-price ib-price-low">
              ₹{flConsumerPrice}/kg ({savedPct}% SAVED)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
