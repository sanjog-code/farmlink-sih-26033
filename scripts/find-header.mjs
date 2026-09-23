import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (l.includes('<header') || l.includes('nav-segmented')) {
    console.log(`Line ${idx+1}: ${l.slice(0, 140)}`);
  }
});
