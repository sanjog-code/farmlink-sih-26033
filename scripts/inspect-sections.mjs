async function inspectSections() {
  const res = await fetch('https://jivexa-main.vercel.app/assets/index-DJyk8kfl.js');
  const code = await res.text();

  // Search for hero headline and main section titles
  const regex = /<h1[^>]*>([\s\S]*?)<\/h1>/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    console.log('H1:', match[1]);
  }

  // Find occurrences of hero badge or subtitle
  const heroSnippets = code.match(/Healthcare,\s*Simplified[\s\S]{0,400}/) || [];
  console.log('Hero snippet:', heroSnippets[0]);

  // Find feature sections or grid cards
  const gridSnippets = code.match(/gridTemplateColumns[\s\S]{0,300}/g) || [];
  console.log('Sample grids:', gridSnippets.slice(0, 5));
}

inspectSections().catch(console.error);
