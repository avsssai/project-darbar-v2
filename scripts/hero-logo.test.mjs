import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const component = readFileSync(new URL('../src/components/HeroBrandMark.astro', import.meta.url), 'utf8');
const script = component.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

function setup({ reduce = false, hash = '', navigation = 'navigate', hidden = false, top = 0 } = {}) {
  const windowEvents = new EventTarget();
  const document = new EventTarget();
  const motion = new EventTarget();
  motion.matches = reduce;
  document.documentElement = { dataset: { heroEntrance: 'complete' } };
  document.readyState = 'loading';
  document.hidden = hidden;
  let heroTop = top;
  document.querySelector = () => ({ offsetHeight: 900, getBoundingClientRect: () => ({ top: heroTop }) });
  // No font or image APIs: logo playback must never depend on those resources.
  const timers = new Map();
  let now = 0;
  let timerId = 0;
  runInNewContext(script, {
    document, matchMedia: () => motion, location: { hash }, scrollY: 0,
    performance: { getEntriesByType: () => [{ type: navigation }] },
    AbortController, addEventListener: windowEvents.addEventListener.bind(windowEvents),
    setTimeout: (callback, delay) => { timers.set(++timerId, { at: now + delay, callback }); return timerId; },
    clearTimeout: (id) => timers.delete(id),
  });
  const tick = (elapsed) => {
    const end = now + elapsed;
    while (true) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      timers.delete(next[0]);
      now = next[1].at;
      next[1].callback();
    }
    now = end;
  };
  return {
    document, motion, tick,
    state: () => document.documentElement.dataset.heroLogo,
    ready: () => document.dispatchEvent(new Event('DOMContentLoaded')),
    scroll: (top) => { heroTop = top; windowEvents.dispatchEvent(new Event('scroll')); },
  };
}

test('logo starts before DOM ready without waiting for the photo or font', () => {
  const logo = setup();
  assert.equal(logo.state(), 'running');
  logo.ready();
  logo.tick(1829);
  assert.equal(logo.state(), 'running');
  logo.tick(1);
  assert.equal(logo.state(), 'complete');
});

test('small browser scroll adjustments do not cancel the logo', () => {
  const logo = setup();
  logo.ready();
  logo.scroll(-1);
  assert.equal(logo.state(), 'running');
  logo.scroll(-400);
  assert.equal(logo.state(), 'pending');
  logo.tick(3000);
  assert.equal(logo.state(), 'pending');
  logo.scroll(0);
  assert.equal(logo.state(), 'running');
});

test('reduced motion keeps a static logo', () => {
  const logo = setup({ reduce: true });
  logo.ready();
  logo.tick(4000);
  assert.equal(logo.state(), 'complete');
});

test('changing to reduced motion completes playback immediately', () => {
  const logo = setup();
  logo.ready();
  logo.motion.matches = true;
  logo.motion.dispatchEvent(new Event('change'));
  assert.equal(logo.state(), 'complete');
  logo.tick(4000);
  assert.equal(logo.state(), 'complete');
});

test('opening in a background tab waits to play until the page is visible', () => {
  const logo = setup({ hidden: true });
  logo.ready();
  logo.tick(5000);
  assert.equal(logo.state(), 'pending');
  logo.document.hidden = false;
  logo.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(logo.state(), 'running');
  logo.tick(1830);
  assert.equal(logo.state(), 'complete');
});

test('returning from a background tab restarts an interrupted sequence', () => {
  const logo = setup();
  logo.ready();
  logo.document.hidden = true;
  logo.document.dispatchEvent(new Event('visibilitychange'));
  logo.tick(5000);
  assert.equal(logo.state(), 'pending');
  logo.document.hidden = false;
  logo.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(logo.state(), 'running');
});

test('a deep link plays when the user actually reaches the hero', () => {
  const logo = setup({ hash: '#music', top: -900 });
  logo.ready();
  logo.tick(5000);
  assert.equal(logo.state(), 'pending');
  logo.scroll(0);
  assert.equal(logo.state(), 'running');
});

test('a completed sequence does not replay when scrolling back', () => {
  const logo = setup();
  logo.ready();
  logo.tick(3000);
  assert.equal(logo.state(), 'complete');
  logo.scroll(-900);
  logo.scroll(0);
  logo.tick(5000);
  assert.equal(logo.state(), 'complete');
});
