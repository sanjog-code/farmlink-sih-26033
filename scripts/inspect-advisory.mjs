import fs from 'fs';

const content = fs.readFileSync('src/ai/FreeAdvisory.jsx', 'utf8');
const lines = content.split('\n');
console.log('Total lines in FreeAdvisory:', lines.length);

lines.forEach((l, i) => {
  if (l.includes('fitTrend') || l.includes('forecast') || l.includes('demand') || l.includes('graph') || l.includes('High Demand') || l.includes('High demand') || l.includes('Chart') || l.includes('chart')) {
    console.log(`L${i+1}: ${l.trim().slice(0, 140)}`);
  }
});
