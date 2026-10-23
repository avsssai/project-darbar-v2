import assert from 'node:assert/strict';
import test from 'node:test';
import { ensembleThreadAt } from '../src/data/ensemble-thread.ts';
import { scrollStrokeDistance } from '../src/lib/rail-progress.ts';

const coordinates = (path) => path.match(/-?\d+(?:\.\d+)?/g).map(Number);

test('each musician gets one continuous loop clear of the text and row borders', () => {
  for (const [rail, portrait, rowTop, rowBottom] of [
    [1359, { x: 1066, y: 1500, width: 106, height: 150 }, 1484, 1666],
    [348, { x: 240, y: 1600, width: 84, height: 140 }, 1576, 1764],
    [290, { x: 201, y: 1900, width: 68, height: 120 }, 1876, 2044],
  ]) {
    const path = ensembleThreadAt(rail, portrait, rowTop, rowBottom);
    assert(path.startsWith(`L${rail} ${rowTop}`));
    assert(path.endsWith(`${rail} ${rowBottom}`));
    assert.equal(path.match(/C/g).length, 6, 'A loop joins the entrance and exit curves');
    assert(!/[MZ]|NaN|Infinity/.test(path), 'The pen remains on the same scroll thread');
    const values = coordinates(path);
    for (let i = 0; i < values.length; i += 2) {
      assert(values[i] >= portrait.x - 7 && values[i] <= rail, 'Curves stay in the portrait column and gutter');
      assert(values[i + 1] >= rowTop && values[i + 1] <= rowBottom, 'Loops stay clear of adjacent rows');
    }
    assert(values.includes(portrait.x - 7), 'The loop reaches around the left of the cutout');
    assert(values.includes(portrait.x + portrait.width + 7), 'The loop reaches around the right of the cutout');
  }
});

test('four ensemble loops draw and retrace independently without timed completion', () => {
  const anchors = [{ scroll: 0, length: 0 }];
  for (let i = 0; i < 4; i++) {
    anchors.push({ scroll: 1000 + i * 220, length: 3000 + i * 800 });
    anchors.push({ scroll: 1200 + i * 220, length: 3700 + i * 800 });
  }
  anchors.push({ scroll: 3000, length: 8000 });
  for (let i = 0; i < 4; i++) {
    const start = anchors[1 + i * 2];
    const end = anchors[2 + i * 2];
    for (const progress of [0, .25, .5, 1, .5, 0]) {
      const scroll = start.scroll + (end.scroll - start.scroll) * progress;
      assert.equal(scrollStrokeDistance(scroll, anchors), start.length + (end.length - start.length) * progress);
    }
  }
});
