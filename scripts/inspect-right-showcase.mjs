async function inspectRightShowcase() {
  const res = await fetch('https://jivexa-main.vercel.app/assets/index-DJyk8kfl.js');
  const code = await res.text();

  const heroIdx = code.indexOf('AI assistance for informational support');
  if (heroIdx !== -1) {
    console.log('=== HERO VISUAL / INTERACTIVE DASHBOARD CARD ===');
    console.log(code.slice(heroIdx, heroIdx + 2000));
  }
}

inspectRightShowcase().catch(console.error);
