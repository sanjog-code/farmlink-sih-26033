import { chromium } from 'playwright';
import assert from 'node:assert/strict';

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

// 1. Language selector checks
console.log('Checking 22 constitutional languages on live production...');
const langSelect = page.locator('header select');
const optionCount = await langSelect.locator('option').count();
console.log(`Live language options count: ${optionCount}`);
assert.equal(optionCount, 23, 'Must have 23 language options (22 constitutional + en)');

await langSelect.selectOption('hi');
await page.waitForTimeout(600);
let text = await page.evaluate(() => document.body.innerText);
assert.ok(text.includes('मार्केटप्लेस') || text.includes('किसान'), 'Hindi translation active');

await langSelect.selectOption('en');
await page.waitForTimeout(600);

// 2. Voice AI button & modal
console.log('Checking Multilingual Voice AI assistant on live production...');
const voiceBtn = page.locator('.header-voice-btn, button:has-text("Voice AI")').first();
assert.ok(await voiceBtn.count() > 0, 'Header Voice AI button must exist');
await voiceBtn.click();
await page.waitForTimeout(500);

const voiceModal = page.locator('.voice-modal');
assert.ok(await voiceModal.count() > 0, 'Voice modal must open');
const modalLanguages = await voiceModal.locator('select').first().locator('option').count();
console.log(`Voice modal languages count: ${modalLanguages}`);
assert.equal(modalLanguages, 23, 'Voice modal must have all 23 language choices');
await voiceModal.locator('button.close').click();
await page.waitForTimeout(300);

// 3. Marketplace check & search mic
console.log('Checking Marketplace and search voice dictation on live production...');
const marketBtn = page.getByRole('button', { name: 'Marketplace' }).first();
await marketBtn.click();
await page.waitForTimeout(1000);

const micBtn = page.locator('.search-mic-btn');
assert.ok(await micBtn.count() > 0, 'Search mic button must be present in Marketplace search bar');

// 4. Farmer verification check
console.log('Checking Farmer KYC Verification workflow on live production...');
const signInBtn = page.locator('button.login-btn, button:has-text("Sign in")').first();
await signInBtn.click();
await page.waitForTimeout(500);

const farmerDemoBtn = page.locator('button:has-text("Ramesh Kumar (Farmer)")').first();
assert.ok(await farmerDemoBtn.count() > 0, 'Farmer demo sign-in button must exist');
await farmerDemoBtn.click();
await page.waitForTimeout(800);

const verifyTab = page.locator('.farmer-operations .tabs button:has-text("verification")').first();
assert.ok(await verifyTab.count() > 0, 'Farmer verification tab must exist');
await verifyTab.click();
await page.waitForTimeout(600);

const farmerVerifyBanner = page.locator('.verification-status-banner, .verification-form-box');
assert.ok(await farmerVerifyBanner.count() > 0, 'Farmer verification component must render');
console.log('Farmer verification workflow active and healthy!');

// 5. Admin KYC approvals tab
console.log('Checking Admin KYC review panel on live production...');
const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
await logoutBtn.click();
await page.waitForTimeout(500);

const adminLoginBtn = page.locator('button.login-btn, button:has-text("Sign in")').first();
await adminLoginBtn.click();
await page.waitForTimeout(400);

const adminDemoBtn = page.locator('button:has-text("Operations Admin")').first();
await adminDemoBtn.click();
await page.waitForTimeout(800);

const adminKycTab = page.locator('.admin-control .tabs button:has-text("Farmer KYC")').first();
assert.ok(await adminKycTab.count() > 0, 'Admin Farmer KYC tab must exist');
await adminKycTab.click();
await page.waitForTimeout(500);

const adminPanel = page.locator('.admin-work-panel');
assert.ok(await adminPanel.locator('button:has-text("Approve KYC & Mark Verified")').count() > 0, 'Approve KYC button must exist');

await browser.close();

assert.equal(errors.length, 0, `Page errors: ${errors.join(', ')}`);
console.log('========================================================================');
console.log('🚀 LIVE PRODUCTION VERIFICATION SUCCEEDED 100% on https://farmlinkk.vercel.app');
console.log('========================================================================');
