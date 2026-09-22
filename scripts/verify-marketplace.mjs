import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// Start vite preview
const preview = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

// Wait for preview server to be ready
await new Promise((resolve) => {
  preview.stdout.on('data', data => {
    const text = data.toString();
    console.log('[PREVIEW]:', text.trim());
    if (text.includes('4173')) resolve();
  });
  preview.stderr.on('data', data => console.error('[PREVIEW ERR]:', data.toString()));
});

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', err => {
  console.error('[PAGEERROR]:', err);
  errors.push(err.message);
});
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('[CONSOLE ERR]:', msg.text());
  }
});

try {
  console.log('Navigating to local preview http://127.0.0.1:4173/ ...');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

  // 1. Verify Home page loaded
  const heading = await page.getByRole('heading', { level: 1 }).first().innerText();
  console.log('Home page heading:', heading);

  // 2. Click Marketplace
  console.log('Clicking Marketplace navigation button...');
  const marketBtn = page.getByRole('button', { name: 'Marketplace' }).first();
  await marketBtn.click();
  await page.waitForTimeout(1000);

  // 3. Verify no crash / recovery screen
  const bodyText = await page.evaluate(() => document.body.innerText);
  assert.ok(!bodyText.includes("Let’s reopen FarmLink"), "Crash recovery screen appeared!");
  assert.ok(!bodyText.includes("This screen could not finish loading"), "Loading error appeared!");

  // 4. Verify Marketplace content is rendered
  console.log('Verifying Marketplace UI elements...');
  const searchInput = page.locator('input[placeholder*="Search"]');
  assert.ok(await searchInput.count() > 0, "Search input should be present");

  const cards = page.locator('.product-wrap, .lot-card, .cards');
  assert.ok(await cards.count() > 0, "Marketplace cards should be present");
  console.log('Marketplace rendered cleanly with product cards!');

  // 5. Test Quality Report / ProductDetail navigation
  const qualityBtn = page.getByRole('button', { name: /quality report/i }).first();
  if (await qualityBtn.count() > 0) {
    console.log('Clicking Quality report button...');
    await qualityBtn.click();
    await page.waitForTimeout(500);

    const detailText = await page.evaluate(() => document.body.innerText);
    assert.ok(detailText.includes("TRACEABLE LOT") || detailText.includes("Grade"), "Product detail should display lot info");
    console.log('ProductDetail view rendered successfully!');

    // 6. Test Back to marketplace
    const backBtn = page.getByRole('button', { name: /back to marketplace/i }).first();
    await backBtn.click();
    await page.waitForTimeout(500);
    console.log('Navigated back to Marketplace successfully!');
  }

  assert.equal(errors.length, 0, `Encountered page errors: ${errors.join(', ')}`);
  console.log('ALL MARKETPLACE SMOKE AND DETAIL CHECKS PASSED WITH 0 ERRORS!');
} finally {
  await browser.close();
  preview.kill();
}
