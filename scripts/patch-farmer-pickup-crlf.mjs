import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');
const isCRLF = content.includes('\r\n');
if (isCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

const targetStart = '                  {schedulingId === item.id && (\n                    <div className="listing-pickup-scheduler" style={{ marginTop: "6px" }}>';
const targetEnd = '                      <div style={{ display: "flex", gap: "8px" }}>\n                        <button\n                          type="button"\n                          className="primary"';

const idx1 = content.indexOf(targetStart);
const idx2 = content.indexOf(targetEnd, idx1);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = `                  {schedulingId === item.id && (
                    <div className="listing-pickup-scheduler" style={{ marginTop: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px" }}>
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
                      </div>`;

  // Also replace the confirm button click to pass full details
  const confirmStart = '                            const newPickup = scheduleFarmPickup({\n                              lotId: item.id,\n                              crop: item.crop,';
  const confirmEnd = '                            if (newPickup) setPickupSchedules(newPickup);';
  
  const cIdx1 = content.indexOf(confirmStart, idx1);
  const cIdx2 = content.indexOf(confirmEnd, cIdx1);

  if (cIdx1 !== -1 && cIdx2 !== -1) {
    const confirmReplacement = `                            const hub = RAJASTHAN_AGRI_HUBS[pickupTehsil] || RAJASTHAN_AGRI_HUBS.chomu;
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
                            });\n`;
    content = content.slice(0, cIdx1) + confirmReplacement + content.slice(cIdx2);
  }

  content = content.slice(0, idx1) + replacement + content.slice(idx2);

  if (isCRLF) {
    content = content.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Successfully patched farmer pickup form with CRLF handling');
} else {
  console.error('Could not find target boundaries');
}
