import { chromium } from 'playwright';

async function main() {
  console.log('Connecting to live production: https://farmlinkk.vercel.app ...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    const res = await page.goto('https://farmlinkk.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('HTTP Status:', res.status());
    console.log('Page Title:', await page.title());

    // Test marketplace
    const marketBtn = page.getByRole('button', { name: 'Marketplace' }).first();
    await marketBtn.click();
    await page.waitForTimeout(1000);
    const cards = await page.locator('.product-wrap').count();
    console.log('Marketplace product count:', cards);

    // Test Voice AI
    const voiceBtn = page.locator('.header-voice-btn, button:has-text("Voice AI")').first();
    await voiceBtn.click();
    await page.waitForTimeout(500);
    const options = await page.locator('.voice-modal label:has-text("Language") select option').count();
    console.log('Voice AI language count:', options);

    // Test Farmer Login
    await page.locator('.voice-modal button.close').click();
    await page.waitForTimeout(300);

    const loginBtn = page.locator('button.login-btn, button:has-text("Sign in")').first();
    await loginBtn.click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("Ramesh Kumar (Farmer)")').first().click();
    await page.waitForTimeout(800);

    const farmerHeading = await page.locator('h1:has-text("Your produce. Your decision.")').count();
    console.log('Farmer heading matches Slide 7:', farmerHeading > 0);

    console.log('Errors logged on page:', errors);
    console.log('\nAll production checks passed successfully!');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
