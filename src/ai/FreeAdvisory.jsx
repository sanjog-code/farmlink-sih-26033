import React,{useState} from 'react';
import {fitTrend,parsePriceCsv} from './forecast.js';
import './ai.css';

export default function FreeAdvisory({close}) {
 const [crop,setCrop]=useState('Wheat'),[market,setMarket]=useState(''),[text,setText]=useState(''),[result,setResult]=useState(null),[error,setError]=useState('');
 const [offer,setOffer]=useState(''),[cost,setCost]=useState(''),[condition,setCondition]=useState(false);
 const change=setter=>event=>{setter(event.target.value);setResult(null);setError('');};
 const stale=result && Date.now()-Date.parse(result.latest.date)>3*86400000;
 const costsKnown=cost!==''&&Number(cost)>=0;
 const net=result&&costsKnown?result.predicted-Number(cost):null;
 return <div className="modal-back"><section className="modal ai-workspace" role="dialog" aria-modal="true" aria-labelledby="ai-title">
  <button className="close" onClick={close} aria-label="Close advisory">×</button>
  <p className="eyebrow green">FARMER PRICE LAB</p><h2 id="ai-title">Make a data-informed sale decision</h2>
  <p>Train a free price-trend baseline using your market’s historical prices. Your file is processed in this browser.</p>
  <div className="form-grid"><label>Crop<select value={crop} onChange={change(setCrop)}>{['Wheat','Rice','Maize'].map(c=><option key={c}>{c}</option>)}</select></label>
  <label>Market and variety<input value={market} onChange={change(setMarket)} placeholder="e.g. Kota mandi, wheat variety"/></label>
  <label>Import price history (CSV)<input type="file" accept=".csv,text/csv" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>500000)return setError('Use a CSV smaller than 500 KB.');setText(await f.text());setResult(null);setError('');}}/></label>
  <small>One market, one crop and one variety. Header: date,price. Dates: YYYY-MM-DD. Prices: INR/kg. At least 21 observations. Divide INR/quintal prices by 100 first.</small>
  <textarea aria-label="Price CSV" value={text} onChange={change(setText)} placeholder={'date,price\n2026-01-01,25.80'}/>
  <button className="primary" onClick={()=>{setError('');setResult(null);try{if(!market.trim())throw new Error('Enter the source market and variety.');setResult(fitTrend(parsePriceCsv(text)));}catch(e){setError(e.message);}}}>Train and evaluate forecast</button>
  </div>{error&&<p role="alert">{error}</p>}
  {result&&<section aria-live="polite"><h3>{crop} · {market}</h3><div className="ai-results"><article><small>Latest observation · {result.latest.date}</small><b>₹{result.latest.price.toFixed(2)}/kg</b></article><article><small>7-day projection · {result.date}</small><b>₹{result.predicted.toFixed(2)}/kg</b></article><article><small>Held-out mean absolute error</small><b>₹{result.mae.toFixed(2)}/kg</b></article></div>
  <p>{result.observations} observations. {result.method}. Last-price baseline error: ₹{result.naiveMae.toFixed(2)}/kg. {result.beatsNaive?'Trend performed better on this holdout.':'Trend did not outperform the last-price baseline; do not rely on its direction.'}</p>
  {stale&&<p role="alert">The latest observation is over 3 days old. Refresh your data before using it for a sale decision.</p>}
  <div className="form-grid"><label>Current buyer offer (₹/kg)<input type="number" min="0.01" step="0.01" value={offer} onChange={e=>setOffer(e.target.value)}/></label><label>Expected 7-day storage and loss cost (₹/kg)<input type="number" min="0" step="0.01" value={cost} onChange={e=>setCost(e.target.value)}/></label><label><input type="checkbox" checked={condition} onChange={e=>setCondition(e.target.checked)}/>Warehouse has checked moisture, pests and storage condition</label></div>
  <p>{stale||!result.beatsNaive||!condition||!costsKnown||Number(offer)<=0?'A sell/hold comparison requires fresh data, a useful evaluated forecast, a buyer offer, storage costs and a warehouse condition check.':net>Number(offer)+result.mae?'Projected net price exceeds the current offer by more than the observed test error. Discuss holding with your warehouse; you retain the sale decision.':'The projected gain does not clearly cover storage cost and observed forecast error. Compare selling now with the farmer’s target and applicable MSP.'}</p>
  <small>This is an experimental statistical baseline, not a guaranteed price or a shelf-life certification. Import mandi prices separately from MSP.</small></section>}
 </section></div>;
}
