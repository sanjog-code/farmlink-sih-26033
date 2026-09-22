import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseRecord, normalisePage, sourceDate, isOfficialMspUrl } from '../supabase/functions/refresh-market-data/normalise.js';

test('AGMARKNET price is converted from INR/quintal to INR/kg',()=>{
  const row=normaliseRecord({commodity:'Tomato',market:'Jaipur',state:'Rajasthan',district:'Jaipur',variety:'Local',arrival_date:'20/09/2026',min_price:'2000',modal_price:'2500',max_price:'3000'},new Date('2026-09-21T00:00:00Z'));
  assert.equal(row.modal_price_per_kg,25);assert.equal(row.price_date,'2026-09-20');
});
test('invalid dates, unit changes and impossible price ranges are rejected',()=>{
  assert.equal(sourceDate('31/02/2026'),null);
  assert.equal(normaliseRecord({commodity:'Wheat',market:'X',state:'Y',arrival_date:'2026-09-20',modal_price:30,unit:'INR/kg'}),null);
  assert.equal(normaliseRecord({commodity:'Wheat',market:'X',state:'Y',arrival_date:'2026-09-20',min_price:4000,modal_price:3000,max_price:5000}),null);
});
test('duplicate source rows are idempotent and MSP URLs are allowlisted',()=>{
  const source={commodity:'Onion',market:'X',state:'Y',arrival_date:'2026-09-20',modal_price:3000};
  assert.equal(normalisePage([source,source],new Date('2026-09-21')).rows.length,1);
  assert.equal(isOfficialMspUrl('https://www.pib.gov.in/example'),true);
  assert.equal(isOfficialMspUrl('https://evil.example/pib.gov.in'),false);
});
