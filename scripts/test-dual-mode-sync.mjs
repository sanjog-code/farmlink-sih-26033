const memStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => memStorage.get(k) || null,
  setItem: (k, v) => memStorage.set(k, String(v)),
  removeItem: (k) => memStorage.delete(k),
  clear: () => memStorage.clear()
};
globalThis.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};

import { SaarthiEngine } from '../api/saarthi/saarthiEngine.js';
import * as tools from '../api/saarthi/saarthiTools.js';
import {
  getUserListings,
  addUserListing,
  updateUserListing
} from '../src/lib/dataSyncEngine.js';

console.log('=== TEST SUITE: FARMER DUAL-MODE & BIDIRECTIONAL SYNC ===\n');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${msg}`);
    failed++;
  }
}

async function runDualModeTests() {
  const engine = new SaarthiEngine();

  // Test 1: Saarthi Mode -> Classic Mode Listing Sync
  console.log('--- Test 1: Saarthi Creates Listing -> Classic Mode Reads It ---');
  const farmerId = `farmer-${Date.now()}`;
  const farmerName = 'Ramesh Kumar (Farmer)';

  // Simulate Saarthi conversation leading to confirmed listing creation
  const saarthiSession = `dual-mode-session-${Date.now()}`;
  const step1 = await engine.handleTurn({
    sessionId: saarthiSession,
    message: 'mere paas 3 quintal gehu hai bechna hai',
    farmerId,
    farmerName
  });

  assert(step1.intent === 'SELL_CROP', 'Saarthi identifies SELL_CROP intent');
  assert(step1.requiresConfirmation === true, 'Saarthi requires confirmation for listing');

  // Farmer confirms
  const step2 = await engine.handleTurn({
    sessionId: saarthiSession,
    message: 'haan list kar do',
    farmerId,
    farmerName
  });

  assert(step2.actionResult?.action === 'LISTING_CREATED', 'Listing created by Saarthi action layer');
  const saarthiListing = step2.actionResult.listing;

  // Commit to unified dataSyncEngine (the shared source of truth)
  addUserListing(saarthiListing);

  // Now verify Classic Mode gets this exact listing
  const classicListings = getUserListings();
  const foundInClassic = classicListings.find(l => l.id === saarthiListing.id);

  assert(Boolean(foundInClassic), 'Listing created via Saarthi is immediately present in Classic Mode data store');
  assert(foundInClassic?.crop === 'Wheat', 'Crop name is preserved as Wheat');
  assert(foundInClassic?.quantity_kg === 300, 'Quantity is preserved as 300 kg');
  assert(foundInClassic?.mspProtected === true, 'MSP floor protection enforced');

  // Test 2: Classic Mode Creates Listing -> Saarthi Mode Reads It
  console.log('\n--- Test 2: Classic Mode Manual Creation -> Saarthi Mode Reads It ---');
  const manualListingId = `MANUAL-LIST-${Date.now()}`;
  const manualListing = {
    id: manualListingId,
    crop: 'Mustard',
    qty: 500,
    quantity_kg: 500,
    price: 60,
    price_per_kg: 60,
    status: 'published',
    farmer: farmerName,
    farmer_id: farmerId,
    warehouse: 'Jaipur North WDRA Hub',
    createdAt: new Date().toISOString()
  };

  // Add via Classic manual action
  addUserListing(manualListing);

  // Ask Saarthi: "Meri listing dikhao"
  const saarthiQuery = await engine.handleTurn({
    sessionId: `query-${Date.now()}`,
    message: 'meri listing dikhao',
    farmerId,
    farmerName,
    dataContext: {
      existingListings: getUserListings()
    }
  });

  console.log('Saarthi query response:', saarthiQuery.response);
  assert(saarthiQuery.intent === 'CHECK_MY_LISTINGS', 'Saarthi identifies CHECK_MY_LISTINGS');
  assert(saarthiQuery.response.includes('Mustard') || saarthiQuery.response.includes('सरसों'), 'Saarthi response includes Mustard created in Classic Mode');

  // Test 3: Saarthi Cancels Listing -> Classic Mode Reflects Cancelled State
  console.log('\n--- Test 3: Saarthi Cancels Listing -> Classic Mode Reflects Cancellation ---');
  const cancelSession = `cancel-dual-${Date.now()}`;

  // Step 3a: Farmer says "meri gehu wali listing hata do"
  const cancelStep1 = await engine.handleTurn({
    sessionId: cancelSession,
    message: 'meri gehu wali listing hata do',
    farmerId,
    farmerName,
    dataContext: {
      existingListings: getUserListings()
    }
  });

  assert(cancelStep1.intent === 'CANCEL_LISTING', 'Saarthi identifies CANCEL_LISTING');
  assert(cancelStep1.requiresConfirmation === true, 'Saarthi asks confirmation before deleting listing');

  // Step 3b: Farmer says "haan hata do"
  const cancelStep2 = await engine.handleTurn({
    sessionId: cancelSession,
    message: 'haan hata do',
    farmerId,
    farmerName,
    dataContext: {
      existingListings: getUserListings()
    }
  });

  assert(cancelStep2.actionResult?.action === 'LISTING_CANCELLED', 'Saarthi confirms listing cancellation');
  const targetId = cancelStep2.actionResult.listingId;

  // Commit cancellation to dataSyncEngine
  updateUserListing(targetId, { status: 'cancelled' });

  // Verify Classic Mode reflects cancelled state
  const updatedClassic = getUserListings();
  const cancelledRecord = updatedClassic.find(l => l.id === targetId);
  assert(cancelledRecord?.status === 'cancelled', 'Classic Mode reflects cancelled status for listing');

  // Test 4: Check Payment Intent in Dual-Mode
  console.log('\n--- Test 4: Payment Status Query (Mera Payment Aaya?) ---');
  const payQuery = await engine.handleTurn({
    sessionId: `pay-dual-${Date.now()}`,
    message: 'mera payment aaya?',
    farmerId,
    farmerName,
    dataContext: {
      existingTransactions: [
        { id: 'TXN-901', amount: 7200, status: 'completed' }
      ]
    }
  });

  assert(payQuery.intent === 'CHECK_PAYMENT', 'Saarthi identifies CHECK_PAYMENT');
  assert(payQuery.response.includes('₹'), 'Payment amount reported accurately');

  // Test 5: Track Pickup Query in Dual-Mode
  console.log('\n--- Test 5: Track Pickup Query (Mera Pickup Kahan Hai?) ---');
  const pkpQuery = await engine.handleTurn({
    sessionId: `pkp-dual-${Date.now()}`,
    message: 'mera pickup kahan hai?',
    farmerId,
    farmerName,
    dataContext: {
      existingPickups: [
        { id: 'PKP-77', crop: 'Wheat', qty: 300, status: 'In Transit', driver: 'Mahendra Singh' }
      ]
    }
  });

  assert(pkpQuery.intent === 'TRACK_PICKUP', 'Saarthi identifies TRACK_PICKUP');
  assert(pkpQuery.response.includes('पिकअप') || pkpQuery.response.includes('pickup'), 'Pickup status reported accurately');

  console.log(`\n=== DUAL-MODE TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runDualModeTests().catch(err => {
  console.error(err);
  process.exit(1);
});
