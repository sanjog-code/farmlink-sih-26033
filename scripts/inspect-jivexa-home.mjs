async function inspectHome() {
  const res = await fetch('https://jivexa-main.vercel.app/assets/index-DJyk8kfl.js');
  const code = await res.text();

  // Find Navbar and Hero elements
  const patterns = [
    'Jivexa Health OS',
    'Healthcare, Simplified',
    'How It Works',
    'header',
    'glass-nav',
    'glass-card',
    'border-radius'
  ];

  for (const p of patterns) {
    let pos = 0;
    let count = 0;
    while ((pos = code.indexOf(p, pos)) !== -1 && count < 2) {
      console.log(`Match for [${p}]:`);
      console.log(code.slice(Math.max(0, pos - 150), Math.min(code.length, pos + 250)).replace(/\n/g, ' '));
      pos += p.length;
      count++;
    }
  }
}

inspectHome().catch(console.error);
