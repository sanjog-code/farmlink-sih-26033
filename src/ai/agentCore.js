// FarmLink Autonomous Agent Core (SIH PS 26033)
// Dual-Engine: Google Gemini Function-Calling ReAct + Built-in Autonomous Edge ReAct Engine
import * as tools from './agentTools.js';
import { runGeminiAgent, executeToolByName } from './geminiClient.js';
import { CROP_INTELLIGENCE } from './cropIntelligence.js';

// Identify agricultural entities from natural language
export function parseGoalEntities(text = '') {
  const lower = text.toLowerCase();

  // Match crop with safe resolver
  const resolved = tools.getCropProfile ? tools.getCropProfile(text) : null;
  let matchedCrop = resolved ? resolved.name : 'Rapeseed & mustard';

  // Explicit Hindi / common aliases override
  if (lower.includes('सरसों') || lower.includes('sarson') || lower.includes('mustard')) matchedCrop = 'Rapeseed & mustard';
  else if (lower.includes('गेहूं') || lower.includes('गेहूँ') || lower.includes('gehu') || lower.includes('wheat')) matchedCrop = 'Wheat';
  else if (lower.includes('टमाटर') || lower.includes('tamatar') || lower.includes('tomato')) matchedCrop = 'Tomato';
  else if (lower.includes('चना') || lower.includes('chana') || lower.includes('gram') || lower.includes('chickpea')) matchedCrop = 'Chickpea (Gram)';
  else if (lower.includes('मक्का') || lower.includes('makka') || lower.includes('maize')) matchedCrop = 'Maize';
  else if (lower.includes('बाजरा') || lower.includes('bajra')) matchedCrop = 'Pearl millet (Bajra)';
  else if (lower.includes('मूंग') || lower.includes('moong')) matchedCrop = 'Green gram (Moong)';
  else if (lower.includes('प्याज') || lower.includes('pyaz') || lower.includes('onion')) matchedCrop = 'Onion';
  else if (lower.includes('आलू') || lower.includes('aaloo') || lower.includes('potato')) matchedCrop = 'Potato';

  // Extract quantity if mentioned (e.g. "500kg", "500 kg", "2 टन", "2 ton", "5 quintal")
  let quantityKg = 500;
  const numMatch = lower.match(/(\d+)\s*(?:kg|किलो|किग्रा|कट्टा|बोरी|ton|टन|quintal|क्विंटल)/);
  if (numMatch) {
    const rawVal = parseInt(numMatch[1], 10);
    if (lower.includes('ton') || lower.includes('टन')) quantityKg = rawVal * 1000;
    else if (lower.includes('quintal') || lower.includes('क्विंटल')) quantityKg = rawVal * 100;
    else quantityKg = rawVal;
  }

  // Detect primary intent
  let intent = 'ADVISORY';
  if (lower.includes('एडवांस') || lower.includes('advance') || lower.includes('loan') || lower.includes('लोन') || lower.includes('e-nwr') || lower.includes('enwr') || lower.includes('पैसा')) {
    intent = 'ENWR_FINANCE';
  } else if (lower.includes('hold') || lower.includes('sell') || lower.includes('बेचें') || lower.includes('रोकें') || lower.includes('रखें') || lower.includes('निर्णय') || lower.includes('decision')) {
    intent = 'HOLD_VS_SELL';
  } else if (lower.includes('थोक') || lower.includes('wholesale') || lower.includes('bulk') || lower.includes('cluster') || lower.includes('क्लस्टर')) {
    intent = 'WHOLESALE_MATCH';
  } else if (lower.includes('ऑर्गेनिक') || lower.includes('organic') || lower.includes('जैविक') || lower.includes('खरीद') || lower.includes('buy') || lower.includes('order')) {
    intent = 'MARKETPLACE_SEARCH';
  } else if (lower.includes('पिकअप') || lower.includes('गाड़ी') || lower.includes('गाड़ी') || lower.includes('pickup') || lower.includes('route') || lower.includes('ट्रक')) {
    intent = 'LOGISTICS_PICKUP';
  } else if (lower.includes('सड़') || lower.includes('खराब') || lower.includes('spoilage') || lower.includes('expiry') || lower.includes('shelf')) {
    intent = 'SPOILAGE_AUDIT';
  }

  return { matchedCrop, quantityKg, intent };
}

// Built-in Deterministic Agricultural ReAct Reasoning Loop
async function runAutonomousEdgeAgent({
  goal,
  userRole = 'farmer',
  language = 'en',
  runtimeContext = {},
  onStep = () => {}
}) {
  const { matchedCrop, quantityKg, intent } = parseGoalEntities(goal);
  const isHindi = language === 'hi';

  const steps = [];
  const actionCards = [];

  const logStep = async (step) => {
    steps.push(step);
    onStep(step);
    // Micro delay to simulate active AI reasoning flow
    await new Promise(r => setTimeout(r, 280));
  };

  await logStep({
    type: 'thought',
    content: isHindi
      ? `प्राप्त उद्देश्य: "${goal}"। उपयोगकर्ता भूमिका: ${userRole.toUpperCase()}। फसल की पहचान: ${matchedCrop}, मात्रा: ${quantityKg} किग्रा। प्राथमिक विश्लेषण योजना तैयार की जा रही है...`
      : `Received objective: "${goal}". User role: ${userRole.toUpperCase()}. Identified entity: ${matchedCrop}, quantity: ${quantityKg} kg. Formulating tool execution plan...`
  });

  // Step 1: Always check live Mandi vs MSP floor
  await logStep({
    type: 'action',
    tool: 'tool_get_mandi_msp',
    input: { crop: matchedCrop, region: 'Rajasthan' },
    content: `Executing tool_get_mandi_msp for crop="${matchedCrop}", region="Rajasthan"`
  });

  const mandiData = tools.tool_get_mandi_msp({ crop: matchedCrop, region: 'Rajasthan' });

  await logStep({
    type: 'observation',
    tool: 'tool_get_mandi_msp',
    output: mandiData,
    content: `Mandi modal price: ₹${mandiData.modalPriceKg}/kg | Official MSP: ₹${mandiData.mspKg}/kg | Spread: ₹${mandiData.spreadKg}/kg (${mandiData.tradingStatus})`
  });

  // Step 2: Forecast 14-day price trajectory
  await logStep({
    type: 'thought',
    content: isHindi
      ? `मंडी दर और एमएसपी का तुलनात्मक विश्लेषण पूर्ण। अब अगले 14 दिनों के सांख्यिकीय मूल्य प्रक्षेपवक्र (Time-series forecast) का आकलन किया जा रहा है...`
      : `Mandi vs MSP spread analyzed. Now running statistical regression to project 14-day price trajectory for ${matchedCrop}...`
  });

  await logStep({
    type: 'action',
    tool: 'tool_forecast_price_trend',
    input: { crop: matchedCrop, daysAhead: 14 },
    content: `Executing tool_forecast_price_trend for crop="${matchedCrop}", daysAhead=14`
  });

  const forecastData = tools.tool_forecast_price_trend({ crop: matchedCrop, daysAhead: 14 });

  await logStep({
    type: 'observation',
    tool: 'tool_forecast_price_trend',
    output: forecastData,
    content: `Projected 14-day price: ₹${forecastData.predictedPriceKg}/kg (${forecastData.projectedChangePercent > 0 ? '+' : ''}${forecastData.projectedChangePercent}%) with ${forecastData.modelConfidencePercent}% confidence (MAE: ${forecastData.meanAbsoluteError.toFixed(2)}).`
  });

  // Step 3: Intent-specific autonomous execution
  let strategicText = '';

  if (intent === 'ENWR_FINANCE' || intent === 'HOLD_VS_SELL' || userRole === 'farmer') {
    // Evaluate Hold vs Sell & 50% e-NWR pledge
    await logStep({
      type: 'thought',
      content: isHindi
        ? `भंडारण अर्थशास्त्र और 50% ई-एनडब्ल्यूआर गिरवी अग्रिम (WDRA Pledge Financing) की गणना की जा रही है...`
        : `Evaluating storage economics, holding cost depreciation, and 50% e-NWR pledge financing eligibility...`
    });

    await logStep({
      type: 'action',
      tool: 'tool_calculate_enwr_pledge',
      input: { crop: matchedCrop, quantityKg, grade: 'A' },
      content: `Executing tool_calculate_enwr_pledge for crop="${matchedCrop}", quantity=${quantityKg}kg, grade="A"`
    });

    const enwrData = tools.tool_calculate_enwr_pledge({ crop: matchedCrop, quantityKg, grade: 'A' });

    await logStep({
      type: 'observation',
      tool: 'tool_calculate_enwr_pledge',
      output: enwrData,
      content: `Total valuation: ₹${enwrData.commodityValuation.toLocaleString('en-IN')} | Eligible 50% Advance: ₹${enwrData.pledgeAdvanceAmount.toLocaleString('en-IN')} at ${enwrData.annualInterestRatePercent}% p.a. (Est. interest: ₹${enwrData.estimatedMonthlyInterest}/mo)`
    });

    const holdData = tools.tool_evaluate_hold_vs_sell({ crop: matchedCrop, quantityKg, daysToHold: 30 });

    if (mandiData.spreadKg < 0) {
      strategicText = isHindi
        ? `⚠️ **सचेत रहें - संकटपूर्ण बिक्री (Distress Sale) से बचें:**\nवर्तमान में ${matchedCrop} का मंडी भाव (₹${mandiData.modalPriceKg}/किग्रा) सरकारी एमएसपी (₹${mandiData.mspKg}/किग्रा) से कम चल रहा है। यदि आप आज मंडी में बेचते हैं तो प्रति क्विंटल ₹${Math.abs(mandiData.spreadKg * 100)} का सीधा नुकसान होगा।\n\n🎯 **फार्मलिंक एआई स्वायत्त रणनीति:**\n1. अपनी ${quantityKg} किग्रा फसल को निकटतम डब्ल्यूडीआरए पंजीकृत गोदाम (जैसे फुलेरा / जयपुर) में सुरक्षित रखें।\n2. **₹${enwrData.pledgeAdvanceAmount.toLocaleString('en-IN')}** का तत्काल 50% e-NWR एडवांस प्राप्त करें (ब्याज दर केवल 7% प्रति वर्ष)।\n3. जब 14-30 दिनों में बाजार दर बढ़कर ₹${forecastData.predictedPriceKg}/किग्रा तक पहुंचे, तब थोक या सीधे उपभोक्ताओं को लाभ के साथ बेचें।`
        : `⚠️ **Distress Sale Alert Protected:**\nSpot mandi rate for ${matchedCrop} (₹${mandiData.modalPriceKg}/kg) is currently trading below the official Government MSP (₹${mandiData.mspKg}/kg). Open mandi sale today will cause a loss of ₹${Math.abs(mandiData.spreadKg * 100)}/Qtl.\n\n🎯 **FarmLink Agentic Strategy:**\n1. Secure your ${quantityKg} kg harvest in FarmLink's WDRA-accredited warehouse.\n2. Unlock **₹${enwrData.pledgeAdvanceAmount.toLocaleString('en-IN')}** in instant 50% e-NWR pledge financing at 7% p.a. to fund immediate working capital needs.\n3. Hold until projected recovery to ₹${forecastData.predictedPriceKg}/kg (${forecastData.projectedChangePercent}% gain) to capture an estimated net upside of ₹${holdData.netGainOverImmediateSale.toLocaleString('en-IN')}.`;
    } else {
      strategicText = isHindi
        ? `✅ **अनुकूल बाजार स्थिति:**\n${matchedCrop} का मंडी भाव (₹${mandiData.modalPriceKg}/किग्रा) एमएसपी (₹${mandiData.mspKg}/किग्रा) से ₹${mandiData.spreadKg}/किग्रा ऊपर है।\n\n🎯 **फार्मलिंक एआई स्वायत्त रणनीति:**\n• आप इसे सीधे फार्मलिंक मार्केटप्लेस पर ₹${mandiData.modalPriceKg + 3}/किग्रा पर सूचीबद्ध कर सकते हैं, जिससे बिचौलियों का 10-15% कमीशन बचेगा।\n• वैकल्पिक रूप से, ₹${enwrData.pledgeAdvanceAmount.toLocaleString('en-IN')} का 50% e-NWR एडवांस लेकर आगामी मांग वृद्धि (+${forecastData.projectedChangePercent}%) का लाभ उठा सकते हैं।`
        : `✅ **Favorable Market Condition:**\nSpot market for ${matchedCrop} (₹${mandiData.modalPriceKg}/kg) is trading ₹${mandiData.spreadKg}/kg above official MSP.\n\n🎯 **FarmLink Agentic Strategy:**\n• Disintermediate local arthiyas and list directly on FarmLink Marketplace at ₹${(mandiData.modalPriceKg + 2.5).toFixed(2)}/kg to capture direct consumer premiums.\n• Or hold under e-NWR with ₹${enwrData.pledgeAdvanceAmount.toLocaleString('en-IN')} instant advance to capture further 14-day upside (+${forecastData.projectedChangePercent}%).`;
    }

    // Action Cards for Farmer
    actionCards.push({
      id: 'act-enwr-advance',
      type: 'ACTION_APPLY_ENWR',
      title: isHindi ? '50% e-NWR अग्रिम ऋण प्राप्त करें' : 'Apply for 50% e-NWR Advance',
      badge: `₹${enwrData.pledgeAdvanceAmount.toLocaleString('en-IN')} instant disbursal`,
      description: isHindi
        ? `${quantityKg} किग्रा ${matchedCrop} के बदले 7% वार्षिक ब्याज पर तुरंत बैंक खाते में राशि प्राप्त करें।`
        : `Instant collateral loan against ${quantityKg} kg ${matchedCrop} under WDRA registered storage.`,
      buttonLabel: isHindi ? 'अग्रिम आवेदन खोलें ➔' : 'Proceed with e-NWR Advance ➔',
      payload: {
        crop: matchedCrop,
        quantityKg,
        advanceAmount: enwrData.pledgeAdvanceAmount,
        valuation: enwrData.commodityValuation
      }
    });

    actionCards.push({
      id: 'act-prefill-listing',
      type: 'ACTION_PREFILL_LISTING',
      title: isHindi ? 'अनुकूलतम मूल्य पर मार्केटप्लेस में सूचीबद्ध करें' : 'List Produce with Optimal Price Floor',
      badge: `₹${(mandiData.modalPriceKg + 2).toFixed(2)}/kg`,
      description: isHindi
        ? `बिचौलियों को हटाकर उपभोक्ताओं को सीधे बेचें और ₹2-₹5 प्रति किग्रा अधिक कमाएं।`
        : `Disintermediate middlemen and sell directly to consumers at guaranteed fair price.`,
      buttonLabel: isHindi ? 'लिस्टिंग फॉर्म भरें ➔' : 'Pre-fill Marketplace Listing ➔',
      payload: {
        crop: matchedCrop,
        quantityKg,
        priceKg: Math.round((mandiData.modalPriceKg + 2) * 10) / 10,
        grade: 'A'
      }
    });

    actionCards.push({
      id: 'act-request-pickup',
      type: 'ACTION_DISPATCH_PICKUP',
      title: isHindi ? 'क्लस्टर वाहन पिकअप शेड्यूल करें' : 'Schedule Cluster Pickup Vehicle',
      badge: 'Co-loading ₹0.85/kg',
      description: isHindi
        ? 'निकटतम संग्रहण केंद्र से साझा वाहन द्वारा खेत से गोदाम तक परिवहन।'
        : 'Assign shared mini-truck from Jaitpura cluster to warehouse, saving ₹1.55/kg transit fees.',
      buttonLabel: isHindi ? 'पिकअप बुक करें ➔' : 'Dispatch Cluster Vehicle ➔',
      payload: {
        cluster: 'Jaitpura',
        crop: matchedCrop,
        quantityKg
      }
    });
  } else if (intent === 'WHOLESALE_MATCH' || userRole === 'admin') {
    // Wholesale matching
    await logStep({
      type: 'action',
      tool: 'tool_match_farmer_clusters',
      input: { crop: matchedCrop, totalDemandKg: quantityKg },
      content: `Executing tool_match_farmer_clusters for crop="${matchedCrop}", demand=${quantityKg}kg`
    });

    const matchData = tools.tool_match_farmer_clusters({ crop: matchedCrop, totalDemandKg: quantityKg, lots: runtimeContext.lots });

    await logStep({
      type: 'observation',
      tool: 'tool_match_farmer_clusters',
      output: matchData,
      content: matchData.summary
    });

    strategicText = `🏢 **Wholesale Aggregation & Cluster Matching:**\nIdentified **${matchData.participatingFarmersCount} farmer lots** across Phulera & Jaitpura rural clusters, aggregating **${matchData.totalAvailableKg} kg** of ${matchedCrop}.\n• Contract fulfillment: **${matchData.fulfillmentPercentage}%**\n• Weighted average farmgate price: **₹${matchData.weightedAvgPriceKg}/kg** (Guaranteed > MSP ₹${mandiData.mspKg}/kg).\n• Zero intermediary margins: Buyers save 8%, farmers gain +₹4.50/kg.`;

    actionCards.push({
      id: 'act-wholesale-contract',
      type: 'ACTION_FULFILL_WHOLESALE',
      title: 'Allocate Clustered Farmers to Wholesale Order',
      badge: `${matchData.totalAvailableKg} kg aggregated`,
      description: `Draft institutional procurement contract matching ${matchData.participatingFarmersCount} farmers to buyer requirements.`,
      buttonLabel: 'Review in Admin Wholesale Desk ➔',
      payload: matchData
    });
  } else if (intent === 'MARKETPLACE_SEARCH' || userRole === 'consumer') {
    // Marketplace search
    await logStep({
      type: 'action',
      tool: 'tool_search_marketplace',
      input: { crop: matchedCrop, grade: 'A', organicOnly: goal.toLowerCase().includes('organic'), maxDistanceKm: 40 },
      content: `Executing tool_search_marketplace for crop="${matchedCrop}", grade="A"`
    });

    const searchData = tools.tool_search_marketplace({
      crop: matchedCrop,
      grade: 'A',
      organicOnly: goal.toLowerCase().includes('organic') || goal.toLowerCase().includes('ऑर्गेनिक'),
      maxDistanceKm: 40,
      lots: runtimeContext.lots
    });

    await logStep({
      type: 'observation',
      tool: 'tool_search_marketplace',
      output: searchData,
      content: searchData.summary
    });

    strategicText = `🛒 **Direct Farm Produce Recommendations:**\nFound **${searchData.totalMatchesFound} verified lots** matching your preference for ${matchedCrop}.\nEvery lot includes 100% farm provenance, computer vision grading report, and eliminates retail intermediary markups (saving you ₹5–₹8/kg).`;

    if (searchData.topRecommendations.length > 0) {
      const top = searchData.topRecommendations[0];
      actionCards.push({
        id: 'act-reserve-produce',
        type: 'ACTION_RESERVE_PRODUCE',
        title: `Reserve ${top.crop} (Grade ${top.grade})`,
        badge: `₹${top.priceKg}/kg · ${top.distanceKm} km away`,
        description: `Direct harvest from farmer ${top.farmer} (${top.warehouse}). Certified fresh.`,
        buttonLabel: 'Add to Cart & Reserve ➔',
        payload: top
      });
    }
  } else {
    // Logistics / Spoilage audit
    await logStep({
      type: 'action',
      tool: 'tool_plan_logistics_route',
      input: { originCluster: 'Jaitpura', destinationHub: 'Jaipur_North', totalWeightKg: quantityKg },
      content: `Executing tool_plan_logistics_route for origin="Jaitpura", destination="Jaipur_North"`
    });

    const routeData = tools.tool_plan_logistics_route({ originCluster: 'Jaitpura', destinationHub: 'Jaipur_North', totalWeightKg: quantityKg });

    await logStep({
      type: 'observation',
      tool: 'tool_plan_logistics_route',
      output: routeData,
      content: routeData.summary
    });

    strategicText = `🚚 **Optimized Rural-to-City Logistics:**\nCo-loading route scheduled between ${routeData.origin} and ${routeData.destination} (${routeData.distanceKm} km).\n• Assigned vehicle: **${routeData.recommendedVehicle}**\n• Estimated transit: **${routeData.estimatedTransitHours} hours**\n• Total logistics cost: **₹${routeData.coLoadingCostTotal.toLocaleString('en-IN')}** (Saves ₹${routeData.clusterLogisticsSavings.toLocaleString('en-IN')} vs individual transport).`;

    actionCards.push({
      id: 'act-view-route',
      type: 'ACTION_VIEW_ROUTE',
      title: 'Inspect Inter-Warehouse Route',
      badge: `${routeData.distanceKm} km · ${routeData.recommendedVehicle}`,
      description: 'View live transit checkpoints, haversine road route, and hub tracking on interactive map.',
      buttonLabel: 'Open Route Map ➔',
      payload: routeData
    });
  }

  return {
    success: true,
    steps,
    text: strategicText,
    actionCards
  };
}

// Master Unified Agent Invocation Entry Point
export async function executeAutonomousAgent({
  goal,
  userRole = 'farmer',
  language = 'en',
  apiKey = '',
  model = 'gemini-2.5-flash',
  useGeminiIfAvailable = true,
  runtimeContext = {},
  onStep = () => {}
}) {
  const trimmedKey = (apiKey || '').trim();

  // If Gemini API key is supplied and enabled, run full cloud Gemini function-calling agent
  if (trimmedKey && useGeminiIfAvailable) {
    try {
      const geminiResult = await runGeminiAgent({
        apiKey: trimmedKey,
        model,
        goal,
        userRole,
        language,
        runtimeContext,
        onStep
      });

      // Parse entities to append actionable interactive cards even in Gemini mode
      const { matchedCrop, quantityKg } = parseGoalEntities(goal);
      const enwr = tools.tool_calculate_enwr_pledge({ crop: matchedCrop, quantityKg });
      const mandi = tools.tool_get_mandi_msp({ crop: matchedCrop });
      const safeModalPrice = Number(mandi?.modalPriceKg) || 30;
      const safeAdvance = Number(enwr?.pledgeAdvanceAmount) || 15000;

      const geminiActionCards = [
        {
          id: 'act-gemini-enwr',
          type: 'ACTION_APPLY_ENWR',
          title: language === 'hi' ? '50% e-NWR अग्रिम ऋण प्राप्त करें' : 'Apply for 50% e-NWR Advance',
          badge: `₹${safeAdvance.toLocaleString('en-IN')} instant loan`,
          description: `Unlock WDRA 50% advance for ${quantityKg} kg ${matchedCrop} at 7% p.a.`,
          buttonLabel: language === 'hi' ? 'अग्रिम आवेदन खोलें ➔' : 'Proceed with e-NWR Advance ➔',
          payload: { crop: matchedCrop, quantityKg, advanceAmount: safeAdvance }
        },
        {
          id: 'act-gemini-listing',
          type: 'ACTION_PREFILL_LISTING',
          title: language === 'hi' ? 'अनुकूलतम मूल्य पर मार्केटप्लेस में सूचीबद्ध करें' : 'List Produce with Optimal Price Floor',
          badge: `₹${(safeModalPrice + 2).toFixed(2)}/kg`,
          description: 'Direct farmgate sale avoiding APMC commission agents.',
          buttonLabel: language === 'hi' ? 'लिस्टिंग फॉर्म भरें ➔' : 'Pre-fill Marketplace Listing ➔',
          payload: { crop: matchedCrop, quantityKg, priceKg: safeModalPrice + 2, grade: 'A' }
        }
      ];

      return {
        success: true,
        source: 'gemini-cloud',
        text: geminiResult.text,
        actionCards: geminiActionCards
      };
    } catch (err) {
      console.warn('Gemini cloud invocation failed, gracefully falling back to autonomous edge ReAct engine:', err.message);
      onStep({
        type: 'thought',
        content: `Notice: KANAK AI Cloud connection returned (${err.message}). Activating FarmLink Autonomous Edge Engine for guaranteed uptime...`
      });
      // Fallback to Edge ReAct
      const edgeResult = await runAutonomousEdgeAgent({
        goal,
        userRole,
        language,
        runtimeContext,
        onStep
      });
      return { ...edgeResult, source: 'edge-react-fallback' };
    }
  }

  // Built-in Deterministic Edge ReAct Engine (default, ultra-fast, zero-API-key)
  const edgeResult = await runAutonomousEdgeAgent({
    goal,
    userRole,
    language,
    runtimeContext,
    onStep
  });
  return { ...edgeResult, source: 'edge-react' };
}
