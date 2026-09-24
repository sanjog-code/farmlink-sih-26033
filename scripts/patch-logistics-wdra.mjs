import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/operations/LogisticsWorkflowHub.jsx');
let content = fs.readFileSync(filePath, 'utf-8');
const isCRLF = content.includes('\r\n');
if (isCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Add WDRA_REGISTERED_WAREHOUSES and RAJASTHAN_AGRI_HUBS to imports
content = content.replace(
  "  subscribeToSync\n} from '../lib/dataSyncEngine';",
  "  subscribeToSync,\n  WDRA_REGISTERED_WAREHOUSES,\n  RAJASTHAN_AGRI_HUBS\n} from '../lib/dataSyncEngine';"
);

// 2. Set default warehouse to official WDRA warehouse
content = content.replace(
  "destinationWarehouse: 'Jaipur North WDRA Hub',",
  "destinationWarehouse: 'Jaipur North WDRA Hub (CWC)',"
);

// 3. Replace text inputs with dropdowns in dispatch modal
const oldOriginInput = `              <div>
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
              </div>`;

const newOriginInput = `              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Pickup Origin Agricultural Cluster:</label>
                <select
                  value={newShipment.originCluster}
                  onChange={(e) => setNewShipment({ ...newShipment, originCluster: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  {Object.entries(RAJASTHAN_AGRI_HUBS).map(([key, h]) => (
                    <option key={key} value={h.name}>
                      {h.name} ({h.tehsil}, {h.district} - PIN {h.pincode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Destination WDRA Registered Warehouse:</label>
                <select
                  value={newShipment.destinationWarehouse}
                  onChange={(e) => setNewShipment({ ...newShipment, destinationWarehouse: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  {WDRA_REGISTERED_WAREHOUSES.map((wh) => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name} ({wh.wdraRegNo}) · {wh.district}
                    </option>
                  ))}
                </select>
              </div>`;

if (content.includes(oldOriginInput)) {
  content = content.replace(oldOriginInput, newOriginInput);
  console.log('Successfully replaced origin & warehouse inputs with WDRA registry dropdowns');
}

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Finished patch-logistics-wdra.mjs');
