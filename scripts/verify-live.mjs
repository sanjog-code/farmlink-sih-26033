import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', err => {
  console.error('[LIVE PAGEERROR]:', err);
  errors.push(err.message);
});
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('[LIVE CONSOLE ERROR]:', msg.text());
  }
});

console.log('Navigating to live production: https://farmlinkk.vercel.app ...');
await page.goto('https://farmlinkk.vercel.app', { waitUntil: 'networkidle' });

console.log('Clicking Marketplace nav button...');
const marketBtn = page.getByRole('button', { name: 'Marketplace' }).first();
await marketBtn.click();
await page.waitForTimeout(2000);

const bodyText = await page.evaluate(() => document.body.innerText);
const crashed = bodyText.includes('Let’s reopen FarmLink') || bodyText.includes('could not finish loading');

console.log('--- LIVE PRODUCTION RESULTS ---');
console.log('Crash screen detected?', crashed ? 'YES (FAILED)' : 'NO (SUCCESS!)');
console.log('Page errors count:', errors.length);

const searchInputCount = await page.locator('input[placeholder*="Search"]').count();
console.log('Marketplace search inputs found:', searchInputCount);

const cards = await page.locator('.product-wrap, .lot-card, .cards').count();
console.log('Marketplace produce elements found:', cards);

await browser.close();

if (crashed || errors.length > 0) {
  process.exit(1);
} else {
  console.log('LIVE VERIFICATION SUCCEEDED! Marketplace is healthy and crash-free.');
}
