import fs from 'fs';
import path from 'path';

// 1. Purge LogisticsWorkflowHub.jsx INITIAL_SHIPMENTS
const logFile = path.resolve('src/operations/LogisticsWorkflowHub.jsx');
let logContent = fs.readFileSync(logFile, 'utf-8');
logContent = logContent.replace('export const INITIAL_SHIPMENTS = [];\n', '');
fs.writeFileSync(logFile, logContent, 'utf-8');
console.log('Purged INITIAL_SHIPMENTS from LogisticsWorkflowHub.jsx');

// 2. Clean main.jsx demoListings and demo- checks
const mainFile = path.resolve('src/main.jsx');
let mainContent = fs.readFileSync(mainFile, 'utf-8');

mainContent = mainContent.replaceAll('(current.length ? current : demoListings)', '(current.length ? current : getUserListings())');
mainContent = mainContent.replaceAll('demoListings', 'getUserListings()');

// Replace quick auth identities with clean role-based presets
mainContent = mainContent.replace(
  'label: "Ramesh Kumar", name: "Ramesh Kumar", farmerId: "FLR-98124"',
  'label: "Verified Farmer", name: "Verified Farmer", farmerId: "FARMLINK-PRODUCER"'
);
mainContent = mainContent.replace(
  'label: "Priya Sharma", name: "Priya Sharma"',
  'label: "Registered Consumer", name: "Registered Consumer"'
);

fs.writeFileSync(mainFile, mainContent, 'utf-8');
console.log('Purged remaining demo tokens from main.jsx');
