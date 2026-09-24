import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');
const isCRLF = content.includes('\r\n');
if (isCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

const oldWarehousePanel = `{tab === "warehouses" && <div className="admin-work-panel"><h3>Warehouse inspection menu</h3><p>Open a warehouse to handle intake, consumer pickups, and its associated live queue.</p>{warehouses.map((warehouse) => <div className="contract-row" key={warehouse.id || warehouse.name}><div><b>{warehouse.name}</b><small>{warehouse.address}</small></div><span>{orders.filter((order) => order.pickupWarehouse === warehouse.name).length} pickup order(s)</span><button className="primary" onClick={() => setView("warehouse")}>Inspect</button></div>)}</div>}`;

const newWarehousePanel = `{tab === "warehouses" && (
      <div className="admin-work-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>WDRA Accredited Warehouse Depositories</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Official registered warehousing depositories under the Warehousing Development and Regulatory Authority (WDRA) across Rajasthan.
            </p>
          </div>
          <button className="primary" onClick={() => setView("warehouse")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Open Floor Warehouse Dashboard ➔
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {warehouses.map((warehouse) => (
            <div
              key={warehouse.id || warehouse.name}
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <b style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{warehouse.name}</b>
                  <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 800, marginTop: '2px' }}>
                    Accreditation: {warehouse.wdraRegNo || 'WDRA/RJ/ACCREDITED/01'}
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', background: 'var(--surface)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 700 }}>
                  {orders.filter((order) => order.pickupWarehouse === warehouse.name).length} Live Orders
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '2px' }}>
                📍 {warehouse.address} - <b>PIN {warehouse.pincode || '302013'}</b>
              </div>

              {warehouse.capacityMt && (
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <span>Capacity: <b style={{ color: 'var(--text-main)' }}>{warehouse.capacityMt.toLocaleString()} MT</b></span>
                  <span>Available: <b style={{ color: '#059669' }}>{warehouse.availableMt?.toLocaleString() || 3500} MT</b></span>
                  <span>Cold Chambers: <b style={{ color: '#0284c7' }}>{warehouse.coldChambers || 3}</b></span>
                </div>
              )}

              {warehouse.manager && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Superintendent: {warehouse.manager}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="primary"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  onClick={() => setView("warehouse")}
                >
                  Inspect Intake Bay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}`;

if (content.includes(oldWarehousePanel)) {
  content = content.replace(oldWarehousePanel, newWarehousePanel);
  console.log('Successfully updated warehouses tab in AdminView');
} else {
  console.warn('Could not locate oldWarehousePanel in main.jsx');
}

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Finished patch-admin-wdra-tab.mjs');
