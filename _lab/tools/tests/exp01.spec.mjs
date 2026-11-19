import { test, expect } from '@playwright/test';

const URL = '/lab/01-materials/';

test.describe('exp01 content', () => {
  test('three packages with exact titles', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('article.pkg h3')).toHaveText([
      'M365 Security Baseline',
      'AI Readiness and Governance',
      'Full Assessment plus 30-day recheck',
    ]);
  });

  test('prices from valor-ops.com', async ({ page }) => {
    await page.goto(URL);
    const prices = page.locator('article.pkg .pkg-price');
    await expect(prices.nth(0)).toContainText('$1,500');
    await expect(prices.nth(1)).toContainText('$2,000');
    await expect(prices.nth(2)).toContainText('$3,500');
  });

  test('deliverables are in the DOM and not hidden from assistive tech', async ({ page }) => {
    await page.goto(URL);
    const details = page.locator('article.pkg .pkg-detail');
    await expect(details).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      expect(await details.nth(i).locator('li').count()).toBeGreaterThanOrEqual(3);
      await expect(details.nth(i)).not.toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('CTA', async ({ page }) => {
    await page.goto(URL);
    const cta = page.locator('a.cta');
    await expect(cta).toHaveText('Book a 30-minute call');
    await expect(cta).toHaveAttribute('href', 'https://valor-ops.com/contact/');
  });

  test('hero h1 is at most two lines at 360x640', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(URL);
    await page.evaluate(() => document.fonts.ready);
    const lines = await page.locator('h1').evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    expect(lines).toBeLessThanOrEqual(2.1);
  });
});

const lx = (card) => card.evaluate((el) => el.style.getPropertyValue('--lx'));

test.describe('exp01 glass and lens', () => {
  test('inspect toggles', async ({ page }) => {
    await page.goto(URL);
    const card = page.locator('article.pkg').nth(0);
    const btn = card.locator('.inspect');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(card).toHaveClass(/is-clear/);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await expect(card).not.toHaveClass(/is-clear/);
  });

  test('keyboard toggles inspect', async ({ page }) => {
    await page.goto(URL);
    const card = page.locator('article.pkg').nth(0);
    await card.locator('.inspect').focus();
    await page.keyboard.press('Space');
    await expect(card).toHaveClass(/is-clear/);
  });

  test('pointer lens follows a fine pointer', async ({ page }) => {
    await page.goto(URL);
    const card = page.locator('article.pkg').nth(1);
    await card.locator('.frost').scrollIntoViewIfNeeded();
    const box = await card.locator('.frost').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width / 2 + 5, box.y + box.height / 2);
    await expect.poll(() => lx(card)).toMatch(/^[1-9]\d*(\.\d+)?px$/);
  });

  test('no backdrop-filter falls back to an opaque frost', async ({ page }) => {
    await page.addInitScript(() => {
      const orig = CSS.supports.bind(CSS);
      CSS.supports = (...a) => (String(a.join(' ')).includes('backdrop-filter') ? false : orig(...a));
    });
    await page.goto(URL);
    await expect(page.locator('html')).toHaveClass(/no-backdrop/);
    const alpha = await page.locator('.frost').first().evaluate((el) => {
      const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/)[1].split(/[ ,/]+/).filter(Boolean);
      return m.length === 4 ? Number(m[3]) : 1;
    });
    expect(alpha).toBe(1);
  });
});

test.describe('exp01 touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('tap places the lens without scrolling', async ({ page }) => {
    await page.goto(URL);
    const card = page.locator('article.pkg').nth(2);
    const frost = card.locator('.frost');
    await frost.scrollIntoViewIfNeeded();
    const y0 = await page.evaluate(() => scrollY);
    const box = await frost.boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect.poll(() => lx(card)).toMatch(/px$/);
    expect(await page.evaluate(() => scrollY)).toBe(y0);
  });

  test('frost allows vertical panning', async ({ page }) => {
    await page.goto(URL);
    expect(await page.locator('.frost').first().evaluate((el) => getComputedStyle(el).touchAction)).toBe('pan-y');
  });
});

test.describe('exp01 reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('lens does not follow the pointer, inspect still works', async ({ page }) => {
    await page.goto(URL);
    const card = page.locator('article.pkg').nth(1);
    const box = await card.locator('.frost').boundingBox();
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.move(box.x + 40, box.y + 30);
    await page.waitForTimeout(100);
    expect(await lx(card)).toBe('');
    await card.locator('.inspect').click();
    await expect(card).toHaveClass(/is-clear/);
  });
});
