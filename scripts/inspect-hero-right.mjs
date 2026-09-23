async function inspectHeroRight() {
  const res = await fetch('https://jivexa-main.vercel.app/assets/index-DJyk8kfl.js');
  const code = await res.text();

  const heroIdx = code.indexOf('hero-tag');
  if (heroIdx !== -1) {
    console.log('=== HERO RIGHT / CARDS ===');
    console.log(code.slice(heroIdx + 1100, heroIdx + 2600));
  }
}

inspectHeroRight().catch(console.error);
