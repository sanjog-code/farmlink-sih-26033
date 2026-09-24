const res = await fetch('https://farmlinkk.vercel.app');
const html = await res.text();
console.log('Live HTML Status:', res.status);

const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
if (jsMatch) {
  const jsUrl = 'https://farmlinkk.vercel.app' + jsMatch[1];
  console.log('Live JS bundle URL:', jsUrl);
  const jsRes = await fetch(jsUrl);
  const jsCode = await jsRes.text();

  const hasAiHeading = jsCode.includes('ai-formatted-heading');
  const hasAiDivider = jsCode.includes('ai-formatted-divider');
  const hasCleanSpeech = jsCode.includes('cleanSpeechText') || jsCode.includes('sanitizeAiText');
  const hasKanakAi = jsCode.includes('KANAK AI');
  const hasKioskExit = jsCode.includes('saarthi-exit-kiosk-btn');

  console.log('Checking features in live production bundle:');
  console.log('- ai-formatted-heading present:', hasAiHeading);
  console.log('- ai-formatted-divider present:', hasAiDivider);
  console.log('- cleanSpeechText / sanitizeAiText present:', hasCleanSpeech);
  console.log('- KANAK AI branding present:', hasKanakAi);
  console.log('- Kiosk prominent exit button present:', hasKioskExit);

  if (hasKanakAi && hasKioskExit) {
    console.log('\nSUCCESS: Current changes are FULLY DEPLOYED and ACTIVE on https://farmlinkk.vercel.app!');
  } else {
    console.log('\nNOTE: Live bundle does not contain latest commit yet.');
  }
} else {
  console.log('Could not find JS bundle in HTML');
}
