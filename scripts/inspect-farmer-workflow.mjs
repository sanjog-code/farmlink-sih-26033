import fs from 'fs';

const content = fs.readFileSync('src/main.jsx', 'utf8');
const lines = content.split('\n');

console.log('=== SEARCHING FARMER WORKFLOW IN MAIN.JSX ===');
lines.forEach((l, idx) => {
  const lineNum = idx + 1;
  if (
    l.includes('function FarmerView') ||
    l.includes('function FarmerOperations') ||
    l.includes('<FarmerView') ||
    l.includes('FarmerView') ||
    l.includes('farmer') && (l.includes('case') || l.includes('tab') || l.includes('view'))
  ) {
    if (l.trim().length > 0 && l.trim().length < 150) {
      console.log(`L${lineNum}: ${l.trim()}`);
    }
  }
});
