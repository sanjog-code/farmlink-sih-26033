import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/main.jsx');
let content = fs.readFileSync(filePath, 'utf-8');
const isCRLF = content.includes('\r\n');
if (isCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Remove the standalone views for analytics, logistics, routes, fpo, disputes
const standaloneViewsStart = '        {view === "analytics" && (';
const standaloneViewsEnd = '        {view === "admin" && (';

const idx1 = content.indexOf(standaloneViewsStart);
const idx2 = content.indexOf(standaloneViewsEnd);

if (idx1 !== -1 && idx2 !== -1) {
  content = content.slice(0, idx1) + content.slice(idx2);
  console.log('Successfully removed standalone pages for analytics, logistics, routes, fpo, disputes');
} else {
  console.warn('Could not locate standalone views bounds');
}

// 2. Add adminTab state to App() and wire view === "admin" or subtabs
const adminViewPattern = `        {view === "admin" && (
          <>
            <AdminView`;

const newAdminViewPattern = `        {["admin", "analytics", "logistics", "routes", "fpo", "disputes"].includes(view) && (
          <>
            <AdminView
              initialTab={view === "admin" ? adminTab : view}`;

if (content.includes(adminViewPattern)) {
  content = content.replace(adminViewPattern, newAdminViewPattern);
  console.log('Successfully wired AdminView initialTab and subtab routing');
}

// Ensure adminTab state is declared in App()
const appStateMarker = '    [placingOrder, setPlacingOrder] = useState(false),';
const appStateAddition = `    [placingOrder, setPlacingOrder] = useState(false),
    [adminTab, setAdminTab] = useState("analytics"),`;

if (content.includes(appStateMarker) && !content.includes('[adminTab, setAdminTab]')) {
  content = content.replace(appStateMarker, appStateAddition);
  console.log('Successfully added adminTab state to App');
}

// 3. Update AdminView definition to accept initialTab prop
content = content.replace(
  'function AdminView({ session, lots, orders, produceRequests, bulkRequests, logisticsJobs, warehouses, setOrderStatus, liveTick, setLiveTick, setView, logout, notify, farmerVerification, setFarmerVerification }) {',
  'function AdminView({ session, lots, orders, produceRequests, bulkRequests, logisticsJobs, warehouses, setOrderStatus, liveTick, setLiveTick, setView, logout, notify, farmerVerification, setFarmerVerification, initialTab = "analytics" }) {'
);

content = content.replace(
  'const [tab, setTab] = useState("analytics");',
  'const [tab, setTab] = useState(initialTab || "analytics");'
);

// 4. Remove fake demoListings from AdminView
const demoListingsStart = '  const demoListings = useMemo(() => [';
const demoListingsEnd = '  const effectiveListings = listings.length > 0 ? listings : getUserListings();';

const dIdx1 = content.indexOf(demoListingsStart);
const dIdx2 = content.indexOf(demoListingsEnd);

if (dIdx1 !== -1 && dIdx2 !== -1) {
  content = content.slice(0, dIdx1) + content.slice(dIdx2);
  console.log('Successfully purged demoListings mock array from AdminView');
}

// 5. Update Home screen buttons to strictly point to the 4 main dashboards or Admin Profile
const homeLogisticsBtn = '                onClick={() => setView("logistics")}\n              >\n                Track Fleet ➔';
const homeLogisticsReplacement = '                onClick={() => setView("farmer")}\n              >\n                Schedule Pickup ➔';

if (content.includes(homeLogisticsBtn)) {
  content = content.replace(homeLogisticsBtn, homeLogisticsReplacement);
}

const homeAnalyticsBtn = '                onClick={() => setView("analytics")}\n              >\n                Forecast Lab ➔';
const homeAnalyticsReplacement = '                onClick={() => setView("market")}\n              >\n                Browse Produce ➔';

if (content.includes(homeAnalyticsBtn)) {
  content = content.replace(homeAnalyticsBtn, homeAnalyticsReplacement);
}

// Update flow-cta-banner in Home
const ctaBannerStart = '        <div className="flow-cta-banner">';
const ctaBannerEnd = '      </section>\n\n      {/* MULTILINGUAL VOICE CONSULTATION BANNER */}';

const cIdx1 = content.indexOf(ctaBannerStart);
const cIdx2 = content.indexOf(ctaBannerEnd);

if (cIdx1 !== -1 && cIdx2 !== -1) {
  const newCtaBanner = `        <div className="flow-cta-banner">
          <div className="flow-cta-text">
            <h4>{tr("Direct Agricultural Supply Chain & Real-Time Handoffs")}</h4>
            <p>{tr("Explore verified farmer listings, B2B wholesale procurement, and WDRA accredited warehouse inspection.")}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="hero-btn-primary" onClick={() => setView("market")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <ShoppingCart size={15} />
              <span>{tr("Marketplace")}</span>
            </button>
            <button className="hero-btn-secondary" onClick={() => setView("bulk")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Building2 size={15} />
              <span>{tr("Wholesale Desk")}</span>
            </button>
            <button className="hero-btn-secondary" onClick={() => setView("warehouse")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Warehouse size={15} />
              <span>{tr("WDRA Warehouses")}</span>
            </button>
            <button className="hero-btn-secondary" onClick={() => setView("farmer")} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Truck size={15} />
              <span>{tr("Farmer Portal")}</span>
            </button>
            <button className="top-auth-btn" onClick={() => { setAdminTab("analytics"); setView("admin"); }} style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'rgba(5, 150, 105, 0.15)', color: 'var(--primary)', border: '1px solid rgba(5, 150, 105, 0.3)', fontWeight: 700 }}>
              <ShieldCheck size={15} />
              <span>{tr("Admin Profile")}</span>
            </button>
          </div>
        </div>`;

  content = content.slice(0, cIdx1) + newCtaBanner + content.slice(cIdx2);
  console.log('Successfully updated Home CTA banner to primary dashboards and Admin Profile');
}

// 6. Delete LegacyAdminView
const legacyAdminStart = 'function LegacyAdminView({ lots, orders, produceRequests, setView, logout, notify }) {';
const legacyAdminEnd = 'function AdminView({ session, lots, orders, produceRequests, bulkRequests, logisticsJobs, warehouses, setOrderStatus, liveTick, setLiveTick, setView, logout, notify, farmerVerification, setFarmerVerification, initialTab = "analytics" }) {';

const lIdx1 = content.indexOf(legacyAdminStart);
const lIdx2 = content.indexOf(legacyAdminEnd);

if (lIdx1 !== -1 && lIdx2 !== -1) {
  content = content.slice(0, lIdx1) + content.slice(lIdx2);
  console.log('Successfully deleted LegacyAdminView and its mock sample data');
}

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Finished patch-clean-admin-and-home.mjs');
