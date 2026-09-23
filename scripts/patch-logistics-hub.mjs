import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/operations/LogisticsWorkflowHub.jsx');

const code = `import React, { useState, useEffect } from 'react';
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
import {
  getShipments,
  addShipment,
  updateShipmentStage,
  updateShipmentFleet,
  subscribeToSync
} from '../lib/dataSyncEngine';

export const LOGISTICS_STAGES = [
  { id: 'ORDER_CREATED', label: '1. Order Created', desc: 'Buyer order placed / farmer lot ready', color: '#64748b' },
  { id: 'PICKUP_ASSIGNED', label: '2. Pickup Assigned', desc: 'Driver & vehicle allocated with GPS route', color: '#0284c7' },
  { id: 'FARM_COLLECTED', label: '3. Farm Collected', desc: 'Farmgate weighment & QR tagging done', color: '#d97706' },
  { id: 'WAREHOUSE_INTAKE', label: '4. Warehouse Intake', desc: 'WDRA hub assayed & stored/cross-docked', color: '#8b5cf6' },
  { id: 'OUT_FOR_DELIVERY', label: '5. Out for Delivery', desc: 'En route to buyer / consumer hub', color: '#f59e0b' },
  { id: 'DELIVERED', label: '6. Delivered', desc: 'Handshake OTP confirmed & payment settled', color: '#10b981' }
];

export const INITIAL_SHIPMENTS = [];

export default function LogisticsWorkflowHub({ notify }) {
  const [shipments, setShipments] = useState(() => getShipments());
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [newShipment, setNewShipment] = useState({
    crop: 'Mustard (सरसों)',
    quantityKg: '500',
    farmer: 'Verified Producer Cluster',
    originCluster: 'Jaipur North Mandi Cluster',
    destinationWarehouse: 'Jaipur North WDRA Hub',
    finalDestination: 'Consumer Distribution Center',
    coldChain: false
  });

  useEffect(() => {
    const unsub = subscribeToSync(() => {
      setShipments(getShipments());
    });
    return unsub;
  }, []);

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
    const s = shipments.find((item) => item.id === shipmentId);
    if (!s) return;
    const currentIndex = LOGISTICS_STAGES.findIndex((st) => st.id === s.status);
    if (currentIndex < LOGISTICS_STAGES.length - 1) {
      const nextStage = LOGISTICS_STAGES[currentIndex + 1];
      const note = \`Stage advanced to \${nextStage.label} by Logistics Controller.\`;
      const updated = updateShipmentStage(shipmentId, nextStage.id, note);
      setShipments(updated);
      notify?.(\`Shipment \${shipmentId} updated to \${nextStage.label}.\`);
    }
  };

  const handleAssignFleetSubmit = (e) => {
    e.preventDefault();
    if (!assigningShipment) return;

    const updated = updateShipmentFleet(assigningShipment.id, assignForm);
    setShipments(updated);
    notify?.(\`Fleet assigned to shipment \${assigningShipment.id}: Driver \${assignForm.driverName} (\${assignForm.vehiclePlate}).\`);
    setAssigningShipment(null);
  };

  const handleCreateShipmentSubmit = (e) => {
    e.preventDefault();
    const created = addShipment({
      ...newShipment,
      quantityKg: Number(newShipment.quantityKg) || 100
    });
    setShipments(getShipments());
    setIsCreatingShipment(false);
    notify?.(\`New shipment \${created.id} registered & dispatched to logistics ledger.\`);
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active Shipments: <b>{shipments.length}</b>
          </span>
          <button
            type="button"
            className="primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '8px 16px', borderRadius: '8px', fontWeight: 700 }}
            onClick={() => setIsCreatingShipment(true)}
          >
            <Plus size={16} /> Dispatch Shipment
          </button>
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
                    border: \`1px solid \${isSelected ? 'var(--primary)' : 'var(--border)'}\`,
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

      {/* Active Shipments Cards List / Zero-State */}
      {filteredShipments.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--surface-raised)', borderRadius: '12px', border: '1px dashed var(--border)', margin: '10px 0' }}>
          <Truck size={38} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
          <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700 }}>
            No Active Shipments in this Stage
          </h4>
          <p style={{ margin: '0 auto 18px', color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '520px' }}>
            Shipments are dynamically generated when consumer orders are placed, when farmers schedule doorstep farmgate pickups, or when dispatched directly by logistics controllers.
          </p>
          <button
            type="button"
            className="primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '8px 16px', borderRadius: '8px' }}
            onClick={() => setIsCreatingShipment(true)}
          >
            <Plus size={16} /> Dispatch New Shipment
          </button>
        </div>
      ) : (
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
                        {shipment.orderId && (
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            ({shipment.orderId})
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: \`\${currentStage.color}20\`,
                            color: currentStage.color,
                            border: \`1px solid \${currentStage.color}40\`
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
                        <CheckCircle2 size={16} /> Delivery Fulfilled &amp; Settled
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Line */}
                <div style={{ margin: '14px 0', background: 'var(--border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: \`\${((currentStageIndex + 1) / LOGISTICS_STAGES.length) * 100}%\`,
                      background: currentStage.color,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>

                {/* Routing & Driver Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Pickup Origin</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>{shipment.originCluster || 'Jaipur Cluster'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Intake Warehouse</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>{shipment.destinationWarehouse || 'Jaipur North WDRA Hub'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Final Delivery Destination</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>{shipment.finalDestination || 'Distribution Center'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Vehicle &amp; Driver</div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
                      {shipment.assignedDriver ? (
                        <span>{shipment.assignedDriver} ({shipment.vehiclePlate || 'RJ-14-GA-8921'})</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>Pending Allocation</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dispatch New Shipment Modal */}
      {isCreatingShipment && (
        <div className="modal-back">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <button className="close" onClick={() => setIsCreatingShipment(false)} aria-label="Close">
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Truck size={22} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Dispatch Logistics Shipment</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Register and schedule an intra-state agri-commodity dispatch from farmgate to WDRA intake warehouse.
            </p>

            <form onSubmit={handleCreateShipmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Commodity / Crop:</label>
                <input
                  type="text"
                  required
                  value={newShipment.crop}
                  onChange={(e) => setNewShipment({ ...newShipment, crop: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Quantity (kg):</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={newShipment.quantityKg}
                    onChange={(e) => setNewShipment({ ...newShipment, quantityKg: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Farmer / Producer Name:</label>
                  <input
                    type="text"
                    required
                    value={newShipment.farmer}
                    onChange={(e) => setNewShipment({ ...newShipment, farmer: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Pickup Origin Cluster:</label>
                <input
                  type="text"
                  required
                  value={newShipment.originCluster}
                  onChange={(e) => setNewShipment({ ...newShipment, originCluster: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Intake Warehouse (WDRA):</label>
                <input
                  type="text"
                  required
                  value={newShipment.destinationWarehouse}
                  onChange={(e) => setNewShipment({ ...newShipment, destinationWarehouse: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Final Delivery Destination:</label>
                <input
                  type="text"
                  required
                  value={newShipment.finalDestination}
                  onChange={(e) => setNewShipment({ ...newShipment, finalDestination: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={newShipment.coldChain}
                  onChange={(e) => setNewShipment({ ...newShipment, coldChain: e.target.checked })}
                />
                Require Cold-Chain Temperature Controlled Reefer
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="submit" className="primary" style={{ flex: 1, padding: '10px' }}>
                  Register &amp; Dispatch Shipment
                </button>
                <button type="button" className="secondary" onClick={() => setIsCreatingShipment(false)} style={{ padding: '10px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
`;

fs.writeFileSync(filePath, code, 'utf-8');
console.log('Successfully updated LogisticsWorkflowHub.jsx');
