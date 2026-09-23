import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

console.log('--- AdminView tabs & layout (L5750 to L5870) ---');
for (let i = 5740; i < 5870; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
