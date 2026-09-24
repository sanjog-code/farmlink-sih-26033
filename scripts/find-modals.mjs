import fs from 'fs';

const c = fs.readFileSync('src/main.jsx', 'utf8');
const lines = c.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('modal ===') || l.includes('setModal(')) {
    console.log(`L${idx + 1}: ${l.trim().slice(0, 120)}`);
  }
});
