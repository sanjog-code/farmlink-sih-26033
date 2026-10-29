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
      status: 'Pickup request recorded for review',
      driver: 'Not assigned',
      gradingStatus: 'No grading decision has been made'
    };
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(parsed));

    // Also add to logistics shipments
    addShipment({
      id: `SHP-PICKUP-${pickupData.lotId}`,
      crop: pickupData.crop,
      quantityKg: pickupData.qty || 100,
      farmer: pickupData.farmer || 'Verified Farmer',
      originCluster: pickupData.cluster,
    destinationWarehouse: 'Demo warehouse',
      finalDestination: 'Warehouse Intake Hub',
    status: 'PICKUP_REQUESTED',
    assignedDriver: null,
    coldChain: false
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

// ─── 7. DEMONSTRATION WAREHOUSES ───────────────────────────────────────────
// No production registration, address, manager, capacity or accreditation data
// belongs in the browser bundle. Production data is supplied by the verified API.
export const WDRA_REGISTERED_WAREHOUSES = [
  {
    id: 'demo-warehouse-a',
    name: 'Demonstration warehouse A',
    code: 'DEMO-WH-A',
    wdraRegNo: 'Not verified',
    address: 'Location withheld in demonstration mode',
    district: 'Demo region',
    capacityMt: null,
    availableMt: null,
    coldChambers: null,
    intakeCrops: [],
    lat: null,
    lng: null,
    manager: 'Not assigned',
    status: 'Demonstration only'
  },
  {
    id: 'demo-warehouse-b',
    name: 'Demonstration warehouse B',
    code: 'DEMO-WH-B',
    wdraRegNo: 'Not verified',
    address: 'Location withheld in demonstration mode',
    district: 'Demo region',
    capacityMt: null,
    availableMt: null,
    coldChambers: null,
    intakeCrops: [],
    lat: null,
    lng: null,
    manager: 'Not assigned',
    status: 'Demonstration only'
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
