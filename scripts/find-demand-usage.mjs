import fs from 'fs';

const content = fs.readFileSync('src/main.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('High demand nearby') || l.includes('demand nearby') || l.includes('high demand') || l.includes('Demand nearby')) {
    console.log(`Line ${i+1}: ${l.trim().slice(0, 160)}`);
  }
});
