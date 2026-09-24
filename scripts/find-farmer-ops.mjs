import fs from 'fs';

const content = fs.readFileSync('src/main.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('scheduleFarmPickup') || l.includes('function FarmerOperations') || l.includes('FarmerDashboard')) {
    console.log((i + 1) + ': ' + l.slice(0, 120));
  }
});
