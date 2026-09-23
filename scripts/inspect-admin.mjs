import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

console.log('--- AdminView (L5281 to L5450) ---');
for (let i = 5280; i < 5450; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
