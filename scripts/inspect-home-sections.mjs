import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

for (let i = 2050; i < 2160; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
