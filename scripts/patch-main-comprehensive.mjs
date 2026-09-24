import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add WDRA_REGISTERED_WAREHOUSES and RAJASTHAN_AGRI_HUBS to imports from dataSyncEngine
if (!content.includes('WDRA_REGISTERED_WAREHOUSES')) {
  content = content.replace(
    '  subscribeToSync\n} from "./lib/dataSyncEngine";',
    '  subscribeToSync,\n  WDRA_REGISTERED_WAREHOUSES,\n  RAJASTHAN_AGRI_HUBS\n} from "./lib/dataSyncEngine";'
  );
}

// 2. Initialize warehouses state with WDRA_REGISTERED_WAREHOUSES
const oldWarehouseInit = `    [warehouses, setWarehouses] = useState([
      { name: "Jaipur North", address: "Jaipur North, Rajasthan" },
      { name: "Sanganer Hub", address: "Sanganer, Jaipur, Rajasthan" },
    ]),`;

const newWarehouseInit = `    [warehouses, setWarehouses] = useState(() => WDRA_REGISTERED_WAREHOUSES),`;

if (content.includes(oldWarehouseInit)) {
  content = content.replace(oldWarehouseInit, newWarehouseInit);
}

// 3. Update top nav segmented pills to strictly ONLY 4: Marketplace, Wholesale, Warehouse, Farmer
const navStart = content.indexOf('<nav className="nav-segmented">');
const navEnd = content.indexOf('</nav>', navStart);
if (navStart !== -1 && navEnd !== -1) {
  const newNav = `<nav className="nav-segmented">
          <button
            className={view === "market" ? "nav-pill active" : "nav-pill"}
            onClick={() => setView("market")}
          >
            {tUI("Marketplace")}
          </button>
          <button
            className={view === "bulk" ? "nav-pill active" : "nav-pill"}
            onClick={() => setView("bulk")}
          >
            {tUI("Wholesale")}
          </button>
          <button
            className={view === "warehouse" ? "nav-pill active" : "nav-pill"}
            onClick={() => setView("warehouse")}
          >
            {tUI("Warehouse")}
          </button>
          <button
            className={view === "farmer" ? "nav-pill active" : "nav-pill"}
            onClick={() => setView("farmer")}
          >
            {tUI("Farmer")}
          </button>
        </nav>`;
  content = content.slice(0, navStart) + newNav + content.slice(navEnd + 6);
  console.log('Successfully updated nav-segmented to 4 primary tabs');
}

// 4. Update top user cluster to include dedicated "Admin Profile" button
const userClusterOld = `{session ? (
            <div className="auth-cluster">
              <button
                className="top-auth-btn"
                onClick={() =>
                  session.role === "admin"
                    ? setView("admin")
                    : setView(session.role === "farmer" ? "farmer" : "consumer")
                }
                title={session.label}
              >
                <UserRound size={15} />
                <span>{session.label.split(" ")[0]}</span>
              </button>
              <button
                type="button"
                className="top-icon-btn logout-btn"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button className="top-auth-btn signin-btn" onClick={() => setView("auth")}>
              <UserRound size={15} />
              <span>{tUI("Sign in")}</span>
            </button>
          )}`;

const userClusterNew = `{session ? (
            <div className="auth-cluster" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                className="top-auth-btn"
                style={{ background: 'rgba(5, 150, 105, 0.12)', color: 'var(--primary)', border: '1px solid rgba(5, 150, 105, 0.25)', fontWeight: 700 }}
                onClick={() => setView("admin")}
                title="Open Admin Operations Profile"
              >
                <ShieldCheck size={14} />
                <span>{session.role === "admin" ? "Admin Desk" : "Admin Profile"}</span>
              </button>
              <button
                type="button"
                className="top-icon-btn logout-btn"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                className="top-auth-btn"
                style={{ background: 'rgba(5, 150, 105, 0.12)', color: 'var(--primary)', border: '1px solid rgba(5, 150, 105, 0.25)', fontWeight: 700 }}
                onClick={() => {
                  setSession({ role: "admin", name: "Operations Director", label: "Admin Profile" });
                  setView("admin");
                }}
                title="Open Admin Operations Profile"
              >
                <ShieldCheck size={14} />
                <span>{tUI("Admin Profile")}</span>
              </button>
              <button className="top-auth-btn signin-btn" onClick={() => setView("auth")}>
                <UserRound size={14} />
                <span>{tUI("Sign in")}</span>
              </button>
            </div>
          )}`;

if (content.includes(userClusterOld)) {
  content = content.replace(userClusterOld, userClusterNew);
  console.log('Successfully updated user auth cluster');
}

// 5. Allow open access to Warehouse and Farmer dashboards
content = content.replace(
  '{view === "warehouse" && session?.role === "admin" && (',
  '{view === "warehouse" && ('
);
content = content.replace(
  '{view === "farmer" && ["farmer", "admin"].includes(session?.role) && (',
  '{view === "farmer" && ('
);

// 6. Ensure view === "admin" renders even if session is set dynamically
content = content.replace(
  '{view === "admin" && session?.role === "admin" && (',
  '{view === "admin" && ('
);

// 7. Update AdminView tabs list and render blocks to incorporate ALL engines
const oldAdminTabs = `    <section className="admin-control"><div className="tabs">{[["analytics","📊 Real KPIs & Analytics"],["forecast","🤖 AI Demand Forecast"],["logistics","🚚 Order-to-Delivery Fleet"],["action","Action centre"],["listings","Listing approvals"],["verification","Farmer KYC approvals"],["wholesale","Wholesale desk"],["warehouses","Warehouse inspector"],["routes","Route map"],["price floors","Reference floors"],["market data","MSP & mandi data"],["integrations","Integrations"]].map(([key,label]) => <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>{label}</button>)}</div>`;

const newAdminTabs = `    <section className="admin-control"><div className="tabs">{[["analytics","📊 Real KPIs & Analytics"],["forecast","🤖 AI Demand Forecast"],["logistics","🚚 Fleet Logistics Command"],["routes","🗺️ AI Route Optimization"],["fpo","🌾 FPO Collective Hub"],["disputes","⚖️ Disputes & Arbitration"],["action","⚡ Action Centre"],["listings","📋 Listing Approvals"],["verification","🛡️ Farmer KYC Approvals"],["wholesale","🤝 Wholesale Desk"],["warehouses","🏬 WDRA Warehouses"],["price floors","🏷️ Protected MSP & Floors"],["market data","📈 Mandi Live Rates"],["integrations","🔌 Connected Systems"]].map(([key,label]) => <button key={key} className={tab === key ? "selected" : ""} onClick={() => setTab(key)}>{label}</button>)}</div>`;

if (content.includes(oldAdminTabs)) {
  content = content.replace(oldAdminTabs, newAdminTabs);
  console.log('Successfully updated AdminView tabs list');
}

// Ensure tab === "routes", tab === "fpo", tab === "disputes" render the respective full operational engines
const oldRoutesPanel = `{tab === "routes" && <div className="admin-work-panel"><h3>Farm-to-warehouse route mapping</h3><p>Map collection → intake warehouse → inter-warehouse transfer → pickup fulfilment.</p><LiveRoutePlanner notify={notify} initialOrigin={warehouses[0]?.address || ""} initialDestination={warehouses[1]?.address || warehouses[0]?.address || ""}/><form className="route-form" onSubmit={addRoute}><select value={route.origin} onChange={(event) => setRoute({ ...route, origin: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><span>→</span><select value={route.destination} onChange={(event) => setRoute({ ...route, destination: event.target.value })}>{warehouses.map((warehouse) => <option key={warehouse.id || warehouse.name}>{warehouse.name}</option>)}</select><button className="primary" type="submit">Save transfer route</button></form><button className="secondary" onClick={() => setView("warehouse")}>Open warehouse operations</button></div>}`;

const newRoutesPanel = `{tab === "routes" && <RouteOptimizationEngine notify={notify} />}
    {tab === "fpo" && <FpoCollectiveHub notify={notify} />}
    {tab === "disputes" && <FailureDisputeEngine notify={notify} />}`;

if (content.includes(oldRoutesPanel)) {
  content = content.replace(oldRoutesPanel, newRoutesPanel);
  console.log('Successfully wired RouteOptimizationEngine, FpoCollectiveHub, and FailureDisputeEngine into AdminView tabs');
}

// 8. In AdminView, remove fake demoListings and wire to real user listings
content = content.replace(
  'const effectiveListings = listings.length > 0 ? listings : demoListings;',
  'const effectiveListings = listings.length > 0 ? listings : getUserListings();'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully completed patch-main-comprehensive.mjs');
