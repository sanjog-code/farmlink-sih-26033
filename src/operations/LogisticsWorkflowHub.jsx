import React, { useState } from 'react';
import {
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  User,
  Phone,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Filter,
  Navigation,
  Thermometer,
  QrCode,
  FileText,
  X
} from 'lucide-react';

export const LOGISTICS_STAGES = [
  { id: 'ORDER_CREATED', label: '1. Order Created', desc: 'Buyer order placed / farmer lot ready', color: '#64748b' },
  { id: 'PICKUP_ASSIGNED', label: '2. Pickup Assigned', desc: 'Driver & vehicle allocated with GPS route', color: '#0284c7' },
  { id: 'FARM_COLLECTED', label: '3. Farm Collected', desc: 'Farmgate weighment & QR tagging done', color: '#d97706' },
  { id: 'WAREHOUSE_INTAKE', label: '4. Warehouse Intake', desc: 'WDRA hub assayed & stored/cross-docked', color: '#8b5cf6' },
  { id: 'OUT_FOR_DELIVERY', label: '5. Out for Delivery', desc: 'En route to buyer / consumer hub', color: '#f59e0b' },
  { id: 'DELIVERED', label: '6. Delivered', desc: 'Handshake OTP confirmed & payment settled', color: '#10b981' }
];

export const INITIAL_SHIPMENTS = [
  {
    id: 'SHP-8921',
    orderId: 'ORD-4029',
    crop: 'Mustard (सरसों)',
    quantityKg: 800,
    farmer: 'Ramesh Kumar',
    originCluster: 'Jaitpura Farm Cluster, Phulera',
    destinationWarehouse: 'Jaipur North WDRA Hub',
    finalDestination: 'Adani Wilmar Crushing Plant, Jaipur',
    status: 'ORDER_CREATED',
    assignedDriver: null,
    vehiclePlate: null,
    vehicleType: null,
    driverPhone: null,
    coldChain: false,
    eWayBill: 'EWB-290149012',
    etaMinutes: 45,
    distanceKm: 42,
    createdAt: '2026-03-24T06:30:00Z',
    history: [{ stage: 'ORDER_CREATED', timestamp: '2026-03-24T06:30:00Z', note: 'Order confirmed by buyer. Ready for fleet dispatch.' }]
  },
  {
    id: 'SHP-8922',
    orderId: 'ORD-4030',
    crop: 'Tomato (टमाटर Grade A)',
    quantityKg: 350,
    farmer: 'Suresh Patel',
    originCluster: 'Chomu Mandi Cluster, Jaipur',
    destinationWarehouse: 'Jaipur North Cold-Storage Silo',
    finalDestination: 'Reliance Fresh Distribution Center, Jaipur',
    status: 'PICKUP_ASSIGNED',
    assignedDriver: 'Mukesh Gurjar',
    vehiclePlate: 'RJ-14-CB-4012',
    vehicleType: 'Mahindra Bolero Reefer (Cold-Chain)',
    driverPhone: '+91 98290 44102',
    coldChain: true,
    telemetry: { temp: '11.8°C', humidity: '84%' },
    eWayBill: 'EWB-290149013',
    etaMinutes: 20,
    distanceKm: 28,
    createdAt: '2026-03-24T05:45:00Z',
    history: [
      { stage: 'ORDER_CREATED', timestamp: '2026-03-24T05:45:00Z', note: 'Order created.' },
      { stage: 'PICKUP_ASSIGNED', timestamp: '2026-03-24T06:15:00Z', note: 'Assigned to Mukesh Gurjar (Reefer RJ-14-CB-4012).' }
    ]
  },
  {
    id: 'SHP-8923',
    orderId: 'ORD-4028',
    crop: 'Wheat (गेहूं Sharbati)',
    quantityKg: 1200,
    farmer: 'Kailash Meena',
    originCluster: 'Bassi Rural Cluster, Dausa Road',
    destinationWarehouse: 'Sanganer Central Hub',
    finalDestination: 'Sanganer Central Hub',
    status: 'FARM_COLLECTED',
    assignedDriver: 'Rajesh Yadav',
    vehiclePlate: 'RJ-14-GA-8921',
    vehicleType: 'Eicher Pro 2049 (3.5T)',
    driverPhone: '+91 94140 88219',
    coldChain: false,
    eWayBill: 'EWB-290149010',
    etaMinutes: 35,
    distanceKm: 34,
    createdAt: '2026-03-24T04:15:00Z',
    history: [
      { stage: 'ORDER_CREATED', timestamp: '2026-03-24T04:15:00Z', note: 'Order confirmed.' },
      { stage: 'PICKUP_ASSIGNED', timestamp: '2026-03-24T04:45:00Z', note: 'Driver assigned.' },
      { stage: 'FARM_COLLECTED', timestamp: '2026-03-24T06:10:00Z', note: 'Farmgate weighment confirmed: 1,200 kg. QR Tag: LOT-WHT-8923.' }
    ]
  },
  {
    id: 'SHP-8920',
    orderId: 'ORD-4025',
    crop: 'Chickpea (चना Desi)',
    quantityKg: 500,
    farmer: 'Aman Sharma',
    originCluster: 'Phulera Mandi Cluster',
    destinationWarehouse: 'Jaipur North WDRA Hub',
    finalDestination: 'ITC Agro Sourcing Hub, Jaipur',
    status: 'WAREHOUSE_INTAKE',
    assignedDriver: 'Vikram Singh',
    vehiclePlate: 'RJ-32-EA-1904',
    vehicleType: 'Tata 407 LCV',
    driverPhone: '+91 97820 11984',
    coldChain: false,
    eWayBill: 'EWB-290149008',
    etaMinutes: 0,
    distanceKm: 48,
    createdAt: '2026-03-23T14:00:00Z',
    history: [
      { stage: 'ORDER_CREATED', timestamp: '2026-03-23T14:00:00Z', note: 'Order created.' },
      { stage: 'PICKUP_ASSIGNED', timestamp: '2026-03-23T14:30:00Z', note: 'Driver assigned.' },
      { stage: 'FARM_COLLECTED', timestamp: '2026-03-23T16:00:00Z', note: 'Farmgate collection complete.' },
      { stage: 'WAREHOUSE_INTAKE', timestamp: '2026-03-23T18:20:00Z', note: 'WDRA gate intake complete. Moisture assayed at 10.4%. e-NWR minted.' }
    ]
  },
  {
    id: 'SHP-8919',
    orderId: 'ORD-4022',
    crop: 'Mustard (सरसों)',
    quantityKg: 1500,
    farmer: 'Devendra Yadav',
    originCluster: 'Kotputli Cluster',
    destinationWarehouse: 'Jaipur North WDRA Hub',
    finalDestination: 'Bunge India Processing, Alwar Road',
    status: 'OUT_FOR_DELIVERY',
    assignedDriver: 'Om Prakash',
    vehiclePlate: 'RJ-02-GB-9912',
    vehicleType: 'Tata LPT 1109 (10T)',
    driverPhone: '+91 99280 77145',
    coldChain: false,
    eWayBill: 'EWB-290149004',
    etaMinutes: 25,
    distanceKm: 56,
    createdAt: '2026-03-23T09:00:00Z',
    history: [
      { stage: 'ORDER_CREATED', timestamp: '2026-03-23T09:00:00Z', note: 'Order created.' },
      { stage: 'PICKUP_ASSIGNED', timestamp: '2026-03-23T09:30:00Z', note: 'Driver assigned.' },
      { stage: 'FARM_COLLECTED', timestamp: '2026-03-23T11:45:00Z', note: 'Collected from farmgate.' },
      { stage: 'WAREHOUSE_INTAKE', timestamp: '2026-03-23T14:00:00Z', note: 'Stored in WDRA Silo 2.' },
      { stage: 'OUT_FOR_DELIVERY', timestamp: '2026-03-24T06:00:00Z', note: 'Dispatched for buyer delivery.' }
    ]
  },
  {
    id: 'SHP-8918',
    orderId: 'ORD-4019',
    crop: 'Tomato (टमाटर)',
    quantityKg: 600,
    farmer: 'Ramavtar Choudhary',
    originCluster: 'Chomu Mandi Cluster',
    destinationWarehouse: 'Jaipur North Cold Hub',
    finalDestination: 'BigBasket Regional Fulfillment Hub',
    status: 'DELIVERED',
    assignedDriver: 'Mukesh Gurjar',
    vehiclePlate: 'RJ-14-CB-4012',
    vehicleType: 'Mahindra Bolero Reefer',
    driverPhone: '+91 98290 44102',
    coldChain: true,
    telemetry: { temp: '11.5°C', humidity: '85%' },
    eWayBill: 'EWB-290149001',
    etaMinutes: 0,
    distanceKm: 32,
    createdAt: '2026-03-23T06:00:00Z',
    history: [
      { stage: 'ORDER_CREATED', timestamp: '2026-03-23T06:00:00Z', note: 'Order created.' },
      { stage: 'PICKUP_ASSIGNED', timestamp: '2026-03-23T06:30:00Z', note: 'Reefer truck assigned.' },
      { stage: 'FARM_COLLECTED', timestamp: '2026-03-23T08:00:00Z', note: 'Weighed & loaded.' },
      { stage: 'WAREHOUSE_INTAKE', timestamp: '2026-03-23T09:30:00Z', note: 'Quality graded A.' },
      { stage: 'OUT_FOR_DELIVERY', timestamp: '2026-03-23T11:00:00Z', note: 'Out for delivery.' },
      { stage: 'DELIVERED', timestamp: '2026-03-23T12:45:00Z', note: 'Handshake OTP 8492 verified. Payout released.' }
    ]
  }
];

export default function LogisticsWorkflowHub({ notify }) {
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [assigningShipment, setAssigningShipment] = useState(null);

  // Form state for assigning fleet
  const [assignForm, setAssignForm] = useState({
    driverName: 'Mukesh Gurjar',
    driverPhone: '+91 98290 44102',
    vehiclePlate: 'RJ-14-GA-8921',
    vehicleType: 'Mahindra Bolero Maxi Truck (1.7T)',
    estimatedMinutes: 35
  });

  // Calculate counts per stage
  const stageCounts = shipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const filteredShipments = shipments.filter((s) => {
    if (activeFilter === 'ALL') return true;
    return s.status === activeFilter;
  });

  // Advance shipment to the next sequential stage
  const advanceShipmentStage = (shipmentId) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;
        const currentIndex = LOGISTICS_STAGES.findIndex((st) => st.id === s.status);
        if (currentIndex < LOGISTICS_STAGES.length - 1) {
          const nextStage = LOGISTICS_STAGES[currentIndex + 1];
          const newHistory = [
            ...s.history,
            {
              stage: nextStage.id,
              timestamp: new Date().toISOString(),
              note: `Stage advanced to ${nextStage.label} by Logistics Controller.`
            }
          ];
          notify?.(`Shipment ${s.id} updated to ${nextStage.label}.`);
          return {
            ...s,
            status: nextStage.id,
            history: newHistory
          };
        }
        return s;
      })
    );
  };

  const handleAssignFleetSubmit = (e) => {
    e.preventDefault();
    if (!assigningShipment) return;

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id !== assigningShipment.id) return s;
        const newHistory = [
          ...s.history,
          {
            stage: 'PICKUP_ASSIGNED',
            timestamp: new Date().toISOString(),
            note: `Vehicle ${assignForm.vehiclePlate} (${assignForm.vehicleType}) and Driver ${assignForm.driverName} assigned.`
          }
        ];
        return {
          ...s,
          status: 'PICKUP_ASSIGNED',
          assignedDriver: assignForm.driverName,
          driverPhone: assignForm.driverPhone,
          vehiclePlate: assignForm.vehiclePlate,
          vehicleType: assignForm.vehicleType,
          etaMinutes: assignForm.estimatedMinutes,
          history: newHistory
        };
      })
    );

    notify?.(`Fleet assigned to shipment ${assigningShipment.id}: Driver ${assignForm.driverName} (${assignForm.vehiclePlate}).`);
    setAssigningShipment(null);
  };

  return (
    <div className="logistics-hub-container" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', margin: '20px 0', boxShadow: 'var(--shadow-sm)' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '18px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700 }}>
              <Truck size={14} /> END-TO-END FLEET &amp; LOGISTICS COMMAND
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              GPS Route Optimization · Farmgate Assay · WDRA Handoff
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)', fontWeight: 800 }}>
            Order ➔ Pickup ➔ Collection ➔ Warehouse ➔ Delivery Pipeline
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active Fleet: <b>14 Vehicles Dispatched</b>
          </span>
        </div>
      </div>

      {/* Sequential 5-Stage Stepper Bar */}
      <div style={{ marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '780px', gap: '8px' }}>
          {LOGISTICS_STAGES.map((stage, idx) => {
            const count = stageCounts[stage.id] || 0;
            const isSelected = activeFilter === stage.id;
            return (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  onClick={() => setActiveFilter(isSelected ? 'ALL' : stage.id)}
                  style={{
                    flex: 1,
                    background: isSelected ? 'var(--primary)' : 'var(--surface-raised)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '12px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isSelected ? '#fff' : stage.color }}>
                      STAGE {idx + 1}
                    </span>
                    <span style={{
                      background: isSelected ? '#fff' : 'var(--surface)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      border: '1px solid var(--border)'
                    }}>
                      {count}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#fff' : 'var(--text-main)' }}>
                    {stage.label.split('. ')[1]}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2' }}>
                    {stage.desc}
                  </div>
                </button>
                {idx < LOGISTICS_STAGES.length - 1 && (
                  <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={activeFilter === 'ALL' ? 'primary' : 'secondary'}
            style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: '8px' }}
            onClick={() => setActiveFilter('ALL')}
          >
            All Shipments ({shipments.length})
          </button>
          {LOGISTICS_STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={activeFilter === s.id ? 'primary' : 'secondary'}
              style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: '8px' }}
              onClick={() => setActiveFilter(s.id)}
            >
              {s.label.split('. ')[1]} ({stageCounts[s.id] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Active Shipments Cards Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredShipments.map((shipment) => {
          const currentStageIndex = LOGISTICS_STAGES.findIndex((st) => st.id === shipment.status);
          const currentStage = LOGISTICS_STAGES[currentStageIndex] || LOGISTICS_STAGES[0];
          const nextStage = LOGISTICS_STAGES[currentStageIndex + 1];

          return (
            <div
              key={shipment.id}
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 20px',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'var(--surface)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {shipment.id}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        ({shipment.orderId})
                      </span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: `${currentStage.color}20`,
                          color: currentStage.color,
                          border: `1px solid ${currentStage.color}40`
                        }}
                      >
                        ● {currentStage.label}
                      </span>
                      {shipment.coldChain && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '2px 7px', borderRadius: '9999px', fontWeight: 700 }}>
                          <Thermometer size={12} /> Cold-Chain Reefer
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                      {shipment.crop} · <b>{shipment.quantityKg} kg</b> · Farmer: <b>{shipment.farmer}</b>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {shipment.status === 'ORDER_CREATED' && (
                    <button
                      type="button"
                      className="primary"
                      style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: '8px' }}
                      onClick={() => setAssigningShipment(shipment)}
                    >
                      Assign Fleet / Driver ➔
                    </button>
                  )}

                  {shipment.status !== 'ORDER_CREATED' && shipment.status !== 'DELIVERED' && nextStage && (
                    <button
                      type="button"
                      className="primary"
                      style={{ fontSize: '0.82rem', padding: '7px 14px', borderRadius: '8px' }}
                      onClick={() => advanceShipmentStage(shipment.id)}
                    >
                      Mark {nextStage.label.split('. ')[1]} ➔
                    </button>
                  )}

                  {shipment.status === 'DELIVERED' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', padding: '6px 12px', borderRadius: '8px' }}>
                      <CheckCircle2 size={16} /> Delivery Fulfilled &amp; Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Line */}
              <div style={{ margin: '14px 0', background: 'var(--border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((currentStageIndex + 1) / LOGISTICS_STAGES.length) * 100}%`,
                    background: currentStage.color,
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              {/* Routing & Driver Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Origin</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>{shipment.originCluster}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Intake Warehouse</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>{shipment.destinationWarehouse}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Final Delivery Destination</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>{shipment.finalDestination}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Vehicle &amp; Driver</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
                    {shipment.assignedDriver ? (
                      <span>{shipment.assignedDriver} ({shipment.vehiclePlate}) · {shipment.driverPhone}</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>Pending Allocation</span>
                    )}
                  </div>
                </div>
                {shipment.telemetry && (
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Cold-Chain Telemetry</div>
                    <div style={{ color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
                      Temp: {shipment.telemetry.temp} · Humidity: {shipment.telemetry.humidity}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>e-Way Bill &amp; Tracking</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
                    {shipment.eWayBill} · {shipment.distanceKm} km
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fleet Assignment Modal */}
      {assigningShipment && (
        <div className="modal-back">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <button className="close" onClick={() => setAssigningShipment(null)} aria-label="Close">
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Truck size={22} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Assign Fleet &amp; Driver</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Allocating vehicle for shipment <b>{assigningShipment.id}</b> ({assigningShipment.crop} · {assigningShipment.quantityKg} kg from {assigningShipment.originCluster}).
            </p>

            <form onSubmit={handleAssignFleetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Driver Name:</span>
                <select
                  value={assignForm.driverName}
                  onChange={(e) => {
                    const name = e.target.value;
                    const phone = name.includes('Mukesh') ? '+91 98290 44102' : name.includes('Rajesh') ? '+91 94140 88219' : '+91 97820 11984';
                    setAssignForm({ ...assignForm, driverName: name, driverPhone: phone });
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                >
                  <option value="Mukesh Gurjar">Mukesh Gurjar (Verified Cluster Driver · 4.9★)</option>
                  <option value="Rajesh Yadav">Rajesh Yadav (Heavy LCV Driver · 4.8★)</option>
                  <option value="Vikram Singh">Vikram Singh (Reefer Cold-Chain Specialist · 5.0★)</option>
                </select>
              </label>

              <label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Driver Contact Phone:</span>
                <input
                  type="text"
                  value={assignForm.driverPhone}
                  onChange={(e) => setAssignForm({ ...assignForm, driverPhone: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </label>

              <label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Vehicle &amp; Registration:</span>
                <select
                  value={assignForm.vehiclePlate}
                  onChange={(e) => {
                    const plate = e.target.value;
                    const type = plate.includes('GA-8921')
                      ? 'Mahindra Bolero Maxi Truck (1.7T)'
                      : plate.includes('CB-4012')
                      ? 'Mahindra Bolero Reefer (Cold-Chain)'
                      : 'Eicher Pro 2049 (3.5T)';
                    setAssignForm({ ...assignForm, vehiclePlate: plate, vehicleType: type });
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                >
                  <option value="RJ-14-GA-8921">RJ-14-GA-8921 (Mahindra Bolero Maxi Truck · 1.7T)</option>
                  <option value="RJ-14-CB-4012">RJ-14-CB-4012 (Mahindra Bolero Reefer · Cold-Chain)</option>
                  <option value="RJ-32-EA-1904">RJ-32-EA-1904 (Eicher Pro 2049 · 3.5T)</option>
                </select>
              </label>

              <label>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Estimated Farmgate ETA (Minutes):</span>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={assignForm.estimatedMinutes}
                  onChange={(e) => setAssignForm({ ...assignForm, estimatedMinutes: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="primary" style={{ flex: 1, padding: '10px' }}>
                  Confirm Assignment &amp; Dispatch GPS Route
                </button>
                <button type="button" className="secondary" onClick={() => setAssigningShipment(null)} style={{ padding: '10px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
