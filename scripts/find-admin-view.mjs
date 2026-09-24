import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('AdminView') || l.includes('view === "admin"')) {
    console.log((i + 1) + ': ' + l.slice(0, 120));
  }
});
