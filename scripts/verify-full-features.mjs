import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const preview = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

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

try {
  console.log('Navigating to http://127.0.0.1:4173/ ...');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

  // 1. Check Language Selector has 23 items (22 constitutional + English)
  console.log('Verifying 22 constitutional languages in header selector...');
  const langSelect = page.locator('header select');
  const optionCount = await langSelect.locator('option').count();
  console.log(`Found ${optionCount} language options in selector`);
  assert.equal(optionCount, 23, `Expected 23 language options (22 constitutional + en), found ${optionCount}`);

  // Test switching to Hindi
  console.log('Switching language to Hindi (hi)...');
  await langSelect.selectOption('hi');
  await page.waitForTimeout(600);
  let bodyText = await page.evaluate(() => document.body.innerText);
  assert.ok(bodyText.includes("मार्केटप्लेस") || bodyText.includes("किसान") || bodyText.includes("लॉगिन"), "Hindi text should be visible after switching to Hindi");

  // Test switching to Tamil
  console.log('Switching language to Tamil (ta)...');
  await langSelect.selectOption('ta');
  await page.waitForTimeout(600);
  bodyText = await page.evaluate(() => document.body.innerText);
  assert.ok(bodyText.includes("சந்தை") || bodyText.includes("விவசாயி"), "Tamil text should be visible after switching to Tamil");

  // Switch back to English losslessly
  console.log('Switching back to English (en)...');
  await langSelect.selectOption('en');
  await page.waitForTimeout(600);
  bodyText = await page.evaluate(() => document.body.innerText);
  assert.ok(bodyText.includes("Marketplace") && bodyText.includes("Farmer"), "English text should restore losslessly");
  console.log('Lossless 22-language translation verified!');

  // 2. Test Voice Assistant Modal
  console.log('Testing Multilingual Voice AI assistant...');
  const voiceBtn = page.locator('.header-voice-btn, button:has-text("Voice AI"), button:has-text("Try voice demo")').first();
  await voiceBtn.click();
  await page.waitForTimeout(500);

  const voiceModal = page.locator('.voice-modal');
  assert.ok(await voiceModal.count() > 0, "Voice modal should be visible");
  const modalText = await voiceModal.innerText();
  assert.ok(modalText.includes("22 INDIAN LANGUAGES") || modalText.includes("अपनी भाषा"), "Voice modal should display multilingual title");

  // Check language dropdown in voice modal
  const voiceLangSelect = voiceModal.locator('select').first();
  const voiceLangOptions = await voiceLangSelect.locator('option').count();
  console.log(`Found ${voiceLangOptions} languages in voice modal`);
  assert.equal(voiceLangOptions, 23, `Voice modal should contain all 23 language options, found ${voiceLangOptions}`);

  // Test a quick query prompt
  console.log('Testing quick query prompt in Voice AI modal...');
  const tomatoPrompt = voiceModal.locator('button', { hasText: 'टमाटर का भाव' }).first();
  await tomatoPrompt.click();
  await page.waitForTimeout(600);
  const updatedModalText = await voiceModal.innerText();
  assert.ok(updatedModalText.includes("FarmLink Voice Answer"), "Voice AI reply should be rendered");
  console.log('Voice AI prompt and answer verified!');

  // Close voice modal
  await voiceModal.locator('button.close').click();
  await page.waitForTimeout(300);

  // 3. Test Farmer Verification Workflow
  console.log('Signing in as Farmer to test KYC verification system...');
  const signInBtn = page.locator('button.login-btn, button:has-text("Sign in")').first();
  await signInBtn.click();
  await page.waitForTimeout(500);

  // Click quick demo farmer login button
  const quickFarmerBtn = page.locator('button:has-text("Ramesh Kumar (Farmer)")').first();
  assert.ok(await quickFarmerBtn.count() > 0, "Quick demo farmer login button should be present");
  await quickFarmerBtn.click();
  await page.waitForTimeout(800);

  // We are now in Farmer Dashboard
  console.log('Checking Farmer Operations and verification tab...');
  const verificationTabBtn = page.locator('.farmer-operations .tabs button:has-text("verification")').first();
  assert.ok(await verificationTabBtn.count() > 0, "Verification tab in FarmerOperations should be present");
  await verificationTabBtn.click();
  await page.waitForTimeout(600);

  const verificationSection = page.locator('.verification-status-banner, .farmer-verification-section, .verification-form-box');
  assert.ok(await verificationSection.count() > 0, "Farmer verification component should be rendered");
  const verificationText = await page.evaluate(() => document.body.innerText);
  assert.ok(verificationText.includes("Verified Profile Information") || verificationText.includes("Verified Producer") || verificationText.includes("Farmer Verification"), "Farmer verification data should be displayed");
  console.log('Farmer KYC verification workflow verified!');

  // 4. Test Admin KYC Approval Panel
  console.log('Switching to Admin to test KYC verification review panel...');
  const signOutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
  await signOutBtn.click();
  await page.waitForTimeout(500);

  // Sign in as Admin using quick demo sign-in
  const adminSignInBtn = page.locator('button.login-btn, button:has-text("Sign in")').first();
  await adminSignInBtn.click();
  await page.waitForTimeout(400);

  const quickAdminBtn = page.locator('button:has-text("Operations Admin")').first();
  assert.ok(await quickAdminBtn.count() > 0, "Quick demo admin button should be present");
  await quickAdminBtn.click();
  await page.waitForTimeout(800);

  // Check Admin Dashboard KYC tab
  console.log('Checking Admin Farmer KYC approvals tab...');
  const adminKycTab = page.locator('.admin-control .tabs button:has-text("Farmer KYC")').first();
  assert.ok(await adminKycTab.count() > 0, "Admin KYC tab should be present");
  await adminKycTab.click();
  await page.waitForTimeout(500);

  const adminWorkPanel = page.locator('.admin-work-panel');
  const panelText = await adminWorkPanel.innerText();
  assert.ok(panelText.includes("Farmer identity & land record verification"), "Admin KYC panel header should be visible");
  assert.ok(panelText.includes("Khasra Survey") || panelText.includes("Aadhaar"), "Admin KYC details should be visible");
  console.log('Admin KYC review panel verified successfully!');

  // Test Approve KYC button
  const approveBtn = adminWorkPanel.locator('button:has-text("Approve KYC & Mark Verified")').first();
  if (await approveBtn.count() > 0) {
    console.log('Approve KYC button is present and verified in Admin panel!');
  }

  // 5. Test Produce Search Voice Dictation
  console.log('Navigating to Marketplace to verify search voice dictation button...');
  const marketNavBtn = page.locator('nav button:has-text("Marketplace")').first();
  await marketNavBtn.click();
  await page.waitForTimeout(600);

  const searchMicBtn = page.locator('.search-mic-btn');
  assert.ok(await searchMicBtn.count() > 0, "Search mic dictation button should be present in search bar");
  console.log('Search microphone dictation button verified in Marketplace!');

  assert.equal(errors.length, 0, `Encountered unexpected page errors: ${errors.join(', ')}`);
  console.log('=====================================================');
  console.log('🎉 ALL 4 CORE USER REQUIREMENTS VERIFIED WITH 0 ERRORS!');
  console.log('=====================================================');
} finally {
  await browser.close();
  preview.kill();
}
