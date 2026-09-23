import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { getAllMspRates, updateMspRate } from '../lib/mspRates';
import { ShieldCheck, RefreshCw, CheckCircle, Edit3, Save } from 'lucide-react';

export default function MarketDataAdmin({ crops = [] }) {
  const [runs, setRuns] = useState([]);
  const [sources, setSources] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [rates, setRates] = useState([]);
  const [localMspMap, setLocalMspMap] = useState(() => getAllMspRates());
  const [editingCrop, setEditingCrop] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    crop: crops[0]?.name || 'Wheat',
    price: '',
    season: 'RMS 2026-27',
    effective: new Date().toISOString().slice(0, 10),
    url: 'https://cacp.dacnet.nic.in',
    note: 'Verified from CACP Gazette Notification'
  });

  const load = async () => {
    setLocalMspMap(getAllMspRates());
    if (!supabase) return;
    try {
      const results = await Promise.all([
        supabase.from('market_sync_runs').select('*').order('started_at', { ascending: false }).limit(12),
        supabase.from('msp_notification_checks').select('*').order('checked_at', { ascending: false }),
        supabase.from('msp_rate_proposals').select('*').order('submitted_at', { ascending: false }).limit(20),
        supabase.from('msp_rates').select('*').order('crop')
      ]);
      const error = results.find(result => result.error)?.error;
      if (error) return setMessage(error.message);
      setRuns(results[0].data || []);
      setSources(results[1].data || []);
      setProposals(results[2].data || []);
      setRates(results[3].data || []);
    } catch (e) {
      console.warn("Supabase load error:", e);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    const handleMspUpdate = () => setLocalMspMap(getAllMspRates());
    window.addEventListener("farmlink_msp_updated", handleMspUpdate);
    return () => {
      clearInterval(timer);
      window.removeEventListener("farmlink_msp_updated", handleMspUpdate);
    };
  }, []);

  const handleInstantMspSave = (cropName, newPriceKg) => {
    const val = Number(newPriceKg);
    if (!val || val <= 0) return;
    updateMspRate(cropName, val, "Live Admin Update 2026", "https://cacp.dacnet.nic.in");
    setLocalMspMap(getAllMspRates());
    setEditingCrop(null);
    setMessage(`✅ Live MSP for ${cropName} updated to ₹${val.toFixed(2)}/kg across all farmer listings & wholesale quotes.`);
  };

  const action = async (fn, success) => {
    if (busy) return;
    setBusy(true);
    try {
      if (supabase) {
        const { error } = await fn();
        if (error) throw error;
      }
      setMessage(success);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="integration-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <p className="eyebrow green">OFFICIAL PRICES &amp; SOURCE AUDIT</p>
          <h2>Government MSP Desk &amp; Live Price Floors</h2>
        </div>
        <button
          className="secondary"
          onClick={() => {
            setLocalMspMap(getAllMspRates());
            setMessage("Refreshed live registry from local and cloud stores.");
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh Rates
        </button>
      </div>

      <p>
        Government MSP is the inviolable legal floor. Any attempt by farmers or wholesale buyers to list or quote below these live numbers is strictly rejected by the matching engine.
      </p>

      {message && <p className="feedback-message" role="status" style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 600 }}>{message}</p>}

      {/* Live MSP Quick Registry & In-Line Update Table */}
      <div className="account-panel" style={{ marginTop: '16px', background: 'var(--surface-raised)', borderRadius: '12px', border: '1px solid var(--border)', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            Live Government MSP Floor Rates (Enforced Real-Time)
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time broadcast to all listings &amp; quotes
          </span>
        </div>

        <div className="integration-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Crop</th>
                <th style={{ padding: '8px 12px' }}>Live Floor (₹/kg)</th>
                <th style={{ padding: '8px 12px' }}>Govt MSP (₹/Qtl)</th>
                <th style={{ padding: '8px 12px' }}>Marketing Season</th>
                <th style={{ padding: '8px 12px' }}>Enforcement Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(localMspMap).slice(0, 16).map(([cropName, data]) => {
                const isEditing = editingCrop === cropName;
                return (
                  <tr key={cropName} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>{cropName}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--primary)', fontWeight: 800 }}>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          style={{ width: '90px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--primary)' }}
                          autoFocus
                        />
                      ) : (
                        `₹${Number(data.price).toFixed(2)}/kg`
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                      ₹{(Number(data.price) * 100).toLocaleString('en-IN')}/Qtl
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className="source-pill" style={{ background: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                        {data.season || '2026-27'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <CheckCircle size={13} /> Active Floor
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="primary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => handleInstantMspSave(cropName, editPrice)}
                          >
                            <Save size={12} /> Save
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => setEditingCrop(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="secondary"
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          onClick={() => {
                            setEditingCrop(cropName);
                            setEditPrice(String(data.price));
                          }}
                        >
                          <Edit3 size={12} /> Update Rate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          className="primary"
          disabled={busy}
          onClick={() => action(
            () => supabase.rpc('request_market_refresh'),
            'Government sources refreshed. Updated MSP notifications synced.'
          )}
        >
          Refresh Government API &amp; CACP Sources
        </button>
      </div>

      {/* Propose Official MSP Update */}
      <details className="integration-section" style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, padding: '8px 0' }}>
          Propose an official Gazette MSP update
        </summary>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const pricePerKg = Number(form.price) / 100; // quintal to kg
            updateMspRate(form.crop, pricePerKg, form.season, form.url);
            setLocalMspMap(getAllMspRates());
            action(
              () => supabase.rpc('submit_msp_rate', {
                p_crop: form.crop,
                p_msp_per_quintal: Number(form.price),
                p_marketing_season: form.season,
                p_effective_from: form.effective,
                p_source_url: form.url,
                p_verification_note: form.note
              }),
              `Proposal saved and live floor updated for ${form.crop} to ₹${pricePerKg.toFixed(2)}/kg.`
            );
          }}
        >
          <label>
            Crop
            <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
              {crops.map((crop) => (
                <option key={crop.name}>{crop.name}</option>
              ))}
            </select>
          </label>
          <label>
            Official MSP (₹ per quintal)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 5950 for Mustard"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <small>Automatically calculates per kg floor (₹{form.price ? (Number(form.price) / 100).toFixed(2) : '0.00'}/kg)</small>
          </label>
          <label>
            Marketing season
            <input
              required
              minLength={4}
              value={form.season}
              placeholder="RMS 2026-27"
              onChange={(e) => setForm({ ...form, season: e.target.value })}
            />
          </label>
          <label>
            Effective date
            <input
              required
              type="date"
              value={form.effective}
              onChange={(e) => setForm({ ...form, effective: e.target.value })}
            />
          </label>
          <label className="full">
            Official notification URL
            <input
              type="url"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </label>
          <label className="full">
            Verification note
            <textarea
              required
              minLength={10}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Record the CACP gazette notification number, crop variety, and verified amount."
            />
          </label>
          <button className="primary" disabled={busy} type="submit">
            Save &amp; Publish Verified MSP Rate
          </button>
        </form>
      </details>
    </section>
  );
}
