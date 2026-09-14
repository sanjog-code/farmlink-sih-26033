import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

await mkdir('outputs/demo-video', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\ASUS\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: 'outputs/demo-video', size: { width: 1440, height: 900 } }
});
const page = await context.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
await page.getByRole('button', { name: 'Marketplace', exact: true }).click();
await page.waitForTimeout(1200);
await page.getByText('Reserve 10 kg').first().click();
await page.waitForTimeout(1400);
await page.getByRole('button', { name: 'Warehouse', exact: true }).click();
await page.waitForTimeout(1300);
await page.getByRole('button', { name: 'Create lot & QR record' }).click();
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Farmer', exact: true }).click();
await page.waitForTimeout(1400);
await page.getByText('View price guidance').click();
await page.waitForTimeout(1800);
await page.getByRole('button', { name: 'List for buyers' }).click();
await page.waitForTimeout(1000);
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.getByText('Try voice demo').click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Start speaking' }).click();
await page.waitForTimeout(2500);
await context.close();
await browser.close();
