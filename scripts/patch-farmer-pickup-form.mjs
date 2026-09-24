import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state hooks for pickupAddress, pickupTehsil, targetWarehouse
const oldHooks = `    [pickupCluster, setPickupCluster] = useState("Jaipur North cluster"),
    [pickupDate, setPickupDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10)),`;

const newHooks = `    [pickupCluster, setPickupCluster] = useState("Jaipur North cluster"),
    [pickupDate, setPickupDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10)),
    [pickupAddress, setPickupAddress] = useState("Khasra 214, Ward 3, Mandi Link Road"),
    [pickupTehsil, setPickupTehsil] = useState("chomu"),
    [targetWarehouse, setTargetWarehouse] = useState("Jaipur North WDRA Hub (CWC)"),`;

if (content.includes(oldHooks)) {
  content = content.replace(oldHooks, newHooks);
  console.log('Successfully updated FarmerOperations pickup state hooks');
}

// 2. Update the scheduler form in FarmerOperations
const oldSchedulerForm = `                    <div className="listing-pickup-scheduler" style={{ marginTop: "6px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Truck size={15} color="var(--primary)" />
                        Schedule Doorstep Pickup &amp; Smart Weighment
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginBottom: "10px" }}>
                        <label style={{ fontSize: "0.76rem" }}>
                          Collection Cluster
                          <select
                            value={pickupCluster}
                            onChange={(e) => setPickupCluster(e.target.value)}
                            style={{ padding: "4px 8px", fontSize: "0.8rem", width: "100%", marginTop: "3px" }}
                          >
                            <option>Jaipur North cluster</option>
                            <option>Sanganer cluster</option>
                            <option>Village / FPO pickup point</option>
                          </select>
                        </label>
                        <label style={{ fontSize: "0.76rem" }}>
                          Preferred Pickup Date
                          <input
                            type="date"
                            min={new Date().toISOString().slice(0, 10)}
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            style={{ padding: "4px 8px", fontSize: "0.8rem", width: "100%", marginTop: "3px" }}
                          />
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="primary"
                          style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                          onClick={() => {
                            const newPickup = scheduleFarmPickup({
                              lotId: item.id,
                              crop: item.crop,
                              qty: item.quantity_kg || item.qty || 100,
                              farmer: session?.name || farmerVerification?.farmerName || "Verified Farmer",
                              cluster: pickupCluster,
                              date: pickupDate
                            });
                            if (newPickup) setPickupSchedules(newPickup);
                            setSchedulingId(null);
                            notify(\`Doorstep collection scheduled for \${item.crop} on \${pickupDate} at \${pickupCluster}. Dispatch confirmed.\`);
                          }}
                        >
                          Confirm Pickup Request
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                          onClick={() => setSchedulingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>`;

const newSchedulerForm = `                    <div className="listing-pickup-scheduler" style={{ marginTop: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px" }}>
                      <div style={{ fontWeight: 800, fontSize: "0.85rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)" }}>
                        <Truck size={16} color="var(--primary)" />
                        Schedule Verified Farmgate Pickup &amp; WDRA Intake
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "10px" }}>
                        <label style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                          Tehsil / Cluster Waypoint:
                          <select
                            value={pickupTehsil}
                            onChange={(e) => {
                              setPickupTehsil(e.target.value);
                              setPickupCluster(RAJASTHAN_AGRI_HUBS[e.target.value]?.name || e.target.value);
                            }}
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "100%", marginTop: "3px", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            {Object.entries(RAJASTHAN_AGRI_HUBS).map(([key, h]) => (
                              <option key={key} value={key}>
                                {h.name} ({h.tehsil}, {h.district} - PIN {h.pincode})
                              </option>
                            ))}
                          </select>
                        </label>

                        <label style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                          Destination WDRA Registered Warehouse:
                          <select
                            value={targetWarehouse}
                            onChange={(e) => setTargetWarehouse(e.target.value)}
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "100%", marginTop: "3px", borderRadius: "6px", border: "1px solid var(--border)" }}
                          >
                            {WDRA_REGISTERED_WAREHOUSES.map((wh) => (
                              <option key={wh.id} value={wh.name}>
                                {wh.name} ({wh.wdraRegNo}) · {wh.district}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "10px", marginBottom: "12px" }}>
                        <label style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                          Farmgate Field / Khasra Street Address:
                          <input
                            type="text"
                            value={pickupAddress}
                            onChange={(e) => setPickupAddress(e.target.value)}
                            placeholder="e.g. Khasra 412/18, Ward 4, Radhaswami Mandir Road"
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "100%", marginTop: "3px", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </label>

                        <label style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                          Preferred Pickup Date:
                          <input
                            type="date"
                            min={new Date().toISOString().slice(0, 10)}
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            style={{ padding: "6px 8px", fontSize: "0.8rem", width: "100%", marginTop: "3px", borderRadius: "6px", border: "1px solid var(--border)" }}
                          />
                        </label>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="primary"
                          style={{ padding: "6px 14px", fontSize: "0.82rem", fontWeight: 700 }}
                          onClick={() => {
                            const hub = RAJASTHAN_AGRI_HUBS[pickupTehsil] || RAJASTHAN_AGRI_HUBS.chomu;
                            const newPickup = scheduleFarmPickup({
                              lotId: item.id,
                              crop: item.crop,
                              qty: item.quantity_kg || item.qty || 100,
                              farmer: session?.name || farmerVerification?.farmerName || "Verified Producer",
                              farmAddress: pickupAddress,
                              village: hub.tehsil,
                              district: hub.district,
                              pincode: hub.pincode,
                              cluster: hub.name,
                              hubKey: pickupTehsil,
                              date: pickupDate,
                              lat: hub.lat,
                              lng: hub.lng,
                              targetWarehouse: targetWarehouse
                            });
                            if (newPickup) setPickupSchedules(newPickup);
                            setSchedulingId(null);
                            notify(\`Doorstep pickup scheduled for \${item.crop} at \${pickupAddress}, \${hub.name} (Destination: \${targetWarehouse}). Dispatch confirmed.\`);
                          }}
                        >
                          Confirm Farmgate Pickup &amp; Dispatch Fleet
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                          onClick={() => setSchedulingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>`;

if (content.includes(oldSchedulerForm)) {
  content = content.replace(oldSchedulerForm, newSchedulerForm);
  console.log('Successfully updated FarmerOperations scheduler form with proper address & WDRA warehouse');
} else {
  console.warn('Could not locate oldSchedulerForm in main.jsx');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Finished patch-farmer-pickup-form.mjs');
