import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/lib/dataSyncEngine.js');
let content = fs.readFileSync(filePath, 'utf-8');

const additions = `
// ─── 7. WDRA REGISTERED WAREHOUSES & PROPER ADDRESS REGISTRY ───────────────
export const WDRA_REGISTERED_WAREHOUSES = [
  {
    id: 'wdra-jpr-01',
    name: 'Jaipur North WDRA Hub (CWC)',
    code: 'WDRA-JPR-CWC-01',
    wdraRegNo: 'WDRA/RJ/JPR/042',
    address: 'Central Warehousing Corp, Plot 4A, Road No. 9, VKIA, Sikar Road, Jaipur, Rajasthan',
    district: 'Jaipur',
    pincode: '302013',
    capacityMt: 12500,
    availableMt: 4200,
    coldChambers: 4,
    intakeCrops: ['Mustard', 'Wheat', 'Gram (Chickpea)', 'Barley', 'Tomato'],
    lat: 26.9620,
    lng: 75.7780,
    manager: 'Er. Alok Sharma (+91 94140 33812)',
    status: 'WDRA Accredited & Inspected'
  },
  {
    id: 'wdra-sng-02',
    name: 'Sanganer Central Agro Terminal (SWC)',
    code: 'WDRA-SNG-SWC-02',
    wdraRegNo: 'WDRA/RJ/SNG/029',
    address: 'Rajasthan State Warehousing Corp, Mandi Yard Phase 2, Tonk Road, Sanganer, Jaipur, Rajasthan',
    district: 'Jaipur',
    pincode: '302029',
    capacityMt: 8000,
    availableMt: 2600,
    coldChambers: 2,
    intakeCrops: ['Wheat', 'Tomato', 'Green Chilli', 'Cluster Bean (Guar)'],
    lat: 26.8041,
    lng: 75.7725,
    manager: 'Devendra Rathore (+91 98291 55204)',
    status: 'WDRA Accredited & Inspected'
  },
  {
    id: 'wdra-alw-03',
    name: 'Alwar Agro Cold & Dry Hub (SWC)',
    code: 'WDRA-ALW-SWC-03',
    wdraRegNo: 'WDRA/RJ/ALW/018',
    address: 'RSWC Logistics Depot, Matsya Industrial Area, Delhi Road, Alwar, Rajasthan',
    district: 'Alwar',
    pincode: '301030',
    capacityMt: 15000,
    availableMt: 5100,
    coldChambers: 6,
    intakeCrops: ['Mustard', 'Onion', 'Bajra (Pearl Millet)', 'Wheat'],
    lat: 27.5530,
    lng: 76.6346,
    manager: 'Kailash Chand Meena (+91 97840 11983)',
    status: 'WDRA Accredited & Inspected'
  },
  {
    id: 'wdra-kta-04',
    name: 'Kota Grain & Pulse Terminal (CWC)',
    code: 'WDRA-KTA-CWC-04',
    wdraRegNo: 'WDRA/RJ/KTA/089',
    address: 'CWC Depository, Industrial Area Phase 1, Anantpura, Kota, Rajasthan',
    district: 'Kota',
    pincode: '324005',
    capacityMt: 22000,
    availableMt: 7800,
    coldChambers: 3,
    intakeCrops: ['Soybean', 'Paddy (Basmati)', 'Mustard', 'Gram (Chickpea)'],
    lat: 25.1800,
    lng: 75.8300,
    manager: 'Harishankar Gautam (+91 94142 88471)',
    status: 'WDRA Accredited & Inspected'
  },
  {
    id: 'wdra-jdh-05',
    name: 'Jodhpur Mandore Seed Hub (SWC)',
    code: 'WDRA-JDH-SWC-05',
    wdraRegNo: 'WDRA/RJ/JDH/031',
    address: 'SWC Complex, Krishi Upaj Mandi, Mandore Road, Jodhpur, Rajasthan',
    district: 'Jodhpur',
    pincode: '342007',
    capacityMt: 11000,
    availableMt: 3900,
    coldChambers: 3,
    intakeCrops: ['Cumin (Jeera)', 'Coriander', 'Isabgol', 'Guar'],
    lat: 26.2918,
    lng: 73.0169,
    manager: 'Pukhraj Choudhary (+91 98290 77391)',
    status: 'WDRA Accredited & Inspected'
  }
];

export const RAJASTHAN_AGRI_HUBS = {
  chomu: { name: 'Chomu Mandi Cluster', tehsil: 'Chomu', district: 'Jaipur', pincode: '303702', lat: 27.1654, lng: 75.7258 },
  phulera: { name: 'Phulera Mandi Cluster', tehsil: 'Phulera', district: 'Jaipur', pincode: '303338', lat: 26.8742, lng: 75.2415 },
  jaitpura: { name: 'Jaitpura Smallholder Hub', tehsil: 'Chomu', district: 'Jaipur', pincode: '303704', lat: 27.0210, lng: 75.5890 },
  sanganer: { name: 'Sanganer Agro Belt', tehsil: 'Sanganer', district: 'Jaipur', pincode: '302029', lat: 26.8041, lng: 75.7725 },
  bassi: { name: 'Bassi Organic Cluster', tehsil: 'Bassi', district: 'Jaipur', pincode: '303301', lat: 26.8338, lng: 76.0427 },
  kotputli: { name: 'Kotputli North Mandi', tehsil: 'Kotputli', district: 'Jaipur', pincode: '303108', lat: 27.7029, lng: 76.2008 },
  shahpura: { name: 'Shahpura Agro Gate', tehsil: 'Shahpura', district: 'Jaipur', pincode: '303103', lat: 27.3892, lng: 75.9592 },
  amber: { name: 'Amber Rural Valley', tehsil: 'Amber', district: 'Jaipur', pincode: '302028', lat: 26.9855, lng: 75.8513 },
  alwar: { name: 'Matsya Agro Cluster', tehsil: 'Alwar', district: 'Alwar', pincode: '301030', lat: 27.5530, lng: 76.6346 },
  kota: { name: 'Hadoti Agro Basin', tehsil: 'Ladpura', district: 'Kota', pincode: '324005', lat: 25.1800, lng: 75.8300 }
};

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 24.5; // fallback
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  // Apply 1.25 winding road coefficient for actual rural road distance
  return Number((straightLine * 1.25).toFixed(1));
}

export function getWdraWarehouses() {
  return WDRA_REGISTERED_WAREHOUSES;
}
`;

if (!content.includes('WDRA_REGISTERED_WAREHOUSES')) {
  content += additions;
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Appended WDRA warehouses and Haversine helper to dataSyncEngine.js');
} else {
  console.log('WDRA_REGISTERED_WAREHOUSES already present');
}
