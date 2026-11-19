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
