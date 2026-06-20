// Interaction smoke test: play a guess via the on-screen keyboard, then the
// give-up flow. Proves buildKeyboard/handleKey/submit/score/give-up run.
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';

const EXE = process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/' +
  'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const target = 'file://' + path.resolve('www/index.html');
fs.mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto(target, { waitUntil: 'load' });
await page.waitForSelector('#keyboard .key');

// force a known answer so scoring is deterministic, then start fresh
await page.evaluate(() => { window.__t = true; });

// type "crane" by CLICKING the on-screen keys, then the ENTER bar
for (const ch of ['c','r','a','n','e']) await page.click(`.key[data-key="${ch}"]`);
await page.click('.key[data-key="enter"]');
await page.waitForTimeout(1400);
const tiles = await page.$$eval('.row[data-row="0"] .tile',
  els => els.map(t => ({ ch: t.textContent, state: ['correct','present','absent'].find(c => t.classList.contains(c)) || 'none' })));
console.log('row 0 after guess "crane":', JSON.stringify(tiles));
await page.screenshot({ path: 'screenshots/play-guess.png' });

// give up: first tap -> confirm, second tap -> reveal
await page.click('#giveBtn');
const confirmLabel = await page.textContent('#giveBtn');
console.log('give-up first tap label:', JSON.stringify(confirmLabel));
await page.click('#giveBtn');
await page.waitForTimeout(300);
const msg = await page.textContent('#msg');
const over = await page.evaluate(() => window.over ?? document.querySelector('#giveBtn').hidden);
console.log('after reveal, message:', JSON.stringify(msg.trim()));
await page.screenshot({ path: 'screenshots/play-giveup.png' });

console.log('pageerrors:', errors.length ? errors : 'none');
await browser.close();
