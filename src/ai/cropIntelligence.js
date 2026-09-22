// FarmLink Comprehensive Crop Intelligence Database (APMC / MSP 2025-26)
// Deterministic benchmarks for Indian Agricultural Supply Chain (SIH PS 26033)

export const CROP_INTELLIGENCE = {
  // Cereals & Millets
  'Wheat': {
    category: 'Cereals & millets',
    baseLow: 24.0, baseHigh: 28.5, msp: 22.75, mspNotified: true,
    mandi: 'Kota Mandi, Rajasthan', modalPrice: 25.8,
    shelfLifeDays: 365, storageType: 'Dry ventilated warehouse / Silo',
    holdingCostPerMonth: 0.20, enwrEligible: true,
    season: 'Rabi', demandTrend: '+6% (Flour mills & civil supplies buffer)',
    notes: 'FarmLink guarantees MSP floor of ₹22.75/kg. Holding is favorable in accredited warehouse under e-NWR pledge.'
  },
  'Rice': {
    category: 'Cereals & millets',
    baseLow: 23.5, baseHigh: 29.0, msp: 23.00, mspNotified: true,
    mandi: 'Bundi APMC, Rajasthan', modalPrice: 25.0,
    shelfLifeDays: 365, storageType: 'Standard warehouse (Moisture <14%)',
    holdingCostPerMonth: 0.22, enwrEligible: true,
    season: 'Kharif', demandTrend: '+4% (FCI procurement & steady wholesale)',
    notes: 'Grade A paddy fetches milling premium. Safe commodity for long-term holding with WDRA certificate.'
  },
  'Maize': {
    category: 'Cereals & millets',
    baseLow: 20.5, baseHigh: 24.5, msp: 20.90, mspNotified: true,
    mandi: 'Bhilwara Mandi, Rajasthan', modalPrice: 22.2,
    shelfLifeDays: 270, storageType: 'Dry storage',
    holdingCostPerMonth: 0.18, enwrEligible: true,
    season: 'Kharif', demandTrend: '+12% (Poultry feed & starch industry demand surge)',
    notes: 'Feed mill buyers actively sourcing. Current spot price is healthy above official MSP.'
  },
  'Barley': {
    category: 'Cereals & millets',
    baseLow: 19.0, baseHigh: 23.0, msp: 18.50, mspNotified: true,
    mandi: 'Jaipur Grain Mandi', modalPrice: 20.5,
    shelfLifeDays: 300, storageType: 'Aerated warehouse',
    holdingCostPerMonth: 0.18, enwrEligible: true,
    season: 'Rabi', demandTrend: '+7% (Malt & industrial processing offtake)',
    notes: 'Malt quality lots command a 10–12% premium over feed grade.'
  },
  'Pearl millet (Bajra)': {
    category: 'Cereals & millets',
    baseLow: 24.0, baseHigh: 28.0, msp: 25.00, mspNotified: true,
    mandi: 'Alwar APMC, Rajasthan', modalPrice: 25.5,
    shelfLifeDays: 240, storageType: 'Pest-controlled dry warehouse',
    holdingCostPerMonth: 0.19, enwrEligible: true,
    season: 'Kharif', demandTrend: '+9% (State millet procurement & winter consumption)',
    notes: 'Major Rajasthan regional crop. Protected by state and central MSP procurement.'
  },
  'Sorghum (Jowar)': {
    category: 'Cereals & millets',
    baseLow: 31.0, baseHigh: 36.0, msp: 31.80, mspNotified: true,
    mandi: 'Ajmer Mandi, Rajasthan', modalPrice: 33.0,
    shelfLifeDays: 300, storageType: 'Covered warehouse',
    holdingCostPerMonth: 0.20, enwrEligible: true,
    season: 'Kharif', demandTrend: '+5% (Nutri-cereal institutional demand)',
    notes: 'Maldandi variety trades at high premium. Government Shree Anna millet initiative active.'
  },
  'Finger millet (Ragi)': {
    category: 'Cereals & millets',
    baseLow: 38.0, baseHigh: 45.0, msp: 38.46, mspNotified: true,
    mandi: 'Jaipur North Cluster', modalPrice: 41.0,
    shelfLifeDays: 365, storageType: 'Airtight dry storage',
    holdingCostPerMonth: 0.20, enwrEligible: true,
    season: 'Kharif', demandTrend: '+15% (Urban packaged health food offtake)',
    notes: 'Superfood premium in consumer market. High storage resilience over 12 months.'
  },

  // Pulses
  'Chickpea (Gram)': {
    category: 'Pulses',
    baseLow: 58.0, baseHigh: 72.0, msp: 54.40, mspNotified: true,
    mandi: 'Bikaner Mandi, Rajasthan', modalPrice: 62.5,
    shelfLifeDays: 240, storageType: 'Fumigated accredited warehouse',
    holdingCostPerMonth: 0.30, enwrEligible: true,
    season: 'Rabi', demandTrend: '+8% (Besan milling & festive buffer replenishment)',
    notes: 'NAFED buffer procurement active. Grade A desi gram trades well above MSP floor.'
  },
  'Pigeon pea (Arhar/Tur)': {
    category: 'Pulses',
    baseLow: 95.0, baseHigh: 118.0, msp: 70.00, mspNotified: true,
    mandi: 'Akola / Jaipur Wholesale', modalPrice: 104.0,
    shelfLifeDays: 180, storageType: 'Accredited warehouse',
    holdingCostPerMonth: 0.35, enwrEligible: true,
    season: 'Kharif', demandTrend: '+11% (Tight domestic supplies vs high urban dal consumption)',
    notes: 'Spot market is trading 40%+ over MSP. Recommended holding with 50% e-NWR working capital pledge.'
  },
  'Green gram (Moong)': {
    category: 'Pulses',
    baseLow: 86.0, baseHigh: 102.0, msp: 85.58, mspNotified: true,
    mandi: 'Nagaur Mandi, Rajasthan', modalPrice: 91.0,
    shelfLifeDays: 180, storageType: 'Dry moisture-proof store',
    holdingCostPerMonth: 0.32, enwrEligible: true,
    season: 'Kharif/Zaid', demandTrend: '+6% (Direct retail packing demand)',
    notes: 'Shiny green export-quality lots fetch ₹98+/kg. MSP floor strictly enforced on FarmLink.'
  },
  'Black gram (Urad)': {
    category: 'Pulses',
    baseLow: 74.0, baseHigh: 90.0, msp: 69.50, mspNotified: true,
    mandi: 'Kota APMC, Rajasthan', modalPrice: 79.5,
    shelfLifeDays: 180, storageType: 'Standard pulse warehouse',
    holdingCostPerMonth: 0.30, enwrEligible: true,
    season: 'Kharif', demandTrend: '+5% (Papad and dal millers demand steady)',
    notes: 'Good quality lots above MSP baseline. Eligible for collateral pledge.'
  },
  'Lentil (Masur)': {
    category: 'Pulses',
    baseLow: 65.0, baseHigh: 78.0, msp: 64.25, mspNotified: true,
    mandi: 'Sri Ganganagar Mandi', modalPrice: 69.0,
    shelfLifeDays: 240, storageType: 'Ventilated warehouse',
    holdingCostPerMonth: 0.28, enwrEligible: true,
    season: 'Rabi', demandTrend: '+7% (Domestic dal consumption)',
    notes: 'Stable rabi pulse with low moisture depreciation.'
  },
  'French bean': {
    category: 'Pulses',
    baseLow: 44.0, baseHigh: 54.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Muhana Mandi', modalPrice: 48.0,
    shelfLifeDays: 5, storageType: 'Cold room (4–6°C) or rapid transit',
    holdingCostPerMonth: 1.50, enwrEligible: false,
    season: 'Year-round', demandTrend: '+14% (City QSR & retail vegetable supply)',
    notes: 'High perishability produce (5-day window). Recommend prompt sale or pre-booked buyer contract.'
  },
  'Cluster bean (Guar)': {
    category: 'Pulses',
    baseLow: 52.0, baseHigh: 66.0, msp: null, mspNotified: false,
    mandi: 'Jodhpur APMC, Rajasthan', modalPrice: 58.0,
    shelfLifeDays: 365, storageType: 'Accredited commodity warehouse',
    holdingCostPerMonth: 0.25, enwrEligible: true,
    season: 'Kharif', demandTrend: '+10% (Guar gum export correlation to crude industry)',
    notes: 'Highly storable cash pulse. Perfect candidate for e-NWR pledge to capture seasonal rallies.'
  },
  'Soybean': {
    category: 'Pulses',
    baseLow: 44.0, baseHigh: 51.0, msp: 46.00, mspNotified: true,
    mandi: 'Baran / Kota Mandi', modalPrice: 47.5,
    shelfLifeDays: 240, storageType: 'Dry ventilated storage',
    holdingCostPerMonth: 0.24, enwrEligible: true,
    season: 'Kharif', demandTrend: '+8% (DOC export & solvent extraction plants)',
    notes: 'Trading near MSP threshold. FarmLink safety net guarantees minimum price.'
  },

  // Oilseeds
  'Rapeseed & mustard': {
    category: 'Oilseeds',
    baseLow: 82.0, baseHigh: 98.4, msp: 56.50, mspNotified: true,
    mandi: 'Phulera / Jaitpura Cluster Hub', modalPrice: 86.0,
    shelfLifeDays: 365, storageType: 'WDRA Accredited Hub',
    holdingCostPerMonth: 0.25, enwrEligible: true,
    season: 'Rabi', demandTrend: '+16% (Phulera financial pilot benchmark: ₹82 farm / ₹98.40 retail)',
    notes: 'Core SIH pilot commodity. High oil content (40%+) commands premium. 50% advance available via e-NWR.'
  },
  'Mustard': {
    category: 'Oilseeds',
    baseLow: 82.0, baseHigh: 98.4, msp: 56.50, mspNotified: true,
    mandi: 'Phulera / Jaitpura Cluster Hub', modalPrice: 86.0,
    shelfLifeDays: 365, storageType: 'WDRA Accredited Hub',
    holdingCostPerMonth: 0.25, enwrEligible: true,
    season: 'Rabi', demandTrend: '+16% (Phulera financial pilot benchmark: ₹82 farm / ₹98.40 retail)',
    notes: 'Core SIH pilot commodity. High oil content (40%+) commands premium. 50% advance available via e-NWR.'
  },
  'Groundnut': {
    category: 'Oilseeds',
    baseLow: 64.0, baseHigh: 76.0, msp: 63.77, mspNotified: true,
    mandi: 'Bikaner APMC, Rajasthan', modalPrice: 68.0,
    shelfLifeDays: 240, storageType: 'Well-ventilated pod storage',
    holdingCostPerMonth: 0.28, enwrEligible: true,
    season: 'Kharif', demandTrend: '+10% (Edible oil refiners & peanut butter processors)',
    notes: 'NAFED procurement active. Bold variety pods fetch export pricing.'
  },
  'Sesame (Til)': {
    category: 'Oilseeds',
    baseLow: 110.0, baseHigh: 155.0, msp: 86.35, mspNotified: true,
    mandi: 'Pali Mandi, Rajasthan', modalPrice: 128.0,
    shelfLifeDays: 300, storageType: 'Moisture-controlled warehouse',
    holdingCostPerMonth: 0.35, enwrEligible: true,
    season: 'Kharif', demandTrend: '+14% (Confectionery & Far East export demand)',
    notes: 'Natural white sesame commands highest export valuation.'
  },
  'Sunflower': {
    category: 'Oilseeds',
    baseLow: 65.0, baseHigh: 75.0, msp: 67.60, mspNotified: true,
    mandi: 'Rajasthan Oilseed Exchange', modalPrice: 69.5,
    shelfLifeDays: 240, storageType: 'Dry storage',
    holdingCostPerMonth: 0.26, enwrEligible: true,
    season: 'Kharif/Rabi', demandTrend: '+6% (Domestic edible oil crushing)',
    notes: 'Protected by central MSP. Storable oilseed.'
  },

  // Vegetables
  'Tomato': {
    category: 'Vegetables',
    baseLow: 24.0, baseHigh: 32.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Muhana Mandi', modalPrice: 27.5,
    shelfLifeDays: 8, storageType: 'Crated ambient / Cold transit (10–12°C)',
    holdingCostPerMonth: 3.00, enwrEligible: false,
    season: 'Year-round', demandTrend: '+8% (Jaipur North urban consumer & restaurant demand)',
    notes: 'Perishable: optimal sale window is within 3 days of harvest. Spoilage risk elevates rapidly after day 5.'
  },
  'Potato': {
    category: 'Vegetables',
    baseLow: 14.0, baseHigh: 21.0, msp: null, mspNotified: false,
    mandi: 'Agra / Jaipur Cold Storage Belt', modalPrice: 17.0,
    shelfLifeDays: 90, storageType: 'Cold storage (2–4°C with CIPC)',
    holdingCostPerMonth: 0.40, enwrEligible: true,
    season: 'Rabi', demandTrend: '+5% (Wafer & chip processing contracts steady)',
    notes: 'Storable tuber vegetable. Highly feasible for warehouse receipt holding across 30–60 days.'
  },
  'Onion': {
    category: 'Vegetables',
    baseLow: 18.0, baseHigh: 28.0, msp: null, mspNotified: false,
    mandi: 'Alwar / Nashik APMC', modalPrice: 22.0,
    shelfLifeDays: 45, storageType: 'Naturally ventilated bottom-draft chawl',
    holdingCostPerMonth: 0.50, enwrEligible: true,
    season: 'Kharif/Rabi', demandTrend: '+12% (NAFED/NCCF buffer stock & retail demand)',
    notes: 'Monitor for sprouting or neck rot. Grade A firm bulbs command top price.'
  },
  'Garlic': {
    category: 'Vegetables',
    baseLow: 90.0, baseHigh: 165.0, msp: null, mspNotified: false,
    mandi: 'Kota / Jodhpur Spice Mandi', modalPrice: 120.0,
    shelfLifeDays: 120, storageType: 'Dry ventilated warehouse',
    holdingCostPerMonth: 0.60, enwrEligible: true,
    season: 'Rabi', demandTrend: '+15% (Export of whole cloves & dehydrated flakes)',
    notes: 'High-value storable commodity. Perfect for holding in warehouse receipts.'
  },
  'Brinjal (Eggplant)': {
    category: 'Vegetables',
    baseLow: 16.0, baseHigh: 26.0, msp: null, mspNotified: false,
    mandi: 'Muhana Mandi, Jaipur', modalPrice: 20.0,
    shelfLifeDays: 5, storageType: 'Ventilated cool shade',
    holdingCostPerMonth: 3.50, enwrEligible: false,
    season: 'Year-round', demandTrend: '+6% (Daily urban vegetable market)',
    notes: 'Perishable: sell within 48–72 hours of harvest to prevent weight loss.'
  },
  'Okra (Bhindi)': {
    category: 'Vegetables',
    baseLow: 28.0, baseHigh: 44.0, msp: null, mspNotified: false,
    mandi: 'Jaipur South Mandi', modalPrice: 34.0,
    shelfLifeDays: 4, storageType: 'Cool shade / Rapid dispatch',
    holdingCostPerMonth: 4.00, enwrEligible: false,
    season: 'Summer/Kharif', demandTrend: '+10% (Urban retail premium for tender pods)',
    notes: 'High moisture loss rate. Daily picking and rapid marketplace listing recommended.'
  },
  'Capsicum': {
    category: 'Vegetables',
    baseLow: 36.0, baseHigh: 60.0, msp: null, mspNotified: false,
    mandi: 'Polyhouse Cluster, Chomu', modalPrice: 46.0,
    shelfLifeDays: 6, storageType: 'Cold room (7–9°C)',
    holdingCostPerMonth: 2.80, enwrEligible: false,
    season: 'Year-round', demandTrend: '+12% (Hotel and QSR institutional orders)',
    notes: 'Greenhouse intake verified Grade A commands 15% premium over open-field.'
  },
  'Chilli': {
    category: 'Vegetables',
    baseLow: 35.0, baseHigh: 75.0, msp: null, mspNotified: false,
    mandi: 'Mathania / Jodhpur Mandi', modalPrice: 50.0,
    shelfLifeDays: 7, storageType: 'Crated ventilated (fresh) / Dry yard (red)',
    holdingCostPerMonth: 2.00, enwrEligible: false,
    season: 'Year-round', demandTrend: '+8% (Fresh green chilli daily absorption)',
    notes: 'Dry red chilli variant has 180+ day shelf-life and high storage value.'
  },
  'Cauliflower': {
    category: 'Vegetables',
    baseLow: 16.0, baseHigh: 28.0, msp: null, mspNotified: false,
    mandi: 'Muhana Mandi, Jaipur', modalPrice: 21.0,
    shelfLifeDays: 5, storageType: 'Cold transit / Shaded crate',
    holdingCostPerMonth: 3.50, enwrEligible: false,
    season: 'Rabi', demandTrend: '+4% (Peak winter arrival volume)',
    notes: 'Compact white curds without yellowing command top tier.'
  },
  'Cabbage': {
    category: 'Vegetables',
    baseLow: 12.0, baseHigh: 20.0, msp: null, mspNotified: false,
    mandi: 'Jaipur North Cluster', modalPrice: 15.0,
    shelfLifeDays: 12, storageType: 'Cool dry crate storage',
    holdingCostPerMonth: 1.80, enwrEligible: false,
    season: 'Rabi', demandTrend: '+5% (Institutional canteen and bulk transport)',
    notes: 'Better transport durability than leafy greens. Low spoilage risk up to day 7.'
  },
  'Carrot': {
    category: 'Vegetables',
    baseLow: 18.0, baseHigh: 30.0, msp: null, mspNotified: false,
    mandi: 'Sanganer Hub, Rajasthan', modalPrice: 23.0,
    shelfLifeDays: 7, storageType: 'Washed, hydro-cooled crates',
    holdingCostPerMonth: 2.50, enwrEligible: false,
    season: 'Rabi', demandTrend: '+11% (Juice centers & domestic winter consumption)',
    notes: 'Red desi carrots in peak demand. Wash and crate immediately for Grade A premium.'
  },
  'Peas': {
    category: 'Vegetables',
    baseLow: 32.0, baseHigh: 58.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Muhana Mandi', modalPrice: 42.0,
    shelfLifeDays: 5, storageType: 'Perforated crate / Cold chain (0–2°C)',
    holdingCostPerMonth: 3.00, enwrEligible: false,
    season: 'Rabi', demandTrend: '+14% (Frozen pea food processors & retail)',
    notes: 'Pods lose sweetness after day 3. Sell immediately to capture prime harvest value.'
  },
  'Cucumber': {
    category: 'Vegetables',
    baseLow: 15.0, baseHigh: 26.0, msp: null, mspNotified: false,
    mandi: 'Muhana Mandi, Jaipur', modalPrice: 19.0,
    shelfLifeDays: 6, storageType: 'Cool shade (10–12°C)',
    holdingCostPerMonth: 2.80, enwrEligible: false,
    season: 'Summer/Zaid', demandTrend: '+18% (Summer salad and juice demand)',
    notes: 'Hydroponic/polyhouse smooth fruit fetches premium above open-field.'
  },
  'Spinach': {
    category: 'Vegetables',
    baseLow: 12.0, baseHigh: 22.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Local Wholesale', modalPrice: 16.0,
    shelfLifeDays: 2, storageType: 'Moist shade / Same-day dispatch',
    holdingCostPerMonth: 5.00, enwrEligible: false,
    season: 'Year-round', demandTrend: '+7% (Daily consumer green requirement)',
    notes: 'Ultra-perishable. Dispatch within 24 hours of harvest.'
  },
  'Mushroom': {
    category: 'Vegetables',
    baseLow: 95.0, baseHigh: 145.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Cold Hub', modalPrice: 115.0,
    shelfLifeDays: 3, storageType: 'Cold room (2–4°C punnets)',
    holdingCostPerMonth: 6.00, enwrEligible: false,
    season: 'Year-round', demandTrend: '+15% (Restaurant, hotel & supermarket uptake)',
    notes: 'Intake grading confirms button closure and lack of veiling.'
  },

  // Fruits
  'Mango': {
    category: 'Fruits',
    baseLow: 45.0, baseHigh: 90.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Fruit APMC', modalPrice: 62.0,
    shelfLifeDays: 12, storageType: 'Controlled ripening room / ventilated crates',
    holdingCostPerMonth: 2.00, enwrEligible: false,
    season: 'Summer', demandTrend: '+22% (Peak seasonal demand & pulp processors)',
    notes: 'Alphonso/Kesar/Dasheri table varieties command high premium.'
  },
  'Banana': {
    category: 'Fruits',
    baseLow: 18.0, baseHigh: 28.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Central Fruit Market', modalPrice: 22.0,
    shelfLifeDays: 7, storageType: 'Ethylene ripening chamber (14–16°C)',
    holdingCostPerMonth: 2.50, enwrEligible: false,
    season: 'Year-round', demandTrend: '+8% (Consistent daily household consumption)',
    notes: 'Grand Naine grade bunches with uniform calibration fetch 15% premium.'
  },
  'Pomegranate': {
    category: 'Fruits',
    baseLow: 70.0, baseHigh: 125.0, msp: null, mspNotified: false,
    mandi: 'Solapur / Jaipur Fruit Market', modalPrice: 92.0,
    shelfLifeDays: 60, storageType: 'Cold storage (5°C, 90% RH)',
    holdingCostPerMonth: 0.80, enwrEligible: true,
    season: 'Year-round', demandTrend: '+14% (Domestic health demand & Gulf export)',
    notes: 'Bhagwa variety with deep red arils is prime candidate for holding.'
  },
  'Grapes': {
    category: 'Fruits',
    baseLow: 45.0, baseHigh: 80.0, msp: null, mspNotified: false,
    mandi: 'Nashik / Jaipur Wholesale', modalPrice: 58.0,
    shelfLifeDays: 14, storageType: 'Pre-cooled cold chain with SO2 pads (0°C)',
    holdingCostPerMonth: 1.80, enwrEligible: false,
    season: 'Winter/Spring', demandTrend: '+12% (Table grape export window)',
    notes: 'Thompson Seedless with 16+ Brix sweetness grade tops market pricing.'
  },
  'Guava': {
    category: 'Fruits',
    baseLow: 25.0, baseHigh: 45.0, msp: null, mspNotified: false,
    mandi: 'Sawai Madhopur / Jaipur', modalPrice: 32.0,
    shelfLifeDays: 6, storageType: 'Foam-netted crate packaging',
    holdingCostPerMonth: 2.80, enwrEligible: false,
    season: 'Winter', demandTrend: '+10% (Sawai Madhopur regional specialty)',
    notes: 'L-49 / Allahabad Safeda varieties in high demand.'
  },
  'Papaya': {
    category: 'Fruits',
    baseLow: 16.0, baseHigh: 26.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Fruit Terminal', modalPrice: 20.0,
    shelfLifeDays: 6, storageType: 'Cushioned crate storage',
    holdingCostPerMonth: 2.50, enwrEligible: false,
    season: 'Year-round', demandTrend: '+7% (Daily urban fruit intake)',
    notes: 'Taiwan 786 red lady variety commands superior pricing.'
  },
  'Apple': {
    category: 'Fruits',
    baseLow: 85.0, baseHigh: 155.0, msp: null, mspNotified: false,
    mandi: 'Jaipur Cold Hub (Shimla/Kashmir)', modalPrice: 110.0,
    shelfLifeDays: 120, storageType: 'Controlled Atmosphere (CA) Store',
    holdingCostPerMonth: 0.70, enwrEligible: true,
    season: 'Autumn/Winter', demandTrend: '+9% (Premium domestic fruit market)',
    notes: 'Royal Delicious CA stored apples eligible for warehouse receipt credit.'
  },
  'Kiwi': {
    category: 'Fruits',
    baseLow: 120.0, baseHigh: 185.0, msp: null, mspNotified: false,
    mandi: 'North India Cold Chain', modalPrice: 145.0,
    shelfLifeDays: 25, storageType: 'Cold store (0–1°C)',
    holdingCostPerMonth: 1.20, enwrEligible: true,
    season: 'Winter', demandTrend: '+16% (Import substitution & health demand)',
    notes: 'Himachal / Arunachal Pradesh origin kiwi holds strong price stability.'
  },
  'Strawberry': {
    category: 'Fruits',
    baseLow: 110.0, baseHigh: 190.0, msp: null, mspNotified: false,
    mandi: 'Jaipur QSR Supply Hub', modalPrice: 140.0,
    shelfLifeDays: 3, storageType: 'Cold chain transit (1–2°C)',
    holdingCostPerMonth: 5.00, enwrEligible: false,
    season: 'Winter', demandTrend: '+25% (Bakery, dessert & urban retail surge)',
    notes: 'Ultra-perishable. Dispatch directly to cold-chain aggregator.'
  },
  'Orange': {
    category: 'Fruits',
    baseLow: 30.0, baseHigh: 55.0, msp: null, mspNotified: false,
    mandi: 'Jhalawar / Nagpur Cluster', modalPrice: 40.0,
    shelfLifeDays: 21, storageType: 'Waxed cool storage (5–8°C)',
    holdingCostPerMonth: 1.00, enwrEligible: true,
    season: 'Winter', demandTrend: '+11% (Juice processing & table consumption)',
    notes: 'Jhalawar mandarin orange is prime regional produce in Rajasthan.'
  },

  // Spices & Condiments
  'Turmeric': {
    category: 'Spices & condiments',
    baseLow: 115.0, baseHigh: 170.0, msp: null, mspNotified: false,
    mandi: 'Sangli / Nizamabad APMC', modalPrice: 135.0,
    shelfLifeDays: 365, storageType: 'Fumigated dry warehouse',
    holdingCostPerMonth: 0.30, enwrEligible: true,
    season: 'Rabi', demandTrend: '+12% (Curcumin pharmaceutical & culinary export)',
    notes: 'Polished dry fingers command highest price. Excellent for e-NWR pledge.'
  },
  'Cumin': {
    category: 'Spices & condiments',
    baseLow: 220.0, baseHigh: 340.0, msp: null, mspNotified: false,
    mandi: 'Unjha / Jodhpur Mandi', modalPrice: 265.0,
    shelfLifeDays: 365, storageType: 'Dry airtight accredited storage',
    holdingCostPerMonth: 0.40, enwrEligible: true,
    season: 'Rabi', demandTrend: '+18% (Global benchmark commodity with high export)',
    notes: 'Rajasthan-Gujarat global cumin belt. High collateral value for pledge loan.'
  },
  'Coriander seed': {
    category: 'Spices & condiments',
    baseLow: 72.0, baseHigh: 98.0, msp: null, mspNotified: false,
    mandi: 'Ramganj Mandi, Kota', modalPrice: 82.0,
    shelfLifeDays: 365, storageType: 'Moisture-proof cool store',
    holdingCostPerMonth: 0.28, enwrEligible: true,
    season: 'Rabi', demandTrend: '+9% (Spice grinders & export orders)',
    notes: 'Kota / Baran is Asia’s largest coriander corridor. e-NWR eligible.'
  },
  'Fenugreek': {
    category: 'Spices & condiments',
    baseLow: 55.0, baseHigh: 75.0, msp: null, mspNotified: false,
    mandi: 'Bikaner Mandi, Rajasthan', modalPrice: 63.0,
    shelfLifeDays: 365, storageType: 'Standard spice store',
    holdingCostPerMonth: 0.25, enwrEligible: true,
    season: 'Rabi', demandTrend: '+6% (Ayurvedic and culinary usage)',
    notes: 'Clean machine-cleaned seeds fetch 8% premium.'
  },
  'Fennel': {
    category: 'Spices & condiments',
    baseLow: 125.0, baseHigh: 195.0, msp: null, mspNotified: false,
    mandi: 'Abu Road / Sirohi Mandi', modalPrice: 152.0,
    shelfLifeDays: 365, storageType: 'Airtight dry storage',
    holdingCostPerMonth: 0.35, enwrEligible: true,
    season: 'Rabi', demandTrend: '+11% (Export grade green fennel premium)',
    notes: 'Green colored unblemished seeds fetch top international rate.'
  },
  'Black pepper': {
    category: 'Spices & condiments',
    baseLow: 490.0, baseHigh: 630.0, msp: null, mspNotified: false,
    mandi: 'Kochi Spice Terminal', modalPrice: 540.0,
    shelfLifeDays: 365, storageType: 'Dehumidified warehouse',
    holdingCostPerMonth: 0.80, enwrEligible: true,
    season: 'Winter', demandTrend: '+10% (Oleoresin extractors & export parity)',
    notes: 'Garbled light berries removed. High value density.'
  },

  // Commercial & Fibre
  'Cotton': {
    category: 'Commercial & fibre',
    baseLow: 66.0, baseHigh: 78.0, msp: 66.20, mspNotified: true,
    mandi: 'Hanumangarh / Sri Ganganagar', modalPrice: 71.0,
    shelfLifeDays: 365, storageType: 'Accredited bale/lint godown',
    holdingCostPerMonth: 0.30, enwrEligible: true,
    season: 'Kharif', demandTrend: '+7% (Spinning mill buying & CCI procurement)',
    notes: 'Medium / Long staple cotton. Guaranteed MSP floor by Cotton Corporation of India.'
  },
  'Sugarcane': {
    category: 'Commercial & fibre',
    baseLow: 3.40, baseHigh: 3.85, msp: 3.40, mspNotified: true,
    mandi: 'Linked Sugar Mill Gate', modalPrice: 3.55,
    shelfLifeDays: 3, storageType: 'Direct mill transit (<48h)',
    holdingCostPerMonth: 0.00, enwrEligible: false,
    season: 'Year-round', demandTrend: '+5% (Fair & Remunerative Price FRP backed)',
    notes: 'Weight and sucrose shrinkage occurs after 48h. Deliver to mill gate immediately.'
  }
};
