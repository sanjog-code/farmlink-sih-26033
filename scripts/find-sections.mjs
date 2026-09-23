import fs from 'fs';

const src = fs.readFileSync('src/main.jsx', 'utf8');
console.log('Total length:', src.length);

// Find navigation buttons / tabs / views
const lines = src.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('function App(') || line.includes('const App =') || line.includes('activeTab') || line.includes('currentView') || line.includes('Demand') || line.includes('Logistics') || line.includes('Analytics') || line.includes('Admin')) {
    if (line.length < 160) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  }
});
