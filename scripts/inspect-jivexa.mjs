async function inspect() {
  const res = await fetch('https://jivexa-main.vercel.app/assets/index-DJyk8kfl.js');
  const code = await res.text();
  console.log('JS Bundle length:', code.length);

  // Search for navigation labels, features, sections
  const keywords = ['Home', 'Dashboard', 'Marketplace', 'Features', 'About', 'Pricing', 'Login', 'Sign in', 'Get Started', 'Health OS', 'Overview'];
  for (const kw of keywords) {
    const idx = code.indexOf(kw);
    if (idx !== -1) {
      console.log(`Keyword [${kw}] snippet:`, code.slice(Math.max(0, idx - 100), Math.min(code.length, idx + 150)).replace(/\n/g, ' '));
    }
  }

  // Look for Lucide icons or svg patterns or components
  const iconMatches = code.match(/createLucideIcon\(['\"][a-zA-Z0-9]+['\"]/g) || [];
  console.log('Lucide icons found:', [...new Set(iconMatches)].slice(0, 15));

  // Find headers, navigation links, and layout structure
  const linkMatches = code.match(/to:\s*['\"][^'\"]+['\"]/g) || [];
  console.log('Router Links:', [...new Set(linkMatches)]);
}

inspect().catch(console.error);
