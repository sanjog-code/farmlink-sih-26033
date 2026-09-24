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

  // ─── FLAGSHIP DEMO 4: COLLOQUIAL HINGLISH ────────────────────────────────
  console.log('\n🌟 [DEMO 4]: Farmer says: "bhai dhai quintal ke aas paas tamatar bechna hai"');
  const turn5 = await defaultSaarthiEngine.handleTurn({
    sessionId: `colloquial-${Date.now()}`,
    message: 'bhai dhai quintal ke aas paas tamatar bechna hai',
    farmerId,
    farmerName
  });
  console.log('🤖 Saarthi Spoken Response:', turn5.response);
  if (turn5.entities.quantityKg !== 250 || turn5.entities.crop !== 'Tomato') {
    throw new Error(`Demo 4 failed: Expected 250 kg Tomato, got ${turn5.entities.quantityKg} kg ${turn5.entities.crop}`);
  }

  // ─── FLAGSHIP DEMO 5: CONFUSED / HESITANT FARMER ────────────────────────────
  console.log('\n🌟 [DEMO 5]: Farmer says: "kuch samajh nahi aa raha kaise bechu"');
  const turn6 = await defaultSaarthiEngine.handleTurn({
    sessionId: `confused-${Date.now()}`,
    message: 'kuch samajh nahi aa raha kaise bechu',
    farmerId,
    farmerName
  });
  console.log('🤖 Saarthi Spoken Response:', turn6.response);
  if (turn6.intent !== 'PLATFORM_HELP' || !turn6.response.toLowerCase().includes('chinta')) {
    throw new Error('Demo 5 failed: Expected warm empathetic representative guidance');
  }

  // ─── FLAGSHIP DEMO 6: SMOOTH CORRECTION WITHOUT RESTARTING ──────────────────
  console.log('\n🌟 [DEMO 6]: Farmer says: "5 quintal gehu hai" then "nahi, 4 quintal hai"');
  const corrId = `corr-${Date.now()}`;
  await defaultSaarthiEngine.handleTurn({
    sessionId: corrId,
    message: 'mere paas 5 quintal gehu hai bechna hai',
    farmerId,
    farmerName
  });
  const turn7 = await defaultSaarthiEngine.handleTurn({
    sessionId: corrId,
    message: 'nahi, 4 quintal hai',
    farmerId,
    farmerName
  });
  console.log('🤖 Saarthi Spoken Response:', turn7.response);
  if (turn7.entities.quantityKg !== 400 || turn7.intent !== 'SELL_CROP') {
    throw new Error(`Demo 6 failed: Expected 400 kg under SELL_CROP, got ${turn7.entities.quantityKg} kg under ${turn7.intent}`);
  }

  console.log('\n🎉 ALL 6 FLAGSHIP DEMOS PASSED WITH 100% SUCCESS!');
}

testFlagshipDemos().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
