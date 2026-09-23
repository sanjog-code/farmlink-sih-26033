import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

console.log('--- Top nav pills (L910 to L980) ---');
for (let i = 910; i < 980; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
