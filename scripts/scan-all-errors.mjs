import fs from 'fs';
import path from 'path';

console.log('=== INITIATING COMPREHENSIVE ERROR SCAN ===\n');

let errorCount = 0;
let warningCount = 0;

function walkDir(dir, filterFn) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath, filterFn));
    } else if (filterFn(fullPath)) {
      results.push(fullPath);
    }
  });
  return results;
}

// 1. Scan for broken imports in src
console.log('1. Checking file imports and references in src/...');
const jsFiles = walkDir('src', (f) => f.endsWith('.js') || f.endsWith('.jsx'));

jsFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const importRegex = /from\s+['"](\.[^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importRel = match[1];
    const dir = path.dirname(file);
    let resolved = path.resolve(dir, importRel);
    let exists = fs.existsSync(resolved);
    if (!exists) {
      // try extensions
      if (fs.existsSync(resolved + '.js')) exists = true;
      else if (fs.existsSync(resolved + '.jsx')) exists = true;
      else if (fs.existsSync(resolved + '.json')) exists = true;
      else if (fs.existsSync(path.join(resolved, 'index.js'))) exists = true;
      else if (fs.existsSync(path.join(resolved, 'index.jsx'))) exists = true;
    }
    if (!exists) {
      console.error(`[BROKEN IMPORT] in ${file}: Cannot resolve "${importRel}"`);
      errorCount++;
    }
  }
});

// 2. Scan for lingering mock / sample data tokens
console.log('\n2. Scanning for forbidden sample data tokens (FL-24091, demo-listing, fake KYC defaults)...');
const mockTokens = [
  'FL-24091',
  'demo-listing',
  'demoListings',
  'FPO-BATCH-01',
  'FPO-BATCH-02',
  'FPO-BATCH-03',
  'SHP-101',
  'SHP-102',
  'INITIAL_SHIPMENTS = ['
];

jsFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  mockTokens.forEach((token) => {
    if (content.includes(token)) {
      console.warn(`[SAMPLE DATA DETECTED] in ${file}: Contains "${token}"`);
      warningCount++;
    }
  });
});

// 3. Scan for duplicate or orphaned navigation tabs in top bar
console.log('\n3. Validating main screen navigation constraints...');
const mainContent = fs.readFileSync('src/main.jsx', 'utf-8');
const navSegMatch = mainContent.match(/<nav className="nav-segmented">([\s\S]*?)<\/nav>/);
if (navSegMatch) {
  const navHtml = navSegMatch[1];
  const pills = (navHtml.match(/<button/g) || []).length;
  console.log(`Main nav pill count: ${pills}`);
  if (pills > 4) {
    console.error(`[NAV OVERFLOW] Main screen navigation has ${pills} pills (expected strictly 4).`);
    errorCount++;
  } else {
    console.log(`✓ Main nav pill count verified: strictly ${pills} primary dashboards.`);
  }

  // Check that auxiliary hubs are NOT in nav
  ['fpo', 'analytics', 'routes', 'logistics', 'disputes'].forEach((hub) => {
    if (navHtml.includes(`setView("${hub}")`) || navHtml.includes(`setView('${hub}')`)) {
      console.error(`[FORBIDDEN NAV ITEM] Main nav still contains "${hub}" link!`);
      errorCount++;
    }
  });
}

// 4. Verify AdminView has all integrated operational hubs
console.log('\n4. Verifying Admin Profile integrated operational hubs...');
const requiredAdminTabs = [
  'analytics',
  'forecast',
  'logistics',
  'routes',
  'fpo',
  'disputes',
  'action',
  'listings',
  'verification',
  'wholesale',
  'warehouses',
  'price floors',
  'market data'
];

requiredAdminTabs.forEach((tab) => {
  if (mainContent.includes(`["${tab}"`) || mainContent.includes(`['${tab}'`)) {
    console.log(`✓ Admin tab "${tab}" integrated.`);
  } else {
    console.error(`[MISSING ADMIN TAB] Admin Profile is missing "${tab}" tab!`);
    errorCount++;
  }
});

// 5. Verify WDRA Registered Warehouses presence
console.log('\n5. Verifying WDRA Warehouse Registry & Haversine Distance Engine...');
const dataSyncContent = fs.readFileSync('src/lib/dataSyncEngine.js', 'utf-8');
if (dataSyncContent.includes('WDRA_REGISTERED_WAREHOUSES') && dataSyncContent.includes('haversineDistanceKm')) {
  console.log('✓ WDRA_REGISTERED_WAREHOUSES and haversineDistanceKm verified.');
} else {
  console.error('[MISSING REGISTRY] WDRA_REGISTERED_WAREHOUSES or haversineDistanceKm not found in dataSyncEngine.js');
  errorCount++;
}

console.log('\n=== SCAN COMPLETE ===');
console.log(`Total Errors Found: ${errorCount}`);
console.log(`Total Warnings / Sample Data Flags: ${warningCount}`);

if (errorCount === 0 && warningCount === 0) {
  console.log('\n🎉 ALL CHECKS PASSED WITH ZERO ERRORS AND ZERO LINGERING SAMPLE DATA!');
}
