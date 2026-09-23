import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

console.log('--- AdminView nav / setTab (L5480 to L5600) ---');
for (let i = 5480; i < 5620; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
