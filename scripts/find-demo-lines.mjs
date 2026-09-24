import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('demoListings') || l.includes('demo-')) {
    console.log((i + 1) + ': ' + l.trim().slice(0, 100));
  }
});
