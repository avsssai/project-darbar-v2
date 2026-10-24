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

  // Observe from before the head initializer, including its very first pending state.
  async function instrument(page) {
    await mockYoutube(page);
    await page.addInitScript(() => {
      window.heroStates = [];
      window.heroShifts = [];
      new MutationObserver(() => {
        const state = document.documentElement?.dataset.heroEntrance;
        if (state && window.heroStates.at(-1)?.state !== state) window.heroStates.push({ state, time: performance.now() });
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-hero-entrance'] });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (document.documentElement.dataset.heroEntrance === 'running' && !entry.hadRecentInput) window.heroShifts.push(entry.value);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
  }
  async function settled(page) {
    await page.waitForFunction(() => document.documentElement.dataset.heroEntrance === 'complete');
    const pose = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.hero-entrance'));
      return { opacity: style.opacity, transform: style.transform, overflow: document.documentElement.scrollWidth > innerWidth };
    });
    assert.deepEqual(pose, { opacity: '1', transform: 'none', overflow: false });
  }
  for (const width of [320, 390, 768, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await instrument(page);
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.heroEntrance === 'running');
    await page.waitForFunction(() => document.documentElement.dataset.heroLogo === 'running');
    const timing = await page.evaluate(() => {
      const selectors = ['.title-top', '.title-name', '.hero-entrance'];
      return selectors.map((selector) => {
        const style = getComputedStyle(document.querySelector(selector));
        return [style.animationDuration, style.animationDelay, style.animationTimingFunction];
      });
    });
    assert.deepEqual(timing.map((t) => t.slice(0, 2)), [['0.6s', '0s'], ['0.72s', '0.08s'], ['0.7s', '0.2s']]);
    assert(timing.every((t) => t[2] === 'cubic-bezier(0.23, 1, 0.32, 1)'));
    const logoTiming = await page.evaluate(() => {
      const timingFor = (selector) => getComputedStyle(document.querySelector(selector)).animationDelay;
      return ['.hero-logo-triangle-trace', '.hero-logo-dot', '.hero-logo-string', '.hero-brand-motion'].map(timingFor);
    });
    assert.deepEqual(logoTiming, ['0.32s, 0.77s', '0.32s', '0.8s', '1.4s'], 'Triangles and dot begin together, followed by strings and the damaru twist');
    assert.equal(await page.locator('.hero-bottom a').count(), 0, 'Hero has no redundant listening link');
    assert(await page.locator('.main-nav').isVisible());
    await settled(page);
    await page.waitForFunction(() => document.documentElement.dataset.heroCallouts === 'running');
    assert(await page.locator('.hero-source-photo:visible .hero-callout-arrow:not(.hero-callout-arrow--underlay)').evaluateAll((arrows) => arrows.every((arrow) => getComputedStyle(arrow).animationName === 'callout-draw')), 'Arrow strokes draw after the photo settles');
    await page.waitForFunction(() => document.documentElement.dataset.heroCallouts === 'complete');
    await page.waitForFunction(() => document.documentElement.dataset.heroLogo === 'complete');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.heroLogo), 'complete');
    assert.equal(await page.locator('.hero-brand-motion').evaluate((mark) => getComputedStyle(mark).transform), 'none', 'Logo settles without a residual transform');
    const trace = await page.evaluate(() => ({ states: window.heroStates, shifts: window.heroShifts }));
    assert.deepEqual(trace.states.map((s) => s.state), ['pending', 'running', 'complete']);
    assert(trace.states[2].time - trace.states[1].time <= 1000, '900ms playback plus scheduling tolerance');
    assert.equal(trace.shifts.reduce((sum, value) => sum + value, 0), 0, 'Entrance causes no layout shift');
    await page.screenshot({ path: new URL(`${width}-entrance-complete.png`, output).pathname });
    await page.close();
  }
  for (const scenario of ['slow-image', 'failed-image', 'delayed-font', 'hash', 'scroll', 'focus', 'reduced', 'hidden', 'history', 'fail-open']) {
    const page = await browser.newPage();
    await instrument(page);
    if (scenario === 'slow-image' || scenario === 'failed-image') {
      await page.route('**/band-cutout-clear.webp', async (route) => {
        if (scenario === 'failed-image') return route.abort();
        await new Promise((resolve) => setTimeout(resolve, 1100));
        await route.continue();
      });
    }
    if (scenario === 'delayed-font') await page.route('**/italiana-latin-400.woff2', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      await route.continue();
    });
    if (scenario === 'fail-open') await page.addInitScript(() => {
      // Simulate setup failure after pending is set but before readiness can run.
      document.addEventListener('DOMContentLoaded', (event) => event.stopImmediatePropagation(), { capture: true });
    });
    await page.goto(baseURL + (scenario === 'hash' ? '/#music' : ''), { waitUntil: 'domcontentloaded' });
    if (['scroll', 'focus', 'reduced', 'hidden'].includes(scenario)) {
      await page.waitForFunction(() => document.documentElement.dataset.heroEntrance === 'running');
      if (scenario === 'scroll') await page.evaluate(() => scrollTo({ top: 100, behavior: 'instant' }));
      if (scenario === 'focus') await page.locator('.main-nav a').first().focus();
      if (scenario === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' });
      if (scenario === 'hidden') await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    }
    await settled(page);
    if (scenario === 'history') {
      await page.evaluate(() => scrollTo({ top: 600, behavior: 'instant' }));
      await page.waitForTimeout(100);
      await page.goto('about:blank');
      await page.goBack({ waitUntil: 'domcontentloaded' });
      await settled(page);
      assert(await page.evaluate(() => scrollY > 0), 'History restores scroll');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(1100);
    await settled(page);
    const states = await page.evaluate(() => window.heroStates.map((s) => s.state));
    if (['slow-image', 'failed-image', 'delayed-font', 'hash', 'fail-open'].includes(scenario)) assert(!states.includes('running'), `${scenario}: skips entrance`);
    assert(states.filter((s) => s === 'running').length <= 1, `${scenario}: no replay`);
    console.log(`PASS entrance ${scenario}`);
    await page.close();
  }
  const staticPage = await browser.newPage({ javaScriptEnabled: false });
  await staticPage.goto(baseURL);
  assert.equal(await staticPage.locator('.hero-entrance').evaluate((element) => getComputedStyle(element).opacity), '1');
  assert.equal(await staticPage.locator('.title-name').evaluate((element) => getComputedStyle(element).transform), 'none');
  assert.equal(await staticPage.locator('.hero-logo-dot').evaluate((element) => getComputedStyle(element).opacity), '1', 'Logo remains complete without JavaScript');
  assert.equal(await staticPage.locator('[data-artist-stage]').count(), 4);
  assert(await staticPage.locator('.artist-instrument-static').evaluateAll((icons) => icons.every((icon) => getComputedStyle(icon).visibility === 'visible')), 'All instruments remain visible without JavaScript');
  await staticPage.close();
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 720 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await mockYoutube(page);
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const bandPhotoLoaded = await page.locator('.band-photo').evaluateAll(async (photos) => (await Promise.all(photos.map(async (photo) => {
      const probe = new Image();
      probe.src = photo.getAttribute('href') || photo.getAttribute('src');
      try { await probe.decode(); return probe.naturalWidth > 0; } catch { return false; }
    }))).some(Boolean));
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
        fieldPattern: getComputedStyle(document.querySelector('.hero-field'), '::before').backgroundImage,
        keyline: getComputedStyle(document.querySelector('.hero-photo-layer') || document.querySelector('.hero-figures-front')).filter,
        originalPhoto: document.querySelector('.hero-figures--original') !== null,
        inkBoundary: Number(document.querySelector('[data-hero-light-start]').getAttribute('offset')) * document.querySelector('main').offsetHeight,
      };
    });
    assert.equal(layout.overflow, false, `${viewport.width}: horizontal overflow`);
    assert.equal(await page.locator('.hero-brand-motion').evaluate((mark) => getComputedStyle(mark).animationName), 'none', 'Reduced motion skips the logo twist');
    assert((await page.locator('.hero-source-photo:visible image').getAttribute('href')).endsWith('/images/band-cutout-clear.webp'), 'Hero uses the supplied transparent four-person cutout');
    assert((await page.locator('.hero-source-photo:visible image').evaluate((photo) => getComputedStyle(photo).filter)).includes('ensemble-duotone'), 'Hero retains the styled duotone treatment on the clear photograph');
    assert(await page.locator('.hero-source-photo:visible .hero-callout-arrow:not(.hero-callout-arrow--underlay)').evaluateAll((arrows) => arrows.every((arrow) => parseFloat(getComputedStyle(arrow).strokeWidth) >= 1.75)), 'Arrow strokes remain legible on phones');
    assert.deepEqual(await page.locator('.hero-source-photo:visible .hero-callout-name').allTextContents(), ['Manas', 'Meher', 'Koundinya', 'Mouli']);
    assert(await page.locator('.hero-source-photo:visible .hero-callout-name').evaluateAll((names) => names.every((name) => {
      const box = name.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth && box.height >= 12 && getComputedStyle(name).opacity === '1';
    })), 'Handwritten names remain readable, visible, and inside the viewport');
    assert.equal(await page.locator('.music-play-disc svg').count(), 5, 'Play controls use SVG on every platform');
    assert.equal(await page.locator('.showcase-arrows button svg').count(), 2, 'Navigation arrows use SVG');
    if (viewport.width <= 760) {
      assert.equal(await page.locator('.hero-caption').isVisible(), false, 'Mobile hero omits the Carnatic roots tagline');
      assert(Math.abs(layout.hero.height - viewport.height) <= 1, 'Mobile hero fills 100dvh');
      assert.equal(await page.locator('.hero-source-photo--desktop').isVisible(), false);
      assert(await page.locator('.hero-source-photo--mobile').isVisible());
      assert(await page.locator('.hero-figures--source').evaluate((frame) => Math.abs(frame.getBoundingClientRect().height - innerHeight) <= 1), 'Image layer is genuinely 100dvh');
      assert.equal(await page.locator('.hero-source-photo--mobile .hero-callout--keys .hero-callout-name').evaluate((name) => getComputedStyle(name).fill), 'rgb(245, 240, 231)', 'Manas stays white on mobile');
      assert(await page.locator('.hero-source-photo--mobile .hero-callout:not(.hero-callout--keys) .hero-callout-name').evaluateAll((names) => names.every((name) => getComputedStyle(name).fill === 'rgb(35, 53, 79)')), 'Other mobile names use blue');
      const targets = await page.locator('.main-nav a, .header-book, .showcase-arrows button').evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
      assert(targets.every((height) => height >= 44), 'Mobile controls have 44px touch targets');
      const controls = await page.locator('.showcase-navigation').evaluate((element) => {
        const status = element.querySelector('.showcase-status').getBoundingClientRect();
        const arrows = element.querySelector('.showcase-arrows').getBoundingClientRect();
        return arrows.left >= status.right || arrows.top >= status.bottom;
      });
      assert(controls, 'Session status and navigation do not overlap');
    }

    assert(layout.title.x >= 0 && layout.title.right <= viewport.width, 'Complete DARBAR title fits');
    assert(layout.band.x >= 0 && layout.band.right <= viewport.width, 'Band fits');
    assert(layout.band.y < layout.field.y && layout.band.bottom > layout.field.y, 'Ensemble bridges the cream and muted red textile field');
    assert(layout.field.height / layout.hero.height >= .44, 'Muted red field occupies the lower composition');
    assert(layout.fieldPattern.includes('paisley-ink.svg'), 'Local textile pattern is present');
    if (!layout.originalPhoto) assert(layout.keyline.includes('ensemble-edge'), 'Cutout ensemble retains its printed keyline');
    assert(Math.abs(layout.inkBoundary - (layout.field.y - layout.header.height)) <= 1, 'Thread changes ink at the background divide');
    assert(bandPhotoLoaded || layout.figureCount === 4, 'Approved ensemble photo or four silhouette fallback loads');
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

    assert.deepEqual(await page.locator('.artist-row h3').allTextContents(), ['Koundinya Pannala', 'Manas Kanukollu', 'Chandra Mouli Mangudi', 'M. Meher Sri']);
    assert.deepEqual(await page.locator('.artist-row h3 strong').allTextContents(), ['Koundinya', 'Manas', 'Mouli', 'Meher']);
    assert(await page.locator('.artist-row h3').evaluateAll((headings) => headings.every((heading) => {
      const primary = getComputedStyle(heading.querySelector('strong'));
      const secondary = getComputedStyle(heading.querySelector('.artist-name-secondary'));
      return parseFloat(primary.fontSize) > parseFloat(secondary.fontSize) && parseFloat(secondary.fontSize) >= 20;
    })), 'Main names are larger than readable secondary names');
    assert.deepEqual(await page.locator('.artist-row').evaluateAll((rows) => rows.map((row) => row.dataset.artistInstrument)), ['violin', 'keys', 'guitar', 'drums']);
    assert.equal(await page.locator('#sound-heading > span').count(), 2);
    assert((await page.locator('#sound-heading').textContent()).includes('ROOM TO PLAY.'));
    assert(await page.locator('#sound-heading').evaluate((heading) => {
      const range = document.createRange();
      range.selectNodeContents(heading);
      const ink = range.getBoundingClientRect();
      return ink.left >= 0 && ink.right <= innerWidth;
    }), 'Poster refrain fits without clipping');
    assert.equal(await page.locator('#contact a[href="mailto:theprojectdarbar@gmail.com"]').count(), 1);
    assert.equal(await page.locator('#contact a[href="tel:+917674918647"]').count(), 1);
    const artistLayouts = await page.locator('.artist-row').evaluateAll((rows) => rows.map((row) => {
      const box = (selector) => {
        const rect = row.querySelector(selector).getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width };
      };
      return { portrait: box('.artist-portrait'), stage: box('[data-artist-stage]'), media: box('.artist-media'), text: box('.artist-details') };
    }));
    for (const artist of artistLayouts) {
      assert(artist.portrait.right <= artist.stage.left, 'Instrument does not overlap its portrait');
      assert(artist.stage.left >= 0 && artist.stage.right <= viewport.width, 'Instrument remains inside viewport');
      assert(artist.stage.width >= 100, 'Instrument stays large enough to read');
      assert(artist.text.left >= 0 && artist.text.right <= viewport.width, 'Full names and bios fit');
      if (viewport.width <= 760) assert(artist.text.top >= artist.media.bottom, 'Mobile visuals sit above names and bios');
      else assert(artist.text.right <= artist.media.left, 'Desktop visuals sit beside the text');
    }
    await page.locator('#artists').screenshot({ path: new URL(`${viewport.width}x${viewport.height}-artists.png`, output).pathname });

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

    const ensemble = await page.locator('.journey-rail').evaluate((rail) => JSON.parse(rail.dataset.ensembleSpans));
    assert.equal(ensemble.length, 4, 'The thread visits all four musician instrument stages');
    for (const span of ensemble) {
      for (const progress of [0, .5, 1, .5, 0]) {
        const drawn = await page.evaluate(async ({ span, progress }) => {
          scrollTo({ top: span.scrollStart + (span.scrollEnd - span.scrollStart) * progress, behavior: 'instant' });
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const route = document.querySelector('[data-rail-route]');
          return route.getTotalLength() - parseFloat(route.style.strokeDashoffset);
        }, { span, progress });
        assert(Math.abs(drawn - (span.start + (span.end - span.start) * progress)) < 2, 'Each musician instrument follows scroll in both directions');
      }
    }

    const instrumentClearance = await page.evaluate(() => {
      const main = document.querySelector('main').getBoundingClientRect();
      const route = document.querySelector('[data-rail-route]');
      const spans = JSON.parse(document.querySelector('.journey-rail').dataset.ensembleSpans);
      return [...document.querySelectorAll('.artist-row')].every((row, index) => {
        const bounds = row.getBoundingClientRect();
        const stage = row.querySelector('[data-artist-stage]').getBoundingClientRect();
        for (let fraction = 0; fraction <= 1; fraction += .01) {
          const point = route.getPointAtLength(spans[index].start + (spans[index].end - spans[index].start) * fraction);
          if (point.x < stage.left - main.left - 1 || point.y < bounds.top - main.top - 1 || point.y > bounds.bottom - main.top + 1) return false;
        }
        return true;
      });
    });
    assert(instrumentClearance, 'Measured thread avoids portraits, text, and adjacent rows');
    await page.setViewportSize({ width: viewport.width, height: viewport.height + 80 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const resizedSpans = await page.locator('.journey-rail').evaluate((rail) => JSON.parse(rail.dataset.ensembleSpans));
    assert.equal(resizedSpans.length, 4);
    for (let i = 0; i < resizedSpans.length; i++) {
      assert(resizedSpans[i].scrollEnd > resizedSpans[i].scrollStart, 'Resizing preserves each instrument scroll range');
      if (i) assert(resizedSpans[i].scrollStart >= resizedSpans[i - 1].scrollEnd, 'Resized instrument ranges stay ordered');
    }
    await page.setViewportSize(viewport);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

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
