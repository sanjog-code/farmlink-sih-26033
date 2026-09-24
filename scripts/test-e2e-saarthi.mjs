import { defaultSaarthiEngine } from '../api/saarthi/saarthiEngine.js';
import { getMspFloorForCrop } from '../src/lib/mspRates.js';

console.log('=== RUNNING COMPLETE END-TO-END SAARTHI VERIFICATION ===\n');

async function testFlagshipDemos() {
  const sessionId = `sih-demo-${Date.now()}`;
  const farmerId = 'farmer-sharma-101';
  const farmerName = 'Ramvilas Sharma';

  // ─── FLAGSHIP DEMO 1: SELL WHEAT IN HINDI ──────────────────────────────────
  console.log('🌟 [DEMO 1]: Farmer says: "मेरे पास 3 क्विंटल गेहूं है बेचना है"');
  const turn1 = await defaultSaarthiEngine.handleTurn({
    sessionId,
    message: 'मेरे पास 3 क्विंटल गेहूं है बेचना है',
    farmerId,
    farmerName
  });

  console.log('🤖 Saarthi Spoken Response:', turn1.response);
  console.log('   Intent:', turn1.intent);
  console.log('   Entities:', turn1.entities);
  console.log('   Requires Confirmation:', turn1.requiresConfirmation);
  console.log('   Pending Action:', turn1.pendingAction);

  if (turn1.intent !== 'SELL_CROP' || turn1.entities.quantityKg !== 300 || !turn1.requiresConfirmation) {
    throw new Error('Demo 1 Step 1 failed expectations');
  }

  // Farmer confirms: "हाँ, लिस्टिंग बना दो"
  console.log('\n🌟 [DEMO 1 (CONFIRM)]: Farmer says: "हाँ, बना दो"');
  const turn2 = await defaultSaarthiEngine.handleTurn({
    sessionId,
    message: 'हाँ, बना दो',
    farmerId,
    farmerName
  });

  console.log('🤖 Saarthi Spoken Response:', turn2.response);
  console.log('   Action Executed:', turn2.actionResult);

  if (!turn2.actionResult?.success || turn2.actionResult?.listing?.crop !== 'Wheat') {
    throw new Error('Demo 1 Step 2 failed to create listing');
  }

  // ─── FLAGSHIP DEMO 2: QUERY MY LISTINGS ────────────────────────────────────
  console.log('\n🌟 [DEMO 2]: Farmer says: "मेरी फसल की लिस्टिंग दिखाओ"');
  const turn3 = await defaultSaarthiEngine.handleTurn({
    sessionId,
    message: 'मेरी फसल की लिस्टिंग दिखाओ',
    farmerId,
    farmerName,
    dataContext: {
      existingListings: [turn2.actionResult.listing]
    }
  });

  console.log('🤖 Saarthi Spoken Response:', turn3.response);
  console.log('   Intent:', turn3.intent);

  if (turn3.intent !== 'CHECK_MY_LISTINGS' || !turn3.response.includes('300 किलो')) {
    throw new Error('Demo 2 failed expectations');
  }

  // ─── FLAGSHIP DEMO 3: LIVE MANDI / MSP CHECK ──────────────────────────────
  console.log('\n🌟 [DEMO 3]: Farmer says: "आज सरसों का भाव क्या है?"');
  const turn4 = await defaultSaarthiEngine.handleTurn({
    sessionId,
    message: 'आज सरसों का भाव क्या है?',
    farmerId,
    farmerName
  });

  console.log('🤖 Saarthi Spoken Response:', turn4.response);
  console.log('   Intent:', turn4.intent);

  const officialMustard = getMspFloorForCrop('Mustard');
  if (!turn4.response.includes(String(officialMustard.price))) {
    throw new Error('Demo 3 failed: Official MSP rate not quoted');
  }

  console.log('\n🎉 ALL 3 FLAGSHIP DEMOS PASSED WITH 100% SUCCESS!');
}

testFlagshipDemos().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
