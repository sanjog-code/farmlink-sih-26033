import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fitTrend,parsePriceCsv} from '../src/ai/forecast.js';
const rows=Array.from({length:30},(_,i)=>({date:new Date(Date.UTC(2025,0,1+i)).toISOString().slice(0,10),price:20+i*.1}));
test('forecast extrapolates known trend and validates on unseen dates',()=>{const r=fitTrend(rows);assert.ok(Math.abs(r.predicted-23.6)<1e-9);assert.ok(r.mae<1e-9);assert.ok(r.beatsNaive);});
test('constant prices do not claim an improvement over naive model',()=>{const r=fitTrend(rows.map(r=>({...r,price:20})));assert.equal(r.predicted,20);assert.equal(r.beatsNaive,false);});
test('rejects sparse, duplicate and invalid prices',()=>{assert.throws(()=>fitTrend(rows.slice(0,10)));assert.throws(()=>fitTrend([...rows,rows[0]]));assert.throws(()=>fitTrend(rows.map(r=>({...r,price:NaN}))));});
test('CSV accepts real dates and rejects invalid calendar dates',()=>{assert.equal(parsePriceCsv('date,price\n2025-01-01,23')[0].price,23);assert.throws(()=>parsePriceCsv('date,price\n2025-02-30,23'));});
