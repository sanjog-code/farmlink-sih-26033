import fs from 'fs';
import path from 'path';

function searchInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') searchInDir(full);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (/demand/i.test(l) && (l.includes('<') || l.includes('function') || l.includes('forecast') || l.includes('chart') || l.includes('class'))) {
          console.log(`${full}:${idx + 1}: ${l.trim().slice(0, 140)}`);
        }
      });
    }
  }
}

searchInDir('src');
