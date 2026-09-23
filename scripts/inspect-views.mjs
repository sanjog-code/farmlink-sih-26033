import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

console.log('--- App component state (around L801-L900) ---');
for (let i = 800; i < 900; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}

console.log('--- Main render / view switching (around L1550-L1650) ---');
for (let i = 1550; i < 1650; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
