import fs from 'fs';

const content = fs.readFileSync('src/main.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('function Home') || line.includes('const Home =')) {
    console.log(`Home at Line ${idx + 1}: ${line.slice(0, 80)}`);
  }
});
