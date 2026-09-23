import fs from 'fs';
import path from 'path';

function searchString(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') searchString(full);
    } else {
      const content = fs.readFileSync(full, 'utf8');
      if (/high demand/i.test(content) || /demand forecast/i.test(content)) {
        console.log(`Matched in ${full}`);
        const lines = content.split('\n');
        lines.forEach((l, idx) => {
          if (/high demand/i.test(l) || /demand forecast/i.test(l)) {
            console.log(`  Line ${idx+1}: ${l.trim().slice(0, 160)}`);
          }
        });
      }
    }
  }
}

searchString('src');
