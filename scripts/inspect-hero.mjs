async function inspectHero() {
  const res = await fetch('https://jivexa-main.vercel.app/assets/index-DJyk8kfl.js');
  const code = await res.text();

  const heroIdx = code.indexOf('hero-tag');
  if (heroIdx !== -1) {
    console.log('=== HERO SECTION CODE ===');
    console.log(code.slice(heroIdx - 200, heroIdx + 1200));
  }
}

inspectHero().catch(console.error);
