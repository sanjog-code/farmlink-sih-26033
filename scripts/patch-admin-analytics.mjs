import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/operations/AdminAnalyticsEngine.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Ensure useEffect is imported
if (!content.includes('useEffect')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { subscribeToSync } from '../lib/dataSyncEngine';");
}

// Add state tick for live reactivity
const tickCode = `export default function AdminAnalyticsEngine({ lots = [], orders = [] }) {
  const [, setLiveTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeToSync(() => {
      setLiveTick((t) => t + 1);
    });
    return unsub;
  }, []);`;

content = content.replace("export default function AdminAnalyticsEngine({ lots = [], orders = [] }) {", tickCode);

// Add Live Reactive Data Banner right before {/* 6 Core Verified Real KPIs */}
const liveBannerCode = `      {/* Real-Time Platform Activity Live Ribbon */}
      <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.25)', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Live Synced Reactive Ledger:</strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <b>{lots.length}</b> Active Farmer Listings · <b>{orders.length}</b> Live Consumer Orders · <b>{orders.reduce((sum, o) => sum + (Number(o.quantityKg || o.qty) || 0), 0) + lots.reduce((sum, l) => sum + (Number(l.qty || l.quantity_kg) || 0), 0)} kg</b> Volume Synced
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
          ⚡ Intra-Tab &amp; Cross-Window Broadcast Active
        </div>
      </div>

      {/* 6 Core Verified Real KPIs */}`;

content = content.replace('{/* 6 Core Verified Real KPIs */}', liveBannerCode);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated AdminAnalyticsEngine.jsx');
