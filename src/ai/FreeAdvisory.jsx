import React, { useState, useMemo } from 'react';
import { fitTrend, parsePriceCsv } from './forecast.js';
import './ai.css';

// ─── Crop category engine ────────────────────────────────────────────────────
// Maps every INDIA_CROPS category (and specific crops) to advisory data
// so ANY crop the farmer has gets a real, specific recommendation.

const CATEGORY_PROFILES = {
  'Vegetables': {
    shelfDays: 7,
    perishability: 'HIGH',
    storageNote: 'Highly perishable. Sell within optimal window to avoid markdown.',
    baseRange: [18, 55],
    msp: null,
    recommendation: 'SELL_NOW',
    demandNote: 'Urban retail demand is strong. Grade A lots command 10–15% premium.',
  },
  'Fruits': {
    shelfDays: 10,
    perishability: 'HIGH',
    storageNote: 'Perishable. Cold-chain handoff within 3 days recommended.',
    baseRange: [25, 90],
    msp: null,
    recommendation: 'SELL_THIS_WEEK',
    demandNote: 'Export-grade demand rising. Domestic mandi volume stable.',
  },
  'Cereals & millets': {
    shelfDays: 365,
    perishability: 'LOW',
    storageNote: 'Storable cereal/millet. Eligible for WDRA-accredited warehouse pledge.',
    baseRange: [18, 35],
    msp: '₹22.75/kg (Wheat MSP benchmark)',
    recommendation: 'HOLD_OR_SELL',
    demandNote: 'Mandi arrival volume stable across Rajasthan APMCs. FCI procurement active.',
  },
  'Pulses': {
    shelfDays: 180,
    perishability: 'LOW',
    storageNote: 'Storable pulse. Eligible for e-NWR pledge and working capital advance.',
    baseRange: [55, 110],
    msp: '₹67/kg (Tur/Arhar MSP benchmark)',
    recommendation: 'HOLD_OR_PLEDGE',
    demandNote: 'Domestic consumption steady. Procurement through NAFED ongoing.',
  },
  'Oilseeds': {
    shelfDays: 180,
    perishability: 'LOW',
    storageNote: 'Storable oilseed. Eligible for 50% working capital advance under e-NWR.',
    baseRange: [55, 100],
    msp: '₹56.50/kg (Rapeseed/Mustard MSP)',
    recommendation: 'HOLD_OR_PLEDGE',
    demandNote: 'Jaitpura/Phulera regional benchmark ₹82–₹98.40/kg. Edible oil demand strong.',
  },
  'Commercial & fibre': {
    shelfDays: 365,
    perishability: 'LOW',
    storageNote: 'Non-perishable commercial crop. Long storage window.',
    baseRange: [45, 130],
    msp: '₹67.21/kg (Cotton MSP benchmark)',
    recommendation: 'HOLD_OR_SELL',
    demandNote: 'Textile/export demand driven. MSP procurement via CCI for cotton.',
  },
  'Spices & condiments': {
    shelfDays: 365,
    perishability: 'LOW',
    storageNote: 'Long shelf-life spice commodity. Cold storage optional.',
    baseRange: [60, 350],
    msp: null,
    recommendation: 'HOLD_OR_SELL',
    demandNote: 'Export demand from Middle East and SE Asia strong. Cumin and coriander premium grade in demand.',
  },
  'Plantation & horticulture': {
    shelfDays: 30,
    perishability: 'MODERATE',
    storageNote: 'Moderate shelf life. Monitor for moisture loss.',
    baseRange: [30, 80],
    msp: null,
    recommendation: 'SELL_THIS_WEEK',
    demandNote: 'Value chain processing demand steady. Co-operative bulk buy-back active.',
  },
};

// Specific crop overrides — precise data for known crops
const CROP_OVERRIDES = {
  'Tomato':              { range: '₹26–₹33/kg', confidence: '78%', shelfDays: 8,  msrNote: null, extraFactor: 'Grade A availability in Jaipur North is moderate; nearby regional demand up 8% this week.' },
  'Onion':               { range: '₹14–₹22/kg', confidence: '76%', shelfDays: 60, msrNote: null, extraFactor: 'Kharif onion arrivals moderate. Storage lots eligible for NCCF procurement.' },
  'Potato':              { range: '₹12–₹18/kg', confidence: '80%', shelfDays: 90, msrNote: null, extraFactor: 'Cold-store availability in Agra belt high. Price firm through festive season.' },
  'Rapeseed & mustard':  { range: '₹82–₹98.40/kg', confidence: '84%', shelfDays: 180, msrNote: 'Official MSP floor ₹56.50/kg secured. Phulera pilot: ₹82 farm purchase, ₹98.40 selling.', extraFactor: 'Non-perishable oilseed; 180+ day storage stability. Pledge via e-NWR for 50% advance.' },
  'Wheat':               { range: '₹24–₹28.50/kg', confidence: '82%', shelfDays: 365, msrNote: 'Official MSP ₹22.75/kg — FarmLink guarantees MSP floor.', extraFactor: 'Mandi arrival volume stable across Rajasthan APMCs. FCI procurement active.' },
  'Rice':                { range: '₹22–₹28/kg', confidence: '79%', shelfDays: 365, msrNote: 'MSP ₹23.10/kg (Common grade).', extraFactor: 'Kharif procurement via FCI and state agencies active. Grade A fetches milling premium.' },
  'French bean':         { range: '₹44–₹52/kg', confidence: '75%', shelfDays: 5,  msrNote: null, extraFactor: 'City warehouse demand up 14% this week. Grade A lot commands 10% premium over mandi floor.' },
  'Chickpea (Gram)':     { range: '₹58–₹72/kg', confidence: '77%', shelfDays: 180, msrNote: 'MSP ₹54.40/kg. NAFED procurement active.', extraFactor: 'Rabi chickpea stock tightening. Hold for seasonal uptick post-February.' },
  'Pigeon pea (Arhar/Tur)': { range: '₹90–₹110/kg', confidence: '74%', shelfDays: 180, msrNote: 'MSP ₹67/kg. Domestic demand strong.', extraFactor: 'Import controls tightened. Domestic prices above MSP. Pledge via e-NWR for capital.' },
  'Groundnut':           { range: '₹55–₹68/kg', confidence: '76%', shelfDays: 180, msrNote: 'MSP ₹63.77/kg (with shell).', extraFactor: 'Edible oil demand driving premium. NAFED procurement window open.' },
  'Cotton':              { range: '₹65–₹78/kg', confidence: '73%', shelfDays: 365, msrNote: 'MSP ₹67.21/kg (Medium staple).', extraFactor: 'CCI procurement active. Textile demand from Surat and Ahmedabad mills stable.' },
  'Sugarcane':           { range: '₹3.40–₹3.80/kg', confidence: '85%', shelfDays: 3, msrNote: 'FRP ₹3.40/kg (Fair and Remunerative Price).', extraFactor: 'Must deliver to linked sugar mill within 24–48 hrs of harvest. Weight shrinkage above 3 days.' },
  'Maize':               { range: '₹18–₹22/kg', confidence: '78%', shelfDays: 365, msrNote: 'MSP ₹18.48/kg.', extraFactor: 'Poultry feed demand strong. Starch processing industry buying above MSP.' },
  'Mango':               { range: '₹35–₹80/kg', confidence: '71%', shelfDays: 14, msrNote: null, extraFactor: 'Premium variety (Alphonso/Kesar) export demand high. Domestic retail peak April–June.' },
  'Banana':              { range: '₹18–₹28/kg', confidence: '72%', shelfDays: 7,  msrNote: null, extraFactor: 'Robust year-round demand. Grade A bunch commands ripening-room premium.' },
  'Turmeric':            { range: '₹120–₹180/kg', confidence: '70%', shelfDays: 365, msrNote: null, extraFactor: 'Erode/Nizamabad benchmark prices elevated. Export demand from Middle East strong.' },
  'Ginger':              { range: '₹70–₹130/kg', confidence: '69%', shelfDays: 180, msrNote: null, extraFactor: 'Dry ginger commands 3× premium. Processing unit offtake strong.' },
  'Cumin':               { range: '₹200–₹320/kg', confidence: '72%', shelfDays: 365, msrNote: null, extraFactor: 'Unjha mandi benchmark. Export orders to UAE and US active.' },
  'Coriander seed':      { range: '₹75–₹110/kg', confidence: '71%', shelfDays: 365, msrNote: null, extraFactor: 'Kota/Baran mandi prices stable. Domestic spice processing demand firm.' },
  'Soybean':             { range: '₹40–₹48/kg', confidence: '76%', shelfDays: 180, msrNote: 'MSP ₹43.00/kg.', extraFactor: 'Solvent extraction demand steady. SOPA procurement window may open.' },
  'Sunflower':           { range: '₹58–₹67/kg', confidence: '74%', shelfDays: 180, msrNote: 'MSP ₹67.00/kg.', extraFactor: 'Edible oil import moderation supporting domestic prices above MSP.' },
  'Kiwi':                { range: '₹120–₹180/kg', confidence: '65%', shelfDays: 30, msrNote: null, extraFactor: 'Import substitution demand rising. Himachal/Uttarakhand origin premium.' },
  'Strawberry':          { range: '₹80–₹140/kg', confidence: '66%', shelfDays: 4,  msrNote: null, extraFactor: 'Ultra-perishable. Cold-chain delivery essential. Urban QSR demand strong.' },
  'Pomegranate':         { range: '₹60–₹95/kg', confidence: '72%', shelfDays: 60, msrNote: null, extraFactor: 'Solapur/Nashik variety commands export premium. Juice processing demand year-round.' },
  'Grapes':              { range: '₹45–₹75/kg', confidence: '70%', shelfDays: 14, msrNote: null, extraFactor: 'Nashik export season Feb–May. Table grape premium above Thompson variety.' },
};

// ─── Derive advisory for ANY crop ────────────────────────────────────────────
function getAdvisory(cropName, category, lotAgeDays) {
  const override = CROP_OVERRIDES[cropName];
  const catProfile = CATEGORY_PROFILES[category] || CATEGORY_PROFILES['Vegetables'];

  const shelfDays = override?.shelfDays ?? catProfile.shelfDays;
  const confidence = override?.confidence ?? '70%';
  const perishability = catProfile.perishability;

  // Price range
  let range = override?.range;
  if (!range) {
    const [lo, hi] = catProfile.baseRange;
    range = `₹${lo}–₹${hi}/kg`;
  }

  // Shelf-life status
  const ageRatio = lotAgeDays / shelfDays;
  let shelfStatus = '';
  let shelfColor = '#2e7d4e';
  if (perishability === 'LOW') {
    shelfStatus = `Long shelf life (${shelfDays}+ days). Storage risk minimal.`;
  } else if (ageRatio < 0.35) {
    shelfStatus = `Fresh — ${shelfDays - lotAgeDays} days remaining in optimal window.`;
  } else if (ageRatio < 0.7) {
    shelfStatus = `Mid-window — ${shelfDays - lotAgeDays} days left. Plan dispatch soon.`;
    shelfColor = '#c47d00';
  } else {
    shelfStatus = `⚠ Near spoilage threshold (${lotAgeDays}/${shelfDays} days). Consider 10–15% markdown to liquidate.`;
    shelfColor = '#b93815';
  }

  // Recommendation label
  const rec = override ? null : catProfile.recommendation;
  const recommendation = override
    ? (shelfDays <= 7 ? 'SELL_NOW' : shelfDays <= 30 ? 'SELL_THIS_WEEK' : 'HOLD_OR_PLEDGE')
    : rec;

  // Factors list
  const factors = [
    override?.extraFactor ?? catProfile.demandNote,
    catProfile.storageNote,
  ];
  if (override?.msrNote) factors.unshift(override.msrNote);
  if (catProfile.msp && !override?.msrNote) factors.unshift(`MSP benchmark: ${catProfile.msp}`);

  const headline = recommendation === 'SELL_NOW'
    ? `${cropName}: sell immediately — high perishability`
    : recommendation === 'SELL_THIS_WEEK'
    ? `${cropName}: sell this week for best price`
    : `${cropName}: hold & consider e-NWR pledge`;

  return { range, confidence, headline, factors, shelfStatus, shelfColor, recommendation, shelfDays, perishability };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FreeAdvisory({ close, myLots = [], onListCrop }) {
  // Build crop list from farmer's actual lots first, then all INDIA_CROPS categories
  const farmerCrops = useMemo(() => {
    const seen = new Set();
    return myLots
      .map(l => ({ name: l.crop, category: l.category || 'Vegetables', fromLot: true, lotAge: l.lotAge ?? 1 }))
      .filter(c => { if (seen.has(c.name)) return false; seen.add(c.name); return true; });
  }, [myLots]);

  // Default selection: first farmer crop, or Tomato
  const defaultCrop = farmerCrops[0]?.name || 'Tomato';
  const defaultCategory = farmerCrops[0]?.category || 'Vegetables';

  const [mode, setMode] = useState('advisory');
  const [selectedCrop, setSelectedCrop] = useState(defaultCrop);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [lotAge, setLotAge] = useState(farmerCrops[0]?.lotAge ?? 1);
  const [decision, setDecision] = useState(null);
  const [customCropInput, setCustomCropInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Trainer state
  const [tcrop, setTCrop] = useState('Wheat');
  const [market, setMarket] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cost, setCost] = useState('');

  const advisory = useMemo(
    () => getAdvisory(selectedCrop, selectedCategory, lotAge),
    [selectedCrop, selectedCategory, lotAge]
  );

  const net = result && cost !== '' && Number(cost) >= 0
    ? result.predicted - Number(cost) : null;

  // Category → crop map for the dropdown
  const CATEGORY_CROP_MAP = {
    'Vegetables': ['Tomato', 'Onion', 'Potato', 'Brinjal (Eggplant)', 'Okra (Bhindi)', 'Capsicum', 'Chilli', 'Cauliflower', 'Cabbage', 'Carrot', 'Peas', 'French bean', 'Bitter gourd', 'Bottle gourd', 'Pumpkin', 'Cucumber', 'Spinach', 'Garlic', 'Mushroom', 'Other vegetable'],
    'Fruits': ['Mango', 'Banana', 'Grapes', 'Pomegranate', 'Guava', 'Papaya', 'Apple', 'Kiwi', 'Strawberry', 'Orange', 'Lemon', 'Litchi', 'Jackfruit', 'Pineapple', 'Sapota (Chikoo)', 'Watermelon', 'Muskmelon', 'Other fruit'],
    'Cereals & millets': ['Wheat', 'Rice', 'Maize', 'Barley', 'Sorghum (Jowar)', 'Pearl millet (Bajra)', 'Finger millet (Ragi)', 'Other cereal/millet'],
    'Pulses': ['Chickpea (Gram)', 'Pigeon pea (Arhar/Tur)', 'Green gram (Moong)', 'Black gram (Urad)', 'Lentil (Masur)', 'French bean', 'Soybean', 'Cowpea', 'Other pulse'],
    'Oilseeds': ['Rapeseed & mustard', 'Groundnut', 'Sunflower', 'Sesame (Til)', 'Soybean', 'Cottonseed', 'Other oilseed'],
    'Commercial & fibre': ['Cotton', 'Sugarcane', 'Jute', 'Tobacco', 'Other commercial crop'],
    'Spices & condiments': ['Turmeric', 'Ginger', 'Cumin', 'Coriander seed', 'Black pepper', 'Cardamom', 'Fenugreek', 'Fennel', 'Ajwain', 'Other spice'],
  };

  const recBadgeColor = {
    SELL_NOW: '#b93815',
    SELL_THIS_WEEK: '#c47d00',
    HOLD_OR_SELL: '#1a6e3e',
    HOLD_OR_PLEDGE: '#1a4e8e',
  };
  const recLabel = {
    SELL_NOW: '🔴 Sell immediately',
    SELL_THIS_WEEK: '🟡 Sell this week',
    HOLD_OR_SELL: '🟢 Hold or sell',
    HOLD_OR_PLEDGE: '🔵 Hold / pledge via e-NWR',
  };

  return (
    <div className="modal-back">
      <section className="modal ai-workspace" role="dialog" aria-modal="true" aria-labelledby="ai-title" style={{ maxWidth: '660px' }}>
        <button className="close" onClick={close} aria-label="Close advisory">×</button>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            className={mode === 'advisory' ? 'primary' : 'secondary'}
            onClick={() => setMode('advisory')}
            style={{ padding: '6px 14px', fontSize: '0.9rem' }}
          >
            📊 Explainable Advisory
          </button>
          <button
            className={mode === 'trainer' ? 'primary' : 'secondary'}
            onClick={() => setMode('trainer')}
            style={{ padding: '6px 14px', fontSize: '0.9rem' }}
          >
            🧪 CSV Price Trainer
          </button>
        </div>

        {mode === 'advisory' ? (
          <div>
            <p className="eyebrow green">EXPLAINABLE FARM ADVISORY · ALL CROPS</p>
            <h2 id="ai-title" style={{ fontSize: '1.3rem', margin: '4px 0 12px' }}>{advisory.headline}</h2>

            {/* Farmer's lots quick-select */}
            {farmerCrops.length > 0 && (
              <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#eef6f1', borderRadius: '8px', border: '1px solid #c8e6d0' }}>
                <small style={{ fontWeight: 'bold', color: '#2e7d4e', display: 'block', marginBottom: '6px' }}>YOUR LOTS IN STORAGE</small>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {farmerCrops.map(c => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedCrop(c.name);
                        setSelectedCategory(c.category);
                        setLotAge(c.lotAge ?? 1);
                        setDecision(null);
                      }}
                      style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer',
                        background: selectedCrop === c.name ? '#1a4e2e' : '#fff',
                        color: selectedCrop === c.name ? '#fff' : '#1a4e2e',
                        border: '1.5px solid #2e7d4e', fontWeight: selectedCrop === c.name ? 'bold' : 'normal'
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Crop selectors */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>
                Category:
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setSelectedCategory(cat);
                    const crops = CATEGORY_CROP_MAP[cat] || [];
                    setSelectedCrop(crops[0] || cat);
                    setDecision(null);
                    setShowCustom(false);
                  }}
                  style={{ marginLeft: '6px', padding: '5px 8px', borderRadius: '6px' }}
                >
                  {Object.keys(CATEGORY_CROP_MAP).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>
                Crop:
                <select
                  value={showCustom ? '__custom' : selectedCrop}
                  onChange={(e) => {
                    if (e.target.value === '__custom') { setShowCustom(true); return; }
                    setSelectedCrop(e.target.value);
                    setDecision(null);
                    setShowCustom(false);
                  }}
                  style={{ marginLeft: '6px', padding: '5px 8px', borderRadius: '6px' }}
                >
                  {(CATEGORY_CROP_MAP[selectedCategory] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom">Other (type below)</option>
                </select>
              </label>

              {showCustom && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    value={customCropInput}
                    onChange={e => setCustomCropInput(e.target.value)}
                    placeholder="Enter crop name"
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.88rem' }}
                  />
                  <button className="primary" style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                    onClick={() => { if (customCropInput.trim()) { setSelectedCrop(customCropInput.trim()); setShowCustom(false); setDecision(null); } }}
                  >
                    Apply
                  </button>
                </div>
              )}

              <label style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>
                Lot age:
                <select
                  value={lotAge}
                  onChange={(e) => { setLotAge(Number(e.target.value)); setDecision(null); }}
                  style={{ marginLeft: '6px', padding: '5px 8px', borderRadius: '6px' }}
                >
                  <option value={1}>1 day (fresh)</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </label>
            </div>

            {/* Price card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#eef6f1', padding: '12px', borderRadius: '8px', border: '1px solid #d2e8db', marginBottom: '14px' }}>
              <div>
                <small style={{ color: '#4d6957', fontWeight: 'bold' }}>SUGGESTED RANGE</small>
                <b style={{ display: 'block', fontSize: '1.2rem', color: '#1a4e2e' }}>{advisory.range}</b>
              </div>
              <div>
                <small style={{ color: '#4d6957', fontWeight: 'bold' }}>CONFIDENCE</small>
                <b style={{ display: 'block', fontSize: '1.2rem', color: '#1a4e2e' }}>{advisory.confidence}</b>
              </div>
              <div>
                <small style={{ color: '#4d6957', fontWeight: 'bold' }}>RECOMMENDATION</small>
                <b style={{ display: 'block', fontSize: '0.92rem', color: recBadgeColor[advisory.recommendation] }}>
                  {recLabel[advisory.recommendation]}
                </b>
              </div>
            </div>

            {/* Factors */}
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', color: '#1a4e2e', marginBottom: '6px' }}>Why this guidance?</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.7', fontSize: '0.92rem', color: '#273b2f', margin: 0 }}>
                {advisory.factors.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>

            {/* Shelf life */}
            <div style={{ background: '#f8faf9', padding: '10px 14px', borderRadius: '6px', borderLeft: `4px solid ${advisory.shelfColor}`, marginBottom: '12px', fontSize: '0.88rem', color: '#445b4c' }}>
              <strong>Shelf-life insight:</strong> {advisory.shelfStatus}
            </div>

            {/* Disclaimer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fdfbf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fae8be', fontSize: '0.82rem', color: '#7a5a14', marginBottom: '14px' }}>
              <span>🛡️</span>
              <span>Explainable recommendation — not a guaranteed price. You remain in control of your sale decision.</span>
            </div>

            {/* Decision feedback */}
            {decision && (
              <p style={{ padding: '8px 12px', background: '#eaf7ed', color: '#1f5c37', fontWeight: 'bold', borderRadius: '6px', marginBottom: '10px' }}>
                ✓ Recorded: {decision === 'hold'
                  ? `Holding ${selectedCrop} in warehouse. Daily storage fee applies. e-NWR pledge available.`
                  : `${selectedCrop} queued for marketplace listing & buyer matching.`}
              </p>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="secondary"
                onClick={() => { setDecision('hold'); }}
                style={{ flex: 1, padding: '10px', fontSize: '0.95rem' }}
              >
                🏪 I'll hold in storage
              </button>
              <button
                className="primary"
                onClick={() => {
                  setDecision('list');
                  if (onListCrop) onListCrop(selectedCrop);
                  else close();
                }}
                style={{ flex: 1, padding: '10px', fontSize: '0.95rem' }}
              >
                🛒 List for buyers
              </button>
            </div>
          </div>

        ) : (
          /* ─── CSV Trainer mode ─── */
          <div>
            <p className="eyebrow green">FARMER PRICE LAB</p>
            <h2 style={{ fontSize: '1.3rem', margin: '4px 0 10px' }}>Train Custom Linear Price Baseline</h2>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '12px' }}>
              Upload historical mandi price CSV to evaluate local price direction for your crop.
            </p>
            <div className="form-grid">
              <label>Crop<input value={tcrop} onChange={(e) => setTCrop(e.target.value)} placeholder="e.g. Wheat" /></label>
              <label>Market &amp; Variety<input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="e.g. Kota mandi, wheat variety" /></label>
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
              <textarea
                aria-label="Price CSV"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={'date,price\n2026-01-01,25.80\n2026-01-02,26.10'}
                rows={4}
              />
              <label style={{ fontSize: '0.88rem' }}>
                Your cost/kg (₹):
                <input
                  type="number"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  placeholder="e.g. 18.50"
                  style={{ marginLeft: '6px', width: '100px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </label>
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

            {error && <p role="alert" style={{ color: '#b93815', fontWeight: 'bold', marginTop: '8px' }}>{error}</p>}

            {result && (
              <section aria-live="polite" style={{ marginTop: '14px', background: '#f5faf7', padding: '12px', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '8px' }}>{tcrop} · {market}</h4>
                <div className="ai-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  <article><small>Latest price</small><b>₹{result.latest.price.toFixed(2)}/kg</b></article>
                  <article><small>7-day projection</small><b>₹{result.predicted.toFixed(2)}/kg</b></article>
                  <article><small>Holdout error (MAE)</small><b>₹{result.mae.toFixed(2)}/kg</b></article>
                </div>
                {net !== null && (
                  <div style={{ padding: '8px 12px', background: net >= 0 ? '#eaf7ed' : '#fff4f2', borderRadius: '6px', color: net >= 0 ? '#1a4e2e' : '#b93815', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.92rem' }}>
                    {net >= 0
                      ? `✓ Projected net margin: ₹${net.toFixed(2)}/kg above your cost.`
                      : `⚠ Projected price ₹${Math.abs(net).toFixed(2)}/kg below your cost — consider holding.`}
                  </div>
                )}
                <small style={{ color: '#555' }}>
                  Baseline error: ₹{result.naiveMae.toFixed(2)}/kg.{' '}
                  {result.beatsNaive ? '✓ Trend outperformed naive baseline.' : '⚠ High variance detected — use with caution.'}
                </small>
              </section>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
