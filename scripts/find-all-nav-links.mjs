import fs from 'fs';

const content = fs.readFileSync('src/main.jsx', 'utf8');
const lines = content.split('\n');

const targets = ['fpo', 'analytics', 'routes', 'logistics', 'disputes'];

console.log('--- FINDING TARGET VIEW REFERENCES IN MAIN.JSX ---');
lines.forEach((l, idx) => {
  const lineNum = idx + 1;
  for (const t of targets) {
    if (l.includes(`setView("${t}")`) || l.includes(`setView('${t}')`) || l.includes(`view === "${t}"`) || l.includes(`view === '${t}'`)) {
      console.log(`L${lineNum}: ${l.trim().slice(0, 140)}`);
      break;
    }
  }
});
