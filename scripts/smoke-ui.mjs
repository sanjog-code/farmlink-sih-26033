import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const page=await browser.newPage({viewport});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Sign in'}).click();
 await page.getByRole('main').getByRole('button',{name:'Farmer',exact:true}).click();
 await page.getByRole('main').getByRole('button',{name:'Consumer',exact:true}).click();
 assert.equal(await page.locator('input[aria-label="Password"]').count(),1);
 assert.ok(await page.locator('body').evaluate(body=>body.scrollWidth<=document.documentElement.clientWidth+2),'page has horizontal overflow');
 assert.deepEqual(errors,[]);
 await page.close();
}
await browser.close();
console.log('Desktop and mobile auth smoke checks passed.');
