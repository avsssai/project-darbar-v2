// Run after installing Playwright: pnpm add -D playwright && pnpm exec playwright install chromium
// Start the site separately with pnpm dev, then run node scripts/verify-hero.mjs.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const output = new URL('../artifacts/hero/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 320, height: 720 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const box = (selector) => {
        const { x, y, width, height, bottom, right } = document.querySelector(selector).getBoundingClientRect();
        return { x, y, width, height, bottom, right };
      };
      const title = document.querySelector('.title-name');
      const range = document.createRange();
      range.selectNodeContents(title);
      const titleInk = range.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        hero: box('.hero'), header: box('.site-header'), band: box('.hero-figures'),
        title: { x: titleInk.x, right: titleInk.right },
        figureCount: document.querySelectorAll('.hero-figures .figure').length,
        nav: [...document.querySelectorAll('.site-header a')].map((a) => {
          const r = a.getBoundingClientRect();
          return { x: r.x, right: r.right, y: r.y, bottom: r.bottom };
        }),
        font: document.fonts.check('16px Italiana'),
        family: getComputedStyle(title).fontFamily,
        weight: getComputedStyle(title).fontWeight,
        route: document.querySelector('[data-rail-route]').getAttribute('d'),
        staticRail: getComputedStyle(document.querySelector('[data-rail-route]')).strokeDashoffset,
        titleTransform: getComputedStyle(document.querySelector('.hero h1')).transform,
      };
    });
    assert.equal(layout.overflow, false, `${viewport.width}: horizontal overflow`);
    assert(layout.title.x >= 0 && layout.title.right <= viewport.width, 'Complete DARBAR title fits');
    assert(layout.band.x >= 0 && layout.band.right <= viewport.width, 'Band fits');
    assert.equal(layout.figureCount, 4, 'Four silhouettes remain visible');
    assert(layout.nav.every((r) => r.x >= 0 && r.right <= viewport.width && r.y >= 0 && r.bottom <= 56), 'Header links fit');
    assert(layout.font && layout.family.includes('Italiana') && layout.weight === '400', 'Italiana Regular loaded');
    assert.equal(Number.parseFloat(layout.staticRail), 0, 'Reduced motion shows complete thread');
    assert.equal(layout.titleTransform, 'none', 'Reduced motion resets parallax');
    assert(layout.route.startsWith(`M${viewport.width * 0.946} 0`), 'Thread joins the header rule');
    if (viewport.width > 760) assert(Math.abs(layout.hero.bottom - viewport.height) <= 1, 'Header and hero fill one viewport');
    await page.screenshot({ path: new URL(`${viewport.width}x${viewport.height}.png`, output).pathname });

    // The skip link and all header links must be reachable in the intended order.
    for (const href of ['#main', '#top', '#music', '#about', '#artists', '#contact']) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), href);
    }
    await page.evaluate(() => window.scrollTo(0, innerHeight));
    const panel = await page.locator('.featured-music').boundingBox();
    assert(panel && panel.y < viewport.height && panel.y + panel.height > 0, 'One viewport of scroll reveals featured music');
    await page.screenshot({ path: new URL(`${viewport.width}x${viewport.height}-music.png`, output).pathname });
    assert.equal(await page.locator('.hero + #music').count(), 1, 'Music immediately follows hero');

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => window.scrollTo(0, document.querySelector('.hero').offsetHeight / 2));
    await page.waitForTimeout(100);
    const shifts = await page.evaluate(() => ({
      title: parseFloat(document.querySelector('.hero').style.getPropertyValue('--title-shift')),
      band: parseFloat(document.querySelector('.hero-figures').style.getPropertyValue('--front-shift')),
    }));
    assert(shifts.title >= -20 && shifts.title <= 0 && shifts.band >= -60 && shifts.band <= 0, 'Parallax stays within limits');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('[data-rail-route]').evaluate((path) => parseFloat(getComputedStyle(path).strokeDashoffset)), 0);
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}×${viewport.height}`);
    await page.close();
  }
} finally {
  await browser.close();
}
