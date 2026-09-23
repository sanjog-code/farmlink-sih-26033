import fs from 'fs';

const content = fs.readFileSync('src/styles.css', 'utf8');
const lines = content.split('\n');
console.log('Total lines in styles.css:', lines.length);

lines.forEach((l, idx) => {
  if (l.includes('.lot') || l.includes('.cards') || l.includes('grid') || l.includes('card')) {
    if (l.length < 80) console.log(`L${idx+1}: ${l}`);
  }
});
