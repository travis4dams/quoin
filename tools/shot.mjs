// Screenshot QUOIN at iPhone sizes using the cached Playwright Chromium.
// Usage: node tools/shot.mjs [url-or-default-local-file]
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';

const EXE = process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/' +
  'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const target = process.argv[2] || ('file://' + path.resolve('www/index.html'));
const outDir = 'screenshots';
fs.mkdirSync(outDir, { recursive: true });

// CSS-pixel viewports. In a Home-Screen (standalone) PWA the webview is ~full
// screen height; the SE is the tightest because it's shortest.
// insetTop/insetBottom = safe-area reserved by iOS in a standalone (Home Screen)
// PWA. Chromium headless reports env(safe-area-inset-*) as 0, so we inject these
// to measure/screenshot what the real device actually shows.
const devices = [
  { name: 'iphone-se',        width: 375, height: 667, insetTop: 20, insetBottom: 0 },
  { name: 'iphone-13',        width: 390, height: 844, insetTop: 47, insetBottom: 34 },
  { name: 'iphone-15-promax', width: 430, height: 932, insetTop: 59, insetBottom: 34 },
];

const browser = await chromium.launch({ executablePath: EXE, headless: true });
console.log('target:', target, '\n');
for (const d of devices) {
  const ctx = await browser.newContext({
    viewport: { width: d.width, height: d.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  await page.goto(target, { waitUntil: 'load' });
  await page.waitForSelector('#keyboard .key', { timeout: 5000 }).catch(() => {});
  // simulate iOS safe-area insets (header top / footer bottom)
  await page.addStyleTag({ content:
    `header{padding-top:${d.insetTop}px !important}` +
    `footer{padding-bottom:${Math.max(d.insetBottom, 10)}px !important}` });
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({
    innerH: window.innerHeight,
    contentH: document.documentElement.scrollHeight,
  }));
  const over = m.contentH - m.innerH;
  console.log(
    `${d.name.padEnd(18)} ${d.width}x${d.height}  innerH=${m.innerH}  content=${m.contentH}  ` +
    (over > 0 ? `overflow=+${over}  ⚠ SCROLLS` : `slack=${-over}  ✓ fits`)
  );
  await page.screenshot({ path: `${outDir}/${d.name}.png` }); // viewport-only
  await ctx.close();
}
await browser.close();
console.log('\nsaved to', outDir + '/');
