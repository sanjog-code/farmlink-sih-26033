import React, { useState } from 'react';
import { fitTrend, parsePriceCsv } from './forecast.js';
import './ai.css';

const ADVISORY_DATA = {
  Tomato: {
    suggestedRange: '₹26 - ₹29/kg',
    confidence: '78%',
    dataFreshness: 'Today, 9:00 AM',
    headline: 'Tomato: consider selling this week',
    factors: [
      'Nearby regional demand is up 8% this week.',
      'Grade A availability in Jaipur North is moderate.',
      'Your lot is 1 day old; shelf-life risk is low.'
    ],
    shelfLifeNote: 'Perishable: 8-day shelf life. Optimal window is the next 3 days.',
    recommendation: 'SELL_THIS_WEEK'
  },
  'Rapeseed & mustard': {
    suggestedRange: '₹82 - ₹98.40/kg',
    confidence: '84%',
    dataFreshness: 'Today, 9:00 AM',
    headline: 'Mustard: favorable holding window; pledge via e-NWR',
    factors: [
      'Official MSP floor secured at ₹56.50/kg.',
      'Jaitpura/Phulera regional benchmark: ₹82/kg farm purchase, ₹98.40/kg selling price.',
      'Non-perishable oilseed with high storage stability (180+ days).'
    ],
    shelfLifeNote: 'Storable commodity: eligible for 50% working capital advance under e-NWR.',
    recommendation: 'HOLD_OR_PLEDGE'
  },
  Wheat: {
    suggestedRange: '₹24 - ₹28.50/kg',
    confidence: '82%',
    dataFreshness: 'Today, 9:00 AM',
    headline: 'Wheat: steady demand; above MSP baseline',
    factors: [
      'Official MSP floor is ₹22.75/kg (FarmLink guarantees minimum floor).',
      'Mandi market arrival volume is stable across Rajasthan APMCs.',
      'Storable cereal with minimal moisture depreciation in accredited storage.'
    ],
    shelfLifeNote: 'Eligible for WDRA accredited warehouse receipt pledge.',
    recommendation: 'HOLD_OR_SELL'
  },
  'French bean': {
    suggestedRange: '₹44 - ₹52/kg',
    confidence: '75%',
    dataFreshness: 'Today, 9:00 AM',
    headline: 'French bean: strong urban demand; sell immediately',
    factors: [
      'City warehouse demand is up 14% this week.',
      'Highly perishable produce (5-day holding life).',
      'Intake verified Grade A lot commands 10% premium over mandi floor.'
    ],
    shelfLifeNote: 'High perishability: markdown alert triggers after day 4.',
    recommendation: 'SELL_NOW'
  }
};

export default function FreeAdvisory({ close }) {
  const [mode, setMode] = useState('advisory'); // 'advisory' | 'trainer'
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [lotAge, setLotAge] = useState(1);
  const [decision, setDecision] = useState(null);

  // Trainer state
  const [crop, setCrop] = useState('Wheat');
  const [market, setMarket] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [offer, setOffer] = useState('');
  const [cost, setCost] = useState('');
  const [condition, setCondition] = useState(false);

  const activeAdvisory = ADVISORY_DATA[selectedCrop] || ADVISORY_DATA.Tomato;
  const stale = result && Date.now() - Date.parse(result.latest.date) > 3 * 86400000;
  const costsKnown = cost !== '' && Number(cost) >= 0;
  const net = result && costsKnown ? result.predicted - Number(cost) : null;

  return (
    <div className="modal-back">
      <section className="modal ai-workspace" role="dialog" aria-modal="true" aria-labelledby="ai-title" style={{ maxWidth: '640px' }}>
        <button className="close" onClick={close} aria-label="Close advisory">×</button>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            className={mode === 'advisory' ? 'primary' : 'secondary'}
            onClick={() => setMode('advisory')}
            style={{ padding: '6px 14px', fontSize: '0.9rem' }}
          >
            Explainable Advisory (Live)
          </button>
          <button
            className={mode === 'trainer' ? 'primary' : 'secondary'}
            onClick={() => setMode('trainer')}
            style={{ padding: '6px 14px', fontSize: '0.9rem' }}
          >
            Custom CSV Model Trainer
          </button>
        </div>

        {mode === 'advisory' ? (
          <div>
            <p className="eyebrow green">EXPLAINABLE FARM ADVISORY</p>
            <h2 id="ai-title" style={{ fontSize: '1.4rem', margin: '4px 0 12px' }}>{activeAdvisory.headline}</h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                Select Crop:
                <select
                  value={selectedCrop}
                  onChange={(e) => { setSelectedCrop(e.target.value); setDecision(null); }}
                  style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '6px' }}
                >
                  <option value="Tomato">Tomato (Perishable Vegetable)</option>
                  <option value="Rapeseed & mustard">Rapeseed & Mustard (Oilseed / Pilot Crop)</option>
                  <option value="Wheat">Wheat (MSP Grain)</option>
                  <option value="French bean">French bean (High-value Pulse)</option>
                </select>
              </label>

              <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                Lot Age:
                <select
                  value={lotAge}
                  onChange={(e) => setLotAge(Number(e.target.value))}
                  style={{ marginLeft: '6px', padding: '6px 10px', borderRadius: '6px' }}
                >
                  <option value={1}>1 Day Fresh</option>
                  <option value={3}>3 Days (Mid-life)</option>
                  <option value={6}>6 Days (Near Spoilage Threshold)</option>
                </select>
              </label>
            </div>

            <div className="recommend" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#eef6f1', padding: '12px', borderRadius: '8px', border: '1px solid #d2e8db' }}>
              <div>
                <small style={{ color: '#4d6957', fontWeight: 'bold' }}>SUGGESTED RANGE</small>
                <b style={{ display: 'block', fontSize: '1.2rem', color: '#1a4e2e' }}>{activeAdvisory.suggestedRange}</b>
              </div>
              <div>
                <small style={{ color: '#4d6957', fontWeight: 'bold' }}>CONFIDENCE</small>
                <b style={{ display: 'block', fontSize: '1.2rem', color: '#1a4e2e' }}>{activeAdvisory.confidence}</b>
              </div>
              <div>
                <small style={{ color: '#4d6957', fontWeight: 'bold' }}>DATA FRESHNESS</small>
                <b style={{ display: 'block', fontSize: '1.1rem', color: '#1a4e2e' }}>{activeAdvisory.dataFreshness}</b>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#1a4e2e', marginBottom: '8px' }}>Why this guidance?</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6', fontSize: '0.95rem', color: '#273b2f' }}>
                {activeAdvisory.factors.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
                {lotAge >= 6 && selectedCrop === 'Tomato' && (
                  <li style={{ color: '#b93815', fontWeight: 'bold' }}>
                    Warning: Lot is 6 days old. Spoilage risk is elevated; recommend 10% markdown to liquidate before decay.
                  </li>
                )}
              </ul>
            </div>

            <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid #2e7d4e', margin: '14px 0', fontSize: '0.88rem', color: '#445b4c' }}>
              <strong>Shelf-life Insight:</strong> {activeAdvisory.shelfLifeNote}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fdfbf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fae8be', fontSize: '0.82rem', color: '#7a5a14' }}>
              <span>🛡️</span>
              <span>This is an explainable recommendation, not a guaranteed price. You remain in control of your sale decision.</span>
            </div>

            {decision && (
              <p style={{ marginTop: '12px', padding: '8px 12px', background: '#eaf7ed', color: '#1f5c37', fontWeight: 'bold', borderRadius: '6px' }}>
                ✓ Decision recorded: {decision === 'hold' ? 'Holding stock in warehouse. Daily storage fee applies.' : 'Produce queued for marketplace listing & buyer matching.'}
              </p>
            )}

            <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                className="secondary"
                onClick={() => setDecision('hold')}
                style={{ flex: 1, padding: '10px' }}
              >
                I’ll hold
              </button>
              <button
                className="primary"
                onClick={() => setDecision('list')}
                style={{ flex: 1, padding: '10px' }}
              >
                List for buyers
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="eyebrow green">FARMER PRICE LAB</p>
            <h2 style={{ fontSize: '1.3rem', margin: '4px 0 10px' }}>Train Custom Linear Price Baseline</h2>
            <p style={{ fontSize: '0.9rem', color: '#555' }}>Upload historical mandi price CSV to evaluate local price direction.</p>
            <div className="form-grid">
              <label>Crop<input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Wheat" /></label>
              <label>Market & Variety<input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="e.g. Kota mandi, wheat variety" /></label>
              <label>
                Import Price History (CSV)
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 500000) return setError('Use a CSV smaller than 500 KB.');
                    setText(await f.text());
                    setResult(null);
                    setError('');
                  }}
                />
              </label>
              <small>One market, one crop. Header: date,price. Dates: YYYY-MM-DD. Prices: INR/kg. Minimum 21 observations.</small>
              <textarea aria-label="Price CSV" value={text} onChange={(e) => setText(e.target.value)} placeholder={'date,price\n2026-01-01,25.80\n2026-01-02,26.10'} rows={4} />
              <button
                className="primary"
                onClick={() => {
                  setError('');
                  setResult(null);
                  try {
                    if (!market.trim()) throw new Error('Enter the source market and variety.');
                    setResult(fitTrend(parsePriceCsv(text)));
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                Train and evaluate forecast
              </button>
            </div>

            {error && <p role="alert" style={{ color: '#b93815', fontWeight: 'bold' }}>{error}</p>}

            {result && (
              <section aria-live="polite" style={{ marginTop: '14px', background: '#f5faf7', padding: '12px', borderRadius: '8px' }}>
                <h4>{crop} · {market}</h4>
                <div className="ai-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '8px 0' }}>
                  <article><small>Latest observation</small><b>₹{result.latest.price.toFixed(2)}/kg</b></article>
                  <article><small>7-day projection</small><b>₹{result.predicted.toFixed(2)}/kg</b></article>
                  <article><small>Holdout error</small><b>₹{result.mae.toFixed(2)}/kg</b></article>
                </div>
                <small style={{ color: '#555' }}>Baseline Error: ₹{result.naiveMae.toFixed(2)}/kg. {result.beatsNaive ? '✓ Trend outperformed naive baseline.' : '⚠ High variance detected.'}</small>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
