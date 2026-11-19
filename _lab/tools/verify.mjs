// Section 10 harness from valorops-web-design, plus a glass cost measurement.
// Usage: node verify.mjs <url> [--perf]   (server must be running: node server.mjs)
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'http://127.0.0.1:4500/lab/01-materials/';
const perfOnly = process.argv.includes('--perf');
const runs = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'phone', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  { name: 'compact', viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true },
  { name: 'reduced', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
];
await mkdir('shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });

if (!perfOnly) {
  for (const r of runs) {
    const ctx = await browser.newContext({ viewport: r.viewport, isMobile: r.isMobile, hasTouch: r.hasTouch, reducedMotion: r.reducedMotion });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('requestfailed', (q) => errors.push('FAILED ' + q.url()));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const steps = Math.max(6, Math.round(H / (r.viewport.height * 0.5)));
    for (let i = 0; i <= steps; i++) {
      await page.evaluate((y) => scrollTo(0, y), Math.round((H * i) / steps));
      await page.waitForTimeout(250);
      await page.screenshot({ path: `shots/${r.name}-${String(i).padStart(3, '0')}.png` });
    }
    console.log(r.name, { errors, horizontalOverflow: overflow, frames: steps + 1 });
    await ctx.close();
  }
}

// Glass cost: 390x844, CPU throttled 4x, sweep a mouse lens across all frosts for ~3s.
async function sweep(forceNoBackdrop) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  if (forceNoBackdrop) {
    await page.addInitScript(() => {
      const orig = CSS.supports.bind(CSS);
      CSS.supports = (...a) => (String(a.join(' ')).includes('backdrop-filter') ? false : orig(...a));
    });
  }
  await page.goto(url, { waitUntil: 'networkidle' });
  if (forceNoBackdrop) await page.addStyleTag({ url: '/_lab/tools/no-backdrop.css' });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => {
    window.__frames = [];
    const tick = (t) => { window.__frames.push(t); window.__raf = requestAnimationFrame(tick); };
    window.__raf = requestAnimationFrame(tick);
  });
  const frosts = page.locator('.frost');
  const n = await frosts.count();
  const t0 = Date.now();
  while (Date.now() - t0 < 3000) {
    for (let i = 0; i < n; i++) {
      await frosts.nth(i).scrollIntoViewIfNeeded();
      const b = await frosts.nth(i).boundingBox();
      for (let k = 0; k <= 10; k++) await page.mouse.move(b.x + (b.width * k) / 10, b.y + b.height / 2);
    }
  }
  const frames = await page.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__frames; });
  const d = frames.slice(1).map((t, i) => t - frames[i]).sort((a, b) => a - b);
  const q = (p) => d[Math.min(d.length - 1, Math.floor(d.length * p))];
  await ctx.close();
  return { frames: d.length, medianMs: +q(0.5).toFixed(1), p95Ms: +q(0.95).toFixed(1), over16_7: `${Math.round((100 * d.filter((x) => x > 16.7).length) / d.length)}%` };
}
console.log('perf glass', await sweep(false));
console.log('perf no-backdrop', await sweep(true));
await browser.close();
