import fs from 'fs';

const lines = fs.readFileSync('src/main.jsx', 'utf8').split('\n');

lines.forEach((line, idx) => {
  if (line.includes('function AdminView(') || line.includes('const AdminView =')) {
    console.log(`AdminView definition at line ${idx + 1}`);
  }
  if (line.includes('Demand') && line.includes('function')) {
    console.log(`Demand function at line ${idx + 1}: ${line}`);
  }
});
