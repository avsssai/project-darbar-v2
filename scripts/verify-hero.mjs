// Run after installing Playwright: pnpm add -D playwright && pnpm exec playwright install chromium
// Start the site separately with pnpm dev, then run node scripts/verify-hero.mjs.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { mockYoutube } from './helpers/mock-youtube.mjs';

const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const output = new URL('../artifacts/hero/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 320, height: 720 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await mockYoutube(page);
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
        hero: box('.hero'), header: box('.site-header'), band: box('.hero-figures'), field: box('.hero-field'),
        title: { x: titleInk.x, right: titleInk.right },
        figureCount: document.querySelectorAll('.hero-figures .figure').length,
        bandPhotoLoaded: [...document.querySelectorAll('.band-photo')].some((photo) => photo.complete && photo.naturalWidth > 0),
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
        fieldPattern: getComputedStyle(document.querySelector('.hero-field')).backgroundImage,
        keyline: getComputedStyle(document.querySelector('.hero-figures-front')).filter,
        originalPhoto: document.querySelector('.hero-figures--original') !== null,
        inkBoundary: Number(document.querySelector('[data-hero-light-start]').getAttribute('offset')) * document.querySelector('main').offsetHeight,
      };
    });
    assert.equal(layout.overflow, false, `${viewport.width}: horizontal overflow`);
    assert(layout.title.x >= 0 && layout.title.right <= viewport.width, 'Complete DARBAR title fits');
    assert(layout.band.x >= 0 && layout.band.right <= viewport.width, 'Band fits');
    assert(layout.band.y < layout.field.y && layout.band.bottom > layout.field.y, 'Ensemble bridges cream and maroon');
    assert(layout.field.height / layout.hero.height >= .44, 'Maroon field occupies the lower composition');
    assert(layout.fieldPattern.includes('paisley-ink.svg'), 'Local textile pattern is present');
    if (!layout.originalPhoto) assert(layout.keyline.includes('ensemble-edge'), 'Cutout ensemble has an ochre edge');
    assert(Math.abs(layout.inkBoundary - (layout.field.y - layout.header.height)) <= 1, 'Thread changes ink at the background divide');
    assert(layout.bandPhotoLoaded || layout.figureCount === 4, 'Approved ensemble photo or four silhouette fallback loads');
    assert.equal(await page.locator('.social-links--header a').count(), 2, 'Both header social links are visible');
    assert.equal(await page.locator('.social-links--footer a').count(), 2, 'Both footer social links are visible');
    assert.equal(await page.locator('.chakra-caption, .sound-thread > span, .mobile-finale > span').count(), 0, 'Thread helper captions are removed');
    assert.equal(await page.locator('[data-youtube-id]').count(), 5, 'All five supplied videos have playable previews');
    assert.equal(await page.locator('.music-thumbnail').evaluateAll((images) => images.every((image) => new URL(image.src).origin === location.origin)), true, 'Preview thumbnails are served locally');
    assert(layout.nav.every((r) => r.x >= 0 && r.right <= viewport.width && r.y >= 0 && r.bottom <= layout.header.height), 'Header links fit');
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

    // The final symbol must consume the same drawing distance per scroll pixel as the route.
    const samples = [];
    for (const progress of [.1, .3, .5, .8, 1, .5]) {
      samples.push(await page.evaluate(async (progress) => {
        const maxScroll = document.documentElement.scrollHeight - innerHeight;
        const anchors = JSON.parse(document.querySelector('.journey-rail').dataset.drawAnchors);
        const finalStart = anchors[anchors.length - 2];
        const sectionEnd = finalStart.scroll;
        window.scrollTo({ top: sectionEnd + (maxScroll - sectionEnd) * progress, behavior: 'instant' });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const route = document.querySelector('[data-rail-route]');
        const parts = [...document.querySelectorAll('[data-rail-symbol-part]')];
        const total = route.getTotalLength() + parts.reduce((sum, part) => sum + part.getTotalLength(), 0);
        const remaining = parseFloat(route.style.strokeDashoffset) + parts.reduce((sum, part) => sum + parseFloat(part.style.strokeDashoffset), 0);
        return {
          y: scrollY,
          drawn: total - remaining,
          rate: (total - finalStart.length) / (maxScroll - sectionEnd),
          remaining,
        };
      }, progress));
    }
    for (let i = 1; i < samples.length; i++) {
      const delta = samples[i].drawn - samples[i - 1].drawn;
      const expected = (samples[i].y - samples[i - 1].y) * samples[i].rate;
      assert(Math.abs(delta - expected) < 2, 'Stroke follows scroll at a constant rate through the ending and in reverse');
    }
    assert(samples[4].remaining < .01, 'Drawing finishes at the actual page bottom');
    assert(samples[3].remaining > 0, 'Contact and logo do not jump to completion before the bottom');

    for (const fraction of [0, .25, .5, .75, 1, .5]) {
      const symbol = await page.evaluate(async (fraction) => {
        const anchors = JSON.parse(document.querySelector('.journey-rail').dataset.drawAnchors);
        const start = anchors[anchors.length - 2];
        const end = anchors[anchors.length - 1];
        const route = document.querySelector('[data-rail-route]');
        const parts = [...document.querySelectorAll('[data-rail-symbol-part]')];
        const total = parts.reduce((sum, part) => sum + part.getTotalLength(), 0);
        const distance = route.getTotalLength() + total * fraction;
        window.scrollTo({ top: start.scroll + (distance - start.length) / (end.length - start.length) * (end.scroll - start.scroll), behavior: 'instant' });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const offsets = parts.map((part) => parseFloat(part.style.strokeDashoffset));
        return {
          fraction: (total - offsets.reduce((sum, value) => sum + value, 0)) / total,
          partial: offsets.filter((offset, index) => offset > .01 && offset < parts[index].getTotalLength() - .01).length,
        };
      }, fraction);
      assert(Math.abs(symbol.fraction - fraction) < .02, 'Visible logo strokes follow scroll progress in both directions');
      assert(symbol.partial <= 1, 'Logo subpaths reveal sequentially instead of all snapping on');
    }

    const formation = [];
    for (const fraction of [0, .5, 1, .5, 0]) {
      formation.push(await page.evaluate(async (fraction) => {
        const rail = document.querySelector('.journey-rail');
        const start = Number(rail.dataset.instrumentScrollStart);
        const end = Number(rail.dataset.instrumentScrollEnd);
        window.scrollTo({ top: start + (end - start) * fraction, behavior: 'instant' });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const route = document.querySelector('[data-rail-route]');
        const drawn = route.getTotalLength() - parseFloat(route.style.strokeDashoffset);
        const lengthStart = Number(rail.dataset.instrumentStart);
        const lengthEnd = Number(rail.dataset.instrumentEnd);
        return (drawn - lengthStart) / (lengthEnd - lengthStart);
      }, fraction));
    }
    for (const [index, expected] of [0, .5, 1, .5, 0].entries()) assert(Math.abs(formation[index] - expected) < .01, 'Instrument motif draws and undraws with section scroll');

    // Exercise verified video entries when present, without depending on YouTube playback/network.
    const previews = page.locator('[data-youtube-id]');
    if (await previews.count()) {
      assert.equal(await page.locator('.video-frame').count(), 0, 'Player is not loaded before interaction');
      await page.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ contentType: 'text/html', body: '<p>Video player</p>' }));
      await previews.first().click();
      await page.waitForSelector('.video-frame');
      assert.equal(await page.locator('.video-frame').count(), 1);
      assert((await page.locator('.video-frame').getAttribute('src')).startsWith('https://www.youtube-nocookie.com/embed/'));
      await page.locator('[data-showcase-next]').click();
      await page.waitForFunction(() => document.querySelector('[data-showcase-count]').textContent.startsWith('02'));
      await page.waitForFunction(() => document.querySelector('[data-showcase]').dataset.playback === 'playing');
      assert.equal(await page.locator('.video-frame').count(), 1, 'Starting another performance stops the previous one');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('[data-rail-route]').evaluate((path) => parseFloat(getComputedStyle(path).strokeDashoffset)), 0);
    assert(await page.locator('[data-rail-symbol-part]').evaluateAll((parts) => parts.every((part) => parseFloat(getComputedStyle(part).strokeDashoffset) === 0)), 'Reduced motion shows every logo stroke');
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}×${viewport.height}`);
    await page.close();
  }
} finally {
  await browser.close();
}
