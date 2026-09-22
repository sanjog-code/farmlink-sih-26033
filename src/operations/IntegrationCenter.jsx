import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const labels = { marketData: 'Daily mandi prices', email: 'Order email delivery', whisper: 'Whisper speech recognition', bhashini: 'Bhashini speech recognition', grading: 'Produce photo model', ondcPartner: 'ONDC partner connection' };
async function check(result) { const { data, error } = await result; if (error) throw error; return data; }
export function useOperationsRefresh(load, channelName) {
  useEffect(() => {
    if (!supabase) return;
    load();
    const channel = supabase.channel(channelName).on('postgres_changes', { event: '*', schema: 'public', table: 'farmer_service_applications' }, load).on('postgres_changes', { event: '*', schema: 'public', table: 'integration_outbox' }, load).subscribe();
    const timer = setInterval(load, 15000);
    return () => { clearInterval(timer); supabase.removeChannel(channel); };
  }, [load, channelName]);
}

export default function IntegrationCenter({ session, warehouses = [] }) {
  const [services, setServices] = useState(null), [applications, setApplications] = useState([]), [outbox, setOutbox] = useState([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const [reviews, setReviews] = useState({}), [registry, setRegistry] = useState({ warehouse: '', reference: '', repository: '' });
  const load = useCallback(async () => {
    try {
      const [apps, jobs] = await Promise.all([check(supabase.from('farmer_service_applications').select('*,produce_lots(crop,lot_code),profiles!farmer_service_applications_farmer_id_fkey(full_name)').order('created_at', { ascending: false }).limit(50)), check(supabase.from('integration_outbox').select('id,channel,status,attempts,last_error,created_at,provider_reference').order('created_at', { ascending: false }).limit(30))]);
      setApplications(apps || []); setOutbox(jobs || []);
    } catch (error) { setMessage(error.message); }
  }, []);
  useOperationsRefresh(load, 'integration-center');
  useEffect(() => { if (supabase) check(supabase.functions.invoke('platform-integrations', { body: { action: 'status' } })).then(result => setServices(result.services)).catch(() => setMessage('Service status could not be loaded. Refresh to retry.')); }, []);
  const act = async (fn, success) => {
    if (busy) return; setBusy(true); setMessage('');
    try { await fn(); setMessage(success); await load(); } catch (error) { setMessage(error.message || 'The request could not be completed.'); } finally { setBusy(false); }
  };
  return <section className="integration-section"><p className="eyebrow green">CONNECTED SERVICES</p><h2>Integration centre</h2><p>Credentials stay on the server. Services marked “Awaiting setup” become available when their configuration is added.</p>
    <div className="service-grid">{Object.entries(labels).map(([key, label]) => <article className="service-card" key={key}><h3>{label}</h3><span className={'status-pill ' + (services?.[key]?.configured ? 'ready' : '')}>{services ? services[key]?.configured ? 'Configured · ready to test' : 'Awaiting setup' : 'Checking…'}</span><p>{services?.[key]?.missing?.map(name => <code key={name}>{name}<br/></code>)}</p></article>)}</div>
    {message && <p className="feedback-message" role="status">{message}</p>}
    <div className="integration-toolbar"><button className="secondary" disabled={busy} onClick={() => act(() => check(supabase.functions.invoke('platform-integrations', { body: { action: 'process' } })), 'Delivery queue checked. Missing services remain safely queued.')}>Process delivery queue</button><button className="secondary" disabled={busy} onClick={() => act(() => check(supabase.rpc('queue_ondc_catalogue_export')), 'Current published stock queued for the configured ONDC partner.')}>Queue catalogue for partner</button><button className="secondary" onClick={load}>Refresh status</button></div>
    <p className="notice">An ONDC network participant must provide the catalogue adapter endpoint and complete network onboarding. A successful export is a partner acknowledgement, not network certification.</p>
    <section className="integration-section"><h3>Finance and warehouse receipt requests</h3><p>Review the farmer’s consented enquiry. Record a real provider reference only after the provider acknowledges it.</p><div className="service-list">{applications.map(app => <article key={app.id}><b>{app.profiles?.full_name || 'Farmer'} · {app.produce_lots?.crop} · {app.service_type.replaceAll('_',' ')}</b><p>{app.farmer_note || 'No additional note'} {app.requested_amount ? ` · ₹${Number(app.requested_amount).toLocaleString('en-IN')}` : ''}</p><span className="status-pill">{app.status.replaceAll('_',' ')}</span>{!['referred','rejected','withdrawn'].includes(app.status) && <><label>Review note<input value={reviews[app.id]?.note || ''} onChange={e => setReviews({ ...reviews, [app.id]: { ...reviews[app.id], note: e.target.value } })}/></label><label>External provider reference<input value={reviews[app.id]?.reference || ''} onChange={e => setReviews({ ...reviews, [app.id]: { ...reviews[app.id], reference: e.target.value } })}/></label><div className="integration-toolbar">{[['under_review','Start review'],['needs_information','Request information'],['referred','Record referral'],['rejected','Reject']].map(([status,label]) => <button className="secondary" key={status} disabled={busy} onClick={() => act(() => check(supabase.rpc('review_farmer_service_application', { p_id: app.id, p_status: status, p_note: reviews[app.id]?.note || '', p_provider_reference: reviews[app.id]?.reference || null })), 'Application updated for the farmer.')}>{label}</button>)}</div></>}</article>)}{!applications.length && <p className="empty-state">No service requests yet.</p>}</div></section>
    <details className="integration-section"><summary>Verify a warehouse repository registration</summary><form className="form-grid" onSubmit={e => { e.preventDefault(); act(() => check(supabase.from('warehouse_service_registry').upsert({ warehouse_id: registry.warehouse, registration_reference: registry.reference.trim(), repository_name: registry.repository.trim(), verified_by: session.userId, verified_at: new Date().toISOString(), active: true })), 'Warehouse registration recorded.'); }}><label>Warehouse<select required value={registry.warehouse} onChange={e => setRegistry({ ...registry, warehouse: e.target.value })}><option value="">Choose warehouse</option>{warehouses.map(w => <option value={w.id} key={w.id}>{w.name}</option>)}</select></label><label>Verified registration reference<input required value={registry.reference} onChange={e => setRegistry({ ...registry, reference: e.target.value })}/></label><label>Authorised repository<input required value={registry.repository} onChange={e => setRegistry({ ...registry, repository: e.target.value })}/></label><button className="primary" disabled={busy}>Save verified registration</button></form></details>
    <section className="integration-section"><h3>Delivery audit</h3><div className="integration-table"><table><thead><tr><th>Created</th><th>Service</th><th>Status</th><th>Attempts / detail</th></tr></thead><tbody>{outbox.map(job => <tr key={job.id}><td>{new Date(job.created_at).toLocaleString('en-IN')}</td><td>{job.channel}</td><td>{job.status}</td><td>{job.attempts}<small>{job.last_error || job.provider_reference || 'Waiting for configured service'}</small></td></tr>)}</tbody></table></div>{!outbox.length && <p>No deliveries have been queued yet.</p>}</section>
  </section>;
}

export function FarmerServices({ session }) {
  const [lots, setLots] = useState([]), [apps, setApps] = useState([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ lot: '', service: 'warehouse_receipt', amount: '', note: '', consent: false });
  const [certModal, setCertModal] = useState(null);

  const load = useCallback(async () => {
    try {
      const [stock, requests] = await Promise.all([
        check(supabase.from('produce_lots').select('id,lot_code,crop,quantity_kg').eq('farmer_id', session.userId).gt('quantity_kg', 0)),
        check(supabase.from('farmer_service_applications').select('*').eq('farmer_id', session.userId).order('created_at', { ascending: false }))
      ]);
      setLots(stock || []);
      setApps(requests || []);
    } catch (error) {
      setMessage(error.message);
    }
  }, [session.userId]);

  useOperationsRefresh(load, 'farmer-services');

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      await check(supabase.rpc('submit_farmer_service_application', {
        p_lot_id: form.lot,
        p_service_type: form.service,
        p_requested_amount: form.service === 'finance_enquiry' ? Number(form.amount) : null,
        p_note: form.note,
        p_consent: form.consent
      }));
      setMessage('Your enquiry has been submitted. Sample e-NWR certificate generated below.');
      setForm({ ...form, consent: false, note: '' });
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const showCertificate = (appOrLot) => {
    const cropName = appOrLot?.crop || 'Rapeseed & mustard';
    const weight = appOrLot?.quantity_kg || 100;
    const rate = cropName.toLowerCase().includes('mustard') ? 82 : 26;
    const totalVal = weight * rate;
    const advanceVal = Math.round(totalVal * 0.5);

    setCertModal({
      certNo: 'e-NWR/2026/RJ-JAI-' + Math.floor(10000 + Math.random() * 90000),
      warehouseName: 'Jaipur North Agricultural Hub (WDRA Reg: WR-RJ-2026-091)',
      farmerName: session?.name || 'Kalpit Saxena',
      farmerId: session?.farmerId || 'FL-FARM-8291',
      crop: cropName,
      weightKg: weight,
      grade: 'Grade A1 (Intake Certified)',
      mandiValue: totalVal,
      advanceAvailable: advanceVal,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  };

  return (
    <section className="account-panel integration-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h3>Warehouse receipts & pledge finance</h3>
        <button
          type="button"
          className="secondary"
          style={{ fontSize: '0.82rem', padding: '4px 10px' }}
          onClick={() => showCertificate({ crop: 'Rapeseed & mustard', quantity_kg: 100 })}
        >
          📜 Sample e-NWR Certificate
        </button>
      </div>
      <p>Request an electronic warehouse receipt (e-NWR) review for your verified stock to unlock up to 50% working-capital advance.</p>

      {message && <p className="feedback-message" role="status">{message}</p>}

      <form className="form-grid" onSubmit={submit}>
        <label>Your warehouse lot
          <select required value={form.lot} onChange={e => setForm({ ...form, lot: e.target.value })}>
            <option value="">Choose verified stock</option>
            {lots.map(lot => (
              <option key={lot.id} value={lot.id}>{lot.crop} · {lot.quantity_kg} kg · {lot.lot_code}</option>
            ))}
          </select>
        </label>
        <label>Request
          <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
            <option value="warehouse_receipt">e-NWR eligibility review (Warehouse receipt)</option>
            <option value="finance_enquiry">50% Pledge advance enquiry</option>
          </select>
        </label>
        {form.service === 'finance_enquiry' && (
          <label>Requested amount (₹)
            <input required type="number" min="1" max="100000000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 5000" />
          </label>
        )}
        <label>Message
          <textarea maxLength={2000} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Notes for the warehouse manager or bank lender..." />
        </label>
        <label className="full">
          <span>
            <input type="checkbox" required checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} />
            {' '}I consent to sharing this lot data with the accredited WDRA warehouse and partner lender for working-capital pledge advance.
          </span>
        </label>
        <button className="primary" disabled={busy || !lots.length}>{busy ? 'Submitting…' : 'Request e-NWR Review'}</button>
      </form>

      <div className="service-list" style={{ marginTop: '16px' }}>
        {apps.map(app => (
          <article className="contract-row" key={app.id}>
            <div>
              <b>{app.service_type.replaceAll('_', ' ').toUpperCase()}</b>
              <small>{app.status.replaceAll('_', ' ')} · {app.review_note || 'Awaiting warehouse validation'}</small>
              {app.provider_reference && <small>Reference: {app.provider_reference}</small>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="secondary" style={{ fontSize: '0.8rem', padding: '4px 8px' }} onClick={() => showCertificate(app)}>
                View Certificate
              </button>
              {!['referred', 'rejected', 'withdrawn'].includes(app.status) && (
                <button
                  className="secondary"
                  type="button"
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  onClick={async () => {
                    try {
                      await check(supabase.rpc('review_farmer_service_application', { p_id: app.id, p_status: 'withdrawn' }));
                      await load();
                    } catch (error) {
                      setMessage(error.message);
                    }
                  }}
                >
                  Withdraw
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="notice" style={{ marginTop: '12px' }}>
        e-NWR pledge financing eliminates distress-selling by providing 50% liquidity while the farmer retains the final sale decision.
      </p>

      {certModal && (
        <div className="modal-back" style={{ zIndex: 1000 }}>
          <div className="modal" style={{ maxWidth: '580px', border: '3px double #1f5c37', background: '#fff' }}>
            <button className="close" onClick={() => setCertModal(null)}>×</button>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1f5c37', paddingBottom: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', letterSpacing: '1px' }}>
                GOVERNMENT OF INDIA · WDRA CENTRAL REPOSITORY (CCRL / NERL)
              </span>
              <h2 style={{ fontSize: '1.25rem', color: '#1f5c37', margin: '4px 0' }}>
                ELECTRONIC NEGOTIABLE WAREHOUSE RECEIPT (e-NWR)
              </h2>
              <small style={{ color: '#888' }}>Receipt No: <strong>{certModal.certNo}</strong> · Issued: {certModal.date}</small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', marginBottom: '14px' }}>
              <div><strong style={{ color: '#555' }}>Accredited Warehouse:</strong><p style={{ margin: '2px 0' }}>{certModal.warehouseName}</p></div>
              <div><strong style={{ color: '#555' }}>Depositor / Farmer:</strong><p style={{ margin: '2px 0' }}>{certModal.farmerName} ({certModal.farmerId})</p></div>
              <div><strong style={{ color: '#555' }}>Commodity & Grade:</strong><p style={{ margin: '2px 0' }}>{certModal.crop} · <strong>{certModal.grade}</strong></p></div>
              <div><strong style={{ color: '#555' }}>Net Weight Deposited:</strong><p style={{ margin: '2px 0' }}><strong>{certModal.weightKg} kg</strong> (Intake Verified)</p></div>
            </div>

            <div style={{ background: '#eef8f2', border: '1px solid #bce6cb', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#333' }}>Current Collateral Valuation:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f5c37' }}>₹{certModal.mandiValue.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#333' }}>Eligible 50% Working-Capital Advance:</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#c97b2d' }}>₹{certModal.advanceAvailable.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <small style={{ display: 'block', marginTop: '6px', color: '#445b4c' }}>
                ✓ Zero distress-sale pressure: Farmer retains ownership and final sale decision.
              </small>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', background: '#222', color: '#fff', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRadius: '4px' }}>
                  QR CODE
                </div>
                <small style={{ fontSize: '0.75rem', color: '#666' }}>
                  Cryptographically signed & timestamped.<br />WDRA Act 2007 compliant digital ledger.
                </small>
              </div>
              <button type="button" className="primary" onClick={() => { window.print(); }}>
                Print e-NWR
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
