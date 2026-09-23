import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

console.log('--- AdminView tabs list (L5730 to L5770) ---');
for (let i = 5720; i < 5770; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
