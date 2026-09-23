import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (l.includes('function LotCard') || l.includes('const LotCard =')) {
    console.log(`LotCard at line ${idx+1}`);
  }
});
