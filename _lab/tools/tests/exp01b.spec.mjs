import { test, expect } from '@playwright/test';

const URL = '/lab/01b-quote/';
const total = (page) => page.locator('.q-total');
const pick = (page, name, value) => page.locator(`#quote input[name="${name}"][value="${value}"]`).check({ force: true });

test.describe('exp01b pricing', () => {
  test('default is Baseline up to 25 users', async ({ page }) => {
    await page.goto(URL);
    await expect(total(page)).toContainText('$1,500');
  });

  test('26 to 50 with Full Assessment', async ({ page }) => {
    await page.goto(URL);
    await pick(page, 'size', 'le50');
    await pick(page, 'package', 'full');
    await expect(total(page)).toContainText('$4,500');
  });

  test('AI Readiness is flat up to 50', async ({ page }) => {
    await page.goto(URL);
    await pick(page, 'size', 'le50');
    await pick(page, 'package', 'ai');
    await expect(total(page)).toContainText('$2,000');
  });

  test('Core 11 adds a line and $3,900', async ({ page }) => {
    await page.goto(URL);
    await page.locator('#quote input[name="core11"]').check({ force: true });
    await expect(total(page)).toContainText('$5,400');
    await expect(page.locator('.q-lines li')).toContainText(['Core 11']);
  });

  test('remediation is a separate estimate', async ({ page }) => {
    await page.goto(URL);
    await page.locator('#quote input[name="hours"]').fill('8');
    await expect(page.locator('.q-remed')).toContainText('$1,200');
    await expect(total(page)).toContainText('$1,500');
  });

  test('over 50 users is quoted, no dollar total', async ({ page }) => {
    await page.goto(URL);
    await pick(page, 'size', 'gt50');
    await expect(total(page)).toContainText('scoping call');
    expect(await total(page).innerText()).not.toContain('$');
  });

  test('arrow keys in the package group update the total', async ({ page }) => {
    await page.goto(URL);
    await page.locator('#quote input[name="package"][value="baseline"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(total(page)).toContainText('$2,000');
  });

  test('total is announced', async ({ page }) => {
    await page.goto(URL);
    await expect(total(page)).toHaveAttribute('aria-live', 'polite');
  });

  test('every price is visible without interaction', async ({ page }) => {
    await page.goto(URL);
    const text = await page.locator('.price-list').innerText();
    for (const p of ['$1,500', '$2,500', '$2,000', '$3,500', '$4,500', '$3,900', '$150']) expect(text).toContain(p);
  });

  test('CTA', async ({ page }) => {
    await page.goto(URL);
    const cta = page.locator('a.cta').first();
    await expect(cta).toHaveText('Book a 30-minute call');
    await expect(cta).toHaveAttribute('href', 'https://valor-ops.com/contact/');
  });

  test('no glass anywhere', async ({ page }) => {
    await page.goto(URL);
    const glassy = await page.evaluate(() => [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return (s.backdropFilter && s.backdropFilter !== 'none') || (s.webkitBackdropFilter && s.webkitBackdropFilter !== 'none');
    }).length);
    expect(glassy).toBe(0);
  });

  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`three wires drawn at ${vp.width}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(URL);
      const wires = page.locator('#wires path.wire');
      await expect(wires).toHaveCount(3);
      for (let i = 0; i < 3; i++) await expect(wires.nth(i)).toHaveAttribute('d', /^M[\d.-]+/);
    });
  }

  test('hero h1 is at most two lines at 360x640', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(URL);
    await page.evaluate(() => document.fonts.ready);
    const lines = await page.locator('h1').evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    expect(lines).toBeLessThanOrEqual(2.1);
  });
});

test.describe('exp01b reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('wires do not animate', async ({ page }) => {
    await page.goto(URL);
    await pick(page, 'package', 'full');
    const name = await page.locator('#wires path.wire').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('none');
  });
});

test.describe('exp01b v2.1 wires stay lit', () => {
  test('wires keep flowing after the change pulse ends', async ({ page }) => {
    await page.goto(URL);
    await pick(page, 'package', 'full');
    await page.waitForTimeout(1500);
    const w = page.locator('#wires path.wire').first();
    expect(await w.evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');
    expect(await w.evaluate((el) => getComputedStyle(el).animationIterationCount)).toBe('infinite');
  });

  test('wires use the accent colour at rest', async ({ page }) => {
    await page.goto(URL);
    const [stroke, accent] = await page.evaluate(() => {
      const probe = document.createElement('i');
      probe.style.color = 'var(--accent)';
      document.body.append(probe);
      const a = getComputedStyle(probe).color;
      probe.remove();
      return [getComputedStyle(document.querySelector('#wires path.wire')).stroke, a];
    });
    const rgb = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    expect(rgb(stroke)).toEqual(rgb(accent));
  });
});

test.describe('exp01b palette switcher', () => {
  test('default palette is oxide', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'oxide');
  });

  test('choosing a palette regrades the page and persists via the URL', async ({ page }) => {
    await page.goto(URL);
    const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
    await page.locator('.palette input[value="phosphor"]').check({ force: true });
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'phosphor');
    const after = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
    expect(after).not.toBe(before);
    await expect(page).toHaveURL(/palette=phosphor/);
  });

  test('palette param on load is applied', async ({ page }) => {
    await page.goto(URL + '?palette=oxide');
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'oxide');
    await expect(page.locator('.palette input[value="oxide"]')).toBeChecked();
  });

  for (const p of ['signal', 'arctic', 'phosphor', 'oxide']) {
    test(`button text contrast holds in ${p}`, async ({ page }) => {
      await page.goto(URL + '?palette=' + p);
      const ratio = await page.locator('a.cta').first().evaluate((el) => {
        const lum = (c) => { const v = c.match(/\d+(\.\d+)?/g).slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
        const s = getComputedStyle(el); const a = lum(s.color), b = lum(s.backgroundColor);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }
});

test.describe('exp01b palette switch is instant', () => {
  test('buttons and selected options take the new accent immediately', async ({ page }) => {
    await page.goto(URL + '?palette=signal');
    await page.locator('.palette input[value="phosphor"]').check({ force: true });
    const got = await page.evaluate(() => [
      getComputedStyle(document.querySelector('.cta')).backgroundColor,
      getComputedStyle(document.querySelector('.seg input:checked + span')).backgroundColor,
      getComputedStyle(document.querySelector('.stack input:checked + span')).backgroundColor,
    ]);
    expect(got).toEqual(['rgb(110, 240, 154)', 'rgb(110, 240, 154)', 'rgb(110, 240, 154)']);
  });
});
