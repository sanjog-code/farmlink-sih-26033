import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

console.log('Starting local vite preview on port 4173...');
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

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const toasts = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[BROWSER ERR]:', msg.text());
  });

  await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Expose toast collector
  await page.exposeFunction('onToastAdded', (text) => {
    toasts.push(text);
  });

  await page.evaluate(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            if (node.classList?.contains('toast')) {
              window.onToastAdded(node.textContent);
            } else if (node.querySelector?.('.toast')) {
              window.onToastAdded(node.querySelector('.toast').textContent);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Sign in as Farmer
  console.log('Opening Sign in...');
  const signInBtn = page.locator('button.login-btn, button:has-text("Sign in")').first();
  await signInBtn.click();
  await page.waitForTimeout(500);

  const quickFarmerBtn = page.locator('button:has-text("Ramesh Kumar (Farmer)")').first();
  assert.ok(await quickFarmerBtn.count() > 0, "Quick demo farmer login button should be present");
  await quickFarmerBtn.click();
  await page.waitForTimeout(800);

  // Go to Listings tab in Farmer Operations
  const listingsTab = page.locator('.tabs button:has-text("listings")');
  if (await listingsTab.count() > 0) {
    await listingsTab.click();
    await page.waitForTimeout(400);
  }

  // Find publish button
  const publishBtn = page.locator('button:has-text("Publish listing with photo"), button:has-text("Publishing")');
  const count = await publishBtn.count();
  console.log('Publish button count:', count);
  assert.ok(count > 0, 'Publish button should exist');

  // Trigger 5 rapid clicks on publish
  console.log('Dispatching 5 rapid clicks within 50ms on Publish listing...');
  toasts.length = 0;
  await Promise.all([
    publishBtn.click({ timeout: 1000 }).catch(() => {}),
    publishBtn.click({ timeout: 1000 }).catch(() => {}),
    publishBtn.click({ timeout: 1000 }).catch(() => {}),
    publishBtn.click({ timeout: 1000 }).catch(() => {}),
    publishBtn.click({ timeout: 1000 }).catch(() => {}),
  ]);

  await page.waitForTimeout(1200);
  console.log('Toasts recorded after 5 rapid clicks on publish:', toasts);

  // Rapid spam clicks must coalesce: at most 1 toast should be recorded
  assert.ok(toasts.length <= 1, `Spam clicks must coalesce: expected <= 1 toast, received ${toasts.length}`);
  console.log('✓ Farmer listing publish: rapid spam clicks successfully coalesced into single execution!');

  // Test Farmer produce collection request debounce
  const produceReqBtn = page.locator('button:has-text("Send request to warehouse"), button:has-text("Sending request")');
  if (await produceReqBtn.count() > 0) {
    console.log('Testing produce request button click coalescing...');
    toasts.length = 0;
    await Promise.all([
      produceReqBtn.click({ timeout: 1000 }).catch(() => {}),
      produceReqBtn.click({ timeout: 1000 }).catch(() => {}),
      produceReqBtn.click({ timeout: 1000 }).catch(() => {}),
      produceReqBtn.click({ timeout: 1000 }).catch(() => {}),
    ]);
    await page.waitForTimeout(1200);
    console.log('Toasts recorded after 4 rapid clicks on produce request:', toasts);
    assert.ok(toasts.length <= 1, `Produce request spam clicks must coalesce: expected <= 1 toast, received ${toasts.length}`);
    console.log('✓ Farmer produce request: rapid spam clicks successfully coalesced!');
  }

  // Switch to Admin to verify Admin Listing Approvals
  console.log('Switching to Admin...');
  const signOutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out")').first();
  await signOutBtn.click();
  await page.waitForTimeout(500);

  const adminSignInBtn = page.locator('button.login-btn, button:has-text("Sign in")').first();
  await adminSignInBtn.click();
  await page.waitForTimeout(400);

  const quickAdminBtn = page.locator('button:has-text("Operations Admin")').first();
  await quickAdminBtn.click();
  await page.waitForTimeout(800);

  // Navigate to listing approvals tab
  const adminListingTab = page.locator('.admin-control .tabs button:has-text("listings")').first();
  if (await adminListingTab.count() > 0) {
    await adminListingTab.click();
    await page.waitForTimeout(600);
  }

  // Check approve / reject buttons in admin
  const approveButtons = page.locator('.listing-action-row button:has-text("Approve with farmer photo"), .listing-action-row button:has-text("Schedule warehouse intake")');
  const approveCount = await approveButtons.count();
  console.log('Admin listing action buttons count:', approveCount);

  if (approveCount > 0) {
    toasts.length = 0;
    const targetBtn = approveButtons.first();
    console.log('Dispatching 5 rapid clicks on admin listing action...');
    await Promise.all([
      targetBtn.click({ timeout: 1000 }).catch(() => {}),
      targetBtn.click({ timeout: 1000 }).catch(() => {}),
      targetBtn.click({ timeout: 1000 }).catch(() => {}),
      targetBtn.click({ timeout: 1000 }).catch(() => {}),
      targetBtn.click({ timeout: 1000 }).catch(() => {}),
    ]);
    await page.waitForTimeout(1200);
    console.log('Toasts recorded after admin rapid clicks:', toasts);
    assert.ok(toasts.length <= 1, `Admin action spam clicks must coalesce: expected <= 1 toast, received ${toasts.length}`);
    console.log('✓ Admin listing actions: rapid clicks coalesced!');
  }

  console.log('\n========================================');
  console.log('ALL CLICK DEDUPLICATION & DEBOUNCE CHECKS PASSED!');
  console.log('========================================\n');
} finally {
  if (browser) await browser.close();
  preview.kill();
}
