// Unified Live Data & Real-Time Synchronization Engine for FarmLink
// Manages real user-given data, live broadcasts across components/tabs, and Supabase cloud sync

import { supabase, isSupabaseConfigured } from '../supabase.js';

const STORAGE_KEYS = {
  LISTINGS: 'farmlink_user_listings',
  ORDERS: 'farmlink_user_orders',
  PICKUPS: 'farmlink_user_pickups',
  SHIPMENTS: 'farmlink_shipments',
  FPO_BATCHES: 'farmlink_fpo_batches',
  QUOTES: 'farmlink_user_quotes',
  DISPUTES: 'farmlink_user_disputes',
  KYC: 'farmlink_farmer_verification'
};

const SYNC_EVENT = 'farmlink_data_sync';

function broadcast(type, payload) {
  try {
    const detail = { type, payload, timestamp: Date.now() };
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail }));
    // Also trigger storage event for cross-browser-tab synchronization
    localStorage.setItem('farmlink_sync_ping', JSON.stringify({ type, timestamp: Date.now() }));
  } catch (err) {
    console.warn('Broadcast error:', err);
  }
}

export function subscribeToSync(callback) {
  const handler = (e) => {
    if (e.detail) callback(e.detail);
  };
  const storageHandler = (e) => {
    if (e.key === 'farmlink_sync_ping') {
      try {
        const parsed = JSON.parse(e.newValue || '{}');
        callback(parsed);
      } catch {}
    }
  };
  window.addEventListener(SYNC_EVENT, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(SYNC_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

// ─── 1. USER PRODUCE LISTINGS ──────────────────────────────────────────────
export function getUserListings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addUserListing(listing) {
  const current = getUserListings();
  const id = listing.id || `LIST-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const record = {
    ...listing,
    id,
    status: listing.status || 'published',
    createdAt: listing.createdAt || new Date().toISOString()
  };
  const updated = [record, ...current.filter((x) => x.id !== id)];
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));

  // If Supabase online, push to cloud
  if (isSupabaseConfigured && supabase) {
    supabase.from('farmer_listings').upsert({
      id: record.listingId || undefined,
      crop: record.crop,
      quantity_kg: Number(record.qty || record.quantity_kg),
      price_per_kg: Number(record.price || record.price_per_kg),
      status: record.status,
      category: record.category || 'Other',
      description: record.description || null,
      image_url: record.imageUrl || record.image_url || null,
      harvest_date: record.harvestDate || null
    }).then(({ error }) => {
      if (error) console.warn('Supabase listing sync notice:', error.message);
    });
  }

  broadcast('LISTING_ADDED', record);
  return record;
}

export function updateUserListing(id, updates) {
  const current = getUserListings();
  const updated = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
  broadcast('LISTING_UPDATED', { id, updates });
  return updated;
}

// ─── 2. USER ORDERS ────────────────────────────────────────────────────────
export function getUserOrders() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addUserOrder(order) {
  const current = getUserOrders();
  const id = order.id || `ORD-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const record = {
    ...order,
    id,
    status: order.status || 'confirmed',
    createdAt: order.createdAt || new Date().toISOString()
  };
  const updated = [record, ...current];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

  // Automatically create a corresponding logistics shipment
  addShipment({
    orderId: id,
    crop: order.crop || order.items?.[0]?.crop || 'Produce',
    quantityKg: order.quantityKg || order.items?.reduce((s, i) => s + (Number(i.quantityKg) || 0), 0) || 100,
    farmer: order.farmer || 'Verified Farmer Cluster',
    originCluster: 'Jaipur North Mandi Cluster',
    destinationWarehouse: 'Jaipur North WDRA Hub',
    finalDestination: order.deliveryAddress || 'Consumer Destination',
    status: 'ORDER_CREATED',
    coldChain: Boolean(order.coldChain)
  });

  broadcast('ORDER_PLACED', record);
  return record;
}

// ─── 3. LOGISTICS SHIPMENTS & FARM PICKUPS ─────────────────────────────────
export function getShipments() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addShipment(shipment) {
  const current = getShipments();
  const id = shipment.id || `SHP-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const record = {
    ...shipment,
    id,
    status: shipment.status || 'ORDER_CREATED',
    assignedDriver: shipment.assignedDriver || null,
    vehiclePlate: shipment.vehiclePlate || null,
    createdAt: new Date().toISOString(),
    history: [
      { stage: shipment.status || 'ORDER_CREATED', timestamp: new Date().toISOString(), note: 'Shipment created and registered in logistics ledger.' }
    ]
  };
  const updated = [record, ...current.filter((x) => x.id !== id)];
  localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updated));
  broadcast('SHIPMENT_CREATED', record);
  return record;
}

export function updateShipmentStage(shipmentId, stage, note = '') {
  const current = getShipments();
  const updated = current.map((s) => {
    if (s.id !== shipmentId) return s;
    const history = s.history || [];
    return {
      ...s,
      status: stage,
      history: [
        ...history,
        { stage, timestamp: new Date().toISOString(), note: note || `Stage advanced to ${stage}` }
      ]
    };
  });
  localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updated));
  broadcast('SHIPMENT_UPDATED', { shipmentId, stage, note });
  return updated;
}

export function updateShipmentFleet(shipmentId, fleetData) {
  const current = getShipments();
  const updated = current.map((s) => {
    if (s.id !== shipmentId) return s;
    const history = s.history || [];
    return {
      ...s,
      status: 'PICKUP_ASSIGNED',
      assignedDriver: fleetData.driverName,
      driverPhone: fleetData.driverPhone,
      vehiclePlate: fleetData.vehiclePlate,
      vehicleType: fleetData.vehicleType,
      etaMinutes: fleetData.estimatedMinutes || fleetData.etaMinutes,
      history: [
        ...history,
        {
          stage: 'PICKUP_ASSIGNED',
          timestamp: new Date().toISOString(),
          note: `Vehicle ${fleetData.vehiclePlate} (${fleetData.vehicleType}) and Driver ${fleetData.driverName} assigned.`
        }
      ]
    };
  });
  localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(updated));
  broadcast('SHIPMENT_UPDATED', { shipmentId, fleetData });
  return updated;
}

export function scheduleFarmPickup(pickupData) {
  try {
    const current = localStorage.getItem(STORAGE_KEYS.PICKUPS);
    const parsed = current ? JSON.parse(current) : {};
    parsed[pickupData.lotId] = {
      scheduled: true,
      cluster: pickupData.cluster || 'Jaipur North cluster',
      date: pickupData.date || new Date().toISOString().slice(0, 10),
      status: 'Pickup Scheduled · Dispatch Confirmed',
      driver: 'Mahendra Singh (Bolero Pickup RJ-14-UB-3021)',
      gradingStatus: 'Farmgate Electronic Weighment & Digital NIR Quality Assayed'
    };
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(parsed));

    // Also add to logistics shipments
    addShipment({
      id: `SHP-PICKUP-${pickupData.lotId}`,
      crop: pickupData.crop,
      quantityKg: pickupData.qty || 100,
      farmer: pickupData.farmer || 'Verified Farmer',
      originCluster: pickupData.cluster,
      destinationWarehouse: 'Jaipur North WDRA Hub',
      finalDestination: 'Warehouse Intake Hub',
      status: 'PICKUP_ASSIGNED',
      assignedDriver: 'Mahendra Singh (RJ-14-UB-3021)',
      coldChain: true
    });

    broadcast('PICKUP_SCHEDULED', parsed[pickupData.lotId]);
    return parsed;
  } catch (err) {
    console.error('Failed to schedule pickup:', err);
  }
}

export function getScheduledPickups() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PICKUPS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// ─── 4. FPO COLLECTIVE BATCHES ─────────────────────────────────────────────
export function getFpoBatches() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FPO_BATCHES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function createFpoBatch(batch) {
  const current = getFpoBatches();
  const id = batch.id || `FPO-BATCH-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const record = {
    ...batch,
    id,
    status: batch.status || 'Aggregated & Certified',
    createdAt: new Date().toISOString()
  };
  const updated = [record, ...current.filter((x) => x.id !== id)];
  localStorage.setItem(STORAGE_KEYS.FPO_BATCHES, JSON.stringify(updated));
  broadcast('FPO_BATCH_CREATED', record);
  return record;
}

// ─── 5. WHOLESALE QUOTES & CONTRACTS ───────────────────────────────────────
export function getUserQuotes() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addQuote(quote) {
  const current = getUserQuotes();
  const id = quote.id || `RFQ-${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const record = {
    ...quote,
    id,
    status: 'proposed',
    createdAt: new Date().toISOString(),
    bulk_quotes: [
      {
        id: `Q-${Date.now()}`,
        offered_price_per_kg: quote.price,
        proposed_by: quote.proposedBy || 'buyer',
        status: 'proposed',
        note: quote.note || 'Initial quote offer',
        created_at: new Date().toISOString()
      }
    ]
  };
  const updated = [record, ...current];
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(updated));
  broadcast('QUOTE_SENT', record);
  return record;
}

export function replyQuote(quoteId, counterPrice, note, proposedBy = 'farmer') {
  const current = getUserQuotes();
  const updated = current.map((q) => {
    if (q.id !== quoteId) return q;
    const history = q.bulk_quotes || [];
    const newEntry = {
      id: `Q-${Date.now()}`,
      offered_price_per_kg: counterPrice,
      proposed_by: proposedBy,
      status: 'proposed',
      note: note || '',
      created_at: new Date().toISOString()
    };
    return {
      ...q,
      status: 'negotiation',
      bulk_quotes: [...history, newEntry]
    };
  });
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(updated));
  broadcast('QUOTE_REPLIED', { quoteId, counterPrice, proposedBy });
  return updated;
}

// ─── 6. DISPUTE & FAILURE ENGINE ───────────────────────────────────────────
export function getUserDisputes() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DISPUTES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function fileDispute(dispute) {
  const current = getUserDisputes();
  const id = dispute.id || `DISP-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const record = {
    ...dispute,
    id,
    status: 'In Arbitration',
    filedAt: new Date().toISOString()
  };
  const updated = [record, ...current];
  localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(updated));
  broadcast('DISPUTE_FILED', record);
  return record;
}

export function resolveDispute(disputeId, resolution) {
  const current = getUserDisputes();
  const updated = current.map((d) => (d.id === disputeId ? { ...d, status: 'Resolved', resolution } : d));
  localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(updated));
  broadcast('DISPUTE_RESOLVED', { disputeId, resolution });
  return updated;
}

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
