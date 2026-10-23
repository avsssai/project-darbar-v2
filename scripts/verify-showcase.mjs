// Start pnpm dev separately; requires Playwright and a browser installation.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mockYoutube } from './helpers/mock-youtube.mjs';
const browser = await chromium.launch();
const baseURL = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
try {
  for (const width of [320, 390, 768, 1280, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await mockYoutube(page);
    await page.goto(baseURL);
    const showcase = page.locator('[data-showcase]');
    await showcase.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-showcase]').classList.contains('is-enhanced'));
    const layout = await showcase.evaluate((root) => {
      const viewport = root.querySelector('[data-showcase-board]').getBoundingClientRect();
      const tiles = [...root.querySelectorAll('[data-slide]')].map((tile) => {
        const box = tile.getBoundingClientRect();
        return { slot: Number(tile.dataset.slot), left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
      });
      return { overflow: document.documentElement.scrollWidth > innerWidth, board: { left: viewport.left, right: viewport.right, top: viewport.top, bottom: viewport.bottom }, tiles };
    });
    assert.equal(layout.overflow, false);
    assert.equal(layout.tiles.length, 5, 'Exactly five directly selectable video tiles');
    const active = layout.tiles.find((tile) => tile.slot === 0);
    assert(layout.tiles.filter((tile) => tile.slot !== 0).every((tile) => tile.width < active.width && tile.left >= layout.board.left && tile.right <= layout.board.right + 1 && tile.bottom <= layout.board.bottom + 1), 'All four smaller previews fit within the board');
    for (const [i, tile] of layout.tiles.entries()) {
      for (const other of layout.tiles.slice(i + 1)) {
        assert(tile.right <= other.left + 1 || other.right <= tile.left + 1 || tile.bottom <= other.top + 1 || other.bottom <= tile.top + 1, 'Grid tiles do not overlap at rest');
      }
    }
    assert.equal(await page.locator('iframe').count(), 0, 'No third-party player before interaction');
    const waitIndex = (index) => page.waitForFunction((expected) => document.querySelector('[data-showcase-count]').textContent.startsWith(expected), String(index + 1).padStart(2, '0'));
    const waitPlayback = (state) => page.waitForFunction((expected) => document.querySelector('[data-showcase]').dataset.playback === expected, state);
    // Every visible tile is a direct play action; no horizontal scroll gesture is required.
    await page.locator('[data-slide]').nth(4).locator('[data-youtube-id]').click();
    await waitIndex(4);
    await waitPlayback('playing');
    await page.locator('[data-showcase-next]').click();
    await waitIndex(0);
    await waitPlayback('playing');
    await page.evaluate(() => { window.__youtube.players.at(-1).time = 42; });
    assert.equal(await page.locator('.video-frame').count(), 1);
    await page.locator('[data-showcase-next]').click();
    await waitIndex(1);
    await waitPlayback('playing');
    assert.equal(await page.locator('.video-frame').count(), 1);
    await page.locator('[data-showcase-prev]').click();
    await waitIndex(0);
    await waitPlayback('playing');
    assert.equal(await page.evaluate(() => window.__youtube.players.at(-1).time), 42, 'Return resumes the saved performance position');
    await page.evaluate(() => window.__youtube.players.at(-1).setState(3));
    await waitPlayback('paused');
    await page.evaluate(() => window.__youtube.players.at(-1).setState(1));
    await waitPlayback('playing');
    await page.evaluate(() => window.__youtube.players.at(-1).setState(2));
    await waitPlayback('paused');
    await page.locator('[data-showcase-next]').click();
    await waitIndex(1);
    await waitPlayback('playing');
    assert.equal(await page.locator('.video-frame').count(), 1, 'Selecting another session starts it even after pausing');
    await page.evaluate(() => { window.__youtube.mode = 'blocked'; });
    await page.locator('[data-showcase-next]').click();
    await waitIndex(2);
    await page.waitForFunction(() => document.querySelector('[data-player-feedback]').textContent.includes('Press play'));
    await waitPlayback('paused');
    await page.evaluate(() => { window.__youtube.mode = 'normal'; window.__youtube.players.at(-1).playVideo(); });
    await waitPlayback('playing');
    await page.evaluate(() => document.querySelector('#contact').scrollIntoView({ behavior: 'instant' }));
    await waitPlayback('paused');
    await showcase.scrollIntoViewIfNeeded();
    await waitPlayback('paused');
    await page.evaluate(() => window.__youtube.players.at(-1).playVideo());
    await waitPlayback('playing');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitPlayback('paused');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitPlayback('paused');
    await page.locator('[data-showcase-next]').click();
    await waitIndex(3);
    await page.evaluate(() => { window.__youtube.mode = 'error'; });
    await page.locator('[data-showcase-next]').click();
    await waitIndex(4);
    await page.waitForFunction(() => document.querySelector('[data-player-feedback]').textContent.includes('could not load'));
    assert.equal(await page.locator('.video-frame').count(), 0);
    await page.evaluate(() => { window.__youtube.mode = 'normal'; });
    await page.locator('.is-selected [data-youtube-id]').click();
    await waitPlayback('playing');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const path = await page.locator('[data-sound-wave]').getAttribute('d');
    await page.waitForTimeout(100);
    assert.notEqual(await page.locator('[data-sound-wave]').getAttribute('d'), path, 'Playing waveform animates');
    const routeLength = await page.locator('[data-rail-route]').evaluate((route) => route.getTotalLength());
    await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-rail-route]').evaluate((route) => route.getTotalLength()), routeLength, 'Animation does not change scroll geometry');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const staticPath = await page.locator('[data-sound-wave]').getAttribute('d');
    await page.waitForTimeout(100);
    assert.equal(await page.locator('[data-sound-wave]').getAttribute('d'), staticPath, 'Reduced-motion waveform stays still');
    assert.equal(await page.evaluate(() => window.__youtube.maxPlaying), 1, 'Audio never overlaps');
    if (width < 760) {
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      const finale = await page.evaluate(() => {
        const logo = document.querySelector('[data-rail-chakra]').getBoundingClientRect();
        const actions = document.querySelector('.contact-actions').getBoundingClientRect();
        const footer = document.querySelector('.site-footer').getBoundingClientRect();
        const stage = document.querySelector('[data-logo-stage]').getBoundingClientRect();
        return { clear: logo.top - actions.bottom, width: logo.width, left: logo.left, right: logo.right, footerClear: footer.top - logo.bottom, stageHeight: stage.height };
      });
      assert(finale.clear >= 24 && finale.footerClear >= 24 && finale.stageHeight >= 240);
      assert(finale.width >= 90 && finale.left >= 0 && finale.right <= width, 'Mobile logo has room');
    }
    await page.locator('[data-showcase-next]').focus();
    await page.keyboard.press('ArrowRight');
    await waitIndex(0);
    await page.locator('[data-showcase-detail] h3').evaluate((heading) => { heading.textContent = 'Manavyalakincharadate — a very long performance title for narrow screens'; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.evaluate(() => {
      const next = document.querySelector('[data-showcase-next]');
      next.click(); next.click(); next.click();
    });
    await waitIndex(3);
    await waitPlayback('playing');
    assert.equal(await page.locator('.video-frame').count(), 1, 'Rapid rotations leave only the final session playing');
    assert.equal(await page.evaluate(() => window.__youtube.maxPlaying), 1);
    assert.deepEqual(errors, []);
    console.log(`PASS showcase ${width}px`);
    await page.close();
  }
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto(baseURL);
  assert.equal(await page.locator('.music-external:visible').count(), 5, 'No-JS fallback exposes all YouTube links');
  await page.close();
} finally {
  await browser.close();
}
