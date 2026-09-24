import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('setWarehouses') || l.includes('const [warehouses') || l.includes('initialWarehouses') || l.includes('DEFAULT_WAREHOUSES')) {
    console.log((i + 1) + ': ' + l.slice(0, 140));
  }
});
