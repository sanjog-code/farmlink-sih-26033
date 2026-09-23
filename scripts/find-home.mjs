import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (l.includes('function Home(') || l.includes('const Home =')) {
    console.log(`Home at line ${idx+1}: ${l}`);
  }
});
