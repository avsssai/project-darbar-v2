import assert from 'node:assert/strict';
import test from 'node:test';
import { soundThreadAt } from '../src/data/sound-thread.ts';

const points = (path) => [...path.matchAll(/L(-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => [Number(x), Number(y)]);

test('the resting sound thread forms one vertical wave at every viewport size', () => {
  for (const [x, y, width, height] of [[0, 0, 80, 600], [270, 900, 40, 664], [1319, 900, 80, 836]]) {
    const path = soundThreadAt(x, y, width, height);
    const samples = points(path);
    assert(!/[MC]|NaN|Infinity/.test(path), 'The waveform continues the existing rail without lifting the pen');
    assert.deepEqual(samples[0], [x + width / 2, y]);
    assert.deepEqual(samples.at(-1), [x + width / 2, y + height]);
    assert(samples.every(([px, py]) => px >= x && px <= x + width && py >= y && py <= y + height));
    assert(samples.some(([px]) => Math.abs(px - x - width / 2) > width * .25), 'A visible wave is formed before playback');
    assert(samples.every(([, py], index) => index === 0 || py > samples[index - 1][1]), 'The wave runs down the vertical axis');
  }
});

test('playback moves the wave while its endpoints and resting shape stay stable', () => {
  const resting = soundThreadAt(0, 0, 80, 600);
  for (const phase of [1, 5, 30, 1000]) {
    const animated = soundThreadAt(0, 0, 80, 600, phase);
    assert.notEqual(animated, resting);
    const samples = points(animated);
    assert.deepEqual(samples[0], [40, 0]);
    assert.deepEqual(samples.at(-1), [40, 600]);
    assert(samples.every(([x]) => x >= 0 && x <= 80), 'Animation stays inside its reserved gutter');
  }
  assert.equal(soundThreadAt(0, 0, 80, 600), resting, 'Pause can always restore the same static rail shape');
});
